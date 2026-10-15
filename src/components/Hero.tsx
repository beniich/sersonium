import React, { lazy, Suspense } from 'react';
import { ArrowRight, Sparkles, Zap, Brain, Leaf, Network, ShieldCheck, PlayCircle } from 'lucide-react';
import { SpatialNode, TelemetryMetrics } from '../types';

const DigitalTwinViewer3D = lazy(() => import('./DigitalTwinViewer3D').then(m => ({ default: m.DigitalTwinViewer3D })));

interface HeroProps {
  onExploreDigitalTwin: () => void;
  onExploreArchitecture: () => void;
  onSelectNode: (node: SpatialNode) => void;
  metrics: TelemetryMetrics;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreDigitalTwin,
  onExploreArchitecture,
  onSelectNode,
  metrics,
}) => {
  return (
    <section className="relative pt-8 pb-16 overflow-hidden">
      {/* Subtle radial ambient backdrop */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Kicker badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 shadow-xs text-xs text-orange-600 dark:text-orange-400 font-mono tracking-tight font-medium">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>SENSORIUM PLATFORM</span>
            <span className="text-orange-300 dark:text-orange-700">·</span>
            <span className="text-slate-600 dark:text-neutral-400 font-normal">SOVEREIGN HYPERVISION &amp; 3D DIGITAL TWIN</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto mb-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Autonomous Digital Twin &amp;{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
              Predictive Facility Intelligence
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed text-balance">
            Hypervise multi-site building portfolios, automate ESG CSRD compliance, predict mechanical breakdowns with Gemini AI, and inspect structural assets in real-time 3D spatial telemetry.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-7">
          <button
            onClick={onExploreDigitalTwin}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-md shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <span>Explore Live Digital Twin</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onExploreArchitecture}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-[#14141c] hover:bg-slate-50 dark:hover:bg-white/[0.05] text-slate-700 dark:text-neutral-200 font-semibold text-sm border border-slate-200 dark:border-white/[0.08] shadow-xs hover:border-orange-500/30 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-orange-500" />
            <span>Enterprise Architecture Demo</span>
          </button>
        </div>

        {/* Real-time Ticker Badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-neutral-400 font-mono mb-10">
          <div className="flex items-center gap-1.5">
            <span className="text-orange-500 font-bold">((•))</span>
            <span>1.4M Telemetry Pts/sec</span>
          </div>
          <span className="hidden sm:inline text-slate-300 dark:text-neutral-700">·</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>99.98% Anomaly Precision</span>
          </div>
          <span className="hidden sm:inline text-slate-300 dark:text-neutral-700">·</span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Zero-Lag Edge Ingestion</span>
          </div>
        </div>

        {/* The 4 Telemetry Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {/* Card 1: Energy Delta */}
          <div className="bg-white/95 dark:bg-[#0e0e14]/95 backdrop-blur-md rounded-xl p-4 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 font-mono mb-1">
              <span className="tracking-wide">ENERGY DELTA</span>
              <Zap className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {metrics.energyDeltaPercent.toFixed(1)}%
              <span className="text-xs font-normal text-slate-400 ml-1.5">vs ASHRAE 90.1</span>
            </div>
            <div className="mt-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>+1.4 GWh offset YTD</span>
            </div>
          </div>

          {/* Card 2: AI HealthScore */}
          <div className="bg-white/95 dark:bg-[#0e0e14]/95 backdrop-blur-md rounded-xl p-4 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 font-mono mb-1">
              <span className="tracking-wide">AI HEALTHSCORE</span>
              <Brain className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {metrics.healthScore.toFixed(1)}
              <span className="text-xs font-normal text-slate-400 ml-1">/100</span>
            </div>
            <div className="mt-2 flex flex-col gap-1">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                  style={{ width: `${metrics.healthScore}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-orange-600 dark:text-orange-400">Gemini Prescriptive active</span>
            </div>
          </div>

          {/* Card 3: Carbon Abated */}
          <div className="bg-white/95 dark:bg-[#0e0e14]/95 backdrop-blur-md rounded-xl p-4 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 font-mono mb-1">
              <span className="tracking-wide">CARBON ABATED</span>
              <Leaf className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {metrics.carbonAbatedTco2e.toLocaleString()}
              <span className="text-xs font-normal text-slate-400 ml-1.5">tCO2e</span>
            </div>
            <div className="mt-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>Verra &amp; Gold Standard verified</span>
            </div>
          </div>

          {/* Card 4: Edge Telemetry */}
          <div className="bg-white/95 dark:bg-[#0e0e14]/95 backdrop-blur-md rounded-xl p-4 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 font-mono mb-1">
              <span className="tracking-wide">EDGE TELEMETRY</span>
              <Network className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {metrics.activeEdgeNodes.toLocaleString()}
              <span className="text-xs font-normal text-slate-400 ml-1.5">Workers</span>
            </div>
            <div className="mt-2 text-[11px] font-mono text-slate-500 dark:text-neutral-400 flex items-center gap-1">
              <span>Latency &lt; 0.4ms across 500+ PoPs</span>
            </div>
          </div>
        </div>

        {/* 3D Digital Twin Viewer Canvas (Lazy Loaded for Instant Paint) */}
        <div id="digital-twin" className="scroll-mt-24">
          <Suspense fallback={
            <div className="w-full h-[480px] rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center gap-3 backdrop-blur-md">
              <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
              <span className="font-mono text-xs text-orange-400 uppercase tracking-widest">Loading 3D Spatial Mesh...</span>
            </div>
          }>
            <DigitalTwinViewer3D onSelectNode={onSelectNode} />
          </Suspense>

          {/* Gemini Spatial Engine Live Status Bar */}
          <div className="mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-xs text-slate-700 dark:text-neutral-300 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-spin" />
            <span>Gemini Spatial Engine:</span>
            <span className="text-orange-600 dark:text-orange-400 font-semibold">#Autonomous Load Rebalancing Active</span>
            <span className="text-slate-400 dark:text-neutral-600">·</span>
            <span className="text-slate-500 dark:text-neutral-400">(Efficiency Score: 99.1%)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
