import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Cpu,
  Zap,
  Gauge,
  Thermometer,
  ShieldCheck,
  Radio,
  Sliders,
  CheckCircle2,
  TrendingDown,
  Layers,
  ArrowRight,
  HardDrive,
  Info
} from "lucide-react";

interface SiliciumHardwareSectionProps {
  onEnterDashboard: () => void;
}

export default function SiliciumHardwareSection({
  onEnterDashboard
}: SiliciumHardwareSectionProps) {
  const [clockFreq, setClockFreq] = useState<number>(2.4); // GHz
  const [activeTab, setActiveTab] = useState<"specs" | "benchmarks" | "tuning">("specs");

  // Dynamic calculations based on clock frequency
  const dynamicTdp = Math.round(18 + (clockFreq / 3.8) ** 2 * 27); // 18W to 45W
  const dynamicTops = Math.round((clockFreq / 2.4) * 240); // 120 to 380 TOPS
  const dynamicTemp = Math.round(38 + (clockFreq / 3.8) * 24); // 38°C to 62°C
  const dynamicLatency = (3.2 / (clockFreq / 2.4)).toFixed(2); // ms

  return (
    <div className="space-y-12">
      {/* SECTION HEADER */}
      <div className="text-left space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5" />
          <span>High-Efficiency Dedicated Silicon</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          EdgeBlade X1-Pro Blade & Custom Silicon
        </h2>
        <p className="text-sm text-neutral-400 max-w-3xl leading-relaxed">
          Custom-engineered for industrial edge inference without compromise: 240 TOPS of tensor power
          in a passive 45-Watt thermal envelope, ensuring complete autonomy with zero active cooling.
        </p>
      </div>

      {/* HARDWARE BLADE SPECS & LIVE TUNER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left 7 Cols: Interactive Hardware Tuning Studio */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#0d0d12] border border-white/[0.1] shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Frequency & Thermal Efficiency Simulator
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Adjust the NPU clock frequency to observe real-time impact on power draw and TOPS performance.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
              {clockFreq.toFixed(1)} GHz
            </span>
          </div>

          {/* Clock Frequency Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400">Neural Core Frequency</span>
              <span className="text-white font-semibold">{clockFreq.toFixed(1)} GHz / 3.8 GHz Max</span>
            </div>
            <input
              type="range"
              min={1.2}
              max={3.8}
              step={0.1}
              value={clockFreq}
              onChange={(e) => setClockFreq(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg bg-neutral-800 accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>1.2 GHz (Ultra-Eco 18W)</span>
              <span>2.4 GHz (Nominal 32W)</span>
              <span>3.8 GHz (Turbo 45W)</span>
            </div>
          </div>

          {/* 4 Live Dynamic Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.06] text-left">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>TDP Power</span>
              </div>
              <div className="text-xl font-bold text-white mt-1 font-mono">{dynamicTdp} W</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Passive cooling</div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.06] text-left">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>NPU Throughput</span>
              </div>
              <div className="text-xl font-bold text-white mt-1 font-mono">{dynamicTops} TOPS</div>
              <div className="text-[10px] text-purple-400 mt-0.5">INT4/FP8 Precision</div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.06] text-left">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                <Thermometer className="w-3.5 h-3.5 text-red-400" />
                <span>Temperature</span>
              </div>
              <div className="text-xl font-bold text-white mt-1 font-mono">{dynamicTemp} °C</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">&lt; 75°C Max Threshold</div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.06] text-left">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>p99 Latency</span>
              </div>
              <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{dynamicLatency} ms</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Local inference</div>
            </div>
          </div>

          {/* Key Hardware Architecture Innovations */}
          <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
            <h4 className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider">
              Silicon Module Architecture
            </h4>
            <div className="space-y-2 text-xs text-neutral-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Dual 100GbE QSFP28 Interface:</strong> Direct networking without PCI Express bottlenecks.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>TPM 2.0 FIPS 140-3 Root of Trust:</strong> Hardware sealing of private keys and measured secure boot.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Passive Vapor Chamber:</strong> Zero moving parts, zero on-site mechanical maintenance for 10 years.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Comparative Benchmark Matrix */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          <div className="p-6 rounded-2xl bg-black/60 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                Energy Efficiency Matrix (TOPS/Watt)
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">Benchmark 2026</span>
            </div>

            {/* Benchmark Bars */}
            <div className="space-y-3.5 text-xs font-mono">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Sensorium Silicon X1
                  </span>
                  <span className="text-emerald-400 font-bold">5.33 TOPS/W</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-emerald-400 w-full rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-neutral-400">
                  <span>NVIDIA Grace Hopper (Edge Config)</span>
                  <span className="text-white">2.85 TOPS/W</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-neutral-400 w-[53%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-neutral-400">
                  <span>AWS Graviton3 C7g</span>
                  <span className="text-white">1.42 TOPS/W</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-neutral-500 w-[27%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-neutral-400">
                  <span>Intel Xeon IceLake-SP</span>
                  <span className="text-white">0.68 TOPS/W</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-neutral-600 w-[13%] rounded-full" />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] text-[11px] text-neutral-400 leading-snug">
              * Standardized benchmark measuring industrial time-series inference and INT4 vision under continuous 24/7 load.
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
            <div className="text-xs font-semibold text-white">Ready to integrate Silicon X1?</div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              View live blade health metrics on the cockpit or schedule an on-site evaluation.
            </p>
            <button
              onClick={onEnterDashboard}
              className="w-full py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>View Silicon Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
