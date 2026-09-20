import React, { useState } from "react";
import { motion } from "motion/react";
import {
  TrendingDown,
  Zap,
  Leaf,
  DollarSign,
  Building2,
  Server,
  Cloud,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Download,
  FileSpreadsheet
} from "lucide-react";

interface RoiCalculatorSectionProps {
  onEnterDashboard: () => void;
}

export default function RoiCalculatorSection({
  onEnterDashboard
}: RoiCalculatorSectionProps) {
  // Input parameters
  const [numSites, setNumSites] = useState<number>(12);
  const [bladesPerSite, setBladesPerSite] = useState<number>(4);
  const [dataVolumeTb, setDataVolumeTb] = useState<number>(45); // TB/site/month
  const [kwhCostEur, setKwhCostEur] = useState<number>(0.22); // €/kWh
  const [cloudEgressCostPerTb, setCloudEgressCostPerTb] = useState<number>(65); // €/TB

  // Calculations
  const totalBlades = numSites * bladesPerSite;
  const totalMonthlyTb = numSites * dataVolumeTb;
  
  // Traditional Cloud Cost estimation (Compute instances + 100% Egress + Cloud Ingestion)
  const traditionalMonthlyEgress = totalMonthlyTb * cloudEgressCostPerTb;
  const traditionalMonthlyCompute = totalBlades * 420; // €420/mo for high-spec cloud instance + API calls
  const traditionalAnnualTotal = (traditionalMonthlyEgress + traditionalMonthlyCompute) * 12;

  // Sensorium Edge Cost (Local processing = 94% Egress reduction, 45W per blade power consumption)
  const sensoriumMonthlyEgress = (totalMonthlyTb * 0.06) * cloudEgressCostPerTb; // Only 6% anomaly metadata uploaded
  const monthlyBladeEnergyCost = totalBlades * (0.045 * 24 * 30.5) * kwhCostEur; // 45W in kW * hours * cost
  const sensoriumPlatformFee = totalBlades * 95; // €95/mo license & maintenance
  const sensoriumAnnualTotal = (sensoriumMonthlyEgress + monthlyBladeEnergyCost + sensoriumPlatformFee) * 12;

  // Key outcomes
  const annualSavingsEur = Math.max(0, traditionalAnnualTotal - sensoriumAnnualTotal);
  const totalCapexEstimate = totalBlades * 2400; // €2,400 per EdgeBlade hardware
  const paybackMonths = annualSavingsEur > 0 ? ((totalCapexEstimate / (annualSavingsEur / 12))).toFixed(1) : "0";
  
  // ESG Carbon savings (0.42 kg CO2 per kWh saved + avoided data center cooling)
  const traditionalAnnualKwh = totalBlades * (0.350 * 24 * 365); // 350W average cloud server equivalent
  const sensoriumAnnualKwh = totalBlades * (0.045 * 24 * 365); // 45W passive
  const annualKwhSaved = traditionalAnnualKwh - sensoriumAnnualKwh;
  const annualCo2SavedTons = ((annualKwhSaved * 0.42) / 1000).toFixed(1);

  return (
    <div className="space-y-12">
      {/* SECTION HEADER */}
      <div className="text-left space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Economic ROI & Carbon Assessment</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Financial ROI & ESG Decarbonization Calculator
        </h2>
        <p className="text-sm text-neutral-400 max-w-3xl leading-relaxed">
          Estimate your operational savings (OPEX) and CO2 emission reductions in real time
          by localizing sensor inference and processing on Sensorium Edge blades.
        </p>
      </div>

      {/* CALCULATOR INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left 6 Cols: Sliders & Controls */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-[#0d0d12] border border-white/[0.1] shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Infrastructure Parameters
            </h3>
            <span className="text-xs font-mono text-neutral-400">
              {totalBlades} Silicon Blades
            </span>
          </div>

          {/* Slider 1: Sites */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Industrial sites / POPs count:
              </span>
              <span className="text-white font-bold">{numSites} sites</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={numSites}
              onChange={(e) => setNumSites(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg bg-neutral-800 accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Slider 2: Blades per site */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-purple-400" />
                EdgeBlade units per site:
              </span>
              <span className="text-white font-bold">{bladesPerSite} blades / site</span>
            </div>
            <input
              type="range"
              min={1}
              max={24}
              value={bladesPerSite}
              onChange={(e) => setBladesPerSite(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg bg-neutral-800 accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Slider 3: Data Volume per site */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                Sensor volume / site:
              </span>
              <span className="text-white font-bold">{dataVolumeTb} TB / month</span>
            </div>
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={dataVolumeTb}
              onChange={(e) => setDataVolumeTb(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg bg-neutral-800 accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Slider 4: Electricity Tariff */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                Local electricity cost:
              </span>
              <span className="text-white font-bold">${kwhCostEur.toFixed(2)} / kWh</span>
            </div>
            <input
              type="range"
              min={0.10}
              max={0.50}
              step={0.01}
              value={kwhCostEur}
              onChange={(e) => setKwhCostEur(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg bg-neutral-800 accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Slider 5: Cloud Egress Tariff */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Average Cloud Egress rate:
              </span>
              <span className="text-white font-bold">${cloudEgressCostPerTb} / TB</span>
            </div>
            <input
              type="range"
              min={30}
              max={120}
              step={5}
              value={cloudEgressCostPerTb}
              onChange={(e) => setCloudEgressCostPerTb(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg bg-neutral-800 accent-emerald-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Right 6 Cols: Live Financial & Carbon Results */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
          
          {/* Big Savings Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-black to-black border border-emerald-500/30 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                Estimated Annual Savings
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-400 text-black font-bold">
                ROI {paybackMonths} Months
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
                ${annualSavingsEur.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-emerald-300 font-mono">
                Net annual savings compared to a 100% cloud architecture.
              </p>
            </div>

            {/* 3 Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08]">
                <div className="text-[10px] font-mono text-neutral-400">Payback Period</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">{paybackMonths} months</div>
                <div className="text-[10px] text-emerald-400">Fast payback</div>
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08]">
                <div className="text-[10px] font-mono text-neutral-400">CO2 Avoided / Year</div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{annualCo2SavedTons} t</div>
                <div className="text-[10px] text-neutral-400">Scope 2 & 3 Impact</div>
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08] col-span-2 sm:col-span-1">
                <div className="text-[10px] font-mono text-neutral-400">Egress Saved</div>
                <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">-94%</div>
                <div className="text-[10px] text-neutral-400">Local INT4 filtering</div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="pt-3 border-t border-white/[0.08] space-y-2 text-xs font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>Traditional Cloud Cost:</span>
                <span className="text-red-400 font-bold line-through">
                  ${traditionalAnnualTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })} / yr
                </span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Sensorium Edge Cost:</span>
                <span className="text-emerald-400 font-bold">
                  ${sensoriumAnnualTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })} / yr
                </span>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs font-semibold text-white">Need a custom audit?</div>
              <div className="text-[11px] text-neutral-400 mt-0.5">Our engineers can evaluate your on-premise server deployment.</div>
            </div>

            <button
              onClick={onEnterDashboard}
              className="px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shrink-0"
            >
              <span>Open Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
