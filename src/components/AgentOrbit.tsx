// src/components/AgentOrbit.tsx
// Interface orbitale SENSORIUM — Moteur "Run Agent" avec simulation d'appel API asynchrone (async/await, gestion succès/erreur & télémétrie HTTP)

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export type AgentStatus = "active" | "idle" | "running" | "success" | "error";

export type Agent = {
  id: string;
  name: string;
  icon?: string;
  highlighted?: boolean;
  description?: string;
  status?: AgentStatus;
};

export type Group = {
  id: string;
  title: string;
  count: number;
  agents: Agent[];
  position: "top-left" | "top-right" | "middle-left" | "middle-right" | "bottom-left" | "bottom-right";
};

const groupsData: Group[] = [
  {
    id: "research",
    title: "Research",
    count: 6,
    position: "top-left",
    agents: [
      { id: "r1", name: "Trend Scout", icon: "🔍", description: "Scans emerging trends across platforms in real-time.", status: "active" },
      { id: "r2", name: "Audience Listener", icon: "🟠", highlighted: true, description: "Monitors audience sentiment and engagement signals.", status: "idle" },
      { id: "r3", name: "Comment Miner", icon: "💬", description: "Extracts insights from comments and replies.", status: "idle" },
      { id: "r4", name: "Competitor Watch", icon: "👁️", description: "Tracks competitor content and performance.", status: "active" },
      { id: "r5", name: "Post Writer", icon: "✍️", description: "Generates high-converting post drafts.", status: "idle" },
      { id: "r6", name: "Email Writer", icon: "📧", description: "Creates personalized email sequences.", status: "idle" },
    ],
  },
  {
    id: "content",
    title: "Content",
    count: 6,
    position: "top-right",
    agents: [
      { id: "c1", name: "Visual Designer", icon: "🎨", highlighted: true, description: "Generates brand-aligned visual assets.", status: "idle" },
      { id: "c2", name: "Carousel Builder", icon: "🎠", description: "Creates multi-slide carousels optimized for engagement.", status: "idle" },
      { id: "c3", name: "Voiceover", icon: "🎙️", description: "Produces natural-sounding voiceovers.", status: "idle" },
      { id: "c4", name: "Video Editor", icon: "🎬", description: "Edits and optimizes short-form videos.", status: "active" },
      { id: "c5", name: "Brand Check", icon: "✅", description: "Ensures all content respects brand guidelines.", status: "active" },
      { id: "c6", name: "Approval Desk", icon: "📋", description: "Manages content approval workflow.", status: "idle" },
    ],
  },
  {
    id: "loop",
    title: "The loop",
    count: 6,
    position: "middle-left",
    agents: [
      { id: "l1", name: "Post Analyst", icon: "📊", description: "Analyzes post performance and suggests improvements.", status: "active" },
      { id: "l2", name: "Revenue Tracker", icon: "💰", highlighted: true, description: "Tracks revenue attribution from content.", status: "idle" },
      { id: "l3", name: "Call Tracker", icon: "📞", description: "Logs and analyzes sales calls.", status: "idle" },
      { id: "l4", name: "Email Analyst", icon: "📧", description: "Measures email campaign effectiveness.", status: "idle" },
      { id: "l5", name: "Weekly Report", icon: "📈", description: "Generates automated weekly performance reports.", status: "idle" },
      { id: "l6", name: "Loop Feeder", icon: "🔄", description: "Feeds insights back into the content loop.", status: "active" },
    ],
  },
  {
    id: "publish",
    title: "Publish",
    count: 6,
    position: "middle-right",
    agents: [
      { id: "p1", name: "Scheduler", icon: "📅", description: "Optimizes posting times across platforms.", status: "active" },
      { id: "p2", name: "TikTok Poster", icon: "🎵", highlighted: true, description: "Publishes and optimizes TikTok content.", status: "idle" },
      { id: "p3", name: "Reels Poster", icon: "📱", description: "Handles Instagram Reels publishing.", status: "idle" },
      { id: "p4", name: "Shorts Poster", icon: "▶️", description: "Manages YouTube Shorts distribution.", status: "idle" },
      { id: "p5", name: "X Poster", icon: "𝕏", description: "Posts and engages on X (Twitter).", status: "active" },
      { id: "p6", name: "Newsletter", icon: "📰", description: "Sends and manages email newsletters.", status: "idle" },
    ],
  },
  {
    id: "sales",
    title: "Sales",
    count: 6,
    position: "bottom-left",
    agents: [
      { id: "s1", name: "Lead Scorer", icon: "🎯", description: "Scores and prioritizes incoming leads.", status: "active" },
      { id: "s2", name: "Call Booker", icon: "📞", highlighted: true, description: "Books qualified calls automatically.", status: "idle" },
      { id: "s3", name: "Reminder", icon: "⏰", description: "Sends smart follow-up reminders.", status: "idle" },
      { id: "s4", name: "Follow-up", icon: "🔄", description: "Handles multi-step follow-up sequences.", status: "idle" },
      { id: "s5", name: "Payment Link", icon: "💳", description: "Generates and tracks payment links.", status: "idle" },
      { id: "s6", name: "CRM Sync", icon: "🔗", description: "Keeps CRM data synchronized in real-time.", status: "active" },
    ],
  },
  {
    id: "community",
    title: "Community",
    count: 6,
    position: "bottom-right",
    agents: [
      { id: "cm1", name: "Comment Replier", icon: "💬", highlighted: true, description: "Replies to comments with brand voice.", status: "idle" },
      { id: "cm2", name: "DM Agent", icon: "💌", description: "Handles direct messages intelligently.", status: "active" },
      { id: "cm3", name: "FAQ Agent", icon: "❓", description: "Answers frequently asked questions.", status: "idle" },
      { id: "cm4", name: "Review Asker", icon: "⭐", description: "Requests reviews at the right moment.", status: "idle" },
      { id: "cm5", name: "Lead Catcher", icon: "🎣", description: "Captures leads from community interactions.", status: "active" },
      { id: "cm6", name: "Escalation", icon: "🚨", description: "Escalates complex issues to humans.", status: "idle" },
    ],
  },
];

const positionClasses: Record<Group["position"], string> = {
  "top-left": "top-20 left-6 sm:left-10",
  "top-right": "top-20 right-6 sm:right-10",
  "middle-left": "top-1/2 -translate-y-1/2 left-6 sm:left-10",
  "middle-right": "top-1/2 -translate-y-1/2 right-6 sm:right-10",
  "bottom-left": "bottom-6 left-6 sm:left-10",
  "bottom-right": "bottom-6 right-6 sm:right-10",
};

const statusColors: Record<AgentStatus, string> = {
  active: "bg-emerald-500",
  idle: "bg-gray-400",
  running: "bg-orange-500",
  success: "bg-emerald-500",
  error: "bg-red-500",
};

// ============================================
// 🔥 SIMULATION D'APPEL API RÉEL
// ============================================
async function runAgentAPI(agentId: string, agentName: string): Promise<{
  success: boolean;
  duration: number;
  output?: string;
  error?: string;
}> {
  // Simule la latence réseau réaliste (1.8s à 3.5s)
  const delay = 1800 + Math.random() * 1700;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 85% de chance de succès, 15% d'erreur pour tester les scénarios réels
      const isSuccess = Math.random() > 0.15;

      if (isSuccess) {
        resolve({
          success: true,
          duration: Math.round(delay),
          output: `Agent "${agentName}" (${agentId}) executed successfully. Generated 3 artifacts and updated 2 telemetry pipelines.`,
        });
      } else {
        resolve({
          success: false,
          duration: Math.round(delay),
          error: "Upstream service timeout • Rate limit exceeded on cloud model provider",
        });
      }
    }, delay);
  });
}

interface AgentOrbitProps {
  isDark?: boolean;
}

export default function AgentOrbit({ isDark: initialIsDark = false }: AgentOrbitProps) {
  const [groups, setGroups] = useState<Group[]>(groupsData);
  const [selectedAgent, setSelectedAgent] = useState<(Agent & { groupTitle: string }) | null>(null);
  const [isDark, setIsDark] = useState<boolean>(initialIsDark);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<"success" | "error" | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setIsDark(initialIsDark);
  }, [initialIsDark]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handleAgentClick = (agent: Agent, groupTitle: string) => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setSelectedAgent({ ...agent, groupTitle });
    setIsRunning(false);
    setProgress(0);
    setRunLogs([]);
    setLastResult(null);
  };

  const closePanel = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setSelectedAgent(null);
    setIsRunning(false);
    setProgress(0);
    setRunLogs([]);
    setLastResult(null);
  };

  const updateAgentStatus = (agentId: string, newStatus: AgentStatus) => {
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        agents: group.agents.map((a) =>
          a.id === agentId ? { ...a, status: newStatus } : a
        ),
      }))
    );
    if (selectedAgent?.id === agentId) {
      setSelectedAgent((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const addLog = (message: string) => {
    setRunLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // ============================================
  // 🚀 VRAIE FONCTION RUN (async / await)
  // ============================================
  const runAgent = async () => {
    if (!selectedAgent || isRunning) return;

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    setIsRunning(true);
    setProgress(0);
    setLastResult(null);
    setRunLogs([]);
    updateAgentStatus(selectedAgent.id, "running");

    addLog(`Calling API → POST /api/v1/agents/${selectedAgent.id}/run`);
    addLog(`Payload: { agent: "${selectedAgent.name}", mode: "async_orchestrated", env: "production" }`);

    // Animation de progression fluide pendant l'attente de l'API (jusqu'à 90%)
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 8;
      });
    }, 200);

    try {
      const result = await runAgentAPI(selectedAgent.id, selectedAgent.name);

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProgress(100);

      if (result.success) {
        addLog(`Response 200 OK (${result.duration}ms)`);
        addLog(`✅ ${result.output}`);
        updateAgentStatus(selectedAgent.id, "success");
        setLastResult("success");
      } else {
        addLog(`Response 500 Error (${result.duration}ms)`);
        addLog(`❌ ${result.error}`);
        updateAgentStatus(selectedAgent.id, "error");
        setLastResult("error");
      }
    } catch (err: any) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProgress(100);
      addLog(`Network Error: Failed to fetch (${err?.message || "Connection refused"})`);
      updateAgentStatus(selectedAgent.id, "error");
      setLastResult("error");
    } finally {
      setIsRunning(false);
    }
  };

  const resetAgent = () => {
    if (!selectedAgent) return;
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setIsRunning(false);
    setProgress(0);
    setRunLogs([]);
    setLastResult(null);
    updateAgentStatus(selectedAgent.id, "idle");
  };

  return (
    <div className={`${isDark ? "dark" : ""}`}>
      <div className="relative w-full h-[880px] bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-900 dark:via-slate-950 dark:to-gray-950 rounded-3xl overflow-hidden select-none transition-colors duration-500 border border-slate-200/60 dark:border-slate-800 shadow-sm">
        
        {/* Title Heading — identical to the uploaded reference */}
        <div className="absolute top-5 left-6 sm:left-10 z-30 pointer-events-none">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900/90 dark:text-white/90 font-['Manrope']">
            36 AI Agents
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Écosystème autonome multi-agents interconnecté
          </p>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="absolute top-5 right-6 sm:right-10 z-30 px-3 py-1.5 text-xs font-medium rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:scale-105 transition-transform cursor-pointer shadow-xs"
        >
          {isDark ? "☀️ Light" : "🌙 Dark"}
        </button>

        {/* SVG Racetrack & Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 880" fill="none">
          {/* Main Racetrack Loop */}
          <path
            d="M 450 110 A 50 50 0 0 1 550 110 L 550 770 A 50 50 0 0 1 450 770 Z"
            stroke={isDark ? "#334155" : "#0f172a"}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Animated Energy Flow on Racetrack */}
          <motion.path
            d="M 450 110 A 50 50 0 0 1 550 110 L 550 770 A 50 50 0 0 1 450 770 Z"
            stroke="#f97316"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="40 180"
            animate={{ strokeDashoffset: [0, -440] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />

          {/* Horizontal Connector Lines from Cards to Racetrack */}
          {/* Left Connectors: y=230, y=470, y=710 */}
          <path d="M 320 230 L 450 230" stroke={isDark ? "#475569" : "#0f172a"} strokeWidth="1.5" />
          <path d="M 320 470 L 450 470" stroke={isDark ? "#475569" : "#0f172a"} strokeWidth="1.5" />
          <path d="M 320 710 L 450 710" stroke={isDark ? "#475569" : "#0f172a"} strokeWidth="1.5" />

          {/* Right Connectors: y=230, y=470, y=710 */}
          <path d="M 550 230 L 680 230" stroke={isDark ? "#475569" : "#0f172a"} strokeWidth="1.5" />
          <path d="M 550 470 L 680 470" stroke={isDark ? "#475569" : "#0f172a"} strokeWidth="1.5" />
          <path d="M 550 710 L 680 710" stroke={isDark ? "#475569" : "#0f172a"} strokeWidth="1.5" />

          {/* Connection Junction Nodes (Circles) */}
          {[230, 470, 710].map((y) => (
            <React.Fragment key={y}>
              <circle cx="450" cy={y} r="5" fill={isDark ? "#1e293b" : "#ffffff"} stroke={isDark ? "#f97316" : "#0f172a"} strokeWidth="2" />
              <circle cx="550" cy={y} r="5" fill={isDark ? "#1e293b" : "#ffffff"} stroke={isDark ? "#f97316" : "#0f172a"} strokeWidth="2" />
            </React.Fragment>
          ))}

          {/* Directional Chevron Arrows on Racetrack */}
          {/* Left line: going down */}
          <polygon points="446,310 450,318 454,310" fill="#f97316" />
          <polygon points="446,580 450,588 454,580" fill="#f97316" />
          {/* Right line: going up */}
          <polygon points="546,588 550,580 554,588" fill="#f97316" />
        </svg>

        {/* "You" Badge on track */}
        <div className="absolute top-[320px] left-[550px] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="px-3.5 py-1 bg-black text-white text-xs font-bold rounded-full shadow-md">
            You
          </div>
        </div>

        {/* Center Node: Claude Code */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-20 h-20 rounded-2xl bg-black dark:bg-gray-800 flex items-center justify-center shadow-2xl ring-4 ring-orange-500/30 cursor-pointer"
            whileHover={{ scale: 1.08 }}
          >
            {/* Coral/Orange Sunburst (Claude icon) */}
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#d97757]" fill="currentColor">
              <path d="M12 2C12.55 2 13 2.45 13 3V5C13 5.55 12.55 6 12 6C11.45 6 11 5.55 11 5V3C11 2.45 11.45 2 12 2ZM12 18C12.55 18 13 18.45 13 19V21C13 21.55 12.55 22 12 22C11.45 22 11 21.55 11 21V19C11 18.45 11.45 18 12 18ZM4.93 4.93C5.32 4.54 5.95 4.54 6.34 4.93C6.73 5.32 6.73 5.95 6.34 6.34L4.93 7.75C4.54 8.14 3.91 8.14 3.52 7.75C3.13 7.36 3.13 6.73 3.52 6.34L4.93 4.93ZM17.66 17.66C18.05 17.27 18.68 17.27 19.07 17.66C19.46 18.05 19.46 18.68 19.07 19.07L17.66 20.48C17.27 20.87 16.64 20.87 16.25 20.48C15.86 20.09 15.86 19.46 16.25 19.07L17.66 17.66ZM2 12C2 11.45 2.45 11 3 11H5C5.55 11 6 11.45 6 12C6 12.55 5.55 13 5 13H3C2.45 13 2 12.55 2 12ZM18 12C18 11.45 18.45 11 19 11H21C21.55 11 22 11.45 22 12C22 12.55 21.55 13 21 13H19C18.45 13 18 12.55 18 12ZM4.93 19.07L6.34 17.66C6.73 17.27 7.36 17.27 7.75 17.66C8.14 18.05 8.14 18.68 7.75 19.07L6.34 20.48C5.95 20.87 5.32 20.87 4.93 20.48C4.54 20.09 4.54 19.46 4.93 19.07ZM17.66 6.34L19.07 4.93C19.46 4.54 20.09 4.54 20.48 4.93C20.87 5.32 20.87 5.95 20.48 6.34L19.07 7.75C18.68 8.14 18.05 8.14 17.66 7.75C17.27 7.36 17.27 6.73 17.66 6.34Z" />
            </svg>
          </motion.div>
          <div className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Claude Code
          </div>
        </motion.div>

        {/* Agent Cards — 6 Groups */}
        {groups.map((group, groupIndex) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1 + groupIndex * 0.06 }}
            whileHover={{ scale: 1.02 }}
            className={`absolute w-64 sm:w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-4 ${positionClasses[group.position]}`}
          >
            <div className="flex items-center justify-between mb-2.5 pb-1 border-b border-gray-50 dark:border-gray-700/50">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm tracking-tight">{group.title}</h3>
              <span className="text-[11px] text-gray-400 font-medium">{group.count} agents</span>
            </div>
            <ul className="space-y-1">
              {group.agents.map((agent) => (
                <motion.li
                  key={agent.id}
                  onClick={() => handleAgentClick(agent, group.title)}
                  whileHover={{ x: 3 }}
                  className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                    agent.highlighted
                      ? "bg-orange-50 dark:bg-orange-500/15 text-orange-800 dark:text-orange-200 font-semibold"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm leading-none shrink-0">{agent.icon}</span>
                    <span className="truncate">{agent.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Orange dot for highlighted agents — matching screenshot */}
                    {agent.highlighted && (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                    )}
                    {agent.status === "running" && (
                      <motion.span className="w-2 h-2 rounded-full bg-orange-400"
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      />
                    )}
                    {agent.status === "success" && <span className="text-emerald-500 text-xs font-bold">✓</span>}
                    {agent.status === "error" && <span className="text-red-500 text-xs font-bold">✕</span>}
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}

        {/* Side Panel */}
        <AnimatePresence>
          {selectedAgent && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closePanel}
                className="absolute inset-0 bg-black/20 dark:bg-black/40 z-40"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className="absolute top-0 right-0 h-full w-[380px] bg-white dark:bg-gray-900 shadow-2xl z-50 border-l border-gray-200 dark:border-gray-700 flex flex-col"
              >
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{selectedAgent.groupTitle}</p>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>{selectedAgent.icon}</span>
                      {selectedAgent.name}
                    </h2>
                  </div>
                  <button
                    onClick={closePanel}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 p-5 overflow-y-auto">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{selectedAgent.description}</p>

                  {/* Status */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 mb-5">
                    <span className="text-sm text-gray-500">Status</span>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusColors[selectedAgent.status || "idle"]}`} />
                      <span className="text-sm font-medium capitalize text-gray-800 dark:text-gray-200">
                        {selectedAgent.status || "idle"}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  {(isRunning || progress > 0) && (
                    <div className="mb-5">
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>{isRunning ? "Calling API..." : lastResult === "success" ? "Completed" : "Failed"}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${lastResult === "error" ? "bg-red-500" : "bg-gradient-to-r from-orange-500 to-orange-400"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      onClick={runAgent}
                      disabled={isRunning}
                      className={`py-2.5 px-4 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isRunning ? "bg-orange-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <motion.span
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                          />
                          Calling API...
                        </>
                      ) : (
                        "▶ Run Agent"
                      )}
                    </button>
                    <button
                      onClick={resetAgent}
                      disabled={isRunning}
                      className="py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium disabled:opacity-50 cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Logs */}
                  {runLogs.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">API Logs</h4>
                      <div className="bg-gray-50 dark:bg-gray-800/80 rounded-xl p-3 max-h-52 overflow-y-auto font-mono text-xs space-y-1.5">
                        {runLogs.map((log, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={
                              log.includes("✅") ? "text-emerald-600 dark:text-emerald-400 font-bold" :
                              log.includes("❌") || log.includes("Error") ? "text-red-500 font-bold" :
                              "text-gray-600 dark:text-gray-300"
                            }
                          >
                            {log}
                          </motion.div>
                        ))}
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
