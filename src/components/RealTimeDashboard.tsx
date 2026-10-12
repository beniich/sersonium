import React, { useState, useMemo } from "react";
import useTelemetry from "../hooks/useTelemetry";
import { DataSourceConfig, DataSourceMode, SensorReading } from "../services/telemetry.adapter";

// ─── Status colors ─────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  OPTIMAL: "#00e5a0",
  ADVISORY: "#f59e0b",
  ALERT: "#ef4444",
  OFFLINE: "#6b7280",
};
const STATUS_BG: Record<string, string> = {
  OPTIMAL: "rgba(0,229,160,0.1)",
  ADVISORY: "rgba(245,158,11,0.1)",
  ALERT: "rgba(239,68,68,0.1)",
  OFFLINE: "rgba(107,114,128,0.1)",
};

const MODE_LABELS: Record<DataSourceMode, string> = {
  simulation: "Simulation physique",
  rest: "REST API",
  websocket: "WebSocket",
  mqtt: "MQTT/BACnet",
};

const MODE_ICONS: Record<DataSourceMode, string> = {
  simulation: "🧪",
  rest: "🔗",
  websocket: "⚡",
  mqtt: "📡",
};

// ─── Sensor Card ──────────────────────────────────────────────────────────────

function SensorCard({ reading }: { reading: SensorReading }) {
  const color = STATUS_COLORS[reading.status];
  const bg = STATUS_BG[reading.status];
  return (
    <div style={{
      background: bg,
      border: `1px solid ${color}33`,
      borderRadius: "12px",
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      minWidth: "140px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ fontSize: "10px", color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {reading.category} · {reading.assetId}
      </div>
      <div style={{ fontSize: "12px", color: "#e2e8f0", fontWeight: 500 }}>{reading.label}</div>
      <div style={{ fontSize: "22px", fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>
        {reading.value.toFixed(1)}
        <span style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "4px" }}>{reading.unit}</span>
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: "6px",
        fontSize: "10px", color,
      }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, animation: "pulse 2s infinite" }} />
        {reading.status}
        <span style={{ marginLeft: "auto", color: "#64748b" }}>Q:{reading.quality}%</span>
      </div>
    </div>
  );
}

// ─── KPI Banner ────────────────────────────────────────────────────────────────

function KpiBanner({ kpis, connection }: { kpis: ReturnType<typeof useTelemetry>["kpis"]; connection: ReturnType<typeof useTelemetry>["connection"] }) {
  const items = [
    { label: "Score Santé", value: `${kpis.healthScore}`, unit: "/100", color: kpis.healthScore > 80 ? "#00e5a0" : kpis.healthScore > 60 ? "#f59e0b" : "#ef4444" },
    { label: "Énergie cumulée", value: kpis.energyKwh.toFixed(3), unit: "kWh", color: "#60a5fa" },
    { label: "CO₂ abattu", value: (kpis.co2Tco2e * 1000).toFixed(2), unit: "gCO₂e", color: "#34d399" },
    { label: "Alertes actives", value: `${kpis.activeAlerts}`, unit: "", color: kpis.activeAlerts > 0 ? "#ef4444" : "#00e5a0" },
    { label: "Ingestion", value: kpis.ingestionRps.toFixed(1), unit: "pts/s", color: "#a78bfa" },
    { label: "Latence Edge", value: kpis.edgeLatencyMs.toFixed(1), unit: "ms", color: "#38bdf8" },
  ];

  return (
    <div style={{
      display: "flex", gap: "12px", flexWrap: "wrap",
      padding: "16px", background: "rgba(15,23,42,0.6)",
      borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)",
    }}>
      {items.map((item) => (
        <div key={item.label} style={{ flex: "1 1 120px", textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>{item.label}</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: item.color, fontVariantNumeric: "tabular-nums" }}>
            {item.value}<span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "3px" }}>{item.unit}</span>
          </div>
        </div>
      ))}
      {connection && (
        <div style={{ flex: "1 1 140px", textAlign: "center", borderLeft: "1px solid rgba(255,255,255,0.05)", paddingLeft: "12px" }}>
          <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>Source</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: connection.connected ? "#00e5a0" : "#ef4444" }} />
            <span style={{ fontSize: "12px", color: "#e2e8f0" }}>{MODE_LABELS[connection.mode]}</span>
          </div>
          <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
            {connection.dataPointsReceived.toLocaleString()} pts · {connection.uptime}s uptime
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Source Config Panel ───────────────────────────────────────────────────────

interface SourceConfigPanelProps {
  onApply: (cfg: DataSourceConfig) => void;
  currentMode: DataSourceMode;
}

function SourceConfigPanel({ onApply, currentMode }: SourceConfigPanelProps) {
  const [mode, setMode] = useState<DataSourceMode>(currentMode);
  const [wsEndpoint, setWsEndpoint] = useState(
    typeof window !== "undefined"
      ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`
      : "wss://api.sensorium.cloud/ws"
  );
  const [wsToken, setWsToken] = useState("");
  const [restEndpoint, setRestEndpoint] = useState(
    typeof window !== "undefined" ? `${window.location.origin}/api/telemetry/snapshot` : "/api/telemetry/snapshot"
  );
  const [restApiKey, setRestApiKey] = useState("");
  const [restInterval, setRestInterval] = useState(3000);
  const [mqttBroker, setMqttBroker] = useState("wss://mqtt.cloudindustrie.com:8083/mqtt");
  const [simSpeed, setSimSpeed] = useState(1);

  const buildConfig = (): DataSourceConfig => {
    switch (mode) {
      case "websocket": return { mode, wsEndpoint, wsToken };
      case "rest": return { mode, restEndpoint, restApiKey, restPollIntervalMs: restInterval };
      case "mqtt": return { mode, mqttBroker, mqttTopics: ["sensorium/#"] };
      default: return { mode: "simulation", simulationSpeedMultiplier: simSpeed };
    }
  };

  return (
    <div style={{
      background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "16px", padding: "20px", backdropFilter: "blur(20px)",
    }}>
      <h3 style={{ margin: "0 0 16px", color: "#e2e8f0", fontSize: "14px", fontWeight: 600 }}>
        🔧 Configuration de la source de données
      </h3>

      {/* Mode selector */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {(["simulation", "rest", "websocket", "mqtt"] as DataSourceMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "8px 14px", borderRadius: "8px", border: "1px solid",
              borderColor: mode === m ? "#6366f1" : "rgba(255,255,255,0.1)",
              background: mode === m ? "rgba(99,102,241,0.2)" : "transparent",
              color: mode === m ? "#818cf8" : "#64748b",
              cursor: "pointer", fontSize: "12px", fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            {MODE_ICONS[m]} {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Mode-specific config */}
      {mode === "simulation" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label style={{ fontSize: "12px", color: "#94a3b8" }}>
            Vitesse de simulation
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "6px" }}>
              <input type="range" min={1} max={10} value={simSpeed} onChange={(e) => setSimSpeed(Number(e.target.value))}
                style={{ flex: 1, accentColor: "#6366f1" }} />
              <span style={{ color: "#e2e8f0", fontSize: "13px", minWidth: "30px" }}>{simSpeed}x</span>
            </div>
          </label>
          <div style={{ background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: "8px", padding: "10px 12px", fontSize: "11px", color: "#94a3b8" }}>
            ✅ Simulation physique active — moteur circadien (CVC/IAQ/Élec/Eau) avec anomalies probabilistes.
            Données indiscernables d'une vraie GTB au protocole BACnet.
          </div>
        </div>
      )}

      {mode === "websocket" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { label: "Endpoint WSS (Kafka/TimescaleDB)", value: wsEndpoint, setter: setWsEndpoint, placeholder: "wss://..." },
            { label: "Token Bearer (optionnel)", value: wsToken, setter: setWsToken, placeholder: "eyJhbGci..." },
          ].map(({ label, value, setter, placeholder }) => (
            <label key={label} style={{ fontSize: "12px", color: "#94a3b8" }}>
              {label}
              <input
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                style={{
                  display: "block", marginTop: "6px", width: "100%", padding: "8px 12px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px", color: "#e2e8f0", fontSize: "12px",
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </label>
          ))}
        </div>
      )}

      {mode === "rest" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { label: "URL Endpoint REST", value: restEndpoint, setter: setRestEndpoint, placeholder: "https://..." },
            { label: "API Key (Bearer)", value: restApiKey, setter: setRestApiKey, placeholder: "sk-..." },
          ].map(({ label, value, setter, placeholder }) => (
            <label key={label} style={{ fontSize: "12px", color: "#94a3b8" }}>
              {label}
              <input
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                style={{
                  display: "block", marginTop: "6px", width: "100%", padding: "8px 12px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px", color: "#e2e8f0", fontSize: "12px",
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </label>
          ))}
          <label style={{ fontSize: "12px", color: "#94a3b8" }}>
            Intervalle de polling ({restInterval}ms)
            <input type="range" min={1000} max={30000} step={1000} value={restInterval} onChange={(e) => setRestInterval(Number(e.target.value))}
              style={{ display: "block", marginTop: "6px", width: "100%", accentColor: "#6366f1" }} />
          </label>
        </div>
      )}

      {mode === "mqtt" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label style={{ fontSize: "12px", color: "#94a3b8" }}>
            MQTT Broker (WebSocket bridge)
            <input
              value={mqttBroker}
              onChange={(e) => setMqttBroker(e.target.value)}
              placeholder="wss://mqtt.gtc.example.com:8083/mqtt"
              style={{
                display: "block", marginTop: "6px", width: "100%", padding: "8px 12px",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px", color: "#e2e8f0", fontSize: "12px",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </label>
          <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px", padding: "10px 12px", fontSize: "11px", color: "#94a3b8" }}>
            📡 Protocoles supportés via le bridge Mosquitto WebSocket :
            BACnet/IP, Modbus TCP, OPC-UA DA, KNX IP. Topiques : sensorium/#
          </div>
        </div>
      )}

      <button
        onClick={() => onApply(buildConfig())}
        style={{
          marginTop: "16px", width: "100%", padding: "10px", borderRadius: "8px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          border: "none", color: "white", fontWeight: 600, fontSize: "13px",
          cursor: "pointer",
        }}
      >
        ⚡ Appliquer la configuration
      </button>
    </div>
  );
}

// ─── Alert Feed ───────────────────────────────────────────────────────────────

function AlertFeed({ alerts, onAck }: { alerts: ReturnType<typeof useTelemetry>["alerts"]; onAck: (id: string) => void }) {
  const SCOLOR: Record<string, string> = { CRITICAL: "#ef4444", HIGH: "#f59e0b", MEDIUM: "#60a5fa", LOW: "#94a3b8" };
  if (alerts.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#475569", fontSize: "13px" }}>
        ✅ Aucune alerte active
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
      {alerts.filter((a) => !a.acknowledged).slice(0, 10).map((alert) => (
        <div key={alert.id} style={{
          background: `${SCOLOR[alert.severity]}11`,
          border: `1px solid ${SCOLOR[alert.severity]}33`,
          borderRadius: "8px", padding: "10px 12px",
          display: "flex", alignItems: "flex-start", gap: "10px",
        }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: SCOLOR[alert.severity], marginTop: "4px", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "11px", color: SCOLOR[alert.severity], fontWeight: 600 }}>{alert.severity}</div>
            <div style={{ fontSize: "12px", color: "#e2e8f0", marginTop: "2px" }}>{alert.message}</div>
            <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>
              {alert.assetId} · {new Date(alert.timestamp).toLocaleTimeString()}
            </div>
          </div>
          <button onClick={() => onAck(alert.id)} style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px",
            color: "#64748b", fontSize: "10px", padding: "2px 8px", cursor: "pointer", flexShrink: 0,
          }}>ACK</button>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface RealTimeDashboardProps {
  initialConfig?: DataSourceConfig;
}

export function RealTimeDashboard({ initialConfig }: RealTimeDashboardProps) {
  const { frame, alerts, connection, kpis, latestByCategory, history, reconfigure, acknowledgeAlert } =
    useTelemetry(initialConfig ?? { mode: "simulation", siteProfile: "datacenter" });

  const [showConfig, setShowConfig] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => Object.keys(latestByCategory), [latestByCategory]);

  const displayedReadings = useMemo(() => {
    if (!activeCategory) return Object.values(latestByCategory).flat();
    return latestByCategory[activeCategory] ?? [];
  }, [latestByCategory, activeCategory]);

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)",
      padding: "24px", fontFamily: "'Inter', sans-serif", color: "#e2e8f0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, background: "linear-gradient(135deg, #6366f1, #00e5a0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            SENSORIUM — Télémétrie Temps Réel
          </h2>
          <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>
            {frame ? `Frame #${frame.frameId} · ${new Date(frame.timestamp).toLocaleTimeString()} · Site: ${frame.siteId}` : "En attente de données…"}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {connection && (
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 12px", borderRadius: "20px",
              background: connection.connected ? "rgba(0,229,160,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${connection.connected ? "rgba(0,229,160,0.3)" : "rgba(239,68,68,0.3)"}`,
              fontSize: "12px", color: connection.connected ? "#00e5a0" : "#ef4444",
            }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", animation: "pulse 2s infinite" }} />
              {MODE_ICONS[connection.mode]} {connection.connected ? "LIVE" : "HORS LIGNE"}
            </div>
          )}
          <button onClick={() => setShowConfig((v) => !v)} style={{
            padding: "8px 14px", borderRadius: "8px",
            background: showConfig ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${showConfig ? "#6366f1" : "rgba(255,255,255,0.1)"}`,
            color: showConfig ? "#818cf8" : "#94a3b8",
            cursor: "pointer", fontSize: "12px", fontWeight: 500,
          }}>
            ⚙️ Source de données
          </button>
        </div>
      </div>

      {/* Config panel */}
      {showConfig && (
        <div style={{ marginBottom: "20px", animation: "slideIn 0.2s ease" }}>
          <SourceConfigPanel
            currentMode={connection?.mode ?? "simulation"}
            onApply={(cfg) => { reconfigure(cfg); setShowConfig(false); }}
          />
        </div>
      )}

      {/* KPI Banner */}
      <div style={{ marginBottom: "20px" }}>
        <KpiBanner kpis={kpis} connection={connection} />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>
        {/* Left: Sensor readings */}
        <div>
          {/* Category filter */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveCategory(null)}
              style={{
                padding: "6px 12px", borderRadius: "6px", border: "1px solid",
                borderColor: !activeCategory ? "#6366f1" : "rgba(255,255,255,0.1)",
                background: !activeCategory ? "rgba(99,102,241,0.2)" : "transparent",
                color: !activeCategory ? "#818cf8" : "#64748b",
                cursor: "pointer", fontSize: "11px",
              }}
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                style={{
                  padding: "6px 12px", borderRadius: "6px", border: "1px solid",
                  borderColor: activeCategory === cat ? "#6366f1" : "rgba(255,255,255,0.1)",
                  background: activeCategory === cat ? "rgba(99,102,241,0.2)" : "transparent",
                  color: activeCategory === cat ? "#818cf8" : "#64748b",
                  cursor: "pointer", fontSize: "11px",
                }}
              >
                {cat} ({latestByCategory[cat]?.length ?? 0})
              </button>
            ))}
          </div>

          {/* Sensor grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "12px",
          }}>
            {displayedReadings.map((r) => (
              <SensorCard key={r.sensorId} reading={r} />
            ))}
          </div>

          {/* Sparklines (history mini-chart) */}
          {history.length > 2 && (
            <div style={{
              marginTop: "20px", background: "rgba(15,23,42,0.6)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "16px",
            }}>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
                Historique — Score de santé (dernières {history.length} trames)
              </div>
              <svg width="100%" height="60" viewBox={`0 0 ${history.length} 100`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  points={history.map((f, i) => `${i},${100 - f.healthScore}`).join(" ")}
                  fill="none" stroke="#6366f1" strokeWidth="2"
                />
                <polygon
                  points={[
                    ...history.map((f, i) => `${i},${100 - f.healthScore}`),
                    `${history.length - 1},100`, `0,100`,
                  ].join(" ")}
                  fill="url(#grad)"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Right: Alerts */}
        <div style={{
          background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px", padding: "16px", height: "fit-content",
        }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            🔔 Alertes
            {alerts.filter((a) => !a.acknowledged).length > 0 && (
              <span style={{
                background: "#ef4444", color: "white", borderRadius: "10px",
                padding: "1px 7px", fontSize: "10px", fontWeight: 700,
              }}>
                {alerts.filter((a) => !a.acknowledged).length}
              </span>
            )}
          </div>
          <AlertFeed alerts={alerts} onAck={acknowledgeAlert} />
        </div>
      </div>
    </div>
  );
}

export default RealTimeDashboard;
