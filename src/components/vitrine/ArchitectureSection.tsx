import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Layers,
  Shield,
  Zap,
  Globe2,
  Cpu,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Server,
  Lock,
  Workflow,
  RefreshCw,
  HardDrive,
  Network,
  Database,
  Eye,
  Sliders
} from "lucide-react";

import { SubscriptionTier } from "../../types";

interface ArchitectureSectionProps {
  onEnterDashboard: () => void;
  onNavigateToSandbox?: () => void;
  onSelectPlan?: (tier: SubscriptionTier) => void;
  userTier?: SubscriptionTier;
}

interface TierDefinition {
  id: string;
  name: string;
  badge: string;
  latency: string;
  p99: string;
  availability: string;
  description: string;
  components: { name: string; role: string; spec: string }[];
  compliance: string[];
}

const TIERS_DATA: TierDefinition[] = [
  {
    id: "tier-1",
    name: "Tier 01 — Edge Ingestion & Optical Mesh",
    badge: "Ingestion < 1.2ms",
    latency: "1.2 ms",
    p99: "1.8 ms",
    availability: "99.999%",
    description: "Ultra-distributed Anycast points of presence with hardware-accelerated TLS 1.3 termination, eBPF filtering, and line-rate L3/L4 DDoS mitigation.",
    components: [
      { name: "Anycast BGP Edge Mesh", role: "Dynamic global routing", spec: "340+ Global POPs" },
      { name: "eBPF Programmable Packet Filter", role: "DDoS mitigation & L4 firewall", spec: "100 Gbps line-rate" },
      { name: "Zero-RTT TLS 1.3 Enclave", role: "Secure SSL termination", spec: "Hardware Crypto Accelerator" }
    ],
    compliance: ["NIS2 Ready", "SecNumCloud L3", "ISO 27001", "BGP RPKI"]
  },
  {
    id: "tier-2",
    name: "Tier 02 — V8 Isolates & Serverless Mesh",
    badge: "V8 Execution < 0.4ms",
    latency: "0.4 ms",
    p99: "0.9 ms",
    availability: "99.995%",
    description: "Ultra-lightweight V8 Isolate runtime engine with zero container overhead, zero cold-start (sub-microsecond), and strict micro-enclave memory isolation.",
    components: [
      { name: "V8 Isolated Compute Engine", role: "Serverless Edge Workers", spec: "< 5µs Cold-Start" },
      { name: "SharedArrayBuffer IPC Bus", role: "Inter-process communication", spec: "12 GB/s local bandwidth" },
      { name: "Wasm JIT Micro-Sandbox", role: "Compiled Rust/C execution", spec: "SIMD128 Vector Support" }
    ],
    compliance: ["CWE/SANS Top 25 Mitigated", "Wasm Security Model", "POSIX Sandboxing"]
  },
  {
    id: "tier-3",
    name: "Tier 03 — Silicon Inference & Edge NPU",
    badge: "NPU Inference 2.8ms",
    latency: "2.8 ms",
    p99: "3.4 ms",
    availability: "99.999%",
    description: "Dedicated tensor acceleration via 240 TOPS NPU for quantized INT4/FP8 models. Local processing of industrial sensor and vision streams with zero cloud dependency.",
    components: [
      { name: "Sensorium Neural Engine NPU", role: "Tensor / Edge LLM Acceleration", spec: "240 TOPS @ 45W" },
      { name: "INT4/FP8 Quantization Pipeline", role: "Neural weight optimization", spec: "Accuracy loss < 0.12%" },
      { name: "Sensor Fusion Ring Buffer", role: "100 kHz IoT sensor aggregation", spec: "Zero-Copy DMA Controller" }
    ],
    compliance: ["On-Prem Sovereign AI", "Zero Data Cloud Leakage", "IEC 62443 Industrial"]
  },
  {
    id: "tier-4",
    name: "Tier 04 — Synchronization & Kafka Pipeline",
    badge: "Sync < 15ms",
    latency: "14.2 ms",
    p99: "18.5 ms",
    availability: "99.999%",
    description: "High-performance distributed event bus with Exactly-Once semantics, distributed persistence, and active-active multi-region replication with ZSTD compression.",
    components: [
      { name: "Sensorium Event Broker (Kafka)", role: "High-throughput stream ingestion", spec: "2.4M msg/sec per cluster" },
      { name: "Schema Registry & Protobuf V3", role: "Strict contract validation", spec: "Strict typed validation" },
      { name: "Active-Active Geo MirrorMaker", role: "Sovereign multi-site replication", spec: "RPO = 0, RTO < 3s" }
    ],
    compliance: ["PCI-DSS Level 1", "HIPAA Cryptographic Buffer", "GDPR Article 32"]
  },
  {
    id: "tier-5",
    name: "Tier 05 — Sovereign Enclave & Zero-Trust HSM",
    badge: "FIPS 140-3 Encryption",
    latency: "0.1 ms",
    p99: "0.2 ms",
    availability: "100%",
    description: "End-to-end hardware cryptographic attestation, private keys sealed in TPM 2.0 HSM, mandatory Zero-Trust mTLS networking, and dynamic micro-segmentation.",
    components: [
      { name: "Hardware Security Module (TPM 2.0)", role: "Session key sealing", spec: "FIPS 140-3 Level 4 Certified" },
      { name: "Strict mTLS 1.3 Identity Matrix", role: "Mutual device authentication", spec: "4h Certificate Rotation" },
      { name: "Sovereign Audit Ledger", role: "Encrypted immutable audit log", spec: "SHA-384 Merkle Tree Proof" }
    ],
    compliance: ["FIPS 140-3 Level 4", "SecNumCloud Sovereign", "BSI IT-Grundschutz", "DORA Compliant"]
  }
];

export default function ArchitectureSection({
  onEnterDashboard,
  onNavigateToSandbox,
  onSelectPlan,
  userTier = "free"
}: ArchitectureSectionProps) {
  const [selectedTierId, setSelectedTierId] = useState<string>("tier-5");
  const [isScanningChain, setIsScanningChain] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [simulatedLoad, setSimulatedLoad] = useState<number>(64);

  const selectedTier = TIERS_DATA.find((t) => t.id === selectedTierId) || TIERS_DATA[0];

  const runDiagnosticsScan = () => {
    if (isScanningChain) return;
    setIsScanningChain(true);
    setScanStep(1);

    const interval = setInterval(() => {
      setScanStep((prev) => {
        if (prev >= 5) {
          clearInterval(interval);
          setTimeout(() => setIsScanningChain(false), 800);
          return 5;
        }
        return prev + 1;
      });
    }, 450);
  };

  return (
    <div className="space-y-12">
      {/* SECTION HEADER */}
      <div className="text-left space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
          <Layers className="w-3.5 h-3.5" />
          <span>Sovereign Matrix Tiers 01 to 05</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          High-Performance & Zero-Trust Distributed Architecture
        </h2>
        <p className="text-sm text-neutral-400 max-w-3xl leading-relaxed">
          Sensorium is built on a decoupled architecture across five hermetic sovereign tiers, delivering
          sub-millisecond deterministic latency, active-active resilience, and strict European regulatory compliance.
        </p>
      </div>

      {/* 5-TIER INTERACTIVE SELECTOR PILLS */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {TIERS_DATA.map((tier, index) => {
          const isSelected = tier.id === selectedTierId;
          return (
            <button
              key={tier.id}
              onClick={() => setSelectedTierId(tier.id)}
              className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? "bg-white/[0.08] border-white/40 shadow-lg"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/20"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeTierPillIndicator"
                  className="absolute inset-0 border-2 border-emerald-400/50 rounded-xl pointer-events-none"
                />
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-neutral-400">
                    0{index + 1}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-emerald-400 animate-pulse" : "bg-neutral-600"}`} />
                </div>
                <h4 className="text-xs font-semibold text-white mt-1.5 line-clamp-1">
                  {tier.name.split("—")[1] || tier.name}
                </h4>
              </div>

              <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-400 font-medium">{tier.latency}</span>
                <span className="text-neutral-500">{tier.availability}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* DETAILED TIER INSPECTION PANEL */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden text-left">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Tier Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg sm:text-xl font-bold text-white">{selectedTier.name}</h3>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                {selectedTier.badge}
              </span>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed">
              {selectedTier.description}
            </p>

            {/* Sub-Components Technical Specs */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider">
                Key Components & Hardware Specs
              </h4>
              <div className="space-y-2">
                {selectedTier.components.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between flex-wrap gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-white">{comp.name}</div>
                        <div className="text-[11px] text-neutral-400">{comp.role}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300 border border-white/[0.08]">
                      {comp.spec}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance & Norms */}
            <div className="pt-2">
              <h4 className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                Security Certifications & Frameworks
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedTier.compliance.map((c, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono font-medium flex items-center gap-1.5"
                  >
                    <Shield className="w-3 h-3 text-blue-400" />
                    <span>{c}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Live Tier Telemetry Card */}
          <div className="p-5 rounded-xl bg-black/60 border border-white/[0.08] flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <span className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  SLA & Performance
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  LIVE 100%
                </span>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-neutral-400">Average Latency (p50)</span>
                    <span className="text-white font-bold">{selectedTier.latency}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full bg-emerald-400 w-1/4 rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-neutral-400">Tail Latency (p99)</span>
                    <span className="text-white font-bold">{selectedTier.p99}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full bg-blue-400 w-2/5 rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-neutral-400">Guaranteed Availability</span>
                    <span className="text-emerald-400 font-bold">{selectedTier.availability}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] space-y-2">
              <button
                onClick={onEnterDashboard}
                className="w-full py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Inspect in Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              
              {onSelectPlan && (
                <button
                  onClick={() => onSelectPlan(selectedTier.id === "tier-5" ? "enterprise" : selectedTier.id === "tier-3" || selectedTier.id === "tier-4" ? "pro" : "silver")}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {selectedTier.id === "tier-5" ? "Souscrire Plan Titan (Tier 05)" : "Activer ce Tier d'Architecture"}
                  </span>
                </button>
              )}

              {onNavigateToSandbox && (
                <button
                  onClick={onNavigateToSandbox}
                  className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Terminal className="w-3 h-3 text-orange-400" />
                  <span>Test V8 Sandbox</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LIVE INTERACTIVE CHAIN DIAGNOSTICS SCANNER */}
      <div className="p-6 rounded-2xl bg-black/50 border border-white/[0.08] text-left space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Workflow className="w-4 h-4 text-emerald-400" />
              End-to-End Chain Diagnostics Simulator
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Inject a test packet to verify health and transit time across all 5 Tiers.
            </p>
          </div>

          <button
            onClick={runDiagnosticsScan}
            disabled={isScanningChain}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              isScanningChain
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.15]"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanningChain ? "animate-spin text-emerald-400" : ""}`} />
            <span>{isScanningChain ? `Scan in progress (Tier 0${scanStep}/05)...` : "Launch Transit Test"}</span>
          </button>
        </div>

        {/* 5-Step Transit Line */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {TIERS_DATA.map((t, idx) => {
            const stepNum = idx + 1;
            const isCompleted = scanStep >= stepNum;
            const isCurrent = scanStep === stepNum && isScanningChain;

            return (
              <div
                key={t.id}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? "bg-emerald-500/10 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                    : isCompleted
                    ? "bg-white/[0.04] border-emerald-500/30"
                    : "bg-white/[0.02] border-white/[0.05] opacity-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-neutral-400">T0{stepNum}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-neutral-700" />
                  )}
                </div>
                <div className="text-xs font-semibold text-white truncate">
                  {t.name.split("—")[1] || t.name}
                </div>
                <div className="text-[11px] font-mono text-emerald-400 mt-1">
                  {isCompleted ? `✓ ${t.latency}` : "--"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
