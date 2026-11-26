import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authService } from "./auth.service";

/**
 * Sensorium Unified API Client (Axios)
 * - Automatic Authorization: Bearer <JWT>
 * - Automatic CSRF Anti-Forgery Token injection on mutations
 * - Automatic Anti-Replay Timestamp injection
 * - Transparent 401 Token Refresh & single retry
 * - Intelligent URL normalization (/api/v1 vs /api)
 */
export const apiClient = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Accept": "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 1. Normalize URL to avoid double "/api/v1" if caller already specified it
    if (config.url) {
      if (config.url.startsWith("/api/v1/")) {
        config.url = config.url.replace(/^\/api\/v1/, "");
      } else if (config.url.startsWith("/api/") && !config.url.startsWith("/api/v1")) {
        // If caller targets legacy root /api (like /api/agents, /api/controls), bypass the /api/v1 baseURL
        config.baseURL = "";
      }
    }

    // 2. Inject Bearer Access Token if present
    const token = authService.getAccessToken();
    if (token && !config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // 3. Inject Anti-Forgery CSRF token for state-changing mutations
    const method = (config.method || "GET").toUpperCase();
    const isStateChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

    if (isStateChanging) {
      if (!config.headers["x-csrf-token"] && !config.headers["X-CSRF-Token"]) {
        try {
          const csrf = await authService.getCsrfToken();
          if (csrf) {
            config.headers["x-csrf-token"] = csrf;
            config.headers["x-xsrf-token"] = csrf;
          }
        } catch {
          // Non-blocking fallback
        }
      }

      // Inject Anti-Replay Timestamp
      if (!config.headers["x-request-timestamp"]) {
        config.headers["x-request-timestamp"] = Date.now().toString();
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: 401 Auto-Refresh & Retry ─────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 Unauthorized and not already retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await authService.refresh();
        if (newAccessToken) {
          processQueue(null, newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } else {
          throw new Error("Token refresh returned no token");
        }
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("sensorium:logout"));
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Universal Secure Fetch alternative
 * Wrapper around authService.secureFetch() for components designed around fetch API
 */
export const apiFetch = (url: string, init: RequestInit = {}): Promise<Response> => {
  return authService.secureFetch(url, init);
};

export default apiClient;
