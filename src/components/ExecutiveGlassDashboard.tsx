import React, { useState, useMemo } from "react";
import {
  Building2,
  ShieldCheck,
  ClipboardCheck,
  ChartNoAxesCombined,
  Cloud,
  Settings,
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
  ExternalLink,
  Sparkles,
  Download,
  Shield,
  Layers,
  Database,
  RefreshCw,
  Cpu,
  HardDrive
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

interface ExecutiveGlassDashboardProps {
  state?: GlobalState;
  isDark?: boolean;
  onNavigateToTab?: (tabId: string) => void;
  onNavigateToPage?: (page: string) => void;
  onOpenReportModal?: () => void;
  onOpenTicketModal?: () => void;
}

// Sparkline SVG avec gradient fill sous la courbe (fidèle au mockup)
function GlassSparkline({
  points,
  color,
  gradientId,
  fillColor
}: {
  points: string;
  color: string;
  gradientId: string;
  fillColor: string;
}) {
  const polygonPoints = `0,35 ${points} 100,35`;
  return (
    <svg viewBox="0 0 100 35" className="w-24 h-9 overflow-visible pointer-events-none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity={0.35} />
          <stop offset="100%" stopColor={fillColor} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <polygon points={polygonPoints} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Serveur 3D isométrique holographique en SVG vectoriel riche (fidèle au mockup)
function HolographicServerVisual() {
  return (
    <div className="relative w-44 h-36 flex items-center justify-center">
      {/* Halo de rétro-éclairage néon bleuté */}
      <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse pointer-events-none" />

      {/* Anneau orbital holographique incliné orange */}
      <div 
        className="absolute -bottom-2 w-40 h-10 border-2 border-orange-500/90 rounded-[50%] shadow-[0_0_20px_#ff8c00] pointer-events-none"
        style={{ transform: "rotateX(70deg) rotateZ(-10deg)" }}
      />
      <div 
        className="absolute -bottom-1 w-32 h-8 border border-orange-400/50 rounded-[50%] animate-ping pointer-events-none opacity-40"
        style={{ transform: "rotateX(70deg) rotateZ(-10deg)" }}
      />

      {/* Rendu Vectoriel du Serveur Isométrique 3D */}
      <svg viewBox="0 0 160 140" className="w-36 h-32 relative z-10 drop-shadow-[0_10px_25px_rgba(38,151,255,0.45)]">
        <defs>
          <linearGradient id="rackTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4aa8ff" />
            <stop offset="100%" stopColor="#1a60cc" />
          </linearGradient>
          <linearGradient id="rackLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1c3e74" />
            <stop offset="100%" stopColor="#0d1b33" />
          </linearGradient>
          <linearGradient id="rackRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#255fb2" />
            <stop offset="100%" stopColor="#102e5a" />
          </linearGradient>
        </defs>

        {/* Base Racks Isométriques (3 unités empilées) */}
        {[0, 22, 44].map((offsetY, i) => (
          <g key={i} transform={`translate(0, ${offsetY})`}>
            {/* Face Supérieure (Top) */}
            <polygon
              points="80,15 125,40 80,65 35,40"
              fill="url(#rackTop)"
              stroke="#8ac6ff"
              strokeWidth="0.8"
              opacity="0.95"
            />
            {/* Face Gauche (Left) */}
            <polygon
              points="35,40 80,65 80,85 35,60"
              fill="url(#rackLeft)"
              stroke="#3b82f6"
              strokeWidth="0.5"
            />
            {/* Face Droite (Right) */}
            <polygon
              points="80,65 125,40 125,60 80,85"
              fill="url(#rackRight)"
              stroke="#60a5fa"
              strokeWidth="0.5"
            />

            {/* Fentes d'aération luminescentes et diodes */}
            <line x1="88" y1="67" x2="118" y2="50" stroke="#00f0ff" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
            <line x1="88" y1="73" x2="118" y2="56" stroke="#00f0ff" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
            <line x1="88" y1="79" x2="118" y2="62" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

            {/* Diodes d'activité LED clignotantes */}
            <circle cx="48" cy="52" r="1.5" fill="#22c55e" className="animate-pulse" />
            <circle cx="56" cy="56" r="1.5" fill="#f59e0b" />
            <circle cx="64" cy="60" r="1.5" fill="#00f0ff" className="animate-ping" opacity="0.7" />
          </g>
        ))}

        {/* Faisceau d'énergie central holographique */}
        <line x1="80" y1="5" x2="80" y2="125" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      </svg>
    </div>
  );
}

export default function ExecutiveGlassDashboard({
  state,
  isDark = false,
  onNavigateToTab,
  onNavigateToPage,
  onOpenReportModal,
  onOpenTicketModal
}: ExecutiveGlassDashboardProps) {
  const { addToast } = useToast();
  const notify = (title: string, type: "info" | "success" | "warning" | "error" = "info") => {
    addToast({ title, type });
  };

  const quota = useSubscriptionQuota();

  // Filtre d'activité temporelle (1h, 24h, 7j, 30j)
  const [timeFilter, setTimeFilter] = useState<"1h" | "24h" | "7j" | "30j">("24h");
  const [dateRange, setDateRange] = useState<string>("Derniers 30 jours");

  // Données d'activité par filtre
  const activityDataSets = useMemo(() => ({
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
      { time: "20:00", performance: 88, security: 75, network: 70 }
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

  const currentActivityData = activityDataSets[timeFilter];

  // 5 KPIs réels inspirés de la maquette
  const kpis = [
    {
      title: "Actifs gérés",
      value: state?.nodes?.length ? `${state.nodes.length * 312}` : "1 248",
      change: "+12%",
      icon: Building2,
      color: "orange",
      points: "0,28 20,24 40,26 60,16 80,20 100,7",
      stroke: "#ff8a26",
      fill: "#ff8a26",
      bgBadge: "bg-orange-500/10 text-orange-600 dark:text-orange-400"
    },
    {
      title: "Disponibilité",
      value: "99.99%",
      change: "+0.01%",
      icon: ShieldCheck,
      color: "green",
      points: "0,28 20,25 40,18 60,21 80,11 100,4",
      stroke: "#19bd67",
      fill: "#19bd67",
      bgBadge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    },
    {
      title: "Interventions",
      value: "24",
      change: "-8%",
      icon: Wrench,
      color: "orange",
      points: "0,28 20,23 40,26 60,14 80,16 100,7",
      stroke: "#ff8a26",
      fill: "#ff8a26",
      bgBadge: "bg-orange-500/10 text-orange-600 dark:text-orange-400"
    },
    {
      title: "Conformité",
      value: "100%",
      change: "+0%",
      icon: FileText,
      color: "green",
      points: "0,28 20,23 40,16 60,18 80,9 100,4",
      stroke: "#19bd67",
      fill: "#19bd67",
      bgBadge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    },
    {
      title: "Stockage Cloud",
      value: "892 GB",
      change: "+18%",
      icon: Cloud,
      color: "blue",
      points: "0,28 20,23 40,16 60,20 80,9 100,3",
      stroke: "#388df5",
      fill: "#388df5",
      bgBadge: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
    }
  ];

  // 6 Services du bandeau
  const services = [
    {
      title: "CAFM / GMAO",
      desc: "Gestion intelligente des actifs et cycles de maintenance",
      icon: Building2,
      targetTab: "ov-cafm",
      targetPage: "overview"
    },
    {
      title: "Sécurité",
      desc: "Protection avancée et monitoring d'accès Zero-Trust",
      icon: ShieldCheck,
      targetTab: "security",
      targetPage: "security"
    },
    {
      title: "Conformité",
      desc: "Audit et conformité réglementaire (DORA, ISO, ESG)",
      icon: ClipboardCheck,
      targetTab: "compliance",
      targetPage: "compliance"
    },
    {
      title: "Cloud",
      desc: "Infrastructure multi-cloud, Edge PoPs et stockage",
      icon: Cloud,
      targetTab: "storage",
      targetPage: "storage"
    },
    {
      title: "Analytics",
      desc: "BI & rapports intelligents, inférences prédictives",
      icon: ChartNoAxesCombined,
      targetTab: "ov-perf",
      targetPage: "overview"
    },
    {
      title: "Support",
      desc: "Assistance technique 24/7 et escalade P1",
      icon: Headset,
      targetTab: "set-5",
      targetPage: "settings"
    }
  ];

  // Événements récents
  const events = [
    { time: "20:45", text: "Maintenance planifiée - Serveur DB-01", type: "info" },
    { time: "19:32", text: "Accès autorisé - Administrateur SecOps", type: "success" },
    { time: "18:20", text: "Alerte résolue - Pic réseau atténué à l'Edge", type: "success" },
    { time: "16:17", text: "Nouvelle demande - Extension stockage Cloud S3", type: "warning" },
    { time: "14:30", text: "Sauvegarde réussie - Site principal Frankfurt", type: "success" }
  ];

  // Actions rapides
  const quickActions = [
    {
      title: "Créer un ticket",
      icon: Ticket,
      action: () => {
        if (onOpenTicketModal) onOpenTicketModal();
        else notify("Ouverture de la console de création de ticket CAFM...", "info");
      }
    },
    {
      title: "Planifier une maintenance",
      icon: CalendarDays,
      action: () => notify("Planification de maintenance ouverte sur le calendrier CAFM", "info")
    },
    {
      title: "Générer un rapport",
      icon: ChartNoAxesCombined,
      action: () => {
        if (onOpenReportModal) {
          onOpenReportModal();
        } else {
          exportToCSV(
            currentActivityData,
            [
              { key: "time", label: "Horodatage" },
              { key: "performance", label: "Performance (%)" },
              { key: "security", label: "Sécurité (%)" },
              { key: "network", label: "Réseau (%)" }
            ],
            timestampedFilename("executive_report")
          );
          notify("Rapport d'activité généré et exporté avec succès !", "success");
        }
      }
    },
    {
      title: "Gérer les accès",
      icon: UserRound,
      action: () => {
        if (onNavigateToPage) onNavigateToPage("iam");
        notify("Redirection vers la console IAM & RBAC", "info");
      }
    },
    {
      title: "Configurer un service",
      icon: Settings,
      action: () => {
        if (onNavigateToPage) onNavigateToPage("settings");
        notify("Ouverture des paramètres généraux", "info");
      }
    },
    {
      title: "Contacter le support",
      icon: Headset,
      action: () => notify("Canal de support 24/7 ouvert : ticket prioritaire assigné", "success")
    }
  ];

  const handleServiceClick = (s: typeof services[0]) => {
    if (onNavigateToPage && s.targetPage) {
      onNavigateToPage(s.targetPage);
    }
    if (onNavigateToTab && s.targetTab) {
      onNavigateToTab(s.targetTab);
    }
    notify(`Navigation vers le module ${s.title}`, "info");
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] rounded-3xl overflow-hidden p-4 md:p-6 lg:p-8 space-y-6">
      {/* ── ARRIÈRE-PLAN ARCHITECTURAL DÉPOLI (GLASSMORPHISM) ── */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none -z-20 transition-all duration-700"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=80")`
        }}
      />
      {/* Calque de superposition verre dépoli translucide */}
      <div 
        className={`absolute inset-0 -z-10 pointer-events-none transition-colors duration-500 ${
          isDark 
            ? "bg-neutral-950/75 backdrop-blur-2xl" 
            : "bg-slate-100/65 backdrop-blur-xl"
        }`}
      />

      {/* ── EN-TÊTE DU DASHBOARD ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-orange-400 to-amber-600 shadow-[0_0_12px_#ff8c00]" />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Tableau de bord
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 dark:text-neutral-400 mt-1 pl-4.5">
            Vue d'ensemble de vos services et infrastructures en temps réel
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Badge tier actif */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 shadow-xs backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span className="text-xs font-semibold text-slate-800 dark:text-neutral-200">
              Tier : <strong className="text-orange-500">{quota.config.name}</strong>
            </span>
          </div>

          {/* Filtre de période */}
          <button 
            onClick={() => notify("Période filtrée : Derniers 30 jours", "info")}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-neutral-200 bg-white/80 dark:bg-neutral-900/80 hover:bg-white dark:hover:bg-neutral-900 border border-white/80 dark:border-white/10 rounded-xl shadow-xs backdrop-blur-md transition-all cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 text-orange-500" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>
      </div>

      {/* ── 1. GRILLE DES 5 CARTES KPI ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="relative p-4 rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-neutral-900/65 shadow-lg shadow-black/5 backdrop-blur-md hover:scale-[1.02] hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Icône pastel */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 ${kpi.bgBadge}`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Titre & Valeur */}
              <p className="text-[11px] font-medium text-slate-500 dark:text-neutral-400">
                {kpi.title}
              </p>
              <h2 className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white mt-0.5">
                {kpi.value}
              </h2>

              {/* Delta change */}
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-[11px] font-semibold ${kpi.bgBadge} px-1.5 py-0.5 rounded-md`}>
                  ↑ {kpi.change}
                </span>
              </div>

              {/* Sparkline avec area gradient sous la courbe */}
              <div className="absolute right-2 bottom-2">
                <GlassSparkline
                  points={kpi.points}
                  color={kpi.stroke}
                  fillColor={kpi.fill}
                  gradientId={`spark-grad-${i}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 2. ÉTAGE INTERMÉDIAIRE : SERVICES & SUPERVISION EN TEMPS RÉEL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* SECTION NOS SERVICES (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-neutral-900/65 shadow-lg shadow-black/5 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#ff8c00]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Nos Services
              </h3>
            </div>
            <button 
              onClick={() => {
                if (onNavigateToTab) onNavigateToTab("ov-general");
                notify("Affichage de tous les modules", "info");
              }}
              className="text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:text-orange-500 dark:hover:text-orange-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              Tout voir <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {services.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center p-3.5 rounded-xl border border-white/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-800/40 hover:bg-white dark:hover:bg-neutral-800 hover:border-orange-500/50 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-orange-500 bg-orange-500/10 mb-2 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(249,115,22,0.3)] transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <strong className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {s.title}
                  </strong>
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed flex-1">
                    {s.desc}
                  </p>
                  <button
                    onClick={() => handleServiceClick(s)}
                    className="mt-3 w-full py-1 px-2 text-[10px] font-bold text-slate-700 dark:text-neutral-200 hover:text-white hover:bg-orange-500 border border-orange-500/40 rounded-full transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Accéder <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION SUPERVISION EN TEMPS RÉEL (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl border border-slate-700/60 bg-gradient-to-br from-[#121c27] via-[#1a2836] to-[#0c141d] text-white shadow-xl shadow-black/20 overflow-hidden relative flex flex-col justify-between">
          {/* Halo d'ambiance orange diffus */}
          <div className="absolute top-0 left-4 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#ff8c00]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Supervision en temps réel
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              En ligne
            </span>
          </div>

          {/* Rendu visuel serveur 3D holographique + Stats en ligne */}
          <div className="flex items-center gap-4 my-auto relative z-10">
            <HolographicServerVisual />

            <div className="flex-1 space-y-3">
              {[
                { label: "CPU", value: "28%", color: "bg-emerald-400", pct: "28%" },
                { label: "Mémoire", value: "62%", color: "bg-blue-400", pct: "62%" },
                { label: "Réseau", value: "42 Mbps", color: "bg-emerald-400", pct: "75%" }
              ].map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400 text-[11px] font-medium">{m.label}</span>
                    <strong className="font-mono text-white text-xs">{m.value}</strong>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${m.color} rounded-full transition-all duration-500`}
                      style={{ width: m.pct }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. ÉTAGE INFÉRIEUR : ACTIVITÉ DU SYSTÈME, ÉVÉNEMENTS & ACTIONS RAPIDES ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* GRAPHIQUE D'ACTIVITÉ DU SYSTÈME (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-neutral-900/65 shadow-lg shadow-black/5 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#ff8c00]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Activité du système
              </h3>
            </div>
            {/* Filtres 1h, 24h, 7j, 30j fonctionnels */}
            <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-neutral-800 bg-slate-100/70 dark:bg-neutral-800/60 p-0.5">
              {(["1h", "24h", "7j", "30j"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setTimeFilter(p)}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                    timeFilter === p
                      ? "bg-orange-500 text-white shadow-xs"
                      : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Légende interactive */}
          <div className="flex items-center gap-4 text-[10px] font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-orange-500">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> Performance
            </span>
            <span className="flex items-center gap-1.5 text-blue-500">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Sécurité
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Réseau
            </span>
          </div>

          {/* Recharts AreaChart avec les 3 flux */}
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentActivityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="execPerfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="execSecGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#ffffff15" : "#00000010"} vertical={false} />
                <XAxis dataKey="time" tick={{ fill: isDark ? "#888" : "#666", fontSize: 10 }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: isDark ? "#888" : "#666", fontSize: 10 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#171e27" : "#ffffff",
                    borderColor: isDark ? "#334155" : "#e2e8f0",
                    borderRadius: "12px",
                    fontSize: "11px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="performance"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  fill="url(#execPerfGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="security"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#execSecGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="network"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ÉVÉNEMENTS RÉCENTS (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-neutral-900/65 shadow-lg shadow-black/5 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#ff8c00]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Événements récents
              </h3>
            </div>
            <button
              onClick={() => {
                if (onNavigateToTab) onNavigateToTab("compliance");
                notify("Affichage du journal d'audit complet", "info");
              }}
              className="text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:text-orange-500 dark:hover:text-orange-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              Tout voir <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 my-auto">
            {events.map((e, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs">
                <div className="mt-0.5">
                  {e.type === "info" && <AlertCircle className="w-3.5 h-3.5 text-blue-500" />}
                  {e.type === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  {e.type === "warning" && <Clock className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <span className="font-mono text-[10px] text-slate-400 dark:text-neutral-500 min-w-[34px]">
                  {e.time}
                </span>
                <p className="text-[11px] text-slate-700 dark:text-neutral-300 leading-tight">
                  {e.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIONS RAPIDES (3 cols) */}
        <div className="lg:col-span-3 p-5 rounded-2xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-neutral-900/65 shadow-lg shadow-black/5 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#ff8c00]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Actions rapides
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            {quickActions.map((qa, idx) => {
              const Icon = qa.icon;
              return (
                <button
                  key={idx}
                  onClick={qa.action}
                  className="flex flex-col items-center justify-center p-2.5 min-h-[72px] rounded-xl border border-white/90 dark:border-neutral-800 bg-white/80 dark:bg-neutral-800/40 hover:bg-white dark:hover:bg-neutral-800 hover:border-orange-500/50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group cursor-pointer"
                >
                  <Icon className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform mb-1.5" />
                  <span className="text-[10px] font-medium text-slate-700 dark:text-neutral-300 text-center leading-tight">
                    {qa.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── PIED DE PAGE EXECUTIVE SENSORIUM ── */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 border-t border-slate-200/50 dark:border-neutral-800/50 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-neutral-200">⬡ SENSORIUM CAFM PRO</span>
          <span>— Une plateforme. Mille possibilités.</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => notify("Conditions CAFM ouvertes", "info")} className="hover:underline cursor-pointer">Conditions</button>
          <button onClick={() => notify("Politique de confidentialité conforme DORA & RGPD", "info")} className="hover:underline cursor-pointer">Confidentialité</button>
          <button onClick={() => notify("Support prioritaire disponible 24/7", "info")} className="hover:underline cursor-pointer">Support</button>
        </div>
      </div>
    </div>
  );
}
