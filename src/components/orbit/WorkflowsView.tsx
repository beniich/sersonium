import React, { useState, useMemo } from 'react';
import { Play, Pause, Loader2, Bot, Plus, Folder, X } from 'lucide-react';
import type { Group, WorkflowItem, WorkflowStatus } from '../../types/agent';
import { filterWorkflows } from '../../utils/orchestrator';
import { WorkflowIcon } from './WorkflowIcon';

interface WorkflowsViewProps {
  workflows: WorkflowItem[];
  groups: Group[];
  selectedFolder: string | null;
  selectedSubfolder: string | null;
  runningWorkflowId: string | null;
  onClearFolderFilter: () => void;
  onRunWorkflow: (workflow: WorkflowItem) => void;
  onToggleWorkflowStatus: (workflowId: string, nextStatus: WorkflowStatus) => void;
  onInspectAgent: (agentId: string) => void;
  onOpenNewWorkflow: () => void;
}

export function WorkflowsView({
  workflows,
  groups,
  selectedFolder,
  selectedSubfolder,
  runningWorkflowId,
  onClearFolderFilter,
  onRunWorkflow,
  onToggleWorkflowStatus,
  onInspectAgent,
  onOpenNewWorkflow,
}: WorkflowsViewProps) {
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'all'>('all');
  const [query, setQuery] = useState('');

  const agentNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of groups) {
      for (const a of g.agents) {
        map.set(a.id, a.name);
      }
    }
    return map;
  }, [groups]);

  const filtered = useMemo(
    () =>
      filterWorkflows(workflows, {
        status: statusFilter,
        folder: selectedFolder,
        subfolder: selectedSubfolder,
        query,
      }),
    [workflows, statusFilter, selectedFolder, selectedSubfolder, query]
  );

  return (
    <div className="space-y-3">
      <div className="bg-white dark:bg-[#1e2023] rounded-[20px] p-4 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] border border-white dark:border-white/[0.06]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'active', 'paused', 'draft'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  statusFilter === tab
                    ? 'bg-[#141518] dark:bg-white text-white dark:text-[#111317]'
                    : 'bg-[#F2F4F7] dark:bg-[#282a2d] text-[#8E929C] hover:text-black dark:hover:text-white'
                }`}
              >
                {tab === 'all' ? `All (${workflows.length})` : tab}
              </button>
            ))}

            {(selectedFolder || selectedSubfolder) && (
              <button
                type="button"
                onClick={onClearFolderFilter}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5FA52] text-[#111317] text-xs font-semibold"
              >
                <Folder className="w-3 h-3" />
                <span>{selectedSubfolder || selectedFolder}</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter workflows..."
              className="px-3 py-1.5 rounded-xl bg-[#F2F4F7] dark:bg-[#282a2d] border border-transparent dark:border-white/[0.06] text-xs text-slate-900 dark:text-white placeholder:text-[#8E929C] focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white/30"
            />
            <button
              type="button"
              onClick={onOpenNewWorkflow}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#141518] dark:bg-white text-white dark:text-[#111317] text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#8E929C]">
              No workflows match the current filter.
            </div>
          ) : (
            filtered.map((wf) => {
              const isRunning = runningWorkflowId === wf.id;
              const linkedAgentName = agentNameById.get(wf.linkedAgentId) || 'Multi-Agent Router';

              return (
                <div
                  key={wf.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#F2F4F7] dark:bg-[#282a2d] border border-transparent dark:border-white/[0.06] flex items-center justify-center text-slate-700 dark:text-[#c4c7c9] shrink-0 mt-0.5">
                      <WorkflowIcon icon={wf.icon} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {wf.name}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#282a2d] text-[#8E929C]">
                          {wf.subfolder || wf.folder}
                        </span>
                        {wf.isLive && wf.status === 'active' && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-[#4edea3] bg-emerald-50 dark:bg-[#4edea3]/10 px-2 py-0.5 rounded-full font-medium">
                            <span className="w-1 h-1 rounded-full bg-emerald-600 dark:bg-[#4edea3]" />
                            Live
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8E929C] mt-0.5">
                        {wf.integrations} · {wf.runsCount} runs
                      </p>
                      <p className="text-xs text-slate-600 dark:text-[#c4c7c9] mt-1">
                        {wf.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onInspectAgent(wf.linkedAgentId)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F2F4F7] dark:bg-[#282a2d] hover:bg-slate-200 dark:hover:bg-[#333538] text-xs font-medium text-slate-700 dark:text-[#e2e2e6] transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5 text-[#D96B43]" />
                      <span>{linkedAgentName}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onToggleWorkflowStatus(
                          wf.id,
                          wf.status === 'active' ? 'paused' : 'active'
                        )
                      }
                      aria-label={wf.status === 'active' ? `Pause ${wf.name}` : `Resume ${wf.name}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F2F4F7] dark:bg-[#282a2d] hover:bg-slate-200 dark:hover:bg-[#333538] text-xs font-medium text-slate-700 dark:text-[#e2e2e6] transition-colors"
                    >
                      {wf.status === 'active' ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Activate</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onRunWorkflow(wf)}
                      disabled={Boolean(runningWorkflowId)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#141518] dark:bg-white text-white dark:text-[#111317] text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Run now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
