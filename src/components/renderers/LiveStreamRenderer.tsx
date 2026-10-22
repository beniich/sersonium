/**
 * LiveStreamRenderer.tsx
 * Renderer d'artefact type="stream" : abonnement Kafka → Socket.IO → Data Grid live.
 * En l'absence de connexion réelle, un simulateur local génère des données fidèles.
 */
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Pause,
  Play,
  Trash2,
  Download,
  Radio,
} from "lucide-react";
import { getTelemetrySocket } from "../../lib/telemetrySocket";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StreamRow {
  [key: string]: string | number;
}

interface LiveStreamRendererProps {
  /** Nom du topic Kafka auquel s'abonner (ex: "telemetry.rackB.thermal") */
  topic: string;
  /** Titre affiché dans le header du composant */
  title: string;
}

// ---------------------------------------------------------------------------
// Simulateur local (fallback si backend non disponible)
// ---------------------------------------------------------------------------

/** Génère des colonnes/champs cohérents selon le topic */
function getTopicSchema(topic: string): string[] {
  if (topic.includes("thermal") || topic.includes("temp"))
    return ["timestamp", "sensor_id", "rack", "temp_C", "fan_rpm", "cpu_load_%", "status"];
  if (topic.includes("power") || topic.includes("energy"))
    return ["timestamp", "dc_id", "pue", "load_kw", "ups_soc_%", "delta_kwh", "phase"];
  if (topic.includes("network") || topic.includes("net"))
    return ["timestamp", "node_id", "rx_mbps", "tx_mbps", "latency_ms", "packet_loss_%", "bgp_state"];
  if (topic.includes("hvac") || topic.includes("cvc"))
    return ["timestamp", "zone_id", "supply_temp_C", "return_temp_C", "flow_lpm", "valve_%", "mode"];
  return ["timestamp", "asset_id", "value", "unit", "status", "confidence_%"];
}

function generateSimRow(topic: string, seq: number): StreamRow {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const schema = getTopicSchema(topic);

  if (schema.includes("temp_C")) {
    const temp = +(68 + Math.random() * 22).toFixed(1);
    return {
      timestamp: now,
      sensor_id: `SNS-${String(seq % 8 + 1).padStart(3, "0")}`,
      rack: `Rack-${["A", "B", "C", "D"][seq % 4]}${Math.floor(seq / 4) % 4 + 1}`,
      temp_C: temp,
      fan_rpm: +(4200 + Math.random() * 1800).toFixed(0),
      "cpu_load_%": +(55 + Math.random() * 40).toFixed(1),
      status: temp > 85 ? "CRITICAL" : temp > 78 ? "WARNING" : "NOMINAL",
    };
  }
  if (schema.includes("pue")) {
    return {
      timestamp: now,
      dc_id: `DC-${["PAR", "FRA", "AMS", "STO"][seq % 4]}-0${(seq % 4) + 1}`,
      pue: +(1.09 + Math.random() * 0.18).toFixed(3),
      load_kw: +(780 + Math.random() * 460).toFixed(1),
      "ups_soc_%": +(88 + Math.random() * 11).toFixed(1),
      delta_kwh: +(Math.random() * 12 - 3).toFixed(2),
      phase: ["A", "B", "C"][seq % 3],
    };
  }
  if (schema.includes("rx_mbps")) {
    return {
      timestamp: now,
      node_id: `NODE-${String(seq % 16 + 1).padStart(2, "0")}`,
      rx_mbps: +(800 + Math.random() * 9200).toFixed(1),
      tx_mbps: +(600 + Math.random() * 7400).toFixed(1),
      latency_ms: +(0.2 + Math.random() * 1.8).toFixed(2),
      "packet_loss_%": +(Math.random() * 0.05).toFixed(4),
      bgp_state: Math.random() > 0.02 ? "ESTABLISHED" : "IDLE",
    };
  }
  if (schema.includes("supply_temp_C")) {
    const mode = ["AUTO", "ECO", "BOOST"][seq % 3];
    return {
      timestamp: now,
      zone_id: `ZONE-${["ATR", "OFF", "PLT", "PKG"][seq % 4]}`,
      supply_temp_C: +(14 + Math.random() * 4).toFixed(1),
      return_temp_C: +(19 + Math.random() * 4).toFixed(1),
      flow_lpm: +(120 + Math.random() * 60).toFixed(1),
      "valve_%": +(40 + Math.random() * 55).toFixed(1),
      mode,
    };
  }
  // Generic
  return {
    timestamp: now,
    asset_id: `ASSET-${String(seq % 32 + 1).padStart(3, "0")}`,
    value: +(Math.random() * 100).toFixed(2),
    unit: ["°C", "kW", "Mbps", "lpm"][seq % 4],
    status: Math.random() > 0.1 ? "OK" : "WARN",
    "confidence_%": +(94 + Math.random() * 5.9).toFixed(1),
  };
}

// ---------------------------------------------------------------------------
// Sparkline SVG minimaliste
// ---------------------------------------------------------------------------

function Sparkline({ values, danger }: { values: number[]; danger: boolean }) {
  if (values.length < 2) return null;
  const w = 80,
    h = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="inline-block align-middle">
      <polyline
        points={pts}
        fill="none"
        stroke={danger ? "#ef4444" : "#22c55e"}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ value }: { value: string | number }) {
  const str = String(value).toUpperCase();
  const isRed = ["CRITICAL", "ERROR", "IDLE", "WARN", "WARNING"].includes(str);
  const isYellow = ["NOMINAL_WITH_ADVISORY", "ECO", "BOOST"].includes(str);
  if (isRed)
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
        {value}
      </span>
    );
  if (isYellow)
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
        {value}
      </span>
    );
  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
      {value}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const STATUS_COL = ["status", "bgp_state", "mode", "phase"];
const MAX_ROWS = 50;
const SIMULATE_INTERVAL_MS = 1800;

export default function LiveStreamRenderer({ topic, title }: LiveStreamRendererProps) {
  const [rows, setRows] = useState<StreamRow[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const isPausedRef = useRef(false);
  const seqRef = useRef(0);
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Derive headers from first row
  const headers = rows.length > 0 ? Object.keys(rows[0]) : getTopicSchema(topic);

  // Track numeric columns for sparkline
  const numericColHistory = useRef<Record<string, number[]>>({});

  const appendRow = useCallback(
    (row: StreamRow) => {
      if (isPausedRef.current) return;

      // Update sparkline history for numeric cols
      Object.entries(row).forEach(([k, v]) => {
        if (typeof v === "number") {
          if (!numericColHistory.current[k]) numericColHistory.current[k] = [];
          numericColHistory.current[k] = [...(numericColHistory.current[k] || []), v].slice(-20);
        }
      });

      const isAlert =
        String(row.status || "").toUpperCase() === "CRITICAL" ||
        String(row.bgp_state || "").toUpperCase() === "IDLE";

      setRows((prev) => [row, ...prev].slice(0, MAX_ROWS));
      setEventCount((c) => c + 1);
      if (isAlert) setAlertCount((c) => c + 1);
    },
    []
  );

  // ---- Socket.IO subscription ----
  useEffect(() => {
    let socket: ReturnType<typeof getTelemetrySocket> | null = null;
    let connected = false;

    try {
      socket = getTelemetrySocket();

      const onConnect = () => {
        connected = true;
        setIsConnected(true);
        setIsSimulated(false);
        socket!.emit("subscribe_telemetry", topic);
      };

      const onDisconnect = () => {
        connected = false;
        setIsConnected(false);
      };

      const onTelemetry = (payload: any) => {
        if (!payload) return;
        const msgTopic = payload.topic || topic;
        if (msgTopic === topic) {
          const rowData = payload.data || payload;
          const ts = payload.timestamp || rowData.timestamp || new Date().toISOString().replace("T", " ").slice(0, 19);
          appendRow({ ...rowData, timestamp: ts });
        }
      };

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("telemetry_stream", onTelemetry);
      socket.on("telemetry_update", onTelemetry);

      if (socket.connected) onConnect();

      // If not connected after 2 s, switch to local simulation
      const fallbackTimer = setTimeout(() => {
        if (!connected) {
          setIsSimulated(true);
          setIsConnected(true); // show as "live" (simulated)
        }
      }, 2000);

      return () => {
        clearTimeout(fallbackTimer);
        socket?.emit("unsubscribe_telemetry", topic);
        socket?.off("connect", onConnect);
        socket?.off("disconnect", onDisconnect);
        socket?.off("telemetry_stream", onTelemetry);
      };
    } catch {
      setIsSimulated(true);
      setIsConnected(true);
      return () => {};
    }
  }, [topic, appendRow]);

  // ---- Local simulation fallback ----
  useEffect(() => {
    if (!isSimulated) return;
    simTimerRef.current = setInterval(() => {
      appendRow(generateSimRow(topic, seqRef.current++));
    }, SIMULATE_INTERVAL_MS);
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [isSimulated, topic, appendRow]);

  // Pause/resume
  const togglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
  };

  // Export log as CSV
  const handleExport = () => {
    if (rows.length === 0) return;
    const hdrs = Object.keys(rows[0]);
    const csv = [hdrs.join(","), ...rows.map((r) => hdrs.map((h) => String(r[h] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.replace(/\./g, "_")}_stream.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get numeric columns for sparkline bar
  const numericCols = headers.filter(
    (h) => rows.length > 0 && typeof rows[0][h] === "number" && !STATUS_COL.includes(h)
  );
  const firstNumericCol = numericCols[0];

  return (
    <div className="flex flex-col h-full bg-[#070C10] text-slate-200 rounded-xl overflow-hidden border border-slate-700/40">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="w-5 h-5 text-emerald-400" />
            {isConnected && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">{title}</p>
            <p className="text-[11px] font-mono text-slate-400">
              <span className="text-emerald-400">TOPIC:</span> {topic}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
            <Activity className="w-3 h-3 inline mr-1 text-emerald-400" />
            {eventCount} evt
          </span>
          {alertCount > 0 && (
            <span className="px-2 py-1 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              {alertCount} alerts
            </span>
          )}
          {isSimulated ? (
            <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <WifiOff className="w-3 h-3" />
              SIM
            </span>
          ) : (
            <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              LIVE
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={togglePause}
            title={isPaused ? "Reprendre le flux" : "Suspendre le flux"}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              setRows([]);
              setEventCount(0);
              setAlertCount(0);
              numericColHistory.current = {};
            }}
            title="Vider le log"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            title="Exporter en CSV"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      {/* ── Sparkline Bar ─────────────────────────────────────────── */}
      {firstNumericCol && numericColHistory.current[firstNumericCol]?.length > 1 && (
        <div className="px-4 py-1.5 bg-slate-900/40 border-b border-slate-700/30 flex items-center gap-3 text-xs shrink-0">
          <span className="text-slate-500 font-mono uppercase text-[10px]">{firstNumericCol}</span>
          <Sparkline
            values={numericColHistory.current[firstNumericCol]}
            danger={alertCount > 0}
          />
          <span className="text-slate-400 font-mono text-[11px]">
            {numericColHistory.current[firstNumericCol].slice(-1)[0]?.toFixed(1)}
          </span>
          <span className="ml-auto text-[10px] text-slate-600 font-mono">
            Dernières {numericColHistory.current[firstNumericCol].length} valeurs
          </span>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────── */}
      <div ref={tableRef} className="flex-1 overflow-auto custom-scrollbar">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
            <Radio className="w-10 h-10 animate-pulse text-slate-700" />
            <p className="text-sm font-semibold text-slate-500">En attente de données...</p>
            <p className="text-xs font-mono text-slate-700">
              {isSimulated ? "Initialisation du simulateur local..." : `Abonné au topic: ${topic}`}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-900">
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700/60 whitespace-nowrap bg-slate-900"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const isAlert =
                  String(row.status || "").toUpperCase() === "CRITICAL" ||
                  String(row.bgp_state || "").toUpperCase() === "IDLE";
                return (
                  <tr
                    key={idx}
                    className={`border-b border-slate-800/60 transition-colors ${
                      idx === 0
                        ? "bg-emerald-500/5 animate-pulse-once"
                        : isAlert
                        ? "bg-red-500/5"
                        : "hover:bg-slate-800/30"
                    }`}
                  >
                    {headers.map((h) => {
                      const val = row[h];
                      const isStatus = STATUS_COL.includes(h);
                      const isNum = typeof val === "number";
                      const isHighTemp = h === "temp_C" && typeof val === "number" && val > 85;
                      return (
                        <td
                          key={h}
                          className="px-3 py-2 whitespace-nowrap font-mono"
                        >
                          {isStatus ? (
                            <StatusBadge value={val} />
                          ) : isNum ? (
                            <span
                              className={
                                isHighTemp
                                  ? "text-red-400 font-bold"
                                  : "text-emerald-300"
                              }
                            >
                              {typeof val === "number" && !Number.isInteger(val)
                                ? val.toFixed(
                                    val < 10 ? 3 : val < 100 ? 2 : 1
                                  )
                                : val}
                            </span>
                          ) : (
                            <span className={h === "timestamp" ? "text-slate-500" : "text-slate-200"}>
                              {String(val)}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="px-4 py-2 border-t border-slate-700/40 bg-slate-900/60 flex items-center justify-between text-[10px] font-mono text-slate-600 shrink-0">
        <span>
          {isPaused ? (
            <span className="text-amber-500">⏸ FLUX SUSPENDU</span>
          ) : (
            <span className="text-emerald-500/80">▶ {isSimulated ? "SIMULATION" : "KAFKA LIVE"}</span>
          )}
          {" · "}MAX {MAX_ROWS} lignes · intervalle {SIMULATE_INTERVAL_MS}ms
        </span>
        <span className="flex items-center gap-1">
          {isConnected ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          ) : (
            <AlertTriangle className="w-3 h-3 text-amber-400" />
          )}
          {isConnected ? "Socket connecté" : "Reconnexion..."}
        </span>
      </div>
    </div>
  );
}
