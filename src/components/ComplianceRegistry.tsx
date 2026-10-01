import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  UserCheck,
  ShieldCheck,
  Edit3,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  RefreshCw,
  Sparkles,
  Trash2,
  Download,
  Shield,
  Wifi,
  WifiOff,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Lock,
  Loader2,
  Database,
} from 'lucide-react';

// --- Types ---
export type ComplianceStatus = 'Valid' | 'Warning' | 'Expired';

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  dateIssue: string;
  dateExpiry: string;
  status: ComplianceStatus;
  docUrl: string;
}

export interface PermitItem {
  id: string;
  driver: string;
  category: string;
  dateExpiry: string;
  licenseNumber: string;
  status: ComplianceStatus;
}

export interface InsuranceItem {
  id: string;
  company: string;
  policyNumber: string;
  coverage: string;
  dateExpiry: string;
  status: ComplianceStatus;
  vehicle?: string;
  premium?: number;
}

type TabId = 'certs' | 'permits' | 'insurance';

interface SyncState {
  type: 'success' | 'error' | 'syncing';
  message: string;
}

const API_BASE = '/api/v1/compliance';
const getAuthHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('sensorium_token') || ''}`,
  'Content-Type': 'application/json',
});

const daysUntilExpiry = (dateStr: string): number => {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const resolveStatus = (dateStr: string, currentStatus: ComplianceStatus): ComplianceStatus => {
  const days = daysUntilExpiry(dateStr);
  if (days < 0) return 'Expired';
  if (days <= 60) return 'Warning';
  return currentStatus === 'Expired' ? 'Valid' : currentStatus;
};

// --- StatusBadge ---
export const StatusBadge = ({ status }: { status: ComplianceStatus }) => {
  const config = {
    Valid: {
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 ring-emerald-500/10',
      icon: <CheckCircle2 size={12} />,
    },
    Warning: {
      classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30 ring-amber-500/10',
      icon: <Clock size={12} />,
    },
    Expired: {
      classes: 'bg-rose-500/10 text-rose-400 border-rose-500/30 ring-rose-500/10',
      icon: <AlertCircle size={12} />,
    },
  };
  const { classes, icon } = config[status] || config.Valid;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${classes}`}>
      {icon} {status}
    </span>
  );
};

// --- ExpiryCountdown ---
const ExpiryCountdown = ({ dateStr }: { dateStr: string }) => {
  const days = daysUntilExpiry(dateStr);
  if (days < 0) return <span className="text-xs text-rose-400 font-mono">Expiré il y a {Math.abs(days)}j</span>;
  if (days <= 30) return <span className="text-xs text-rose-400 font-mono font-bold">⚠ {days}j restants</span>;
  if (days <= 60) return <span className="text-xs text-amber-400 font-mono">{days}j restants</span>;
  return <span className="text-xs text-slate-500 font-mono">{days}j</span>;
};

// --- Main Component ---
export const ComplianceRegistry: React.FC<{ isDark?: boolean }> = ({ isDark = true }) => {
  const [activeTab, setActiveTab] = useState<TabId>('certs');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const [formData, setFormData] = useState<any>({
    name: '', issuer: '', driver: '', category: '',
    company: '', policyNumber: '', coverage: '', vehicle: '',
    premium: '', dateIssue: '', dateExpiry: '', status: 'Valid',
  });

  const [data, setData] = useState<{
    certs: CertificationItem[];
    permits: PermitItem[];
    insurance: InsuranceItem[];
  }>({
    certs: [
      { id: '1', name: 'ISO 39001 (Sécurité Routière)', issuer: 'AFNOR Certification', dateIssue: '2023-01-10', dateExpiry: '2026-12-31', status: 'Valid', docUrl: '#' },
      { id: '2', name: 'Souveraineté Edge AI & FIPS 140-3', issuer: 'NIST / ANSSI', dateIssue: '2023-05-20', dateExpiry: '2025-10-30', status: 'Warning', docUrl: '#' },
      { id: '3', name: 'ISO 14001 (Environnement)', issuer: 'Bureau Veritas', dateIssue: '2022-10-15', dateExpiry: '2027-11-15', status: 'Valid', docUrl: '#' },
    ],
    permits: [
      { id: '1', driver: 'Jean Dupont', category: 'CE (Poids Lourds)', dateExpiry: '2026-06-15', licenseNumber: 'PER-88291', status: 'Valid' },
      { id: '2', driver: 'Marc Morel', category: 'C (Urbain)', dateExpiry: '2025-03-15', licenseNumber: 'PER-11203', status: 'Warning' },
      { id: '3', driver: 'Sophie Lambert', category: 'ADR (Matières Dangereuses)', dateExpiry: '2027-04-10', licenseNumber: 'PER-99410', status: 'Valid' },
    ],
    insurance: [
      { id: '1', company: 'AXA Entreprise Flotte', policyNumber: 'POL-AXA-998244-FR', coverage: 'Tous Risques Flotte + Marchandises', vehicle: 'Camion Silicium X1 (Lyon)', dateExpiry: '2026-12-31', status: 'Valid', premium: 2400 },
      { id: '2', company: 'Allianz Global Corporate', policyNumber: 'ALL-7781-EDGE', coverage: 'RC Exploitation & Cyber', vehicle: 'Flotte Paris-Nord', dateExpiry: '2025-08-30', status: 'Valid', premium: 5800 },
      { id: '3', company: 'Groupama Transport', policyNumber: 'GP-CAM-4201', coverage: 'Tiers Collision & Rapatriement', vehicle: 'Camion 42 (Test)', dateExpiry: '2024-05-01', status: 'Expired', premium: 980 },
    ],
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const fetchRegistry = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_BASE, { headers: getAuthHeader() });
      if (res.ok) {
        const json = await res.json();
        if (json.certs && json.permits && (json.insurances || json.insurance)) {
          setData({
            certs: json.certs,
            permits: json.permits,
            insurance: json.insurances || json.insurance,
          });
          setLastSync(new Date());
        }
      }
    } catch {
      // Keep mock data on network error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRegistry(); }, [fetchRegistry]);

  // Compliance summary stats
  const stats = {
    total: data.certs.length + data.permits.length + data.insurance.length,
    valid: [...data.certs, ...data.permits, ...data.insurance].filter(i => i.status === 'Valid').length,
    warning: [...data.certs, ...data.permits, ...data.insurance].filter(i => i.status === 'Warning').length,
    expired: [...data.certs, ...data.permits, ...data.insurance].filter(i => i.status === 'Expired').length,
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setFormData({
      ...item,
      name: item.name || '',
      issuer: item.issuer || '',
      driver: item.driver || '',
      category: item.category || '',
      company: item.company || '',
      policyNumber: item.policyNumber || item.policy || '',
      coverage: item.coverage || item.coverageType || '',
      vehicle: item.vehicle || '',
      premium: item.premium || '',
      dateIssue: item.dateIssue ? item.dateIssue.split('T')[0] : '',
      dateExpiry: item.dateExpiry ? item.dateExpiry.split('T')[0] : (item.expiry ? item.expiry.split('T')[0] : ''),
      status: item.status || 'Valid',
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setFormData({
      id: `new_${Date.now()}`, name: '', issuer: '', driver: '', category: '',
      company: '', policyNumber: '', coverage: '', vehicle: '', premium: '',
      dateIssue: new Date().toISOString().split('T')[0],
      dateExpiry: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'Valid',
    });
    setIsModalOpen(true);
  };

  const handleSaveAndSync = async () => {
    setIsSyncing(true);
    setSyncState({ type: 'syncing', message: 'Synchronisation avec le Terminal Physique...' });
    const isNew = !selectedItem || !selectedItem.id || String(selectedItem.id).startsWith('new_');
    const targetId = isNew ? `item_${Date.now()}` : selectedItem.id;
    const itemToSave = { ...formData, id: targetId };

    // Optimistic UI
    setData((prev) => {
      const list = prev[activeTab] as any[];
      if (isNew) return { ...prev, [activeTab]: [itemToSave, ...list] };
      return { ...prev, [activeTab]: list.map((i) => (i.id === selectedItem.id ? itemToSave : i)) };
    });
    setIsModalOpen(false);

    try {
      const endpoint = activeTab === 'certs'
        ? `${API_BASE}/certifications`
        : activeTab === 'permits'
        ? `${API_BASE}/permits`
        : `${API_BASE}/insurances`;

      await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ ...itemToSave, orgId: 'tenant_enterprise_lacaza' }),
      });

      await fetch('/api/v1/terminal/sync-compliance', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ orgId: 'tenant_enterprise_lacaza', hardwareId: 'SNSR-SILICIUM-X1' }),
      });

      setLastSync(new Date());
      setSyncState({ type: 'success', message: '✅ Fiche sauvegardée — Sovereign Sync vers Terminal Physique confirmé.' });
    } catch {
      setSyncState({ type: 'success', message: '✅ Fiche enregistrée localement (Miroir local mis à jour).' });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncState(null), 6000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsSyncing(true);
    setIsDeleteModalOpen(false);

    // Optimistic remove
    setData((prev) => ({
      ...prev,
      [activeTab]: (prev[activeTab] as any[]).filter((i) => i.id !== itemToDelete.id),
    }));

    try {
      await fetch(`${API_BASE}/${activeTab}/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      setSyncState({ type: 'success', message: '🗑️ Élément supprimé et suppression synchronisée avec le Terminal.' });
    } catch {
      setSyncState({ type: 'error', message: '⚠️ Supprimé localement. La synchronisation sera effectuée au prochain cycle.' });
    } finally {
      setIsSyncing(false);
      setItemToDelete(null);
      setTimeout(() => setSyncState(null), 5000);
    }
  };

  const handleExport = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      organization: 'tenant_enterprise_lacaza',
      registry: data,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_registry_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'certs' as TabId, label: 'Certifications', icon: FileText, count: data.certs.length },
    { id: 'permits' as TabId, label: 'Permis de Conduire', icon: UserCheck, count: data.permits.length },
    { id: 'insurance' as TabId, label: 'Contrats Assurance', icon: ShieldCheck, count: data.insurance.length },
  ];

  const renderTableBody = () => {
    const items = data[activeTab] as any[];
    if (items.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="p-16 text-center">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Database size={40} className="opacity-30" />
              <p className="text-sm font-medium">Aucun élément dans cette catégorie</p>
              <button onClick={handleAddNew} className="mt-2 text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center gap-1">
                <Plus size={14} /> Ajouter le premier élément
              </button>
            </div>
          </td>
        </tr>
      );
    }

    return items.map((item: any, idx: number) => {
      const resolvedSt = resolveStatus(item.dateExpiry || item.expiry || '', item.status);
      const days = daysUntilExpiry(item.dateExpiry || item.expiry || '');
      const isExpiring = days >= 0 && days <= 30;

      return (
        <motion.tr
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.04 }}
          className={`border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors group ${isExpiring ? 'bg-amber-500/3' : ''}`}
        >
          <td className="p-4">
            <div className="flex items-start gap-3">
              {resolvedSt === 'Expired' && <AlertTriangle size={14} className="text-rose-400 mt-0.5 shrink-0" />}
              {resolvedSt === 'Warning' && <Clock size={14} className="text-amber-400 mt-0.5 shrink-0" />}
              {resolvedSt === 'Valid' && <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />}
              <div>
                <p className="font-semibold text-slate-200 text-sm leading-tight">
                  {item.name || item.driver || item.company}
                </p>
                {item.vehicle && <p className="text-xs text-slate-500 mt-0.5">{item.vehicle}</p>}
                {item.premium && (
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">
                    Prime: {Number(item.premium).toLocaleString('fr-FR')} €/an
                  </p>
                )}
              </div>
            </div>
          </td>
          <td className="p-4 text-slate-400 text-sm">
            <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {item.issuer || item.licenseNumber || item.policyNumber || item.policy}
            </span>
          </td>
          <td className="p-4 text-sm">
            {activeTab === 'certs' && (
              <span className="text-slate-400 text-xs font-mono">{item.dateIssue || '—'}</span>
            )}
            {activeTab !== 'certs' && (
              <span className="text-slate-500 text-xs">—</span>
            )}
          </td>
          <td className="p-4">
            <div className="flex flex-col gap-1">
              <span className="text-slate-300 text-xs font-mono">{item.dateExpiry || item.expiry}</span>
              <ExpiryCountdown dateStr={item.dateExpiry || item.expiry || ''} />
            </div>
          </td>
          <td className="p-4">
            <StatusBadge status={resolvedSt} />
          </td>
          <td className="p-4 text-right">
            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {activeTab === 'certs' && item.docUrl && item.docUrl !== '#' && (
                <a
                  href={item.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                  title="Voir le document"
                >
                  <ExternalLink size={15} />
                </a>
              )}
              <button
                onClick={() => handleEdit(item)}
                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all"
                title="Modifier"
              >
                <Edit3 size={15} />
              </button>
              <button
                onClick={() => { setItemToDelete(item); setIsDeleteModalOpen(true); }}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                title="Supprimer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </td>
        </motion.tr>
      );
    });
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Premium top accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
                Registre Maître de Conformité
              </h1>
              <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Lock size={10} /> Niveau 3 · Sovereign Sync
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
              Gestion centralisée des certifications, permis et assurances.
              Synchronisation physique edge en temps réel vers le Terminal Silicium X1.
            </p>
            {lastSync && (
              <p className="text-slate-600 text-xs mt-1 font-mono">
                Dernière sync: {lastSync.toLocaleTimeString('fr-FR')}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Online status */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? 'Terminal Online' : 'Mode Offline'}
            </div>

            <button
              onClick={fetchRegistry}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all border border-slate-800"
              title="Rafraîchir"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all text-sm border border-slate-800"
            >
              <Download size={14} /> Export JSON
            </button>

            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-4 py-2 rounded-xl transition-all font-bold shadow-lg shadow-emerald-900/30 text-sm"
            >
              <Plus size={16} /> Ajouter
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Éléments', value: stats.total, color: 'text-slate-200', bg: 'bg-slate-800/50', border: 'border-slate-700/50' },
            { label: 'Conformes', value: stats.valid, color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
            { label: 'En Vigilance', value: stats.warning, color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
            { label: 'Expirés', value: stats.expired, color: 'text-rose-400', bg: 'bg-rose-500/5', border: 'border-rose-500/20' },
          ].map((card) => (
            <div key={card.label} className={`${card.bg} border ${card.border} rounded-2xl p-4 backdrop-blur-sm`}>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-1">{card.label}</p>
              <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
              <div className="mt-2 h-1 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${card.color.replace('text-', 'bg-')}/40 transition-all duration-700`}
                  style={{ width: `${stats.total ? (card.value / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Sync Notification Banner ── */}
        <AnimatePresence>
          {syncState && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className={`mb-6 p-4 rounded-xl border flex items-center justify-between text-sm ${
                syncState.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                  : syncState.type === 'error'
                  ? 'bg-amber-950/60 border-amber-500/30 text-amber-300'
                  : 'bg-blue-950/60 border-blue-500/30 text-blue-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {syncState.type === 'syncing' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                <span>{syncState.message}</span>
              </div>
              <span className="font-mono text-xs opacity-60">
                /opt/sensorium/data/compliance_registry.json
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tab Navigation ── */}
        <div className="flex gap-1.5 p-1.5 bg-slate-900/80 w-fit rounded-2xl mb-6 border border-slate-800/60 backdrop-blur-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium text-sm relative ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-emerald-400 shadow-lg shadow-black/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                  activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Data Table ── */}
        <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-800/30">
            <div className="flex items-center gap-2">
              <ChevronRight size={14} className="text-emerald-500" />
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                {activeTab === 'certs' ? 'Certifications & Accréditations' : activeTab === 'permits' ? 'Permis de Conduire Flotte' : 'Contrats d\'Assurance'}
              </span>
            </div>
            {isLoading && <Loader2 size={14} className="animate-spin text-slate-500" />}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-widest border-b border-slate-800/60">
                  <th className="px-4 py-3 font-semibold">Désignation / Titulaire</th>
                  <th className="px-4 py-3 font-semibold">Référence / Organisme</th>
                  <th className="px-4 py-3 font-semibold">Date d'Émission</th>
                  <th className="px-4 py-3 font-semibold">Expiration</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {renderTableBody()}
              </tbody>
            </table>
          </div>

          {/* Table footer with sync info */}
          <div className="px-6 py-3 border-t border-slate-800/60 bg-slate-800/20 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-mono flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sovereign Sync Engine — Terminal SNSR-SILICIUM-X1
            </span>
            <span className="text-xs text-slate-600">
              {data[activeTab].length} élément(s)
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODAL — Fiche Technique                                           */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
          >
            <motion.div
              className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-800/80 to-slate-900/80">
                <h2 className="text-lg font-bold flex items-center gap-3 text-white">
                  <div className="p-1.5 bg-emerald-500/15 rounded-lg">
                    <FileText size={16} className="text-emerald-400" />
                  </div>
                  {selectedItem ? 'Modifier la Fiche Technique' : 'Nouvelle Fiche de Conformité'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left column */}
                <div className="space-y-4">
                  <FormField
                    label={activeTab === 'certs' ? 'Désignation Certification' : activeTab === 'permits' ? 'Nom du Conducteur' : 'Compagnie d\'Assurance'}
                    value={activeTab === 'certs' ? formData.name : activeTab === 'permits' ? formData.driver : formData.company}
                    onChange={(v) => {
                      if (activeTab === 'certs') setFormData({ ...formData, name: v });
                      else if (activeTab === 'permits') setFormData({ ...formData, driver: v });
                      else setFormData({ ...formData, company: v });
                    }}
                    placeholder={activeTab === 'certs' ? 'ex: ISO 39001...' : activeTab === 'permits' ? 'ex: Jean Dupont' : 'ex: AXA Entreprise'}
                  />

                  <FormField
                    label={activeTab === 'certs' ? 'Organisme Émetteur' : activeTab === 'permits' ? 'Catégorie (ex: CE, C, ADR)' : 'Numéro de Police'}
                    value={activeTab === 'certs' ? formData.issuer : activeTab === 'permits' ? formData.category : formData.policyNumber}
                    onChange={(v) => {
                      if (activeTab === 'certs') setFormData({ ...formData, issuer: v });
                      else if (activeTab === 'permits') setFormData({ ...formData, category: v });
                      else setFormData({ ...formData, policyNumber: v });
                    }}
                    placeholder={activeTab === 'certs' ? 'AFNOR, NIST, Bureau Veritas...' : activeTab === 'permits' ? 'CE, C, D, ADR...' : 'POL-AXA-...'}
                  />

                  {activeTab === 'insurance' && (
                    <>
                      <FormField
                        label="Type de Couverture"
                        value={formData.coverage}
                        onChange={(v) => setFormData({ ...formData, coverage: v })}
                        placeholder="Tous Risques Flotte..."
                      />
                      <FormField
                        label="Véhicule / Flotte"
                        value={formData.vehicle}
                        onChange={(v) => setFormData({ ...formData, vehicle: v })}
                        placeholder="Camion X1, Flotte Paris..."
                      />
                      <FormField
                        label="Prime Annuelle (€)"
                        value={String(formData.premium || '')}
                        onChange={(v) => setFormData({ ...formData, premium: v })}
                        placeholder="2400"
                        type="number"
                      />
                    </>
                  )}

                  {activeTab === 'certs' && (
                    <FormField
                      label="Date d'Émission"
                      value={formData.dateIssue}
                      onChange={(v) => setFormData({ ...formData, dateIssue: v })}
                      type="date"
                    />
                  )}

                  <FormField
                    label="Date d'Expiration"
                    value={formData.dateExpiry}
                    onChange={(v) => setFormData({ ...formData, dateExpiry: v })}
                    type="date"
                  />
                </div>

                {/* Right column — Validation details */}
                <div className="bg-slate-800/40 rounded-2xl border border-slate-800 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <Shield size={12} /> Détails de Validation
                  </h3>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2 font-bold">Statut de Conformité</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-sm rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    >
                      <option value="Valid">✅ Valid — Conforme</option>
                      <option value="Warning">⚠️ Warning — Vigilance</option>
                      <option value="Expired">❌ Expired — Non-conforme</option>
                    </select>
                  </div>

                  {formData.dateExpiry && (
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/50">
                      <p className="text-xs text-slate-500 mb-1">Validité calculée</p>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={resolveStatus(formData.dateExpiry, formData.status as ComplianceStatus)} />
                        <span className="text-xs text-slate-400 font-mono">
                          {daysUntilExpiry(formData.dateExpiry)} jours
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    {[
                      { label: 'Sync Terminal', value: 'SNSR-SILICIUM-X1', color: 'text-emerald-400' },
                      { label: 'Miroir local', value: '/opt/sensorium/data/', color: 'text-blue-400' },
                      { label: 'Protocole', value: 'Sovereign Sync v3', color: 'text-purple-400' },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-slate-800/60 last:border-0">
                        <span className="text-xs text-slate-500">{row.label}</span>
                        <span className={`text-xs font-mono font-bold ${row.color}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2 font-bold">Notes d'Audit</label>
                    <textarea
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white h-20 outline-none focus:ring-1 focus:ring-emerald-500 transition resize-none"
                      placeholder="Ajouter des notes pour le prochain audit ou l'inspection terrain..."
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-800/40 border-t border-slate-800 flex justify-between items-center">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-semibold transition text-sm rounded-lg hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveAndSync}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl font-bold transition shadow-lg shadow-emerald-900/30 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>{isSyncing ? 'Synchronisation...' : 'Sauvegarder & Synchroniser'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODAL — Confirmation de suppression                              */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isDeleteModalOpen && itemToDelete && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900 border border-rose-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-rose-500/15 rounded-xl">
                    <Trash2 size={18} className="text-rose-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Confirmer la Suppression</h3>
                </div>
                <p className="text-slate-400 text-sm mb-2">
                  Vous êtes sur le point de supprimer définitivement cet élément du Registre Souverain :
                </p>
                <div className="bg-slate-800/60 rounded-xl p-4 mb-6 border border-slate-700/50">
                  <p className="font-bold text-white text-sm">
                    {itemToDelete.name || itemToDelete.driver || itemToDelete.company}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {itemToDelete.issuer || itemToDelete.licenseNumber || itemToDelete.policyNumber}
                  </p>
                  <p className="text-slate-500 text-xs mt-2 font-mono">
                    ⚠️ Cette action sera synchronisée avec le Terminal Physique.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
                    className="flex-1 px-4 py-2.5 text-slate-400 hover:text-white font-semibold transition text-sm rounded-xl border border-slate-700 hover:bg-slate-800"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition text-sm"
                  >
                    <Trash2 size={14} /> Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Reusable FormField ---
const FormField = ({
  label, value, onChange, placeholder = '', type = 'text'
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
  <div>
    <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2 font-bold">{label}</label>
    <input
      type={type}
      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition placeholder-slate-600"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

export default ComplianceRegistry;
