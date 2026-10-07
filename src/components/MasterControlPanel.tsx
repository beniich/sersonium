import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Server,
  Zap,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Snowflake,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Database,
  ArrowUpDown,
  FileSpreadsheet,
  X,
  CreditCard,
  Users,
} from "lucide-react";
import {
  masterControlService,
  type MasterControlData,
  type MasterControlRow,
} from "../services/masterControl.service";

interface MasterControlPanelProps {
  isDark?: boolean;
}

export const MasterControlPanel: React.FC<MasterControlPanelProps> = ({ isDark = true }) => {
  const [data, setData] = useState<MasterControlData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedRow, setSelectedRow] = useState<MasterControlRow | null>(null);
  const [sortField, setSortField] = useState<keyof MasterControlRow>("tenantName");
  const [sortAsc, setSortAsc] = useState(true);

  const fetchData = async () => {
    try {
      const res = await masterControlService.getStatus();
      setData(res);
      setLastRefreshed(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling toutes les 10s
    return () => clearInterval(interval);
  }, []);

  const filteredRows = useMemo(() => {
    if (!data) return [];
    return data.rows
      .filter((row) => {
        const matchesSearch =
          row.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.primaryNodeId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlan = filterPlan === "ALL" || row.plan === filterPlan;
        const matchesStatus =
          filterStatus === "ALL" ||
          (filterStatus === "ONLINE" && row.connection === "ONLINE") ||
          (filterStatus === "OFFLINE" && row.connection === "OFFLINE") ||
          (filterStatus === "UNPAID" && row.payment !== "PAID") ||
          (filterStatus === "ALERT" && row.criticalAlertsCount > 0);
        return matchesSearch && matchesPlan && matchesStatus;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === "number" && typeof valB === "number") {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [data, searchQuery, filterPlan, filterStatus, sortField, sortAsc]);

  const handleSort = (field: keyof MasterControlRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const exportCsv = () => {
    if (!data) return;
    const headers = [
      "Tenant",
      "Slug",
      "Plan",
      "Connexion",
      "Facturation",
      "Gaspillage DB (%)",
      "Charge Trafic (RPS)",
      "État Serveur",
      "Nœud Primaire",
      "CPU (%)",
      "Mémoire (%)",
      "Score DORA",
    ];
    const rows = data.rows.map((r) => [
      `"${r.tenantName}"`,
      r.slug,
      r.plan,
      r.connection,
      r.payment,
      r.dbWastePercent,
      r.trafficRps,
      r.serverStatus,
      r.primaryNodeId,
      r.cpuPercent,
      r.memoryPercent,
      r.doraScore,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sensorium_master_control_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 min-h-screen ${isDark ? "bg-[#0b0f17] text-white" : "bg-slate-50 text-slate-900"} font-sans`}>
      {/* ── Entête Exécutif ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/20">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Master Control Panel
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-500/20 text-violet-400 border border-violet-500/30">
                  C-Level Command Center
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Surveillance multi-tenant haute-densité : Sockets, Facturation, Gaspillage DB & Charge Nœuds Edge
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mise à jour : {lastRefreshed.toLocaleTimeString()}</span>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-medium transition cursor-pointer disabled:opacity-50"
            title="Rafraîchir"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition cursor-pointer"
          >
            <FileSpreadsheet size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── KPI Widgets Exécutifs ── */}
      {data?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users size={13} /> Tenants
            </span>
            <div className="text-2xl font-bold mt-1">
              {data.summary.onlineTenants} <span className="text-xs font-normal text-slate-500">/ {data.summary.totalTenants}</span>
            </div>
            <span className="text-xs text-emerald-400 font-medium">🟢 {Math.round((data.summary.onlineTenants / data.summary.totalTenants) * 100)}% Connectés</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CreditCard size={13} /> Facturation
            </span>
            <div className="text-2xl font-bold mt-1">
              {data.summary.paidTenants} <span className="text-xs font-normal text-slate-500">/ {data.summary.totalTenants}</span>
            </div>
            <span className="text-xs text-emerald-400 font-medium">✅ Comptes à jour</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Database size={13} /> Gaspillage DB
            </span>
            <div className="text-2xl font-bold mt-1 text-amber-400">
              {data.summary.avgDbWaste}%
            </div>
            <span className="text-xs text-slate-400">Moyenne optimisable</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap size={13} /> Trafic Global
            </span>
            <div className="text-2xl font-bold mt-1 text-cyan-400">
              {data.summary.globalRps.toLocaleString()}
            </div>
            <span className="text-xs text-slate-400">req / seconde</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Server size={13} /> Nœuds Edge
            </span>
            <div className="text-2xl font-bold mt-1 text-emerald-400">
              {data.summary.healthyNodesCount}
            </div>
            <span className="text-xs text-emerald-400">Anycast opérationnel</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AlertTriangle size={13} /> Alertes
            </span>
            <div className={`text-2xl font-bold mt-1 ${data.summary.activeDoraAlerts > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {data.summary.activeDoraAlerts}
            </div>
            <span className="text-xs text-slate-400">Incidents à surveiller</span>
          </div>
        </div>
      )}

      {/* ── Filtres & Barre d'outils ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par tenant, slug, nœud..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            aria-label="Filtrer par plan"
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-violet-500 transition cursor-pointer"
          >
            <option value="ALL">Tous les Plans</option>
            <option value="ENTERPRISE">Enterprise</option>
            <option value="PRO">Pro</option>
            <option value="STANDARD">Standard</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filtrer par statut"
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-violet-500 transition cursor-pointer"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ONLINE">Connectés</option>
            <option value="OFFLINE">Déconnectés</option>
            <option value="UNPAID">Factures Impayées</option>
            <option value="ALERT">En Alerte</option>
          </select>
        </div>
      </div>

      {/* ── Table Haute-Densité ── */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-white/5 text-slate-300 uppercase tracking-wider text-[11px] font-semibold border-b border-white/10">
              <th
                onClick={() => handleSort("tenantName")}
                className="p-3.5 cursor-pointer hover:text-white transition select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Client / Tenant</span>
                  <ArrowUpDown size={12} className="opacity-50" />
                </div>
              </th>
              <th
                onClick={() => handleSort("plan")}
                className="p-3.5 cursor-pointer hover:text-white transition select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Plan</span>
                  <ArrowUpDown size={12} className="opacity-50" />
                </div>
              </th>
              <th
                onClick={() => handleSort("connection")}
                className="p-3.5 cursor-pointer hover:text-white transition select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Connexion</span>
                  <ArrowUpDown size={12} className="opacity-50" />
                </div>
              </th>
              <th
                onClick={() => handleSort("payment")}
                className="p-3.5 cursor-pointer hover:text-white transition select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Facturation</span>
                  <ArrowUpDown size={12} className="opacity-50" />
                </div>
              </th>
              <th
                onClick={() => handleSort("dbWastePercent")}
                className="p-3.5 cursor-pointer hover:text-white transition select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Gaspillage DB</span>
                  <ArrowUpDown size={12} className="opacity-50" />
                </div>
              </th>
              <th
                onClick={() => handleSort("trafficRps")}
                className="p-3.5 cursor-pointer hover:text-white transition select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Charge Trafic</span>
                  <ArrowUpDown size={12} className="opacity-50" />
                </div>
              </th>
              <th
                onClick={() => handleSort("serverStatus")}
                className="p-3.5 cursor-pointer hover:text-white transition select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>État Serveur</span>
                  <ArrowUpDown size={12} className="opacity-50" />
                </div>
              </th>
              <th
                onClick={() => handleSort("cpuPercent")}
                className="p-3.5 cursor-pointer hover:text-white transition select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>CPU / Nœud</span>
                  <ArrowUpDown size={12} className="opacity-50" />
                </div>
              </th>
              <th className="p-3.5">Dernière Alerte</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredRows.map((row) => (
              <tr
                key={row.tenantId}
                className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                onClick={() => setSelectedRow(row)}
              >
                {/* 1. Tenant */}
                <td className="p-3.5">
                  <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {row.tenantName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {row.slug} • {row.activeUsersCount} user(s)
                  </div>
                </td>

                {/* 2. Plan */}
                <td className="p-3.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${
                      row.plan === "ENTERPRISE"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : row.plan === "PRO"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "bg-slate-700/50 text-slate-300 border border-slate-600/30"
                    }`}
                  >
                    {row.plan}
                  </span>
                </td>

                {/* 3. Connexion */}
                <td className="p-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 font-medium ${
                      row.connection === "ONLINE" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        row.connection === "ONLINE"
                          ? "bg-emerald-400 animate-pulse"
                          : "bg-rose-400"
                      }`}
                    />
                    {row.connectionBadge}
                  </span>
                </td>

                {/* 4. Facturation */}
                <td className="p-3.5">
                  <span
                    className={`font-semibold ${
                      row.payment === "PAID"
                        ? "text-emerald-400"
                        : row.payment === "PENDING"
                        ? "text-amber-400 font-bold"
                        : "text-rose-400 font-bold"
                    }`}
                  >
                    {row.paymentBadge}
                  </span>
                  {row.lastInvoiceAmount && (
                    <div className="text-[10px] text-slate-500">
                      {row.lastInvoiceAmount} {row.lastInvoiceCurrency}
                    </div>
                  )}
                </td>

                {/* 5. Gaspillage DB */}
                <td className="p-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          row.dbWastePercent > 12
                            ? "bg-rose-500"
                            : row.dbWastePercent > 6
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        }`}
                        style={{ width: `${Math.min(100, row.dbWastePercent * 5)}%` }}
                      />
                    </div>
                    <span className="font-mono text-slate-300">{row.dbWasteFormatted}</span>
                  </div>
                </td>

                {/* 6. Charge Trafic */}
                <td className="p-3.5">
                  <div className="flex items-center gap-1.5">
                    {row.trafficLoad === "HIGH" ? (
                      <Flame size={13} className="text-orange-400" />
                    ) : (
                      <Snowflake size={13} className="text-cyan-400" />
                    )}
                    <span
                      className={`font-medium ${
                        row.trafficLoad === "HIGH"
                          ? "text-orange-400 font-bold"
                          : "text-slate-300"
                      }`}
                    >
                      {row.trafficBadge}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {row.trafficRps.toLocaleString()} rps
                  </div>
                </td>

                {/* 7. État Serveur */}
                <td className="p-3.5">
                  <span
                    className={`font-semibold ${
                      row.serverStatus === "ONLINE"
                        ? "text-emerald-400"
                        : row.serverStatus === "SATURATED"
                        ? "text-amber-400"
                        : "text-rose-400 font-bold animate-pulse"
                    }`}
                  >
                    {row.serverBadge}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {row.edgeLatencyMs} ms
                  </div>
                </td>

                {/* 8. CPU */}
                <td className="p-3.5">
                  <div className="font-mono font-bold text-slate-200">
                    {row.cpuPercent}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate max-w-[90px]">
                    {row.primaryNodeId}
                  </div>
                </td>

                {/* 9. Dernière Alerte */}
                <td className="p-3.5 max-w-[200px]">
                  <span
                    className={`text-[11px] truncate block ${
                      row.criticalAlertsCount > 0 ? "text-amber-300 font-medium" : "text-slate-400"
                    }`}
                  >
                    {row.lastAlert}
                  </span>
                </td>

                {/* 10. Action */}
                <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedRow(row)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition cursor-pointer"
                  >
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRows.length === 0 && (
          <div className="p-12 text-center text-slate-500 text-sm">
            Aucun tenant ne correspond aux critères de filtre.
          </div>
        )}
      </div>

      {/* ── Modal Détails Tenant ── */}
      <AnimatePresence>
        {selectedRow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedRow(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#121824] border border-white/10 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30">
                    <Server size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedRow.tenantName}</h2>
                    <p className="text-xs text-slate-400 font-mono">
                      ID: {selectedRow.tenantId} • Slug: {selectedRow.slug}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRow(null)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Plan de Service</span>
                  <div className="text-base font-bold text-white mt-0.5">{selectedRow.plan}</div>
                  <span className="text-[10px] text-slate-500">Quota: {(selectedRow.tokensCapacity / 1_000_000).toFixed(0)}M jetons</span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Statut Facturation</span>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">{selectedRow.paymentBadge}</div>
                  <span className="text-[10px] text-slate-500">Dernier montant: {selectedRow.lastInvoiceAmount || 0} {selectedRow.lastInvoiceCurrency}</span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Connexion Active</span>
                  <div className="text-base font-bold text-white mt-0.5">{selectedRow.connectionBadge}</div>
                  <span className="text-[10px] text-slate-500">{selectedRow.lastActiveFormatted}</span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Nœud Anycast</span>
                  <div className="text-sm font-bold text-cyan-300 mt-0.5">{selectedRow.primaryNodeId}</div>
                  <span className="text-[10px] text-slate-500">{selectedRow.nodeRegion}</span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Score DORA</span>
                  <div className="text-base font-bold text-indigo-400 mt-0.5">{selectedRow.doraScore}%</div>
                  <span className="text-[10px] text-slate-500">Résilience opérationnelle</span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Gaspillage DB</span>
                  <div className="text-base font-bold text-amber-400 mt-0.5">{selectedRow.dbWasteFormatted}</div>
                  <span className="text-[10px] text-slate-500">Index/Null overhead</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 mb-5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-400">Consommation CPU</span>
                  <span className="font-mono text-white font-bold">{selectedRow.cpuPercent}%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedRow.cpuPercent > 80 ? "bg-rose-500" : "bg-cyan-500"
                    }`}
                    style={{ width: `${selectedRow.cpuPercent}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 mb-5 flex items-start gap-2.5">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Observation Exécutive</div>
                  <div className="text-[11px] text-amber-200/80 mt-0.5">{selectedRow.lastAlert}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedRow(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MasterControlPanel;
