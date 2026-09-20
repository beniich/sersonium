import React, { useState } from "react";
import { motion } from "motion/react";
import { GlobalState, EdgeNode } from "../types";
import { 
  Building2, 
  Package, 
  Users, 
  Activity, 
  ShieldCheck, 
  Server, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Zap,
  ArrowRight,
  Globe,
  MapPin,
  Layers,
  Compass,
  LayoutDashboard
} from "lucide-react";
import GeoAssetHeatMap from "../components/GeoAssetHeatMap";
import InteractiveFloorPlan from "../components/InteractiveFloorPlan";
import DashboardGreetingHeader from "../components/DashboardGreetingHeader";
import InteractiveDashboardCard, { QuickActionItem } from "../components/InteractiveDashboardCard";
import DetailedChartJSDashboard from "../components/dashboard/DetailedChartJSDashboard";
import UnifiedDashboardView from "../components/UnifiedDashboardView";
import AssetManagementDashboard from "../components/AssetManagementDashboard";
import PerformanceMetricsChart from "../components/PerformanceMetricsChart";
import { User } from "firebase/auth";

interface OverviewPageProps {
  state: GlobalState;
  isDark?: boolean;
  activeItemId?: string;
  user?: User | null;
  onSignIn?: () => void;
  onSelectTab?: (id: string) => void;
  onSelectNode?: (node: EdgeNode) => void;
  onCreateWorkOrderForNode?: (nodeId: string) => void;
}

const MODULE_TABS = [
  { id: "ov-general", label: "Chart.js Cockpit", icon: LayoutDashboard },
  { id: "ov-perf", label: "Performance Metrics", icon: TrendingUp },
  { id: "ov-hybrid", label: "Convergence View", icon: Layers },
  { id: "ov-floorplan", label: "2D Building Floorplan", icon: Compass },
  { id: "ov-map", label: "POP Cartography", icon: Globe },
  { id: "ov-cafm", label: "Maintenance & CMMS", icon: Building2 },
  { id: "ov-stock", label: "Inventory & Hardware", icon: Package },
  { id: "ov-hr", label: "Staff & On-Call Shifts", icon: Users },
];

export default function OverviewPage({ 
  state, 
  isDark = true, 
  activeItemId = "ov-general", 
  user,
  onSignIn,
  onSelectTab,
  onSelectNode,
  onCreateWorkOrderForNode
}: OverviewPageProps) {
  const activeTab = MODULE_TABS.some(t => t.id === activeItemId) ? activeItemId : "ov-general";

  const handleTabChange = (tabId: string) => {
    if (onSelectTab) onSelectTab(tabId);
  };

  // Minimalist Stock Data
  const stockCategories = [
    { name: "Electronic Components & Processors", count: 18420, capacity: 85, status: "Optimal", code: "SKU-PRO-01" },
    { name: "IoT Sensors & Building Probes", count: 8250, capacity: 92, status: "Optimal", code: "SKU-IOT-88" },
    { name: "Fiber Cabling & Server Racks", count: 12300, capacity: 64, status: "Normal", code: "SKU-NET-40" },
    { name: "UPS Modules & Power Units", count: 3880, capacity: 42, status: "Restocking", code: "SKU-PWR-12" },
  ];

  // Minimalist Personnel Data
  const teams = [
    { team: "Building Supervision & CAFM", lead: "S. Dupont", members: 14, activeShift: 12, compliance: 100, role: "Facility Ops" },
    { team: "Inventory & Supply Flow", lead: "M. Leroy", members: 18, activeShift: 16, compliance: 98, role: "Logistics Lead" },
    { team: "Telemetry & Edge Nodes", lead: "A. Benali", members: 8, activeShift: 8, compliance: 100, role: "Systems Arch" },
    { team: "ZTNA Security & Compliance", lead: "C. Martin", members: 6, activeShift: 5, compliance: 100, role: "Cyber Security" },
  ];

  // Minimalist CAFM Work Orders
  const workOrders = [
    { id: "WO-8921", site: "Paris North Datacenter", task: "HVAC & Filter Calibration", priority: "High", status: "In Progress" },
    { id: "WO-8922", site: "Lyon Tech Campus", task: "UPS B4 Replacement", priority: "Critical", status: "Scheduled" },
    { id: "WO-8923", site: "Marseille Logistics Hub", task: "Sensor Weatherproofing Audit", priority: "Normal", status: "Completed" },
    { id: "WO-8924", site: "Frankfurt POP-2 Site", task: "Rack Firmware Update", priority: "Low", status: "Completed" },
  ];

  return (
    <div className="space-y-3 sm:space-y-3.5 animate-in fade-in duration-200">
      
      {/* Personalized Greeting Header with Firebase Profile & Daily Tasks */}
      <DashboardGreetingHeader 
        user={user}
        state={state}
        isDark={isDark}
        onSignIn={onSignIn}
        onNavigateToTab={handleTabChange}
        onSelectNode={onSelectNode}
        onCreateWorkOrder={(order) => {
          if (onCreateWorkOrderForNode && order.nodeId) {
            onCreateWorkOrderForNode(order.nodeId);
          }
        }}
      />

      {/* Flagship Capsule Tabs (Compact height, low vertical gap) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {MODULE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap cursor-pointer min-h-[32px] ${
                isSelected
                  ? "bg-slate-900 text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                  : "bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.08]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-orange-500 dark:text-orange-600" : "text-current"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area based on Tab */}
      {activeTab === "ov-general" && (
        <DetailedChartJSDashboard
          state={state}
          isDark={isDark}
          onSelectNode={onSelectNode}
          onCreateWorkOrderForNode={onCreateWorkOrderForNode}
          onNavigateToTab={handleTabChange}
        />
      )}

      {activeTab === "ov-perf" && (
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <PerformanceMetricsChart state={state} isDark={isDark} />
        </motion.div>
      )}

      {activeTab === "ov-hybrid" && (
        <UnifiedDashboardView
          state={state}
          isDark={isDark}
          onSelectNode={onSelectNode}
          onCreateWorkOrderForNode={onCreateWorkOrderForNode}
          onNavigateToSection={(page, id) => {
            if (id) handleTabChange(id);
          }}
        />
      )}

      {activeTab === "ov-floorplan" && (
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-3"
        >
          <InteractiveFloorPlan
            nodes={state.nodes || []}
            workOrders={state.workOrders || []}
            isDark={isDark}
            onSelectNode={onSelectNode}
            onCreateWorkOrderForAsset={(asset) => {
              if (onCreateWorkOrderForNode) {
                onCreateWorkOrderForNode(asset.linkedEdgeNodeId || "fra-1");
              }
            }}
          />
        </motion.div>
      )}

      {activeTab === "ov-map" && (
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-3"
        >
          <GeoAssetHeatMap
            nodes={state.nodes || []}
            workOrders={state.workOrders}
            isDark={isDark}
            onSelectNode={onSelectNode}
            onCreateWorkOrderForNode={onCreateWorkOrderForNode}
          />
        </motion.div>
      )}

      {activeTab === "ov-cafm" && (
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <AssetManagementDashboard initialCategory="alerte" isDark={isDark} />
        </motion.div>
      )}

      {activeTab === "ov-stock" && (
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <AssetManagementDashboard initialCategory="stock" isDark={isDark} />
        </motion.div>
      )}

      {activeTab === "ov-hr" && (
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <AssetManagementDashboard initialCategory="equipe" isDark={isDark} />
        </motion.div>
      )}

    </div>
  );
}
