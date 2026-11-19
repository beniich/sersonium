// src/components/AgentOrbit.tsx
// Interface orbitale SENSORIUM — Système complet "Run Agent" avec progression, logs temps réel et micro-interactions

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
      { id: "r2", name: "Audience Listener", icon: "🟠", highlighted: true, description: "Monitors audience sentiment and engagement signals.", status: "running" },
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
      { id: "c1", name: "Visual Designer", icon: "🎨", highlighted: true, description: "Generates brand-aligned visual assets.", status: "running" },
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
      { id: "l2", name: "Revenue Tracker", icon: "💰", highlighted: true, description: "Tracks revenue attribution from content.", status: "running" },
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
      { id: "p2", name: "TikTok Poster", icon: "🎵", highlighted: true, description: "Publishes and optimizes TikTok content.", status: "running" },
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
      { id: "s2", name: "Call Booker", icon: "📞", highlighted: true, description: "Books qualified calls automatically.", status: "running" },
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
      { id: "cm1", name: "Comment Replier", icon: "💬", highlighted: true, description: "Replies to comments with brand voice.", status: "running" },
      { id: "cm2", name: "DM Agent", icon: "💌", description: "Handles direct messages intelligently.", status: "active" },
      { id: "cm3", name: "FAQ Agent", icon: "❓", description: "Answers frequently asked questions.", status: "idle" },
      { id: "cm4", name: "Review Asker", icon: "⭐", description: "Requests reviews at the right moment.", status: "idle" },
      { id: "cm5", name: "Lead Catcher", icon: "🎣", description: "Captures leads from community interactions.", status: "active" },
      { id: "cm6", name: "Escalation", icon: "🚨", description: "Escalates complex issues to humans.", status: "idle" },
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
  success: "bg-emerald-500",
  error: "bg-red-500",
};

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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setIsDark(initialIsDark);
  }, [initialIsDark]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleAgentClick = (agent: Agent, groupTitle: string) => {
    setSelectedAgent({ ...agent, groupTitle });
    setIsRunning(false);
    setProgress(0);
    setRunLogs([]);
  };

  const closePanel = () => {
    setSelectedAgent(null);
    setIsRunning(false);
    setProgress(0);
    setRunLogs([]);
    if (intervalRef.current) clearInterval(intervalRef.current);
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

  const runAgent = () => {
    if (!selectedAgent || isRunning) return;

    setIsRunning(true);
    setProgress(0);
    setRunLogs([`[${new Date().toLocaleTimeString()}] Starting ${selectedAgent.name}...`]);
    updateAgentStatus(selectedAgent.id, "running");

    const steps = [
      "Initializing agent context...",
      "Loading knowledge base...",
      "Connecting to data sources...",
      "Processing inputs...",
      "Generating output...",
      "Validating results...",
      "Saving artifacts...",
    ];

    let currentStep = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps.length) * 100, 100);
      setProgress(newProgress);

      if (currentStep <= steps.length) {
        setRunLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ${steps[currentStep - 1]}`,
        ]);
      }

      if (currentStep >= steps.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsRunning(false);
        setProgress(100);
        updateAgentStatus(selectedAgent.id, "success");
        setRunLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✅ Agent completed successfully`,
        ]);
      }
    }, 700);
  };

  const resetAgent = () => {
    if (!selectedAgent) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setProgress(0);
    setRunLogs([]);
    updateAgentStatus(selectedAgent.id, "idle");
  };

  return (
    <div className={`${isDark ? "dark" : ""}`}>
      <div className="relative w-full h-[820px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 rounded-3xl overflow-hidden select-none transition-colors duration-500">
        
        {/* Dark mode toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="absolute top-5 right-5 z-30 px-3 py-1.5 text-xs font-medium rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:scale-105 transition-transform cursor-pointer"
        >
          {isDark ? "☀️ Light" : "🌙 Dark"}
        </button>

        {/* Animated SVG lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 820" fill="none">
          <motion.path
            d="M500 80 C500 180 500 280 500 380 C500 480 500 580 500 720"
            stroke="url(#lineGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          />
          {["M180 200 H420", "M580 200 H820", "M180 410 H420", "M580 410 H820", "M180 620 H420", "M580 620 H820"].map((d, i) => (
            <motion.path
              key={i}
              d={d}
              stroke="#f97316"
              strokeWidth="1.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 1.2, delay: 0.3 + i * 0.08 }}
            />
          ))}
          {[200, 410, 620].map((y, i) => (
            <motion.circle
              key={y}
              cx="500"
              cy={y}
              r="5"
              fill="#f97316"
              animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0.3, 0.8] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.35, ease: "easeInOut" }}
            />
          ))}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="1" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Node */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 16 }}
        >
          <div className="mb-3 px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-medium rounded-full shadow-lg">
            You
          </div>
          <motion.div
            className="w-20 h-20 rounded-2xl bg-black dark:bg-gray-800 flex items-center justify-center shadow-2xl ring-4 ring-orange-400/40 cursor-pointer"
            whileHover={{ scale: 1.1, rotate: 6 }}
          >
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-orange-400" fill="currentColor">
              <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" />
            </svg>
          </motion.div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-gray-500 dark:text-gray-400">
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
            className={`absolute w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 ${positionClasses[group.position]}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{group.title}</h3>
              <span className="text-xs text-gray-400 dark:text-gray-500">{group.count} agents</span>
            </div>
            <ul className="space-y-1.5">
              {group.agents.map((agent) => (
                <motion.li
                  key={agent.id}
                  onClick={() => handleAgentClick(agent, group.title)}
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                    agent.highlighted
                      ? "bg-orange-50 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300 font-medium border border-orange-100 dark:border-orange-500/30"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <span className="text-base leading-none">{agent.icon || "•"}</span>
                  <span className="truncate flex-1">{agent.name}</span>
                  {agent.status === "running" && (
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-orange-400"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    />
                  )}
                  {agent.status === "success" && (
                    <span className="text-emerald-500 text-xs font-bold">✓</span>
                  )}
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
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{selectedAgent.groupTitle}</p>
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

                {/* Content */}
                <div className="flex-1 p-5 overflow-y-auto">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {selectedAgent.description}
                  </p>

                  {/* Status */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 mb-5">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusColors[selectedAgent.status || "idle"]}`} />
                      <span className="text-sm font-medium capitalize text-gray-800 dark:text-gray-200">
                        {selectedAgent.status || "idle"}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar (visible when running or just finished) */}
                  {(isRunning || progress > 0) && (
                    <div className="mb-5">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                        <span>{isRunning ? "Running..." : "Completed"}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      onClick={runAgent}
                      disabled={isRunning}
                      className={`py-2.5 px-4 rounded-xl text-white text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isRunning
                          ? "bg-orange-400 cursor-not-allowed"
                          : "bg-orange-500 hover:bg-orange-600"
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <motion.span
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                          />
                          Running...
                        </>
                      ) : (
                        "▶ Run Agent"
                      )}
                    </button>

                    <button
                      onClick={resetAgent}
                      disabled={isRunning}
                      className="py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Live Logs */}
                  {runLogs.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Execution Log
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-800/80 rounded-xl p-3 max-h-48 overflow-y-auto font-mono text-xs space-y-1">
                        {runLogs.map((log, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`${
                              log.includes("✅") 
                                ? "text-emerald-600 dark:text-emerald-400 font-bold" 
                                : "text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {log}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="pt-5 mt-5 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Quick Actions
                    </h4>
                    <div className="space-y-1">
                      {["View Full Logs", "Export Config", "Schedule Run", "Open in Studio"].map((action) => (
                        <button
                          key={action}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
