import React, { useState, useMemo } from 'react';
import { Lock, ChevronRight, Loader2, RefreshCw, Plus } from 'lucide-react';
import type {
  ApprovalItem,
  OrchestratorStats,
  TimeframeOption,
  WorkflowItem,
  WorkflowStatus,
} from '../../types/agent';
import { RunsMatrixChart } from './RunsMatrixChart';
import { WorkflowIcon } from './WorkflowIcon';

interface FieldnoteOverviewProps {
  timeframe: TimeframeOption;
  workflows: WorkflowItem[];
  approvals: ApprovalItem[];
  stats: OrchestratorStats;
  runningWorkflowId: string | null;
  decidingApprovalId: string | null;
  searchQuery?: string;
  isDemoMode?: boolean;
  isRefreshing?: boolean;
  onOpenRunLog: () => void;
  onOpenAllWorkflows: () => void;
  onOpenApprovalsQueue: () => void;
  onRunWorkflow: (workflow: WorkflowItem) => void;
  onDecideApproval: (approvalId: string, decision: 'approved' | 'declined') => void;
  onBatchDecideApprovals: (decision: 'approved' | 'declined') => void;
  onTimeframeChange?: (timeframe: TimeframeOption) => void;
  onNewWorkflow?: () => void;
  onRefresh?: () => void;
  onLoadDemoData?: () => void;
}

export function FieldnoteOverview({
  timeframe,
  workflows,
  approvals,
  stats,
  runningWorkflowId,
  decidingApprovalId,
  searchQuery = '',
  isDemoMode = false,
  isRefreshing = false,
  onOpenRunLog,
  onOpenAllWorkflows,
  onOpenApprovalsQueue,
  onRunWorkflow,
  onDecideApproval,
  onBatchDecideApprovals,
  onTimeframeChange,
  onNewWorkflow,
  onRefresh,
  onLoadDemoData,
}: FieldnoteOverviewProps) {
  const [workflowTab, setWorkflowTab] = useState<WorkflowStatus>('active');
  const [showAllWorkflows, setShowAllWorkflows] = useState(false);

  const counts = useMemo(
    () => ({
      active: workflows.filter((w) => w.status === 'active').length,
      paused: workflows.filter((w) => w.status === 'paused').length,
      draft: workflows.filter((w) => w.status === 'draft').length,
    }),
    [workflows]
  );

  const filteredWorkflows = useMemo(() => {
    let list = workflows.filter((w) => w.status === workflowTab);
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (w) => w.name.toLowerCase().includes(q) || w.integrations.toLowerCase().includes(q)
      );
    }
    return list;
  }, [workflows, workflowTab, searchQuery]);

  const visibleWorkflows = useMemo(
    () => (showAllWorkflows ? filteredWorkflows : filteredWorkflows.slice(0, 5)),
    [filteredWorkflows, showAllWorkflows]
  );

  const pendingApprovals = useMemo(
    () => approvals.filter((a) => a.status === 'pending'),
    [approvals]
  );

  const primaryApproval = pendingApprovals[0] ?? null;
  const secondaryApprovals = pendingApprovals.slice(1, 3);

  return (
    <div className="flex flex-col gap-3">
      {/* Top Header matching Fieldnote Overview */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E929C]">
            FIELDNOTE / OVERVIEW
          </div>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Overview
            </h1>
            <span className="text-xs sm:text-sm text-[#8E929C] dark:text-slate-400 font-normal">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })} · {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe pill switcher */}
          <div className="inline-flex items-center bg-white dark:bg-[#1e2023] p-1 rounded-full border border-slate-200/80 dark:border-white/[0.08] shadow-xs text-xs font-medium">
            {(['today', '7d', '30d'] as TimeframeOption[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => onTimeframeChange?.(tf)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[#111317] dark:bg-white text-white dark:text-[#111317] font-semibold shadow-xs'
                    : 'text-[#8E929C] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tf === 'today' ? 'Today' : tf === '7d' ? '7 days' : '30 days'}
              </button>
            ))}
          </div>

          {/* Refresh icon */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Rafraîchir la télémétrie et l'état des agents"
            className="w-8 h-8 rounded-full bg-white dark:bg-[#1e2023] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition shadow-xs cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-500' : ''}`} />
          </button>

          {/* New Workflow button */}
          <button
            type="button"
            onClick={onNewWorkflow}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#111317] dark:bg-white text-white dark:text-[#111317] text-xs font-semibold hover:bg-black dark:hover:bg-slate-200 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New workflow</span>
          </button>
        </div>
      </div>

      <RunsMatrixChart
        timeframe={timeframe}
        extraRunsToday={stats.totalRuns}
        liveSuccessRate={stats.totalRuns > 0 ? stats.successRate : null}
        liveAgentsRunning={stats.runningCount}
        liveFailedCount={stats.errorCount}
        isDemoMode={isDemoMode}
        onOpenRunLog={onOpenRunLog}
      />

      {/* Bottom Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Workflows Card (Col 8) */}
        <section
          aria-label="Workflows summary"
          className="lg:col-span-8 bg-white dark:bg-[#1e2023] rounded-[20px] p-4 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] border border-white dark:border-white/[0.06] flex flex-col justify-between"
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Workflows
                </h2>
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setWorkflowTab('active')}
                    className={`px-2.5 py-0.5 rounded-md transition-colors ${
                      workflowTab === 'active'
                        ? 'bg-slate-100 dark:bg-[#282a2d] font-medium text-black dark:text-white border border-transparent dark:border-white/[0.08]'
                        : 'text-[#8E929C] hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Active <span className="text-[#8E929C] font-normal tabular-nums">{counts.active}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkflowTab('paused')}
                    className={`px-2.5 py-0.5 rounded-md transition-colors ${
                      workflowTab === 'paused'
                        ? 'bg-slate-100 dark:bg-[#282a2d] font-medium text-black dark:text-white border border-transparent dark:border-white/[0.08]'
                        : 'text-[#8E929C] hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Paused <span className="text-[#8E929C] font-normal tabular-nums">{counts.paused}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkflowTab('draft')}
                    className={`px-2.5 py-0.5 rounded-md transition-colors ${
                      workflowTab === 'draft'
                        ? 'bg-slate-100 dark:bg-[#282a2d] font-medium text-black dark:text-white border border-transparent dark:border-white/[0.08]'
                        : 'text-[#8E929C] hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Drafts <span className="text-[#8E929C] font-normal tabular-nums">{counts.draft}</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAllWorkflows((prev) => !prev);
                  onOpenAllWorkflows?.();
                }}
                className="text-xs text-[#8E929C] hover:text-black dark:hover:text-white font-medium inline-flex items-center gap-1 transition-colors"
              >
                <span>{showAllWorkflows ? 'Top 5' : `All ${workflows.length}`}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 text-[10px] uppercase font-semibold text-[#8E929C] tracking-wider px-2 py-1.5 border-b border-slate-100 dark:border-white/[0.08]">
              <span className="col-span-6">Workflow</span>
              <span className="col-span-4">Last 30 runs</span>
              <span className="col-span-2 text-right">Status</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-50 dark:divide-white/[0.05] text-xs">
              {workflows.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
                    Phase T0 : Zéro flux de travail configuré
                  </p>
                  <p className="text-[11px] text-[#8E929C] mb-4 max-w-sm mx-auto">
                    Votre espace de travail souverain est prêt. Vous pouvez créer un flux sur mesure ou charger les modèles d'exemple.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={onNewWorkflow}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#111317] dark:bg-white text-white dark:text-[#111317] text-xs font-semibold hover:opacity-90 transition shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Créer un workflow</span>
                    </button>
                    {onLoadDemoData && (
                      <button
                        type="button"
                        onClick={onLoadDemoData}
                        className="px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        Charger la démo
                      </button>
                    )}
                  </div>
                </div>
              ) : visibleWorkflows.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8E929C]">
                  Aucun workflow dans l'onglet {workflowTab} {searchQuery ? `correspondant à "${searchQuery}"` : ''}.
                </div>
              ) : (
                visibleWorkflows.map((wf) => {
                  const isRunningWf = runningWorkflowId === wf.id;
                  return (
                    <button
                      key={wf.id}
                      type="button"
                      onClick={() => onRunWorkflow(wf)}
                      disabled={Boolean(runningWorkflowId)}
                      title="Click to run workflow with linked Agent Orbit AI"
                      className="w-full text-left grid grid-cols-12 items-center px-2 py-3 hover:bg-slate-50/80 dark:hover:bg-white/[0.03] rounded-xl transition-colors disabled:opacity-60"
                    >
                      <div className="col-span-6 flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-lg bg-[#F2F4F7] dark:bg-[#282a2d] border border-transparent dark:border-white/[0.06] flex items-center justify-center text-slate-600 dark:text-[#c4c7c9] shrink-0">
                          {isRunningWf ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <WorkflowIcon icon={wf.icon} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 dark:text-[#e2e2e6] truncate">
                            {wf.name}
                          </div>
                          <div className="text-[11px] text-[#8E929C] truncate">
                            {wf.integrations}
                          </div>
                        </div>
                      </div>

                      {/* Mini Sparkline Histogram */}
                      <div className="col-span-4 flex items-center gap-0.5" aria-hidden="true">
                        {wf.sparkline.map((barVal, idx) => {
                          const heightPx = barVal <= 0 ? 12 : Math.max(12, Math.min(20, barVal * 2));
                          return (
                            <span
                              key={idx}
                              style={{ height: `${heightPx}px` }}
                              className={`w-1 rounded-[1px] ${
                                barVal > 0
                                  ? 'bg-[#111317] dark:bg-[#e2e2e6]'
                                  : 'bg-slate-200 dark:bg-[#333538]'
                              }`}
                            />
                          );
                        })}
                      </div>

                      <div className="col-span-2 text-right">
                        {isRunningWf ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-300 font-medium">
                            Running...
                          </span>
                        ) : wf.isLive && wf.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-[#4edea3] bg-emerald-50 dark:bg-[#4edea3]/10 border border-transparent dark:border-[#4edea3]/20 px-2 py-0.5 rounded-full font-medium">
                            <span className="w-1 h-1 rounded-full bg-emerald-600 dark:bg-[#4edea3]" />
                            {wf.statusLabel}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#8E929C] font-mono">
                            {wf.statusLabel}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Needs You Approvals Card (Col 4) */}
        <section
          aria-label="Needs you approval queue"
          className="lg:col-span-4 bg-white dark:bg-[#1e2023] rounded-[20px] p-4 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] border border-white dark:border-white/[0.06] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Needs you
                </h2>
                <span className="w-4 h-4 rounded-full bg-[#E5FA52] text-[#111317] font-semibold text-[10px] flex items-center justify-center tabular-nums">
                  {pendingApprovals.length}
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenApprovalsQueue}
                className="text-xs text-[#8E929C] hover:text-black dark:hover:text-white font-medium inline-flex items-center gap-1 transition-colors"
              >
                <span>Open queue</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="py-10 px-4 text-center rounded-2xl bg-[#F8F9FA] dark:bg-[#1a1c1f] border border-slate-100 dark:border-white/[0.06]">
                <p className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
                  File d'approbations ZTNA à jour
                </p>
                <p className="text-[11px] text-[#8E929C]">
                  Aucune demande en attente de signature souveraine (Phase T0).
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {primaryApproval && (
                  <div className="p-3 bg-[#F8F9FA] dark:bg-[#282a2d] rounded-2xl border border-slate-100 dark:border-white/[0.08] shadow-xs">
                    <div className="flex items-center justify-between text-[11px] text-[#8E929C] mb-1">
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        {primaryApproval.locked && <Lock className="w-3 h-3" />}
                        {primaryApproval.id}
                      </span>
                      <span>{primaryApproval.ageLabel}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white mb-0.5">
                      {primaryApproval.title}
                    </div>
                    <div className="text-[11px] text-[#8E929C] mb-3">
                      {primaryApproval.subtitle}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={decidingApprovalId === primaryApproval.id}
                        onClick={() =>
                          onDecideApproval(primaryApproval.id, 'approved')
                        }
                        className="flex-1 py-1.5 bg-[#141518] dark:bg-white hover:bg-black dark:hover:bg-[#e1e2e4] text-white dark:text-[#111317] text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={decidingApprovalId === primaryApproval.id}
                        onClick={() =>
                          onDecideApproval(primaryApproval.id, 'declined')
                        }
                        className="flex-1 py-1.5 bg-white dark:bg-[#1a1c1f] hover:bg-slate-100 dark:hover:bg-[#333538] text-slate-700 dark:text-[#e2e2e6] text-xs font-medium rounded-xl border border-slate-200 dark:border-white/[0.1] transition disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                {secondaryApprovals.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={onOpenApprovalsQueue}
                    className="w-full text-left p-3 bg-white dark:bg-[#1a1c1f] hover:bg-slate-50/80 dark:hover:bg-[#282a2d] rounded-2xl border border-slate-100 dark:border-white/[0.06] transition"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#8E929C] mb-1">
                      <span className="font-mono text-[10px]">{item.id}</span>
                      <span>{item.ageLabel}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-[#e2e2e6] mb-0.5">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#8E929C] leading-tight">
                      {item.subtitle}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer Quick Batch Actions */}
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between text-[11px] text-[#8E929C]">
            <span>
              {pendingApprovals.length > 0 ? 'Avg wait 14 min' : 'Queue clear'}
            </span>
            {pendingApprovals.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onBatchDecideApprovals('approved')}
                  className="hover:text-black dark:hover:text-white font-medium"
                >
                  Approve
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => onBatchDecideApprovals('declined')}
                  className="hover:text-black dark:hover:text-white font-medium"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

