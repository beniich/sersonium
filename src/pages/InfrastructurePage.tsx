import React, { useState, useRef, useEffect } from "react";
import { GlobalState, EdgeNode, CAFMWorkOrder } from "../types";
import { Server, Activity, Plus, X, Wrench, Shield, CheckCircle2, AlertTriangle, HardDrive, Thermometer, Cpu, Globe, Download, Calendar as CalendarIcon, LayoutList, Compass, Layers } from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { logAuditEvent } from "../hooks/useGlobalState";
import GeoAssetHeatMap from "../components/GeoAssetHeatMap";
import KafkaStreamVisualizer from "../components/KafkaStreamVisualizer";
import InteractiveFloorPlan, { SpatialAssetNode } from "../components/InteractiveFloorPlan";
import { generateInfrastructureReport } from "../utils/pdfGenerator";
import IoTSensorTelemetryMonitor from "../components/IoTSensorTelemetryMonitor";
import MesProductionMonitor from "../components/MesProductionMonitor";
import MesMaintenanceScheduler from "../components/MesMaintenanceScheduler";
import GoogleMapsBuildingFloorPlan from "../components/GoogleMapsBuildingFloorPlan";
import PredictiveMaintenanceEngine from "../components/PredictiveMaintenanceEngine";
import SubscriptionPricingModal from "../components/SubscriptionPricingModal";
import CmmsInventoryManager from "../components/CmmsInventoryManager";
import AssetHierarchyExplorer from "../components/AssetHierarchyExplorer";
import CmmsReliabilityKpiDashboard from "../components/CmmsReliabilityKpiDashboard";
import WorkOrderExecutionModal from "../components/WorkOrderExecutionModal";
import MobileFieldTechnician from "../components/MobileFieldTechnician";
import PreventiveMaintenanceScheduler from "../components/PreventiveMaintenanceScheduler";

interface InfrastructurePageProps {
  state: GlobalState;
  isDark: boolean;
  activeItemId?: string;
  onSelectTab?: (id: string) => void;
}

const TABS = [
  { id: "cmms-preventive", label: "Preventive Tour Scheduler" },
  { id: "cmms-mobile", label: "Mobile Field Tech (App)" },
  { id: "inf-floorplan", label: "2D Floor Plan (CAFM)" },
  { id: "inf-maps-floorplan", label: "Google Maps Building Floor Plan" },
  { id: "inf-geo", label: "Geo Asset Heat Map" },
  { id: "cmms-inventory", label: "Spare Parts & Stock" },
  { id: "cmms-hierarchy", label: "Asset Hierarchy & Lifecycle" },
  { id: "cmms-kpi", label: "Reliability KPIs (MTBF/MTTR)" },
  { id: "inf-mes", label: "MES Production Lines" },
  { id: "inf-schedule", label: "MES Maintenance Schedule" },
  { id: "inf-1", label: "Edge Nodes" },
  { id: "inf-2", label: "IoT Sensors & Telemetry" },
  { id: "inf-stream", label: "Event Streaming" },
  { id: "inf-3", label: "Work Orders" },
  { id: "inf-4", label: "Hardware Assets" },
  { id: "inf-5", label: "Datacenter Ops" },
  { id: "inf-6", label: "Predictive Maint." }
];

export default function InfrastructurePage({ state, isDark, activeItemId = "inf-1", onSelectTab }: InfrastructurePageProps) {
  const currentTab = TABS.some(t => t.id === activeItemId) ? activeItemId : "inf-1";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newNode, setNewNode] = useState({
    name: "",
    location: "",
    ip: "192.168.1.1",
    status: "active" as EdgeNode["status"],
  });

  // Work order creation state
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [edgeNodeViewMode, setEdgeNodeViewMode] = useState<"split" | "map" | "list">("split");
  const [workOrderViewMode, setWorkOrderViewMode] = useState<"list" | "calendar">("calendar");
  const [newWorkOrder, setNewWorkOrder] = useState({
    title: "",
    nodeId: "",
    priority: "p2" as CAFMWorkOrder["priority"],
    assignedTo: "Hardware Team",
    scheduledDate: new Date().toISOString().split('T')[0]
  });

  const [telemetrySubTab, setTelemetrySubTab] = useState<"iot" | "nodes">("iot");
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [executingWorkOrder, setExecutingWorkOrder] = useState<CAFMWorkOrder | null>(null);

  const handleSchedulePredictiveWorkOrder = (nodeId: string, title: string, priority: "p1" | "p2" | "p3" | "p4") => {
    setNewWorkOrder({
      title,
      nodeId,
      priority,
      assignedTo: "CAFM Predictive Maintenance Team",
      scheduledDate: new Date().toISOString().split('T')[0]
    });
    setIsWorkOrderModalOpen(true);
  };

  // Real-time Notification State
  const alertedStates = useRef<Record<string, boolean>>({});
  const [notifications, setNotifications] = useState<{id: string; title: string; message: string; type: 'warning' | 'critical'}[]>([]);

  useEffect(() => {
    if (!state.nodes) return;
    
    const newNotifications: typeof notifications = [];
    
    state.nodes.forEach(node => {
      const cpuKey = `${node.id}-cpu`;
      if (node.cpuUsage >= 85) {
        if (!alertedStates.current[cpuKey]) {
          alertedStates.current[cpuKey] = true;
          newNotifications.push({
            id: `cpu-${node.id}-${Date.now()}`,
            title: "Critical CPU Load",
            message: `${node.name} (${node.location}) is at ${node.cpuUsage}% CPU.`,
            type: "critical"
          });
        }
      } else {
        alertedStates.current[cpuKey] = false;
      }

      const ramKey = `${node.id}-ram`;
      if (node.ramUsage >= 85) {
        if (!alertedStates.current[ramKey]) {
          alertedStates.current[ramKey] = true;
          newNotifications.push({
            id: `ram-${node.id}-${Date.now()}`,
            title: "High Memory Usage",
            message: `${node.name} (${node.location}) is at ${node.ramUsage}% RAM.`,
            type: "warning"
          });
        }
      } else {
        alertedStates.current[ramKey] = false;
      }
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications]);
    }
  }, [state.nodes]);

  // Auto-dismiss notifications after 6 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleStressTest = async (nodeId: string, nodeName: string) => {
    try {
      await updateDoc(doc(db, "nodes", nodeId), { 
        cpuUsage: Math.floor(Math.random() * 10) + 90, // 90-99%
        ramUsage: Math.floor(Math.random() * 10) + 88, // 88-97%
        status: "maintenance"
      });
      await logAuditEvent("STRESS_TEST", `Initiated stress test on node ${nodeName}`);
    } catch(err) {
      console.error("Stress test failed", err);
    }
  };

  const handleProvisionNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNode.name || !newNode.location) return;
    
    setIsSubmitting(true);
    try {
      const colRef = collection(db, "nodes");
      const docRef = await addDoc(colRef, {
        ...newNode,
        cpuUsage: Math.floor(Math.random() * 30) + 10,
        ramUsage: Math.floor(Math.random() * 40) + 20,
        bandwidth: Math.floor(Math.random() * 500) + 100,
        latency: Math.floor(Math.random() * 15) + 5,
        uptime: 99.99,
        walletAddress: `jt_0x${Math.floor(Math.random()*16777215).toString(16).toUpperCase()}`,
        budget: 5000
      });
      await updateDoc(doc(db, "nodes", docRef.id), { id: docRef.id });
      await logAuditEvent("NODE_PROVISION", `Provisioned new Edge POP '${newNode.name}' in ${newNode.location}`);
      
      setIsModalOpen(false);
      setNewNode({ name: "", location: "", ip: "192.168.1.1", status: "active" });
    } catch (err) {
      console.error("Failed to provision node", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkOrder.title) return;

    try {
      const colRef = collection(db, "workOrders");
      const docRef = await addDoc(colRef, {
        ...newWorkOrder,
        nodeId: newWorkOrder.nodeId || (state.nodes?.[0]?.id || "fra-1"),
        status: "open",
        createdAt: new Date().toISOString(),
        scheduledDate: newWorkOrder.scheduledDate,
        aiAnalysis: "Preventative inspection scheduled by automated telemetry rule."
      });
      await updateDoc(doc(db, "workOrders", docRef.id), { id: docRef.id });
      await logAuditEvent("WORK_ORDER_CREATE", `Created work order: ${newWorkOrder.title}`);
      
      setIsWorkOrderModalOpen(false);
      setNewWorkOrder({ title: "", nodeId: "", priority: "p2", assignedTo: "Hardware Team", scheduledDate: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.error("Failed to create work order", err);
    }
  };

  const handleUpdateWorkOrderDate = async (workOrderId: string, newDate: string) => {
    try {
      await updateDoc(doc(db, "workOrders", workOrderId), { scheduledDate: newDate });
      await logAuditEvent("WORK_ORDER_RESCHEDULE", `Rescheduled work order to ${newDate}`);
    } catch (err) {
      console.error("Failed to reschedule work order", err);
    }
  };

  const handleResolveWorkOrder = async (id: string, title: string) => {
    try {
      await updateDoc(doc(db, "workOrders", id), { status: "resolved" });
      await logAuditEvent("WORK_ORDER_RESOLVE", `Resolved CAFM ticket: ${title}`);
    } catch (err) {
      console.error("Failed to resolve work order", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {/* Header with Glass Card Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end p-5 rounded-2xl glass-panel gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Infrastructure & CAFM</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
              Mesh Telemetry
            </span>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">enterprise.jeton.com / Physical POP Datacenter Operations & CAFM</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => generateInfrastructureReport(state)}
            className="px-3.5 py-2 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs hover:bg-slate-50 dark:hover:bg-neutral-700 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
          {(currentTab === "inf-1" || currentTab === "inf-geo") && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-[#F38020] to-[#FAAD3F] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs shadow-orange-500/25 hover:brightness-105 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Provision Node
            </button>
          )}
          {currentTab === "inf-3" && (
            <button 
              onClick={() => setIsWorkOrderModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-[#F38020] to-[#FAAD3F] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs shadow-orange-500/25 hover:brightness-105 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Work Order
            </button>
          )}
        </div>
      </div>

      {/* Glassmorphic Tabs Bar */}
      <div className="flex overflow-x-auto gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-neutral-900/50 backdrop-blur-md border border-slate-200 dark:border-white/[0.06]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onSelectTab && onSelectTab(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              currentTab === tab.id
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/[0.05]"
            }`}
          >
            {tab.id === "inf-floorplan" && <Compass className="w-3.5 h-3.5 text-orange-500" />}
            {tab.id === "inf-geo" && <Globe className="w-3.5 h-3.5 text-orange-500" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Global Status Grid with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl glass-card hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Total Datacenters</span>
            <Server className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold font-mono mt-2 tracking-tight">{(state.nodes || []).length} POPs</div>
          <div className="text-[11px] text-emerald-500 mt-1">100% Edge mesh reachability</div>
        </div>
        <div className="p-5 rounded-xl glass-card hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Global Uptime</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono mt-2 tracking-tight">99.998%</div>
          <div className="text-[11px] text-neutral-500 mt-1">SLA guarantee compliant</div>
        </div>
        <div className="p-5 rounded-xl glass-card hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Open CAFM Work Orders</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono mt-2 tracking-tight">
            {(state.workOrders || []).filter(w => w.status !== "resolved").length}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">{(state.workOrders || []).length} total logged</div>
        </div>
        <div className="p-5 rounded-xl glass-card hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Average PUE Efficiency</span>
            <Cpu className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-500 mt-2 tracking-tight">1.18</div>
          <div className="text-[11px] text-neutral-500 mt-1">Eco-optimized cooling</div>
        </div>
      </div>

      {/* Sub-View: 2D Floor Plan (CAFM) (inf-floorplan) */}
      {currentTab === "inf-floorplan" && (
        <InteractiveFloorPlan
          nodes={state.nodes || []}
          workOrders={state.workOrders || []}
          isDark={isDark}
          onCreateWorkOrderForAsset={(asset) => {
            setNewWorkOrder({
              title: `Maintenance: ${asset.code} (${asset.name})`,
              nodeId: asset.linkedEdgeNodeId || "fra-1",
              priority: asset.status === "critical" ? "p1" : "p2",
              assignedTo: "Facilities & CAFM Hardware Team",
              scheduledDate: new Date().toISOString().split("T")[0]
            });
            setIsWorkOrderModalOpen(true);
          }}
        />
      )}

      {/* Sub-View: Google Maps Building Floor Plan (inf-maps-floorplan) */}
      {currentTab === "inf-maps-floorplan" && (
        <GoogleMapsBuildingFloorPlan state={state} isDark={isDark} />
      )}

      {/* Sub-View: Geo Asset Heat Map (inf-geo) */}
      {currentTab === "inf-geo" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-1">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-500" />
                Global Asset Health & Geographic Heat Map
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Real-time Google Maps projection visualizing distributed asset health, thermal loads, and edge POP status.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-500 px-2.5 py-1 rounded-lg bg-white/60 dark:bg-neutral-900/60 border border-white/60 dark:border-white/[0.08] backdrop-blur-xs">
              Google Maps Platform • Advanced Markers
            </span>
          </div>

          <GeoAssetHeatMap
            nodes={state.nodes || []}
            workOrders={state.workOrders || []}
            isDark={isDark}
            onCreateWorkOrderForNode={(nodeId) => {
              setNewWorkOrder(prev => ({ ...prev, nodeId }));
              setIsWorkOrderModalOpen(true);
            }}
          />
        </div>
      )}

      {/* Sub-View: MES Production Lines (inf-mes) */}
      {currentTab === "inf-mes" && (
        <MesProductionMonitor state={state} isDark={isDark} />
      )}

      {/* Sub-View: MES Maintenance Schedule (inf-schedule) */}
      {currentTab === "inf-schedule" && (
        <MesMaintenanceScheduler state={state} isDark={isDark} />
      )}

      {/* Sub-View: Edge Nodes (inf-1) */}
      {currentTab === "inf-1" && (
        <div className="space-y-4">
          {/* View mode toggle bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-2xl glass-card">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Server className="w-4 h-4 text-orange-500" />
                Physical POP Nodes Fleet & Geographic Telemetry
              </h3>
              <p className="text-xs text-neutral-500">Live Firestore Real-time Synced assets across global edge datacenters.</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-900/60 p-1 rounded-xl border border-slate-200 dark:border-white/[0.06] text-xs backdrop-blur-xs">
              <button
                onClick={() => setEdgeNodeViewMode("split")}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  edgeNodeViewMode === "split"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setEdgeNodeViewMode("map")}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  edgeNodeViewMode === "map"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <Globe className="w-3 h-3 text-orange-500" />
                Geo Map
              </button>
              <button
                onClick={() => setEdgeNodeViewMode("list")}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  edgeNodeViewMode === "list"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                Fleet List
              </button>
            </div>
          </div>

          {/* Google Geographic Heat Map in Split or Map mode */}
          {(edgeNodeViewMode === "split" || edgeNodeViewMode === "map") && (
            <div className="space-y-2">
              <GeoAssetHeatMap
                nodes={state.nodes || []}
                workOrders={state.workOrders || []}
                isDark={isDark}
                onCreateWorkOrderForNode={(nodeId) => {
                  setNewWorkOrder(prev => ({ ...prev, nodeId }));
                  setIsWorkOrderModalOpen(true);
                }}
              />
            </div>
          )}

          {/* Fleet List Table in Split or List mode */}
          {(edgeNodeViewMode === "split" || edgeNodeViewMode === "list") && (
            <div className="rounded-2xl glass-panel overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] backdrop-blur-xs flex justify-between items-center">
                <h3 className="text-sm font-bold">Physical POP Nodes Inventory</h3>
                <span className="text-xs text-neutral-500 font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05]">
                  {(state.nodes || []).length} Active Nodes
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/[0.04] font-mono text-xs">
                {(state.nodes || []).map(node => (
                  <div key={node.id} className="p-4 hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm font-sans">
                        <Server className="w-4 h-4 text-orange-500" />
                        {node.name}
                        <span className="text-xs text-neutral-500 font-mono font-normal">({node.location})</span>
                      </div>
                      <div className="text-neutral-500 text-[11px]">
                        IP: {node.ip} | Wallet: {node.walletAddress || "Pending"}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs">
                      <div>
                        <div className="text-neutral-500 text-[10px]">CPU</div>
                        <div className="font-bold">{node.cpuUsage}%</div>
                      </div>
                      <div>
                        <div className="text-neutral-500 text-[10px]">RAM</div>
                        <div className="font-bold">{node.ramUsage}%</div>
                      </div>
                      <div>
                        <div className="text-neutral-500 text-[10px]">LATENCY</div>
                        <div className="font-bold text-emerald-500">{node.latency} ms</div>
                      </div>
                      <div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          node.status === "active" 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        }`}>
                          {node.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-View: IoT Sensors & Telemetry (inf-2) */}
      {currentTab === "inf-2" && (
        <div className="space-y-4">
          
          {/* Sub-Header & Selector */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-2xl glass-card">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-500" />
                Live IoT Sensors & Connected Asset Telemetry
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Real-time sensory telemetry (temperature, vibration, power, humidity) with asset health indices and out-of-tolerance drift monitoring.
              </p>
            </div>

            {/* Sub-mode switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
              <button
                onClick={() => setTelemetrySubTab("iot")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  telemetrySubTab === "iot"
                    ? "bg-orange-500 text-white shadow-xs"
                    : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Thermometer className="w-3.5 h-3.5" />
                IoT Probes & Asset Health
              </button>
              <button
                onClick={() => setTelemetrySubTab("nodes")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  telemetrySubTab === "nodes"
                    ? "bg-orange-500 text-white shadow-xs"
                    : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                Edge Compute Heatmap ({state.nodes?.length || 0})
              </button>
            </div>
          </div>

          {/* IoT Telemetry View */}
          {telemetrySubTab === "iot" ? (
            <IoTSensorTelemetryMonitor
              state={state}
              isDark={isDark}
              onCreateWorkOrderForAsset={(assetName, issue) => {
                setNewWorkOrder(prev => ({
                  ...prev,
                  title: `[Telemetry Alarm] ${issue} on ${assetName}`,
                  priority: "p1"
                }));
                setIsWorkOrderModalOpen(true);
              }}
              onNavigateToFloorplan={() => onSelectTab && onSelectTab("inf-floorplan")}
            />
          ) : (
            <div className="p-5 rounded-2xl glass-panel space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-500" />
                    Edge Node Telemetry & Load Matrix
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">Live CPU, RAM, and thermals from edge chassis sensors.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(state.nodes || []).map(node => (
                  <div key={node.id} className="p-5 rounded-xl glass-card space-y-3 font-mono text-xs hover:border-orange-500/30 transition-all">
                    <div className="flex justify-between items-center font-sans font-bold">
                      <span className="flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-neutral-400" />
                        {node.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleStressTest(node.id, node.name)}
                          className="px-2 py-1 text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors"
                        >
                          Stress Test
                        </button>
                        <span className="text-emerald-500 text-xs font-mono">{node.uptime}% Uptime</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-neutral-500">CPU Load</span>
                        <span className="font-bold">{node.cpuUsage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full transition-all" style={{ width: `${node.cpuUsage}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-neutral-500">RAM Allocation</span>
                        <span className="font-bold">{node.ramUsage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${node.ramUsage}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-View: Event Streaming (inf-stream) */}
      {currentTab === "inf-stream" && (
        <KafkaStreamVisualizer state={state} />
      )}

      {/* Sub-View: Work Orders (inf-3) */}
      {currentTab === "inf-3" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-2xl glass-card">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Wrench className="w-4 h-4 text-orange-500" />
                CAFM Maintenance Work Orders
              </h3>
              <p className="text-xs text-neutral-500">Facilities Management & Predictive Maintenance Scheduling</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-900/60 p-1 rounded-xl border border-slate-200 dark:border-white/[0.06] text-xs backdrop-blur-xs">
              <button
                onClick={() => setWorkOrderViewMode("list")}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  workOrderViewMode === "list"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" /> List
              </button>
              <button
                onClick={() => setWorkOrderViewMode("calendar")}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  workOrderViewMode === "calendar"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" /> Timeline
              </button>
            </div>
          </div>

          {workOrderViewMode === "calendar" && (
            <div className="rounded-2xl glass-panel overflow-hidden p-4">
              <div className="flex gap-4 overflow-x-auto snap-x pb-4">
                {[0, 1, 2, 3, 4].map(offset => {
                  const d = new Date();
                  d.setDate(d.getDate() + offset);
                  const dateStr = d.toISOString().split('T')[0];
                  const displayDate = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                  
                  const dayOrders = (state.workOrders || []).filter(wo => {
                    const woDate = wo.scheduledDate || wo.createdAt.split('T')[0];
                    return woDate === dateStr;
                  });

                  return (
                    <div 
                      key={offset} 
                      className="min-w-[280px] flex-1 snap-start bg-slate-50 dark:bg-neutral-800/30 rounded-xl p-3 border border-slate-200/60 dark:border-transparent hover:border-orange-500/20 transition-colors"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const woId = e.dataTransfer.getData("text/plain");
                        if (woId) handleUpdateWorkOrderDate(woId, dateStr);
                      }}
                    >
                      <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-orange-500" />
                        {displayDate}
                        <span className="bg-slate-200/80 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs px-2 py-0.5 rounded-full ml-auto font-mono">{dayOrders.length}</span>
                      </h4>
                      <div className="space-y-3 min-h-[200px]">
                        {dayOrders.map(wo => (
                          <div 
                            key={wo.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text/plain", wo.id)}
                            className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/[0.08] p-3 rounded-xl shadow-xs cursor-grab active:cursor-grabbing hover:border-orange-500/50 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                                wo.status === "resolved" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                                wo.status === "investigating" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" :
                                "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              }`}>
                                {wo.status}
                              </span>
                              <span className={`text-[10px] font-bold uppercase ${wo.priority === 'p1' ? 'text-red-500' : 'text-neutral-500'}`}>{wo.priority}</span>
                            </div>
                            <h5 className="font-bold text-sm leading-tight mb-1">{wo.title}</h5>
                            <p className="text-xs text-neutral-500 mb-2 truncate">Node: {wo.nodeId}</p>
                            {wo.status !== "resolved" && (
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => setExecutingWorkOrder(wo)}
                                  className="flex-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Wrench className="w-3.5 h-3.5" /> Execute & Sign
                                </button>
                                <button
                                  onClick={() => handleResolveWorkOrder(wo.id, wo.title)}
                                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-neutral-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 text-neutral-600 dark:text-neutral-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                  title="Quick Resolve"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                        {dayOrders.length === 0 && (
                          <div className="h-full flex items-center justify-center text-xs text-neutral-400 italic py-10">
                            No tasks scheduled
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {workOrderViewMode === "list" && (
            <div className="rounded-2xl glass-panel overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs font-mono">
              {(state.workOrders || []).map(wo => (
                <div key={wo.id} className="p-4 hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="font-bold text-sm font-sans flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-neutral-400" />
                      {wo.title}
                    </div>
                    <div className="text-neutral-500 text-[11px] mt-1 font-mono">
                      Target: {wo.nodeId} | Assigned: {wo.assignedTo} | Priority: {wo.priority.toUpperCase()}
                    </div>
                    {wo.aiAnalysis && (
                      <div className="text-neutral-400 text-[10px] mt-1 italic font-sans">
                        AI Note: {wo.aiAnalysis}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      wo.status === "resolved" 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    }`}>
                      {wo.status}
                    </span>
                    {wo.status !== "resolved" && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setExecutingWorkOrder(wo)}
                          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Wrench className="w-3.5 h-3.5" /> Execute & Sign
                        </button>
                        <button
                          onClick={() => handleResolveWorkOrder(wo.id, wo.title)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-neutral-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 text-neutral-600 dark:text-neutral-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                          title="Quick Resolve"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(state.workOrders || []).length === 0 && (
                <div className="p-8 text-center text-neutral-500 font-sans">
                  No work orders recorded. Click "New Work Order" above.
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      )}

      {/* Sub-View: Hardware Assets (inf-4) */}
      {currentTab === "inf-4" && (
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-orange-500" />
            Physical Hardware Inventory
          </h3>
          <p className="text-xs text-neutral-500">Track server chassis, 100GbE switches, and redundant PSUs.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-5 rounded-xl glass-card space-y-1">
              <div className="font-bold font-sans">Supermicro 1U Blade Fleet</div>
              <div className="text-neutral-500">2x AMD EPYC 9654 (192 Cores)</div>
              <div className="text-emerald-500 font-bold mt-2">12 Racks Deployed</div>
            </div>
            <div className="p-5 rounded-xl glass-card space-y-1">
              <div className="font-bold font-sans">Arista 7050SX 100GbE Switches</div>
              <div className="text-neutral-500">Redundant spine-leaf fabric</div>
              <div className="text-emerald-500 font-bold mt-2">Nominal Performance</div>
            </div>
            <div className="p-5 rounded-xl glass-card space-y-1">
              <div className="font-bold font-sans">Optane NVMe Storage Arrays</div>
              <div className="text-neutral-500">Ultra-fast cache tier (1.2TB/s)</div>
              <div className="text-emerald-500 font-bold mt-2">Health: 100%</div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View: Datacenter Ops (inf-5) */}
      {currentTab === "inf-5" && (
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-orange-500" />
            Datacenter Operations & Facilities
          </h3>
          <p className="text-xs text-neutral-500">Physical access control, chilled-water HVAC loops, and backup diesel gensets.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-5 rounded-xl glass-card space-y-2">
              <div className="font-bold font-sans">Frankfurt Interxion FRA-1</div>
              <div className="text-neutral-500">Temperature: 21.2°C (Aisle Ambient)</div>
              <div className="text-neutral-500">Humidity: 48% RH</div>
              <div className="text-emerald-500">Genset Fuel: 98% (48h autonomous run time)</div>
            </div>
            <div className="p-5 rounded-xl glass-card space-y-2">
              <div className="font-bold font-sans">Paris Equinix PA4</div>
              <div className="text-neutral-500">Temperature: 20.8°C (Aisle Ambient)</div>
              <div className="text-neutral-500">Humidity: 45% RH</div>
              <div className="text-emerald-500">Genset Fuel: 100% (72h autonomous run time)</div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View: Predictive Maint. (inf-6) with Linear Regression Model */}
      {currentTab === "inf-6" && (
        <PredictiveMaintenanceEngine
          state={state}
          isDark={isDark}
          onScheduleWorkOrder={handleSchedulePredictiveWorkOrder}
          onOpenPricing={() => setIsPricingModalOpen(true)}
        />
      )}

      {/* Sub-View: Spare Parts & Logistics (cmms-inventory) */}
      {currentTab === "cmms-inventory" && (
        <CmmsInventoryManager state={state} isDark={isDark} />
      )}

      {/* Sub-View: Asset Hierarchy & Technical Fiches (cmms-hierarchy) */}
      {currentTab === "cmms-hierarchy" && (
        <AssetHierarchyExplorer 
          state={state} 
          isDark={isDark} 
          onSelectAsset={(asset) => {
            console.log("Selected asset", asset);
          }}
        />
      )}

      {/* Sub-View: Preventive Tour Scheduler (cmms-preventive) */}
      {currentTab === "cmms-preventive" && (
        <PreventiveMaintenanceScheduler 
          state={state} 
          isDark={isDark} 
          onDispatchWorkOrder={(wo) => {
            if (onSelectTab) onSelectTab("inf-3");
          }}
        />
      )}

      {/* Sub-View: Mobile Field Technician (cmms-mobile) */}
      {currentTab === "cmms-mobile" && (
        <MobileFieldTechnician 
          state={state} 
          isDark={isDark} 
          onExitMobileMode={() => onSelectTab && onSelectTab("inf-3")} 
        />
      )}

      {/* Sub-View: Reliability KPIs (MTBF / MTTR & TCO) (cmms-kpi) */}
      {currentTab === "cmms-kpi" && (
        <CmmsReliabilityKpiDashboard state={state} isDark={isDark} />
      )}

      {/* Provision Node Glass Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Provision Edge Node</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleProvisionNode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Node Identifier</label>
                <input 
                  required
                  type="text" 
                  value={newNode.name}
                  onChange={e => setNewNode({...newNode, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/50"
                  placeholder="e.g. fra-edge-03"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Datacenter / Region</label>
                <input 
                  required
                  type="text" 
                  value={newNode.location}
                  onChange={e => setNewNode({...newNode, location: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/50"
                  placeholder="e.g. Frankfurt (FRA), Germany"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Provisioning..." : "Deploy Node"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Work Order Glass Modal */}
      {isWorkOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">New CAFM Work Order</h3>
              <button onClick={() => setIsWorkOrderModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateWorkOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Task Title</label>
                <input 
                  required
                  type="text" 
                  value={newWorkOrder.title}
                  onChange={e => setNewWorkOrder({...newWorkOrder, title: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/50"
                  placeholder="e.g. Inspect rack power distribution unit"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Target Edge Node</label>
                <select 
                  value={newWorkOrder.nodeId}
                  onChange={e => setNewWorkOrder({...newWorkOrder, nodeId: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/50"
                >
                  {(state.nodes || []).map(n => (
                    <option key={n.id} value={n.id}>{n.name} ({n.location})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Scheduled Date</label>
                <input 
                  required
                  type="date" 
                  value={newWorkOrder.scheduledDate}
                  onChange={e => setNewWorkOrder({...newWorkOrder, scheduledDate: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/50 dark:[color-scheme:dark]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsWorkOrderModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-time Threshold Notifications Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {notifications.map(notif => (
          <div key={notif.id} className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-xl animate-in slide-in-from-right-8 fade-in duration-300 w-80 ${
            notif.type === 'critical' 
              ? 'bg-red-500/90 dark:bg-red-950/90 border-red-500/50 text-white' 
              : 'bg-amber-500/90 dark:bg-amber-950/90 border-amber-500/50 text-white'
          }`}>
            <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${notif.type === 'critical' ? 'text-red-200' : 'text-amber-200'}`} />
            <div className="flex-1">
              <h4 className="text-sm font-bold tracking-tight">{notif.title}</h4>
              <p className={`text-xs mt-1 ${notif.type === 'critical' ? 'text-red-100' : 'text-amber-100'}`}>{notif.message}</p>
            </div>
            <button 
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))} 
              className={`ml-auto p-1 rounded-md transition-colors ${
                notif.type === 'critical' ? 'hover:bg-red-900/50 text-red-200' : 'hover:bg-amber-900/50 text-amber-200'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      {/* Subscription & Pricing Modal */}
      <SubscriptionPricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        state={state}
        onUpgradeSuccess={(tier) => {
          state.subscriptionTier = tier;
        }}
        isDark={isDark}
      />

      {/* Work Order Execution & Field Service Digital Sign-off Modal */}
      {executingWorkOrder && (
        <WorkOrderExecutionModal
          workOrder={executingWorkOrder}
          state={state}
          isDark={isDark}
          onClose={() => setExecutingWorkOrder(null)}
          onComplete={async (updatedWO) => {
            try {
              await updateDoc(doc(db, "workOrders", updatedWO.id), {
                status: "resolved",
                checklist: updatedWO.checklist,
                partsUsed: updatedWO.partsUsed,
                digitalSignature: updatedWO.digitalSignature,
                durationMinutes: updatedWO.durationMinutes
              });
            } catch (e) {
              console.error("Firestore sync error", e);
            }
            if (state.workOrders) {
              const idx = state.workOrders.findIndex(w => w.id === updatedWO.id);
              if (idx >= 0) {
                state.workOrders[idx] = updatedWO;
              }
            }
            setExecutingWorkOrder(null);
          }}
        />
      )}
    </div>
  );
}
