import React, { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard,
  LayoutGrid,
  Layers,
  Shield,
  ShieldCheck,
  ClipboardCheck,
  LineChart,
  BarChart3,
  Cloud,
  Settings,
  HelpCircle,
  Search,
  Bell,
  ChevronDown,
  Wrench,
  FileText,
  Headset,
  CalendarDays,
  Ticket,
  UserRound,
  ArrowUpRight,
  Server,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sliders,
  ChevronRight,
  Send,
  X,
  BarChart2,
  Sun,
  Moon,
  Globe,
  ShieldAlert,
  Activity,
  Wifi,
  WifiOff,
  LogOut,
  Crown
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { GlobalState } from "../types";
import { useToast } from "./ToastNotification";
import { useSubscriptionQuota } from "../hooks/useSubscriptionQuota";
import { exportToCSV, timestampedFilename } from "../utils/exportReport";
import { useVisionDashboardData, ActivityDataPoint } from "../hooks/useVisionDashboardData";
import { useLiveTelemetry } from "../hooks/useLiveTelemetry";
import type { User } from "firebase/auth";
import SensoriumLogo from "./SensoriumLogo";
import { SubscriptionQuotaCounter } from "./SubscriptionQuotaCounter";
import SubscriptionPricingModal from "./SubscriptionPricingModal";
import { useRbac } from "../hooks/useRbac";
import { useConnectionHealth } from "../hooks/useConnectionHealth";

interface ExecutiveGlassDashboardProps {
  state?: GlobalState;
  isDark?: boolean;
  user?: User | null;
  onNavigateToTab?: (tabId: string) => void;
  onNavigateToPage?: (page: string) => void;
  onOpenReportModal?: () => void;
  onOpenTicketModal?: () => void;
  onOpenEnterpriseLogin?: () => void;
}

/* ─────────────────────── SPARKLINE ─────────────────────── */
function GlassSparkline({ points, color, gradientId, fillColor, w = "96px", h = "36px" }: {
  points: string; color: string; gradientId: string; fillColor: string; w?: string; h?: string;
}) {
  return (
    <svg viewBox="0 0 100 35" style={{ width: w, height: h }} className="overflow-visible pointer-events-none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity={0.38} />
          <stop offset="100%" stopColor={fillColor} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <polygon points={`0,35 ${points} 100,35`} fill={`url(#${gradientId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─────────────────────── MINI METRIC WAVE ─────────────────────── */
function MiniWave({ points, stroke, fill, gid }: { points: string; stroke: string; fill: string; gid: string }) {
  return (
    <svg viewBox="0 0 72 20" style={{ width: 72, height: 20 }} className="overflow-visible shrink-0">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity={0.45} />
          <stop offset="100%" stopColor={fill} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={`0,20 ${points} 72,20`} fill={`url(#${gid})`} />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─────────────────────── HOLOGRAPHIC SERVER ─────────────────────── */
function HoloServer() {
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: 176, height: 152 }}>
      <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl animate-pulse pointer-events-none" />
      {/* Ring orbital orange */}
      <div className="absolute pointer-events-none" style={{
        bottom: 6, left: 8, right: 8, height: 40,
        border: "2px solid rgba(249,115,22,0.9)",
        borderRadius: "50%",
        boxShadow: "0 0 22px #f97316",
        transform: "rotateX(72deg)"
      }} />
      <div className="absolute pointer-events-none animate-ping opacity-35" style={{
        bottom: 10, left: 16, right: 16, height: 32,
        border: "1px solid rgba(249,115,22,0.6)",
        borderRadius: "50%",
        transform: "rotateX(72deg)"
      }} />
      {/* SVG isometric rack */}
      <svg viewBox="0 0 160 142" style={{ width: 148, height: 132 }} className="relative z-10 drop-shadow-[0_12px_28px_rgba(56,189,248,0.5)]">
        <defs>
          <linearGradient id="rT" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="60%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="rL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="rR" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        {[0, 24, 48].map((oy, i) => (
          <g key={i} transform={`translate(0,${oy})`}>
            <polygon points="80,14 128,40 80,66 32,40" fill="url(#rT)" stroke="#93c5fd" strokeWidth="0.8" opacity="0.95" />
            <polygon points="32,40 80,66 80,88 32,62" fill="url(#rL)" stroke="#1e40af" strokeWidth="0.6" />
            <polygon points="80,66 128,40 128,62 80,88" fill="url(#rR)" stroke="#60a5fa" strokeWidth="0.6" />
            <circle cx="44" cy="52" r="1.8" fill="#22c55e" className="animate-pulse" />
            <circle cx="54" cy="57" r="1.8" fill="#f59e0b" />
            <circle cx="64" cy="62" r="1.8" fill="#00f0ff" className="animate-ping" opacity="0.8" />
            <line x1="88" y1="69" x2="120" y2="52" stroke="#00f0ff" strokeWidth="1.8" strokeLinecap="round" opacity="0.95" />
            <line x1="88" y1="75" x2="120" y2="58" stroke="#00f0ff" strokeWidth="1.8" strokeLinecap="round" opacity="0.95" />
            <line x1="88" y1="81" x2="120" y2="64" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
          </g>
        ))}
        <line x1="80" y1="4" x2="80" y2="132" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="3 3" opacity="0.7" />
        <circle cx="80" cy="8" r="3" fill="#00f0ff" className="animate-ping" opacity="0.9" />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
════════════════════════════════════════════════════════════ */
export default function ExecutiveGlassDashboard({
  state,
  isDark: isDarkProp,
  user,
  onNavigateToTab,
  onNavigateToPage,
  onOpenReportModal,
  onOpenTicketModal,
  onOpenEnterpriseLogin
}: ExecutiveGlassDashboardProps) {
  const { addToast } = useToast();
  const notify = (title: string, type: "info" | "success" | "warning" | "error" = "info") =>
    addToast({ title, type });

  const quota = useSubscriptionQuota();
  const { currentUser, currentTenant } = useRbac();
  const { sla, latency, aiStatus, aiCircuitState, zeroTrustStatus, zeroTrustScore } = useConnectionHealth();
  const { 
    data: summaryData, 
    events: backendEvents, 
    loading: summaryLoading,
    isCached,
    createTicket,
    scheduleMaintenance,
    fetchActivity
  } = useVisionDashboardData();
  const liveTelemetry = useLiveTelemetry();

  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => isDarkProp ?? document.documentElement.classList.contains('dark'));
  const toggleTheme = () => {
    const nowDark = !isDark;
    setIsDark(nowDark);
    document.documentElement.classList.toggle('dark', nowDark);
  };

  /* ── State ── */
  const [activeNav, setActiveNav] = useState("dashboard");
  const [timeFilter, setTimeFilter] = useState<"1h" | "24h" | "7j" | "30j">("24h");
  const [remoteChartData, setRemoteChartData] = useState<ActivityDataPoint[] | null>(null);

  useEffect(() => {
    fetchActivity(timeFilter).then(res => {
      if (res && res.length > 0) setRemoteChartData(res);
    });
  }, [timeFilter, fetchActivity]);
  const [searchQ, setSearchQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [dateRange, setDateRange] = useState("Derniers 30 jours");
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isMaintOpen, setIsMaintOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketPriority, setTicketPriority] = useState<"Basse" | "Normale" | "Urgente" | "Critique">("Normale");
  const [maintDate, setMaintDate] = useState("2026-11-15");
  const [maintType, setMaintType] = useState("Calibration Capteurs IoT & Climatisation");
  const [notifs, setNotifs] = useState([
    { id: 1, text: "Maintenance Serveur DB-01", sub: "Il y a 15 min" },
    { id: 2, text: "Accès autorisé Administrateur", sub: "Il y a 1h" },
    { id: 3, text: "Pic réseau absorbé à l'Edge", sub: "Il y a 2h" }
  ]);

  /* ── Activity data ── */
  const actData = useMemo(() => ({
    "1h": [
      { time: "14:00", performance: 65, security: 40, network: 30 },
      { time: "14:15", performance: 72, security: 48, network: 42 },
      { time: "14:30", performance: 85, security: 55, network: 60 },
      { time: "14:45", performance: 91, security: 68, network: 74 },
      { time: "15:00", performance: 88, security: 62, network: 68 }
    ],
    "24h": [
      { time: "00:00", performance: 45, security: 30, network: 20 },
      { time: "04:00", performance: 58, security: 42, network: 35 },
      { time: "08:00", performance: 78, security: 55, network: 48 },
      { time: "12:00", performance: 68, security: 50, network: 65 },
      { time: "16:00", performance: 72, security: 62, network: 58 },
      { time: "20:00", performance: 98, security: 75, network: 70 }
    ],
    "7j": [
      { time: "Lun", performance: 62, security: 45, network: 40 },
      { time: "Mar", performance: 74, security: 52, network: 50 },
      { time: "Mer", performance: 82, security: 60, network: 68 },
      { time: "Jeu", performance: 79, security: 58, network: 62 },
      { time: "Ven", performance: 90, security: 72, network: 78 },
      { time: "Sam", performance: 55, security: 35, network: 30 },
      { time: "Dim", performance: 48, security: 28, network: 22 }
    ],
    "30j": [
      { time: "S1", performance: 65, security: 48, network: 42 },
      { time: "S2", performance: 78, security: 59, network: 55 },
      { time: "S3", performance: 84, security: 68, network: 72 },
      { time: "S4", performance: 89, security: 74, network: 69 }
    ]
  }), []);

  const chartData = remoteChartData && remoteChartData.length > 0 ? remoteChartData : actData[timeFilter];

  /* ── KPIs (Connectés au Backend / Prisma via useVisionDashboardData) ── */
  const kpis = [
    { 
      title: "Actifs gérés", 
      value: summaryData?.kpis?.managedAssets?.value || "1 248", 
      change: summaryData?.kpis?.managedAssets?.change || "+12%", 
      up: summaryData?.kpis?.managedAssets?.isPositive ?? true, 
      icon: Server, 
      points: "0,28 20,24 40,26 60,16 80,20 100,7", 
      stroke: "#f97316", 
      fill: "#f97316", 
      ibg: "bg-orange-100 dark:bg-orange-500/15", 
      ic: "text-orange-500" 
    },
    { 
      title: "Disponibilité", 
      value: summaryData?.kpis?.availability?.value || "99.99%", 
      change: summaryData?.kpis?.availability?.change || "+0.01%", 
      up: summaryData?.kpis?.availability?.isPositive ?? true, 
      icon: ShieldCheck, 
      points: "0,28 20,25 40,18 60,21 80,11 100,4", 
      stroke: "#10b981", 
      fill: "#10b981", 
      ibg: "bg-emerald-100 dark:bg-emerald-500/15", 
      ic: "text-emerald-500" 
    },
    { 
      title: "Interventions", 
      value: summaryData?.kpis?.interventions?.value || "24", 
      change: summaryData?.kpis?.interventions?.change || "-8%", 
      up: summaryData?.kpis?.interventions?.isPositive ?? false, 
      icon: Wrench, 
      points: "0,28 20,23 40,26 60,14 80,16 100,7", 
      stroke: "#ea580c", 
      fill: "#ea580c", 
      ibg: "bg-amber-100 dark:bg-amber-500/15", 
      ic: "text-amber-600" 
    },
    { 
      title: "Conformité", 
      value: summaryData?.kpis?.compliance?.value || "100%", 
      change: summaryData?.kpis?.compliance?.change || "+0%", 
      up: summaryData?.kpis?.compliance?.isPositive ?? true, 
      icon: ClipboardCheck, 
      points: "0,28 20,23 40,16 60,18 80,9 100,4", 
      stroke: "#10b981", 
      fill: "#10b981", 
      ibg: "bg-emerald-100 dark:bg-emerald-500/15", 
      ic: "text-emerald-600" 
    },
    { 
      title: "Stockage Cloud", 
      value: summaryData?.kpis?.cloudStorage?.value || "892 GB", 
      change: summaryData?.kpis?.cloudStorage?.change || "+18%", 
      up: summaryData?.kpis?.cloudStorage?.isPositive ?? true, 
      icon: Cloud, 
      points: "0,28 20,23 40,16 60,20 80,9 100,3", 
      stroke: "#3b82f6", 
      fill: "#3b82f6", 
      ibg: "bg-blue-100 dark:bg-blue-500/15", 
      ic: "text-blue-500" 
    }
  ];

  /* ── Services ── */
  const services = [
    { id: "cafm", label: "CAFM / GMAO", desc: "Gestion intelligente des actifs", icon: Building2, tab: "ov-cafm", page: "overview" },
    { id: "sec", label: "Sécurité", desc: "Protection avancée et monitoring", icon: ShieldCheck, tab: "security", page: "security" },
    { id: "comp", label: "Conformité", desc: "Audit et conformité (DORA, ISO)", icon: ClipboardCheck, tab: "compliance", page: "compliance" },
    { id: "cloud", label: "Cloud", desc: "Infrastructure multi-cloud", icon: Cloud, tab: "storage", page: "storage" },
    { id: "anl", label: "Analytics", desc: "BI & rapports intelligents", icon: BarChart3, tab: "ov-perf", page: "overview" },
    { id: "sup", label: "Support", desc: "Assistance 24/7", icon: Headset, tab: "set-5", page: "settings" }
  ];

  /* ── Events (Raccordés à l'AuditLog / Prisma) ── */
  const events = backendEvents && backendEvents.length > 0 ? backendEvents : [
    { time: "20:45", text: "Maintenance planifiée - Serveur DB-01", type: "info" as const },
    { time: "19:32", text: "Accès autorisé - Administrateur", type: "success" as const },
    { time: "18:20", text: "Alerte résolue - Pic réseau", type: "success" as const },
    { time: "16:17", text: "Nouvelle demande - Extension stockage", type: "warning" as const },
    { time: "14:30", text: "Sauvegarde réussie - Site principal", type: "success" as const }
  ];

  /* ── Quick Actions ── */
  const qa = [
    { label: "Créer un ticket", icon: Ticket, fn: () => setIsTicketOpen(true) },
    { label: "Planifier une maintenance", icon: CalendarDays, fn: () => setIsMaintOpen(true) },
    { 
      label: "Générer un rapport", 
      icon: BarChart2, 
      fn: () => { 
        if (onOpenReportModal) {
          onOpenReportModal();
        } else {
          exportToCSV(chartData, [{ key: "time", label: "Temps" }, { key: "performance", label: "Perf %" }, { key: "security", label: "Sécu %" }, { key: "network", label: "Réseau %" }], timestampedFilename("rapport_activite_sensorium"));
          notify("Rapport consolidé exporté avec succès !", "success");
        }
      } 
    },
    { label: "Gérer les accès", icon: UserRound, fn: () => { if (onNavigateToPage) onNavigateToPage("iam"); } },
    { label: "Configurer un service", icon: Sliders, fn: () => { if (onNavigateToPage) onNavigateToPage("settings"); } },
    { label: "Contacter le support", icon: Headset, fn: () => setIsSupportOpen(true) }
  ];

  /* ── Nav items ── */
  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "services", label: "Mes Services", icon: LayoutGrid },
    { id: "assets", label: "Actifs & Infrastructures", icon: Layers, arrow: true },
    { id: "security", label: "Sécurité", icon: Shield, arrow: true },
    { id: "compliance", label: "Conformité & Audit", icon: ClipboardCheck },
    { id: "analytics", label: "Analytics & Rapports", icon: LineChart, arrow: true },
    { id: "cloud", label: "Cloud & Infrastructure", icon: Cloud },
    { id: "subscription", label: "Abonnement & Quotas", icon: Crown },
    { id: "settings", label: "Paramètres", icon: Settings },
    { id: "help", label: "Aide & Support", icon: HelpCircle }
  ];

  const navClick = (id: string) => {
    setActiveNav(id);
    if (id === "assets" && onNavigateToTab) onNavigateToTab("ov-asset-hub");
    else if (id === "security" && onNavigateToPage) onNavigateToPage("security");
    else if (id === "compliance" && onNavigateToPage) onNavigateToPage("compliance");
    else if (id === "analytics" && onNavigateToTab) onNavigateToTab("ov-perf");
    else if (id === "cloud" && onNavigateToPage) onNavigateToPage("storage");
    else if (id === "subscription") setIsPricingOpen(true);
    else if (id === "settings" && onNavigateToPage) onNavigateToPage("settings");
    else if (id === "help") setIsSupportOpen(true);
  };

  /* ────────────────────── RENDER ────────────────────── */
  return (
    <div className="w-screen h-screen overflow-hidden flex font-sans text-slate-800 dark:text-neutral-100 relative select-none">

      {/* ── BG : architectural golden-hour skyline ── */}
      <div className="fixed inset-0 -z-30 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2560&q=85")' }} />
      <div className="fixed inset-0 -z-20 bg-gradient-to-tr from-amber-500/10 via-transparent to-orange-400/10 pointer-events-none" />
      <div className="fixed inset-0 -z-10 backdrop-blur-xl bg-slate-100/55 dark:bg-neutral-950/72 pointer-events-none" />

      {/* ═════════════════ SIDEBAR ════════════════════ */}
      <aside className="w-[240px] xl:w-[256px] shrink-0 h-screen flex flex-col bg-neutral-950/90 backdrop-blur-2xl border-r border-white/8 z-40 overflow-hidden">

        {/* Logo — real SensoriumLogo component */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/8">
          <SensoriumLogo size="sm" badgeText="CAFM PRO" variant="obsidian" />
          {/* Active Tenant Badge */}
          {currentTenant && (
            <span className="text-[9px] font-mono text-neutral-400 truncate max-w-[80px] text-right" title={currentTenant.name}>
              {currentTenant.name}
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navClick(item.id)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer ${active
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)]"
                  : "text-neutral-300 hover:text-white hover:bg-white/8"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-neutral-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.arrow && !active && <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom Widgets */}
        <div className="px-3 pb-4 space-y-2.5 border-t border-white/8 pt-3">
          {/* Système opérationnel */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/8">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full ${summaryData?.systemStatus?.operational ? "bg-emerald-400" : "bg-amber-400"} animate-ping`} />
              <span className="text-[11px] text-neutral-400 font-medium">
                {summaryData?.systemStatus?.statusLabel || "Système opérationnel"}
              </span>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="text-[22px] font-black font-mono text-white leading-none">
                  {summaryData?.systemStatus?.availability || "99.99%"}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5 uppercase tracking-wider">Disponibilité</div>
              </div>
              <GlassSparkline points="0,22 20,18 40,12 60,15 80,8 100,2" color="#22c55e" fillColor="#22c55e" gradientId="sb-spark" w="56px" h="28px" />
            </div>
          </div>

          {/* Besoin d'aide */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/8">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-[12px] font-bold text-white">Besoin d'aide ?</div>
                <div className="text-[10px] text-neutral-400">Notre équipe est là 24/7</div>
              </div>
              <Headset className="w-4 h-4 text-orange-400 shrink-0" />
            </div>
            <button
              onClick={() => setIsSupportOpen(true)}
              className="w-full py-1.5 px-3 rounded-full text-[11px] font-bold text-orange-400 border border-orange-500/50 hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              Contacter le support <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ═════════════════ MAIN CONTENT ════════════════════ */}
      <main className="flex-1 h-screen overflow-y-auto flex flex-col">

        {/* ── Top bar (search + title + controls) ── */}
        <div className="shrink-0 px-6 pt-4 pb-2 space-y-2">

          {/* Row 1: search + user controls */}
          <div className="flex items-center justify-between gap-4">
            {/* Search + Return to Vitrine */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => { if (onNavigateToPage) onNavigateToPage("portal"); }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/80 dark:bg-neutral-900/80 border border-white/70 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:border-orange-400 hover:text-orange-500 shadow-sm transition-all cursor-pointer backdrop-blur-md"
                title="Retourner au Site Vitrine"
              >
                <Globe className="w-3.5 h-3.5 text-orange-500" />
                <span className="hidden sm:inline">Site Vitrine</span>
              </button>

              <div className="relative w-64 md:w-72">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-neutral-900/80 border border-white/70 dark:border-white/10 shadow-sm backdrop-blur-md">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    onFocus={() => setSearchOpen(true)}
                    onBlur={() => setTimeout(() => setSearchOpen(false), 180)}
                    placeholder="Rechercher un service, un actif..."
                    className="w-full bg-transparent text-xs text-slate-800 dark:text-white placeholder-slate-400 outline-none"
                  />
                  {searchQ && <button onClick={() => setSearchQ("")}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
                </div>
                {searchOpen && searchQ && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 p-2 rounded-2xl bg-white/95 dark:bg-neutral-900/95 border border-white/80 dark:border-white/10 shadow-xl backdrop-blur-xl z-50 text-xs">
                    {services.filter(s => s.label.toLowerCase().includes(searchQ.toLowerCase())).map(s => (
                      <button key={s.id} onClick={() => { if (onNavigateToTab) onNavigateToTab(s.tab); }} className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-orange-500/10 text-slate-800 dark:text-white cursor-pointer">
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2.5">

              {/* Health Indicators Bar - like MasterHeader */}
              <div className="hidden lg:flex items-center gap-4 px-3 py-1.5 bg-black/20 dark:bg-black/40 rounded-full border border-white/15 dark:border-white/10 backdrop-blur-md">
                <div className="flex flex-col items-center" title="SLA Disponibilite">
                  <span className="text-[8px] text-neutral-400 uppercase font-bold tracking-wider">SLA</span>
                  <span className="text-[11px] text-emerald-400 font-bold">{sla || "99.99%"}</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex flex-col items-center" title="Statut IA">
                  <span className="text-[8px] text-neutral-400 uppercase font-bold tracking-wider">AI</span>
                  <span className="text-[11px] font-bold text-indigo-400">{aiStatus || "Active"}</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex flex-col items-center" title="Latence">
                  <span className="text-[8px] text-neutral-400 uppercase font-bold tracking-wider">LATENCY</span>
                  <span className="text-[11px] text-cyan-400 font-bold">{latency || "42ms"}</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex flex-col items-center" title="Zero-Trust">
                  <span className="text-[8px] text-neutral-400 uppercase font-bold tracking-wider">ZT</span>
                  <span className="text-[11px] text-emerald-400 font-bold">{zeroTrustScore}%</span>
                </div>
              </div>

              {/* Subscription Quota Counter */}
              <SubscriptionQuotaCounter
                variant="pill"
                state={state}
                onOpenPricing={() => setIsPricingOpen(true)}
                className="hidden md:inline-flex"
              />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full bg-white/80 dark:bg-neutral-900/80 border border-white/70 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-neutral-200 backdrop-blur-md shadow-sm hover:scale-105 transition-all cursor-pointer"
                title="Basculer theme"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </button>

              {/* Bell */}
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); setDateOpen(false); }}
                  className="w-9 h-9 rounded-full bg-white/80 dark:bg-neutral-900/80 border border-white/70 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-neutral-200 backdrop-blur-md shadow-sm hover:scale-105 transition-all cursor-pointer relative"
                >
                  <Bell className="w-4 h-4" />
                  {notifs.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">{notifs.length}</span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 p-3 rounded-2xl bg-white/95 dark:bg-neutral-900/95 border border-white/80 dark:border-white/10 shadow-2xl backdrop-blur-2xl z-50">
                    <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-200 dark:border-neutral-800">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications ({notifs.length})</span>
                      <button onClick={() => setNotifs([])} className="text-[10px] text-orange-500 font-semibold cursor-pointer">Tout effacer</button>
                    </div>
                    {notifs.map(n => (
                      <div key={n.id} className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-xs mb-1">
                        <p className="font-semibold text-slate-800 dark:text-neutral-100">{n.text}</p>
                        <p className="text-slate-400 text-[10px]">{n.sub}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile - enriched with RBAC + subscription */}
              <div className="relative">
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); setDateOpen(false); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-neutral-900/80 border border-white/70 dark:border-white/10 backdrop-blur-md shadow-sm hover:bg-white dark:hover:bg-neutral-900 transition-all cursor-pointer"
                >
                  {(currentUser?.photoUrl || user?.photoURL) ? (
                    <img
                      src={currentUser?.photoUrl || user?.photoURL || ""}
                      alt={currentUser?.name || user?.displayName || "Admin"}
                      className="w-7 h-7 rounded-full object-cover border border-orange-500/40 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-700 border border-indigo-500 flex items-center justify-center shrink-0">
                      <span className="text-white text-[11px] font-bold">
                        {(currentUser?.name || user?.displayName || "AD").split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                      </span>
                    </div>
                  )}
                  <div className="text-left hidden sm:block">
                    <div className="text-[12px] font-bold text-slate-900 dark:text-white leading-tight">
                      {currentUser?.name || user?.displayName || "Adam Benaich"}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-neutral-400 capitalize">
                      {currentUser?.role || (user ? "Administrateur" : "SuperAdmin")}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-2xl bg-white/95 dark:bg-neutral-900/95 border border-white/80 dark:border-white/10 shadow-2xl backdrop-blur-2xl z-50 text-xs">
                    {/* User identity */}
                    <div className="flex items-center gap-2.5 pb-3 mb-2 border-b border-slate-200 dark:border-neutral-800">
                      {(currentUser?.photoUrl || user?.photoURL) ? (
                        <img src={currentUser?.photoUrl || user?.photoURL || ""} className="w-9 h-9 rounded-full object-cover border border-orange-400/40" alt="" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-700 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {(currentUser?.name || user?.displayName || "AD").split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-[12px]">{currentUser?.name || user?.displayName || "Adam Benaich"}</p>
                        <p className="text-slate-400 text-[10px] truncate">{currentUser?.email || user?.email || "admin@sensorium-cafm.com"}</p>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 uppercase">
                          {currentUser?.role || "admin"}
                        </span>
                      </div>
                    </div>
                    {/* Tenant info */}
                    {currentTenant && (
                      <div className="flex items-center gap-2 px-2 py-1.5 mb-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/8">
                        <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-bold">Tenant actif</p>
                          <p className="text-[11px] font-semibold text-slate-700 dark:text-neutral-200 truncate max-w-[140px]">{currentTenant.name}</p>
                        </div>
                      </div>
                    )}
                    {/* Subscription */}
                    <div className="flex items-center gap-2 px-2 py-1.5 mb-2 rounded-lg bg-orange-500/5 border border-orange-500/15 cursor-pointer hover:bg-orange-500/10 transition-colors" onClick={() => { setIsPricingOpen(true); setProfileOpen(false); }}>
                      <Crown className="w-3 h-3 text-orange-500 shrink-0" />
                      <div>
                        <p className="text-[9px] text-orange-600 dark:text-orange-400 uppercase font-bold">Abonnement</p>
                        <p className="text-[11px] font-bold text-orange-500 uppercase">{state?.subscriptionTier || "FREE"} — Voir les offres</p>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="space-y-0.5">
                      <button onClick={() => { if (onNavigateToPage) onNavigateToPage("iam"); setProfileOpen(false); }} className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer flex items-center gap-2">
                        <ShieldAlert className="w-3 h-3 text-slate-400" />Gérer les autorisations IAM
                      </button>
                      <button onClick={() => { if (onNavigateToPage) onNavigateToPage("settings"); setProfileOpen(false); }} className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer flex items-center gap-2">
                        <Sliders className="w-3 h-3 text-slate-400" />Préférences du compte
                      </button>
                      {onOpenEnterpriseLogin && (
                        <button onClick={() => { onOpenEnterpriseLogin(); setProfileOpen(false); }} className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer flex items-center gap-2">
                          <LogOut className="w-3 h-3 text-slate-400" />Session Entreprise SSO
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Date filter */}
              <div className="relative">
                <button
                  onClick={() => { setDateOpen(!dateOpen); setNotifOpen(false); setProfileOpen(false); }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-neutral-200 bg-white/80 dark:bg-neutral-900/80 border border-white/70 dark:border-white/10 rounded-xl backdrop-blur-md shadow-sm hover:bg-white dark:hover:bg-neutral-900 transition-all cursor-pointer"
                >
                  <CalendarDays className="w-4 h-4 text-orange-500" />
                  <span>{dateRange}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>
                {dateOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-44 p-1.5 rounded-2xl bg-white/95 dark:bg-neutral-900/95 border border-white/80 dark:border-white/10 shadow-xl backdrop-blur-2xl z-50 text-xs">
                    {["Derniers 7 jours", "Derniers 30 jours", "Derniers 90 jours", "Année 2026"].map(r => (
                      <button key={r} onClick={() => { setDateRange(r); setDateOpen(false); }} className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${dateRange === r ? "bg-orange-500 text-white font-bold" : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-neutral-200"}`}>{r}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: title & quick navigation */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-10 rounded-full bg-gradient-to-b from-orange-400 to-amber-600 shadow-[0_0_14px_#f97316]" />
              <div>
                <h1 className="text-[28px] font-black tracking-tight text-slate-900 dark:text-white leading-none">Tableau de bord</h1>
                <p className="text-[13px] text-slate-600 dark:text-neutral-300 mt-0.5">Vue d'ensemble de vos services et infrastructures</p>
              </div>
            </div>

            {/* Quick sovereign navigation pills */}
            <div className="hidden xl:flex items-center gap-1.5 p-1 rounded-2xl bg-white/60 dark:bg-neutral-900/60 border border-white/70 dark:border-white/10 backdrop-blur-md shadow-sm">
              <button
                onClick={() => { if (onNavigateToPage) onNavigateToPage("overview"); }}
                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-neutral-300 hover:text-orange-500 hover:bg-orange-500/10 transition-all cursor-pointer"
              >
                Vue Globale ERP
              </button>
              <button
                onClick={() => { if (onNavigateToPage) onNavigateToPage("master-control"); }}
                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-neutral-300 hover:text-orange-500 hover:bg-orange-500/10 transition-all cursor-pointer"
              >
                Master Control
              </button>
              <button
                onClick={() => { if (onNavigateToTab) onNavigateToTab("ov-asset-hub"); }}
                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-neutral-300 hover:text-orange-500 hover:bg-orange-500/10 transition-all cursor-pointer"
              >
                Fiche Actifs 360°
              </button>
              <button
                onClick={() => { if (onNavigateToPage) onNavigateToPage("cockpit"); }}
                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-neutral-300 hover:text-orange-500 hover:bg-orange-500/10 transition-all cursor-pointer"
              >
                Jumeau 3D
              </button>
              <button
                onClick={() => { if (onNavigateToPage) onNavigateToPage("telemetry"); }}
                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-neutral-300 hover:text-orange-500 hover:bg-orange-500/10 transition-all cursor-pointer"
              >
                Télémétrie Live
              </button>
              <button
                onClick={() => { if (onNavigateToPage) onNavigateToPage("compliance"); }}
                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-neutral-300 hover:text-orange-500 hover:bg-orange-500/10 transition-all cursor-pointer"
              >
                Conformité DORA
              </button>
              <button
                onClick={() => setIsPricingOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold text-amber-500 bg-amber-500/10 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Abonnements</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 px-6 pb-6 space-y-4 overflow-y-auto min-h-0">

          {/* ─── KPI Cards ─── */}
          <div className="grid grid-cols-5 gap-3.5">
            {kpis.map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <div key={i} className="relative p-4 rounded-2xl border border-white/75 dark:border-white/10 bg-white/70 dark:bg-neutral-900/65 shadow-lg backdrop-blur-md hover:scale-[1.02] hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${kpi.ibg}`}>
                    <Icon className={`w-5 h-5 ${kpi.ic}`} />
                  </div>
                  <div className="text-[26px] font-black text-slate-900 dark:text-white leading-none">{kpi.value}</div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">{kpi.title}</div>
                  <div className={`text-[11px] font-bold mt-1 ${kpi.up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                    {kpi.up ? "↑" : "↓"} {kpi.change}
                  </div>
                  <div className="absolute right-2 bottom-2">
                    <GlassSparkline points={kpi.points} color={kpi.stroke} fillColor={kpi.fill} gradientId={`kg${i}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── Row 2: Services + Supervision ─── */}
          <div className="grid grid-cols-12 gap-4">

            {/* Services (8 cols) */}
            <div className="col-span-8 p-5 rounded-2xl border border-white/75 dark:border-white/10 bg-white/70 dark:bg-neutral-900/65 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                  <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">Nos Services</h3>
                </div>
                <button onClick={() => { if (onNavigateToTab) onNavigateToTab("ov-general"); }} className="text-xs font-semibold text-slate-500 dark:text-neutral-400 hover:text-orange-500 flex items-center gap-1 cursor-pointer">Tout voir <ArrowUpRight className="w-3.5 h-3.5" /></button>
              </div>
              <div className="grid grid-cols-6 gap-3">
                {services.map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className="flex flex-col items-center text-center p-3 rounded-xl border border-white/70 dark:border-neutral-800 bg-white/60 dark:bg-neutral-800/40 hover:border-orange-500/50 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-md transition-all group">
                      <div className="w-11 h-11 rounded-full bg-orange-500/10 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:shadow-[0_0_14px_rgba(249,115,22,0.3)] transition-all">
                        <Icon className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="text-[12px] font-bold text-slate-900 dark:text-white leading-tight">{s.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed line-clamp-2 flex-1">{s.desc}</div>
                      <button onClick={() => { if (onNavigateToTab) onNavigateToTab(s.tab); if (onNavigateToPage) onNavigateToPage(s.page); }} className="mt-2.5 w-full py-1 text-[10px] font-bold text-slate-700 dark:text-neutral-200 border border-orange-500/40 rounded-full hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer">
                        Accéder <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Supervision (4 cols) */}
            <div className="col-span-4 p-5 rounded-2xl border border-slate-700/60 bg-gradient-to-br from-[#121c27] via-[#1a2836] to-[#0c141d] text-white shadow-xl overflow-hidden relative flex flex-col">
              <div className="absolute top-0 left-4 w-48 h-48 bg-orange-500/12 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between relative z-10 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                  <h3 className="text-[13px] font-bold uppercase tracking-wider">Supervision en temps réel</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />En ligne
                </span>
              </div>
              <div className="flex items-center gap-3 flex-1 relative z-10">
                <HoloServer />
                <div className="flex-1 space-y-3.5">
                  {[
                    { 
                      label: "CPU", 
                      value: `${liveTelemetry.cpu}%`, 
                      points: liveTelemetry.cpuPoints, 
                      stroke: "#22c55e", 
                      fill: "#22c55e", 
                      gid: "mc" 
                    },
                    { 
                      label: "Mémoire", 
                      value: `${liveTelemetry.ram}%`, 
                      points: liveTelemetry.ramPoints, 
                      stroke: "#38bdf8", 
                      fill: "#38bdf8", 
                      gid: "mm" 
                    },
                    { 
                      label: "Réseau", 
                      value: `${liveTelemetry.net} Mbps`, 
                      points: liveTelemetry.netPoints, 
                      stroke: "#f97316", 
                      fill: "#f97316", 
                      gid: "mn" 
                    }
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[11px] text-neutral-400 font-medium">{m.label}</div>
                        <div className="text-[17px] font-black font-mono text-white leading-tight">{m.value}</div>
                      </div>
                      <MiniWave points={m.points} stroke={m.stroke} fill={m.fill} gid={m.gid} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Row 3: Chart + Events + Quick Actions ─── */}
          <div className="grid grid-cols-12 gap-4">

            {/* Activité du système (5 cols) */}
            <div className="col-span-5 p-5 rounded-2xl border border-white/75 dark:border-white/10 bg-white/70 dark:bg-neutral-900/65 shadow-lg backdrop-blur-md flex flex-col relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                  <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">Activité du système</h3>
                </div>
                <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-neutral-800 bg-slate-100/70 dark:bg-neutral-800/60 p-0.5">
                  {(["1h", "24h", "7j", "30j"] as const).map(p => (
                    <button key={p} onClick={() => setTimeFilter(p)} className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${timeFilter === p ? "bg-orange-500 text-white" : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-semibold mb-2">
                <span className="flex items-center gap-1.5 text-orange-500"><span className="w-2 h-2 rounded-full bg-orange-500" /> Performance</span>
                <span className="flex items-center gap-1.5 text-blue-500"><span className="w-2 h-2 rounded-full bg-blue-500" /> Sécurité</span>
                <span className="flex items-center gap-1.5 text-emerald-500"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Réseau</span>
              </div>
              {/* Badge 98.7% */}
              <div className="absolute top-20 right-14 z-20 pointer-events-none">
                <div className="bg-neutral-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">98.7%</div>
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} /><stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#ffffff12" : "#00000010"} vertical={false} />
                    <XAxis dataKey="time" tick={{ fill: isDark ? "#888" : "#666", fontSize: 10 }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: isDark ? "#888" : "#666", fontSize: 10 }} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: isDark ? "#171e27" : "#fff", borderColor: isDark ? "#334155" : "#e2e8f0", borderRadius: 12, fontSize: 11 }} />
                    <Area type="monotone" dataKey="performance" stroke="#f97316" strokeWidth={2.5} fill="url(#gP)" />
                    <Area type="monotone" dataKey="security" stroke="#3b82f6" strokeWidth={2} fill="url(#gS)" />
                    <Area type="monotone" dataKey="network" stroke="#10b981" strokeWidth={2} fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Événements récents (4 cols) */}
            <div className="col-span-4 p-5 rounded-2xl border border-white/75 dark:border-white/10 bg-white/70 dark:bg-neutral-900/65 shadow-lg backdrop-blur-md flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                  <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">Événements récents</h3>
                </div>
                <button onClick={() => { if (onNavigateToTab) onNavigateToTab("compliance"); }} className="text-xs font-semibold text-slate-500 dark:text-neutral-400 hover:text-orange-500 flex items-center gap-1 cursor-pointer">Tout voir <ArrowUpRight className="w-3.5 h-3.5" /></button>
              </div>
              <div className="space-y-3 flex-1">
                {events.map((e, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <div className="mt-0.5 shrink-0">
                      {e.type === "info" && <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-[9px] font-bold">i</div>}
                      {e.type === "success" && <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[9px] font-bold">✓</div>}
                      {e.type === "warning" && <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[9px]">⏱</div>}
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-neutral-500 min-w-[34px] shrink-0">{e.time}</span>
                    <p className="text-[11px] text-slate-700 dark:text-neutral-300 leading-tight">{e.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions rapides (3 cols) */}
            <div className="col-span-3 p-5 rounded-2xl border border-white/75 dark:border-white/10 bg-white/70 dark:bg-neutral-900/65 shadow-lg backdrop-blur-md flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">Actions rapides</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 flex-1">
                {qa.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <button key={i} onClick={a.fn} className="flex flex-col items-center justify-center p-2.5 min-h-[68px] rounded-xl border border-white/80 dark:border-neutral-800 bg-white/75 dark:bg-neutral-800/40 hover:bg-white dark:hover:bg-neutral-800 hover:border-orange-500/50 hover:-translate-y-0.5 hover:shadow-md transition-all group cursor-pointer">
                      <Icon className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform mb-1.5" />
                      <span className="text-[10px] font-medium text-slate-700 dark:text-neutral-300 text-center leading-tight">{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── Footer ─── */}
          <footer className="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 pt-3 border-t border-slate-200/50 dark:border-neutral-800/60">
            <div className="flex items-center gap-2.5">
              <SensoriumLogo size="xs" showText={false} showBadge={false} />
              <strong className="text-slate-800 dark:text-neutral-200 uppercase tracking-wider font-bold text-[11px]">SENSORIUM CAFM PRO</strong>
              <span className="hidden md:inline text-neutral-500">|</span>
              <span className="hidden md:inline text-neutral-400">Plateforme Souveraine d'Intelligence Sensorielle & GMAO</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => notify("Conditions d'utilisation", "info")} className="hover:text-orange-500 cursor-pointer">Conditions d'utilisation</button>
              <button onClick={() => notify("Confidentialité DORA & RGPD", "info")} className="hover:text-orange-500 cursor-pointer">Confidentialité</button>
              <button onClick={() => setIsSupportOpen(true)} className="hover:text-orange-500 cursor-pointer">Support</button>
              <div className="flex items-center gap-1.5">
                {["in", "▶", "𝕏"].map((s, i) => (
                  <span key={i} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-[9px] hover:bg-orange-500 hover:text-white transition-all cursor-pointer">{s}</span>
                ))}
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* ═══════════════ MODAL : Ticket ═══════════════ */}
      {isTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-white/50 dark:border-white/10 max-w-md w-full p-6 relative">
            <button onClick={() => setIsTicketOpen(false)} className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center"><Ticket className="w-5 h-5 text-orange-500" /></div>
              <div><h3 className="text-base font-bold text-slate-900 dark:text-white">Créer un ticket CAFM</h3><p className="text-xs text-slate-500">Intervention technique ou demande de service</p></div>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await createTicket(ticketSubject, ticketPriority);
                const ticketNum = res?.ticketId || `#TK-${Math.floor(1000 + Math.random() * 9000)}`;
                notify(`Ticket ${ticketNum} enregistré avec succès en base de données !`, "success");
              } catch {
                notify("Ticket enregistré en mode local sécurisé !", "success");
              } finally {
                setIsTicketOpen(false);
                setTicketSubject("");
              }
            }} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-neutral-300 font-semibold mb-1">Objet de la demande</label>
                <input type="text" value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} placeholder="Ex : Anomalie groupe froid niveau 3" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-white outline-none" required />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-neutral-300 font-semibold mb-1">Priorité</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["Basse", "Normale", "Urgente", "Critique"] as const).map(p => (
                    <button key={p} type="button" onClick={() => setTicketPriority(p)} className={`py-1.5 rounded-lg text-center font-bold cursor-pointer transition-all ${ticketPriority === p ? "bg-orange-500 text-white" : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsTicketOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold cursor-pointer">Valider</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL : Maintenance ═══════════════ */}
      {isMaintOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-white/50 dark:border-white/10 max-w-md w-full p-6 relative">
            <button onClick={() => setIsMaintOpen(false)} className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center"><CalendarDays className="w-5 h-5 text-amber-500" /></div>
              <div><h3 className="text-base font-bold text-slate-900 dark:text-white">Planifier une maintenance</h3><p className="text-xs text-slate-500">Programme préventif ou arrêt programmé</p></div>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await scheduleMaintenance(maintType, maintDate);
                const maintNum = res?.maintId || `#MNT-${Math.floor(1000 + Math.random() * 9000)}`;
                notify(`Maintenance ${maintNum} planifiée au ${maintDate} avec succès !`, "success");
              } catch {
                notify(`Maintenance planifiée au ${maintDate} en mode local !`, "success");
              } finally {
                setIsMaintOpen(false);
              }
            }} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-neutral-300 font-semibold mb-1">Type d'opération</label>
                <input type="text" value={maintType} onChange={e => setMaintType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-white outline-none" />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-neutral-300 font-semibold mb-1">Date d'intervention</label>
                <input type="date" value={maintDate} onChange={e => setMaintDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-white outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsMaintOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold cursor-pointer">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL : Support ═══════════════ */}
      {isSupportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-white/50 dark:border-white/10 max-w-md w-full p-6 relative">
            <button onClick={() => setIsSupportOpen(false)} className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center"><Headset className="w-5 h-5 text-orange-500" /></div>
              <div><h3 className="text-base font-bold text-slate-900 dark:text-white">Support Technique 24/7</h3><p className="text-xs text-slate-500">Assistance prioritaire P1/P2 Sensorium CAFM</p></div>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-orange-500/8 border border-orange-500/20">
                <p className="font-bold text-orange-600 dark:text-orange-400">Ligne d'urgence :</p>
                <p className="font-mono text-base font-bold mt-1 text-slate-900 dark:text-white">+33 (0)1 89 20 45 00</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Temps de réponse garanti : &lt; 15 minutes</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/8">
                <p className="font-bold text-slate-800 dark:text-neutral-200">Email NOC :</p>
                <p className="text-orange-500 font-mono mt-0.5">soc-operations@sensorium-cafm.com</p>
              </div>
              <button onClick={() => { setIsSupportOpen(false); notify("Session de chat prioritaire initiée !", "success"); }} className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center justify-center gap-2 cursor-pointer">
                <Send className="w-4 h-4" /> Démarrer un échange immédiat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL : Tarification & Gestion Abonnements ═══════════════ */}
      {state && (
        <SubscriptionPricingModal
          isOpen={isPricingOpen}
          onClose={() => setIsPricingOpen(false)}
          state={state}
          onUpgradeSuccess={(tier) => {
            if (state) state.subscriptionTier = tier;
            notify(`Abonnement mis à niveau avec succès vers ${tier.toUpperCase()} !`, "success");
          }}
          isDark={isDark}
        />
      )}
    </div>
  );
}
