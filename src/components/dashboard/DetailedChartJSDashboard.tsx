import React, { useState, useMemo } from "react";
import { Line, Bar, Doughnut, Radar } from "react-chartjs-2";
import "./chartSetup";
import { getChartThemeOptions } from "./chartSetup";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Cpu, 
  Server, 
  ShieldCheck, 
  Globe, 
  Zap, 
  Building2, 
  Package, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Layers, 
  SlidersHorizontal, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Radio, 
  Eye, 
  ChevronRight,
  TrendingUp,
  HardDrive,
  Flame,
  Search,
  Filter,
  ShieldAlert,
  BarChart3,
  Compass,
  Download,
  FileSpreadsheet,
  FileText,
  Check
} from "lucide-react";
import { GlobalState, EdgeNode, CAFMWorkOrder } from "../../types";
import { exportStrategicDashboardPDF, exportDashboardDataCSV } from "../../utils/pdfGenerator";

interface DetailedChartJSDashboardProps {
  state: GlobalState;
  isDark?: boolean;
  onSelectNode?: (node: EdgeNode) => void;
  onCreateWorkOrderForNode?: (nodeId: string) => void;
  onNavigateToTab?: (tabId: string) => void;
}

type DashboardTab = "overview" | "compute" | "network" | "cafm" | "security";

export default function DetailedChartJSDashboard({
  state,
  isDark = true,
  onSelectNode,
  onCreateWorkOrderForNode,
  onNavigateToTab
}: DetailedChartJSDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h" | "7d">("24h");
  const [isLive, setIsLive] = useState<boolean>(true);
  const [nodeFilter, setNodeFilter] = useState<string>("all");
  const [metricFocus, setMetricFocus] = useState<"all" | "latency" | "cpu" | "requests">("all");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const handleExportPDF = () => {
    try {
      setExportFeedback("Exporting PDF...");
      exportStrategicDashboardPDF(state, {
        activeView: activeTab,
        timeRange,
        title: "Strategic Infrastructure & Telemetry Dashboard",
      });
      setTimeout(() => setExportFeedback("PDF Downloaded!"), 500);
      setTimeout(() => {
        setExportFeedback(null);
        setIsExportMenuOpen(false);
      }, 2500);
    } catch (err) {
      console.error("PDF export error:", err);
      setExportFeedback("PDF export error");
      setTimeout(() => setExportFeedback(null), 2500);
    }
  };

  const handleExportCSV = (type: "nodes" | "workOrders" | "telemetry" | "security") => {
    try {
      setExportFeedback(`CSV ${type}...`);
      exportDashboardDataCSV(state, type);
      setTimeout(() => setExportFeedback("CSV Downloaded!"), 400);
      setTimeout(() => {
        setExportFeedback(null);
        setIsExportMenuOpen(false);
      }, 2500);
    } catch (err) {
      console.error("CSV export error:", err);
      setExportFeedback("CSV export error");
      setTimeout(() => setExportFeedback(null), 2500);
    }
  };

  const themeColors = useMemo(() => getChartThemeOptions(isDark), [isDark]);

  // Aggregated Metrics
  const nodes = state.nodes || [];
  const activeNodes = nodes.filter(n => n.status === "active");
  const avgLatency = Math.round(nodes.reduce((acc, n) => acc + (n.latency || 15), 0) / (nodes.length || 1));
  const avgCpu = Math.round(nodes.reduce((acc, n) => acc + (n.cpuUsage || 42), 0) / (nodes.length || 1));
  const avgRam = Math.round(nodes.reduce((acc, n) => acc + (n.ramUsage || 55), 0) / (nodes.length || 1));
  const avgPue = Number((nodes.reduce((acc, n) => acc + (n.pue || 1.14), 0) / (nodes.length || 1)).toFixed(2));
  const totalTraffic = (state.trafficData || []).reduce((acc, curr) => acc + curr.requests, 0);

  // Time labels based on range
  const timeLabels = useMemo(() => {
    if (state.trafficData && state.trafficData.length > 0) {
      return state.trafficData.map(d => d.timestamp);
    }
    return ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];
  }, [state.trafficData]);

  // Chart 1: Multi-Axis Telemetry (Req/s & Latency & CPU)
  const multiAxisTelemetryData = useMemo(() => {
    const trafficPoints = state.trafficData?.map(d => d.requests) || [4200, 3800, 4500, 8900, 14200, 16800, 13400, 9200];
    const cpuTrend = trafficPoints.map(v => Math.min(95, Math.max(25, Math.round((v / 18000) * 85 + 10))));
    const latencyTrend = trafficPoints.map(v => Math.min(35, Math.max(8, Math.round(12 + (v / 18000) * 8))));

    return {
      labels: timeLabels,
      datasets: [
        {
          label: "Anycast Requests (req/s)",
          data: trafficPoints,
          borderColor: "#f97316",
          backgroundColor: isDark ? "rgba(249, 115, 22, 0.15)" : "rgba(249, 115, 22, 0.12)",
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 5,
          tension: 0.35,
          fill: true,
          yAxisID: "yReq",
        },
        {
          label: "Overall CPU Load (%)",
          data: cpuTrend,
          borderColor: "#3b82f6",
          backgroundColor: isDark ? "rgba(59, 130, 246, 0.08)" : "rgba(59, 130, 246, 0.06)",
          borderWidth: 2,
          borderDash: [4, 4],
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.35,
          fill: true,
          yAxisID: "yPct",
        },
        {
          label: "Edge Latency p95 (ms)",
          data: latencyTrend,
          borderColor: "#10b981",
          backgroundColor: "transparent",
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 4,
          tension: 0.3,
          yAxisID: "yMs",
        }
      ]
    };
  }, [state.trafficData, timeLabels, isDark]);

  // Chart 2: Regional Compute & Memory Load (Bar Chart)
  const regionalNodeBarData = useMemo(() => {
    const nodeLabels = nodes.map(n => n.name.replace("SENSORIUM-", "").replace("Edge-", ""));
    const cpuData = nodes.map(n => n.cpuUsage || 40);
    const ramData = nodes.map(n => n.ramUsage || 50);

    return {
      labels: nodeLabels.length ? nodeLabels : ["Paris", "Lyon", "Francfort", "Marseille", "Londres", "Madrid"],
      datasets: [
        {
          label: "CPU (%)",
          data: cpuData.length ? cpuData : [42, 58, 71, 39, 48, 62],
          backgroundColor: "#f97316",
          borderRadius: 4,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
        {
          label: "RAM (%)",
          data: ramData.length ? ramData : [64, 72, 85, 52, 60, 68],
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.25)" : "rgba(100, 116, 139, 0.4)",
          borderRadius: 4,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        }
      ]
    };
  }, [nodes, isDark]);

  // Chart 3: Cluster Resource Allocation Doughnut
  const clusterResourceDoughnutData = useMemo(() => {
    return {
      labels: ["Active Allocated", "ZTNA Reserved", "Edge Cache", "Available"],
      datasets: [
        {
          data: [58, 18, 14, 10],
          backgroundColor: [
            "#f97316",
            "#3b82f6",
            "#10b981",
            isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"
          ],
          borderColor: isDark ? "#0c0c0e" : "#ffffff",
          borderWidth: 2,
          hoverOffset: 4,
        }
      ]
    };
  }, [isDark]);

  // Chart 4: Zero Trust Security Radar Chart
  const securityRadarData = useMemo(() => {
    return {
      labels: [
        "Strict mTLS",
        "Micro-segmentation",
        "Post-Quantum Encryption",
        "Zero-Trust IAM Audit",
        "WAF & Bot Detection",
        "FIPS 140-3 Compliance"
      ],
      datasets: [
        {
          label: "Current Score",
          data: [98, 92, 85, 96, 94, 90],
          backgroundColor: "rgba(249, 115, 22, 0.2)",
          borderColor: "#f97316",
          pointBackgroundColor: "#f97316",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#f97316",
          borderWidth: 2,
        },
        {
          label: "ISO 27001 Target",
          data: [85, 80, 75, 90, 85, 80],
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderColor: "#3b82f6",
          borderDash: [3, 3],
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#fff",
          borderWidth: 1.5,
        }
      ]
    };
  }, []);

  // Chart 5: CAFM Energy & PUE Line Chart
  const energyPueData = useMemo(() => {
    return {
      labels: ["00h", "04h", "08h", "12h", "16h", "20h", "24h"],
      datasets: [
        {
          label: "Actual PUE",
          data: [1.12, 1.11, 1.13, 1.16, 1.15, 1.14, 1.13],
          borderColor: "#10b981",
          backgroundColor: isDark ? "rgba(16, 185, 129, 0.12)" : "rgba(16, 185, 129, 0.08)",
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          yAxisID: "yPue",
        },
        {
          label: "HVAC / Cooling Load (kW)",
          data: [28, 24, 35, 58, 62, 48, 32],
          borderColor: "#f97316",
          backgroundColor: "transparent",
          tension: 0.3,
          borderWidth: 2,
          borderDash: [4, 4],
          yAxisID: "yPower",
        }
      ]
    };
  }, [isDark]);

  // Chart 6: WAF Security Threat Breakdown Bar Chart
  const wafThreatBarData = useMemo(() => {
    return {
      labels: ["Botnet Scan", "SQLi Attack", "DDoS L7", "Path Traversal", "Credential Stuffing", "XSS Probe"],
      datasets: [
        {
          label: "Blocked Immediately",
          data: [1420, 840, 2650, 420, 1150, 680],
          backgroundColor: "#ef4444",
          borderRadius: 3,
        },
        {
          label: "JS Challenge Passed",
          data: [65, 12, 180, 8, 45, 18],
          backgroundColor: "#f59e0b",
          borderRadius: 3,
        }
      ]
    };
  }, []);

  return (
    <div className="space-y-3 sm:space-y-3.5 transition-all text-slate-900 dark:text-neutral-100">
      
      {/* Sleek Tab Bar & Control Ribbon (Compact intervals & zero wasted height) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 sm:p-2 rounded-xl bg-slate-100/90 dark:bg-[#0e0e12]/95 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-md">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: "overview", label: "Executive Cockpit", icon: Layers, count: "6 Live" },
            { id: "compute", label: "Compute & Silicon", icon: Cpu, count: `${activeNodes.length} Nodes` },
            { id: "network", label: "Network & Anycast", icon: Globe, count: `${avgLatency}ms` },
            { id: "cafm", label: "Facilities & Energy", icon: Building2, count: `PUE ${avgPue}` },
            { id: "security", label: "Security & ZTNA", icon: ShieldCheck, count: "98.8%" },
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DashboardTab)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer min-h-[32px] ${
                  isCurrent
                    ? "bg-white text-slate-900 shadow-sm dark:bg-white dark:text-black font-semibold"
                    : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.04]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? "text-orange-500 dark:text-orange-600" : "text-current"}`} />
                <span>{tab.label}</span>
                <span className={`hidden md:inline text-[10px] font-mono px-1 py-0.2 rounded ${
                  isCurrent ? "bg-slate-100 dark:bg-black/15 text-slate-800 dark:text-black" : "bg-black/5 dark:bg-white/5 text-slate-500 dark:text-neutral-500"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action & Filter Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          {/* Time Range Pills */}
          <div className="flex items-center bg-white/70 dark:bg-black/40 border border-slate-200 dark:border-white/[0.06] rounded-lg p-0.5 text-[11px] font-mono">
            {(["1h", "6h", "24h", "7d"] as const).map(r => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  timeRange === r 
                    ? "bg-slate-900 text-white dark:bg-white dark:text-black font-semibold" 
                    : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Live Stream Pulse Toggle */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
              isLive
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-200/50 dark:bg-white/5 border-transparent text-slate-400 dark:text-neutral-500"
            }`}
            title="Enable/Disable live stream"
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            <span className="hidden sm:inline">{isLive ? "LIVE STREAM" : "PAUSE"}</span>
          </button>

          {/* Strategic Export Dropdown (PDF & CSV) */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white shadow-xs transition-all cursor-pointer active:scale-95"
              title="Export strategic data and analytics"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Strategic Export</span>
              <span className="sm:hidden">Export</span>
            </button>

            {/* Dropdown Menu */}
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 p-2 rounded-xl bg-white dark:bg-[#111116] border border-slate-200 dark:border-white/[0.12] shadow-xl z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-neutral-500 border-b border-slate-100 dark:border-white/[0.06] mb-1.5 flex items-center justify-between">
                  <span>Strategic Formats</span>
                  {exportFeedback && (
                    <span className="text-orange-500 font-semibold flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> {exportFeedback}
                    </span>
                  )}
                </div>

                {/* PDF Option */}
                <button
                  onClick={handleExportPDF}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-left transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-md bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-neutral-200 flex items-center gap-1">
                      Executive PDF Report
                      <span className="text-[9px] font-mono px-1 rounded bg-red-500/10 text-red-500">A4 Pro</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-neutral-400">
                      KPIs, regional loads, CMMS & security
                    </div>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-white/[0.06]" />

                {/* CSV Options Header */}
                <div className="px-2 py-0.5 text-[9px] font-mono text-slate-400 dark:text-neutral-500">
                  RAW EXPORT (CSV / EXCEL)
                </div>

                {/* CSV 1: Edge Nodes */}
                <button
                  onClick={() => handleExportCSV("nodes")}
                  className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">Edge Nodes & Telemetry</span>
                  <span className="ml-auto text-[9px] font-mono text-slate-400">.csv</span>
                </button>

                {/* CSV 2: Work Orders */}
                <button
                  onClick={() => handleExportCSV("workOrders")}
                  className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                  <span className="truncate">Work Orders (CMMS)</span>
                  <span className="ml-auto text-[9px] font-mono text-slate-400">.csv</span>
                </button>

                {/* CSV 3: Telemetry Flux */}
                <button
                  onClick={() => handleExportCSV("telemetry")}
                  className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span className="truncate">24h Traffic History</span>
                  <span className="ml-auto text-[9px] font-mono text-slate-400">.csv</span>
                </button>

                {/* CSV 4: Security Events */}
                <button
                  onClick={() => handleExportCSV("security")}
                  className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span className="truncate">WAF & DDoS Events</span>
                  <span className="ml-auto text-[9px] font-mono text-slate-400">.csv</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* High-Density KPI Ribbon: 5 key pillars (Low margin, tight optical rhythm) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
        
        {/* KPI 1: Latence Anycast */}
        <div className="p-3 rounded-xl bg-white/80 dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.07] shadow-xs relative overflow-hidden group hover:border-orange-500/40 transition-colors">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              Edge Latency
            </span>
            <span className="text-[10px] font-mono text-emerald-500 font-semibold">-2.4ms</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              {avgLatency}
            </span>
            <span className="text-xs text-slate-400 dark:text-neutral-500 font-mono">ms (p95)</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-neutral-500 border-t border-slate-100 dark:border-white/[0.04] pt-1">
            <span>Anycast Route</span>
            <span className="text-emerald-500">100% SLA</span>
          </div>
        </div>

        {/* KPI 2: Débit Global */}
        <div className="p-3 rounded-xl bg-white/80 dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.07] shadow-xs relative overflow-hidden group hover:border-orange-500/40 transition-colors">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
              Ingestion Volume
            </span>
            <span className="text-[10px] font-mono text-orange-500 font-semibold">+14%</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              {(totalTraffic / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-400 dark:text-neutral-500 font-mono">req/s</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-neutral-500 border-t border-slate-100 dark:border-white/[0.04] pt-1">
            <span>Kafka Ingestion</span>
            <span className="text-slate-600 dark:text-neutral-300">0 ms lag</span>
          </div>
        </div>

        {/* KPI 3: Saturation Silicium */}
        <div className="p-3 rounded-xl bg-white/80 dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.07] shadow-xs relative overflow-hidden group hover:border-orange-500/40 transition-colors">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              Fleet CPU Load
            </span>
            <span className="text-[10px] font-mono text-blue-500 font-semibold">{avgCpu}%</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              {activeNodes.length}
            </span>
            <span className="text-xs text-slate-400 dark:text-neutral-500 font-mono">/ {nodes.length} Nodes</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-neutral-500 border-t border-slate-100 dark:border-white/[0.04] pt-1">
            <span>RAM {avgRam}%</span>
            <span className="text-emerald-500">Thermal 41°C</span>
          </div>
        </div>

        {/* KPI 4: Efficacité PUE (Bâtiments) */}
        <div className="p-3 rounded-xl bg-white/80 dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.07] shadow-xs relative overflow-hidden group hover:border-orange-500/40 transition-colors">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Energy PUE Ratio
            </span>
            <span className="text-[10px] font-mono text-emerald-500 font-semibold">Tier IV</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              {avgPue}
            </span>
            <span className="text-xs text-slate-400 dark:text-neutral-500 font-mono">PUE DC</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-neutral-500 border-t border-slate-100 dark:border-white/[0.04] pt-1">
            <span>Target &lt; 1.15</span>
            <span className="text-emerald-500">Optimal</span>
          </div>
        </div>

        {/* KPI 5: Posture Zero-Trust */}
        <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-white/80 dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.07] shadow-xs relative overflow-hidden group hover:border-orange-500/40 transition-colors">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
              ZTNA Index
            </span>
            <span className="text-[10px] font-mono text-purple-500 font-semibold">FIPS 140-3</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              99.8%
            </span>
            <span className="text-xs text-slate-400 dark:text-neutral-500 font-mono">secure</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-neutral-500 border-t border-slate-100 dark:border-white/[0.04] pt-1">
            <span>0 Vulnerabilities</span>
            <span className="text-emerald-500">mTLS Active</span>
          </div>
        </div>

      </div>

      {/* Main Tabbed Content Area */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: OVERVIEW / COCKPIT EXÉCUTIF */}
        {activeTab === "overview" && (
          <motion.div
            key="tab-overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 sm:space-y-3.5"
          >
            {/* Primary Grid: Chart.js Multi-Axis Stream & Fleet Doughnut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              
              {/* Main Chart.js Telemetry (Col 2/3) */}
              <div className="lg:col-span-2 p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.07] shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                      Global Real-Time Telemetry (Chart.js Engine)
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      Convergence of Requests, Silicon Load & Latency
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="flex items-center gap-1 text-slate-600 dark:text-neutral-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                      Requests
                    </span>
                    <span className="flex items-center gap-1 text-slate-600 dark:text-neutral-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                      CPU
                    </span>
                    <span className="flex items-center gap-1 text-slate-600 dark:text-neutral-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      Latency
                    </span>
                  </div>
                </div>

                {/* Chart.js Canvas */}
                <div className="h-56 sm:h-64 w-full">
                  <Line
                    data={multiAxisTelemetryData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: { duration: 400 },
                      interaction: { mode: "index", intersect: false },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: themeColors.tooltipBg,
                          borderColor: themeColors.tooltipBorder,
                          borderWidth: 1,
                          padding: 10,
                          titleFont: { size: 11, family: "monospace" },
                          bodyFont: { size: 11, family: "monospace" },
                          titleColor: isDark ? "#fff" : "#0f172a",
                          bodyColor: isDark ? "#d4d4d8" : "#334155",
                        }
                      },
                      scales: {
                        x: {
                          grid: { color: themeColors.gridColor },
                          ticks: { color: themeColors.textColor, font: { size: 10 } }
                        },
                        yReq: {
                          type: "linear",
                          position: "left",
                          grid: { color: themeColors.gridColor },
                          ticks: {
                            color: "#f97316",
                            font: { size: 10 },
                            callback: (v) => `${Number(v) / 1000}k`
                          }
                        },
                        yPct: {
                          type: "linear",
                          position: "right",
                          grid: { drawOnChartArea: false },
                          min: 0,
                          max: 100,
                          ticks: {
                            color: "#3b82f6",
                            font: { size: 10 },
                            callback: (v) => `${v}%`
                          }
                        },
                        yMs: {
                          display: false,
                          min: 0,
                          max: 60
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Cluster Saturation Doughnut (Col 1/3) */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.07] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-neutral-500 mb-0.5">
                    System Capacity
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                    <HardDrive className="w-4 h-4 text-orange-500" />
                    Silicon Resource Allocation
                  </h3>

                  <div className="h-44 w-full relative flex items-center justify-center my-1">
                    <Doughnut
                      data={clusterResourceDoughnutData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: "74%",
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: themeColors.tooltipBg,
                            borderColor: themeColors.tooltipBorder,
                            borderWidth: 1,
                            titleColor: isDark ? "#fff" : "#0f172a",
                            bodyColor: isDark ? "#d4d4d8" : "#334155",
                          }
                        }
                      }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">76%</span>
                      <span className="text-[9px] font-mono uppercase text-slate-400 dark:text-neutral-500">Engaged</span>
                    </div>
                  </div>
                </div>

                {/* Compact Legend & Progress Bars */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/[0.04] text-[11px] font-mono">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-slate-600 dark:text-neutral-400">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      Active Allocated
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">58%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-slate-600 dark:text-neutral-400">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      ZTNA Reserved
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">18%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-slate-600 dark:text-neutral-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Edge Cache
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">14%</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Secondary Row: Regional Load Bar Chart + Live Node Ticker */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              
              {/* Regional Bar Chart (Col 2/3) */}
              <div className="lg:col-span-2 p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.07] shadow-xs">
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                      Geographical Distribution
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-orange-500" />
                      Silicon Load by Regional Node (CPU vs RAM)
                    </h3>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20">
                    6 Active POPs
                  </span>
                </div>

                <div className="h-44 sm:h-52 w-full">
                  <Bar
                    data={regionalNodeBarData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                          align: "end",
                          labels: {
                            boxWidth: 8,
                            boxHeight: 8,
                            color: themeColors.textColor,
                            font: { size: 10, family: "monospace" }
                          }
                        },
                        tooltip: {
                          backgroundColor: themeColors.tooltipBg,
                          borderColor: themeColors.tooltipBorder,
                          borderWidth: 1,
                        }
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { color: themeColors.textColor, font: { size: 10 } }
                        },
                        y: {
                          grid: { color: themeColors.gridColor },
                          max: 100,
                          ticks: {
                            color: themeColors.textColor,
                            font: { size: 10 },
                            callback: (v) => `${v}%`
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Edge Node Live Health List (Col 1/3) */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.07] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-orange-500" />
                      Strategic Nodes
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      100% UPTIME
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {nodes.slice(0, 5).map(node => (
                      <div
                        key={node.id}
                        onClick={() => onSelectNode && onSelectNode(node)}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.04] flex items-center justify-between cursor-pointer transition-colors text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-mono font-medium text-slate-900 dark:text-white truncate">
                            {node.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-neutral-400">
                            {node.location} • {node.ip || "192.168.1.1"}
                          </div>
                        </div>

                        <div className="text-right font-mono flex-shrink-0">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                            (node.latency || 15) < 20 
                              ? "bg-emerald-500/10 text-emerald-500" 
                              : "bg-amber-500/10 text-amber-500"
                          }`}>
                            {node.latency || 12}ms
                          </span>
                          <div className="text-[9px] text-slate-400 dark:text-neutral-500 mt-0.5">
                            CPU {node.cpuUsage || 42}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("compute")}
                  className="w-full mt-2 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-[11px] font-medium text-slate-700 dark:text-neutral-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Explore all compute nodes</span>
                  <ChevronRight className="w-3 h-3 text-orange-500" />
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: COMPUTE & SILICIUM */}
        {activeTab === "compute" && (
          <motion.div
            key="tab-compute"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 sm:space-y-3.5"
          >
            {/* Top Row: Detailed Node Grid with Compact Telemetry */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.07] shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                    Hardware Infrastructure & V8 Isolates
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-orange-500" />
                    Server Racks & Edge Accelerator Cards
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-300">
                    {nodes.length} Monitored Nodes
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold">
                    100% Operational
                  </span>
                </div>
              </div>

              {/* Node Cards Grid: 3 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {nodes.map(node => (
                  <div
                    key={node.id}
                    onClick={() => onSelectNode && onSelectNode(node)}
                    className="p-3 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.05] hover:border-orange-500/30 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          <Server className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {node.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-neutral-400">
                            {node.location}
                          </div>
                        </div>
                      </div>

                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        ACTIVE
                      </span>
                    </div>

                    {/* Bars for CPU and RAM */}
                    <div className="space-y-1.5 text-[10px] font-mono">
                      <div>
                        <div className="flex justify-between text-slate-500 dark:text-neutral-400 mb-0.5">
                          <span>CPU Load</span>
                          <span className="text-slate-900 dark:text-white font-semibold">{node.cpuUsage || 42}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.06] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (node.cpuUsage || 42) > 80 ? "bg-red-500" : (node.cpuUsage || 42) > 60 ? "bg-amber-500" : "bg-orange-500"
                            }`}
                            style={{ width: `${node.cpuUsage || 42}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-500 dark:text-neutral-400 mb-0.5">
                          <span>RAM Usage</span>
                          <span className="text-slate-900 dark:text-white font-semibold">{node.ramUsage || 56}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${node.ramUsage || 56}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-white/[0.04] text-[10px] font-mono text-slate-400 dark:text-neutral-500">
                      <span>Latency: <strong className="text-slate-700 dark:text-neutral-300">{node.latency || 14}ms</strong></span>
                      <span>PUE: <strong className="text-emerald-500">{node.pue || 1.14}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Chart.js bar for Regional compute load */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.07] shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                <BarChart3 className="w-4 h-4 text-orange-500" />
                V8 Isolates Allocation Matrix and Silicon Threading
              </h3>
              <div className="h-44 sm:h-52 w-full">
                <Bar
                  data={regionalNodeBarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { labels: { color: themeColors.textColor, font: { size: 10, family: "monospace" } } }
                    },
                    scales: {
                      x: { ticks: { color: themeColors.textColor, font: { size: 10 } } },
                      y: { grid: { color: themeColors.gridColor }, ticks: { color: themeColors.textColor, font: { size: 10 } } }
                    }
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: NETWORK & ANYCAST */}
        {activeTab === "network" && (
          <motion.div
            key="tab-network"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 sm:space-y-3.5"
          >
            {/* Network Overview Card */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.07] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                    Planetary BGP Anycast Routing
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-orange-500" />
                    Transit Throughput & Latency by Point of Presence
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold">
                    Tier-1 Transit OK
                  </span>
                </div>
              </div>

              <div className="h-56 sm:h-64 w-full">
                <Line
                  data={multiAxisTelemetryData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { labels: { color: themeColors.textColor, font: { size: 10, family: "monospace" } } },
                      tooltip: { backgroundColor: themeColors.tooltipBg, borderColor: themeColors.tooltipBorder, borderWidth: 1 }
                    },
                    scales: {
                      x: { grid: { color: themeColors.gridColor }, ticks: { color: themeColors.textColor, font: { size: 10 } } },
                      yReq: { grid: { color: themeColors.gridColor }, ticks: { color: "#f97316", font: { size: 10 } } },
                      yPct: { display: false },
                      yMs: { position: "right", ticks: { color: "#10b981", font: { size: 10 } } }
                    }
                  }}
                />
              </div>
            </div>

            {/* Network Nodes Table (Compact interval management) */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.07] shadow-xs">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Routing Table & Anycast Latency
                </h3>
                <span className="text-[11px] font-mono text-slate-500">Update: instant</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-slate-200 dark:border-white/[0.06] text-slate-400 dark:text-neutral-500 uppercase text-[10px]">
                    <tr>
                      <th className="pb-2">Point of Presence</th>
                      <th className="pb-2">AS Number</th>
                      <th className="pb-2">RTT Latency</th>
                      <th className="pb-2">Packet Loss</th>
                      <th className="pb-2 text-right">BGP Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                    {[
                      { name: "Paris POP (TH2)", as: "AS13335", rtt: "8.4 ms", loss: "0.00%", status: "Announced" },
                      { name: "Frankfurt (Equinix FR5)", as: "AS13335", rtt: "12.1 ms", loss: "0.00%", status: "Announced" },
                      { name: "Lyon (West DC)", as: "AS13335", rtt: "10.8 ms", loss: "0.00%", status: "Announced" },
                      { name: "Marseille Subsea (MRS3)", as: "AS13335", rtt: "14.6 ms", loss: "0.00%", status: "Announced" },
                      { name: "London Docklands (Telehouse)", as: "AS13335", rtt: "16.2 ms", loss: "0.00%", status: "Announced" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/[0.02]">
                        <td className="py-2 text-slate-900 dark:text-white font-medium">{row.name}</td>
                        <td className="py-2 text-slate-500 dark:text-neutral-400">{row.as}</td>
                        <td className="py-2 text-emerald-500 font-semibold">{row.rtt}</td>
                        <td className="py-2 text-slate-600 dark:text-neutral-300">{row.loss}</td>
                        <td className="py-2 text-right">
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-500 font-semibold">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: CAFM, BÂTIMENTS & ÉNERGIE */}
        {activeTab === "cafm" && (
          <motion.div
            key="tab-cafm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 sm:space-y-3.5"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              
              {/* PUE & Cooling Chart.js Line (Col 2/3) */}
              <div className="lg:col-span-2 p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.07] shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                      Building Management System (BMS) & Datacenter
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-500" />
                      PUE Trajectory & HVAC Power Consumption (Chart.js)
                    </h3>
                  </div>

                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                    Average: {avgPue}
                  </span>
                </div>

                <div className="h-52 sm:h-60 w-full">
                  <Line
                    data={energyPueData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { labels: { color: themeColors.textColor, font: { size: 10, family: "monospace" } } },
                        tooltip: { backgroundColor: themeColors.tooltipBg, borderColor: themeColors.tooltipBorder, borderWidth: 1 }
                      },
                      scales: {
                        x: { grid: { color: themeColors.gridColor }, ticks: { color: themeColors.textColor, font: { size: 10 } } },
                        yPue: {
                          type: "linear",
                          position: "left",
                          min: 1.05,
                          max: 1.25,
                          grid: { color: themeColors.gridColor },
                          ticks: { color: "#10b981", font: { size: 10 } }
                        },
                        yPower: {
                          type: "linear",
                          position: "right",
                          grid: { drawOnChartArea: false },
                          ticks: { color: "#f97316", font: { size: 10 }, callback: (v) => `${v} kW` }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Maintenance & GMAO Orders (Col 1/3) */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.07] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-orange-500" />
                      CAFM Work Orders
                    </h3>
                    <span className="text-[10px] font-mono text-orange-500 font-semibold">4 In Progress</span>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { id: "WO-8921", site: "Paris TH2", task: "HVAC Filter Calibration", prio: "P1", status: "In progress" },
                      { id: "WO-8922", site: "Lyon Tech", task: "UPS Rack B4 Inverter", prio: "P2", status: "Scheduled" },
                      { id: "WO-8923", site: "Marseille", task: "Hygrometry Probe", prio: "P3", status: "Completed" },
                    ].map(wo => (
                      <div key={wo.id} className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] text-xs">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-mono font-semibold text-slate-900 dark:text-white">{wo.id}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                            wo.prio === "P1" ? "bg-red-500/10 text-red-500 font-bold" : "bg-blue-500/10 text-blue-500"
                          }`}>
                            {wo.prio}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-neutral-300">{wo.task}</div>
                        <div className="flex justify-between text-[10px] text-slate-400 dark:text-neutral-500 mt-1">
                          <span>{wo.site}</span>
                          <span className={wo.status === "Completed" ? "text-emerald-500" : "text-amber-500"}>{wo.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToTab && onNavigateToTab("ov-floorplan")}
                  className="w-full mt-2 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-[11px] font-medium text-slate-700 dark:text-neutral-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-orange-500" />
                  <span>Open 2D Facility Floor Plan</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 5: CYBERSÉCURITÉ & ZERO-TRUST */}
        {activeTab === "security" && (
          <motion.div
            key="tab-security"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 sm:space-y-3.5"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              
              {/* Radar Chart: Zero-Trust Vector (Col 1/2) */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.07] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                      Cybersecurity Posture Radar
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-500" />
                      Zero-Trust Maturity (ZTNA 6 Axes)
                    </h3>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 font-semibold">
                    Score: 94.8 / 100
                  </span>
                </div>

                <div className="h-56 sm:h-64 w-full flex items-center justify-center">
                  <Radar
                    data={securityRadarData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { color: themeColors.textColor, font: { size: 10, family: "monospace" } }
                        }
                      },
                      scales: {
                        r: {
                          angleLines: { color: themeColors.gridColor },
                          grid: { color: themeColors.gridColor },
                          pointLabels: { color: themeColors.textColor, font: { size: 9, family: "monospace" } },
                          suggestedMin: 50,
                          suggestedMax: 100,
                          ticks: { display: false }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Stacked Bar Chart: WAF Threats Blocked (Col 2/2) */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-[#0c0c10] border border-slate-200/80 dark:border-white/[0.07] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                      Edge WAF Filtering & Mitigation
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      Attacks Neutralized by Category
                    </h3>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-500 font-semibold">
                    6,840 Blocked
                  </span>
                </div>

                <div className="h-56 sm:h-64 w-full">
                  <Bar
                    data={wafThreatBarData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { color: themeColors.textColor, font: { size: 10, family: "monospace" } }
                        }
                      },
                      scales: {
                        x: { ticks: { color: themeColors.textColor, font: { size: 9 } } },
                        y: { grid: { color: themeColors.gridColor }, ticks: { color: themeColors.textColor, font: { size: 10 } } }
                      }
                    }}
                  />
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
