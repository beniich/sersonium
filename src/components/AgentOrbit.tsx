// src/components/AgentOrbit.tsx
// Interface orbitale SENSORIUM — Écosystème d'agents avec micro-interactions, panneau latéral et dark mode

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  RotateCcw,
  FileText,
  Settings,
  Calendar,
  Download,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Activity,
  Cpu,
  Zap,
  X,
  Sparkles,
  TrendingUp,
  Clock,
  ShieldCheck,
  Moon,
  Sun
} from "lucide-react";

export type AgentStatus = "active" | "idle" | "running";

export type Agent = {
  id: string;
  name: string;
  icon?: string;
  highlighted?: boolean;
  description?: string;
  status?: AgentStatus;
  executionsCount?: number;
  lastRun?: string;
  latencyMs?: number;
};

export type Group = {
  id: string;
  title: string;
  count: number;
  agents: Agent[];
  position: "top-left" | "top-right" | "middle-left" | "middle-right" | "bottom-left" | "bottom-right";
};

const initialGroups: Group[] = [
  {
    id: "research",
    title: "Research",
    count: 6,
    position: "top-left",
    agents: [
      { id: "r1", name: "Trend Scout", icon: "🔍", description: "Scans emerging trends across platforms in real-time.", status: "active", executionsCount: 1420, lastRun: "2 min ago", latencyMs: 120 },
      { id: "r2", name: "Audience Listener", icon: "🟠", highlighted: true, description: "Monitors audience sentiment and engagement signals.", status: "running", executionsCount: 890, lastRun: "Running now", latencyMs: 85 },
      { id: "r3", name: "Comment Miner", icon: "💬", description: "Extracts insights from comments and replies.", status: "idle", executionsCount: 432, lastRun: "1 hour ago", latencyMs: 210 },
      { id: "r4", name: "Competitor Watch", icon: "👁️", description: "Tracks competitor content and performance.", status: "active", executionsCount: 1105, lastRun: "15 min ago", latencyMs: 145 },
      { id: "r5", name: "Post Writer", icon: "✍️", description: "Generates high-converting post drafts.", status: "idle", executionsCount: 760, lastRun: "3 hours ago", latencyMs: 340 },
      { id: "r6", name: "Email Writer", icon: "📧", description: "Creates personalized email sequences.", status: "idle", executionsCount: 520, lastRun: "5 hours ago", latencyMs: 290 },
    ],
  },
  {
    id: "content",
    title: "Content",
    count: 6,
    position: "top-right",
    agents: [
      { id: "c1", name: "Visual Designer", icon: "🎨", highlighted: true, description: "Generates brand-aligned visual assets.", status: "running", executionsCount: 2310, lastRun: "Running now", latencyMs: 640 },
      { id: "c2", name: "Carousel Builder", icon: "🎠", description: "Creates multi-slide carousels optimized for engagement.", status: "idle", executionsCount: 310, lastRun: "4 hours ago", latencyMs: 410 },
      { id: "c3", name: "Voiceover", icon: "🎙️", description: "Produces natural-sounding voiceovers.", status: "idle", executionsCount: 180, lastRun: "Yesterday", latencyMs: 980 },
      { id: "c4", name: "Video Editor", icon: "🎬", description: "Edits and optimizes short-form videos.", status: "active", executionsCount: 950, lastRun: "30 min ago", latencyMs: 1200 },
      { id: "c5", name: "Brand Check", icon: "✅", description: "Ensures all content respects brand guidelines.", status: "active", executionsCount: 3400, lastRun: "5 min ago", latencyMs: 95 },
      { id: "c6", name: "Approval Desk", icon: "📋", description: "Manages content approval workflow.", status: "idle", executionsCount: 620, lastRun: "2 hours ago", latencyMs: 130 },
    ],
  },
  {
    id: "loop",
    title: "The loop",
    count: 6,
    position: "middle-left",
    agents: [
      { id: "l1", name: "Post Analyst", icon: "📊", description: "Analyzes post performance and suggests improvements.", status: "active", executionsCount: 1840, lastRun: "10 min ago", latencyMs: 175 },
      { id: "l2", name: "Revenue Tracker", icon: "💰", highlighted: true, description: "Tracks revenue attribution from content.", status: "running", executionsCount: 4200, lastRun: "Running now", latencyMs: 65 },
      { id: "l3", name: "Call Tracker", icon: "📞", description: "Logs and analyzes sales calls.", status: "idle", executionsCount: 290, lastRun: "Yesterday", latencyMs: 240 },
      { id: "l4", name: "Email Analyst", icon: "📧", description: "Measures email campaign effectiveness.", status: "idle", executionsCount: 680, lastRun: "6 hours ago", latencyMs: 190 },
      { id: "l5", name: "Weekly Report", icon: "📈", description: "Generates automated weekly performance reports.", status: "idle", executionsCount: 120, lastRun: "2 days ago", latencyMs: 510 },
      { id: "l6", name: "Loop Feeder", icon: "🔄", description: "Feeds insights back into the content loop.", status: "active", executionsCount: 5100, lastRun: "Just now", latencyMs: 78 },
    ],
  },
  {
    id: "publish",
    title: "Publish",
    count: 6,
    position: "middle-right",
    agents: [
      { id: "p1", name: "Scheduler", icon: "📅", description: "Optimizes posting times across platforms.", status: "active", executionsCount: 3200, lastRun: "12 min ago", latencyMs: 110 },
      { id: "p2", name: "TikTok Poster", icon: "🎵", highlighted: true, description: "Publishes and optimizes TikTok content.", status: "running", executionsCount: 1650, lastRun: "Running now", latencyMs: 320 },
      { id: "p3", name: "Reels Poster", icon: "📱", description: "Handles Instagram Reels publishing.", status: "idle", executionsCount: 1420, lastRun: "1 hour ago", latencyMs: 310 },
      { id: "p4", name: "Shorts Poster", icon: "▶️", description: "Manages YouTube Shorts distribution.", status: "idle", executionsCount: 980, lastRun: "4 hours ago", latencyMs: 290 },
      { id: "p5", name: "X Poster", icon: "𝕏", description: "Posts and engages on X (Twitter).", status: "active", executionsCount: 4800, lastRun: "1 min ago", latencyMs: 90 },
      { id: "p6", name: "Newsletter", icon: "📰", description: "Sends and manages email newsletters.", status: "idle", executionsCount: 430, lastRun: "Yesterday", latencyMs: 450 },
    ],
  },
  {
    id: "sales",
    title: "Sales",
    count: 6,
    position: "bottom-left",
    agents: [
      { id: "s1", name: "Lead Scorer", icon: "🎯", description: "Scores and prioritizes incoming leads.", status: "active", executionsCount: 2900, lastRun: "8 min ago", latencyMs: 135 },
      { id: "s2", name: "Call Booker", icon: "📞", highlighted: true, description: "Books qualified calls automatically.", status: "running", executionsCount: 1120, lastRun: "Running now", latencyMs: 220 },
      { id: "s3", name: "Reminder", icon: "⏰", description: "Sends smart follow-up reminders.", status: "idle", executionsCount: 890, lastRun: "3 hours ago", latencyMs: 160 },
      { id: "s4", name: "Follow-up", icon: "🔄", description: "Handles multi-step follow-up sequences.", status: "idle", executionsCount: 1430, lastRun: "2 hours ago", latencyMs: 195 },
      { id: "s5", name: "Payment Link", icon: "💳", description: "Generates and tracks payment links.", status: "idle", executionsCount: 650, lastRun: "5 hours ago", latencyMs: 140 },
      { id: "s6", name: "CRM Sync", icon: "🔗", description: "Keeps CRM data synchronized in real-time.", status: "active", executionsCount: 7800, lastRun: "Just now", latencyMs: 55 },
    ],
  },
  {
    id: "community",
    title: "Community",
    count: 6,
    position: "bottom-right",
    agents: [
      { id: "cm1", name: "Comment Replier", icon: "💬", highlighted: true, description: "Replies to comments with brand voice.", status: "running", executionsCount: 3890, lastRun: "Running now", latencyMs: 180 },
      { id: "cm2", name: "DM Agent", icon: "💌", description: "Handles direct messages intelligently.", status: "active", executionsCount: 2100, lastRun: "4 min ago", latencyMs: 210 },
      { id: "cm3", name: "FAQ Agent", icon: "❓", description: "Answers frequently asked questions.", status: "idle", executionsCount: 5400, lastRun: "35 min ago", latencyMs: 70 },
      { id: "cm4", name: "Review Asker", icon: "⭐", description: "Requests reviews at the right moment.", status: "idle", executionsCount: 780, lastRun: "6 hours ago", latencyMs: 190 },
      { id: "cm5", name: "Lead Catcher", icon: "🎣", description: "Captures leads from community interactions.", status: "active", executionsCount: 1670, lastRun: "18 min ago", latencyMs: 160 },
      { id: "cm6", name: "Escalation", icon: "🚨", description: "Escalates complex issues to humans.", status: "idle", executionsCount: 95, lastRun: "Yesterday", latencyMs: 110 },
    ],
  },
];

const positionClasses: Record<Group["position"], string> = {
  "top-left": "top-8 left-8",
  "top-right": "top-8 right-8",
  "middle-left": "top-1/2 -translate-y-1/2 left-8",
  "middle-right": "top-1/2 -translate-y-1/2 right-8",
  "bottom-left": "bottom-8 left-8",
  "bottom-right": "bottom-8 right-8",
};

const statusColors: Record<AgentStatus, string> = {
  active: "bg-emerald-500",
  idle: "bg-gray-400",
  running: "bg-orange-500",
};

interface AgentOrbitProps {
  isDark?: boolean;
}

export default function AgentOrbit({ isDark: initialIsDark = false }: AgentOrbitProps) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [selectedAgent, setSelectedAgent] = useState<(Agent & { groupTitle: string; groupId: string }) | null>(null);
  const [isDark, setIsDark] = useState<boolean>(initialIsDark);
  const [isRunningSim, setIsRunningSim] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "config">("overview");
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);

  // Sync with prop if it changes
  useEffect(() => {
    setIsDark(initialIsDark);
  }, [initialIsDark]);

  const handleAgentClick = (agent: Agent, groupTitle: string, groupId: string) => {
    setSelectedAgent({ ...agent, groupTitle, groupId });
    setActiveTab("overview");
    setSimulatedLogs([
      `[${new Date().toLocaleTimeString()}] Agent ${agent.name} initialized.`,
      `[${new Date().toLocaleTimeString()}] Status: ${agent.status?.toUpperCase()}`,
      `[${new Date().toLocaleTimeString()}] Heartbeat: OK, Latency: ${agent.latencyMs || 120}ms`,
    ]);
  };

  const closePanel = () => setSelectedAgent(null);

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Run Agent Action (simulation)
  const handleRunAgent = () => {
    if (!selectedAgent || isRunningSim) return;
    setIsRunningSim(true);

    const nowStr = new Date().toLocaleTimeString();
    setSimulatedLogs((prev) => [
      ...prev,
      `[${nowStr}] [TASK] Manual trigger initiated by Operator.`,
      `[${nowStr}] [TASK] Dispatching payload to V8 isolate runner...`,
    ]);

    // Update agent status in state
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        agents: g.agents.map((a) =>
          a.id === selectedAgent.id ? { ...a, status: "running" as AgentStatus } : a
        ),
      }))
    );
    setSelectedAgent((prev) => (prev ? { ...prev, status: "running" } : null));

    setTimeout(() => {
      const finishedStr = new Date().toLocaleTimeString();
      setSimulatedLogs((prev) => [
        ...prev,
        `[${finishedStr}] [SUCCESS] Task completed in 482ms.`,
        `[${finishedStr}] [METRIC] Tokens consumed: 1,420 | Cache hit ratio: 98.4%`,
      ]);
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          agents: g.agents.map((a) =>
            a.id === selectedAgent.id
              ? {
                  ...a,
                  status: "active" as AgentStatus,
                  executionsCount: (a.executionsCount || 0) + 1,
                  lastRun: "Just now",
                }
              : a
          ),
        }))
      );
      setSelectedAgent((prev) =>
        prev
          ? {
              ...prev,
              status: "active",
              executionsCount: (prev.executionsCount || 0) + 1,
              lastRun: "Just now",
            }
          : null
      );
      setIsRunningSim(false);
    }, 1800);
  };

  // Reset Memory Action
  const handleResetMemory = () => {
    if (!selectedAgent) return;
    const nowStr = new Date().toLocaleTimeString();
    setSimulatedLogs((prev) => [
      ...prev,
      `[${nowStr}] [ACTION] Vector embeddings buffer purged.`,
      `[${nowStr}] [ACTION] Context memory reset to pristine state.`,
    ]);
  };

  return (
    <div className={`transition-colors duration-300 ${isDark ? "dark text-slate-100" : "text-slate-900"}`}>
      
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-['Manrope'] tracking-tight">Agent Orbit</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              Swarm v2.4
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cartographie interactive de l'écosystème — 36 agents autonomes en 6 clusters opérationnels
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Active status pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <span>36 Agents Connectés</span>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer"
            title="Basculer le mode sombre / clair"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Orbit Stage */}
      <div className="relative w-full h-[840px] bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-[#0a0c10] dark:via-[#0e1218] dark:to-[#07090d] rounded-3xl overflow-hidden select-none border border-slate-200/90 dark:border-slate-800/90 shadow-xl transition-colors duration-500">
        
        {/* Animated SVG lines & Glow */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1000 820"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
        >
          <defs>
            {/* Linear gradient along vertical spine */}
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
              <stop offset="25%" stopColor="#f97316" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="1" />
              <stop offset="75%" stopColor="#f97316" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.15" />
            </linearGradient>

            {/* Subtle glow filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Main vertical line with pulse and glow */}
          <motion.path
            d="M500 80 C500 180 500 280 500 380 C500 480 500 580 500 720"
            stroke="url(#lineGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.85 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          />

          {/* Horizontal connectors to each card cluster */}
          {[
            "M180 200 H420",
            "M580 200 H820",
            "M180 410 H420",
            "M580 410 H820",
            "M180 620 H420",
            "M580 620 H820",
          ].map((d, i) => (
            <motion.path
              key={i}
              d={d}
              stroke="#f97316"
              strokeWidth="1.5"
              strokeDasharray="5 3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.45 }}
              transition={{ duration: 1.2, delay: 0.3 + i * 0.08 }}
            />
          ))}

          {/* Pulsing Central Dots on spine */}
          {[200, 410, 620].map((y, i) => (
            <React.Fragment key={y}>
              {/* Outer pulsing ring */}
              <motion.circle
                cx="500"
                cy={y}
                r="8"
                fill="#f97316"
                initial={{ scale: 0 }}
                animate={{
                  scale: [1, 1.9, 1],
                  opacity: [0.6, 0.1, 0.6],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay: i * 0.35,
                  ease: "easeInOut",
                }}
              />
              {/* Core solid dot */}
              <circle cx="500" cy={y} r="4.5" fill="#f97316" />
            </React.Fragment>
          ))}
        </svg>

        {/* Center Node (Operator / Claude Code SENSORIUM Core) */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 16 }}
        >
          <div className="mb-3 px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold rounded-full shadow-lg tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-orange-400" />
            <span>You</span>
          </div>

          <motion.div
            className="w-20 h-20 rounded-2xl bg-slate-950 dark:bg-slate-800 flex items-center justify-center shadow-2xl ring-4 ring-orange-500/40 relative cursor-pointer group"
            whileHover={{ scale: 1.1, rotate: 6 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Center icon */}
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-orange-400" fill="currentColor">
              <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" />
            </svg>

            {/* Glowing ring animation */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-orange-400/50"
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            />
          </motion.div>

          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
            Claude Code
          </div>
        </motion.div>

        {/* Agent Cards */}
        {groups.map((group, groupIndex) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.15 + groupIndex * 0.08 }}
            whileHover={{ scale: 1.03, y: -6 }}
            className={`absolute w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800/90 p-4 transition-colors ${positionClasses[group.position]}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{group.title}</h3>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{group.count} agents</span>
            </div>

            <ul className="space-y-1.5">
              {group.agents.map((agent) => (
                <motion.li
                  key={agent.id}
                  onClick={() => handleAgentClick(agent, group.title, group.id)}
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm cursor-pointer transition-all ${
                    selectedAgent?.id === agent.id
                      ? "bg-orange-500/20 text-orange-600 dark:text-orange-300 font-bold border border-orange-500/40 shadow-xs"
                      : agent.highlighted
                      ? "bg-orange-50 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300 font-medium border border-orange-200/70 dark:border-orange-500/30"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                  title="Cliquer pour inspecter et exécuter"
                >
                  <span className="text-base leading-none">{agent.icon || "•"}</span>
                  <span className="truncate flex-1 text-xs">{agent.name}</span>
                  
                  {/* Status dot */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${statusColors[agent.status || "idle"]}`}
                    title={`Statut: ${agent.status}`}
                  />

                  {/* Pulsing badge if highlighted */}
                  {agent.highlighted && (
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-orange-400"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                    />
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}

        {/* Footer Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Active
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block animate-pulse" /> Running
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> Idle
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
            • Cliquer sur un agent pour ouvrir le panneau d'action
          </div>
        </div>

        {/* Side Panel (with backdrop and interactive actions) */}
        <AnimatePresence>
          {selectedAgent && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closePanel}
                className="absolute inset-0 bg-black/25 dark:bg-black/50 backdrop-blur-xs z-40"
              />

              {/* Panel Drawer */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className="absolute top-0 right-0 h-full w-[380px] max-w-full bg-white dark:bg-[#0c0f14] shadow-2xl z-50 border-l border-slate-200 dark:border-slate-800 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                        {selectedAgent.groupTitle}
                      </span>
                      <span className="text-[10px] text-slate-400">• ID: {selectedAgent.id}</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                      <span className="text-xl">{selectedAgent.icon}</span>
                      <span>{selectedAgent.name}</span>
                    </h2>
                  </div>
                  <button
                    onClick={closePanel}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                    aria-label="Fermer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Navigation Tabs in Panel */}
                <div className="flex items-center border-b border-slate-100 dark:border-slate-800 text-xs px-5">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`py-2.5 px-3 font-semibold border-b-2 transition-colors cursor-pointer ${
                      activeTab === "overview"
                        ? "border-orange-500 text-orange-600 dark:text-orange-400"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Aperçu
                  </button>
                  <button
                    onClick={() => setActiveTab("logs")}
                    className={`py-2.5 px-3 font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "logs"
                        ? "border-orange-500 text-orange-600 dark:text-orange-400"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>Logs</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </button>
                  <button
                    onClick={() => setActiveTab("config")}
                    className={`py-2.5 px-3 font-semibold border-b-2 transition-colors cursor-pointer ${
                      activeTab === "config"
                        ? "border-orange-500 text-orange-600 dark:text-orange-400"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Config
                  </button>
                </div>

                {/* Content body */}
                <div className="flex-1 p-5 overflow-y-auto space-y-5">
                  
                  {activeTab === "overview" && (
                    <>
                      {/* Description */}
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {selectedAgent.description || "Aucune description fournie pour cet agent."}
                      </div>

                      {/* Status & Live Metrics */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Statut d'exécution</span>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${statusColors[selectedAgent.status || "idle"]} ${selectedAgent.status === "running" ? "animate-ping" : ""}`} />
                            <span className="text-xs font-bold capitalize text-slate-800 dark:text-slate-200">
                              {selectedAgent.status || "idle"}
                            </span>
                          </div>
                        </div>

                        {/* Mini telemetry metrics grid */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-center">
                            <span className="text-[10px] text-slate-400 block">Exécutions</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                              {selectedAgent.executionsCount?.toLocaleString() || "1,240"}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-center">
                            <span className="text-[10px] text-slate-400 block">Latence</span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                              {selectedAgent.latencyMs || 120}ms
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-center">
                            <span className="text-[10px] text-slate-400 block">Dernier run</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate block">
                              {selectedAgent.lastRun || "Récemment"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Primary Actions */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          onClick={handleRunAgent}
                          disabled={isRunningSim}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                        >
                          {isRunningSim ? (
                            <>
                              <Activity className="w-3.5 h-3.5 animate-spin" />
                              <span>Exécution...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Run Agent</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setActiveTab("config")}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5 text-slate-500" />
                          <span>Configurer</span>
                        </button>
                      </div>

                      {/* Quick Actions List */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                          Quick Actions
                        </h4>
                        <div className="space-y-1.5">
                          <button
                            onClick={() => setActiveTab("logs")}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Terminal className="w-3.5 h-3.5 text-orange-500" />
                              <span>View Live Logs</span>
                            </span>
                            <span className="text-[10px] text-slate-400">Ctrl+L</span>
                          </button>

                          <button
                            onClick={handleResetMemory}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                              <span>Reset Memory & Cache</span>
                            </span>
                            <span className="text-[10px] text-slate-400">Purge</span>
                          </button>

                          <button
                            onClick={() => alert(`Export de la configuration de l'agent ${selectedAgent.name} au format JSON téléchargé.`)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Download className="w-3.5 h-3.5 text-sky-500" />
                              <span>Export Config (.json)</span>
                            </span>
                            <span className="text-[10px] text-slate-400">JSON</span>
                          </button>

                          <button
                            onClick={() => alert(`Planification programmée: l'agent ${selectedAgent.name} s'exécutera toutes les 15 minutes.`)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-purple-500" />
                              <span>Schedule Recurring Run</span>
                            </span>
                            <span className="text-[10px] text-slate-400">Cron</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "logs" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Flux d'événements en direct</span>
                        <button
                          onClick={() => setSimulatedLogs([`[${new Date().toLocaleTimeString()}] Logs effacés.`])}
                          className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 space-y-1.5 h-64 overflow-y-auto border border-slate-800">
                        {simulatedLogs.map((log, i) => (
                          <div key={i} className="leading-snug">
                            {log}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleRunAgent}
                        disabled={isRunningSim}
                        className="w-full py-2 rounded-lg bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition disabled:opacity-50 cursor-pointer"
                      >
                        {isRunningSim ? "Traitement en cours..." : "Générer un cycle d'exécution"}
                      </button>
                    </div>
                  )}

                  {activeTab === "config" && (
                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                          Nom de l'agent
                        </label>
                        <input
                          type="text"
                          defaultValue={selectedAgent.name}
                          className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                          Modèle IA Assigné
                        </label>
                        <select className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                          <option>Claude 3.7 Sonnet (Orchestration)</option>
                          <option>Gemini 2.5 Flash (Basse latence)</option>
                          <option>Llama 3.3 70B (Souverain)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                          Timeout d'exécution (ms)
                        </label>
                        <input
                          type="number"
                          defaultValue={2500}
                          className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => alert(`Paramètres sauvegardés avec succès pour ${selectedAgent.name}.`)}
                          className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition cursor-pointer"
                        >
                          Enregistrer la configuration
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
