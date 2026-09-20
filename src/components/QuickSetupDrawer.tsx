import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  SlidersHorizontal,
  X,
  Zap,
  Cpu,
  Terminal,
  Globe,
  Shield,
  Activity,
  Server,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Power,
  Layers,
  Gauge,
  Info
} from "lucide-react";

export interface TelemetryServiceItem {
  id: string;
  name: string;
  category: "compute" | "ai" | "network" | "security" | "infra";
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  frequency: string;
  bandwidthUsage: string;
  color: string;
  badge?: string;
}

const DEFAULT_TELEMETRY_SERVICES: TelemetryServiceItem[] = [
  {
    id: "silicium_x1",
    name: "Silicon X1 Telemetry",
    category: "compute",
    description: "Real-time monitoring of clock frequencies, NPU/CPU load and thermal envelope.",
    icon: Cpu,
    enabled: true,
    frequency: "50 ms (20 Hz)",
    bandwidthUsage: "12 KB/s",
    color: "emerald",
    badge: "Hardware"
  },
  {
    id: "inference_ai",
    name: "Prescriptive AI Inference",
    category: "ai",
    description: "Predictive anomaly analysis and real-time corrective action suggestions.",
    icon: Sparkles,
    enabled: true,
    frequency: "Event-driven",
    bandwidthUsage: "48 KB/s",
    color: "purple",
    badge: "Gemini / INT4"
  },
  {
    id: "edge_workers",
    name: "V8 Isolates Edge Workers",
    category: "compute",
    description: "Execution tracing of serverless functions, cold starts and instruction quotas.",
    icon: Terminal,
    enabled: true,
    frequency: "Real-time",
    bandwidthUsage: "18 KB/s",
    color: "amber"
  },
  {
    id: "anycast_probes",
    name: "Anycast & Geo-DNS Probes",
    category: "network",
    description: "Global network latency monitoring across 250+ POPs and dynamic failover.",
    icon: Globe,
    enabled: true,
    frequency: "500 ms",
    bandwidthUsage: "8 KB/s",
    color: "blue"
  },
  {
    id: "waf_ddos",
    name: "WAF & L7 DDoS Protection",
    category: "security",
    description: "Volumetric attack filtering, heuristic bot scoring and mitigation logs.",
    icon: Shield,
    enabled: true,
    frequency: "Continuous Stream",
    bandwidthUsage: "32 KB/s",
    color: "red",
    badge: "SecOps"
  },
  {
    id: "kafka_stream",
    name: "Kafka Event Stream",
    category: "infra",
    description: "Kafka topic ingestion, consumer lag calculation and message throughput.",
    icon: Activity,
    enabled: true,
    frequency: "100 ms",
    bandwidthUsage: "64 KB/s",
    color: "orange",
    badge: "Streaming"
  },
  {
    id: "cafm_iot",
    name: "IoT & CAFM Facility Sensors",
    category: "infra",
    description: "Temperature, humidity, HVAC climate probes and PUE efficiency computation.",
    icon: Server,
    enabled: false,
    frequency: "1 s",
    bandwidthUsage: "6 KB/s",
    color: "cyan"
  },
  {
    id: "hsm_fips",
    name: "HSM & FIPS 140-3 Attestation",
    category: "security",
    description: "Continuous verification of cryptographic signatures and enclave integrity.",
    icon: Lock,
    enabled: true,
    frequency: "10 s",
    bandwidthUsage: "2 KB/s",
    color: "emerald",
    badge: "FIPS 140-3"
  }
];

interface QuickSetupDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleService?: (serviceId: string, enabled: boolean) => void;
  isDark?: boolean;
}

export default function QuickSetupDrawer({
  isOpen,
  onClose,
  onToggleService,
  isDark = true
}: QuickSetupDrawerProps) {
  const [services, setServices] = useState<TelemetryServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem("sensorium_telemetry_services");
      if (saved) {
        const parsed = JSON.parse(saved);
        return DEFAULT_TELEMETRY_SERVICES.map(s => {
          const match = parsed.find((p: any) => p.id === s.id);
          return match ? { ...s, enabled: match.enabled } : s;
        });
      }
    } catch {
      // Ignore storage read failure
    }
    return DEFAULT_TELEMETRY_SERVICES;
  });

  const [activePreset, setActivePreset] = useState<"custom" | "all" | "eco" | "critical">("custom");
  const [justToggledId, setJustToggledId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "sensorium_telemetry_services",
        JSON.stringify(services.map(s => ({ id: s.id, enabled: s.enabled })))
      );
    } catch {
      // Ignore
    }
  }, [services]);

  const toggleService = (id: string) => {
    setServices(prev =>
      prev.map(s => {
        if (s.id === id) {
          const nextState = !s.enabled;
          if (onToggleService) onToggleService(id, nextState);
          return { ...s, enabled: nextState };
        }
        return s;
      })
    );
    setActivePreset("custom");
    setJustToggledId(id);
    setTimeout(() => setJustToggledId(null), 1500);
  };

  const applyPreset = (preset: "all" | "eco" | "critical") => {
    setActivePreset(preset);
    let nextServices = [...services];
    if (preset === "all") {
      nextServices = nextServices.map(s => ({ ...s, enabled: true }));
    } else if (preset === "eco") {
      // Only keep lightweight essentials
      nextServices = nextServices.map(s => ({
        ...s,
        enabled: s.id === "silicium_x1" || s.id === "anycast_probes"
      }));
    } else if (preset === "critical") {
      // Keep Silicium, WAF, HSM and Inference
      nextServices = nextServices.map(s => ({
        ...s,
        enabled: s.id === "silicium_x1" || s.id === "inference_ai" || s.id === "waf_ddos" || s.id === "hsm_fips"
      }));
    }
    setServices(nextServices);
    nextServices.forEach(s => {
      if (onToggleService) onToggleService(s.id, s.enabled);
    });
  };

  const activeCount = services.filter(s => s.enabled).length;
  const totalCount = services.length;

  const getEstimatedBandwidth = () => {
    let totalKb = 0;
    services.filter(s => s.enabled).forEach(s => {
      const match = s.bandwidthUsage.match(/(\d+)/);
      if (match) totalKb += parseInt(match[1], 10);
    });
    return `${totalKb} KB/s`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.8 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md sm:max-w-lg bg-white dark:bg-[#0c0c0f] border-l border-slate-200 dark:border-white/[0.08] h-full overflow-hidden shadow-2xl flex flex-col z-10 text-slate-900 dark:text-white"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-200/80 dark:border-white/[0.07] bg-slate-50/80 dark:bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Quick Setup & Telemetry</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                      {activeCount}/{totalCount} Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono mt-0.5">
                    Sensory data feeds and subsystem control
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Profile Presets */}
            <div className="px-5 py-3 border-b border-slate-200/80 dark:border-white/[0.06] bg-slate-100/60 dark:bg-black/30 flex items-center justify-between gap-2 overflow-x-auto text-xs">
              <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400 whitespace-nowrap">Profiles:</span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                <button
                  onClick={() => applyPreset("all")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activePreset === "all"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                      : "bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Enable All
                </button>
                <button
                  onClick={() => applyPreset("critical")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activePreset === "critical"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                      : "bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Critical Mode
                </button>
                <button
                  onClick={() => applyPreset("eco")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activePreset === "eco"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                      : "bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Eco Mode
                </button>
              </div>
            </div>

            {/* Services List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
              {services.map((service) => {
                const IconComponent = service.icon;
                const isToggled = justToggledId === service.id;

                return (
                  <div
                    key={service.id}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                      service.enabled
                        ? "bg-white dark:bg-[#121217] border-slate-200/90 dark:border-white/[0.12] shadow-xs"
                        : "bg-slate-50/60 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/[0.04] opacity-75"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`p-2.5 rounded-xl shrink-0 mt-0.5 transition-colors ${
                            service.enabled
                              ? "bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                              : "bg-slate-200 dark:bg-white/[0.05] text-slate-400 dark:text-neutral-500 border border-slate-300/40 dark:border-white/[0.05]"
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {service.name}
                            </h4>
                            {service.badge && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-white/[0.08]">
                                {service.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                            {service.description}
                          </p>

                          {/* Telemetry metrics ticker */}
                          <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-slate-400 dark:text-neutral-500">
                            <span className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${service.enabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400 dark:bg-neutral-600"}`} />
                              <span>{service.frequency}</span>
                            </span>
                            <span>•</span>
                            <span>Throughput: {service.enabled ? service.bandwidthUsage : "0 KB/s"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Custom Modern Toggle Switch */}
                      <button
                        onClick={() => toggleService(service.id)}
                        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none p-0.5 ${
                          service.enabled
                            ? "bg-emerald-500 dark:bg-emerald-500"
                            : "bg-slate-300 dark:bg-neutral-700"
                        }`}
                        role="switch"
                        aria-checked={service.enabled}
                        aria-label={`Toggle ${service.name}`}
                      >
                        <motion.div
                          animate={{ x: service.enabled ? 20 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center pointer-events-none"
                        >
                          {service.enabled ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Power className="w-2.5 h-2.5 text-slate-400" />
                          )}
                        </motion.div>
                      </button>
                    </div>

                    {isToggled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Service successfully {service.enabled ? "enabled" : "disabled"}</span>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Summary & Telemetry Overhead */}
            <div className="p-4 border-t border-slate-200/80 dark:border-white/[0.07] bg-slate-50/90 dark:bg-[#08080a] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-orange-500" />
                  Estimated Bandwidth:
                </span>
                <span className="text-slate-900 dark:text-white font-semibold">{getEstimatedBandwidth()}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-emerald-500" />
                  Estimated CPU Load:
                </span>
                <span className="text-slate-900 dark:text-white font-semibold">
                  {Math.round((activeCount / totalCount) * 4.5)}%
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 text-xs font-semibold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>Save & Close</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
