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
import ModularPortletsDashboard from "../components/ModularPortletsDashboard";
import UnifiedAssetFile from "../components/UnifiedAssetFile";
import TelemetryChart from "../components/TelemetryChart";
import { MODULE_TABS } from "../components/ModuleNavigationBar";
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
  onOpenReportModal?: () => void;
  isCompactMode?: boolean;
  onToggleCompactMode?: () => void;
}


export default function OverviewPage({ 
  state, 
  isDark = true, 
  activeItemId = "ov-general", 
  user,
  onSignIn,
  onSelectTab,
  onSelectNode,
  onCreateWorkOrderForNode,
  onOpenReportModal,
  isCompactMode: isCompactModeProp,
  onToggleCompactMode: onToggleCompactModeProp
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

  const [isCompactMode, setIsCompactMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sensorium_compact_mode") === "true";
    } catch {
      return false;
    }
  });

  const toggleCompactMode = () => {
    setIsCompactMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem("sensorium_compact_mode", String(next));
      } catch {}
      return next;
    });
  };
  const effectiveCompactMode = isCompactModeProp !== undefined ? isCompactModeProp : isCompactMode;
  const effectiveToggleCompactMode = onToggleCompactModeProp || toggleCompactMode;

  return (
    <div className={`space-y-3 sm:space-y-3.5 animate-in fade-in duration-200 ${effectiveCompactMode ? "compact-erp-mode text-xs" : ""}`}>
      
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

      {/* 🚀 Feature #1 NetSuite : Portlets Modulaires Command Center */}
      {activeTab === "ov-erp-portlets" && (
        <ModularPortletsDashboard
          state={state}
          isDark={isDark}
          isCompactMode={isCompactMode}
          onNavigateTab={handleTabChange}
          onSelectNode={onSelectNode}
          onOpenReportModal={onOpenReportModal}
        />
      )}

      {/* 🚀 Feature #3 NetSuite : Fiche Asset Unifiée 360° avec Onglets & Custom Fields */}
      {activeTab === "ov-asset-hub" && (
        <UnifiedAssetFile
          state={state}
          isDark={isDark}
          isCompactMode={isCompactMode}
          onNavigateTab={handleTabChange}
        />
      )}

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
          className="space-y-4"
        >
          <TelemetryChart sensorId="sensor-cluster-main" isDark={isDark} />
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
