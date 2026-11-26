import React, { useState } from 'react';
import { X, Zap } from 'lucide-react';
import type { WorkflowItem, WorkflowStatus } from '../../types/agent';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (workflow: WorkflowItem) => void;
}

export function CreateWorkflowModal({
  isOpen,
  onClose,
  onCreate,
}: CreateWorkflowModalProps) {
  const [name, setName] = useState('');
  const [integrations, setIntegrations] = useState('');
  const [status, setStatus] = useState<WorkflowStatus>('active');
  const [icon, setIcon] = useState<WorkflowItem['icon']>('activity');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Veuillez saisir un nom pour le workflow.');
      return;
    }

    const newWf: WorkflowItem = {
      id: `wf-${Date.now()}`,
      name: name.trim(),
      icon,
      integrations: integrations.trim() || 'API REST · SENSORIUM',
      status,
      statusLabel: status === 'active' ? 'Live' : status === 'paused' ? 'En pause' : 'Brouillon',
      isLive: status === 'active',
      sparkline: status === 'active' ? [1, 2, 4, 3, 5, 4, 6, 8, 7, 9, 8, 10] : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };

    onCreate(newWf);
    setName('');
    setIntegrations('');
    setStatus('active');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Nouveau Workflow Autonome
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la modale"
            className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Nom du Workflow
            </label>
            <input
              type="text"
              placeholder="ex: Réconciliation Factures Stripe / ERP"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Connecteurs & Intégrations
            </label>
            <input
              type="text"
              placeholder="ex: Stripe · Netsuite · Slack"
              value={integrations}
              onChange={(e) => setIntegrations(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Statut initial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkflowStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="active">Actif (Live)</option>
                <option value="paused">En pause</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Icône de catégorie
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="activity">Activité (Télémétrie)</option>
                <option value="invoice">Finance & Facturation</option>
                <option value="shield">Sécurité & ZTNA</option>
                <option value="user">RH & IAM</option>
                <option value="cpu">Calcul & Robotique</option>
                <option value="calendar">Calendrier & Contrats</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-red-500">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#111317] dark:bg-white text-white dark:text-[#111317] font-bold hover:opacity-90 transition shadow-xs"
            >
              Créer le Workflow
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

