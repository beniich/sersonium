import { useState, useEffect, useCallback } from "react";

export interface DashboardSummaryKpi {
  value: string;
  rawValue: number;
  change: string;
  isPositive: boolean;
}

export interface DashboardEvent {
  time: string;
  text: string;
  type: "info" | "success" | "warning";
}

export interface DashboardSummaryData {
  kpis: {
    managedAssets: DashboardSummaryKpi;
    availability: DashboardSummaryKpi;
    interventions: DashboardSummaryKpi;
    compliance: DashboardSummaryKpi;
    cloudStorage: DashboardSummaryKpi;
  };
  systemStatus: {
    operational: boolean;
    availability: string;
    statusLabel: string;
  };
  timestamp: string;
}

export interface ActivityDataPoint {
  time: string;
  performance: number;
  security: number;
  network: number;
}

const LOCAL_STORAGE_SUMMARY_KEY = "sensorium_vision_summary_cache_v1";
const LOCAL_STORAGE_EVENTS_KEY = "sensorium_vision_events_cache_v1";
const LOCAL_STORAGE_ACTIVITY_PREFIX = "sensorium_vision_activity_";

const DEFAULT_EVENTS: DashboardEvent[] = [
  { time: "20:45", text: "Maintenance planifiée - Serveur DB-01", type: "info" },
  { time: "19:32", text: "Accès autorisé - Administrateur", type: "success" },
  { time: "18:20", text: "Alerte résolue - Pic réseau", type: "success" },
  { time: "16:17", text: "Nouvelle demande - Extension stockage", type: "warning" },
  { time: "14:30", text: "Sauvegarde réussie - Site principal", type: "success" }
];

const DEFAULT_SUMMARY: DashboardSummaryData = {
  kpis: {
    managedAssets: { value: "1 248", rawValue: 1248, change: "+12%", isPositive: true },
    availability: { value: "99.99%", rawValue: 99.99, change: "+0.01%", isPositive: true },
    interventions: { value: "24", rawValue: 24, change: "-8%", isPositive: false },
    compliance: { value: "100%", rawValue: 100, change: "+0%", isPositive: true },
    cloudStorage: { value: "892 GB", rawValue: 892, change: "+18%", isPositive: true }
  },
  systemStatus: {
    operational: true,
    availability: "99.99%",
    statusLabel: "Système opérationnel"
  },
  timestamp: new Date().toISOString()
};

function getInitialSummary(): DashboardSummaryData {
  try {
    const cached = typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_SUMMARY_KEY) : null;
    if (cached) return JSON.parse(cached);
  } catch {
    // Ignore JSON parse errors
  }
  return DEFAULT_SUMMARY;
}

function getInitialEvents(): DashboardEvent[] {
  try {
    const cached = typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY) : null;
    if (cached) return JSON.parse(cached);
  } catch {
    // Ignore JSON parse errors
  }
  return DEFAULT_EVENTS;
}

export function useVisionDashboardData() {
  const [data, setData] = useState<DashboardSummaryData>(getInitialSummary);
  const [events, setEvents] = useState<DashboardEvent[]>(getInitialEvents);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);

  const fetchSummary = useCallback(async () => {
    try {
      const [resSummary, resEvents] = await Promise.all([
        fetch("/api/cafm/dashboard/summary").catch(() => null),
        fetch("/api/cafm/dashboard/events").catch(() => null)
      ]);

      if (resSummary && resSummary.ok) {
        const json = await resSummary.json();
        if (json.success && json.data) {
          setData(json.data);
          try {
            localStorage.setItem(LOCAL_STORAGE_SUMMARY_KEY, JSON.stringify(json.data));
          } catch {}
        }
      }

      if (resEvents && resEvents.ok) {
        const jsonEv = await resEvents.json();
        if (jsonEv.success && Array.isArray(jsonEv.data) && jsonEv.data.length > 0) {
          setEvents(jsonEv.data);
          try {
            localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(jsonEv.data));
          } catch {}
        }
      }

      setIsCached(false);
      setError(null);
    } catch (err: any) {
      console.warn("[useVisionDashboardData] Bascule mode résilient / cache local :", err.message);
      setIsCached(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTicket = useCallback(async (subject: string, priority: string) => {
    try {
      const res = await fetch("/api/cafm/dashboard/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, priority })
      });
      const json = await res.json();
      await fetchSummary();
      return json;
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }, [fetchSummary]);

  const scheduleMaintenance = useCallback(async (maintType: string, maintDate: string) => {
    try {
      const res = await fetch("/api/cafm/dashboard/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintType, maintDate })
      });
      const json = await res.json();
      await fetchSummary();
      return json;
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }, [fetchSummary]);

  const fetchActivity = useCallback(async (range: "1h" | "24h" | "7j" | "30j"): Promise<ActivityDataPoint[]> => {
    try {
      const res = await fetch(`/api/cafm/dashboard/activity?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          try {
            localStorage.setItem(`${LOCAL_STORAGE_ACTIVITY_PREFIX}${range}`, JSON.stringify(json.data));
          } catch {}
          return json.data;
        }
      }
    } catch {}

    // Fallback cache local
    try {
      const cached = localStorage.getItem(`${LOCAL_STORAGE_ACTIVITY_PREFIX}${range}`);
      if (cached) return JSON.parse(cached);
    } catch {}

    return [];
  }, []);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 15000); // Polling toutes les 15 secondes
    return () => clearInterval(interval);
  }, [fetchSummary]);

  return {
    data,
    events,
    loading,
    error,
    isCached,
    refresh: fetchSummary,
    createTicket,
    scheduleMaintenance,
    fetchActivity
  };
}
