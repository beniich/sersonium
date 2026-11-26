import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, ChevronRight, BarChart2, Grid, Layers } from 'lucide-react';
import type { TimeframeOption } from '../../types/agent';

export interface RunsMatrixChartProps {
  timeframe: TimeframeOption;
  extraRunsToday?: number;
  liveSuccessRate?: number | null;
  liveAgentsRunning?: number;
  liveFailedCount?: number;
  isDemoMode?: boolean;
  onOpenRunLog?: () => void;
}

type ChartViewMode = 'dots' | 'bars' | 'peaks';

interface ColumnData {
  time: string;
  runs: number;
  dots: number;
  isPeak?: boolean;
}

const DEFAULT_COLUMNS: ColumnData[] = [
  { time: '00:00', runs: 3, dots: 1 },
  { time: '01:00', runs: 2, dots: 1 },
  { time: '02:00', runs: 4, dots: 1 },
  { time: '03:00', runs: 3, dots: 1 },
  { time: '04:00', runs: 7, dots: 2 },
  { time: '05:00', runs: 26, dots: 8 },
  { time: '06:00', runs: 19, dots: 6 },
  { time: '07:00', runs: 8, dots: 2 },
  { time: '07:45', runs: 14, dots: 4 },
  { time: '08:30', runs: 24, dots: 7 },
  { time: '09:25', runs: 48, dots: 14, isPeak: true },
  { time: '10:15', runs: 38, dots: 11 },
  { time: '11:00', runs: 28, dots: 8 },
  { time: '12:00', runs: 17, dots: 5 },
  { time: '13:30', runs: 11, dots: 3 },
  { time: '15:00', runs: 7, dots: 2 },
  { time: '16:30', runs: 4, dots: 1 },
  { time: '18:00', runs: 3, dots: 1 },
  { time: '19:30', runs: 3, dots: 1 },
  { time: '21:00', runs: 2, dots: 1 },
  { time: '22:30', runs: 1, dots: 1 },
  { time: '24:00', runs: 1, dots: 1 },
];

export function RunsMatrixChart({
  timeframe,
  extraRunsToday = 0,
  liveSuccessRate = null,
  liveAgentsRunning = 0,
  liveFailedCount = 0,
  isDemoMode = false,
  onOpenRunLog,
}: RunsMatrixChartProps) {
  const [viewMode, setViewMode] = useState<ChartViewMode>('dots');
  const [activeColIndex, setActiveColIndex] = useState<number | null>(null);
  const [pinnedColIndex, setPinnedColIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);

  const columns = React.useMemo<ColumnData[]>(() => {
    if (isDemoMode) return DEFAULT_COLUMNS;
    if (extraRunsToday > 0) {
      return DEFAULT_COLUMNS.map((c) => ({
        ...c,
        runs: Math.max(0, Math.round((c.runs / 335) * extraRunsToday)),
        dots: Math.max(1, Math.round((c.dots / 14) * Math.min(14, extraRunsToday))),
      }));
    }
    return DEFAULT_COLUMNS.map((c) => ({
      ...c,
      runs: 0,
      dots: 1,
      isPeak: false,
    }));
  }, [isDemoMode, extraRunsToday]);

  const peakIndex = columns.findIndex((c) => c.isPeak);
  const effectivePeakIndex = peakIndex >= 0 ? peakIndex : 10;
  const selectedIndex = activeColIndex ?? pinnedColIndex ?? effectivePeakIndex;
  const selectedCol = columns[selectedIndex] ?? columns[effectivePeakIndex] ?? { time: '09:00', runs: 0, dots: 1 };

  // Total runs calculation based on timeframe
  const totalRuns = React.useMemo(() => {
    if (!isDemoMode) {
      return extraRunsToday;
    }
    const base = 335 + extraRunsToday;
    if (timeframe === '7d') return 2491 + extraRunsToday * 3;
    if (timeframe === '30d') return 11840 + extraRunsToday * 8;
    return base;
  }, [timeframe, extraRunsToday, isDemoMode]);

  const successRateText = liveSuccessRate !== null 
    ? `${liveSuccessRate}%` 
    : (isDemoMode ? '99.4%' : '100%');

  const medianRunText = isDemoMode ? '4.1 s' : (extraRunsToday > 0 ? '4.1 s' : '0.0 s');
  const peakText = isDemoMode ? '09:25' : (extraRunsToday > 0 ? '09:25' : '--:--');

  // Dynamic indicator position calculation
  const indicatorLeft = React.useMemo(() => {
    const targetEl = colRefs.current[selectedIndex];
    const container = containerRef.current;
    if (!targetEl || !container) {
      return '48%';
    }
    const cRect = container.getBoundingClientRect();
    const tRect = targetEl.getBoundingClientRect();
    const leftPx = tRect.left - cRect.left + tRect.width / 2;
    return `${leftPx}px`;
  }, [selectedIndex]);

  return (
    <section
      aria-label="Runs overview card"
      className="bg-white dark:bg-[#1e2023] rounded-[24px] p-5 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] border border-white dark:border-white/[0.06] relative"
    >
      {/* Header and status counts */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="font-bold text-sm text-slate-900 dark:text-white">
            Runs today
          </span>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#8E929C]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white" />
              <strong className="text-slate-900 dark:text-white font-medium">
                {isDemoMode ? (3088 + (liveAgentsRunning ?? 0)) : (liveAgentsRunning ?? 0)}
              </strong>{' '}
              live
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full border border-slate-400 dark:border-slate-500" />
              <strong className="text-slate-900 dark:text-white font-medium">
                {isDemoMode ? 82 : 0}
              </strong> scheduled
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <strong className="text-slate-900 dark:text-white font-medium">
                {isDemoMode ? (liveFailedCount || 1) : (liveFailedCount || 0)}
              </strong>{' '}
              failed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              <strong className="text-slate-900 dark:text-white font-medium">0</strong> queue
            </span>
          </div>
        </div>

        {/* View mode toggle & run log action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#F2F4F7] dark:bg-[#282a2d] p-0.5 rounded-lg border border-black/[0.04] dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => setViewMode('dots')}
              title="Dot Matrix View"
              className={`px-2 py-1 rounded transition-colors ${
                viewMode === 'dots'
                  ? 'bg-white dark:bg-[#1a1c1f] shadow-xs text-black dark:text-white'
                  : 'text-[#8E929C] hover:text-black dark:hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('bars')}
              title="Bar Histogram View"
              className={`px-2 py-1 rounded transition-colors ${
                viewMode === 'bars'
                  ? 'bg-white dark:bg-[#1a1c1f] shadow-xs text-black dark:text-white'
                  : 'text-[#8E929C] hover:text-black dark:hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('peaks')}
              title="Peak Points View"
              className={`px-2 py-1 rounded transition-colors ${
                viewMode === 'peaks'
                  ? 'bg-white dark:bg-[#1a1c1f] shadow-xs text-black dark:text-white'
                  : 'text-[#8E929C] hover:text-black dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenRunLog}
            className="text-xs text-[#8E929C] hover:text-black dark:hover:text-white font-medium inline-flex items-center gap-1 transition-colors group"
          >
            <span>Open run log</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Main KPI & Density Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end pt-1">
        {/* Left KPI Column */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-light tracking-tight text-slate-900 dark:text-white tabular-nums">
                {totalRuns}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {isDemoMode ? "14% last Wednesday" : (extraRunsToday > 0 ? "+100% (Actif)" : "État T0 Prêt")}
              </span>
            </div>
            <p className="text-xs text-[#8E929C] mt-1.5 max-w-[270px] leading-relaxed">
              {isDemoMode 
                ? "Runs since midnight, 82 more scheduled before 24:00" 
                : (extraRunsToday > 0 
                    ? `${extraRunsToday} exécution(s) enregistrée(s) aujourd'hui` 
                    : "Phase T0 : Zéro exécution initiale. Prêt pour déclenchement.")}
            </p>
          </div>

          {/* Stat metrics list */}
          <div className="mt-6 space-y-2 border-t border-slate-100 dark:border-white/[0.08] pt-3 text-xs">
            <div className="flex justify-between items-center text-[#8E929C]">
              <span>Success rate</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">
                {successRateText}
              </span>
            </div>
            <div className="flex justify-between items-center text-[#8E929C]">
              <span>Median run</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">
                {medianRunText}
              </span>
            </div>
            <div className="flex justify-between items-center text-[#8E929C]">
              <span>Peak</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">
                {peakText}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Dot-Matrix Density Histogram */}
        <div className="lg:col-span-8 flex flex-col justify-end">
          <div
            ref={containerRef}
            onMouseLeave={() => setActiveColIndex(null)}
            className="relative h-44 w-full flex items-end justify-between px-2 pb-5 border-b border-slate-200/80 dark:border-white/[0.08]"
          >
            {/* Smooth Indicator line with top tooltip pill */}
            <div
              style={{ left: indicatorLeft }}
              className="absolute top-2 bottom-5 w-px bg-black dark:bg-white flex flex-col items-center z-20 pointer-events-none transition-all duration-200"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white -mt-1" />
              <div className="absolute -top-4 text-[9px] font-mono font-medium bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                {selectedCol.time} · {selectedCol.runs} runs
              </div>
            </div>

            {/* Render 22 density columns */}
            {columns.map((col, idx) => {
              const isSelected = selectedIndex === idx;
              const isPinned = pinnedColIndex === idx;

              return (
                <div
                  key={col.time}
                  ref={(el) => {
                    colRefs.current[idx] = el;
                  }}
                  onMouseEnter={() => setActiveColIndex(idx)}
                  onClick={() => setPinnedColIndex(isPinned ? null : idx)}
                  className={`flex flex-col gap-1 items-center cursor-pointer transition-all duration-200 px-1 ${
                    isSelected ? 'scale-110 z-10' : activeColIndex !== null ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  {viewMode === 'bars' ? (
                    // Bar Mode: solid unified rounded bar
                    <div
                      style={{ height: `${Math.max(8, col.dots * 8)}px` }}
                      className={`w-1.5 rounded-full transition-colors ${
                        isSelected || col.isPeak
                          ? 'bg-black dark:bg-white'
                          : 'bg-black/60 dark:bg-white/60'
                      }`}
                    />
                  ) : viewMode === 'peaks' ? (
                    // Peaks Mode: Cap dot highlight
                    <div
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        col.isPeak || isSelected
                          ? 'bg-black dark:bg-white scale-125'
                          : 'bg-black/30 dark:bg-white/30 scale-90'
                      }`}
                    />
                  ) : (
                    // Default Dot Matrix: vertical stack of small round dots
                    Array.from({ length: col.dots }).map((_, dotIdx) => (
                      <div
                        key={dotIdx}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-150 ${
                          col.isPeak || isSelected
                            ? 'bg-black dark:bg-white'
                            : 'bg-black/80 dark:bg-white/80'
                        }`}
                      />
                    ))
                  )}
                </div>
              );
            })}
          </div>

          {/* Time axis labels */}
          <div className="flex justify-between text-[10px] text-[#8E929C] font-mono px-1 pt-1.5">
            <span>00</span>
            <span>03</span>
            <span>06</span>
            <span className="text-slate-900 dark:text-white font-semibold">09</span>
            <span>12</span>
            <span>15</span>
            <span>18</span>
            <span>21</span>
            <span>24</span>
          </div>
        </div>
      </div>
    </section>
  );
}

