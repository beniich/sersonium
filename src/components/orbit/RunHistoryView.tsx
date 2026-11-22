import React, { useState } from 'react';
import { CheckCircle2, XCircle, Trash2, ArrowLeft } from 'lucide-react';
import type { OrchestratorStats, RunRecord } from '../../types/agent';

interface RunHistoryViewProps {
  runs: RunRecord[];
  stats: OrchestratorStats;
  onClearHistory: () => void;
  onBackToOrbit: () => void;
}

export function RunHistoryView({
  runs,
  stats,
  onClearHistory,
  onBackToOrbit,
}: RunHistoryViewProps) {
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'success' | 'error'>('all');

  const filteredRuns = runs.filter((run) => {
    if (outcomeFilter === 'all') return true;
    return run.status === outcomeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Agents</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1 tabular-nums">
            {stats.totalAgents}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Executed Runs</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1 tabular-nums">
            {stats.totalRuns}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Success Rate</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1 tabular-nums">
            {stats.totalRuns > 0 ? `${stats.successRate}%` : '—'}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Duration</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1 tabular-nums">
            {stats.totalRuns > 0 ? `${(stats.avgDurationMs / 1000).toFixed(2)}s` : '—'}
          </p>
        </div>
      </div>

      {/* Run History Table / Empty State */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
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
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {runs.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {filteredRuns.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {runs.length === 0
                ? 'No agent runs recorded yet'
                : 'No runs match the selected filter'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {runs.length === 0
                ? 'Select any agent in the orbital workspace and click Run Agent to inspect execution logs and latency metrics here.'
                : 'Try switching back to All Runs to inspect all completed executions.'}
            </p>
            <button
              type="button"
              onClick={onBackToOrbit}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D96B43] hover:bg-[#c55d37] text-white text-xs font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go to Orchestrator</span>
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
                  <th className="py-3 px-5 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredRuns.map((run) => (
                  <tr
                    key={run.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
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
                    <td className="py-3 px-5 text-right font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                      {new Date(run.timestamp).toLocaleTimeString()}
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
