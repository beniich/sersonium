import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  RotateCcw,
  X,
  Pencil,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { Agent, AgentStatus, Group, RunRecord } from '../../types/agent';
import { STATUS_LABELS } from '../../utils/orchestrator';
import { AgentIcon } from './AgentIcon';

interface AgentSidePanelProps {
  agent: Agent | null;
  group: Group | null;
  isRunning: boolean;
  progress: number;
  runLogs: string[];
  lastResult: 'success' | 'error' | null;
  lastRun: RunRecord | null;
  runError: string | null;
  onClose: () => void;
  onRun: (prompt: string) => void;
  onReset: () => void;
  onUpdateAgent: (
    agentId: string,
    updates: { name: string; description: string; highlighted: boolean }
  ) => Promise<void> | void;
  onDeleteAgent: (agentId: string) => Promise<void> | void;
}

const STATUS_BADGE_STYLES: Record<AgentStatus, string> = {
  active: 'text-emerald-700 dark:text-emerald-300',
  idle: 'text-slate-600 dark:text-slate-300',
  running: 'text-orange-600 dark:text-orange-400',
  success: 'text-emerald-700 dark:text-emerald-300',
  error: 'text-red-600 dark:text-red-400',
};

const STATUS_DOT_STYLES: Record<AgentStatus, string> = {
  active: 'bg-emerald-500',
  idle: 'bg-slate-400',
  running: 'bg-orange-500',
  success: 'bg-emerald-500',
  error: 'bg-red-500',
};

export function AgentSidePanel({
  agent,
  group,
  isRunning,
  progress,
  runLogs,
  lastResult,
  lastRun,
  runError,
  onClose,
  onRun,
  onReset,
  onUpdateAgent,
  onDeleteAgent,
}: AgentSidePanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editHighlighted, setEditHighlighted] = useState(false);
  const [editError, setEditError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [taskPrompt, setTaskPrompt] = useState('');

  useEffect(() => {
    if (agent) {
      setEditName(agent.name);
      setEditDescription(agent.description);
      setEditHighlighted(Boolean(agent.highlighted));
      setIsEditing(false);
      setEditError('');
      setConfirmDelete(false);
      setTaskPrompt('');
    }
  }, [agent?.id]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;
    if (!editName.trim()) {
      setEditError('Agent name is required.');
      return;
    }
    await onUpdateAgent(agent.id, {
      name: editName.trim(),
      description: editDescription.trim() || agent.description,
      highlighted: editHighlighted,
    });
    setIsEditing(false);
    setEditError('');
  };

  return (
    <AnimatePresence>
      {agent && group && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/25 dark:bg-black/55 z-40"
            aria-hidden="true"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`${agent.name} details`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white dark:bg-slate-900 shadow-2xl z-50 border-l border-slate-200 dark:border-slate-800 flex flex-col"
          >
            {/* Panel Header */}
            <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>{group.title}</span>
                  {agent.platform && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{agent.platform}</span>
                    </>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2.5 truncate">
                  <AgentIcon icon={agent.icon} highlighted={Boolean(agent.highlighted)} />
                  <span className="truncate">{agent.name}</span>
                </h2>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing((v) => !v);
                    setEditError('');
                  }}
                  aria-label={`Edit ${agent.name}`}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close agent panel"
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Panel Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5">
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="edit-agent-name"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Agent Name
                    </label>
                    <input
                      id="edit-agent-name"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-agent-desc"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Description
                    </label>
                    <textarea
                      id="edit-agent-desc"
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editHighlighted}
                      onChange={(e) => setEditHighlighted(e.target.checked)}
                      className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span>Highlight as priority agent in group</span>
                  </label>

                  {editError && (
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">
                      {editError}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2 px-4 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {agent.description}
                  </p>

                  {/* Status Row */}
                  <div className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-800">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Current Status
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${STATUS_DOT_STYLES[agent.status]}`}
                        aria-hidden="true"
                      />
                      <span className={`text-sm font-medium ${STATUS_BADGE_STYLES[agent.status]}`}>
                        {STATUS_LABELS[agent.status]}
                      </span>
                    </div>
                  </div>

                  {/* Brief / Input for Production Run */}
                  <div>
                    <label
                      htmlFor="agent-run-brief"
                      className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
                    >
                      Task Brief (Optional)
                    </label>
                    <textarea
                      id="agent-run-brief"
                      rows={2}
                      value={taskPrompt}
                      onChange={(e) => setTaskPrompt(e.target.value)}
                      disabled={isRunning}
                      placeholder={`Provide context or target topic for ${agent.name}...`}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D96B43] disabled:opacity-60"
                    />
                  </div>

                  {/* Execution Progress */}
                  {(isRunning || progress > 0) && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          {isRunning ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                              Executing workflow...
                            </>
                          ) : lastResult === 'success' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              Execution completed
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                              Execution failed
                            </>
                          )}
                        </span>
                        <span className="font-mono tabular-nums">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${
                            lastResult === 'error'
                              ? 'bg-red-500'
                              : lastResult === 'success'
                              ? 'bg-emerald-500'
                              : 'bg-orange-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Primary Action Controls */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => onRun(taskPrompt)}
                      disabled={isRunning}
                      className={`py-2.5 px-4 rounded-xl text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                        isRunning
                          ? 'bg-orange-400 cursor-not-allowed'
                          : 'bg-[#D96B43] hover:bg-[#c55d37]'
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Run Agent</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={onReset}
                      disabled={isRunning}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* Real Error Notice */}
                  {runError && (
                    <div
                      role="alert"
                      className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 leading-relaxed"
                    >
                      {runError}
                    </div>
                  )}

                  {/* Structured Production Deliverables */}
                  {lastRun && lastRun.status === 'success' && (
                    <div className="space-y-3 pt-1">
                      {lastRun.deliverables && lastRun.deliverables.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                            Deliverables
                          </h3>
                          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                            {lastRun.deliverables.map((item, idx) => (
                              <li
                                key={idx}
                                className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {lastRun.nextActions && lastRun.nextActions.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                            Next Handoff Steps
                          </h3>
                          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4">
                            {lastRun.nextActions.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Live Execution Logs */}
                  {runLogs.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                        API Logs
                      </h3>
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 max-h-48 overflow-y-auto font-mono text-xs space-y-1.5 tabular-nums">
                        {runLogs.map((log, i) => (
                          <div
                            key={i}
                            className={
                              log.includes('200 OK')
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : log.includes('Error') || log.includes('GEMINI_API_KEY')
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-slate-600 dark:text-slate-300'
                            }
                          >
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Panel Footer — Remove Agent */}
            {!isEditing && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {confirmDelete ? (
                  <>
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      Remove this agent?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onDeleteAgent(agent.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    disabled={isRunning}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove agent from {group.title}</span>
                  </button>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
