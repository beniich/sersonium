import React, { useState } from 'react';
import { CheckCircle2, XCircle, Trash2, ArrowLeft, Eye, Download } from 'lucide-react';
import type { OrchestratorStats, RunRecord } from '../../types/agent';

interface RunHistoryViewProps {
  runs: RunRecord[];
  stats: OrchestratorStats;
  onClearHistory: () => void;
  onBackToOrbit: () => void;
  onSelectRun: (run: RunRecord) => void;
  onPreviewRun?: (run: RunRecord) => void;
}

export function RunHistoryView({
  runs,
  stats,
  onClearHistory,
  onBackToOrbit,
  onSelectRun,
  onPreviewRun,
}: RunHistoryViewProps) {
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'success' | 'error'>('all');

  const filteredRuns = runs.filter((run) => {
    if (outcomeFilter === 'all') return true;
    return run.status === outcomeFilter;
  });

  const handleDownloadRun = (run: RunRecord) => {
    const payload = [
      `=== SENSORIUM RUN REPORT ===`,
      `Agent: ${run.agentName}`,
      `Group: ${run.groupTitle}`,
      `Status: ${run.status}`,
      `Duration: ${run.durationMs}ms`,
      `Date: ${new Date(run.timestamp).toLocaleString()}`,
      '',
      '--- SUMMARY ---',
      run.summary,
      '',
      '--- DELIVERABLES ---',
      (run.deliverables || []).join('\n') || 'None',
    ].join('\n');
    const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensorium-run-${run.agentName.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {/* Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#1e2023] border border-white dark:border-white/[0.06] rounded-[18px] p-3.5 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-none">
          <p className="text-xs font-medium text-[#8E929C]">Total Agents</p>
          <p className="text-2xl font-semibold text-[#111317] dark:text-white mt-1 tabular-nums">
            {stats.totalAgents}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1e2023] border border-white dark:border-white/[0.06] rounded-[18px] p-3.5 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-none">
          <p className="text-xs font-medium text-[#8E929C]">Executed Runs</p>
          <p className="text-2xl font-semibold text-[#111317] dark:text-white mt-1 tabular-nums">
            {stats.totalRuns}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1e2023] border border-white dark:border-white/[0.06] rounded-[18px] p-3.5 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-none">
          <p className="text-xs font-medium text-[#8E929C]">Success Rate</p>
          <p className="text-2xl font-semibold text-[#111317] dark:text-white mt-1 tabular-nums">
            {stats.totalRuns > 0 ? `${stats.successRate}%` : '—'}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1e2023] border border-white dark:border-white/[0.06] rounded-[18px] p-3.5 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-none">
          <p className="text-xs font-medium text-[#8E929C]">Avg Duration</p>
          <p className="text-2xl font-semibold text-[#111317] dark:text-white mt-1 tabular-nums">
            {stats.totalRuns > 0 ? `${(stats.avgDurationMs / 1000).toFixed(2)}s` : '—'}
          </p>
        </div>
      </div>

      {/* Run History Table / Empty State */}
      <div className="bg-white dark:bg-[#1e2023] border border-white dark:border-white/[0.06] rounded-[20px] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-white/[0.08]">
          <div className="flex items-center gap-1 p-1 bg-[#F2F4F7] dark:bg-[#282a2d] rounded-lg">
            {([
              { key: 'all', label: 'All Runs' },
              { key: 'success', label: 'Success' },
              { key: 'error', label: 'Error' },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setOutcomeFilter(tab.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  outcomeFilter === tab.key
                    ? 'bg-white dark:bg-[#333538] text-slate-900 dark:text-white shadow-xs'
                    : 'text-[#8E929C] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {runs.length > 0 && (
            <div className="flex items-center gap-2">
              {onPreviewRun && (
                <button
                  type="button"
                  onClick={() => onPreviewRun(runs[0])}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FDF0EA] dark:bg-orange-500/15 text-[#B84A24] dark:text-orange-200 text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Preview</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClearHistory}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-[#c4c7c9] hover:bg-slate-100 dark:hover:bg-[#282a2d] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          )}
        </div>

        {filteredRuns.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {runs.length === 0
                ? 'No agent runs recorded yet'
                : 'No runs match the selected filter'}
            </p>
            <p className="text-xs text-[#8E929C] mt-1 max-w-md mx-auto">
              {runs.length === 0
                ? 'Select any agent in Agent Orbit or run a workflow to inspect execution logs and latency metrics here.'
                : 'Try switching back to All Runs to inspect all completed executions.'}
            </p>
            <button
              type="button"
              onClick={onBackToOrbit}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141518] dark:bg-white text-white dark:text-[#111317] text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Open Agent Orbit</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-5">Agent</th>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4 text-right">Duration</th>
                  <th className="py-3 px-4 text-right">Time</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredRuns.map((run) => (
                  <tr
                    key={run.id}
                    onClick={() => onSelectRun(run)}
                    title="Click to view result conclusion"
                    className="hover:bg-orange-50/50 dark:hover:bg-orange-500/10 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-5 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {run.agentName}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {run.groupTitle}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {run.status === 'success' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Success</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {run.summary}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">
                      {run.durationMs}ms
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                      {new Date(run.timestamp).toLocaleTimeString()}
                    </td>
                    <td
                      className="py-3 px-5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        {onPreviewRun && (
                          <button
                            type="button"
                            onClick={() => onPreviewRun(run)}
                            title="Open preview"
                            aria-label={`Preview ${run.agentName}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#282a2d] hover:bg-slate-200 dark:hover:bg-[#333538] text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#D96B43]" />
                            <span>Preview</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownloadRun(run)}
                          title="Download result"
                          aria-label={`Download ${run.agentName}`}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#282a2d] hover:bg-slate-200 dark:hover:bg-[#333538] text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
