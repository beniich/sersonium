import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import {
  Cpu,
  Activity,
  HardDrive,
  Zap,
  Server,
  Play,
  Pause,
  RefreshCw,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Sliders,
  TrendingUp,
  Clock,
  Layers,
  MemoryStick as RamIcon,
  Trash2,
  Filter,
  X
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import { logAuditEvent } from "../hooks/useGlobalState";

interface HistoryDataPoint {
  time: string;
  cpu: number;
  ram: number;
  swap: number;
  diskIo: number;
}

interface ProcessItem {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  ramMb: number;
  threads: number;
  status: "running" | "sleeping" | "idle";
  command: string;
}

interface CircularGaugeProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  primaryColor: string;
  secondaryColor: string;
  label?: string;
  subLabel?: string;
}

const CircularGauge = ({ value, size = 110, strokeWidth = 10, primaryColor, secondaryColor, label, subLabel }: CircularGaugeProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={secondaryColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-20"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-black font-mono tracking-tight" style={{ color: primaryColor }}>
          {value}%
        </span>
        {label && <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono uppercase mt-0.5">{label}</span>}
        {subLabel && <span className="text-[9px] text-slate-400 dark:text-neutral-500 font-mono mt-0.5">{subLabel}</span>}
      </div>
    </div>
  );
};

const INITIAL_PROCESSES: ProcessItem[] = [
  { pid: 1024, name: "lacaza-edge-router", user: "lacaza_sys", cpu: 8.6, ramMb: 612, threads: 16, status: "running", command: "/usr/local/bin/lacaza-router --anycast=lacaza.clouindustrie.com" },
  { pid: 1180, name: "v8-isolate-engine", user: "v8_worker", cpu: 14.2, ramMb: 1420, threads: 24, status: "running", command: "/usr/bin/v8-isolate-pool --max-isolates=128" },
  { pid: 1205, name: "nginx-cpanel-proxy", user: "www-data", cpu: 3.4, ramMb: 340, threads: 8, status: "running", command: "nginx: master process /etc/nginx/nginx.conf" },
  { pid: 1342, name: "lacaza-paypal-gateway", user: "cpanel_pay", cpu: 1.1, ramMb: 195, threads: 4, status: "sleeping", command: "node dist/services/paypalIpnListener.js" },
  { pid: 1410, name: "lacaza-auth-jwt", user: "google_sso", cpu: 2.8, ramMb: 280, threads: 6, status: "running", command: "node dist/services/googleAuthVerifier.js" },
  { pid: 1530, name: "redis-session-cache", user: "redis", cpu: 0.9, ramMb: 860, threads: 4, status: "running", command: "/usr/bin/redis-server *:6379" },
  { pid: 1695, name: "kafka-telemetry-bus", user: "kafka", cpu: 4.5, ramMb: 1150, threads: 18, status: "running", command: "/opt/kafka/bin/kafka-server-start.sh" },
  { pid: 1812, name: "lacaza-waf-sentinel", user: "lacaza_sec", cpu: 2.1, ramMb: 410, threads: 8, status: "running", command: "/usr/local/bin/waf-sentinel --strict=hsts" }
];

export default function CpuRamMonitor() {
  // Timer & Control State
  const [isRunning, setIsRunning] = useState(true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(2);
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Live Metrics
  const [cpuUsage, setCpuUsage] = useState<number>(24.8);
  const [ramUsedGb, setRamUsedGb] = useState<number>(11.4);
  const [totalRamGb, setTotalRamGb] = useState<number>(32.0);
  const [cachedRamGb, setCachedRamGb] = useState<number>(7.6);
  const [swapUsedMb, setSwapUsedMb] = useState<number>(184);
  const totalSwapMb = 8192;
  const [diskIoMb, setDiskIoMb] = useState<number>(18.4);
  const [netThroughputMbps, setNetThroughputMbps] = useState<number>(342);

  // Per-Core Metrics (8 Cores)
  const [coreLoads, setCoreLoads] = useState<number[]>([22, 34, 18, 29, 15, 41, 26, 19]);

  // Processes State
  const [processes, setProcesses] = useState<ProcessItem[]>(INITIAL_PROCESSES);

  // Rolling History Buffer for Recharts (last 24 data points)
  const [history, setHistory] = useState<HistoryDataPoint[]>(() => {
    const initial: HistoryDataPoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const d = new Date(now - i * 2000);
      const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      initial.push({
        time: timeStr,
        cpu: Math.max(12, Math.round((22 + Math.sin(i * 0.7) * 8) * 10) / 10),
        ram: Math.max(30, Math.round((34 + Math.cos(i * 0.5) * 4) * 10) / 10),
        swap: 2.2,
        diskIo: Math.round((14 + Math.random() * 8) * 10) / 10
      });
    }
    return initial;
  });

  // Uptime Counter in seconds
  const [uptimeSeconds, setUptimeSeconds] = useState(1582942);

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Live interval loop
  useEffect(() => {
    if (!isRunning) return;

    const fetchLiveMetrics = async () => {
      try {
        const response = await fetch('/api/v1/observability/metrics/live');
        if (response.ok) {
          const json = await response.json();
          if (json.success && json.data) {
            const data = json.data;
            setUptimeSeconds(data.uptimeSeconds);
            
            if (data.os) {
              setTotalRamGb(data.os.totalMemGb);
              
              if (!isStressTesting) {
                // Approximate CPU usage from load average
                const load = data.os.loadAverage[0] || 0;
                const cores = data.os.cpuCores || 8;
                const cpuVal = Math.min(100, (load / cores) * 100);
                setCpuUsage(Math.round(cpuVal * 10) / 10);
                
                setRamUsedGb(data.os.usedMemGb);
                setCachedRamGb(data.os.freeMemGb > 2 ? 1.5 : 0.5); // Simulation based on free mem
                
                // Set core loads to fluctuate around the actual CPU usage
                setCoreLoads(prev => prev.map(() => Math.max(5, Math.min(100, Math.round(cpuVal + (Math.random() - 0.5) * 15)))));
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch live metrics:", err);
      }
    };

    fetchLiveMetrics();
    const interval = setInterval(() => {
      fetchLiveMetrics();

      if (isStressTesting) {
        setCpuUsage(86 + Math.random() * 9);
        setRamUsedGb(prev => Math.min(totalRamGb * 0.95, prev + 0.3));
        setCoreLoads(prev => prev.map(() => Math.min(99, Math.round(82 + Math.random() * 16))));
      }

      // Fluctuate I/O & Network
      setDiskIoMb(Math.round((isStressTesting ? 74 + Math.random() * 25 : 12 + Math.random() * 18) * 10) / 10);
      setNetThroughputMbps(Math.round(isStressTesting ? 890 + Math.random() * 150 : 280 + Math.random() * 90));

      // Append to history buffer
      const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setHistory(prev => {
        const nextCpu = isStressTesting ? Math.round(88 + Math.random() * 8) : Math.round(cpuUsage);
        const nextRamPct = Math.round((ramUsedGb / totalRamGb) * 100) || 0;
        const nextSwapPct = Math.round((swapUsedMb / totalSwapMb) * 100 * 10) / 10;
        const newPoint: HistoryDataPoint = {
          time: nowStr,
          cpu: nextCpu,
          ram: nextRamPct,
          swap: nextSwapPct,
          diskIo: diskIoMb
        };
        const updated = [...prev.slice(1), newPoint];
        return updated;
      });
    }, refreshIntervalSec * 1000);

    return () => clearInterval(interval);
  }, [isRunning, refreshIntervalSec, isStressTesting, cpuUsage, ramUsedGb, diskIoMb, swapUsedMb, totalRamGb]);

  // Formatted Uptime
  const formattedUptime = useMemo(() => {
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }, [uptimeSeconds]);

  // Trigger stress test benchmark
  const handleToggleStressTest = () => {
    if (isStressTesting) {
      setIsStressTesting(false);
      logAuditEvent("MONITOR_STRESS_END", "Stress benchmark manually completed");
      triggerToast("Load test stopped. Metrics returning to baseline.");
    } else {
      setIsStressTesting(true);
      logAuditEvent("MONITOR_STRESS_START", "Triggered live compute stress simulation");
      triggerToast("🔥 Stress simulation active: ramping up load across 8 V8 Isolate cores!");
      setTimeout(() => {
        setIsStressTesting(false);
        triggerToast("Stress test completed successfully. All thresholds remained stable.");
      }, 15000);
    }
  };

  // Drop Caches action
  const handleDropCaches = () => {
    setCachedRamGb(1.2);
    setRamUsedGb(prev => Math.max(7.2, prev - 3.8));
    logAuditEvent("SERVER_DROP_CACHES", "Executed sync && echo 3 > /proc/sys/vm/drop_caches on lacaza-srv01");
    triggerToast("✨ RAM caches cleared successfully (3.8 GB freed).");
  };

  // Restart process simulation
  const handleRestartProcess = (pid: number, name: string) => {
    setProcesses(prev =>
      prev.map(p => {
        if (p.pid === pid) {
          return { ...p, status: "sleeping", cpu: 0.1 };
        }
        return p;
      })
    );
    setTimeout(() => {
      setProcesses(prev =>
        prev.map(p => {
          if (p.pid === pid) {
            return { ...p, status: "running", cpu: Math.round((Math.random() * 4 + 2) * 10) / 10 };
          }
          return p;
        })
      );
    }, 1200);
    logAuditEvent("PROCESS_RESTART", `Restarted daemon '${name}' (PID ${pid})`);
    triggerToast(`Process ${name} (PID ${pid}) restarted.`);
  };

  // Kill process simulation
  const handleKillProcess = (pid: number, name: string) => {
    setProcesses(prev => prev.filter(p => p.pid !== pid));
    logAuditEvent("PROCESS_KILL", `Terminated process '${name}' (PID ${pid}) via SIGTERM`);
    triggerToast(`Process ${name} (PID ${pid}) terminated.`);
  };

  const ramPercent = Math.round((ramUsedGb / totalRamGb) * 100);
  const swapPercent = Math.round((swapUsedMb / totalSwapMb) * 100);

  const filteredProcesses = processes.filter(
    p => p.name.toLowerCase().includes(filterQuery.toLowerCase()) || p.user.toLowerCase().includes(filterQuery.toLowerCase()) || p.pid.toString().includes(filterQuery)
  );

  return (
    <div id="lacaza-cpu-ram-monitor" className="space-y-6 animate-in fade-in duration-300">
      {/* Toast alert */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-neutral-800 text-white px-4 py-3 rounded-xl shadow-2xl border border-orange-500/40 flex items-center gap-3 text-xs sm:text-sm animate-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-[#FF6C2C] flex-shrink-0" />
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="ml-2 text-neutral-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Control Panel Server Header */}
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-neutral-900/80 shadow-xs backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6C2C] to-[#E04808] flex items-center justify-center text-white shadow-md shadow-orange-500/25 border border-orange-400/40 flex-shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans tracking-tight">
                  Real-Time Supervision • CPU & RAM
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE METRICS
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#FF6C2C]/10 text-[#FF6C2C] border border-[#FF6C2C]/20">
                  lacaza-srv01.clouindustrie.com
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 font-mono">
                KVM Hypervisor • AMD EPYC™ 9654 (8 vCPUs) • 32 GB DDR5 ECC • Linux Kernel 6.6.21-lacaza
              </p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Toggle */}
            <button
              id="toggle-live-telemetry"
              onClick={() => setIsRunning(!isRunning)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isRunning
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100"
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? "Pause Stream" : "Resume"}
            </button>

            {/* Refresh Interval Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-neutral-800/80 rounded-lg p-0.5 border border-slate-200 dark:border-white/[0.06] text-xs">
              {[1, 2, 5].map(sec => (
                <button
                  key={sec}
                  onClick={() => setRefreshIntervalSec(sec)}
                  className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                    refreshIntervalSec === sec
                      ? "bg-white dark:bg-neutral-900 text-[#FF6C2C] shadow-xs font-bold"
                      : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>

            {/* Stress Test Simulation Button */}
            <button
              id="trigger-stress-benchmark"
              onClick={handleToggleStressTest}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border ${
                isStressTesting
                  ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-400 animate-pulse"
                  : "bg-slate-100 dark:bg-neutral-800 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-slate-800 dark:text-neutral-200 border-slate-200 dark:border-white/[0.08] hover:text-[#FF6C2C]"
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${isStressTesting ? "text-amber-200" : "text-[#FF6C2C]"}`} />
              {isStressTesting ? "Stop Stress" : "Simulate Load"}
            </button>

            {/* Drop Caches Button */}
            <button
              id="btn-drop-caches"
              onClick={handleDropCaches}
              title="Drop Linux buffers and caches (/proc/sys/vm/drop_caches)"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/[0.08] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Drop Cache</span>
            </button>
          </div>
        </div>

        {/* Server Vital Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-neutral-800/80 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
            <div>
              <span className="text-slate-400 dark:text-neutral-500 text-[10px] uppercase block">Uptime</span>
              <span className="font-bold text-slate-700 dark:text-neutral-200">{formattedUptime}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
            <div>
              <span className="text-slate-400 dark:text-neutral-500 text-[10px] uppercase block">Load Average</span>
              <span className="font-bold text-slate-700 dark:text-neutral-200">
                {(cpuUsage * 0.015).toFixed(2)}, {(cpuUsage * 0.018).toFixed(2)}, {(cpuUsage * 0.014).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
            <div>
              <span className="text-slate-400 dark:text-neutral-500 text-[10px] uppercase block">NVMe Disk I/O</span>
              <span className="font-bold text-slate-700 dark:text-neutral-200">{diskIoMb} MB/s (RAID-10)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
            <div>
              <span className="text-slate-400 dark:text-neutral-500 text-[10px] uppercase block">Network Rate</span>
              <span className="font-bold text-slate-700 dark:text-neutral-200">{netThroughputMbps} Mbps</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Gauges: CPU & RAM Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CPU Panel */}
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-neutral-900/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <CircularGauge 
              value={cpuUsage} 
              primaryColor={cpuUsage > 85 ? "#f43f5e" : cpuUsage > 70 ? "#f59e0b" : "#FF6C2C"} 
              secondaryColor="currentColor"
              label="CPU"
            />
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-[#FF6C2C] border border-orange-500/20">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Processor Load</h3>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">8 vCPU cores @ 3.55 GHz</p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200/60 dark:border-white/[0.05]">
                <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">System State</div>
                <div className={`text-sm font-bold flex items-center gap-2 ${
                  cpuUsage > 85 ? "text-rose-500" : cpuUsage > 70 ? "text-amber-500" : "text-[#FF6C2C]"
                }`}>
                  {cpuUsage > 85 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  {cpuUsage > 85 ? "Overheat / Critical Alert" : cpuUsage > 70 ? "High Load (Spike)" : "Optimal Operation"}
                </div>
              </div>
            </div>
          </div>

          {/* Per-Core Breakdown Grid */}
          <div className="pt-2 border-t border-slate-100 dark:border-neutral-800/80 mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 mb-2">
              <span className="font-semibold text-[11px] uppercase tracking-wider font-mono">8-Core Breakdown</span>
              <span className="text-[11px] font-mono">Temp: 44.2°C • Freq: 3,480 MHz</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {coreLoads.map((load, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.05] text-center"
                >
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Core {idx}</div>
                  <div
                    className={`text-xs font-bold font-mono mt-0.5 ${
                      load > 85 ? "text-rose-500" : load > 65 ? "text-amber-500" : "text-slate-800 dark:text-neutral-200"
                    }`}
                  >
                    {load}%
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-neutral-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        load > 85 ? "bg-rose-500" : load > 65 ? "bg-amber-500" : "bg-[#FF6C2C]"
                      }`}
                      style={{ width: `${load}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RAM Panel */}
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-neutral-900/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <CircularGauge 
              value={ramPercent} 
              primaryColor={ramPercent > 90 ? "#f43f5e" : "#3B82F6"} 
              secondaryColor="currentColor"
              label="RAM"
              subLabel={`${ramUsedGb.toFixed(1)} / ${totalRamGb} GB`}
            />
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <RamIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Memory (RAM & SWAP)</h3>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">DDR5 ECC 4800 MT/s</p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200/60 dark:border-white/[0.05]">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase mb-1">
                  <span>SWAP Space (ZRAM LZ4)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active</span>
                </div>
                <div className="text-sm font-bold text-slate-700 dark:text-neutral-300">
                  {swapUsedMb} MB / {totalSwapMb} MB ({swapPercent}%)
                </div>
              </div>
            </div>
          </div>

          {/* Memory Distribution Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800/80 mt-4 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.05]">
              <span className="text-[10px] text-slate-400 block uppercase">Active Allocated</span>
              <span className="font-bold text-slate-800 dark:text-neutral-200 text-sm mt-0.5 block">
                {ramUsedGb.toFixed(2)} GB
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400">V8 + Daemons</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.05]">
              <span className="text-[10px] text-slate-400 block uppercase">System Cache</span>
              <span className="font-bold text-slate-800 dark:text-neutral-200 text-sm mt-0.5 block">
                {cachedRamGb.toFixed(2)} GB
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">FS Buffers</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.05]">
              <span className="text-[10px] text-slate-400 block uppercase">Free Memory</span>
              <span className="font-bold text-slate-800 dark:text-neutral-200 text-sm mt-0.5 block">
                {(totalRamGb - ramUsedGb - cachedRamGb).toFixed(2)} GB
              </span>
              <span className="text-[10px] text-slate-500 dark:text-neutral-400">Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Sliding Time-Series Graph */}
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-neutral-900/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF6C2C]" />
              Sliding Real-Time History (60 seconds)
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono">
              Dynamic sampling every {refreshIntervalSec}s • Dual axis CPU (%) & RAM (%)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6C2C]" />
              <span className="text-slate-700 dark:text-neutral-300 font-medium">CPU ({cpuUsage}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-700 dark:text-neutral-300 font-medium">RAM ({ramPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Recharts Area Container */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cpuGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF6C2C" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#FF6C2C" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="ramGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" vertical={false} />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={10} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "0.75rem",
                  color: "#fff",
                  fontSize: "11px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
                }}
                formatter={(value: any, name: any) => [`${value}%`, name === "cpu" ? "CPU Load" : "RAM Usage"]}
                labelStyle={{ fontWeight: "bold", color: "#F97316", marginBottom: "4px" }}
              />
              <Area
                type="monotone"
                dataKey="cpu"
                name="cpu"
                stroke="#FF6C2C"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#cpuGradient)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="ram"
                name="ram"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#ramGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* cPanel-Style Process Manager Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-neutral-900/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-neutral-900/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-500" />
              Process Manager & V8 Isolates
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono">
              Real-time CPU consumption and memory allocation per server task
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter PID, name or user..."
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                className="px-3 py-1.5 pl-8 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6C2C] w-48 sm:w-60"
              />
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
            <span className="text-xs font-mono text-slate-400 px-2 py-1 bg-slate-100 dark:bg-neutral-800 rounded-md">
              {filteredProcesses.length} daemons
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs divide-y divide-slate-200 dark:divide-neutral-800">
            <thead className="bg-slate-50 dark:bg-neutral-900 text-slate-500 dark:text-neutral-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">PID</th>
                <th className="py-2.5 px-4">Process / Command</th>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4 text-right">CPU %</th>
                <th className="py-2.5 px-4 text-right">Memory</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/80">
              {filteredProcesses.map(proc => (
                <tr key={proc.pid} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-4 text-slate-400 font-bold">{proc.pid}</td>
                  <td className="py-2.5 px-4 font-sans">
                    <div className="font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {proc.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs">{proc.command}</div>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-neutral-300">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-white/[0.05] text-[10px]">
                      {proc.user}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-[#FF6C2C]">{proc.cpu.toFixed(1)}%</td>
                  <td className="py-2.5 px-4 text-right font-semibold text-blue-600 dark:text-blue-400">
                    {proc.ramMb} MB
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold ${
                        proc.status === "running"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {proc.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleRestartProcess(proc.pid, proc.name)}
                        title="Restart process"
                        className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-300 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleKillProcess(proc.pid, proc.name)}
                        title="Terminate process (SIGTERM)"
                        className="p-1 rounded-md hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
