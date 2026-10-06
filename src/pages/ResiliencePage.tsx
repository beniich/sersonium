import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  ShieldCheck,
  Globe,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Activity,
  Server,
  Lock,
  Zap,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  X,
  Search,
  Filter,
} from "lucide-react";
import { complianceService, ComplianceService, type DoraRequirement, type DoraAuditMetrics } from "../services/compliance.service";
import { dnsService, type DnsFleetSummary, type DomainAsset } from "../services/dns.service";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = "dora" | "dns" | "incidents";

// ─── DORA Score Gauge ─────────────────────────────────────────────────────────

function DoraGauge({ score }: { score: number }) {
  const radius = 70;
  const cx = 90;
  const cy = 90;
  const circumference = Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);

  const color = score >= 95 ? "#10b981" : score >= 80 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="110" viewBox="0 0 180 110">
        {/* Background arc */}
        <path
          d={`M 20 90 A 70 70 0 0 1 160 90`}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={`M 20 90 A 70 70 0 0 1 160 90`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1.5s ease, stroke 0.5s ease" }}
        />
        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Score text */}
        <text x="90" y="84" textAnchor="middle" fontSize="26" fontWeight="800" fill="white" filter="url(#glow)">
          {score}%
        </text>
        <text x="90" y="100" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)" letterSpacing="1.5">
          SCORE DORA
        </text>
      </svg>
    </div>
  );
}

// ─── Pillar Badge ─────────────────────────────────────────────────────────────

const PILLAR_LABELS: Record<string, { label: string; color: string }> = {
  ICT_RISK_MANAGEMENT:  { label: "ICT Risk", color: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  INCIDENT_REPORTING:   { label: "Incidents", color: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  DIGITAL_TESTING:      { label: "Testing", color: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  THIRD_PARTY_RISK:     { label: "3rd Party", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  THREAT_SHARING:       { label: "Intel Sharing", color: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};

// ─── Status Chip ─────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: "COMPLIANT" | "PARTIALLY_COMPLIANT" | "VERIFIED" }) {
  const map = {
    COMPLIANT:           { label: "✓ Conforme", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    VERIFIED:            { label: "⊕ Vérifié",  cls: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
    PARTIALLY_COMPLIANT: { label: "⚠ Partiel",  cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 flex flex-col gap-1 ${color}`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-70">
        <Icon size={13} />
        {label}
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs opacity-60">{sub}</div>}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface ResiliencePageProps {
  isDark?: boolean;
}

export default function ResiliencePage({ isDark = true }: ResiliencePageProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dora");
  const [metrics, setMetrics] = useState<DoraAuditMetrics | null>(null);
  const [fleetSummary, setFleetSummary] = useState<DnsFleetSummary | null>(null);
  const [criticalDomains, setCriticalDomains] = useState<DomainAsset[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingFleet, setIsLoadingFleet] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isExportingBind, setIsExportingBind] = useState(false);
  const [domainSearch, setDomainSearch] = useState("");
  const [selectedReq, setSelectedReq] = useState<DoraRequirement | null>(null);

  // Load DORA metrics
  useEffect(() => {
    setIsLoadingMetrics(true);
    complianceService.getDoraComplianceMetrics().then(m => {
      setMetrics(m);
      setIsLoadingMetrics(false);
    });
  }, []);

  // Load DNS fleet
  useEffect(() => {
    if (activeTab === "dns") {
      setIsLoadingFleet(true);
      Promise.all([
        dnsService.getFleetSummary(),
        dnsService.getCriticalAlerts(),
      ]).then(([summary, alerts]) => {
        setFleetSummary(summary);
        setCriticalDomains(alerts.slice(0, 20));
        setIsLoadingFleet(false);
      });
    }
  }, [activeTab]);

  const handleGeneratePdf = useCallback(async () => {
    setIsGeneratingPdf(true);
    try {
      await complianceService.downloadDoraPasReportPDF("ICDC - Informatique Caisse des Dépôts");
    } finally {
      setIsGeneratingPdf(false);
    }
  }, []);

  const handleExportBind = useCallback(() => {
    setIsExportingBind(true);
    setTimeout(() => {
      dnsService.downloadBind1035Export();
      setIsExportingBind(false);
    }, 600);
  }, []);

  const filteredDomains = criticalDomains.filter(d =>
    !domainSearch || d.fqdn.toLowerCase().includes(domainSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-violet-500" />
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
              Résilience Numérique Souveraine
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Centre de Conformité & Résilience DORA
          </h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
            Règlement UE 2022/2554 · AO 25ML148 · ICDC / Caisse des Dépôts · 1 571 domaines
          </p>
        </div>

        {/* One-Click PAS Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGeneratePdf}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg transition-all disabled:opacity-60 cursor-pointer"
          style={{ background: "linear-gradient(135deg, #630ed4, #0e7490)" }}
        >
          {isGeneratingPdf ? (
            <><RefreshCw size={15} className="animate-spin" /> Génération PDF…</>
          ) : (
            <><FileText size={15} /> Générer PAS / Rapport DORA (PDF)</>
          )}
        </motion.button>
      </div>

      {/* ── KPI Cards ── */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard icon={TrendingUp} label="Score DORA" value={`${metrics.overallScore}%`} sub="Conformité optimale" color="bg-violet-500/10 border-violet-500/20 text-violet-300" />
          <KpiCard icon={CheckCircle2} label="Exigences" value={`${metrics.compliantCount}/${metrics.totalRequirements}`} sub="Conformes / Vérifiées" color="bg-emerald-500/10 border-emerald-500/20 text-emerald-300" />
          <KpiCard icon={Clock} label="MTTD" value={`${metrics.meanTimeToDetectMinutes} min`} sub="Détection moyenne" color="bg-sky-500/10 border-sky-500/20 text-sky-300" />
          <KpiCard icon={Zap} label="MTTR" value={`${metrics.meanTimeToMitigateMinutes} min`} sub="Neutralisation" color="bg-amber-500/10 border-amber-500/20 text-amber-300" />
          <KpiCard icon={Activity} label="SLA" value={`${metrics.slaAvailability}%`} sub="Disponibilité garantie" color="bg-rose-500/10 border-rose-500/20 text-rose-300" />
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-neutral-800">
        {[
          { id: "dora", label: "Matrice DORA", icon: Shield },
          { id: "dns",  label: "Flotte DNS (1 571)", icon: Globe },
          { id: "incidents", label: "Incidents P1/P2", icon: AlertTriangle },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as ActiveTab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === id
                ? "border-b-2 border-violet-500 text-violet-600 dark:text-violet-400 bg-violet-500/5"
                : "text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        {activeTab === "dora" && (
          <motion.div key="dora" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Gauge Card */}
              <div className="lg:col-span-1 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1a1030]/80 to-[#0f1922]/80 p-6 flex flex-col items-center justify-center gap-4">
                {isLoadingMetrics ? (
                  <RefreshCw size={32} className="animate-spin text-violet-400" />
                ) : (
                  <>
                    <DoraGauge score={metrics?.overallScore ?? 0} />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-white">{metrics?.certificationStatus}</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Évalué le {metrics ? new Date(metrics.evaluationDate).toLocaleDateString("fr-FR") : "—"}
                      </p>
                    </div>
                    <div className="w-full bg-white/5 rounded-lg px-4 py-3 text-center">
                      <p className="text-xs text-neutral-400">Périmètre</p>
                      <p className="text-sm font-bold text-white mt-0.5">{metrics?.monitoredDomainsCount.toLocaleString()} Domaines DNS</p>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-2 text-center">
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-xs text-neutral-400">Assurance</p>
                        <p className="text-sm font-bold text-emerald-400">15 M€</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-xs text-neutral-400">SLA</p>
                        <p className="text-sm font-bold text-sky-400">99.999%</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Requirements Matrix */}
              <div className="lg:col-span-2 space-y-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-3">
                  Matrice de Conformité — 5 Piliers DORA (Règlement UE 2022/2554)
                </h3>
                {ComplianceService.DORA_REQUIREMENTS.map((req, i) => {
                  const pillar = PILLAR_LABELS[req.pillar];
                  return (
                    <motion.button
                      key={req.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => setSelectedReq(selectedReq?.id === req.id ? null : req)}
                      className="w-full text-left rounded-xl border border-slate-200/60 dark:border-white/[0.07] bg-white/60 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] p-3.5 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <ShieldCheck size={16} className="text-violet-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono text-slate-400 dark:text-neutral-500">{req.id}</span>
                              <span className="text-xs text-slate-500 dark:text-neutral-500">{req.article}</span>
                              {pillar && (
                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${pillar.color}`}>
                                  {pillar.label}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5 truncate">{req.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right hidden sm:block">
                            <div className="text-lg font-bold text-emerald-400">{req.score}%</div>
                          </div>
                          <StatusChip status={req.status} />
                          <ChevronRight size={14} className={`text-neutral-400 transition-transform ${selectedReq?.id === req.id ? "rotate-90" : ""}`} />
                        </div>
                      </div>

                      {/* Expanded detail */}
                      <AnimatePresence>
                        {selectedReq?.id === req.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/[0.06] space-y-2">
                              <p className="text-xs text-slate-600 dark:text-neutral-400">{req.description}</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-xs bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md text-slate-600 dark:text-neutral-300">
                                  <span className="font-semibold">Module:</span> {req.mappedSensoriumModule}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-neutral-500">
                                <span className="font-semibold">Preuve d'audit :</span> {req.evidence}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "dns" && (
          <motion.div key="dns" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {isLoadingFleet ? (
              <div className="flex items-center justify-center py-20 gap-3 text-neutral-400">
                <RefreshCw size={20} className="animate-spin" />
                <span>Chargement de la flotte DNS…</span>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Fleet KPIs */}
                {fleetSummary && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {[
                      { label: "Total Domaines", v: fleetSummary.totalDomains.toLocaleString(), cls: "text-white" },
                      { label: "Opérationnels", v: fleetSummary.operational.toLocaleString(), cls: "text-emerald-400" },
                      { label: "Dégradés", v: fleetSummary.degraded, cls: "text-amber-400" },
                      { label: "DOWN", v: fleetSummary.down, cls: "text-red-400" },
                      { label: "DNSSEC Signés", v: fleetSummary.dnssecSigned.toLocaleString(), cls: "text-violet-400" },
                      { label: "Expiration < 30j", v: fleetSummary.expiringWithin30Days, cls: "text-orange-400" },
                    ].map(({ label, v, cls }) => (
                      <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-center">
                        <p className="text-xs text-neutral-400">{label}</p>
                        <p className={`text-xl font-bold mt-1 ${cls}`}>{v}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Export PSR RFC 1035 button */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Alertes Critiques — Domaines Prioritaires</h3>
                    <p className="text-xs text-neutral-400">Expiration &lt; 30j · DOWN · DNSSEC Rollover</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleExportBind}
                    disabled={isExportingBind}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-teal-600/80 hover:bg-teal-600 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {isExportingBind ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
                    Export PSR RFC 1035 (BIND)
                  </motion.button>
                </div>

                {/* Search */}
                <div className="relative max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={domainSearch}
                    onChange={e => setDomainSearch(e.target.value)}
                    placeholder="Filtrer par domaine…"
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                {/* Critical domains list */}
                <div className="rounded-xl border border-white/[0.07] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                        {["Domaine", "Registrar", "DNSSEC", "SSL", "Expiration", "Statut"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDomains.map((d, i) => (
                        <tr key={d.id} className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                          <td className="px-4 py-3 font-mono text-xs text-violet-300">{d.fqdn}</td>
                          <td className="px-4 py-3 text-xs text-neutral-400 hidden md:table-cell">{d.registrar.split("/")[0].trim()}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              d.dnssec.status === "SIGNED" ? "bg-emerald-500/15 text-emerald-400" :
                              d.dnssec.status === "ROLLOVER_PENDING" ? "bg-amber-500/15 text-amber-400" :
                              "bg-red-500/15 text-red-400"
                            }`}>
                              {d.dnssec.status === "SIGNED" ? "✓ Signé" : d.dnssec.status === "ROLLOVER_PENDING" ? "⚠ Rollover" : d.dnssec.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              d.ssl.status === "VALID" ? "bg-emerald-500/15 text-emerald-400" : "bg-orange-500/15 text-orange-400"
                            }`}>
                              J-{d.ssl.daysUntilExpiry}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium ${d.daysUntilRegistryExpiry <= 30 ? "text-red-400" : "text-neutral-300"}`}>
                              J-{d.daysUntilRegistryExpiry}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              d.status === "OPERATIONAL" ? "bg-emerald-500/15 text-emerald-400" :
                              d.status === "DEGRADED" ? "bg-amber-500/15 text-amber-400" :
                              "bg-red-500/15 text-red-400"
                            }`}>
                              {d.status === "OPERATIONAL" ? "✓ OK" : d.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredDomains.length === 0 && (
                    <div className="text-center py-8 text-neutral-500 text-sm">Aucun domaine critique trouvé</div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "incidents" && (
          <motion.div key="incidents" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300">Aucun Incident Actif (P1 / P2)</p>
                  <p className="text-xs text-emerald-400/60 mt-0.5">
                    Tous les services SENSORIUM fonctionnent normalement. Circuit Breakers : CLOSED. MTTD moyen : 0,4 min.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { level: "P1 CRITIQUE", desc: "Incident majeur — Signalement ACPR/ANSSI requis sous 2h (DORA Art. 17)", count: 0, cls: "border-red-500/30 bg-red-500/5 text-red-400" },
                  { level: "P2 MAJEUR", desc: "Incident significatif — Rapport initial sous 4h (DORA Art. 19)", count: 0, cls: "border-amber-500/30 bg-amber-500/5 text-amber-400" },
                  { level: "P3 MINEUR", desc: "Anomalie détectée et résolue automatiquement par le circuit breaker", count: 3, cls: "border-sky-500/30 bg-sky-500/5 text-sky-400" },
                ].map(({ level, desc, count, cls }) => (
                  <div key={level} className={`rounded-xl border p-4 ${cls}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest">{level}</span>
                      <span className="text-2xl font-black">{count}</span>
                    </div>
                    <p className="text-xs opacity-70">{desc}</p>
                  </div>
                ))}
              </div>

              {/* DORA compliance reference */}
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-3">
                <h3 className="text-sm font-semibold text-white">Procédure DORA d'Escalade Automatique</h3>
                <div className="space-y-2">
                  {[
                    { time: "T+0 min", action: "Détection automatique par WAF/Télémétrie & Classification P1/P2/P3", status: "auto" },
                    { time: "T+2 min", action: "Notification équipe RSSI + webhook SIEM + horodatage RFC 3161", status: "auto" },
                    { time: "T+30 min", action: "Rapport Initial à l'autorité compétente (ACPR / ANSSI) si P1", status: "dora" },
                    { time: "T+4h", action: "Rapport Intermédiaire détaillé avec analyse d'impact", status: "dora" },
                    { time: "T+1 mois", action: "Rapport Final avec mesures correctives et Plan de Continuité", status: "dora" },
                  ].map(({ time, action, status }) => (
                    <div key={time} className="flex items-start gap-3">
                      <span className="text-xs font-mono text-violet-400 w-20 shrink-0 pt-0.5">{time}</span>
                      <div className="flex items-start gap-2 flex-1">
                        {status === "auto" ? (
                          <Zap size={12} className="text-sky-400 shrink-0 mt-0.5" />
                        ) : (
                          <Shield size={12} className="text-violet-400 shrink-0 mt-0.5" />
                        )}
                        <p className="text-xs text-neutral-300">{action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
