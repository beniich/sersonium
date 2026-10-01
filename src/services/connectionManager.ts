/**
 * SENSORIUM - Zero-Config Hardware Connection & Dual-Mode Manager
 * 
 * Auto-detects physical Edge Terminal via mDNS (http://sensorium.local:3000)
 * or USB-Ethernet subnet (http://192.168.7.1:3000) and smoothly falls back to Cloud mode.
 */

import { useState, useEffect } from "react";

export type BackendMode = "LOCAL_HARDWARE" | "CLOUD_HYBRID";

export interface TerminalTelemetry {
  status: "connected" | "disconnected" | "checking";
  mode: BackendMode;
  apiUrl: string;
  hostname?: string;
  firmwareVersion?: string;
  npuTops?: number;
  latencyMs?: number;
  lastCheckedAt?: string;
}

const LOCAL_MDNS_URL = "http://sensorium.local:3000";
const LOCAL_USB_IP_URL = "http://192.168.7.1:3000";
const CLOUD_FALLBACK_URL = typeof window !== "undefined" && window.location.origin.includes("localhost")
  ? window.location.origin
  : "https://api.sensorium.io";

let cachedTelemetry: TerminalTelemetry = {
  status: "checking",
  mode: "CLOUD_HYBRID",
  apiUrl: CLOUD_FALLBACK_URL,
};

const listeners = new Set<(telemetry: TerminalTelemetry) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener({ ...cachedTelemetry }));
}

/**
 * Pings an endpoint with an AbortController timeout.
 */
async function pingEndpoint(url: string, timeoutMs = 1800): Promise<{ ok: boolean; latency: number; data?: any }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = performance.now();

  try {
    const res = await fetch(`${url}/healthcheck`, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });

    const latency = Math.round(performance.now() - start);
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: true, latency, data };
    }
  } catch {
    clearTimeout(timer);
  }

  return { ok: false, latency: 0 };
}

/**
 * Probes the local hardware appliance (mDNS first, then direct USB RNDIS IP).
 */
export async function detectActiveBackend(): Promise<TerminalTelemetry> {
  // 1. Try mDNS discovery: http://sensorium.local:3000
  const mdnsCheck = await pingEndpoint(LOCAL_MDNS_URL, 1500);
  if (mdnsCheck.ok) {
    cachedTelemetry = {
      status: "connected",
      mode: "LOCAL_HARDWARE",
      apiUrl: LOCAL_MDNS_URL,
      hostname: "sensorium.local",
      firmwareVersion: mdnsCheck.data?.firmwareVersion || "2.4.0-sentry",
      npuTops: mdnsCheck.data?.tops || 240,
      latencyMs: mdnsCheck.latency,
      lastCheckedAt: new Date().toISOString(),
    };
    notifyListeners();
    return cachedTelemetry;
  }

  // 2. Try direct USB Gadget IP: http://192.168.7.1:3000
  const usbCheck = await pingEndpoint(LOCAL_USB_IP_URL, 1200);
  if (usbCheck.ok) {
    cachedTelemetry = {
      status: "connected",
      mode: "LOCAL_HARDWARE",
      apiUrl: LOCAL_USB_IP_URL,
      hostname: "192.168.7.1 (USB-C)",
      firmwareVersion: usbCheck.data?.firmwareVersion || "2.4.0-sentry",
      npuTops: usbCheck.data?.tops || 240,
      latencyMs: usbCheck.latency,
      lastCheckedAt: new Date().toISOString(),
    };
    notifyListeners();
    return cachedTelemetry;
  }

  // 3. Check current host (if already running locally or on localhost dev server)
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    const localHostCheck = await pingEndpoint(window.location.origin, 1000);
    if (localHostCheck.ok) {
      cachedTelemetry = {
        status: "connected",
        mode: "LOCAL_HARDWARE",
        apiUrl: window.location.origin,
        hostname: "localhost (Dev)",
        firmwareVersion: localHostCheck.data?.firmwareVersion || "2.4.0-dev",
        npuTops: localHostCheck.data?.tops || 240,
        latencyMs: localHostCheck.latency,
        lastCheckedAt: new Date().toISOString(),
      };
      notifyListeners();
      return cachedTelemetry;
    }
  }

  // 4. Fallback to Cloud Mode
  cachedTelemetry = {
    status: "disconnected",
    mode: "CLOUD_HYBRID",
    apiUrl: CLOUD_FALLBACK_URL,
    hostname: "cloud.sensorium.io",
    firmwareVersion: "Cloud-Sovereign-Gateway",
    latencyMs: 38,
    lastCheckedAt: new Date().toISOString(),
  };

  notifyListeners();
  return cachedTelemetry;
}

/**
 * React Hook for real-time Edge Terminal Hardware connection monitoring.
 */
export function useTerminalConnection() {
  const [telemetry, setTelemetry] = useState<TerminalTelemetry>(cachedTelemetry);

  useEffect(() => {
    // Immediate initial probe
    detectActiveBackend().then(setTelemetry);

    // Listen to changes
    const handler = (newTel: TerminalTelemetry) => setTelemetry(newTel);
    listeners.add(handler);

    // Heartbeat every 8 seconds to detect USB plug / unplug events
    const interval = setInterval(() => {
      detectActiveBackend();
    }, 8000);

    return () => {
      listeners.delete(handler);
      clearInterval(interval);
    };
  }, []);

  return {
    ...telemetry,
    recheck: detectActiveBackend,
    isLocalHardware: telemetry.mode === "LOCAL_HARDWARE",
  };
}
