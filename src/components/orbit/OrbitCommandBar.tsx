import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUp,
  AtSign,
  CheckCircle2,
  CornerDownLeft,
  HelpCircle,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import type { Group } from '../../types/agent';
import type { LiveOrderTarget } from '../../utils/commandParser';
import { AgentIcon } from './AgentIcon';

export interface CommandFeedbackState {
  tone: 'info' | 'success' | 'error';
  message: string;
}

interface OrbitCommandBarProps {
  groups?: Group[];
  commandDraft?: string;
  onChangeDraft?: (draft: string) => void;
  pinnedAgentId?: string | null;
  onSelectPinnedAgent?: (agentId: string | null) => void;
  liveTarget?: LiveOrderTarget;
  isBusy: boolean;
  feedback: CommandFeedbackState | null;
  commandHistory: string[];
  onDismissFeedback: () => void;
  onSubmitOrder: (order: string) => Promise<void> | void;
}

const QUICK_ORDER_PRESETS = [
  { label: 'Run Trend Scout', command: 'run Trend Scout: scan emerging TikTok hooks' },
  { label: 'Run Audience Listener', command: 'run Audience Listener: top Reddit pain points' },
  { label: 'Run Research Pillar (6)', command: 'run group Research' },
  { label: 'Run Content Pillar (6)', command: 'run group Content' },
  { label: 'Run All 36 Agents', command: 'run all' },
  { label: 'Run Viral Workflow', command: 'run workflow Viral Content' },
  { label: 'Check Agent Status', command: 'status' },
  { label: 'Reset All Agents', command: 'reset all' },
  { label: 'Show Commands', command: 'help' },
];

export function OrbitCommandBar({
  groups = [],
  commandDraft: externalDraft,
  onChangeDraft: externalOnChangeDraft,
  pinnedAgentId: externalPinnedAgentId,
  onSelectPinnedAgent: externalOnSelectPinnedAgent,
  liveTarget: externalLiveTarget,
  isBusy,
  feedback,
  commandHistory,
  onDismissFeedback,
  onSubmitOrder,
}: OrbitCommandBarProps) {
  const [internalDraft, setInternalDraft] = useState('');
  const [internalPinnedAgentId, setInternalPinnedAgentId] = useState<string | null>(null);

  const commandDraft = externalDraft !== undefined ? externalDraft : internalDraft;
  const onChangeDraft = externalOnChangeDraft || setInternalDraft;
  const pinnedAgentId = externalPinnedAgentId !== undefined ? externalPinnedAgentId : internalPinnedAgentId;
  const onSelectPinnedAgent = externalOnSelectPinnedAgent || setInternalPinnedAgentId;
  const liveTarget: LiveOrderTarget =
    externalLiveTarget || { agentIds: [], label: 'All 36 Agents', kind: 'none' };
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isAgentPickerOpen, setIsAgentPickerOpen] = useState(false);
  const [agentQuery, setAgentQuery] = useState('');
  const [barSize, setBarSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const agentSearchRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const totalAgentsCount = useMemo(
    () => groups.reduce((sum, g) => sum + g.agents.length, 0),
    [groups]
  );

  const pinnedContext = useMemo(() => {
    if (!pinnedAgentId) return null;
    for (const group of groups) {
      const agent = group.agents.find((a) => a.id === pinnedAgentId);
      if (agent) return { agent, group };
    }
    return null;
  }, [groups, pinnedAgentId]);

  const filteredAgentGroups = useMemo(() => {
    const q = agentQuery.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => {
        const groupMatches = group.title.toLowerCase().includes(q);
        const agents = groupMatches
          ? group.agents
          : group.agents.filter(
              (a) =>
                a.name.toLowerCase().includes(q) ||
                a.id.toLowerCase().includes(q) ||
                (a.platform?.toLowerCase().includes(q) ?? false) ||
                a.description.toLowerCase().includes(q)
            );
        return { ...group, agents };
      })
      .filter((g) => g.agents.length > 0);
  }, [groups, agentQuery]);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setBarSize((prev) =>
        Math.abs(prev.width - rect.width) < 0.5 && Math.abs(prev.height - rect.height) < 0.5
          ? prev
          : { width: rect.width, height: rect.height }
      );
    };
    updateSize();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isPresetsOpen && !isAgentPickerOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsPresetsOpen(false);
        setIsAgentPickerOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPresetsOpen(false);
        setIsAgentPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isPresetsOpen, isAgentPickerOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    const trimmed = commandDraft.trim();
    if (!trimmed && !pinnedContext) return;

    const orderToSend =
      trimmed ||
      (pinnedContext
        ? `run ${pinnedContext.agent.name}: ${pinnedContext.agent.description}`
        : '');
    if (!orderToSend) return;

    onChangeDraft('');
    setHistoryIndex(-1);
    setIsPresetsOpen(false);
    setIsAgentPickerOpen(false);
    await onSubmitOrder(orderToSend);
  };

  const handleDraftInputChange = (val: string) => {
    onChangeDraft(val);
    setHistoryIndex(-1);

    // Automatically open & filter 36-agent directory when user types "@..."
    if (val.startsWith('@') && !val.includes(':')) {
      setIsPresetsOpen(false);
      setIsAgentPickerOpen(true);
      setAgentQuery(val.slice(1));
    } else if (isAgentPickerOpen && val.startsWith('@')) {
      setIsAgentPickerOpen(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !commandDraft && pinnedContext) {
      onSelectPinnedAgent(null);
      return;
    }
    if (commandHistory.length === 0) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
      setHistoryIndex(nextIndex);
      onChangeDraft(commandHistory[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        onChangeDraft('');
      } else {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        onChangeDraft(commandHistory[nextIndex]);
      }
    }
  };

  const handleSelectAgentFromPicker = (agentId: string) => {
    onSelectPinnedAgent(agentId);
    if (commandDraft.startsWith('@')) {
      onChangeDraft('');
    }
    setIsAgentPickerOpen(false);
    setAgentQuery('');
    inputRef.current?.focus();
  };

  const svgPad = 10;

  return (
    <div
      ref={wrapperRef}
      data-testid="orbit-command-bar"
      className="relative z-30 pt-1 pb-0.5"
    >
      <div className="max-w-3xl mx-auto relative">
        {/* Live Feedback Toast anchored above Command Bar (hidden while popovers are open) */}
        <AnimatePresence>
          {feedback && !isPresetsOpen && !isAgentPickerOpen && (
            <motion.div
              role="status"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.16 }}
              className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[min(42rem,calc(100vw-3rem))] px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 shadow-xl backdrop-blur-md z-40 ${
                feedback.tone === 'error'
                  ? 'bg-rose-50/95 dark:bg-rose-950/95 border-rose-200 dark:border-rose-800/70 text-rose-700 dark:text-rose-200'
                  : feedback.tone === 'success'
                    ? 'bg-emerald-50/95 dark:bg-[#132620]/95 border-emerald-200 dark:border-[#4edea3]/30 text-emerald-800 dark:text-[#4edea3]'
                    : 'bg-white/95 dark:bg-[#1e2023]/95 border-yellow-400/50 text-amber-800 dark:text-yellow-200'
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                {feedback.tone === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="truncate sm:whitespace-normal">{feedback.message}</span>
              </span>
              <button
                type="button"
                onClick={onDismissFeedback}
                aria-label="Dismiss command feedback"
                className="p-0.5 rounded opacity-70 hover:opacity-100 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Order Presets Popover anchored above left "+" button */}
        <AnimatePresence>
          {isPresetsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              role="menu"
              aria-label="Quick order templates"
              className="absolute bottom-full left-0 mb-2 w-full sm:w-[440px] rounded-2xl bg-white dark:bg-[#1a1c1f] border border-slate-200 dark:border-white/[0.1] shadow-2xl p-2 z-50"
            >
              <div className="px-2.5 py-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-[#8E929C]">
                <span className="inline-flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-[#D96B43]" />
                  Quick Order Templates
                </span>
                <span>Click to insert</span>
              </div>
              <div className="mt-1 space-y-0.5 max-h-[300px] overflow-y-auto">
                {QUICK_ORDER_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onSelectPinnedAgent(null);
                      onChangeDraft(preset.command);
                      setIsPresetsOpen(false);
                      inputRef.current?.focus();
                    }}
                    className="w-full flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-xl text-left text-xs hover:bg-slate-100 dark:hover:bg-[#282a2d] transition-colors"
                  >
                    <span className="font-medium text-slate-800 dark:text-white shrink-0">
                      {preset.label}
                    </span>
                    <span className="text-[10px] font-mono text-[#8E929C] truncate">
                      {preset.command}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 36-Agent Directory Picker Popover anchored above "@ 36" button */}
        <AnimatePresence>
          {isAgentPickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              role="dialog"
              aria-label="Link order to any of the 36 AI agents"
              data-testid="agent-picker-popover"
              className="absolute bottom-full left-0 mb-2 w-full sm:w-[540px] rounded-2xl bg-white dark:bg-[#1a1c1f] border border-yellow-400/35 dark:border-yellow-400/25 shadow-2xl p-2.5 z-50"
            >
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-white/[0.08]">
                <div className="flex items-center gap-2 flex-1 min-w-0 bg-slate-100/80 dark:bg-[#24262a] rounded-xl px-2.5 py-1.5">
                  <Search className="w-3.5 h-3.5 text-[#8E929C] shrink-0" />
                  <input
                    ref={agentSearchRef}
                    type="text"
                    value={agentQuery}
                    onChange={(e) => setAgentQuery(e.target.value)}
                    placeholder={`Search across ${totalAgentsCount} agents or 6 pillars...`}
                    aria-label="Filter 36 agents"
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-[#8E929C] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectPinnedAgent(null);
                    onChangeDraft('run all');
                    setIsAgentPickerOpen(false);
                    setAgentQuery('');
                    inputRef.current?.focus();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-yellow-400/15 hover:bg-yellow-400/25 border border-yellow-400/40 text-[11px] font-semibold text-amber-800 dark:text-yellow-200 whitespace-nowrap transition-colors"
                >
                  All {totalAgentsCount} Agents
                </button>
              </div>

              <div className="mt-2 max-h-[300px] overflow-y-auto space-y-2.5 pr-1">
                {filteredAgentGroups.length === 0 ? (
                  <p className="text-xs text-[#8E929C] text-center py-6">
                    No matching agent found.
                  </p>
                ) : (
                  filteredAgentGroups.map((group) => (
                    <div key={group.id}>
                      <div className="flex items-center justify-between px-1.5 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E929C]">
                          {group.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPinnedAgent(null);
                            onChangeDraft(`run group ${group.title}: `);
                            setIsAgentPickerOpen(false);
                            setAgentQuery('');
                            inputRef.current?.focus();
                          }}
                          className="text-[10px] font-medium text-amber-700 dark:text-yellow-300 hover:underline"
                        >
                          Run all {group.agents.length} in {group.title}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {group.agents.map((agent) => {
                          const isPinned = pinnedAgentId === agent.id;
                          return (
                            <button
                              key={agent.id}
                              type="button"
                              onClick={() => handleSelectAgentFromPicker(agent.id)}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded-xl text-left text-xs transition-colors ${
                                isPinned
                                  ? 'bg-yellow-400/15 border border-yellow-400/60 text-slate-950 dark:text-yellow-100 font-semibold'
                                  : 'hover:bg-slate-100 dark:hover:bg-[#282a2d] text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              <AgentIcon
                                icon={agent.icon}
                                highlighted={Boolean(agent.highlighted) || isPinned}
                              />
                              <span className="truncate flex-1">{agent.name}</span>
                              {agent.platform && (
                                <span className="text-[10px] text-[#8E929C] shrink-0">
                                  {agent.platform}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Command Input Bar with Rotating Yellow Electric Contour */}
        <form onSubmit={handleSubmit}>
          <div
            ref={barRef}
            className={`relative flex items-center gap-2 bg-white/95 dark:bg-[#1a1c1f]/95 backdrop-blur-md border border-yellow-400/60 dark:border-yellow-400/50 rounded-2xl shadow-[0_0_25px_rgba(250,204,21,0.35),0_0_50px_rgba(234,179,8,0.18),inset_0_0_15px_rgba(250,204,21,0.08)] px-3 py-2.5 focus-within:ring-2 focus-within:ring-yellow-400 focus-within:shadow-[0_0_35px_rgba(250,204,21,0.6),0_0_70px_rgba(234,179,8,0.3)] transition-all ${
              isBusy ? 'orbit-electric-busy' : ''
            }`}
          >
            {/* SVG Electric Laser Beams & Continuous Neon Aura */}
            <svg
              aria-hidden="true"
              data-testid="electric-command-contour"
              width={barSize.width > 0 ? barSize.width + svgPad * 2 : '100%'}
              height={barSize.height > 0 ? barSize.height + svgPad * 2 : '100%'}
              viewBox={
                barSize.width > 0
                  ? `0 0 ${barSize.width + svgPad * 2} ${barSize.height + svgPad * 2}`
                  : undefined
              }
              style={barSize.width > 0 ? { left: -svgPad, top: -svgPad } : { inset: 0 }}
              className="pointer-events-none absolute z-20 overflow-visible orbit-electric-pulse"
            >
              <defs>
                <filter id="electric-yellow-glow" x="-25%" y="-50%" width="150%" height="200%">
                  <feGaussianBlur stdDeviation="3.2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="electric-core-glow" x="-20%" y="-40%" width="140%" height="180%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="electric-yellow-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#eab308" />
                  <stop offset="35%" stopColor="#facc15" />
                  <stop offset="70%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#fde047" />
                </linearGradient>
              </defs>

              {/* 1. Continuous Base Neon Contour (no gaps, always visible and luminous) */}
              <rect
                x={svgPad}
                y={svgPad}
                width={barSize.width || '100%'}
                height={barSize.height || '100%'}
                rx={16}
                ry={16}
                fill="none"
                stroke="rgba(250, 204, 21, 0.45)"
                strokeWidth="1.75"
                filter="url(#electric-yellow-glow)"
              />

              {/* 2. Rotating Primary Electric Plasma Arc (flows smoothly around the perimeter) */}
              <rect
                x={svgPad}
                y={svgPad}
                width={barSize.width || '100%'}
                height={barSize.height || '100%'}
                rx={16}
                ry={16}
                pathLength={1000}
                fill="none"
                stroke="url(#electric-yellow-stroke)"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeDasharray="360 140"
                filter="url(#electric-yellow-glow)"
                className="orbit-electric-arc-glow"
              />

              {/* 3. Ultra-Bright White/Yellow Electric Core (Sparkling laser head) */}
              <rect
                x={svgPad}
                y={svgPad}
                width={barSize.width || '100%'}
                height={barSize.height || '100%'}
                rx={16}
                ry={16}
                pathLength={1000}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeDasharray="90 410"
                filter="url(#electric-core-glow)"
                className="orbit-electric-arc-core"
              />

              {/* 4. High-Frequency Electric Spark Runner */}
              <rect
                x={svgPad}
                y={svgPad}
                width={barSize.width || '100%'}
                height={barSize.height || '100%'}
                rx={16}
                ry={16}
                pathLength={1000}
                fill="none"
                stroke="#fef08a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="45 455"
                filter="url(#electric-yellow-glow)"
                className="orbit-electric-arc-spark"
              />
            </svg>

            <button
              type="button"
              onClick={() => {
                setIsAgentPickerOpen(false);
                setIsPresetsOpen((v) => !v);
              }}
              aria-expanded={isPresetsOpen}
              aria-haspopup="menu"
              aria-label="Quick order templates"
              title="Insert an order template"
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                isPresetsOpen
                  ? 'bg-[#FDF0EA] dark:bg-orange-500/20 text-[#D96B43]'
                  : 'bg-slate-100 dark:bg-[#282a2d] text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Plus className={`w-4 h-4 transition-transform ${isPresetsOpen ? 'rotate-45' : ''}`} />
            </button>

            {/* 36-Agent Direct Link Selector / Pinned Target Chip */}
            {pinnedContext ? (
              <div
                data-testid="pinned-agent-chip"
                className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-xl bg-yellow-400/15 dark:bg-yellow-400/15 border border-yellow-400/50 text-xs font-semibold text-amber-900 dark:text-yellow-200 shrink-0 max-w-[180px]"
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsPresetsOpen(false);
                    setIsAgentPickerOpen((v) => !v);
                    setTimeout(() => agentSearchRef.current?.focus(), 40);
                  }}
                  className="inline-flex items-center gap-1.5 truncate"
                  title={`Linked to ${pinnedContext.agent.name} (${pinnedContext.group.title}) — click to switch`}
                >
                  <AgentIcon icon={pinnedContext.agent.icon} highlighted />
                  <span className="truncate">{pinnedContext.agent.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectPinnedAgent(null)}
                  aria-label="Clear target agent"
                  title="Unlink target agent"
                  className="p-0.5 rounded-md hover:bg-yellow-400/25 text-amber-800 dark:text-yellow-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsPresetsOpen(false);
                  setIsAgentPickerOpen((v) => !v);
                  setTimeout(() => agentSearchRef.current?.focus(), 40);
                }}
                aria-expanded={isAgentPickerOpen}
                aria-label="Select target from 36 agents"
                title="Link directly to any of the 36 AI agents"
                className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-colors shrink-0 ${
                  isAgentPickerOpen
                    ? 'bg-yellow-400/20 text-amber-900 dark:text-yellow-200 border border-yellow-400/60'
                    : 'bg-slate-100 dark:bg-[#282a2d] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-transparent'
                }`}
              >
                <AtSign className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
                <span>{totalAgentsCount}</span>
              </button>
            )}

            <input
              ref={inputRef}
              type="text"
              value={commandDraft}
              onChange={(e) => handleDraftInputChange(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={
                pinnedContext
                  ? `Order for ${pinnedContext.agent.name}... (press Enter or enter a brief)`
                  : 'Inject an order to any of 36 agents... (e.g., @Trend Scout, run group Content, run all)'
              }
              aria-label="Inject an agent or workflow order"
              disabled={isBusy}
              className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-[#8E929C] focus:outline-none disabled:opacity-60"
            />

            <div className="flex items-center gap-2 shrink-0">
              {!pinnedContext && liveTarget.kind !== 'none' && (
                <span
                  data-testid="live-route-badge"
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-yellow-400/15 border border-yellow-400/45 text-[10px] font-semibold text-amber-800 dark:text-yellow-200 max-w-[140px] truncate"
                  title={`Order linked to: ${liveTarget.label}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                  <span className="truncate">{liveTarget.label}</span>
                </span>
              )}

              <button
                type="button"
                onClick={() => void onSubmitOrder('help')}
                aria-label="Show available orders"
                title="Show available orders"
                className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-[#8E929C] hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#282a2d] transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Help</span>
              </button>

              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-[#8E929C] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#282a2d]">
                <CornerDownLeft className="w-2.5 h-2.5" />
                Order
              </span>

              <button
                type="submit"
                disabled={(!commandDraft.trim() && !pinnedContext) || isBusy}
                aria-label="Send order"
                title="Send order"
                className="w-9 h-9 rounded-full bg-[#D96B43] hover:bg-[#c55d37] disabled:bg-slate-200 dark:disabled:bg-[#282a2d] disabled:text-slate-400 text-white flex items-center justify-center transition-colors shadow-xs"
              >
                {isBusy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Recent Command History Chips */}
        {commandHistory.length > 0 && (
          <div
            className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5 px-1"
            aria-label="Recent order history"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E929C] shrink-0 mr-1">
              Recent:
            </span>
            {commandHistory.slice(0, 6).map((item, idx) => (
              <button
                key={`${item}-${idx}`}
                type="button"
                onClick={() => {
                  onChangeDraft(item);
                  inputRef.current?.focus();
                }}
                title={`Click to reuse: ${item}`}
                className="px-2.5 py-1 rounded-full bg-white/90 dark:bg-[#1e2023]/90 hover:bg-slate-100 dark:hover:bg-[#282a2d] border border-slate-200/80 dark:border-white/[0.08] text-[11px] font-medium text-slate-600 dark:text-[#c4c7c9] whitespace-nowrap transition-colors shadow-2xs"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
