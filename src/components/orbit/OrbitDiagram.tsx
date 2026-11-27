import React from 'react';
import { motion } from 'motion/react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import type { Agent, Group } from '../../types/agent';
import { AgentIcon, StarburstMark } from './AgentIcon';

interface OrbitDiagramProps {
  groups: Group[];
  selectedAgentId: string | null;
  matchingAgentIds?: Set<string>;
  targetedAgentIds?: Set<string>;
  hasActiveFilter?: boolean;
  onSelectAgent: (agent: Agent, group: Group) => void;
}

const LEFT_POSITIONS: Group['position'][] = ['top-left', 'middle-left', 'bottom-left'];
const RIGHT_POSITIONS: Group['position'][] = ['top-right', 'middle-right', 'bottom-right'];

function GroupCard({
  group,
  index = 0,
  selectedAgentId,
  matchingAgentIds,
  targetedAgentIds,
  hasActiveFilter,
  onSelectAgent,
}: {
  group: Group;
  index?: number;
  selectedAgentId: string | null;
  matchingAgentIds?: Set<string>;
  targetedAgentIds?: Set<string>;
  hasActiveFilter?: boolean;
  onSelectAgent: (agent: Agent, group: Group) => void;
}) {
  const matchCount =
    hasActiveFilter && matchingAgentIds
      ? group.agents.filter((agent) => matchingAgentIds.has(agent.id)).length
      : group.agents.length;

  return (
    <motion.section
      aria-label={`${group.title} agent group`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05, ease: 'easeOut' }}
      className="w-full bg-white dark:bg-[#1e2023] rounded-2xl border border-slate-200/70 dark:border-white/[0.06] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_28px_-8px_rgba(15,23,42,0.1)] hover:-translate-y-0.5 dark:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.45)] px-3.5 py-2.5 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-1.5 px-1.5">
        <h2 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {group.title}
        </h2>
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tabular-nums">
          {hasActiveFilter
            ? `${matchCount}/${group.agents.length} ${group.agents.length === 1 ? 'agent' : 'agents'}`
            : `${group.agents.length} ${group.agents.length === 1 ? 'agent' : 'agents'}`}
        </span>
      </div>

      <ul className="space-y-0.5">
        {group.agents.map((agent) => {
          const isSelected = selectedAgentId === agent.id;
          const isHighlighted = Boolean(agent.highlighted);
          const isCommandTargeted = Boolean(targetedAgentIds?.has(agent.id));
          const isDimmed = Boolean(
            hasActiveFilter && matchingAgentIds && !matchingAgentIds.has(agent.id)
          );

          return (
            <li key={agent.id}>
              <button
                type="button"
                onClick={() => onSelectAgent(agent, group)}
                aria-pressed={isSelected}
                data-dimmed={isDimmed ? 'true' : 'false'}
                data-command-target={isCommandTargeted ? 'true' : 'false'}
                className={`w-full flex items-center gap-2 px-2 py-[3px] rounded-lg text-[12px] text-left transition-all duration-150 hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D96B43] ${
                  isDimmed ? 'opacity-30 hover:opacity-75' : 'opacity-100'
                } ${
                  isCommandTargeted
                    ? 'bg-yellow-400/15 dark:bg-yellow-400/[0.14] text-slate-950 dark:text-yellow-100 font-semibold ring-1 ring-yellow-400/80 shadow-[0_0_12px_-3px_rgba(250,204,21,0.45)]'
                    : isSelected
                    ? 'bg-[#FCE8DF] dark:bg-orange-500/25 text-slate-950 dark:text-white font-semibold ring-1 ring-[#E07A5F]/60'
                    : isHighlighted
                    ? 'bg-gradient-to-r from-[#FDF0EA] to-[#FDF7F4] dark:from-orange-500/15 dark:to-orange-500/5 text-slate-900 dark:text-orange-100 font-semibold hover:from-[#FCE6DC]'
                    : 'text-slate-600 dark:text-[#c4c7c9] font-medium hover:bg-slate-100/80 dark:hover:bg-[#282a2d] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <AgentIcon icon={agent.icon} highlighted={isHighlighted || isSelected} />
                <span className="truncate flex-1">{agent.name}</span>

                {isCommandTargeted && agent.status !== 'running' && (
                  <span
                    className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-yellow-700 dark:text-yellow-300 shrink-0"
                    aria-label="Targeted by dialogue bar"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  </span>
                )}
                {agent.status === 'running' && (
                  <Loader2
                    className="w-3.5 h-3.5 animate-spin text-[#D96B43] shrink-0"
                    aria-label="Running"
                  />
                )}
                {agent.status === 'success' && (
                  <Check
                    className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                    aria-label="Last run succeeded"
                  />
                )}
                {agent.status === 'error' && (
                  <AlertCircle
                    className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0"
                    aria-label="Last run failed"
                  />
                )}
                {isHighlighted &&
                  !isCommandTargeted &&
                  agent.status !== 'running' &&
                  agent.status !== 'success' &&
                  agent.status !== 'error' && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] orbit-dot-pulse shrink-0"
                      aria-hidden="true"
                    />
                  )}
              </button>
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
}

export function OrbitDiagram({
  groups,
  selectedAgentId,
  matchingAgentIds,
  targetedAgentIds,
  hasActiveFilter,
  onSelectAgent,
}: OrbitDiagramProps) {
  const hasCommandTargets = Boolean(targetedAgentIds && targetedAgentIds.size > 0);
  const leftGroups = LEFT_POSITIONS.map((pos) => groups.find((g) => g.position === pos)).filter(
    (g): g is Group => Boolean(g)
  );
  const rightGroups = RIGHT_POSITIONS.map((pos) => groups.find((g) => g.position === pos)).filter(
    (g): g is Group => Boolean(g)
  );

  const slottedIds = new Set([...leftGroups, ...rightGroups].map((g) => g.id));
  const extraGroups = groups.filter((g) => !slottedIds.has(g.id));

  const rowPairs = [0, 1, 2].map((index) => ({
    left: leftGroups[index],
    right: rightGroups[index],
  }));

  return (
    <div data-testid="orbit-canvas" className="w-full max-w-[1180px] mx-auto">
      {/* Mobile / Tablet Compact Hub Header */}
      <div className="xl:hidden mb-3 flex items-center justify-between gap-3 rounded-2xl bg-white dark:bg-[#1e2023] border border-slate-200/80 dark:border-white/[0.06] p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#111317] dark:bg-[#282a2d] flex items-center justify-center p-2 shrink-0 border border-white/10">
            <img
              src="/assets/aistudio/ico_sensorium_1813a14b.png"
              alt="Sensorium AI"
              className="w-full h-full object-contain invert opacity-95"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Sensorium AI
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any agent to inspect or run
            </p>
          </div>
        </div>
        <span className="px-3.5 py-1 rounded-full bg-[#111317] dark:bg-white text-white dark:text-slate-950 text-xs font-semibold shrink-0">
          You
        </span>
      </div>

      {/* Desktop 3-Column x 3-Row Diagram matching reference image proportions */}
      <div className="hidden xl:grid xl:grid-cols-[minmax(280px,1fr)_184px_minmax(280px,1fr)] xl:grid-rows-3 items-stretch relative">
        {/* Center Stadium Loop & Connectors */}
        <div
          className="col-start-2 row-start-1 row-span-3 relative pointer-events-none select-none"
          aria-hidden="true"
        >
          {/* Short Horizontal Connector Lines aligned to the 3 row centers (16.6667%, 50%, 83.3333%) */}
          {[16.6667, 50, 83.3333].map((topPct) => (
            <React.Fragment key={topPct}>
              <div
                style={{ top: `${topPct}%` }}
                className="absolute left-0 right-[calc(50%+56px)] h-[1.5px] -translate-y-1/2 bg-slate-800 dark:bg-slate-300"
              />
              <div
                style={{ top: `${topPct}%` }}
                className="absolute left-[calc(50%+56px)] right-0 h-[1.5px] -translate-y-1/2 bg-slate-800 dark:bg-slate-300"
              />
            </React.Fragment>
          ))}

          {/* Narrow Vertical Stadium Loop Track (112px wide -> radius 56px) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[2.5%] bottom-[2.5%] w-[112px] rounded-[56px] border-[1.75px] border-slate-900 dark:border-slate-300">
            {/* Top Orange Arc Accent + Arrowhead pointing right (center 56,56, r=55.1) */}
            <svg
              viewBox="0 0 112 60"
              className="absolute -top-[1.75px] -left-[1.75px] w-[112px] h-[60px] overflow-visible"
              fill="none"
            >
              <path
                d="M 17 17 A 55.1 55.1 0 0 1 88 11"
                stroke="#D96B43"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <polygon points="82,4 95,13 80,16" fill="#D96B43" />
            </svg>

            {/* Bottom Orange Arc Accent (center 56,4, r=55.1) */}
            <svg
              viewBox="0 0 112 60"
              className="absolute -bottom-[1.75px] -left-[1.75px] w-[112px] h-[60px] overflow-visible"
              fill="none"
            >
              <path
                d="M 94 43 A 55.1 55.1 0 0 1 18 43"
                stroke="#D96B43"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>

            {/* Left Rail Upward Arrows */}
            <div className="absolute -left-[5.5px] top-[34%] text-[#D96B43] orbit-arrow-up">
              <svg width="9" height="18" viewBox="0 0 9 18" fill="currentColor">
                <path d="M4.5 0 L9 14 L4.5 11 L0 14 Z" />
              </svg>
            </div>
            <div
              className="absolute -left-[5.5px] top-[70%] text-[#D96B43] orbit-arrow-up"
              style={{ animationDelay: '1.3s' }}
            >
              <svg width="9" height="18" viewBox="0 0 9 18" fill="currentColor">
                <path d="M4.5 0 L9 14 L4.5 11 L0 14 Z" />
              </svg>
            </div>

            {/* Right Rail Downward Arrow */}
            <div
              className="absolute -right-[5.5px] top-[68%] text-[#D96B43] orbit-arrow-down"
              style={{ animationDelay: '0.6s' }}
            >
              <svg width="9" height="18" viewBox="0 0 9 18" fill="currentColor">
                <path d="M4.5 18 L9 4 L4.5 7 L0 4 Z" />
              </svg>
            </div>
          </div>

          {/* 6 Circular Junction Nodes on the left & right rails */}
          {[16.6667, 50, 83.3333].map((topPct) => (
            <React.Fragment key={`nodes-${topPct}`}>
              <div
                style={{ top: `${topPct}%` }}
                className="absolute left-[calc(50%-56px)] -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white dark:bg-slate-900 border-[1.75px] border-slate-900 dark:border-slate-200 z-10"
              />
              <div
                style={{ top: `${topPct}%` }}
                className="absolute left-[calc(50%+56px)] -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white dark:bg-slate-900 border-[1.75px] border-slate-900 dark:border-slate-200 z-10"
              />
            </React.Fragment>
          ))}

          {/* "You" Pill sitting on the upper-right rail */}
          <div className="absolute top-[33%] left-[calc(50%+56px)] -translate-x-1/2 -translate-y-1/2 z-20 px-4 py-1.5 rounded-full bg-[#111317] dark:bg-white text-white dark:text-slate-950 text-xs font-semibold shadow-md">
            You
          </div>

          {/* Central Sensorium AI Hub */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
          >
            <div
              className={`w-[62px] h-[62px] rounded-2xl bg-[#111317] dark:bg-[#1e2023] flex items-center justify-center p-3.5 transition-all duration-200 ${
                hasCommandTargets
                  ? 'border border-yellow-400/80 shadow-[0_0_24px_-4px_rgba(250,204,21,0.6)]'
                  : 'shadow-[0_12px_24px_-6px_rgba(15,23,42,0.38)] border border-slate-800 dark:border-white/[0.12]'
              }`}
            >
              <img
                src="/assets/aistudio/ico_sensorium_1813a14b.png"
                alt="Sensorium AI"
                className="w-full h-full object-contain invert opacity-95"
              />
            </div>
            <span className="mt-2 text-[11px] font-medium text-slate-600 dark:text-[#c4c7c9] whitespace-nowrap">
              Sensorium AI
            </span>
          </motion.div>
        </div>

        {/* Left & Right Group Cards */}
        {rowPairs.map(({ left, right }, rowIdx) => (
          <React.Fragment key={rowIdx}>
            <div
              className="col-start-1 flex items-center py-1"
              style={{ gridRowStart: rowIdx + 1 }}
            >
              {left && (
                <GroupCard
                  group={left}
                  index={rowIdx * 2}
                  selectedAgentId={selectedAgentId}
                  matchingAgentIds={matchingAgentIds}
                  targetedAgentIds={targetedAgentIds}
                  hasActiveFilter={hasActiveFilter}
                  onSelectAgent={onSelectAgent}
                />
              )}
            </div>
            <div
              className="col-start-3 flex items-center py-1"
              style={{ gridRowStart: rowIdx + 1 }}
            >
              {right && (
                <GroupCard
                  group={right}
                  index={rowIdx * 2 + 1}
                  selectedAgentId={selectedAgentId}
                  matchingAgentIds={matchingAgentIds}
                  targetedAgentIds={targetedAgentIds}
                  hasActiveFilter={hasActiveFilter}
                  onSelectAgent={onSelectAgent}
                />
              )}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Mobile / Tablet Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xl:hidden">
        {groups.map((group, index) => (
          <GroupCard
            key={group.id}
            group={group}
            index={index}
            selectedAgentId={selectedAgentId}
            matchingAgentIds={matchingAgentIds}
            targetedAgentIds={targetedAgentIds}
            hasActiveFilter={hasActiveFilter}
            onSelectAgent={onSelectAgent}
          />
        ))}
      </div>

      {extraGroups.length > 0 && (
        <div className="hidden xl:grid xl:grid-cols-3 gap-4 mt-4">
          {extraGroups.map((group, index) => (
            <GroupCard
              key={group.id}
              group={group}
              index={index}
              selectedAgentId={selectedAgentId}
              matchingAgentIds={matchingAgentIds}
              targetedAgentIds={targetedAgentIds}
              hasActiveFilter={hasActiveFilter}
              onSelectAgent={onSelectAgent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
