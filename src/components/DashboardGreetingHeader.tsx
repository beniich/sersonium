import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Wrench, 
  ShieldAlert, 
  Building2, 
  UserCheck, 
  LogIn, 
  ChevronDown, 
  ChevronUp, 
  X,
  Server,
  Filter,
  Check
} from "lucide-react";
import { GlobalState, CAFMWorkOrder, EdgeNode } from "../types";
import { User } from "firebase/auth";
import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import InteractiveDashboardCard, { QuickActionItem } from "./InteractiveDashboardCard";

interface DashboardGreetingHeaderProps {
  user?: User | null;
  state: GlobalState;
  isDark?: boolean;
  onSignIn?: () => void;
  onNavigateToTab?: (tabId: string) => void;
  onSelectNode?: (node: EdgeNode) => void;
  onCreateWorkOrder?: (order: Partial<CAFMWorkOrder>) => void;
}

export default function DashboardGreetingHeader({
  user,
  state,
  isDark = true,
  onSignIn,
  onNavigateToTab,
  onSelectNode,
  onCreateWorkOrder
}: DashboardGreetingHeaderProps) {
  const [tasksDrawerOpen, setTasksDrawerOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  
  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskNodeId, setNewTaskNodeId] = useState(state.nodes?.[0]?.id || "fra-1");
  const [newTaskPriority, setNewTaskPriority] = useState<"p1" | "p2" | "p3">("p2");
  const [newTaskAssignee, setNewTaskAssignee] = useState("Equipe NOC");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live real-time clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute time-of-day greeting in English
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Format today's date in English
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());

  // Capitalize first letter of date
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  // Extract user's name from Firebase User or Team Members
  const getUserDisplayName = () => {
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      // Check team members list
      const matchedMember = state.teamMembers?.find(m => m.email.toLowerCase() === user.email?.toLowerCase());
      if (matchedMember?.name) {
        return matchedMember.name;
      }
      // Extract from email (e.g. beniich.contact@gmail.com -> Beniich)
      const prefix = user.email.split("@")[0].split(".")[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return "Operations Director";
  };

  // Extract user initials
  const getUserInitials = () => {
    const name = getUserDisplayName();
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = getUserDisplayName();
  const greeting = getGreeting();

  // Tasks and Work Orders calculation for the current day
  const allWorkOrders = state.workOrders || [];
  const openWorkOrders = allWorkOrders.filter(w => w.status !== "resolved");
  const p1CriticalTasks = openWorkOrders.filter(w => w.priority === "p1");
  const p2HighTasks = openWorkOrders.filter(w => w.priority === "p2");
  const p3StandardTasks = openWorkOrders.filter(w => w.priority === "p3");
  const investigatingTasks = openWorkOrders.filter(w => w.status === "investigating");
  const completedTasks = allWorkOrders.filter(w => w.status === "resolved");

  // Filtered task list for the drawer
  const filteredTasks = openWorkOrders.filter(task => {
    if (filterPriority === "all") return true;
    if (filterPriority === "p1") return task.priority === "p1";
    if (filterPriority === "p2") return task.priority === "p2";
    if (filterPriority === "investigating") return task.status === "investigating";
    return true;
  });

  // Calculate today's resolution progress percentage
  const totalTasks = allWorkOrders.length || 1;
  const resolutionRate = Math.round((completedTasks.length / totalTasks) * 100);

  // Mark task as resolved directly
  const handleMarkResolved = async (taskId: string) => {
    try {
      if (user?.uid) {
        const docRef = doc(db, "workOrders", taskId);
        await updateDoc(docRef, { status: "resolved" });
      } else {
        // Mock state update
        const target = allWorkOrders.find(w => w.id === taskId);
        if (target) {
          target.status = "resolved";
        }
      }
    } catch (e) {
      console.error("Failed to mark task resolved:", e);
    }
  };

  // Quick Add new task for today
  const handleCreateQuickTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setIsSubmitting(true);

    const taskData: CAFMWorkOrder = {
      id: `wo-${Date.now().toString().slice(-4)}`,
      title: newTaskTitle.trim(),
      nodeId: newTaskNodeId,
      priority: newTaskPriority,
      status: "open",
      assignedTo: newTaskAssignee,
      createdAt: new Date().toISOString(),
      scheduledDate: new Date().toISOString().split("T")[0],
      aiAnalysis: "Created from central dashboard daily priorities panel."
    };

    try {
      if (user?.uid) {
        await addDoc(collection(db, "workOrders"), taskData);
      } else if (onCreateWorkOrder) {
        onCreateWorkOrder(taskData);
      } else {
        // Add to local state
        allWorkOrders.unshift(taskData);
      }
      setNewTaskTitle("");
      setIsQuickAddOpen(false);
    } catch (error) {
      console.error("Error creating work order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#111115] via-[#0c0c0e] to-[#08080a] border border-white/[0.08] shadow-lg overflow-hidden transition-all">
      {/* Ambient Radial Accent */}
      <div className="absolute top-0 right-1/4 w-[280px] h-[100px] bg-orange-500/[0.06] blur-[60px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-10 w-[160px] h-[80px] bg-blue-500/[0.03] blur-[50px] pointer-events-none rounded-full" />

      {/* Main Header Container with Compact Spacing */}
      <div className="p-3 sm:p-4 space-y-3">
        
        {/* Top Row: User Greeting, Firebase Identity & Real-Time Clock */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2.5 pb-2.5 border-b border-white/[0.06]">
          
          {/* User Profile & Greeting */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={displayName} 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-white/20 shadow-md"
                />
              ) : (
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/[0.15] text-white flex items-center justify-center font-bold text-xs sm:text-sm tracking-wider shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                  {getUserInitials()}
                </div>
              )}
              {/* Online Green Ring */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0c0c0e] rounded-full flex items-center justify-center">
                <span className="w-1 h-1 bg-white rounded-full animate-ping" />
              </span>
            </div>

            {/* Greeting Text & Identity */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg lg:text-xl font-semibold tracking-tight text-white">
                  {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-orange-200">{displayName}</span>
                </h1>
                
                {/* Firebase Authentication Status Badge */}
                {user ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                    <UserCheck className="w-3 h-3" />
                    <span>Firebase Auth</span>
                  </span>
                ) : (
                  <button
                    onClick={onSignIn}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Google Sign-In</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-400 font-light flex-wrap">
                <span className="flex items-center gap-1 text-neutral-300 text-[11px]">
                  <Calendar className="w-3 h-3 text-neutral-500" />
                  {capitalizedDate}
                </span>
                <span className="text-neutral-600">•</span>
                <span className="font-mono text-neutral-400 text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-400" />
                  {currentTime || "16:39"} Paris (UTC+2)
                </span>
                <span className="hidden sm:inline text-neutral-600">•</span>
                <span className="text-neutral-400 text-[11px] truncate max-w-[200px] sm:max-w-none">
                  {user?.email || "Lacaza Flagship ERP • Global Supervision"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Tasks Drawer Trigger */}
          <div className="flex items-center gap-2 self-stretch lg:self-auto justify-end flex-wrap">
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 min-h-[32px]"
              title="Add a new work order"
            >
              <Plus className="w-3.5 h-3.5 text-orange-400" />
              <span>+ Task</span>
            </button>

            <button
              onClick={() => setTasksDrawerOpen(!tasksDrawerOpen)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 min-h-[32px] ${
                openWorkOrders.length > 0 
                  ? "bg-white text-black hover:bg-neutral-200" 
                  : "bg-white/[0.08] text-white hover:bg-white/[0.15] border border-white/[0.12]"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Today's Tasks ({openWorkOrders.length})</span>
              {tasksDrawerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Middle Row: Personalized Daily Operational Task Metrics Summary with compact cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
          
          {/* Card 1: Total Pending Tasks Today */}
          <InteractiveDashboardCard
            scaleAmount={1.02}
            glowColor="orange"
            onClick={() => { setTasksDrawerOpen(true); setFilterPriority("all"); }}
            className="p-2.5 sm:p-3 bg-white/[0.025] hover:bg-white/[0.05]"
            quickActionsTitle="Quick Actions"
            quickActions={[
              {
                id: "act-all",
                label: "View List",
                icon: Filter,
                variant: "default",
                onClick: () => { setTasksDrawerOpen(true); setFilterPriority("all"); }
              },
              {
                id: "act-new",
                label: "+ Task",
                icon: Plus,
                variant: "primary",
                onClick: () => setIsQuickAddOpen(true)
              },
              {
                id: "act-cafm",
                label: "CAFM",
                icon: Building2,
                variant: "default",
                onClick: () => onNavigateToTab?.("ov-cafm")
              }
            ]}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                <span className="text-[10px] sm:text-[11px] font-medium text-neutral-200 flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Clock className="w-3 h-3" />
                  </div>
                  Active Tasks
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-orange-500/10 text-orange-400 font-semibold">Today</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                  {openWorkOrders.length}
                </span>
                <span className="text-[11px] text-neutral-500">pending</span>
              </div>
            </div>
            <div className="mt-1 text-[10px] text-neutral-400 font-light flex items-center justify-between border-t border-white/[0.04] pt-1">
              <span>{investigatingTasks.length} in progress</span>
              <ArrowRight className="w-2.5 h-2.5 text-orange-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </InteractiveDashboardCard>

          {/* Card 2: P1 Critical Urgent Tasks */}
          <InteractiveDashboardCard
            scaleAmount={1.02}
            glowColor="red"
            onClick={() => { setTasksDrawerOpen(true); setFilterPriority("p1"); }}
            className={`p-2.5 sm:p-3 ${p1CriticalTasks.length > 0 ? "bg-red-500/[0.06] border-red-500/25" : "bg-white/[0.025]"}`}
            quickActionsTitle="P1 Action"
            quickActions={[
              {
                id: "act-p1",
                label: "Filter P1",
                icon: ShieldAlert,
                variant: "danger",
                onClick: () => { setTasksDrawerOpen(true); setFilterPriority("p1"); }
              },
              {
                id: "act-emergency",
                label: "NOC Emergency",
                icon: Wrench,
                variant: "warning",
                onClick: () => setIsQuickAddOpen(true)
              }
            ]}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`text-[10px] sm:text-[11px] font-medium flex items-center gap-1.5 ${p1CriticalTasks.length > 0 ? "text-red-400" : "text-neutral-200"}`}>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${p1CriticalTasks.length > 0 ? "bg-red-500/20 border border-red-500/30 text-red-400" : "bg-white/5 border border-white/10 text-neutral-400"}`}>
                    <ShieldAlert className="w-3 h-3" />
                  </div>
                  Critical P1
                </span>
                {p1CriticalTasks.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${p1CriticalTasks.length > 0 ? "text-red-400" : "text-white"}`}>
                  {p1CriticalTasks.length}
                </span>
                <span className="text-[11px] text-neutral-500">intervention(s)</span>
              </div>
            </div>
            <div className="mt-1 text-[10px] text-neutral-400 font-light flex items-center justify-between border-t border-white/[0.04] pt-1">
              <span>{p1CriticalTasks.length > 0 ? "Immediate action required" : "No critical blockers"}</span>
              <ArrowRight className="w-2.5 h-2.5 text-neutral-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </InteractiveDashboardCard>

          {/* Card 3: P2 High Priority Interventions */}
          <InteractiveDashboardCard
            scaleAmount={1.02}
            glowColor="orange"
            onClick={() => { setTasksDrawerOpen(true); setFilterPriority("p2"); }}
            className="p-2.5 sm:p-3 bg-white/[0.025] hover:bg-white/[0.05]"
            quickActionsTitle="P2 Management"
            quickActions={[
              {
                id: "act-p2",
                label: "Filter P2",
                icon: AlertTriangle,
                variant: "warning",
                onClick: () => { setTasksDrawerOpen(true); setFilterPriority("p2"); }
              },
              {
                id: "act-nodes",
                label: "Inspect Nodes",
                icon: Server,
                variant: "default",
                onClick: () => onNavigateToTab?.("ov-map")
              }
            ]}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                <span className="text-[10px] sm:text-[11px] font-medium text-neutral-200 flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                  High P2
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 font-semibold">CAFM</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                  {p2HighTasks.length}
                </span>
                <span className="text-[11px] text-neutral-500">to schedule</span>
              </div>
            </div>
            <div className="mt-1 text-[10px] text-neutral-400 font-light flex items-center justify-between border-t border-white/[0.04] pt-1">
              <span>Thermal, PUE & Ops</span>
              <ArrowRight className="w-2.5 h-2.5 text-neutral-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </InteractiveDashboardCard>

          {/* Card 4: P3 Standard Routine Maintenance */}
          <InteractiveDashboardCard
            scaleAmount={1.02}
            glowColor="blue"
            onClick={() => { setTasksDrawerOpen(true); setFilterPriority("p3"); }}
            className="p-2.5 sm:p-3 bg-white/[0.025] hover:bg-white/[0.05]"
            quickActionsTitle="Routine P3"
            quickActions={[
              {
                id: "act-p3",
                label: "Filter P3",
                icon: Clock,
                variant: "default",
                onClick: () => { setTasksDrawerOpen(true); setFilterPriority("p3"); }
              },
              {
                id: "act-complete",
                label: "Completed",
                icon: CheckCircle2,
                variant: "primary",
                onClick: () => { setTasksDrawerOpen(true); setFilterPriority("p3"); }
              }
            ]}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                <span className="text-[10px] sm:text-[11px] font-medium text-neutral-200 flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  Routine P3
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-500/10 text-blue-400 font-semibold">Standard</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                  {p3StandardTasks.length}
                </span>
                <span className="text-[11px] text-neutral-500">tickets</span>
              </div>
            </div>
            <div className="mt-1 text-[10px] text-neutral-400 font-light flex items-center justify-between border-t border-white/[0.04] pt-1">
              <span>{completedTasks.length} already resolved</span>
              <ArrowRight className="w-2.5 h-2.5 text-neutral-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </InteractiveDashboardCard>

          {/* Card 4: Daily Completion & Resolution Rate */}
          <InteractiveDashboardCard
            scaleAmount={1.03}
            glowColor="orange"
            onClick={() => { setTasksDrawerOpen(true); }}
            className="p-3.5 sm:p-4 bg-white/[0.025] hover:bg-white/[0.05]"
            quickActionsTitle="Daily Summary"
            quickActions={[
              {
                id: "act-res",
                label: "View Resolved",
                icon: CheckCircle2,
                variant: "success",
                onClick: () => { setTasksDrawerOpen(true); setFilterPriority("all"); }
              },
              {
                id: "act-floorplan",
                label: "2D Plan",
                icon: Building2,
                variant: "default",
                onClick: () => onNavigateToTab?.("ov-floorplan")
              }
            ]}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span className="text-[11px] sm:text-xs font-medium text-neutral-200 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  Daily Resolution
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">{resolutionRate}%</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-semibold font-mono text-white tracking-tight">
                  {completedTasks.length}
                </span>
                <span className="text-xs text-neutral-500">/ {totalTasks} closed tasks</span>
              </div>
            </div>

            {/* Micro Progress Bar */}
            <div className="mt-2 w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, Math.min(100, resolutionRate))}%` }}
              />
            </div>
          </InteractiveDashboardCard>
        </div>

        {/* AI Operational Summary Synthesis Banner */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-orange-500/[0.04] border border-orange-500/20 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <p className="text-neutral-300 font-light text-[11px] sm:text-xs leading-relaxed">
              <span className="font-semibold text-white">Daily Operational Synthesis: </span>
              {p1CriticalTasks.length > 0 ? (
                <>Attention required on <span className="text-red-400 font-medium">{p1CriticalTasks[0].title}</span> ({p1CriticalTasks[0].assignedTo}). </>
              ) : (
                <>All infrastructure is operating within nominal parameters. </>
              )}
              {openWorkOrders.length} interventions scheduled today across the Paris, Frankfurt, and London campuses.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab?.("ov-cafm")}
            className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-orange-400 hover:text-orange-300 flex-shrink-0 cursor-pointer transition-colors"
          >
            <span>View CAFM</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Expandable Daily Tasks Panel / Drawer */}
      <AnimatePresence>
        {tasksDrawerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-white/[0.08] bg-[#09090b]/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-4 sm:p-6 space-y-4">
              
              {/* Drawer Header & Priority Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-orange-400" />
                    Today's Tasks & Work Orders Breakdown
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                    {filteredTasks.length} displayed
                  </span>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 mr-1 flex items-center gap-1">
                    <Filter className="w-2.5 h-2.5" /> Filter:
                  </span>
                  {[
                    { id: "all", label: "All" },
                    { id: "p1", label: "P1 Critical" },
                    { id: "p2", label: "P2 High" },
                    { id: "investigating", label: "In Progress" }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilterPriority(f.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                        filterPriority === f.id
                          ? "bg-white text-black font-semibold"
                          : "bg-white/[0.04] text-neutral-400 hover:text-white"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Items List */}
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-neutral-400 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="text-neutral-200 font-medium">No pending tasks for this filter</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">All operational interventions are under control.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {filteredTasks.map((task) => {
                    const matchedNode = state.nodes?.find(n => n.id === task.nodeId);
                    return (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3 group"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Priority Badge */}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
                              task.priority === "p1"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : task.priority === "p2"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            }`}>
                              {task.priority === "p1" ? "P1 Critical" : task.priority === "p2" ? "P2 High" : "P3 Normal"}
                            </span>

                            {/* Title */}
                            <h4 className="text-xs sm:text-sm font-medium text-white truncate">
                              {task.title}
                            </h4>

                            {/* Status */}
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-white/5 text-neutral-400 border border-white/10">
                              {task.status === "investigating" ? "Investigation in progress" : "Pending"}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-light flex-wrap">
                            <span className="flex items-center gap-1 text-neutral-300">
                              <Building2 className="w-3 h-3 text-neutral-500" />
                              {matchedNode ? matchedNode.name : `Node ${task.nodeId}`}
                            </span>
                            <span>•</span>
                            <span>Assigned to: <strong className="text-neutral-200">{task.assignedTo}</strong></span>
                            {task.aiAnalysis && (
                              <>
                                <span>•</span>
                                <span className="text-orange-300/80 italic text-[10px] truncate max-w-[280px]">
                                  {task.aiAnalysis}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                          {matchedNode && onSelectNode && (
                            <button
                              onClick={() => onSelectNode(matchedNode)}
                              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                              title="Inspect node and rack"
                            >
                              <Server className="w-3 h-3 text-neutral-400" />
                              <span>Inspect</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleMarkResolved(task.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                            title="Close this task for today"
                          >
                            <Check className="w-3 h-3" />
                            <span>Resolved</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Add Work Order Modal */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#101014] border border-white/[0.12] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">New Task / Work Order</h3>
                  <p className="text-[11px] text-neutral-400">Immediate addition to today's operational schedule</p>
                </div>
              </div>
              <button 
                onClick={() => setIsQuickAddOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/[0.06] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HVAC Calibration Server Room 2, UPS Filter Replacement"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    Affected Site / Node
                  </label>
                  <select
                    value={newTaskNodeId}
                    onChange={(e) => setNewTaskNodeId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                  >
                    {(state.nodes || []).map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    Operational Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                  >
                    <option value="p1">P1 - Critical (Immediate Action)</option>
                    <option value="p2">P2 - High (Scheduled Today)</option>
                    <option value="p3">P3 - Normal / Preventive Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                  Assigned Team or Technician
                </label>
                <input
                  type="text"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  placeholder="e.g. NOC Team, HVAC CAFM, Edge Ops"
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTaskTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Add to Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
