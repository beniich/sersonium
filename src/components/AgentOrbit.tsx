// src/components/AgentOrbit.tsx
// Interface orbitale de l'écosystème d'agents SENSORIUM
// Adapté pour motion/react (Framer Motion v12) et la charte SENSORIUM

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  TrendingUp,
  MessageSquare,
  Eye,
  PenLine,
  Mail,
  Palette,
  LayoutGrid,
  Mic,
  Video,
  CheckSquare,
  ClipboardList,
  BarChart2,
  DollarSign,
  Phone,
  FileText,
  TrendingDown,
  RefreshCw,
  Calendar,
  Music,
  Smartphone,
  Play,
  Newspaper,
  Target,
  Clock,
  CreditCard,
  Link2,
  MessageCircle,
  HelpCircle,
  Star,
  Anchor,
  AlertTriangle,
  ArrowRight,
  Zap,
  X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Agent = {
  id: string;
  name: string;
  Icon: React.ElementType;
  highlighted?: boolean;
  description?: string;
};

type Group = {
  id: string;
  title: string;
  color: string;          // accent Tailwind
  bgColor: string;        // fond Tailwind
  borderColor: string;    // border Tailwind
  count: number;
  agents: Agent[];
  position: "top-left" | "top-right" | "middle-left" | "middle-right" | "bottom-left" | "bottom-right";
};

// ─── Data ────────────────────────────────────────────────────────────────────

const groups: Group[] = [
  {
    id: "research",
    title: "Research",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    count: 6,
    position: "top-left",
    agents: [
      { id: "1", name: "Trend Scout",         Icon: Search,       description: "Surveille les tendances sectorielles" },
      { id: "2", name: "Audience Listener",   Icon: TrendingUp,   highlighted: true, description: "Analyse les signaux d'audience" },
      { id: "3", name: "Comment Miner",       Icon: MessageSquare,description: "Extrait les insights des commentaires" },
      { id: "4", name: "Competitor Watch",    Icon: Eye,          description: "Monitore les concurrents en temps réel" },
      { id: "5", name: "Post Writer",         Icon: PenLine,      description: "Rédige les posts optimisés" },
      { id: "6", name: "Email Writer",        Icon: Mail,         description: "Génère les emails de prospection" },
    ],
  },
  {
    id: "content",
    title: "Content",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    count: 6,
    position: "top-right",
    agents: [
      { id: "1", name: "Visual Designer",    Icon: Palette,      highlighted: true, description: "Crée les visuels et assets graphiques" },
      { id: "2", name: "Carousel Builder",   Icon: LayoutGrid,   description: "Assemble les carrousels multi-slides" },
      { id: "3", name: "Voiceover",          Icon: Mic,          description: "Synthétise les voix off personnalisées" },
      { id: "4", name: "Video Editor",       Icon: Video,        description: "Monte les vidéos courtes formats" },
      { id: "5", name: "Brand Check",        Icon: CheckSquare,  description: "Valide la conformité de la charte" },
      { id: "6", name: "Approval Desk",      Icon: ClipboardList,description: "Gère le workflow de validation" },
    ],
  },
  {
    id: "loop",
    title: "The Loop",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    count: 6,
    position: "middle-left",
    agents: [
      { id: "1", name: "Post Analyst",       Icon: BarChart2,    description: "Analyse les performances post par post" },
      { id: "2", name: "Revenue Tracker",    Icon: DollarSign,   highlighted: true, description: "Suit les revenus générés par canal" },
      { id: "3", name: "Call Tracker",       Icon: Phone,        description: "Trace les appels entrants et sortants" },
      { id: "4", name: "Email Analyst",      Icon: FileText,     description: "Mesure les taux d'ouverture et clics" },
      { id: "5", name: "Weekly Report",      Icon: TrendingDown, description: "Génère le rapport hebdomadaire auto" },
      { id: "6", name: "Loop Feeder",        Icon: RefreshCw,    description: "Réinjecte les données dans le cycle" },
    ],
  },
  {
    id: "publish",
    title: "Publish",
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    count: 6,
    position: "middle-right",
    agents: [
      { id: "1", name: "Scheduler",          Icon: Calendar,     description: "Planifie les publications optimales" },
      { id: "2", name: "TikTok Poster",      Icon: Music,        highlighted: true, description: "Publie et tagge sur TikTok" },
      { id: "3", name: "Reels Poster",       Icon: Smartphone,   description: "Distribue sur Instagram Reels" },
      { id: "4", name: "Shorts Poster",      Icon: Play,         description: "Poste sur YouTube Shorts" },
      { id: "5", name: "X Poster",           Icon: Zap,          description: "Diffuse sur X (ex-Twitter)" },
      { id: "6", name: "Newsletter",         Icon: Newspaper,    description: "Envoie la newsletter hebdo" },
    ],
  },
  {
    id: "sales",
    title: "Sales",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    count: 6,
    position: "bottom-left",
    agents: [
      { id: "1", name: "Lead Scorer",        Icon: Target,       description: "Priorise les prospects chauds" },
      { id: "2", name: "Call Booker",        Icon: Phone,        highlighted: true, description: "Automatise la prise de rendez-vous" },
      { id: "3", name: "Reminder",           Icon: Clock,        description: "Envoie les rappels automatiques" },
      { id: "4", name: "Follow-up",          Icon: RefreshCw,    description: "Relance les prospects dormants" },
      { id: "5", name: "Payment Link",       Icon: CreditCard,   description: "Génère les liens de paiement sécurisés" },
      { id: "6", name: "CRM Sync",           Icon: Link2,        description: "Synchronise avec le CRM en temps réel" },
    ],
  },
  {
    id: "community",
    title: "Community",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    count: 6,
    position: "bottom-right",
    agents: [
      { id: "1", name: "Comment Replier",    Icon: MessageCircle,highlighted: true, description: "Répond aux commentaires 24h/24" },
      { id: "2", name: "DM Agent",           Icon: Mail,         description: "Gère les messages privés entrants" },
      { id: "3", name: "FAQ Agent",          Icon: HelpCircle,   description: "Répond aux questions fréquentes" },
      { id: "4", name: "Review Asker",       Icon: Star,         description: "Sollicite les avis après achat" },
      { id: "5", name: "Lead Catcher",       Icon: Anchor,       description: "Capte les leads dans les interactions" },
      { id: "6", name: "Escalation",         Icon: AlertTriangle,description: "Escalade les cas sensibles" },
    ],
  },
];

// ─── Position CSS ─────────────────────────────────────────────────────────────

const positionClasses: Record<Group["position"], string> = {
  "top-left":     "top-6 left-6",
  "top-right":    "top-6 right-6",
  "middle-left":  "top-1/2 -translate-y-1/2 left-6",
  "middle-right": "top-1/2 -translate-y-1/2 right-6",
  "bottom-left":  "bottom-6 left-6",
  "bottom-right": "bottom-6 right-6",
};

// ─── SVG connector Y positions (matching each row of cards) ──────────────────
const connectorRows = [140, 410, 680];

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 130, damping: 18 },
  },
};

const centerVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 150, damping: 16, delay: 0.05 },
  },
};

const lineVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 0.5,
    transition: { duration: 1.3, ease: "easeInOut", delay: 0.3 },
  },
};

const tooltipVariants = {
  hidden: { opacity: 0, y: 6, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, y: 4, scale: 0.95, transition: { duration: 0.1 } },
};

// ─── AgentCard ────────────────────────────────────────────────────────────────

function AgentCard({
  group,
  index,
  onSelect,
}: {
  group: Group;
  index: number;
  onSelect: (group: Group) => void;
}) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        scale: 1.025,
        y: -5,
        boxShadow: "0 24px 48px -12px rgba(0,0,0,0.13)",
      }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={`absolute w-60 bg-white rounded-2xl shadow-md border border-gray-100 p-4 cursor-pointer select-none ${positionClasses[group.position]}`}
      onClick={() => onSelect(group)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold uppercase tracking-wider ${group.color}`}>
          {group.title}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-400">{group.count} agents</span>
          <ArrowRight className={`w-3.5 h-3.5 ${group.color} opacity-70`} />
        </div>
      </div>

      {/* Agent list */}
      <ul className="space-y-1">
        {group.agents.map((agent, i) => {
          const AgentIcon = agent.Icon;
          return (
            <motion.li
              key={agent.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + index * 0.07 + i * 0.035 }}
              className={`relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-default ${
                agent.highlighted
                  ? `${group.bgColor} ${group.color} font-semibold border ${group.borderColor}`
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onMouseEnter={() => setHoveredAgent(agent.id)}
              onMouseLeave={() => setHoveredAgent(null)}
            >
              <AgentIcon className={`w-3.5 h-3.5 shrink-0 ${agent.highlighted ? group.color : "text-gray-400"}`} />
              <span className="truncate">{agent.name}</span>
              {agent.highlighted && (
                <motion.span
                  className={`ml-auto w-1.5 h-1.5 rounded-full ${group.bgColor.replace("bg-", "bg-").replace("-50", "-400")}`}
                  style={{ backgroundColor: "currentColor" }}
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                />
              )}

              {/* Tooltip on hover */}
              <AnimatePresence>
                {hoveredAgent === agent.id && agent.description && (
                  <motion.div
                    variants={tooltipVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 w-44 bg-gray-900 text-white text-[10px] leading-snug rounded-lg px-2.5 py-2 shadow-xl pointer-events-none"
                  >
                    {agent.description}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function GroupDetailPanel({
  group,
  onClose,
}: {
  group: Group;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="absolute right-6 top-6 bottom-6 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-30 flex flex-col overflow-hidden"
    >
      {/* Panel header */}
      <div className={`${group.bgColor} px-5 py-4 flex items-center justify-between border-b ${group.borderColor}`}>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${group.color}`}>{group.title}</p>
          <p className="text-sm font-bold text-gray-800 mt-0.5">{group.count} Agents Actifs</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/60 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Agents list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {group.agents.map((agent, i) => {
          const AgentIcon = agent.Icon;
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-shadow hover:shadow-sm cursor-default ${
                agent.highlighted
                  ? `${group.bgColor} ${group.borderColor}`
                  : "border-gray-100 hover:border-gray-200 bg-gray-50"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                agent.highlighted ? `${group.bgColor} border ${group.borderColor}` : "bg-white border border-gray-200"
              }`}>
                <AgentIcon className={`w-4 h-4 ${agent.highlighted ? group.color : "text-gray-500"}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-semibold truncate ${agent.highlighted ? group.color : "text-gray-700"}`}>
                  {agent.name}
                </p>
                {agent.description && (
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{agent.description}</p>
                )}
              </div>
              {agent.highlighted && (
                <motion.div
                  className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-orange-400"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className={`px-4 py-3 border-t ${group.borderColor} ${group.bgColor}`}>
        <button
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold transition-colors`}
          onClick={onClose}
        >
          <Zap className="w-3.5 h-3.5 text-orange-400" />
          Configurer le groupe
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AgentOrbit({ isDark = false }: { isDark?: boolean }) {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup((prev) => (prev?.id === group.id ? null : group));
  };

  return (
    <div className={`space-y-4 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-['Manrope']">Agent Orbit</h1>
          <p className={`text-sm mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Écosystème d'agents IA — 36 agents répartis en 6 groupes opérationnels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            36 agents actifs
          </span>
        </div>
      </div>

      {/* Orbit Canvas */}
      <motion.div
        className="relative w-full bg-gradient-to-br from-gray-50 to-slate-100 rounded-3xl overflow-hidden select-none border border-gray-200"
        style={{ height: "820px" }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── SVG Connector Lines ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1000 820"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
        >
          {/* Vertical spine */}
          <motion.path
            d={`M500 60 C500 200 500 350 500 410 C500 470 500 620 500 760`}
            stroke="#e0822d"
            strokeWidth="2"
            strokeLinecap="round"
            variants={lineVariants}
          />

          {/* Horizontal connectors at each row */}
          {connectorRows.map((y) => (
            <React.Fragment key={y}>
              <motion.path
                d={`M200 ${y} H478`}
                stroke="#e0822d"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                variants={lineVariants}
              />
              <motion.path
                d={`M522 ${y} H800`}
                stroke="#e0822d"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                variants={lineVariants}
              />
            </React.Fragment>
          ))}

          {/* Junction dots */}
          {connectorRows.map((y, i) => (
            <motion.circle
              key={y}
              cx="500"
              cy={y}
              r="5"
              fill="#e0822d"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.15, type: "spring" }}
            />
          ))}

          {/* Left & right end dots */}
          {connectorRows.map((y, i) =>
            [200, 800].map((cx) => (
              <motion.circle
                key={`${y}-${cx}`}
                cx={cx}
                cy={y}
                r="3"
                fill="#e0822d"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.6 }}
                transition={{ delay: 1.1 + i * 0.12, type: "spring" }}
              />
            ))
          )}
        </svg>

        {/* ── Center Node ── */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3"
          variants={centerVariants}
        >
          <motion.div
            className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-full shadow-lg tracking-wide"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Vous
          </motion.div>

          <motion.div
            className="relative w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl ring-4 ring-orange-400/25 cursor-pointer"
            whileHover={{ scale: 1.1, rotate: 6 }}
            transition={{ type: "spring", stiffness: 280 }}
          >
            {/* SENSORIUM logo-style star */}
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-orange-400" fill="currentColor">
              <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" />
            </svg>
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-orange-400/40"
              animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            />
          </motion.div>

          <div className="text-[11px] font-semibold text-slate-500 tracking-wider">
            SENSORIUM AI
          </div>
        </motion.div>

        {/* ── Agent Group Cards ── */}
        {groups.map((group, index) => (
          <AgentCard
            key={group.id}
            group={group}
            index={index}
            onSelect={handleSelectGroup}
          />
        ))}

        {/* ── Legend ── */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="w-3 border-t-2 border-dashed border-orange-400 inline-block" />
            Connexion orbitale
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
            Agent prioritaire
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="text-orange-500">↗</span> Cliquer pour détailler
          </div>
        </div>
      </motion.div>

      {/* ── Detail Panel (outside the canvas so it overlays cleanly) ── */}
      <AnimatePresence>
        {selectedGroup && (
          <motion.div
            key={selectedGroup.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className={`rounded-2xl border p-5 ${selectedGroup.bgColor} ${selectedGroup.borderColor}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${selectedGroup.color}`}>
                  {selectedGroup.title}
                </p>
                <p className="text-base font-bold text-gray-800 mt-0.5">
                  {selectedGroup.count} agents — Détail complet
                </p>
              </div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="p-1.5 rounded-lg hover:bg-white/70 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {selectedGroup.agents.map((agent, i) => {
                const AgentIcon = agent.Icon;
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center cursor-default transition-shadow hover:shadow-md ${
                      agent.highlighted
                        ? "bg-white border-current shadow-sm"
                        : "bg-white/60 border-white"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      agent.highlighted ? selectedGroup.bgColor : "bg-gray-100"
                    }`}>
                      <AgentIcon className={`w-4.5 h-4.5 ${agent.highlighted ? selectedGroup.color : "text-gray-500"}`} />
                    </div>
                    <p className={`text-[10px] font-semibold leading-tight ${agent.highlighted ? selectedGroup.color : "text-gray-700"}`}>
                      {agent.name}
                    </p>
                    {agent.highlighted && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${selectedGroup.bgColor} ${selectedGroup.color} border ${selectedGroup.borderColor}`}>
                        Prioritaire
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
