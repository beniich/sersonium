import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Zap,
  Bot,
  CheckCircle2,
  History,
  LayoutDashboard,
  Layers,
  X,
} from 'lucide-react';
import { SENSORIUM_RUBRIQUES, SENSORIUM_TOTAL_SERVICES } from '../../data/sensoriumCatalog';
import type {
  Agent,
  ApprovalItem,
  Group,
  SensoriumRubrique,
  WorkflowItem,
  WorkspaceView,
} from '../../types/agent';

interface CommandPaletteModalProps {
  isOpen: boolean;
  groups: Group[];
  workflows: WorkflowItem[];
  approvals: ApprovalItem[];
  onClose: () => void;
  onNavigateView: (view: WorkspaceView) => void;
  onSelectAgent: (agent: Agent) => void;
  onSelectWorkflow: (workflow: WorkflowItem) => void;
  onSelectRubrique: (rubrique: SensoriumRubrique) => void;
}

export function CommandPaletteModal({
  isOpen,
  groups,
  workflows,
  approvals,
  onClose,
  onNavigateView,
  onSelectAgent,
  onSelectWorkflow,
  onSelectRubrique,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchedAgents: { agent: Agent; groupTitle: string }[] = [];
    for (const group of groups) {
      for (const agent of group.agents) {
        if (
          !q ||
          agent.name.toLowerCase().includes(q) ||
          group.title.toLowerCase().includes(q) ||
          (agent.platform?.toLowerCase().includes(q) ?? false)
        ) {
          matchedAgents.push({ agent, groupTitle: group.title });
        }
      }
    }

    const matchedWorkflows = workflows.filter(
      (w) =>
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.integrations.toLowerCase().includes(q) ||
        w.folder.toLowerCase().includes(q)
    );

    const matchedRubriques = SENSORIUM_RUBRIQUES.filter(
      (r) =>
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.pillar.toLowerCase().includes(q) ||
        r.services.some((s) => s.name.toLowerCase().includes(q))
    );

    const matchedApprovals = approvals.filter(
      (a) =>
        a.status === 'pending' &&
        (!q ||
          a.title.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.subtitle.toLowerCase().includes(q))
    );

    return {
      agents: matchedAgents.slice(0, 5),
      workflows: matchedWorkflows.slice(0, 4),
      rubriques: matchedRubriques.slice(0, 5),
      approvals: matchedApprovals.slice(0, 3),
    };
  }, [query, groups, workflows, approvals]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/35 dark:bg-black/65"
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#1e2023] border border-slate-200 dark:border-white/[0.1] shadow-2xl overflow-hidden z-10"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-white/[0.08]">
          <Search className="w-4 h-4 text-[#8E929C] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Jump to any service category (${SENSORIUM_TOTAL_SERVICES}), 36 AI agents, or workflow...`}
            className="flex-1 bg-transparent text-sm text-[#111317] dark:text-white placeholder:text-[#8E929C] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-1 rounded-lg text-[#8E929C] hover:text-[#111317] dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2 space-y-3">
          {/* Quick Navigation */}
          <div>
            <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8E929C]">
              Views
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
              {[
                { id: 'overview' as WorkspaceView, label: 'Overview', icon: LayoutDashboard },
                { id: 'orbit' as WorkspaceView, label: 'Agent Orbit (36)', icon: Bot },
                {
                  id: 'services' as WorkspaceView,
                  label: `Services (${SENSORIUM_TOTAL_SERVICES})`,
                  icon: Layers,
                },
                { id: 'workflows' as WorkspaceView, label: 'Workflows', icon: Zap },
                { id: 'history' as WorkspaceView, label: 'Run history', icon: History },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNavigateView(item.id);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-[#e2e2e6] hover:bg-slate-100 dark:hover:bg-[#282a2d] transition-colors text-left"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#8E929C] shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories & Services (128) */}
          {results.rubriques.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8E929C]">
                SENSORIUM Categories ({SENSORIUM_TOTAL_SERVICES} services)
              </div>
              <div className="space-y-0.5">
                {results.rubriques.map((rubrique) => (
                  <button
                    key={rubrique.id}
                    type="button"
                    onClick={() => {
                      onSelectRubrique(rubrique);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-[#282a2d] transition-colors text-left"
                  >
                    <span className="font-medium text-[#111317] dark:text-white truncate">
                      {rubrique.title}
                    </span>
                    <span className="text-[11px] text-[#8E929C] shrink-0 ml-2 tabular-nums">
                      {rubrique.count} services
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Workflows */}
          {results.workflows.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8E929C]">
                Workflows
              </div>
              <div className="space-y-0.5">
                {results.workflows.map((wf) => (
                  <button
                    key={wf.id}
                    type="button"
                    onClick={() => {
                      onSelectWorkflow(wf);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-[#282a2d] transition-colors text-left"
                  >
                    <span className="font-medium text-[#111317] dark:text-white truncate">
                      {wf.name}
                    </span>
                    <span className="text-[11px] text-[#8E929C] shrink-0 ml-2">
                      {wf.integrations}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Agents */}
          {results.agents.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8E929C]">
                AI Agents
              </div>
              <div className="space-y-0.5">
                {results.agents.map(({ agent, groupTitle }) => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => {
                      onSelectAgent(agent);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-[#282a2d] transition-colors text-left"
                  >
                    <span className="font-medium text-[#111317] dark:text-white truncate">
                      {agent.name}
                    </span>
                    <span className="text-[11px] text-[#8E929C] shrink-0 ml-2">
                      {groupTitle}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pending Approvals */}
          {results.approvals.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8E929C]">
                Needs you
              </div>
              <div className="space-y-0.5">
                {results.approvals.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNavigateView('approvals');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-[#282a2d] transition-colors text-left"
                  >
                    <span className="inline-flex items-center gap-2 font-medium text-[#111317] dark:text-white truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8E929C]" />
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono text-[#8E929C] shrink-0 ml-2">
                      {item.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

