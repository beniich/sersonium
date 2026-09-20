import React, { useState, useEffect, useMemo } from "react";
import { 
  Activity, 
  Radio, 
  Thermometer, 
  Droplets, 
  Zap, 
  Gauge, 
  Wind, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Search, 
  Filter, 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown, 
  Wrench, 
  Sliders, 
  SlidersHorizontal,
  Play, 
  Pause, 
  Server, 
  ShieldCheck, 
  Eye, 
  FileText, 
  Download, 
  Sparkles, 
  Cpu, 
  Layers,
  ChevronRight,
  Database,
  Wifi,
  BatteryCharging,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GlobalState } from "../types";
import { logAuditEvent } from "../hooks/useGlobalState";

export type SensorType = "all" | "temperature" | "humidity" | "power" | "vibration" | "airflow" | "leak" | "optical";
export type SensorStatus = "all" | "nominal" | "warning" | "critical" | "offline";

export interface IoTSensor {
  id: string;
  name: string;
  assetId: string;
  assetName: string;
  facility: string;
  locationDetails: string;
  type: "temperature" | "humidity" | "power" | "vibration" | "airflow" | "leak" | "optical";
  value: number;
  unit: string;
  minSafe: number;
  maxSafe: number;
  status: "nominal" | "warning" | "critical" | "offline";
  healthScore: number;
  protocol: "MQTT over TLS" | "Modbus TCP" | "CoAP" | "OPC UA" | "LoRaWAN Gateway";
  lastSync: string;
  powerSource: string;
  rssi: number; // dBm
  history: number[];
  anomalyDescription?: string;
  vendor: string;
  firmware: string;
}

const INITIAL_SENSORS: IoTSensor[] = [
  {
    id: "IOT-TMP-01",
    name: "Cold Aisle Thermal Matrix 01",
    assetId: "AST-RCK-14",
    assetName: "High-Density Compute Rack A14",
    facility: "Paris North Datacenter",
    locationDetails: "Room 102 • Bay Row A • Height 42U",
    type: "temperature",
    value: 20.8,
    unit: "°C",
    minSafe: 18.0,
    maxSafe: 24.5,
    status: "nominal",
    healthScore: 99,
    protocol: "MQTT over TLS",
    lastSync: "Just now",
    powerSource: "PoE+ 48V",
    rssi: -52,
    history: [20.4, 20.5, 20.7, 20.6, 20.9, 20.8, 20.8],
    vendor: "Schneider EcoStruxure",
    firmware: "v4.1.8-sec"
  },
  {
    id: "IOT-TMP-02",
    name: "Blade CPU Heatpipe Exhaust",
    assetId: "AST-SRV-882",
    assetName: "Supermicro 1U Blade Node #04",
    facility: "Frankfurt POP Cloud Node",
    locationDetails: "FRA-1 Core • Bay B • Chassis U12",
    type: "temperature",
    value: 48.2,
    unit: "°C",
    minSafe: 25.0,
    maxSafe: 52.0,
    status: "warning",
    healthScore: 78,
    protocol: "Modbus TCP",
    lastSync: "1s ago",
    powerSource: "Internal Chassis Bus",
    rssi: -45,
    history: [44.1, 45.2, 46.0, 47.4, 47.9, 48.0, 48.2],
    anomalyDescription: "Thermal gradient rising 1.2°C above baseline",
    vendor: "Sensirion SHT45",
    firmware: "v2.0.4"
  },
  {
    id: "IOT-PWR-01",
    name: "Main PDU B-Feed Harmonic Load",
    assetId: "AST-PDU-02",
    assetName: "Dual-Bus Intelligent PDU 63A",
    facility: "Paris North Datacenter",
    locationDetails: "Substation B • Distribution Board 03",
    type: "power",
    value: 42.6,
    unit: "kW",
    minSafe: 10.0,
    maxSafe: 55.0,
    status: "nominal",
    healthScore: 97,
    protocol: "OPC UA",
    lastSync: "Just now",
    powerSource: "Direct 3-Phase",
    rssi: -38,
    history: [41.9, 42.1, 42.4, 42.2, 42.5, 42.6, 42.6],
    vendor: "Eaton Power-Xpert",
    firmware: "v5.2.1"
  },
  {
    id: "IOT-PWR-02",
    name: "Flywheel UPS Inverter Draw",
    assetId: "AST-UPS-B4",
    assetName: "Active Dynamic UPS Inverter 500kVA",
    facility: "Lyon Tech Campus",
    locationDetails: "Plant Room 01 • North Wing",
    type: "power",
    value: 78.4,
    unit: "kW",
    minSafe: 20.0,
    maxSafe: 85.0,
    status: "nominal",
    healthScore: 94,
    protocol: "Modbus TCP",
    lastSync: "Just now",
    powerSource: "DC Bus Feed",
    rssi: -60,
    history: [76.5, 77.0, 77.5, 78.0, 78.2, 78.1, 78.4],
    vendor: "Piller Power Systems",
    firmware: "v3.1.0-ind"
  },
  {
    id: "IOT-VIB-01",
    name: "AHU Chiller Bearing Accelerometer",
    assetId: "AST-CHL-05",
    assetName: "Centrifugal Water Chiller 1200kW",
    facility: "Paris North Datacenter",
    locationDetails: "Rooftop Mechanical Plant Area C",
    type: "vibration",
    value: 5.8,
    unit: "mm/s",
    minSafe: 0.1,
    maxSafe: 4.5,
    status: "critical",
    healthScore: 48,
    protocol: "LoRaWAN Gateway",
    lastSync: "2s ago",
    powerSource: "Battery 92% (Li-SOCl2)",
    rssi: -71,
    history: [3.2, 3.8, 4.2, 4.9, 5.3, 5.6, 5.8],
    anomalyDescription: "Harmonic bearing micro-vibration exceeds ISO 10816 class II limit",
    vendor: "SKF Enlight Pro",
    firmware: "v1.9.3"
  },
  {
    id: "IOT-VIB-02",
    name: "Cooling Fan Rotor Gyro Sensor",
    assetId: "AST-FAN-12",
    assetName: "Air Handler Primary Fan Group #2",
    facility: "Marseille South Platform",
    locationDetails: "Perimeter AHU Gallery • Level -1",
    type: "vibration",
    value: 2.1,
    unit: "mm/s",
    minSafe: 0.1,
    maxSafe: 4.0,
    status: "nominal",
    healthScore: 96,
    protocol: "MQTT over TLS",
    lastSync: "Just now",
    powerSource: "24V Industrial",
    rssi: -50,
    history: [2.0, 2.0, 2.2, 2.1, 2.1, 2.2, 2.1],
    vendor: "Bosch Rexroth",
    firmware: "v2.4.0"
  },
  {
    id: "IOT-HUM-01",
    name: "Server Room Relative Humidity Probe",
    assetId: "AST-HAL-01",
    assetName: "Cleanroom White Space Data Hall #1",
    facility: "Casablanca Tech Hub",
    locationDetails: "Core Room • Floor Plinth Sensor Grid",
    type: "humidity",
    value: 48.5,
    unit: "%RH",
    minSafe: 40.0,
    maxSafe: 60.0,
    status: "nominal",
    healthScore: 98,
    protocol: "CoAP",
    lastSync: "Just now",
    powerSource: "PoE 24V",
    rssi: -58,
    history: [48.0, 48.2, 48.3, 48.5, 48.4, 48.6, 48.5],
    vendor: "Vaisala HMP110",
    firmware: "v3.0.1"
  },
  {
    id: "IOT-AIR-01",
    name: "Floor Plenum Static Differential Pressure",
    assetId: "AST-PLN-01",
    assetName: "Raised Floor Air Distribution Plenum",
    facility: "Frankfurt POP Cloud Node",
    locationDetails: "Plenum Underfloor Sub-Void FRA-1",
    type: "airflow",
    value: 28.4,
    unit: "Pa",
    minSafe: 20.0,
    maxSafe: 38.0,
    status: "nominal",
    healthScore: 95,
    protocol: "Modbus TCP",
    lastSync: "Just now",
    powerSource: "Direct DC",
    rssi: -42,
    history: [28.0, 28.1, 28.3, 28.5, 28.3, 28.4, 28.4],
    vendor: "Dwyer Magnesense",
    firmware: "v1.4.2"
  },
  {
    id: "IOT-LEK-01",
    name: "Underfloor Hydrocarbon & Water Leak String",
    assetId: "AST-LEV-01",
    assetName: "Underfloor Chilled Water Manifold",
    facility: "Paris North Datacenter",
    locationDetails: "Under Floor Tile Row C-12",
    type: "leak",
    value: 0.0,
    unit: "Risk Index",
    minSafe: 0.0,
    maxSafe: 0.2,
    status: "nominal",
    healthScore: 100,
    protocol: "MQTT over TLS",
    lastSync: "Just now",
    powerSource: "Isolated Loop 12V",
    rssi: -48,
    history: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    vendor: "TraceTek TT1000",
    firmware: "v4.0.0"
  },
  {
    id: "IOT-OPT-01",
    name: "Backbone DWDM SFP+ Optical Rx Power",
    assetId: "AST-NET-SW01",
    assetName: "Arista 7050SX 100GbE Spine Switch",
    facility: "Marseille South Platform",
    locationDetails: "Telecom Meet-Me-Room (MMR-01)",
    type: "optical",
    value: -3.8,
    unit: "dBm",
    minSafe: -11.0,
    maxSafe: -1.0,
    status: "nominal",
    healthScore: 98,
    protocol: "CoAP",
    lastSync: "Just now",
    powerSource: "Switch SFP Bay",
    rssi: -35,
    history: [-3.9, -3.8, -3.8, -3.7, -3.8, -3.8, -3.8],
    vendor: "Finisar Optical QSFP",
    firmware: "v1.8.8"
  }
];

interface IoTSensorTelemetryMonitorProps {
  state?: GlobalState;
  isDark?: boolean;
  onCreateWorkOrderForAsset?: (assetName: string, issue: string) => void;
  onNavigateToFloorplan?: () => void;
}

export default function IoTSensorTelemetryMonitor({
  state,
  isDark = true,
  onCreateWorkOrderForAsset,
  onNavigateToFloorplan
}: IoTSensorTelemetryMonitorProps) {
  const [sensors, setSensors] = useState<IoTSensor[]>(INITIAL_SENSORS);
  const [selectedType, setSelectedType] = useState<SensorType>("all");
  const [selectedStatus, setSelectedStatus] = useState<SensorStatus>("all");
  const [selectedFacility, setSelectedFacility] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState<IoTSensor | null>(null);
  const [isCalibrating, setIsCalibrating] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Live real-time tick to simulate sensor telemetry streaming
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setSensors(prev =>
        prev.map(sensor => {
          if (sensor.status === "offline") return sensor;

          // Tiny natural drift
          const jitterRange = sensor.type === "vibration" ? 0.08 : sensor.type === "temperature" ? 0.15 : 0.2;
          const delta = (Math.random() - 0.49) * jitterRange;
          let nextValue = Number((sensor.value + delta).toFixed(1));

          // Clamp within realistic physics
          if (sensor.type === "leak") nextValue = 0.0;
          if (sensor.type === "optical") nextValue = Number(Math.max(-12, Math.min(-1, nextValue)).toFixed(1));

          // Evaluate health and status
          let nextStatus = sensor.status;
          let nextScore = sensor.healthScore;

          if (sensor.status !== "critical") {
            if (nextValue > sensor.maxSafe || nextValue < sensor.minSafe) {
              nextStatus = "warning";
              nextScore = Math.max(60, sensor.healthScore - 1);
            } else {
              nextStatus = "nominal";
              nextScore = Math.min(100, sensor.healthScore + 1);
            }
          }

          const nextHistory = [...sensor.history.slice(1), nextValue];

          return {
            ...sensor,
            value: nextValue,
            status: nextStatus,
            healthScore: nextScore,
            lastSync: "Just now",
            history: nextHistory
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Flash action success message banner
  const triggerNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 4500);
  };

  // Trigger manual calibration
  const handleCalibrateSensor = (sensorId: string) => {
    setIsCalibrating(sensorId);
    setTimeout(() => {
      setSensors(prev =>
        prev.map(s => {
          if (s.id === sensorId) {
            const nominalVal = Number(((s.minSafe + s.maxSafe) / 2).toFixed(1));
            return {
              ...s,
              value: nominalVal,
              status: "nominal",
              healthScore: 100,
              anomalyDescription: undefined,
              history: s.history.map(() => nominalVal)
            };
          }
          return s;
        })
      );
      setIsCalibrating(null);
      triggerNotification(`Sensor ${sensorId} successfully re-calibrated to factory baseline.`);
      logAuditEvent("IOT_CALIBRATE", `Calibrated IoT sensor ${sensorId}`);
    }, 1200);
  };

  // Simulate Anomaly Injection for testing
  const handleSimulateAnomaly = () => {
    setSensors(prev => {
      const targetIndex = Math.floor(Math.random() * prev.length);
      return prev.map((s, idx) => {
        if (idx === targetIndex) {
          const spikedValue = Number((s.maxSafe * 1.25).toFixed(1));
          return {
            ...s,
            value: spikedValue,
            status: "critical",
            healthScore: 42,
            anomalyDescription: "Spike detected: Out-of-envelope telemetry burst",
            history: [...s.history.slice(1), spikedValue]
          };
        }
        return s;
      });
    });
    triggerNotification("Injected simulated thermal/harmonic drift into sensor fleet.");
  };

  // Compute telemetry summary metrics
  const telemetryStats = useMemo(() => {
    const total = sensors.length;
    const nominal = sensors.filter(s => s.status === "nominal").length;
    const warning = sensors.filter(s => s.status === "warning").length;
    const critical = sensors.filter(s => s.status === "critical").length;
    const offline = sensors.filter(s => s.status === "offline").length;
    const avgHealth = Math.round(sensors.reduce((acc, s) => acc + s.healthScore, 0) / (total || 1));
    const anomaliesCount = warning + critical;
    return { total, nominal, warning, critical, offline, avgHealth, anomaliesCount };
  }, [sensors]);

  // Unique facilities for filtering
  const facilities = useMemo(() => {
    return Array.from(new Set(sensors.map(s => s.facility)));
  }, [sensors]);

  // Filtered sensor list
  const filteredSensors = useMemo(() => {
    return sensors.filter(s => {
      const matchesType = selectedType === "all" || s.type === selectedType;
      const matchesStatus = selectedStatus === "all" || s.status === selectedStatus;
      const matchesFacility = selectedFacility === "all" || s.facility === selectedFacility;
      const matchesQuery = 
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.locationDetails.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesStatus && matchesFacility && matchesQuery;
    });
  }, [sensors, selectedType, selectedStatus, selectedFacility, searchQuery]);

  // Type Icon helper
  const getTypeIcon = (type: IoTSensor["type"], className = "w-4 h-4") => {
    switch (type) {
      case "temperature": return <Thermometer className={`${className} text-orange-500`} />;
      case "humidity": return <Droplets className={`${className} text-blue-500`} />;
      case "power": return <Zap className={`${className} text-amber-500`} />;
      case "vibration": return <Activity className={`${className} text-purple-500`} />;
      case "airflow": return <Wind className={`${className} text-teal-500`} />;
      case "leak": return <Droplets className={`${className} text-cyan-500`} />;
      case "optical": return <Radio className={`${className} text-emerald-500`} />;
      default: return <Gauge className={className} />;
    }
  };

  // Status Badge helper
  const getStatusBadge = (status: IoTSensor["status"]) => {
    switch (status) {
      case "nominal":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Nominal
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Drift Warning
          </span>
        );
      case "critical":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 animate-pulse">
            <AlertTriangle className="w-2.5 h-2.5" />
            Critical Out-of-Bounds
          </span>
        );
      case "offline":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-500 border border-slate-500/20">
            <XCircle className="w-2.5 h-2.5" />
            Offline
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Alert / Success Toast */}
      <AnimatePresence>
        {actionSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button
              onClick={() => setActionSuccessMessage(null)}
              className="text-xs hover:underline cursor-pointer opacity-75 hover:opacity-100"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & Telemetry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* KPI 1 */}
        <div className={`p-4 rounded-xl border transition-all ${
          isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200"
        } shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Active IoT Sensors</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{telemetryStats.total}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              100% Ingestion
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-500 mt-1">
            MQTT/Modbus Telemetry Stream: <span className="font-mono text-slate-700 dark:text-neutral-300">1,480 pkts/s</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className={`p-4 rounded-xl border transition-all ${
          isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200"
        } shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Fleet Health Score</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-500">{telemetryStats.avgHealth}%</span>
            <span className="text-xs text-slate-500 dark:text-neutral-400">composite</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${telemetryStats.avgHealth}%` }}
            />
          </div>
        </div>

        {/* KPI 3 */}
        <div className={`p-4 rounded-xl border transition-all ${
          isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200"
        } shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Out-of-Tolerance Drifts</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              telemetryStats.anomaliesCount > 0 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${
              telemetryStats.anomaliesCount > 0 ? "text-amber-500" : "text-emerald-500"
            }`}>
              {telemetryStats.anomaliesCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-neutral-400">
              {telemetryStats.critical > 0 ? `(${telemetryStats.critical} P1 Critical)` : "0 Critical"}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-500 mt-1">
            Predictive calibration recommended
          </div>
        </div>

        {/* KPI 4 */}
        <div className={`p-4 rounded-xl border transition-all ${
          isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200"
        } shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Live Telemetry Control</span>
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isLiveStreaming 
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" 
                  : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 border-transparent"
              }`}
            >
              {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isLiveStreaming ? "Live: 2s" : "Paused"}
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              onClick={handleSimulateAnomaly}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" />
              Simulate Drift
            </button>
            {onNavigateToFloorplan && (
              <button
                onClick={onNavigateToFloorplan}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 transition-all cursor-pointer flex items-center gap-1"
              >
                2D Floor Plan →
              </button>
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-500 mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Active Protocols: MQTT • Modbus • CoAP
          </div>
        </div>

      </div>

      {/* Control Filters and Search */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
        isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200"
      }`}>
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search sensor ID, asset, location..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Filter Badges & Selects */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* Facility Filter */}
          <select
            value={selectedFacility}
            onChange={e => setSelectedFacility(e.target.value)}
            className="bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-neutral-300 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Facilities ({facilities.length})</option>
            {facilities.map(fac => (
              <option key={fac} value={fac}>{fac}</option>
            ))}
          </select>

          {/* Type Filter */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0">
            {(["all", "temperature", "power", "vibration", "humidity", "airflow"] as SensorType[]).map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all cursor-pointer ${
                  selectedType === type
                    ? "bg-orange-500 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value as SensorStatus)}
            className="bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-neutral-300 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="nominal">Nominal Only</option>
            <option value="warning">Warning / Drift</option>
            <option value="critical">Critical Only</option>
          </select>

        </div>
      </div>

      {/* Main Grid of Connected IoT Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSensors.map(sensor => {
          const isWarning = sensor.status === "warning";
          const isCritical = sensor.status === "critical";

          return (
            <motion.div
              key={sensor.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-xl border p-4.5 transition-all relative overflow-hidden flex flex-col justify-between ${
                isCritical 
                  ? "bg-red-500/[0.03] border-red-500/40 shadow-sm" 
                  : isWarning 
                  ? "bg-amber-500/[0.03] border-amber-500/40 shadow-sm" 
                  : isDark 
                  ? "bg-white/[0.02] border-white/10 hover:border-orange-500/40" 
                  : "bg-white border-slate-200 hover:border-orange-500/40"
              }`}
            >
              
              {/* Header: ID, Type Icon & Status */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isDark ? "bg-white/5" : "bg-slate-100"
                    }`}>
                      {getTypeIcon(sensor.type, "w-5 h-5")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {sensor.id}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-neutral-500 font-mono">
                          {sensor.protocol}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-neutral-200 line-clamp-1">
                        {sensor.name}
                      </h4>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(sensor.status)}
                  </div>
                </div>

                {/* Target Asset Connection info */}
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200/60 dark:border-white/5 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-neutral-300">
                      <Server className="w-3.5 h-3.5 text-orange-500" />
                      {sensor.assetName}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {sensor.assetId}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-neutral-500 mt-1 truncate">
                    {sensor.facility} • {sensor.locationDetails}
                  </div>
                </div>

                {/* Live Value Display & Safe Threshold Envelope */}
                <div className="mt-3.5 flex items-baseline justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-mono text-slate-500 dark:text-neutral-400">
                      Current Telemetry
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className={`text-2xl font-black font-mono tracking-tight ${
                        isCritical ? "text-red-500" : isWarning ? "text-amber-500" : "text-slate-900 dark:text-white"
                      }`}>
                        {sensor.value}
                      </span>
                      <span className="text-xs font-bold font-mono text-slate-500 dark:text-neutral-400">
                        {sensor.unit}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] uppercase font-mono text-slate-500 dark:text-neutral-400">
                      Health Index
                    </div>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span className={`text-lg font-bold font-mono ${
                        sensor.healthScore < 60 ? "text-red-500" : sensor.healthScore < 85 ? "text-amber-500" : "text-emerald-500"
                      }`}>
                        {sensor.healthScore}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Safe Range Bar Indicator */}
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-neutral-500">
                    <span>Safe Min: {sensor.minSafe} {sensor.unit}</span>
                    <span>Safe Max: {sensor.maxSafe} {sensor.unit}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCritical ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ 
                        width: `${Math.min(100, Math.max(5, ((sensor.value - sensor.minSafe) / (sensor.maxSafe - sensor.minSafe)) * 100))}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Mini Sparkline History (7 points) */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                    <span>Live Trend (T-14s)</span>
                    <span className="text-[10px] text-slate-400">{sensor.lastSync}</span>
                  </div>
                  <div className="h-9 flex items-end gap-1 px-1 py-1 rounded bg-slate-50 dark:bg-neutral-900/40 border border-slate-200/40 dark:border-white/5">
                    {sensor.history.map((val, i) => {
                      const min = Math.min(...sensor.history);
                      const max = Math.max(...sensor.history);
                      const range = max - min || 1;
                      const pct = Math.round(((val - min) / range) * 70) + 20;

                      return (
                        <div key={i} className="flex-1 flex flex-col justify-end items-center h-full group relative">
                          <div
                            className={`w-full rounded-t-xs transition-all ${
                              isCritical 
                                ? "bg-red-500 group-hover:bg-red-400" 
                                : isWarning 
                                ? "bg-amber-500 group-hover:bg-amber-400" 
                                : "bg-orange-500 group-hover:bg-orange-400"
                            }`}
                            style={{ height: `${pct}%` }}
                          />
                          <div className="absolute bottom-full mb-1 hidden group-hover:block z-10 bg-slate-900 text-white text-[9px] px-1 py-0.5 rounded font-mono shadow-xs pointer-events-none whitespace-nowrap">
                            {val} {sensor.unit}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Anomaly Callout Banner if drifting */}
                {sensor.anomalyDescription && (
                  <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{sensor.anomalyDescription}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedSensor(sensor)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-neutral-400" />
                  Inspect
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCalibrateSensor(sensor.id)}
                    disabled={isCalibrating === sensor.id}
                    title="Run auto-calibration routine"
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-neutral-300 text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCalibrating === sensor.id ? "animate-spin text-orange-500" : ""}`} />
                  </button>

                  {onCreateWorkOrderForAsset && (
                    <button
                      onClick={() => onCreateWorkOrderForAsset(sensor.assetName, `Telemetry alert on ${sensor.id}: ${sensor.value} ${sensor.unit}`)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                        isCritical || isWarning
                          ? "bg-orange-500 hover:bg-orange-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300"
                      }`}
                    >
                      <Wrench className="w-3 h-3" />
                      Work Order
                    </button>
                  )}
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>

      {filteredSensors.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-neutral-800">
          <Radio className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">No IoT Sensors Match Filters</h4>
          <p className="text-xs text-slate-500 dark:text-neutral-500 mt-1">
            Try resetting your type, status, or facility filters.
          </p>
          <button
            onClick={() => { setSelectedType("all"); setSelectedStatus("all"); setSelectedFacility("all"); setSearchQuery(""); }}
            className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-500 text-white cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Deep Dive Inspection Modal / Drawer */}
      <AnimatePresence>
        {selectedSensor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-2xl rounded-2xl border shadow-2xl p-6 relative overflow-hidden ${
                isDark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    {getTypeIcon(selectedSensor.type, "w-6 h-6")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm">{selectedSensor.id}</span>
                      {getStatusBadge(selectedSensor.status)}
                    </div>
                    <h3 className="text-base font-bold mt-0.5">{selectedSensor.name}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSensor(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="mt-4 space-y-4 text-xs">
                
                {/* Real-time telemetry summary */}
                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-700/60">
                  <div>
                    <span className="text-slate-500 dark:text-neutral-400 block text-[11px]">Instant Reading</span>
                    <span className="text-xl font-bold font-mono text-orange-500">
                      {selectedSensor.value} {selectedSensor.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-neutral-400 block text-[11px]">Tolerance Envelope</span>
                    <span className="text-xs font-mono font-semibold text-slate-700 dark:text-neutral-200">
                      [{selectedSensor.minSafe} – {selectedSensor.maxSafe}] {selectedSensor.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-neutral-400 block text-[11px]">Signal (RSSI)</span>
                    <span className="text-xs font-mono font-semibold text-emerald-500">
                      {selectedSensor.rssi} dBm (Optimal)
                    </span>
                  </div>
                </div>

                {/* Asset Details */}
                <div className="space-y-2">
                  <h5 className="font-bold uppercase tracking-wider text-[11px] text-slate-400">Parent Physical Asset</h5>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 space-y-1.5">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500 dark:text-neutral-400">Asset Tag:</span>
                      <span className="font-bold">{selectedSensor.assetId} ({selectedSensor.assetName})</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500 dark:text-neutral-400">Facility Location:</span>
                      <span>{selectedSensor.facility}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500 dark:text-neutral-400">Precise Placement:</span>
                      <span>{selectedSensor.locationDetails}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500 dark:text-neutral-400">Power Supply:</span>
                      <span>{selectedSensor.powerSource}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500 dark:text-neutral-400">Probe Manufacturer:</span>
                      <span>{selectedSensor.vendor} ({selectedSensor.firmware})</span>
                    </div>
                  </div>
                </div>

                {/* Raw Telemetry Frame Inspector */}
                <div className="space-y-1.5">
                  <h5 className="font-bold uppercase tracking-wider text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Live MQTT / Modbus Telemetry Frame</span>
                    <span className="text-[10px] text-emerald-500 font-mono">CRC-32 Validated</span>
                  </h5>
                  <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
{JSON.stringify({
  sensor_id: selectedSensor.id,
  target_asset: selectedSensor.assetId,
  timestamp_utc: new Date().toISOString(),
  telemetry: {
    val: selectedSensor.value,
    unit: selectedSensor.unit,
    health_idx: selectedSensor.healthScore,
    status: selectedSensor.status
  },
  comm: {
    protocol: selectedSensor.protocol,
    rssi_dbm: selectedSensor.rssi,
    tx_power: selectedSensor.powerSource
  }
}, null, 2)}
                  </pre>
                </div>

                {/* Actions */}
                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    onClick={() => handleCalibrateSensor(selectedSensor.id)}
                    className="px-4 py-2 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-800 dark:text-white font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Calibrate Sensor
                  </button>
                  {onCreateWorkOrderForAsset && (
                    <button
                      onClick={() => {
                        onCreateWorkOrderForAsset(selectedSensor.assetName, `Telemetry check required for ${selectedSensor.id}`);
                        setSelectedSensor(null);
                      }}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      Create CAFM Work Order
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
