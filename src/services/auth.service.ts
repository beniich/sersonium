import { googleSignIn } from "../firebase.js";

/**
 * Frontend Authentication & Secure API Client
 * - Manages JWT Access Token & Automatic Refresh Token Rotation
 * - Intercepts all state-changing requests (POST, PUT, PATCH, DELETE) to inject anti-forgery CSRF tokens
 * - Synchronizes with XSRF-TOKEN cookie & /api/v1/auth/csrf-token endpoint
 */

export interface AuthUser {
  userId: string;
  email: string;
  role: "admin" | "operator" | "technician" | "auditor" | "viewer" | string;
  tenantId: string;
  organizationName?: string;
  permissions?: string[];
}

export interface AuthSessionState {
  accessToken: string | null;
  csrfToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}

class AuthService {
  private accessToken: string | null = null;
  private csrfToken: string | null = null;
  private user: AuthUser | null = null;
  private refreshPromise: Promise<string | null> | null = null;
  private listeners: Set<(session: AuthSessionState) => void> = new Set();

  constructor() {
    // Attempt to load cached session or cookies
    if (typeof window !== "undefined") {
      try {
        const cachedUser = localStorage.getItem("sensorium_auth_user");
        const cachedCsrf = this.getCookie("XSRF-TOKEN") || localStorage.getItem("sensorium_csrf_token");

        if (cachedUser) this.user = JSON.parse(cachedUser);
        if (cachedCsrf) this.csrfToken = cachedCsrf;

        // Sécurité XSS : purge active de tout résidu de jeton d'accès dans localStorage
        localStorage.removeItem("sensorium_access_token");
      } catch {
        // Fallback
      }
    }
  }

  /**
   * Subscribe to authentication state changes
   */
  public onAuthStateChange(listener: (session: AuthSessionState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getSession());
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const session = this.getSession();
    this.listeners.forEach((listener) => {
      try {
        listener(session);
      } catch (e) {
        console.error("[AuthService] Error in auth state listener", e);
      }
    });
  }

  /**
   * Helper to parse document.cookie
   */
  private getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
    return match ? decodeURIComponent(match[3]) : null;
  }

  /**
   * Get current CSRF Anti-Forgery Token (fetch if not yet present)
   */
  public async getCsrfToken(): Promise<string> {
    // 1. Check if token already exists in memory or cookie
    const cookieToken = this.getCookie("XSRF-TOKEN");
    if (cookieToken) {
      this.csrfToken = cookieToken;
      return cookieToken;
    }

    if (this.csrfToken) {
      return this.csrfToken;
    }

    // 2. Fetch fresh token from server
    try {
      const res = await fetch("/api/v1/auth/csrf-token", {
        method: "GET",
        headers: { "Accept": "application/json" },
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        if (data.csrfToken) {
          this.csrfToken = data.csrfToken;
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("sensorium_csrf_token", data.csrfToken);
          }
          return data.csrfToken;
        }
      }
    } catch (e) {
      console.warn("[AuthService] Could not fetch fresh CSRF token", e);
    }

    // Fallback pseudo-token if offline or initial boot
    return this.csrfToken || "initial-client-token";
  }

  /**
   * Login with email & password
   */
  public async login(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        return {
          success: false,
          error: result.error?.message || "Échec de l'authentification"
        };
      }

      this.accessToken = result.data.accessToken;
      this.csrfToken = result.data.csrfToken || this.getCookie("XSRF-TOKEN");
      this.user = result.data.user;

      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("sensorium_access_token");
        localStorage.setItem("sensorium_auth_user", JSON.stringify(this.user));
        if (this.csrfToken) localStorage.setItem("sensorium_csrf_token", this.csrfToken);
      }

      this.notifyListeners();

      return {
        success: true,
        user: this.user!
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Erreur de connexion au serveur"
      };
    }
  }

  /**
   * Login with Google (Firebase Hybrid Auth)
   * Exchanges Firebase ID Token for a Sensorium JWT
   */
  public async loginWithGoogle(): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const { user: firebaseUser } = await googleSignIn();
      const idToken = await firebaseUser.getIdToken();

      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ token: idToken })
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        return {
          success: false,
          error: result.error?.message || "Échec de l'authentification Firebase vers Sensorium"
        };
      }

      this.accessToken = result.data.accessToken;
      this.csrfToken = result.data.csrfToken || this.getCookie("XSRF-TOKEN");
      this.user = result.data.user;

      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("sensorium_access_token");
        localStorage.setItem("sensorium_auth_user", JSON.stringify(this.user));
        if (this.csrfToken) localStorage.setItem("sensorium_csrf_token", this.csrfToken);
      }

      this.notifyListeners();

      return {
        success: true,
        user: this.user!
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Erreur de connexion Google"
      };
    }
  }

  /**
   * Sets session manually (for mock/sync mode)
   */
  public setSession(user: AuthUser | null, accessToken: string | null = null, csrfToken: string | null = null): void {
    this.user = user;
    this.accessToken = user && !accessToken ? "sensorium_client_session_token" : accessToken;
    if (csrfToken) this.csrfToken = csrfToken;

    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("sensorium_access_token");
      if (user) localStorage.setItem("sensorium_auth_user", JSON.stringify(user));
      else localStorage.removeItem("sensorium_auth_user");

      if (csrfToken) localStorage.setItem("sensorium_csrf_token", csrfToken);
    }

    this.notifyListeners();
  }

  /**
   * Refresh the active session using HTTP-Only Refresh Token Cookie
   */
  public async refresh(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const res = await fetch("/api/v1/auth/refresh", {
          method: "POST",
          headers: {
            "Accept": "application/json"
          },
          credentials: "include"
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data.accessToken) {
            this.accessToken = data.data.accessToken;
            this.user = data.data.user;
            if (typeof localStorage !== "undefined") {
              localStorage.removeItem("sensorium_access_token");
              localStorage.setItem("sensorium_auth_user", JSON.stringify(this.user));
            }
            this.notifyListeners();
            return this.accessToken;
          }
        }
      } catch (err) {
        console.error("[AuthService] Refresh session failed", err);
      } finally {
        this.refreshPromise = null;
      }

      return null;
    })();

    return this.refreshPromise;
  }

  /**
   * Logout and clear local tokens immediately
   */
  public async logout(): Promise<void> {
    this.accessToken = null;
    this.csrfToken = null;
    this.user = null;

    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("sensorium_access_token");
      localStorage.removeItem("sensorium_auth_user");
      localStorage.removeItem("sensorium_csrf_token");
    }

    this.notifyListeners();

    try {
      await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // Ignore
    }
  }

  /**
   * Universal Secure Fetch:
   * - Automatically adds Authorization: Bearer <token>
   * - Automatically adds Anti-Forgery CSRF headers (X-CSRF-Token / X-XSRF-Token) for POST/PUT/PATCH/DELETE
   * - Automatically handles 401 token expiration with refresh rotation and retry
   */
  public async secureFetch(url: string, init: RequestInit = {}): Promise<Response> {
    const method = (init.method || "GET").toUpperCase();
    const isStateChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string> || {})
    };

    // 1. Inject Bearer Access Token if available
    if (this.accessToken && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    // 2. Inject Anti-Forgery CSRF token for all state-changing mutations
    if (isStateChanging && !headers["x-csrf-token"] && !headers["X-CSRF-Token"]) {
      const csrf = await this.getCsrfToken();
      if (csrf) {
        headers["x-csrf-token"] = csrf;
        headers["x-xsrf-token"] = csrf;
      }
    }

    // 3. Inject Anti-Replay Timestamp
    if (isStateChanging && !headers["x-request-timestamp"]) {
      headers["x-request-timestamp"] = Date.now().toString();
    }

    // Default JSON Content-Type if body is present and not multipart
    if (init.body && typeof init.body === "string" && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    let response = await fetch(url, {
      ...init,
      credentials: init.credentials || "include",
      headers
    });

    // 4. Handle 401 Unauthorized (AccessToken Expired) -> Rotate and Retry once
    if (response.status === 401 && this.accessToken) {
      const newAccessToken = await this.refresh();
      if (newAccessToken) {
        headers["Authorization"] = `Bearer ${newAccessToken}`;
        // Retry original request
        response = await fetch(url, {
          ...init,
          credentials: init.credentials || "include",
          headers
        });
      }
    }

    return response;
  }

  public getSession(): AuthSessionState {
    return {
      accessToken: this.accessToken,
      csrfToken: this.csrfToken,
      user: this.user,
      isAuthenticated: Boolean(this.accessToken && this.user)
    };
  }
}

export const authService = new AuthService();
export default authService;
