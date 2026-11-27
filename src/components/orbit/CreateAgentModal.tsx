import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { AgentIconKey, Group } from '../../types/agent';
import { AgentIcon } from './AgentIcon';

interface CreateAgentModalProps {
  isOpen: boolean;
  groups: Group[];
  onClose: () => void;
  onCreate: (params: {
    groupId: string;
    name: string;
    description: string;
    icon: AgentIconKey;
    highlighted: boolean;
    platform: string;
  }) => void;
}

const ICON_OPTIONS: { key: AgentIconKey; label: string }[] = [
  { key: 'spark', label: 'AI Core' },
  { key: 'database', label: 'Database' },
  { key: 'shield', label: 'Security' },
  { key: 'lock', label: 'Zero Trust' },
  { key: 'workflow', label: 'Workflow' },
  { key: 'network', label: 'Network' },
  { key: 'cpu', label: 'Compute' },
  { key: 'server', label: 'Server' },
  { key: 'terminal', label: 'CLI' },
  { key: 'activity', label: 'Telemetry' },
  { key: 'chart', label: 'Analytics' },
  { key: 'bot', label: 'Automation' },
];

export function CreateAgentModal({
  isOpen,
  groups,
  onClose,
  onCreate,
}: CreateAgentModalProps) {
  const [groupId, setGroupId] = useState(groups[0]?.id ?? 'research');
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<AgentIconKey>('spark');
  const [highlighted, setHighlighted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter an agent name.');
      return;
    }

    onCreate({
      groupId,
      name: name.trim(),
      description: description.trim(),
      icon,
      highlighted,
      platform: platform.trim(),
    });

    setName('');
    setPlatform('');
    setDescription('');
    setHighlighted(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/35 dark:bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-agent-title"
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            id="create-agent-title"
            className="text-lg font-semibold text-slate-900 dark:text-white"
          >
            Add New Agent
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="new-agent-group"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Group
            </label>
            <select
              id="new-agent-group"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="new-agent-name"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Agent Name
              </label>
              <input
                id="new-agent-name"
                type="text"
                placeholder="e.g. Threat Classifier"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label
                htmlFor="new-agent-platform"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Platform / Integration
              </label>
              <input
                id="new-agent-platform"
                type="text"
                placeholder="e.g. SIEM / Kafka"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="new-agent-desc"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Role Description
            </label>
            <textarea
              id="new-agent-desc"
              rows={2}
              placeholder="Describe what this agent automates in the loop..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Icon
            </span>
            <div className="grid grid-cols-6 gap-2">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setIcon(opt.key)}
                  aria-label={opt.label}
                  aria-pressed={icon === opt.key}
                  className={`h-9 rounded-lg border flex items-center justify-center transition-colors ${
                    icon === opt.key
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/15'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <AgentIcon icon={opt.key} highlighted={icon === opt.key} />
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={highlighted}
              onChange={(e) => setHighlighted(e.target.checked)}
              className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
            />
            <span>Highlight as priority agent</span>
          </label>

          {error && (
            <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-lg bg-[#D96B43] hover:bg-[#c55d37] text-white text-sm font-medium transition-colors"
            >
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
