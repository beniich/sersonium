import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Copy,
  Eye,
  FileText,
  Code2,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
} from 'lucide-react';
import type { RunRecord } from '../../types/agent';

interface AgentPreviewModalProps {
  run: RunRecord | null;
  availableRuns?: RunRecord[];
  onSelectRun?: (run: RunRecord) => void;
  onClose: () => void;
}

type PreviewTab = 'preview' | 'output' | 'json' | 'deliverables';

export function AgentPreviewModal({
  run,
  availableRuns = [],
  onSelectRun,
  onClose,
}: AgentPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('preview');
  const [copied, setCopied] = useState(false);

  if (!run) return null;

  const handleCopy = async (text: string) => {
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jsonPayload = JSON.stringify(run, null, 2);

  const triggerBrowserDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = (format: 'txt' | 'md' | 'json' = 'txt') => {
    const safeSlug = run.agentName.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
    const stamp = new Date(run.timestamp).toISOString().slice(0, 19).replace(/[:T]/g, '-');

    if (format === 'json') {
      triggerBrowserDownload(
        jsonPayload,
        `sensorium-preview-${safeSlug}-${stamp}.json`,
        'application/json;charset=utf-8'
      );
      return;
    }

    if (format === 'md') {
      const mdContent = [
        `# Result Preview · ${run.agentName}`,
        '',
        `- **Group**: ${run.groupTitle}`,
        `- **Status**: ${run.status}`,
        `- **Model**: ${run.model || 'gemini-3.5-flash-lite'}`,
        `- **Duration**: ${run.durationMs}ms`,
        `- **Date**: ${new Date(run.timestamp).toLocaleString()}`,
        run.prompt ? `- **Initial Brief**: ${run.prompt}` : '',
        '',
        '## Summary / Output',
        '',
        run.summary,
        '',
        run.deliverables?.length
          ? `## Deliverables (${run.deliverables.length})\n\n${run.deliverables.map((d) => `- ${d}`).join('\n')}`
          : '',
        run.nextActions?.length
          ? `\n## Next Actions\n\n${run.nextActions.map((a) => `- ${a}`).join('\n')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      triggerBrowserDownload(
        mdContent,
        `sensorium-preview-${safeSlug}-${stamp}.md`,
        'text/markdown;charset=utf-8'
      );
      return;
    }

    const txtContent = [
      '=== SENSORIUM AGENT RESULT PREVIEW ===',
      `Agent: ${run.agentName}`,
      `Group: ${run.groupTitle}`,
      `Status: ${run.status}`,
      `Timestamp: ${new Date(run.timestamp).toLocaleString()}`,
      `Model: ${run.model || 'gemini-3.5-flash-lite'}`,
      `Duration: ${run.durationMs}ms`,
      run.prompt ? `Prompt: ${run.prompt}` : '',
      '',
      '--- SUMMARY / OUTPUT ---',
      run.summary,
      '',
      '--- DELIVERABLES ---',
      (run.deliverables || []).map((d, i) => `${i + 1}. ${d}`).join('\n') || 'None',
      '',
      '--- NEXT ACTIONS ---',
      (run.nextActions || []).map((a, i) => `${i + 1}. ${a}`).join('\n') || 'None',
      '',
      '--- JSON PAYLOAD ---',
      jsonPayload,
    ]
      .filter((line) => line !== undefined)
      .join('\n');

    triggerBrowserDownload(
      txtContent,
      `sensorium-preview-${safeSlug}-${stamp}.txt`,
      'text/plain;charset=utf-8'
    );
  };

  const switcherRuns = availableRuns.some((r) => r.id === run.id)
    ? availableRuns
    : [run, ...availableRuns];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 dark:bg-black/75 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-preview-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-white dark:bg-[#1a1c1f] border border-slate-200 dark:border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
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
                  id="agent-preview-title"
                  className="text-base font-bold text-slate-900 dark:text-white truncate mt-0.5"
                >
                  Results Preview · {run.agentName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {switcherRuns.length > 1 && onSelectRun && (
                <select
                  aria-label="Choose a run to preview"
                  value={run.id}
                  onChange={(e) => {
                    const target = switcherRuns.find((r) => r.id === e.target.value);
                    if (target) onSelectRun(target);
                  }}
                  className="max-w-[190px] bg-white dark:bg-[#282a2d] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200"
                >
                  {switcherRuns.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.agentName} ({new Date(item.timestamp).toLocaleTimeString()})
                    </option>
                  ))}
                </select>
              )}

              <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-white/[0.06] px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                <span className="tabular-nums">{run.durationMs}ms</span>
              </div>

              <button
                type="button"
                onClick={() => handleDownload('txt')}
                aria-label="Download result"
                title="Download result (.txt)"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#D96B43] text-white text-xs font-semibold hover:bg-[#c55d37] transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close preview window"
                className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Google AI Studio Preview Style) */}
          <div className="flex items-center gap-2 px-6 py-2.5 border-b border-slate-100 dark:border-white/[0.08] bg-slate-100/50 dark:bg-white/[0.01] overflow-x-auto">
            {[
              { id: 'preview' as PreviewTab, label: 'Rendered Preview', icon: Eye },
              { id: 'output' as PreviewTab, label: 'Raw Output', icon: FileText },
              {
                id: 'deliverables' as PreviewTab,
                label: `Deliverables (${run.deliverables?.length || 0})`,
                icon: Sparkles,
              },
              { id: 'json' as PreviewTab, label: 'JSON Data', icon: Code2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-[#282a2d] text-slate-900 dark:text-white shadow-xs border border-slate-200/70 dark:border-white/[0.08]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D96B43]' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Body Content */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {activeTab === 'preview' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#141518] text-white border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-semibold tracking-wider text-slate-300">
                        Live Render · {run.agentName}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(run.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-100 leading-relaxed whitespace-pre-wrap">
                      {run.summary}
                    </p>
                  </div>

                  {run.deliverables && run.deliverables.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <div className="text-[11px] font-semibold text-[#D96B43] uppercase tracking-wider">
                        Validated Artifacts
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {run.deliverables.map((item, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200"
                          >
                            ✓ {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {run.prompt && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-white/[0.06] text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Initial Context:{' '}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">{run.prompt}</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'output' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Generated Markdown / Raw Text
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload('md')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <Download className="w-3 h-3 text-[#D96B43]" />
                      <span>Download (.md)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCopy(run.summary)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {run.summary}
                </div>
              </div>
            )}

            {activeTab === 'deliverables' && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Agent deliverables list
                </h3>
                {run.deliverables && run.deliverables.length > 0 ? (
                  <ul className="space-y-2">
                    {run.deliverables.map((item, idx) => (
                      <li
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-3"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
                          Ready
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No structured deliverables for this run.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'json' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Full Execution Payload (JSON)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload('json')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <Download className="w-3 h-3 text-[#D96B43]" />
                      <span>Download (.json)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCopy(jsonPayload)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-64 tabular-nums">
                  <pre>{jsonPayload}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              Duration: {run.durationMs}ms · Model: {run.model || 'gemini-3.5-flash-lite'}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownload('txt')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#282a2d] hover:bg-slate-200 dark:hover:bg-[#333538] text-slate-700 dark:text-[#e2e2e6] text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#D96B43]" />
                <span>Download (.txt)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('md')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#282a2d] hover:bg-slate-200 dark:hover:bg-[#333538] text-slate-700 dark:text-[#e2e2e6] text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>Markdown</span>
              </button>
              <button
                type="button"
                onClick={() => void handleCopy(run.summary)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#282a2d] hover:bg-slate-200 dark:hover:bg-[#333538] text-slate-700 dark:text-[#e2e2e6] text-xs font-medium transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy preview'}</span>
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
