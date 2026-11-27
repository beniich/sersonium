import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Bot,
  X,
  ChevronsDownUp,
  ChevronsUpDown,
  Server,
} from 'lucide-react';
import {
  SENSORIUM_MODE_PILLS,
  SENSORIUM_RUBRIQUES,
  SENSORIUM_TOTAL_SERVICES,
} from '../../data/sensoriumCatalog';
import { filterSensoriumRubriques } from '../../utils/orchestrator';
import type { Group, SensoriumRubrique } from '../../types/agent';
import { RubriqueIcon } from './RubriqueIcon';

interface ServicesCatalogViewProps {
  groups: Group[];
  selectedRubriqueId: string | null;
  selectedPillar: SensoriumRubrique['pillar'] | null;
  onSelectRubrique: (rubriqueId: string | null) => void;
  onSelectPillar: (pillar: SensoriumRubrique['pillar'] | null) => void;
  onOpenOrbit: () => void;
  onInspectAgent: (agentId: string) => void;
}

export function ServicesCatalogView({
  groups,
  selectedRubriqueId,
  selectedPillar,
  onSelectRubrique,
  onSelectPillar,
  onOpenOrbit,
  onInspectAgent,
}: ServicesCatalogViewProps) {
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (selectedRubriqueId) return new Set([selectedRubriqueId]);
    return new Set([SENSORIUM_RUBRIQUES[0].id, SENSORIUM_RUBRIQUES[1].id]);
  });

  useEffect(() => {
    if (selectedRubriqueId) {
      setExpandedIds((prev) => new Set([...prev, selectedRubriqueId]));
    }
  }, [selectedRubriqueId]);

  const agentNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of groups) {
      for (const a of g.agents) {
        map.set(a.id, a.name);
      }
    }
    return map;
  }, [groups]);

  const filteredRubriques = useMemo(
    () =>
      filterSensoriumRubriques(SENSORIUM_RUBRIQUES, {
        query,
        rubriqueId: selectedRubriqueId,
        pillar: selectedPillar,
      }),
    [query, selectedRubriqueId, selectedPillar]
  );

  const visibleServicesCount = useMemo(
    () => filteredRubriques.reduce((sum, r) => sum + r.services.length, 0),
    [filteredRubriques]
  );

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedIds(new Set(filteredRubriques.map((r) => r.id)));
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <div className="space-y-3">
      {/* Unified Operational Pillar Strip + Tenant Context */}
      <section
        aria-label="SENSORIUM operational pillars"
        className="bg-white dark:bg-[#1e2023] rounded-[20px] p-3.5 sm:p-4 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] border border-white dark:border-white/[0.06] space-y-2.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-2 text-[#8E929C]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#111317] dark:text-white">
              <Server className="w-3.5 h-3.5 text-[#D96B43]" />
              SENSORIUM Demo Corp
            </span>
            <span>›</span>
            <span>Frankfurt Datacenter (EU-1 Cluster)</span>
            <span>›</span>
            <span>Rack #FRA-1</span>
            <span>›</span>
            <span className="text-emerald-600 dark:text-[#4edea3] font-medium">
              Live Telemetry
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 tabular-nums">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-[#4edea3]/10 text-emerald-700 dark:text-[#4edea3] font-medium">
              Security ZT 100%
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#E5FA52] text-[#111317] font-semibold">
              {SENSORIUM_TOTAL_SERVICES} available services
            </span>
          </div>
        </div>

        {/* Mode Pills from Reference Screenshot */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              onSelectPillar(null);
              onSelectRubrique(null);
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
              !selectedPillar && !selectedRubriqueId
                ? 'bg-[#141518] dark:bg-white text-white dark:text-[#111317]'
                : 'bg-[#F2F4F7] dark:bg-[#282a2d] text-[#8E929C] hover:text-black dark:hover:text-white'
            }`}
          >
            All categories (20)
          </button>

          {SENSORIUM_MODE_PILLS.map((pill) => {
            const isActive =
              pill.targetView === 'services' && selectedPillar === pill.pillarFilter;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => {
                  if (pill.targetView === 'orbit') {
                    onOpenOrbit();
                  } else if (pill.pillarFilter) {
                    onSelectRubrique(null);
                    onSelectPillar(
                      selectedPillar === pill.pillarFilter ? null : pill.pillarFilter
                    );
                  }
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  pill.targetView === 'orbit'
                    ? 'bg-[#FDF0EA] dark:bg-[#D96B43]/15 text-[#B84A24] dark:text-[#ffb69d] border border-[#D96B43]/30 hover:opacity-90'
                    : isActive
                    ? 'bg-[#141518] dark:bg-white text-white dark:text-[#111317]'
                    : 'bg-[#F2F4F7] dark:bg-[#282a2d] text-slate-700 dark:text-[#c4c7c9] hover:text-black dark:hover:text-white'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Search & Expand/Collapse Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-3.5 h-3.5 text-[#8E929C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter services..."
              aria-label="Filter services"
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F2F4F7] dark:bg-[#282a2d] border border-transparent dark:border-white/[0.06] text-xs text-slate-900 dark:text-white placeholder:text-[#8E929C] focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white/30"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear service search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E929C] hover:text-black dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(selectedRubriqueId || selectedPillar) && (
              <button
                type="button"
                onClick={() => {
                  onSelectRubrique(null);
                  onSelectPillar(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E5FA52] text-[#111317] text-xs font-semibold"
              >
                <span>
                  {selectedRubriqueId
                    ? SENSORIUM_RUBRIQUES.find((r) => r.id === selectedRubriqueId)?.title
                    : selectedPillar}
                </span>
                <X className="w-3 h-3" />
              </button>
            )}

            <button
              type="button"
              onClick={handleExpandAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F2F4F7] dark:bg-[#282a2d] hover:bg-slate-200 dark:hover:bg-[#333538] text-xs font-medium text-slate-700 dark:text-[#e2e2e6] transition-colors"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              <span>Expand all</span>
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F2F4F7] dark:bg-[#282a2d] hover:bg-slate-200 dark:hover:bg-[#333538] text-xs font-medium text-slate-700 dark:text-[#e2e2e6] transition-colors"
            >
              <ChevronsDownUp className="w-3.5 h-3.5" />
              <span>Collapse all</span>
            </button>
          </div>
        </div>
      </section>

      {/* Rubriques & Services Accordion Cards */}
      <div className="space-y-2.5">
        {filteredRubriques.length === 0 ? (
          <div className="bg-white dark:bg-[#1e2023] rounded-[20px] p-8 text-center text-xs text-[#8E929C] border border-white dark:border-white/[0.06]">
            No services match your filter.
          </div>
        ) : (
          filteredRubriques.map((rubrique) => {
            const isOpen = expandedIds.has(rubrique.id) || query.trim().length > 0;

            return (
              <section
                key={rubrique.id}
                aria-label={rubrique.title}
                className="bg-white dark:bg-[#1e2023] rounded-[18px] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] border border-white dark:border-white/[0.06] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleExpanded(rubrique.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#F2F4F7] dark:bg-[#282a2d] border border-transparent dark:border-white/[0.06] flex items-center justify-center text-slate-700 dark:text-[#e2e2e6] shrink-0">
                      <RubriqueIcon icon={rubrique.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xs sm:text-sm font-bold tracking-wide text-[#111317] dark:text-white truncate">
                          {rubrique.title}
                        </h2>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F2F4F7] dark:bg-[#282a2d] text-[#8E929C]">
                          {rubrique.pillar}
                        </span>
                      </div>
                      <p className="text-xs text-[#8E929C] truncate mt-0.5">
                        {rubrique.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F2F4F7] dark:bg-[#282a2d] text-xs font-semibold text-slate-800 dark:text-[#e2e2e6] tabular-nums">
                      {rubrique.services.length}
                    </span>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-[#8E929C]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#8E929C]" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-3.5 pt-2 border-t border-slate-100 dark:border-white/[0.06] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    {rubrique.services.map((svc) => {
                      const agentName =
                        agentNameById.get(svc.linkedAgentId) || 'Multi-Agent Router';
                      return (
                        <div
                          key={svc.id}
                          className="p-3 rounded-2xl bg-[#F8F9FA] dark:bg-[#1a1c1f] border border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  svc.status === 'degraded'
                                    ? 'bg-amber-400'
                                    : svc.status === 'standby'
                                    ? 'bg-slate-400'
                                    : 'bg-emerald-500 dark:bg-[#4edea3]'
                                }`}
                              />
                              <span className="text-xs font-semibold text-[#111317] dark:text-white truncate">
                                {svc.name}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-[#8E929C] mt-0.5 truncate">
                              {svc.latencyMs}ms · {rubrique.cluster}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onInspectAgent(svc.linkedAgentId)}
                            title={`Orchestrated by ${agentName}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#282a2d] hover:bg-slate-100 dark:hover:bg-[#333538] border border-slate-200/80 dark:border-white/[0.08] text-[11px] font-medium text-slate-800 dark:text-[#e2e2e6] shrink-0 transition-colors"
                          >
                            <Bot className="w-3 h-3 text-[#D96B43]" />
                            <span className="hidden sm:inline">{agentName}</span>
                            <span className="sm:hidden">Agent</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      <div className="text-[11px] text-[#8E929C] text-right font-mono tabular-nums px-1">
        {visibleServicesCount} / {SENSORIUM_TOTAL_SERVICES} service
        {visibleServicesCount === 1 ? '' : 's'} displayed · {filteredRubriques.length}{' '}
        {filteredRubriques.length === 1 ? 'category' : 'categories'}
      </div>
    </div>
  );
}
