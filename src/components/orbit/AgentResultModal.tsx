import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Copy,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Terminal,
  Eye,
  Download,
} from 'lucide-react';
import type { RunRecord } from '../../types/agent';

interface AgentResultModalProps {
  run: RunRecord | null;
  onClose: () => void;
  onOpenPreview?: (run: RunRecord) => void;
}

export function AgentResultModal({ run, onClose, onOpenPreview }: AgentResultModalProps) {
  const [copied, setCopied] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  if (!run) return null;

  const formattedReport = `Agent: ${run.agentName} (${run.groupTitle})\nStatus: ${run.status}\nDuration: ${run.durationMs}ms\nSummary: ${run.summary}\n\nDeliverables:\n${(run.deliverables || []).join('\n')}\n\nNext Actions:\n${(run.nextActions || []).join('\n')}`;

  const handleCopy = async () => {
    await navigator.clipboard?.writeText(formattedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const safeSlug = run.agentName.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
    const blob = new Blob([formattedReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensorium-result-${safeSlug}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-black/70 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-result-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#1a1c1f] border border-slate-200 dark:border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header resembling Google AI Studio Run Output window */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  run.status === 'success'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-[#4edea3]'
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                }`}
              >
                {run.status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                    {run.groupTitle}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300">
                    <Sparkles className="w-3 h-3 text-[#D96B43]" />
                    {run.model || 'gemini-3.5-flash-lite'}
                  </span>
                </div>
                <h2
                  id="agent-result-title"
                  className="text-base font-bold text-slate-900 dark:text-white truncate mt-0.5"
                >
                  {run.agentName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-white/[0.06] px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                <span className="tabular-nums">{run.durationMs}ms</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close window"
                className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-5">
            {/* Prompt Brief if provided */}
            {run.prompt && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-white/[0.06] text-xs">
                <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  User Brief / Request:
                </div>
                <div className="text-slate-600 dark:text-slate-400 italic">
                  &ldquo;{run.prompt}&rdquo;
                </div>
              </div>
            )}

            {/* Core Conclusion / Output Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Result Conclusion
              </h3>
              <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed border border-slate-800 shadow-inner">
                {run.summary}
              </div>
            </div>

            {/* Deliverables / Generated Artifacts */}
            {run.deliverables && run.deliverables.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Deliverables &amp; Artifacts ({run.deliverables.length})
                </h3>
                <ul className="space-y-2">
                  {run.deliverables.map((item, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-[#202225] border border-slate-200/70 dark:border-white/[0.06] text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#D96B43]/15 text-[#D96B43] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Handoff Steps */}
            {run.nextActions && run.nextActions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Recommended Next Actions
                </h3>
                <ul className="space-y-1.5 list-disc pl-4 text-xs text-slate-700 dark:text-slate-300">
                  {run.nextActions.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Expandable API Logs */}
            {run.logs && run.logs.length > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogs((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-[#D96B43]" />
                  <span>{showLogs ? 'Hide execution logs' : 'Show execution logs'}</span>
                </button>

                {showLogs && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-300 space-y-1 max-h-40 overflow-y-auto tabular-nums">
                    {run.logs.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-t border-slate-100 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {new Date(run.timestamp).toLocaleString()}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onOpenPreview && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPreview(run);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FDF0EA] dark:bg-orange-500/15 border border-[#D96B43]/40 text-[#B84A24] dark:text-orange-200 text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#282a2d] hover:bg-slate-200 dark:hover:bg-[#333538] text-slate-700 dark:text-[#e2e2e6] text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#D96B43]" />
                <span>Download</span>
              </button>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#282a2d] hover:bg-slate-200 dark:hover:bg-[#333538] text-slate-700 dark:text-[#e2e2e6] text-xs font-medium transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Result copied!' : 'Copy result'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#141518] dark:bg-white text-white dark:text-[#111317] text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
