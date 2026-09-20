import React, { useState, useMemo } from "react";
import { 
  Building2, 
  Server, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Network, 
  HardDrive, 
  Zap, 
  Layers, 
  Flame, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  SlidersHorizontal, 
  TrendingDown, 
  TrendingUp, 
  ArrowUpRight, 
  RefreshCw, 
  Filter, 
  Globe2, 
  Lock, 
  Eye, 
  Play, 
  MapPin, 
  Sparkles,
  ArrowRight,
  Database,
  Radio,
  Workflow,
  Plus
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { GlobalState, EdgeNode, CAFMWorkOrder } from "../types";
import { logAuditEvent } from "../hooks/useGlobalState";

interface UnifiedDashboardViewProps {
  state: GlobalState;
  isDark?: boolean;
  onSelectNode?: (node: EdgeNode) => void;
  onCreateWorkOrderForNode?: (nodeId: string) => void;
  onNavigateToSection?: (page: string, itemId?: string) => void;
  onSelectTab?: (id: string) => void;
}

// Modular grid widget IDs
type WidgetId = 
  | "kpi-ribbon"
  | "cross-correlation"
  | "it-compute"
  | "it-network"
  | "it-security"
  | "cafm-energy"
  | "cafm-bms"
  | "unified-incidents"
  | "event-mesh";

interface WidgetConfig {
  id: WidgetId;
  label: string;
  category: "CAFM" | "IT" | "Hybride";
  enabled: boolean;
}

export default function UnifiedDashboardView({
  state,
  isDark = true,
  onSelectNode,
  onCreateWorkOrderForNode,
  onNavigateToSection,
  onSelectTab: onSelectTabProp
}: UnifiedDashboardViewProps) {
  const onSelectTab = (tabId: string) => {
    if (onSelectTabProp) {
      onSelectTabProp(tabId);
    } else if (onNavigateToSection) {
      onNavigateToSection("overview", tabId);
    }
  };
  // Site filter state
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h" | "7d">("24h");
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [incidentDomainFilter, setIncidentDomainFilter] = useState<"all" | "cafm" | "it">("all");
  const [simulationAlert, setSimulationAlert] = useState<string | null>(null);

  // Widget visibility toggles
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    { id: "kpi-ribbon", label: "Executive KPI Ribbon", category: "Hybride", enabled: true },
    { id: "cross-correlation", label: "CAFM & IT Convergence Matrix (Power vs Compute)", category: "Hybride", enabled: true },
    { id: "it-compute", label: "Compute & Hypervisor Infrastructure", category: "IT", enabled: true },
    { id: "it-network", label: "Anycast BGP Network & Edge Nodes", category: "IT", enabled: true },
    { id: "it-security", label: "Security Posture & Zero-Trust ZTNA", category: "IT", enabled: true },
    { id: "cafm-energy", label: "Energy Efficiency & PUE Trajectory", category: "CAFM", enabled: true },
    { id: "cafm-bms", label: "HVAC Building Supervision & Flex Space", category: "CAFM", enabled: true },
    { id: "unified-incidents", label: "Unified Incidents & Work Orders Queue", category: "Hybride", enabled: true },
    { id: "event-mesh", label: "Real-Time Kafka Streaming & Telemetry", category: "Hybride", enabled: true }
  ]);

  const toggleWidget = (id: WidgetId) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  const isWidgetEnabled = (id: WidgetId) => widgets.find(w => w.id === id)?.enabled ?? true;

  // Filter nodes based on selected site
  const filteredNodes = useMemo(() => {
    if (selectedSite === "all") return state.nodes || [];
    return (state.nodes || []).filter(n => 
      n.name.toLowerCase().includes(selectedSite.toLowerCase()) || 
      n.location.toLowerCase().includes(selectedSite.toLowerCase())
    );
  }, [state.nodes, selectedSite]);

  // Dynamic Calculated Aggregates
  const totalNodesCount = (state.nodes || []).length;
  const activeNodesCount = (state.nodes || []).filter(n => n.status === "active").length;
  const avgPue = useMemo(() => {
    const list = (state.nodes || []).filter(n => n.pue);
    if (!list.length) return 1.14;
    return Number((list.reduce((acc, n) => acc + (n.pue || 1.14), 0) / list.length).toFixed(2));
  }, [state.nodes]);

  const avgCpu = useMemo(() => {
    if (!filteredNodes.length) return 42;
    return Math.round(filteredNodes.reduce((acc, n) => acc + (n.cpuUsage || 40), 0) / filteredNodes.length);
  }, [filteredNodes]);

  const avgRam = useMemo(() => {
    if (!filteredNodes.length) return 56;
    return Math.round(filteredNodes.reduce((acc, n) => acc + (n.ramUsage || 50), 0) / filteredNodes.length);
  }, [filteredNodes]);

  const avgLatency = useMemo(() => {
    if (!filteredNodes.length) return 14;
    return Math.round(filteredNodes.reduce((acc, n) => acc + (n.latency || 12), 0) / filteredNodes.length);
  }, [filteredNodes]);

  // Hybrid Simulated Cross-Telemetry Data (24h correlation between IT compute load and Facility cooling power)
  const crossTelemetryData = useMemo(() => {
    return [
      { time: "00:00", itLoadKw: 120, hvacCoolingKw: 24, pueRatio: 1.13, tempDc: 19.4 },
      { time: "03:00", itLoadKw: 95,  hvacCoolingKw: 18, pueRatio: 1.12, tempDc: 19.1 },
      { time: "06:00", itLoadKw: 110, hvacCoolingKw: 22, pueRatio: 1.13, tempDc: 19.3 },
      { time: "09:00", itLoadKw: 240, hvacCoolingKw: 48, pueRatio: 1.15, tempDc: 20.2 },
      { time: "12:00", itLoadKw: 285, hvacCoolingKw: 56, pueRatio: 1.16, tempDc: 20.8 },
      { time: "15:00", itLoadKw: 310, hvacCoolingKw: 62, pueRatio: 1.17, tempDc: 21.0 },
      { time: "18:00", itLoadKw: 260, hvacCoolingKw: 51, pueRatio: 1.15, tempDc: 20.4 },
      { time: "21:00", itLoadKw: 180, hvacCoolingKw: 35, pueRatio: 1.14, tempDc: 19.8 }
    ];
  }, []);

  // Hybrid Work Orders / Incidents (CAFM + IT)
  const [hybridIncidents, setHybridIncidents] = useState([
    {
      id: "INC-8941",
      domain: "it",
      title: "100G Fiber Port Saturation on Spine-02 Switch",
      site: "Paris North Datacenter",
      severity: "Critical",
      status: "In Progress",
      assigned: "BGP Network Team",
      time: "14 min ago",
      slaProgress: 82
    },
    {
      id: "WO-4412",
      domain: "cafm",
      title: "Abnormal AHU Fan Vibration on Floor 5 (HVAC)",
      site: "Lyon Tech Campus",
      severity: "High",
      status: "Scheduled",
      assigned: "Climate Engineering",
      time: "32 min ago",
      slaProgress: 65
    },
    {
      id: "INC-8942",
      domain: "it",
      title: "Unauthorized ZTNA Access Attempt (Anonymous IP)",
      site: "Frankfurt Cloud Hub",
      severity: "Blocked",
      status: "Resolved",
      assigned: "Zero-Trust SOC",
      time: "1 hr ago",
      slaProgress: 100
    },
    {
      id: "WO-4413",
      domain: "cafm",
      title: "2N UPS Battery Pack Replacement",
      site: "Paris North Datacenter",
      severity: "Normal",
      status: "In Progress",
      assigned: "Electrical Maintenance",
      time: "2 hrs ago",
      slaProgress: 45
    },
    {
      id: "WO-4414",
      domain: "cafm",
      title: "CO2 Threshold Exceeded in Main Conference Hall (620 ppm)",
      site: "Marseille South Campus",
      severity: "Normal",
      status: "Resolved",
      assigned: "DALI/HVAC Regulation",
      time: "3 hrs ago",
      slaProgress: 100
    }
  ]);

  // Filtered incidents
  const filteredIncidents = hybridIncidents.filter(inc => {
    if (incidentDomainFilter === "all") return true;
    return inc.domain === incidentDomainFilter;
  });

  // Interactive Incident Simulation Handler
  const handleTriggerSimulation = () => {
    const isItIncident = Math.random() > 0.5;
    const newInc = isItIncident ? {
      id: `INC-${Math.floor(8950 + Math.random() * 50)}`,
      domain: "it",
      title: "CPU Load Spike Detected on Hypervisor K8s-Worker-04",
      site: selectedSite === "all" ? "Paris North Datacenter" : selectedSite,
      severity: "High",
      status: "In Progress",
      assigned: "Cloud Ops SRE",
      time: "Just now",
      slaProgress: 95
    } : {
      id: `WO-${Math.floor(4420 + Math.random() * 50)}`,
      domain: "cafm",
      title: "Cold Aisle Thermal Drift Rack 12 (+2.4°C)",
      site: selectedSite === "all" ? "Lyon Tech Campus" : selectedSite,
      severity: "Critical",
      status: "In Progress",
      assigned: "HVAC On-Call Team",
      time: "Just now",
      slaProgress: 90
    };

    setHybridIncidents(prev => [newInc, ...prev]);
    setSimulationAlert(`Incident created: ${newInc.title} (${newInc.id})`);
    logAuditEvent("SIMULATION_INCIDENT", `Simulated incident creation ${newInc.domain.toUpperCase()}: ${newInc.id}`);

    setTimeout(() => {
      setSimulationAlert(null);
    }, 4000);
  };

  const handleResolveIncident = (id: string) => {
    setHybridIncidents(prev => prev.map(inc => 
      inc.id === id ? { ...inc, status: "Resolved", slaProgress: 100 } : inc
    ));
    logAuditEvent("RESOLVE_INCIDENT", `Resolved unified incident: ${id}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP CONTROL BAR & SITE SELECTOR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-400 font-bold">
              REAL-TIME UNIFIED SUPERVISION (CAFM & IT)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Convergence Cockpit</span>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
              v4.2 PRO
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Real-time aggregation of building management parameters (BMS/HVAC/PUE) and IT infrastructure telemetry (Compute, Anycast Network, ZTNA).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Site Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="bg-[#11131a] text-white text-xs font-mono py-2 pl-3 pr-8 rounded-xl border border-white/15 focus:outline-none focus:border-orange-500 transition-all cursor-pointer appearance-none"
            >
              <option value="all">All Sites (Global - 42 Sites)</option>
              <option value="Paris">Paris North Datacenter</option>
              <option value="Lyon">Lyon Tech Campus</option>
              <option value="Marseille">Marseille South Platform</option>
              <option value="Francfort">Frankfurt Cloud Node POP</option>
              <option value="Casablanca">Casablanca Tech Gateway</option>
            </select>
            <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs font-mono">
            {(["1h", "6h", "24h", "7d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeRange === range
                    ? "bg-white/15 text-white font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Simulate Incident Button */}
          <button
            onClick={handleTriggerSimulation}
            className="px-3 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="Inject thermal drift or network event"
          >
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            <span>Simulate Incident</span>
          </button>

          {/* Modular Grid Layout Configurator */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 border border-white/10 transition-all"
            title="Customize modular grid"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulation Feedback Alert */}
      <AnimatePresence>
        {simulationAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-mono flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 animate-bounce" />
              <span>{simulationAlert}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-orange-400">Live Injected</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. EXECUTIVE CROSS-DOMAIN KPI STRIP (8 GRID TILES) */}
      {isWidgetEnabled("kpi-ribbon") && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          
          {/* CAFM: PUE */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: 0.02, ease: [0.22, 1, 0.36, 1] }}
            className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-orange-500/40 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
              <span className="text-orange-400 font-semibold px-1 py-0.2 rounded bg-orange-500/10">CAFM</span>
              <span>PUE</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">{avgPue}</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5 font-mono">
              <TrendingDown className="w-2.5 h-2.5" />
              <span>-0.02 vs target</span>
            </div>
          </motion.div>

          {/* CAFM: Energy */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-orange-500/40 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
              <span className="text-orange-400 font-semibold px-1 py-0.2 rounded bg-orange-500/10">CAFM</span>
              <span>Energy</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">148 MWh</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5 font-mono">
              <span>-24% Target</span>
            </div>
          </motion.div>

          {/* CAFM: Air Quality */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-orange-500/40 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
              <span className="text-orange-400 font-semibold px-1 py-0.2 rounded bg-orange-500/10">CAFM</span>
              <span>IAQ Climate</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">482 ppm</div>
            <div className="text-[10px] text-neutral-400 font-mono">21.4°C • 48% RH</div>
          </motion.div>

          {/* CAFM: Flex Occupancy */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: 0.11, ease: [0.22, 1, 0.36, 1] }}
            className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-orange-500/40 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
              <span className="text-orange-400 font-semibold px-1 py-0.2 rounded bg-orange-500/10">CAFM</span>
              <span>Offices</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">76%</div>
            <div className="text-[10px] text-neutral-400 font-mono">2480/3250 desks</div>
          </motion.div>

          {/* IT: Compute Load */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-orange-500/40 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
              <span className="text-orange-400 font-semibold px-1 py-0.2 rounded bg-orange-500/10">IT</span>
              <span>CPU Core</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">{avgCpu}%</div>
            <div className="text-[10px] text-neutral-400 font-mono">RAM: {avgRam}%</div>
          </motion.div>

          {/* IT: Network Latency */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: 0.17, ease: [0.22, 1, 0.36, 1] }}
            className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-orange-500/40 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
              <span className="text-orange-400 font-semibold px-1 py-0.2 rounded bg-orange-500/10">IT</span>
              <span>Anycast</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">{avgLatency} ms</div>
            <div className="text-[10px] text-emerald-400 font-mono">0.001% loss</div>
          </motion.div>

          {/* IT: Security Posture */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-orange-500/40 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
              <span className="text-orange-400 font-semibold px-1 py-0.2 rounded bg-orange-500/10">IT</span>
              <span>ZTNA</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">99.4%</div>
            <div className="text-[10px] text-emerald-400 font-mono">ISO 27001 OK</div>
          </motion.div>

          {/* HYBRID: Incidents */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: 0.23, ease: [0.22, 1, 0.36, 1] }}
            className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-orange-500/40 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
              <span className="text-orange-400 font-semibold px-1 py-0.2 rounded bg-orange-500/10">CMMS/IT</span>
              <span>Orders</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">{hybridIncidents.filter(i => i.status !== "Resolved").length}</div>
            <div className="text-[10px] text-amber-400 font-mono">1 active</div>
          </motion.div>

        </div>
      )}

      {/* 3. PRIMARY CROSS-DOMAIN CONVERGENCE GRAPH (CAFM HVAC vs IT COMPUTE LOAD) */}
      {isWidgetEnabled("cross-correlation") && (
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/10 relative overflow-hidden shadow-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 mb-1 flex items-center gap-2">
                <Workflow className="w-3.5 h-3.5 text-orange-500" />
                <span>Energy Regulation Slave to IT Traffic</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Dynamic Convergence: IT Compute Load (kW) vs Building HVAC Power (kW)
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-neutral-300">IT Server Load (kW)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-neutral-300">HVAC Climate Engineering (kW)</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={crossTelemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="itGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="hvacGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.1)" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0c0d12', 
                    borderColor: 'rgba(255,255,255,0.15)', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }} 
                />
                <Area type="monotone" dataKey="itLoadKw" name="Server Load (kW)" stroke="#3b82f6" strokeWidth={2} fill="url(#itGrad)" />
                <Area type="monotone" dataKey="hvacCoolingKw" name="HVAC Cooling (kW)" stroke="#10b981" strokeWidth={2} fill="url(#hvacGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40">
              <span className="text-neutral-400">Instantaneous PUE</span>
              <span className="text-emerald-400 font-bold">{avgPue}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40">
              <span className="text-neutral-400">AI Airflow Savings</span>
              <span className="text-emerald-400 font-bold">-26% kWh</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40">
              <span className="text-neutral-400">DC Temperature Delta</span>
              <span className="text-blue-400 font-bold">+1.6°C tolerated</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. MODULAR TWO-COLUMN GRID: IT INFRASTRUCTURE vs CAFM FACILITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* === LEFT COLUMN: IT INFRASTRUCTURE (COMPUTE, NETWORK, SECURITY) === */}
        <div className="space-y-6">
          
          {/* IT Compute & Hypervisors Card */}
          {isWidgetEnabled("it-compute") && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              whileHover={{ scale: 1.015, y: -2 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="p-5 sm:p-6 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-orange-500/30 space-y-4 shadow-lg group relative transition-colors"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Server className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    IT Infrastructure • Compute & Storage
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* Quick Action Pills revealed on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button 
                      onClick={() => onNavigateToSection?.("telemetry")}
                      className="px-2 py-0.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-[10px] font-mono flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-2.5 h-2.5" /> AI Diagnostic
                    </button>
                    <button 
                      onClick={() => onNavigateToSection?.("infrastructure")}
                      className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono flex items-center gap-1 transition-colors"
                    >
                      <MapPin className="w-2.5 h-2.5" /> Nodes
                    </button>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/10">
                    K8s & BARE-METAL
                  </span>
                </div>
              </div>

              {/* Progress bars */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-400">Cluster CPU Load</span>
                    <span className="text-white font-bold">{avgCpu}% (128 Cores)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        avgCpu > 80 ? "bg-red-500" : avgCpu > 60 ? "bg-amber-500" : "bg-orange-500"
                      }`}
                      style={{ width: `${avgCpu}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-400">Allocated RAM Pool</span>
                    <span className="text-white font-bold">{avgRam}% (1.2 TB / 2.0 TB)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-neutral-300" style={{ width: `${avgRam}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-400">NVMe-oF & SAN Storage</span>
                    <span className="text-white font-bold">68% (1.4 PB / 2.0 PB)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-orange-400" style={{ width: `68%` }} />
                  </div>
                </div>
              </div>

              {/* Cluster Nodes Quick Table */}
              <div className="pt-2">
                <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-2">
                  Top Active Nodes ({filteredNodes.length} monitored)
                </span>
                <div className="space-y-1.5 font-mono text-xs">
                  {filteredNodes.slice(0, 3).map(node => (
                    <div 
                      key={node.id} 
                      onClick={() => onSelectNode?.(node)}
                      className="p-2.5 rounded-xl bg-black/40 hover:bg-white/[0.06] border border-white/5 hover:border-white/15 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-bold text-white text-xs">{node.name}</span>
                        <span className="text-[10px] text-neutral-400">({node.location})</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-neutral-400">CPU {node.cpuUsage}%</span>
                        <span className="text-orange-400 font-bold">{node.latency} ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* IT Network & Anycast Backbone */}
          {isWidgetEnabled("it-network") && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              whileHover={{ scale: 1.015, y: -2 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="p-5 sm:p-6 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-orange-500/30 space-y-4 shadow-lg group relative transition-colors"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Network className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Anycast Network & WAN Links
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* Quick Action Pills revealed on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button 
                      onClick={() => onNavigateToSection?.("telemetry")}
                      className="px-2 py-0.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-[10px] font-mono flex items-center gap-1 transition-colors"
                    >
                      <Activity className="w-2.5 h-2.5" /> Ping Edge
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-orange-400">144 TBPS BACKBONE</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-neutral-400 block mb-1">WAN Bandwidth</span>
                  <span className="text-base font-bold text-white">28.4 Gbps</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-neutral-400 block mb-1">Average Edge Latency</span>
                  <span className="text-base font-bold text-emerald-400">{avgLatency} ms</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-neutral-400 block mb-1">Anycast BGP Routing</span>
                  <span className="text-base font-bold text-neutral-200">100% Converged</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-neutral-400 block mb-1">Packet Loss</span>
                  <span className="text-base font-bold text-white">0.001%</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* IT Security & Zero-Trust ZTNA */}
          {isWidgetEnabled("it-security") && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              whileHover={{ scale: 1.015, y: -2 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="p-5 sm:p-6 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-orange-500/30 space-y-4 shadow-lg group relative transition-colors"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Perimeter Security & Zero-Trust (ZTNA)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* Quick Action Pills revealed on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button 
                      onClick={() => onNavigateToSection?.("security")}
                      className="px-2 py-0.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-[10px] font-mono flex items-center gap-1 transition-colors"
                    >
                      <Lock className="w-2.5 h-2.5" /> ZTNA Audit
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">ISO 27001</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="text-neutral-300">Active mTLS 1.3 Sessions</span>
                  </div>
                  <span className="text-white font-bold">28,450</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-neutral-300">Blocked Threats WAF/DDoS (24h)</span>
                  </div>
                  <span className="text-emerald-400 font-bold">14,250</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-neutral-300">NFC Badge / IT Login Correlation</span>
                  </div>
                  <span className="text-neutral-200 font-bold">100% Match</span>
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* === RIGHT COLUMN: CAFM & FACILITIES (ENERGY, BMS/CVC, WORKSPACE) === */}
        <div className="space-y-6">
          
          {/* CAFM Energy & Carbon Trajectory */}
          {isWidgetEnabled("cafm-energy") && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              whileHover={{ scale: 1.015, y: -2 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="p-5 sm:p-6 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-orange-500/30 space-y-4 shadow-lg group relative transition-colors"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    CAFM • Energy & Tertiary Decree
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* Quick Action Pills revealed on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button 
                      onClick={() => onNavigateToSection?.("sustainability")}
                      className="px-2 py-0.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-[10px] font-mono flex items-center gap-1 transition-colors"
                    >
                      <TrendingDown className="w-2.5 h-2.5" /> Carbon Footprint
                    </button>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    CSRD & ISO 50001
                  </span>
                </div>
              </div>

              {/* Energy breakdown */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-400">Tertiary Decree Target (-40% by 2030)</span>
                    <span className="text-emerald-400 font-bold">-24% Already Achieved</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `60%` }} />
                  </div>
                </div>

                {/* Energy distribution split */}
                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="p-2.5 rounded-xl bg-black/40 text-center">
                    <span className="text-neutral-400 block text-[10px]">IT Servers</span>
                    <span className="text-white font-bold">87.7%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 text-center">
                    <span className="text-neutral-400 block text-[10px]">HVAC Cooling</span>
                    <span className="text-emerald-400 font-bold">9.2%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 text-center">
                    <span className="text-neutral-400 block text-[10px]">Lighting/UPS</span>
                    <span className="text-amber-400 font-bold">3.1%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-neutral-200 text-xs flex items-center justify-between">
                  <span className="text-neutral-400">Recovered Waste Heat</span>
                  <span className="font-bold text-orange-400">8.4 MWh reinjected</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* CAFM Smart Building & Workplace Management */}
          {isWidgetEnabled("cafm-bms") && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              whileHover={{ scale: 1.015, y: -2 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="p-5 sm:p-6 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-orange-500/30 space-y-4 shadow-lg group relative transition-colors"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Building Supervision & Flex-Office
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* Quick Action Pills revealed on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button 
                      onClick={() => onNavigateToSection?.("cafm")}
                      className="px-2 py-0.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-[10px] font-mono flex items-center gap-1 transition-colors"
                    >
                      <Building2 className="w-2.5 h-2.5" /> 2D Floor Plan
                    </button>
                    <button 
                      onClick={() => onNavigateToSection?.("cafm")}
                      className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono flex items-center gap-1 transition-colors"
                    >
                      <SlidersHorizontal className="w-2.5 h-2.5" /> HVAC
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-orange-400">320,000 M² MANAGED</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-neutral-400 block mb-1">Air Quality (CO2)</span>
                  <span className="text-base font-bold text-white">482 ppm</span>
                  <span className="text-[9px] text-emerald-400 block mt-0.5">Max threshold: 800 ppm</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-neutral-400 block mb-1">Ambient Temperature</span>
                  <span className="text-base font-bold text-white">21.4 °C</span>
                  <span className="text-[9px] text-neutral-400 block mt-0.5">AI HVAC Regulation</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-neutral-400 block mb-1">Flex-Office Occupancy</span>
                  <span className="text-base font-bold text-neutral-200">76% Occupied</span>
                  <span className="text-[9px] text-neutral-400 block mt-0.5">2,480 active desks</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-neutral-400 block mb-1">Meeting Rooms</span>
                  <span className="text-base font-bold text-neutral-200">82% Booked</span>
                  <span className="text-[9px] text-neutral-400 block mt-0.5">DALI sensors active</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Real-Time Event Mesh & Kafka Broker Stream */}
          {isWidgetEnabled("event-mesh") && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              whileHover={{ scale: 1.015, y: -2 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="p-5 sm:p-6 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-orange-500/30 space-y-4 shadow-lg group relative transition-colors"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Hybrid Event Bus (Kafka & Telemetry)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* Quick Action Pills revealed on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button 
                      onClick={() => onNavigateToSection?.("telemetry")}
                      className="px-2 py-0.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-[10px] font-mono flex items-center gap-1 transition-colors"
                    >
                      <Activity className="w-2.5 h-2.5" /> Stream Monitor
                    </button>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    124k MSG/S • ZERO LAG
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-black/50 border border-white/5 font-mono text-[11px] space-y-2 max-h-36 overflow-y-auto no-scrollbar">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="text-neutral-500">[BACNET-01]</span>
                  <span>HVAC VAV-42 Regulation: Airflow adjusted to 850 m³/h</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <span className="text-neutral-500">[SNMP-CORE]</span>
                  <span>Spine-01 Switch: Port xe-0/0/4 operational</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <span className="text-neutral-500">[ZTNA-GATE]</span>
                  <span>Authentication audit: J. Miller (HVAC Technician)</span>
                </div>
                <div className="flex items-center gap-2 text-orange-400">
                  <span className="text-neutral-500">[KAFKA-BUS]</span>
                  <span>Topic 'building.telemetry' replicated to Frankfurt</span>
                </div>
              </div>
            </motion.div>
          )}

        </div>

      </div>

      {/* 5. UNIFIED INCIDENTS & WORK ORDERS QUEUE (CAFM + IT) */}
      {isWidgetEnabled("unified-incidents") && (
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-orange-400 mb-1">
                FACILITIES CMMS & ITIL v4 ITSM
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Unified Work Orders & Incidents Queue</span>
                <span className="text-xs font-mono font-normal text-neutral-400">
                  ({filteredIncidents.length} filtered tickets)
                </span>
              </h3>
            </div>

            {/* Incident Domain Filter Tabs */}
            <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs font-mono">
              <button
                onClick={() => setIncidentDomainFilter("all")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  incidentDomainFilter === "all" ? "bg-white/15 text-white font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setIncidentDomainFilter("cafm")}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  incidentDomainFilter === "cafm" ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Building2 className="w-3 h-3 text-emerald-400" />
                <span>CAFM Facilities</span>
              </button>
              <button
                onClick={() => setIncidentDomainFilter("it")}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  incidentDomainFilter === "it" ? "bg-blue-500/20 text-blue-300 font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Server className="w-3 h-3 text-blue-400" />
                <span>IT & Network</span>
              </button>
            </div>
          </div>

          {/* Incidents Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/5 text-neutral-400 uppercase text-[10px]">
                <tr>
                  <th className="pb-3 font-medium">Reference</th>
                  <th className="pb-3 font-medium">Domain</th>
                  <th className="pb-3 font-medium">Incident / Order Title</th>
                  <th className="pb-3 font-medium">Site</th>
                  <th className="pb-3 font-medium">Assigned To</th>
                  <th className="pb-3 font-medium">Severity</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredIncidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 text-white font-bold">{inc.id}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inc.domain === "cafm" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>
                        {inc.domain === "cafm" ? "CAFM" : "IT"}
                      </span>
                    </td>
                    <td className="py-3.5 text-neutral-200 font-sans font-medium">{inc.title}</td>
                    <td className="py-3.5 text-neutral-400">{inc.site}</td>
                    <td className="py-3.5 text-neutral-300">{inc.assigned}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        inc.severity === "Critical" 
                          ? "bg-red-500/15 text-red-400 border border-red-500/30" 
                          : inc.severity === "High"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : inc.severity === "Blocked"
                          ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                          : "bg-white/5 text-neutral-300 border border-white/10"
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {inc.status === "Resolved" ? (
                        <span className="text-emerald-400 flex items-center justify-end gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolved</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleResolveIncident(inc.id)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Close
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* 6. MODULAR CONFIGURATION MODAL */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-[#0e1017] border border-white/15 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-orange-400" />
                  <h3 className="text-base font-bold text-white">
                    Customize Modular Grid
                  </h3>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-neutral-400 hover:text-white text-xs font-mono"
                >
                  ✕ Close
                </button>
              </div>

              <p className="text-xs text-neutral-400 mb-4">
                Enable or disable widgets according to operational priorities (CIO, Facility Manager, or Executive Operations).
              </p>

              <div className="space-y-2 mb-6">
                {widgets.map(w => (
                  <div 
                    key={w.id} 
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        w.category === "CAFM" ? "bg-emerald-500/20 text-emerald-400" :
                        w.category === "IT" ? "bg-blue-500/20 text-blue-400" :
                        "bg-orange-500/20 text-orange-400"
                      }`}>
                        {w.category}
                      </span>
                      <span className="text-xs font-medium text-white">{w.label}</span>
                    </div>
                    <button
                      onClick={() => toggleWidget(w.id)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        w.enabled ? "bg-orange-500" : "bg-neutral-700"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                        w.enabled ? "left-5.5" : "left-0.5"
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setWidgets(prev => prev.map(w => ({ ...w, enabled: true })))}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono"
                >
                  Re-enable All
                </button>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold font-mono"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
