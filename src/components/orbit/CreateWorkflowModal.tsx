import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Workflow } from 'lucide-react';
import type { Group, WorkflowItem, WorkflowStatus } from '../../types/agent';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  groups: Group[];
  onClose: () => void;
  onCreate: (params: {
    name: string;
    integrations: string;
    folder: WorkflowItem['folder'];
    subfolder?: string;
    status: WorkflowStatus;
    linkedAgentId: string;
    description: string;
  }) => Promise<void> | void;
}

export function CreateWorkflowModal({
  isOpen,
  groups,
  onClose,
  onCreate,
}: CreateWorkflowModalProps) {
  const allAgents = groups.flatMap((g) =>
    g.agents.map((a) => ({ id: a.id, label: `${a.name} (${g.title})` }))
  );

  const [name, setName] = useState('');
  const [integrations, setIntegrations] = useState('Stripe · Slack');
  const [folder, setFolder] = useState<WorkflowItem['folder']>('Finance');
  const [status, setStatus] = useState<WorkflowStatus>('active');
  const [linkedAgentId, setLinkedAgentId] = useState(allAgents[0]?.id || 'r2');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Workflow name is required.');
      return;
    }
    setSubmitting(true);
    try {
      await onCreate({
        name: name.trim(),
        integrations: integrations.trim() || 'Claude Code · Webhook',
        folder,
        status,
        linkedAgentId,
        description: description.trim(),
      });
      setName('');
      setDescription('');
      setError('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/35 dark:bg-black/65 z-50"
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="New workflow"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.16 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-white dark:bg-[#1e2023] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-[#111317] dark:text-white" />
                <h2 className="text-base font-semibold text-[#111317] dark:text-white">
                  New workflow
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-[#282a2d] flex items-center justify-center text-[#8E929C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label
                  htmlFor="wf-name"
                  className="block text-xs font-medium text-slate-700 dark:text-[#c4c7c9] mb-1.5"
                >
                  Workflow Name
                </label>
                <input
                  id="wf-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. Stripe payout reconciliation"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#111317] text-[#111317] dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="wf-folder"
                    className="block text-xs font-medium text-slate-700 dark:text-[#c4c7c9] mb-1.5"
                  >
                    Folder
                  </label>
                  <select
                    id="wf-folder"
                    value={folder}
                    onChange={(e) =>
                      setFolder(e.target.value as WorkflowItem['folder'])
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#111317] text-[#111317] dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white/40"
                  >
                    <option value="Finance">Finance</option>
                    <option value="People ops">People ops</option>
                    <option value="IT & access">IT &amp; access</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="wf-status"
                    className="block text-xs font-medium text-slate-700 dark:text-[#c4c7c9] mb-1.5"
                  >
                    Status
                  </label>
                  <select
                    id="wf-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as WorkflowStatus)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#111317] text-[#111317] dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white/40"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="wf-integrations"
                  className="block text-xs font-medium text-slate-700 dark:text-[#c4c7c9] mb-1.5"
                >
                  Connectors
                </label>
                <input
                  id="wf-integrations"
                  type="text"
                  value={integrations}
                  onChange={(e) => setIntegrations(e.target.value)}
                  placeholder="e.g. Stripe · Netsuite · Slack"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#111317] text-[#111317] dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white/40"
                />
              </div>

              <div>
                <label
                  htmlFor="wf-agent"
                  className="block text-xs font-medium text-slate-700 dark:text-[#c4c7c9] mb-1.5"
                >
                  Orchestrating Agent (Agent Orbit)
                </label>
                <select
                  id="wf-agent"
                  value={linkedAgentId}
                  onChange={(e) => setLinkedAgentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#111317] text-[#111317] dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white/40"
                >
                  {allAgents.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="wf-desc"
                  className="block text-xs font-medium text-slate-700 dark:text-[#c4c7c9] mb-1.5"
                >
                  Automation Instructions
                </label>
                <textarea
                  id="wf-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this workflow automates..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#111317] text-[#111317] dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white/40"
                />
              </div>

              {error && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full bg-slate-100 dark:bg-[#282a2d] text-slate-700 dark:text-[#e2e2e6] text-xs font-medium hover:bg-slate-200 dark:hover:bg-[#333538] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-full bg-[#141518] dark:bg-white text-white dark:text-[#111317] text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {submitting ? 'Creating...' : 'Create workflow'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
