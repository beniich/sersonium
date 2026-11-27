import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, AlignJustify, LayoutGrid, ChevronRight } from 'lucide-react';
import { CHART_SERIES_BY_TIMEFRAME } from '../../data/fieldnoteSeed';
import type { TimeframeOption } from '../../types/agent';

type MatrixViewMode = 'dots' | 'bars' | 'peaks';

interface RunsMatrixChartProps {
  timeframe: TimeframeOption;
  extraRunsToday: number;
  liveSuccessRate: number | null;
  liveAgentsRunning: number;
  liveFailedCount: number;
  onOpenRunLog: () => void;
}

export function RunsMatrixChart({
  timeframe,
  extraRunsToday,
  liveSuccessRate,
  liveAgentsRunning,
  liveFailedCount,
  onOpenRunLog,
}: RunsMatrixChartProps) {
  const series = CHART_SERIES_BY_TIMEFRAME[timeframe];
  const [viewMode, setViewMode] = useState<MatrixViewMode>('dots');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [pinnedIdx, setPinnedIdx] = useState<number | null>(null);
  const [indicatorLeftPct, setIndicatorLeftPct] = useState<number>(48);

  const matrixRef = useRef<HTMLDivElement | null>(null);
  const colRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const defaultPeakIdx = Math.max(
    0,
    series.columns.findIndex((c) => c.isPeak)
  );
  const activeIdx = hoveredIdx ?? pinnedIdx ?? defaultPeakIdx;
  const activeCol = series.columns[activeIdx] ?? series.columns[0];
  const showCountInPill = hoveredIdx !== null || pinnedIdx !== null;

  useEffect(() => {
    setHoveredIdx(null);
    setPinnedIdx(null);
  }, [timeframe]);

  useEffect(() => {
    const matrixEl = matrixRef.current;
    const targetEl = colRefs.current[activeIdx];
    if (!matrixEl || !targetEl) return;
    const matrixRect = matrixEl.getBoundingClientRect();
    const colRect = targetEl.getBoundingClientRect();
    if (matrixRect.width <= 0) return;
    const centerPct =
      ((colRect.left - matrixRect.left + colRect.width / 2) / matrixRect.width) * 100;
    setIndicatorLeftPct(Math.max(4, Math.min(96, centerPct)));
  }, [activeIdx, timeframe, viewMode]);

  const totalKpi = series.totalRuns + extraRunsToday;
  const liveCount = series.liveCount + liveAgentsRunning;
  const failedCount = series.failedCount + liveFailedCount;

  return (
    <section
      aria-label="Runs overview telemetry"
      className="bg-white dark:bg-[#1e2023] rounded-[20px] p-4 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04),0_4px_12px_-2px_rgba(0,0,0,0.02)] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] border border-white/80 dark:border-white/[0.06] relative"
    >
      {/* Card Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="font-bold text-sm text-[#111317] dark:text-white">
            {timeframe === 'today'
              ? 'Runs today'
              : timeframe === '7d'
              ? 'Runs · 7 days'
              : 'Runs · 30 days'}
          </span>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#8E929C]">
            <span className="flex items-center gap-1.5 tabular-nums">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
              {liveCount} live
            </span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <span className="w-1.5 h-1.5 rounded-full border border-slate-400 dark:border-[#8e9193]" />
              {series.scheduledCount} scheduled
            </span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {failedCount} failed
            </span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-[#444749]" />
              {series.queueCount} queue
            </span>
          </div>
        </div>

        {/* View Mode Switcher & Open Run Log */}
        <div className="flex items-center gap-3">
          <div
            role="group"
            aria-label="Chart view mode"
            className="flex items-center bg-[#F2F4F7] dark:bg-[#282a2d] p-0.5 rounded-lg border border-black/[0.04] dark:border-white/[0.06]"
          >
            <button
              type="button"
              onClick={() => setViewMode('dots')}
              aria-label="Dot matrix view"
              aria-pressed={viewMode === 'dots'}
              className={`px-2 py-1 rounded transition ${
                viewMode === 'dots'
                  ? 'bg-white dark:bg-[#333538] text-black dark:text-white shadow-xs'
                  : 'text-[#8E929C] hover:text-black dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('bars')}
              aria-label="Bar view"
              aria-pressed={viewMode === 'bars'}
              className={`px-2 py-1 rounded transition ${
                viewMode === 'bars'
                  ? 'bg-white dark:bg-[#333538] text-black dark:text-white shadow-xs'
                  : 'text-[#8E929C] hover:text-black dark:hover:text-white'
              }`}
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('peaks')}
              aria-label="Peak points view"
              aria-pressed={viewMode === 'peaks'}
              className={`px-2 py-1 rounded transition ${
                viewMode === 'peaks'
                  ? 'bg-white dark:bg-[#333538] text-black dark:text-white shadow-xs'
                  : 'text-[#8E929C] hover:text-black dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenRunLog}
            className="text-xs text-[#8E929C] hover:text-black dark:hover:text-white font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>Open run log</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main KPI & Density Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end pt-1">
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className="text-5xl sm:text-6xl font-light tracking-tight text-[#111317] dark:text-white tabular-nums">
                {totalKpi.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-600 dark:text-[#4edea3] font-medium">
                {series.deltaText}
              </span>
            </div>
            <p className="text-xs text-[#8E929C] mt-1.5 max-w-[260px] leading-relaxed">
              {series.subtitle}
            </p>
          </div>

          <div className="mt-5 space-y-2 border-t border-slate-100 dark:border-white/[0.08] pt-3 text-xs">
            <div className="flex justify-between items-center text-[#8E929C]">
              <span>Success rate</span>
              <span className="font-medium text-slate-900 dark:text-[#e2e2e6] font-mono tabular-nums">
                {liveSuccessRate !== null && extraRunsToday > 0
                  ? `${liveSuccessRate}%`
                  : series.successRate}
              </span>
            </div>
            <div className="flex justify-between items-center text-[#8E929C]">
              <span>Median run</span>
              <span className="font-medium text-slate-900 dark:text-[#e2e2e6] font-mono tabular-nums">
                {series.medianRun}
              </span>
            </div>
            <div className="flex justify-between items-center text-[#8E929C]">
              <span>Peak</span>
              <span className="font-medium text-slate-900 dark:text-[#e2e2e6] font-mono tabular-nums">
                {series.peakLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Dot-Matrix / Bar / Peaks Chart */}
        <div className="lg:col-span-8 flex flex-col justify-end">
          <div
            ref={matrixRef}
            onMouseLeave={() => setHoveredIdx(null)}
            className="relative h-44 w-full flex items-end justify-between px-2 pb-5 border-b border-slate-200/80 dark:border-white/[0.1]"
          >
            {/* Moving Peak / Selected Column Indicator */}
            <div
              style={{ left: `${indicatorLeftPct}%` }}
              className="absolute top-3 bottom-5 w-px bg-black/60 dark:bg-white/50 flex flex-col items-center z-10 pointer-events-none transition-[left] duration-200 ease-out"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white -mt-1" />
              <div className="absolute -top-5 text-[9px] font-mono bg-[#111317] dark:bg-white text-white dark:text-[#111317] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap shadow-sm">
                {showCountInPill
                  ? `${activeCol.time} · ${activeCol.runs} runs`
                  : activeCol.time}
              </div>
            </div>

            {series.columns.map((col, colIdx) => {
              const isSelected = activeIdx === colIdx;
              const isPinned = pinnedIdx === colIdx;
              const isDimmed = hoveredIdx !== null && hoveredIdx !== colIdx && !isPinned;

              return (
                <button
                  key={`${timeframe}-${col.time}`}
                  ref={(el) => {
                    colRefs.current[colIdx] = el;
                  }}
                  type="button"
                  onMouseEnter={() => setHoveredIdx(colIdx)}
                  onClick={() =>
                    setPinnedIdx((prev) => (prev === colIdx ? null : colIdx))
                  }
                  aria-label={`${col.time}: ${col.runs} runs`}
                  className={`relative flex flex-col items-center justify-end px-1 pt-2 focus:outline-none transition-opacity duration-150 ${
                    viewMode === 'bars' ? 'gap-0' : 'gap-1'
                  } ${isDimmed ? 'opacity-35' : 'opacity-100'}`}
                >
                  {Array.from({ length: col.dots }).map((_, dotIdx) => {
                    const fromBottom = col.dots - 1 - dotIdx;
                    const isTopCap = dotIdx === 0;
                    const isBottomCap = dotIdx === col.dots - 1;

                    let dotOpacityClass =
                      col.tone === 'strong'
                        ? 'bg-black dark:bg-white'
                        : col.tone === 'medium'
                        ? 'bg-black/80 dark:bg-white/80'
                        : col.tone === 'muted'
                        ? 'bg-black/40 dark:bg-white/45'
                        : 'bg-black/20 dark:bg-white/25';

                    if (viewMode === 'peaks' && !isTopCap) {
                      dotOpacityClass = 'bg-black/15 dark:bg-white/15 scale-75';
                    }
                    if (isSelected && (viewMode !== 'peaks' || isTopCap)) {
                      dotOpacityClass = 'bg-black dark:bg-white scale-110';
                    }

                    const shapeClass =
                      viewMode === 'bars'
                        ? `w-1.5 h-2 ${
                            isTopCap
                              ? 'rounded-t-full'
                              : isBottomCap
                              ? 'rounded-b-full'
                              : 'rounded-[1px]'
                          }`
                        : 'w-1.5 h-1.5 rounded-full';

                    return (
                      <span
                        key={dotIdx}
                        style={{
                          animationDelay: `${colIdx * 16 + fromBottom * 18}ms`,
                        }}
                        className={`chart-col-dot block transition-transform duration-150 ${shapeClass} ${dotOpacityClass}`}
                      />
                    );
                  })}

                  {isPinned && (
                    <span className="absolute -bottom-2.5 w-1.5 h-1.5 rounded-full bg-black dark:bg-white ring-2 ring-black/15 dark:ring-white/25" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Time Axis Labels */}
          <div className="flex justify-between text-[10px] text-[#8E929C] font-mono px-1 pt-1.5 tabular-nums">
            {series.axisLabels.map((lbl, idx) => (
              <span
                key={lbl}
                className={
                  idx === Math.floor(series.axisLabels.length / 2) - 1 && timeframe === 'today'
                    ? 'text-black dark:text-white font-semibold'
                    : ''
                }
              >
                {lbl}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
