import React, { useMemo, useState } from 'react';
import { SlidersHorizontal, RotateCcw, Plus, CheckCircle2, Filter, Activity } from 'lucide-react';
import {
  AVAILABLE_TREND_NICHES,
  DEFAULT_TREND_SCOUT_CONFIG,
  TREND_SCOUT_RAW_SIGNALS,
  evaluateTrendSignals,
  type EvaluatedTrendSignal,
  type TimeWindowOption,
  type TrendLanguage,
  type TrendScoutConfig,
} from '../../utils/trendScoutEngine';

interface TrendScoutConfigPanelProps {
  config: TrendScoutConfig;
  onChange: (next: TrendScoutConfig) => void;
}

export function TrendScoutConfigPanel({ config, onChange }: TrendScoutConfigPanelProps) {
  const [customNiche, setCustomNiche] = useState('');
  const [hoveredSignalId, setHoveredSignalId] = useState<string | null>(null);

  const summary = useMemo(
    () => evaluateTrendSignals(TREND_SCOUT_RAW_SIGNALS, config),
    [config]
  );

  const allNicheOptions = useMemo(() => {
    const merged = new Set([...AVAILABLE_TREND_NICHES, ...config.niches]);
    return Array.from(merged);
  }, [config.niches]);

  const toggleNiche = (niche: string) => {
    const exists = config.niches.includes(niche);
    onChange({
      ...config,
      niches: exists ? config.niches.filter((n) => n !== niche) : [...config.niches, niche],
    });
  };

  const handleAddCustomNiche = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customNiche.trim().toLowerCase();
    if (!trimmed) return;
    if (!config.niches.includes(trimmed)) {
      onChange({ ...config, niches: [...config.niches, trimmed] });
    }
    setCustomNiche('');
  };

  const toggleLanguage = (lang: TrendLanguage) => {
    const exists = config.languages.includes(lang);
    const next = exists ? config.languages.filter((l) => l !== lang) : [...config.languages, lang];
    if (next.length === 0) return;
    onChange({ ...config, languages: next });
  };

  const handleResetDefaults = () => {
    onChange(DEFAULT_TREND_SCOUT_CONFIG);
  };

  // Scatter plot bounds (Velocity: 0..450%, Z-Score: 0..5.0)
  const chartW = 340;
  const chartH = 152;
  const padL = 34;
  const padR = 14;
  const padT = 14;
  const padB = 24;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const maxVel = 450;
  const maxZ = 5.0;

  const toX = (vel: number) =>
    padL + (Math.min(maxVel, Math.max(0, vel)) / maxVel) * plotW;
  const toY = (z: number) =>
    padT + plotH - (Math.min(maxZ, Math.max(0, z)) / maxZ) * plotH;

  const threshX = toX(config.velocityThresholdPct);
  const threshY = toY(config.zScoreThreshold);

  const inspectedSignal: EvaluatedTrendSignal | null =
    summary.signals.find((s) => s.id === hoveredSignalId) ?? summary.passedSignals[0] ?? null;

  return (
    <section
      aria-label="Trend Scout technical configuration"
      className="rounded-2xl border border-[#D96B43]/30 bg-slate-50/90 dark:bg-[#17191c] overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-2 bg-[#FDF0EA]/70 dark:bg-orange-500/[0.08]">
        <div className="flex items-center gap-2 min-w-0">
          <SlidersHorizontal className="w-4 h-4 text-[#D96B43] shrink-0" />
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              Technical Configuration & Thresholds
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Tune Velocity, Z-Score, and niche filters live
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleResetDefaults}
          aria-label="Reset Trend Scout thresholds"
          className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/[0.08] inline-flex items-center gap-1 transition-colors shrink-0"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Default</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Threshold Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-3 rounded-xl bg-white dark:bg-[#1e2023] border border-slate-200/80 dark:border-white/[0.07]">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="ts-velocity-slider"
                className="text-[11px] font-semibold text-slate-700 dark:text-slate-200"
              >
                Velocity Threshold
              </label>
              <span className="text-xs font-mono font-semibold text-[#D96B43] tabular-nums">
                +{config.velocityThresholdPct}%
              </span>
            </div>
            <input
              id="ts-velocity-slider"
              type="range"
              min={50}
              max={420}
              step={10}
              value={config.velocityThresholdPct}
              onChange={(e) =>
                onChange({ ...config, velocityThresholdPct: Number(e.target.value) })
              }
              className="w-full accent-[#D96B43] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
              <span>+50%</span>
              <span>+200%</span>
              <span>+420%</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-[#1e2023] border border-slate-200/80 dark:border-white/[0.07]">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="ts-zscore-slider"
                className="text-[11px] font-semibold text-slate-700 dark:text-slate-200"
              >
                Z-Score Threshold (Spikes)
              </label>
              <span className="text-xs font-mono font-semibold text-[#D96B43] tabular-nums">
                {config.zScoreThreshold.toFixed(1)}σ
              </span>
            </div>
            <input
              id="ts-zscore-slider"
              type="range"
              min={1.0}
              max={4.5}
              step={0.1}
              value={config.zScoreThreshold}
              onChange={(e) =>
                onChange({ ...config, zScoreThreshold: Number(e.target.value) })
              }
              className="w-full accent-[#D96B43] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
              <span>1.0σ</span>
              <span>2.5σ</span>
              <span>4.5σ</span>
            </div>
          </div>
        </div>

        {/* Volume, Time Window, Languages & Saturation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#1e2023] border border-slate-200/80 dark:border-white/[0.07] space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="ts-min-volume"
                className="text-[11px] font-medium text-slate-600 dark:text-slate-300"
              >
                Minimum volume
              </label>
              <span className="text-[11px] font-mono font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
                {config.minVideoCount} videos
              </span>
            </div>
            <input
              id="ts-min-volume"
              type="range"
              min={100}
              max={1500}
              step={50}
              value={config.minVideoCount}
              onChange={(e) => onChange({ ...config, minVideoCount: Number(e.target.value) })}
              className="w-full accent-slate-700 dark:accent-slate-300 cursor-pointer"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-[#1e2023] border border-slate-200/80 dark:border-white/[0.07] flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                Window & Languages
              </span>
              <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
                {(['24h', '48h', '7d'] as TimeWindowOption[]).map((win) => (
                  <button
                    key={win}
                    type="button"
                    onClick={() => onChange({ ...config, timeWindow: win })}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                      config.timeWindow === win
                        ? 'bg-white dark:bg-[#1e2023] text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {win}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {(['fr', 'en', 'es'] as TrendLanguage[]).map((lang) => {
                  const active = config.languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      aria-pressed={active}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase border transition-colors ${
                        active
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                          : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>

              <label className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.excludeSaturated}
                  onChange={(e) => onChange({ ...config, excludeSaturated: e.target.checked })}
                  className="rounded border-slate-300 text-[#D96B43] focus:ring-[#D96B43]"
                />
                <span>Anti-saturation</span>
              </label>
            </div>
          </div>
        </div>

        {/* Niche Filters */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              <Filter className="w-3 h-3 text-[#D96B43]" />
              <span>Niche filters ({config.niches.length} active)</span>
            </span>
            {config.niches.length > 0 && (
              <button
                type="button"
                onClick={() => onChange({ ...config, niches: [] })}
                className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Show all
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {allNicheOptions.map((niche) => {
              const selected = config.niches.includes(niche);
              return (
                <button
                  key={niche}
                  type="button"
                  onClick={() => toggleNiche(niche)}
                  aria-pressed={selected}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                    selected
                      ? 'bg-[#FDF0EA] dark:bg-orange-500/20 border-[#D96B43]/60 text-[#B84A24] dark:text-orange-200'
                      : 'bg-white dark:bg-[#1e2023] border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {niche}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleAddCustomNiche} className="flex items-center gap-1.5">
            <input
              type="text"
              value={customNiche}
              onChange={(e) => setCustomNiche(e.target.value)}
              placeholder="Add a niche (e.g., ai, crm)..."
              aria-label="Add a niche filter"
              className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
            />
            <button
              type="submit"
              aria-label="Add niche"
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-medium inline-flex items-center gap-1 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Live Data Visualization */}
        <div className="pt-2 border-t border-slate-200/80 dark:border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Processed data visualization</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              {summary.passedCount}/{summary.totalCount} validated
            </span>
          </div>

          {/* 3 Live KPIs */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-xl bg-white dark:bg-[#1e2023] border border-slate-200/70 dark:border-white/[0.07]">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Active trends</div>
              <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {summary.passedCount}
                <span className="text-[11px] text-slate-400 font-normal"> / {summary.totalCount}</span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#1e2023] border border-slate-200/70 dark:border-white/[0.07]">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Avg Trend Score</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                {summary.avgTrendScore}
                <span className="text-[11px] text-slate-400 font-normal"> / 100</span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#1e2023] border border-slate-200/70 dark:border-white/[0.07]">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Peak Z-Score</div>
              <div className="text-sm font-semibold text-[#D96B43] tabular-nums">
                {summary.maxZScore.toFixed(2)}σ
              </div>
            </div>
          </div>

          {/* Velocity vs Z-Score Quadrant Visualization */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 px-1">
              <span>Velocity (%) × Z-Score (σ) Matrix</span>
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#D96B43]" /> Validated
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-600" /> Filtered
                </span>
              </span>
            </div>

            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-auto overflow-visible"
              role="img"
              aria-label="Velocity by Z-Score scatter chart with dynamic thresholds"
            >
              {/* Accepted Quadrant Shading */}
              <rect
                x={threshX}
                y={padT}
                width={Math.max(0, padL + plotW - threshX)}
                height={Math.max(0, threshY - padT)}
                fill="rgba(217, 107, 67, 0.12)"
                rx={4}
              />

              {/* Axes */}
              <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#334155" strokeWidth={1} />
              <line
                x1={padL}
                y1={padT + plotH}
                x2={padL + plotW}
                y2={padT + plotH}
                stroke="#334155"
                strokeWidth={1}
              />

              {/* Threshold Lines */}
              <line
                x1={threshX}
                y1={padT}
                x2={threshX}
                y2={padT + plotH}
                stroke="#D96B43"
                strokeDasharray="3 3"
                strokeWidth={1.2}
              />
              <line
                x1={padL}
                y1={threshY}
                x2={padL + plotW}
                y2={threshY}
                stroke="#D96B43"
                strokeDasharray="3 3"
                strokeWidth={1.2}
              />

              {/* Y labels */}
              <text x={padL - 5} y={padT + 4} textAnchor="end" fontSize="8" fill="#64748b">
                5σ
              </text>
              <text x={padL - 5} y={threshY + 3} textAnchor="end" fontSize="8" fill="#f97316">
                {config.zScoreThreshold.toFixed(1)}
              </text>
              <text x={padL - 5} y={padT + plotH} textAnchor="end" fontSize="8" fill="#64748b">
                0
              </text>

              {/* X labels */}
              <text x={padL} y={chartH - 6} textAnchor="start" fontSize="8" fill="#64748b">
                0%
              </text>
              <text x={threshX} y={chartH - 6} textAnchor="middle" fontSize="8" fill="#f97316">
                +{config.velocityThresholdPct}%
              </text>
              <text x={padL + plotW} y={chartH - 6} textAnchor="end" fontSize="8" fill="#64748b">
                +450%
              </text>

              {/* Signal Data Points */}
              {summary.signals.map((sig) => {
                const cx = toX(sig.growthVelocityPct);
                const cy = toY(sig.zScore);
                const isActive = inspectedSignal?.id === sig.id;
                const radius = sig.passed ? 4.5 + (sig.trendScore / 100) * 2.5 : 3.5;

                return (
                  <g key={sig.id}>
                    {isActive && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius + 3.5}
                        fill="none"
                        stroke="#ffffff"
                        strokeOpacity={0.55}
                        strokeWidth={1}
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={sig.passed ? '#D96B43' : '#475569'}
                      fillOpacity={sig.passed ? 0.92 : 0.65}
                      stroke={sig.passed ? '#fed7aa' : '#94a3b8'}
                      strokeWidth={isActive ? 1.5 : 0.7}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredSignalId(sig.id)}
                      onClick={() => setHoveredSignalId(sig.id)}
                    >
                      <title>{`${sig.title} (+${sig.growthVelocityPct}%, ${sig.zScore}σ, Score ${sig.trendScore})`}</title>
                    </circle>
                  </g>
                );
              })}
            </svg>

            {inspectedSignal && (
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[10px]">
                <div className="min-w-0">
                  <div className="text-slate-200 font-medium truncate">{inspectedSignal.title}</div>
                  <div className="text-slate-400 truncate">
                    {inspectedSignal.niche} · {inspectedSignal.language.toUpperCase()} ·{' '}
                    {inspectedSignal.volumeCurrent} videos
                  </div>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <div className="text-[#fb923c] font-semibold">
                    +{inspectedSignal.growthVelocityPct}% · {inspectedSignal.zScore}σ
                  </div>
                  <div
                    className={
                      inspectedSignal.passed ? 'text-emerald-400' : 'text-slate-400'
                    }
                  >
                    {inspectedSignal.passed
                      ? `Score ${inspectedSignal.trendScore}/100`
                      : inspectedSignal.rejectionReason}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Processed Signals List */}
          {summary.passedSignals.length === 0 ? (
            <div className="p-3 rounded-xl bg-white dark:bg-[#1e2023] border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-1.5">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                No signals pass these thresholds ({summary.rejectedThresholdCount} filtered by Velocity/Z-Score).
              </p>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] font-semibold text-[#D96B43] hover:underline"
              >
                Reset to recommended thresholds
              </button>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {summary.passedSignals.map((sig) => (
                <button
                  key={sig.id}
                  type="button"
                  onClick={() => setHoveredSignalId(sig.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-colors ${
                    inspectedSignal?.id === sig.id
                      ? 'bg-[#FDF0EA]/70 dark:bg-orange-500/10 border-[#D96B43]/50'
                      : 'bg-white dark:bg-[#1e2023] border-slate-200/70 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{sig.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {sig.niche} · {sig.audioHook} · {sig.volumeCurrent} videos
                      </div>
                    </div>
                    <div className="shrink-0 text-right font-mono">
                      <div className="text-[11px] font-semibold text-[#D96B43]">
                        {sig.trendScore} pts
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        +{sig.growthVelocityPct}% · {sig.zScore}σ
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
