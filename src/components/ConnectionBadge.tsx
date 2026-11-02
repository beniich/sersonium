/**
 * @file ConnectionBadge.tsx
 * @description FEAT-04 — Indicateur de connexion réseau avancé avec :
 * - Latence temps réel (ping simulé toutes les 5s)
 * - Qualité du signal : Excellent / Good / Poor / Offline
 * - Mini graphe de latence sur 12 mesures (60 secondes)
 * - Toggle MODE LIVE / SIMULATION
 */
import React, { useEffect, useState, useCallback, useRef } from "react";
import { connectionManager, ConnectionState } from "../services/connectionManager";
import { Activity, WifiOff, RefreshCw, Wifi, Gauge } from "lucide-react";

type SignalQuality = "excellent" | "good" | "fair" | "poor" | "offline";

interface PingSample {
  ms: number;
  ts: number;
}

function getQuality(ms: number, online: boolean): SignalQuality {
  if (!online) return "offline";
  if (ms <= 50)  return "excellent";
  if (ms <= 120) return "good";
  if (ms <= 300) return "fair";
  return "poor";
}

const QUALITY_META: Record<SignalQuality, { label: string; color: string; dotColor: string; barColor: string }> = {
  excellent: { label: "Excellent",  color: "text-emerald-400",  dotColor: "bg-emerald-400",  barColor: "bg-emerald-400" },
  good:      { label: "Good",       color: "text-teal-400",     dotColor: "bg-teal-400",     barColor: "bg-teal-400"    },
  fair:      { label: "Fair",       color: "text-amber-400",    dotColor: "bg-amber-400",    barColor: "bg-amber-400"   },
  poor:      { label: "Poor",       color: "text-rose-400",     dotColor: "bg-rose-400",     barColor: "bg-rose-400"    },
  offline:   { label: "Offline",    color: "text-slate-400",    dotColor: "bg-slate-500",    barColor: "bg-slate-600"   },
};

const MAX_SAMPLES = 12;

/** Simule une latence réseau réaliste (ping HTTP au serveur local) */
async function measureLatency(): Promise<number> {
  try {
    const t0 = performance.now();
    await fetch("/favicon.ico", { method: "HEAD", cache: "no-store" });
    return Math.round(performance.now() - t0);
  } catch {
    return -1; // offline
  }
}

export const ConnectionBadge: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [connState, setConnState] = useState<ConnectionState>(connectionManager.getState());
  const [isSyncing, setIsSyncing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [samples, setSamples] = useState<PingSample[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsubscribe = connectionManager.subscribe(setConnState);
    return unsubscribe;
  }, []);

  const ping = useCallback(async () => {
    const ms = await measureLatency();
    const online = ms !== -1 && connState.isOnline;
    setLatency(online ? ms : null);
    setSamples(prev => {
      const next = [...prev, { ms: online ? ms : 0, ts: Date.now() }];
      return next.slice(-MAX_SAMPLES);
    });
  }, [connState.isOnline]);

  // Ping toutes les 5 secondes si le panel est ouvert, sinon toutes les 20s
  useEffect(() => {
    ping();
    const delay = expanded ? 5000 : 20000;
    intervalRef.current = setInterval(ping, delay);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [expanded, ping]);

  const handleManualSync = async () => {
    if (connState.isOnline && connState.pendingSyncCount > 0) {
      setIsSyncing(true);
      await connectionManager.flushQueuedActions();
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  const handleToggleMode = () => {
    const newSim = connectionManager.toggleSimulationMode();
    window.dispatchEvent(new CustomEvent("sensorium:mode_changed", { detail: { isSimulation: newSim } }));
  };

  const isLive = connState.mode === "LIVE";
  const quality = getQuality(latency ?? 0, connState.isOnline);
  const meta = QUALITY_META[quality];
  const maxMs = Math.max(...samples.map(s => s.ms), 1);

  return (
    <div className={`relative ${className}`}>
      {/* ── Pill principale ── */}
      <div
        onClick={() => setExpanded(v => !v)}
        title={`Réseau : ${meta.label} — ${latency != null ? `${latency}ms` : "N/A"} • Cliquer pour détails`}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium transition-all cursor-pointer select-none hover:opacity-90 active:scale-95 ${
          isLive
            ? `bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/60 ${meta.color}`
            : "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:border-rose-500/60 animate-pulse"
        }`}
      >
        {/* Signal dot */}
        <span className="relative flex h-2 w-2">
          {isLive && connState.isOnline && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${meta.dotColor} opacity-60`} />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive && connState.isOnline ? meta.dotColor : "bg-rose-500"}`} />
        </span>

        {isLive ? (
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>LIVE</span>
            {latency != null && (
              <span className="opacity-75">{latency}ms</span>
            )}
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            <span>SIM</span>
          </span>
        )}

        {connState.pendingSyncCount > 0 && (
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {connState.pendingSyncCount}
          </span>
        )}
      </div>

      {/* ── Panel expandable ── */}
      {expanded && (
        <div
          className="absolute top-full right-0 mt-2 w-72 rounded-2xl border border-white/10 bg-[#0b0d12]/95 backdrop-blur-xl shadow-2xl p-4 z-50 space-y-3"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-indigo-400" />
              Qualité Réseau
            </span>
            <span className={`text-xs font-bold ${meta.color}`}>{meta.label}</span>
          </div>

          {/* Latency value */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Latence actuelle</span>
            <span className={`font-mono font-semibold ${meta.color}`}>
              {latency != null ? `${latency} ms` : "—"}
            </span>
          </div>

          {/* Mini sparkline */}
          {samples.length > 1 && (
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 font-mono">Latence (60s)</div>
              <div className="flex items-end gap-0.5 h-10">
                {samples.map((s, i) => {
                  const h = s.ms === 0 ? 2 : Math.max(4, Math.round((s.ms / maxMs) * 40));
                  const barMeta = QUALITY_META[getQuality(s.ms, s.ms > 0)];
                  return (
                    <div
                      key={i}
                      title={`${s.ms}ms`}
                      className={`flex-1 rounded-sm ${barMeta.barColor} opacity-80 transition-all`}
                      style={{ height: `${h}px` }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <span className="text-[10px] text-slate-500">Mode actuel</span>
            <button
              onClick={handleToggleMode}
              className={`text-[11px] font-semibold px-3 py-1 rounded-lg transition-all ${
                isLive
                  ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                  : "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
              }`}
            >
              {isLive ? "LIVE CLOUD" : "SIMULATION"} →
            </button>
          </div>

          {/* Sync button */}
          {connState.pendingSyncCount > 0 && (
            <button
              onClick={handleManualSync}
              disabled={!connState.isOnline || isSyncing}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/25 hover:bg-amber-500/20 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              Synchroniser {connState.pendingSyncCount} action(s)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionBadge;
