import React from 'react';
import { ArrowRight, Sparkles, Zap, Brain, Leaf, Network, ShieldCheck, PlayCircle } from 'lucide-react';
import { DigitalTwinViewer3D } from './DigitalTwinViewer3D';
import { SpatialNode, TelemetryMetrics } from '../types';

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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-indigo-100/50 via-purple-50/30 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Kicker badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 shadow-sm text-xs text-indigo-700 font-mono tracking-tight font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>SPIDER CAFM 4.0</span>
            <span className="text-indigo-300">·</span>
            <span className="text-slate-600 font-normal">NEXT-GEN SMART BUILDING HYPERVISION</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto mb-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
            Autonomous Digital Twin &{' '}
            <span className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Predictive Facility Intelligence
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed text-balance">
            Hypervise multi-site building portfolios, automate ESG CSRD compliance, predict mechanical breakdowns with Gemini AI, and inspect structural assets in real-time 3D spatial telemetry.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-7">
          <button
            onClick={onExploreDigitalTwin}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <span>Explore Live Digital Twin</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onExploreArchitecture}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-sm hover:border-indigo-200 hover:-translate-y-0.5 transition-all"
          >
            <PlayCircle className="w-4 h-4 text-indigo-600" />
            <span>Enterprise Architecture Demo</span>
          </button>
        </div>

        {/* Real-time Ticker Badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 font-mono mb-10">
          <div className="flex items-center gap-1.5">
            <span className="text-indigo-600 font-bold">((•))</span>
            <span>1.4M Telemetry Pts/sec</span>
          </div>
          <span className="hidden sm:inline text-slate-300">·</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>99.98% Anomaly Precision</span>
          </div>
          <span className="hidden sm:inline text-slate-300">·</span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Zero-Lag Edge Ingestion</span>
          </div>
        </div>

        {/* The 4 Telemetry Metrics Cards (Directly matching screenshot above the 3D model) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {/* Card 1: Energy Delta */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-indigo-100/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
              <span className="tracking-wide">ENERGY DELTA</span>
              <Zap className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.energyDeltaPercent.toFixed(1)}%
              <span className="text-xs font-normal text-slate-500 ml-1.5">vs ASHRAE 90.1</span>
            </div>
            <div className="mt-2 text-[11px] font-mono text-emerald-700 flex items-center gap-1">
              <span>+1.4 GWh offset YTD</span>
            </div>
          </div>

          {/* Card 2: AI HealthScore */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-indigo-100/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
              <span className="tracking-wide">AI HEALTHSCORE</span>
              <Brain className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.healthScore.toFixed(1)}
              <span className="text-xs font-normal text-slate-400 ml-1">/100</span>
            </div>
            <div className="mt-2 flex flex-col gap-1">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                  style={{ width: `${metrics.healthScore}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-indigo-700">Gemini Prescriptive active</span>
            </div>
          </div>

          {/* Card 3: Carbon Abated */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-indigo-100/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
              <span className="tracking-wide">CARBON ABATED</span>
              <Leaf className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.carbonAbatedTco2e.toLocaleString()}
              <span className="text-xs font-normal text-slate-500 ml-1.5">tCO2e</span>
            </div>
            <div className="mt-2 text-[11px] font-mono text-indigo-700 flex items-center gap-1">
              <span>Verra & Gold Standard verified</span>
            </div>
          </div>

          {/* Card 4: Edge Telemetry */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-indigo-100/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
              <span className="tracking-wide">EDGE TELEMETRY</span>
              <Network className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.activeEdgeNodes.toLocaleString()}
              <span className="text-xs font-normal text-slate-500 ml-1.5">Workers</span>
            </div>
            <div className="mt-2 text-[11px] font-mono text-slate-600 flex items-center gap-1">
              <span>Latency &lt; 0.4ms across 500+ PoPs</span>
            </div>
          </div>
        </div>

        {/* 3D Digital Twin Viewer Canvas */}
        <div id="digital-twin" className="scroll-mt-24">
          <DigitalTwinViewer3D onSelectNode={onSelectNode} />

          {/* Gemini Spatial Engine Live Status Bar */}
          <div className="mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
            <span>Gemini Spatial Engine:</span>
            <span className="text-indigo-700 font-semibold">#Autonomous Load Rebalancing Active</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">(Efficiency Score: 99.1%)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
