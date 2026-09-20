import React, { useState, useEffect, ReactNode, ErrorInfo } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { EdgeNode, CAFMWorkOrder } from "../types";
import { 
  Building2, 
  Package, 
  Users, 
  Activity, 
  Server, 
  Thermometer, 
  Cpu, 
  Globe, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Wrench, 
  Layers,
  Plus,
  Filter,
  X,
  Zap,
  Radio,
  ArrowRight,
  ShieldAlert,
  HardDrive
} from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { logAuditEvent } from "../hooks/useGlobalState";

interface GeoAssetHeatMapProps {
  nodes: EdgeNode[];
  workOrders?: CAFMWorkOrder[];
  isDark: boolean;
  onSelectNode?: (node: EdgeNode) => void;
  onCreateWorkOrderForNode?: (nodeId: string) => void;
}

// Fallback coordinate dictionary for major industrial/tech hubs
const CITY_COORDINATES: Record<string, [number, number]> = {
  "frankfurt": [8.6821, 50.1109],
  "paris": [2.3522, 48.8566],
  "lyon": [4.8357, 45.7640],
  "marseille": [5.3698, 43.2965],
  "london": [-0.1276, 51.5074],
  "amsterdam": [4.9041, 52.3676],
  "madrid": [-3.7038, 40.4168],
  "zurich": [8.5417, 47.3769],
  "dublin": [-6.2603, 53.3498],
  "ashburn": [-77.4875, 39.0438],
  "new york": [-74.006, 40.7128],
  "san jose": [-121.8863, 37.3382],
  "los angeles": [-118.2437, 34.0522],
  "dallas": [-96.7970, 32.7767],
  "chicago": [-87.6298, 41.8781],
  "singapore": [103.8198, 1.3521],
  "tokyo": [139.6917, 35.6895],
  "hong kong": [114.1694, 22.3193],
  "seoul": [126.9780, 37.5665],
  "sydney": [151.2093, -33.8688],
  "sao paulo": [-46.6333, -23.5505],
  "johannesburg": [28.0473, -26.2041],
  "dubai": [55.2708, 25.2048],
  "mumbai": [72.8777, 19.0760],
  "toronto": [-79.3832, 43.6532],
};

const resolveCoordinates = (node: EdgeNode): [number, number] => {
  if (typeof node.lng === "number" && typeof node.lat === "number") {
    return [node.lng, node.lat];
  }
  const loc = (node.location || "").toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (loc.includes(key)) return coords;
  }
  return [0, 0];
};

// Safe Error Boundary for Maps SDK
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  onError?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class SafeMapErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Google Maps Platform caught gracefully:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function GeoAssetHeatMap({
  nodes,
  workOrders,
  isDark,
  onSelectNode,
  onCreateWorkOrderForNode
}: GeoAssetHeatMapProps) {
  // Provisioned Google Maps API Key
  const rawKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyA_S4Alz8RAIu2if6izrgyJOPunDCeNmDY").trim();
  const isKeyProvided = Boolean(rawKey && rawKey.length > 15);

  const [mapMode, setMapMode] = useState<"google" | "vector">("google");
  const [googleAuthError, setGoogleAuthError] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<EdgeNode | null>(null);
  const [filterCategory, setFilterCategory] = useState<"all" | "cafm" | "stock" | "hr" | "alert">("all");
  
  // Interactive Metric Attachment Modal State
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSiteData, setNewSiteData] = useState({
    name: "Nouveau Datacenter Edge",
    location: "Paris, FR",
    category: "cafm" as "cafm" | "stock" | "hr" | "edge",
    lat: 48.8566,
    lng: 2.3522,
    stockSku: "SKU-PRO-01 (Processeurs)",
    stockUnits: 12500,
    stockCapacity: 85,
    teamLead: "S. Dupont",
    teamMembers: 12,
    activeShift: 10,
    workOrderTitle: "Supervision CVC & Climatisation",
    pue: 1.12,
    cpuUsage: 35,
    latency: 14,
    status: "active" as EdgeNode["status"]
  });

  // Catch Maps authentication / quota events gracefully
  useEffect(() => {
    const handleQuotaExceeded = () => {
      console.warn("Google Maps quota / auth triggered fallback.");
      setGoogleAuthError(true);
    };

    window.addEventListener("gmp-quota-exceeded", handleQuotaExceeded);
    const originalAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      handleQuotaExceeded();
      if (typeof originalAuthFailure === "function") originalAuthFailure();
    };

    return () => {
      window.removeEventListener("gmp-quota-exceeded", handleQuotaExceeded);
      (window as any).gm_authFailure = originalAuthFailure;
    };
  }, []);

  // Filtered nodes list
  const filteredNodes = nodes.filter(node => {
    if (filterCategory === "all") return true;
    if (filterCategory === "cafm") return node.category === "cafm" || node.workOrderId;
    if (filterCategory === "stock") return node.category === "stock" || Boolean(node.stockUnits);
    if (filterCategory === "hr") return node.category === "hr" || Boolean(node.teamLead);
    if (filterCategory === "alert") return node.status !== "active" || node.cpuUsage >= 75;
    return true;
  });

  // Handle attaching a new site with linked metrics
  const handleSaveAttachedSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const colRef = collection(db, "nodes");
      const docRef = await addDoc(colRef, {
        ...newSiteData,
        ip: `192.168.1.${Math.floor(Math.random() * 200) + 10}`,
        ramUsage: Math.floor(Math.random() * 40) + 30,
        bandwidth: Math.floor(Math.random() * 3000) + 1000,
        uptime: 99.98,
        walletAddress: `cf_0x${Math.floor(Math.random() * 16777215).toString(16).toUpperCase()}`,
        budget: 1500,
        createdAt: new Date().toISOString()
      });
      await updateDoc(doc(db, "nodes", docRef.id), { id: docRef.id });
      await logAuditEvent("SITE_ATTACHED", `Attachement métrique pour ${newSiteData.name} (${newSiteData.location})`);
      setIsAttachModalOpen(false);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du site:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Map Click handler to pick coordinates
  const handleMapClick = (ev: any) => {
    if (ev.detail && ev.detail.latLng) {
      const { lat, lng } = ev.detail.latLng;
      setNewSiteData(prev => ({
        ...prev,
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        location: `Point Géo (${lat.toFixed(2)}, ${lng.toFixed(2)})`
      }));
      setIsAttachModalOpen(true);
    }
  };

  const mapId = isDark ? "8e0a97af9386fef1" : "DEMO_MAP_ID";

  return (
    <div className="w-full rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-white/[0.08] bg-[#0c0c0e]/90 shadow-2xl relative flex flex-col">
      
      {/* Top Header Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                Cartographie Réelle des Infrastructures & Métriques
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-light">
              Visualisation géographique en direct liée aux stocks, ordres de travail CAFM et équipes RH.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Action: Attach new metric site */}
          <button
            onClick={() => setIsAttachModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Attacher / Ajouter un Site</span>
          </button>

          {/* Engine Selector */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] text-xs">
            <button
              onClick={() => setMapMode("google")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                mapMode === "google" && !googleAuthError
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </button>
            <button
              onClick={() => setMapMode("vector")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                mapMode === "vector" || googleAuthError
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Vectoriel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Layer Pills Bar */}
      <div className="px-4 sm:px-5 py-2.5 bg-black/40 border-b border-white/[0.04] flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 flex items-center gap-1 pr-2">
          <Filter className="w-3 h-3" /> Filtrer:
        </span>
        {[
          { id: "all", label: "Tous les Nœuds", count: nodes.length, icon: Globe },
          { id: "cafm", label: "CAFM & Bâtiments", count: nodes.filter(n => n.category === "cafm" || n.workOrderId).length, icon: Building2 },
          { id: "stock", label: "Hubs de Stock", count: nodes.filter(n => n.category === "stock" || n.stockUnits).length, icon: Package },
          { id: "hr", label: "Pôles RH & Leads", count: nodes.filter(n => n.category === "hr" || n.teamLead).length, icon: Users },
          { id: "alert", label: "Alertes / Charge Élevée", count: nodes.filter(n => n.status !== "active" || n.cpuUsage >= 75).length, icon: AlertCircle }
        ].map(filter => {
          const Icon = filter.icon;
          const isSelected = filterCategory === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setFilterCategory(filter.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-white/[0.12] text-white font-medium border border-white/[0.2]"
                  : "bg-white/[0.02] text-neutral-400 hover:text-neutral-200 border border-white/[0.04]"
              }`}
            >
              <Icon className="w-3 h-3 text-orange-400" />
              <span>{filter.label}</span>
              <span className="font-mono text-[9px] px-1.5 py-0.2 rounded-full bg-white/[0.08]">
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[520px] sm:h-[600px] bg-[#08080a] overflow-hidden">
        
        {mapMode === "google" && isKeyProvided && !googleAuthError ? (
          <SafeMapErrorBoundary
            onError={() => {
              setGoogleAuthError(true);
              setMapMode("vector");
            }}
            fallback={
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400 space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-sm font-medium">Affichage automatique en mode carte vectorielle.</p>
                <button
                  onClick={() => setMapMode("vector")}
                  className="px-4 py-2 bg-neutral-800 text-white text-xs rounded-xl hover:bg-neutral-700 transition-colors"
                >
                  Basculer vers la Carte Vectorielle
                </button>
              </div>
            }
          >
            <APIProvider apiKey={rawKey}>
              <Map
                defaultCenter={{ lat: 35, lng: 10 }}
                defaultZoom={3}
                mapId={mapId}
                disableDefaultUI={false}
                gestureHandling="greedy"
                onClick={handleMapClick}
                internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                style={{ width: "100%", height: "100%" }}
              >
                {filteredNodes.map((node) => {
                  const [lng, lat] = resolveCoordinates(node);
                  if (lng === 0 && lat === 0) return null;

                  const isCritical = node.status === "critical" || node.cpuUsage >= 85;
                  const isWarning = node.status === "warning" || (node.cpuUsage >= 70 && node.cpuUsage < 85);
                  const isStockHub = node.category === "stock" || Boolean(node.stockUnits);
                  const isHrHub = node.category === "hr" || Boolean(node.teamLead);
                  
                  // Color coding
                  let pinBg = "#10b981"; // Emerald
                  if (isCritical) pinBg = "#ef4444"; // Red
                  else if (isWarning) pinBg = "#f59e0b"; // Amber
                  else if (isStockHub) pinBg = "#3b82f6"; // Blue
                  else if (isHrHub) pinBg = "#a855f7"; // Purple

                  return (
                    <AdvancedMarker
                      key={node.id}
                      position={{ lat, lng }}
                      onClick={() => setSelectedNode(node)}
                    >
                      <Pin 
                        background={pinBg} 
                        borderColor="#ffffff" 
                        glyphColor="#ffffff"
                        scale={selectedNode?.id === node.id ? 1.25 : 1.0}
                      />
                    </AdvancedMarker>
                  );
                })}

                {/* Rich Info Window with Live Attached Metrics */}
                {selectedNode && (
                  <InfoWindow
                    position={{ 
                      lat: resolveCoordinates(selectedNode)[1], 
                      lng: resolveCoordinates(selectedNode)[0] 
                    }}
                    onCloseClick={() => setSelectedNode(null)}
                  >
                    <div className="p-3 text-neutral-900 dark:text-white max-w-[280px] sm:max-w-[320px] font-sans">
                      
                      {/* Node Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800 mb-2">
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                            {selectedNode.location}
                          </div>
                          <div className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <Server className="w-3.5 h-3.5 text-orange-500" />
                            {selectedNode.name}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium ${
                          selectedNode.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          selectedNode.status === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}>
                          {selectedNode.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Attached ERP Metrics Grid */}
                      <div className="space-y-2 text-xs">
                        
                        {/* Stock Metric */}
                        {selectedNode.stockUnits !== undefined && (
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50">
                            <div className="flex items-center justify-between font-medium text-blue-900 dark:text-blue-200 text-[11px] mb-1">
                              <span className="flex items-center gap-1">
                                <Package className="w-3 h-3 text-blue-500" />
                                Stock & Logistique:
                              </span>
                              <span className="font-mono font-bold">{(selectedNode.stockUnits ?? 0).toLocaleString()} u.</span>
                            </div>
                            <div className="text-[10px] text-blue-700 dark:text-blue-300 truncate">
                              {selectedNode.stockSku || "Composants Électroniques"}
                            </div>
                            <div className="w-full h-1 rounded-full bg-blue-200 dark:bg-blue-900 mt-1 overflow-hidden">
                              <div 
                                className="h-full bg-blue-500" 
                                style={{ width: `${selectedNode.stockCapacity || 75}%` }} 
                              />
                            </div>
                          </div>
                        )}

                        {/* CAFM & Work Order Metric */}
                        {(selectedNode.workOrderTitle || selectedNode.workOrderId) && (
                          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50">
                            <div className="flex items-center justify-between font-medium text-orange-900 dark:text-orange-200 text-[11px]">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-orange-500" />
                                Ordre de Travail CAFM:
                              </span>
                              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                                {selectedNode.workOrderId || "WO-ACTIF"}
                              </span>
                            </div>
                            <div className="text-[10px] text-orange-800 dark:text-orange-300 mt-0.5 truncate">
                              {selectedNode.workOrderTitle || "Maintenance préventive"}
                            </div>
                          </div>
                        )}

                        {/* Personnel & HR Metric */}
                        {selectedNode.teamLead && (
                          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50">
                            <div className="flex items-center justify-between font-medium text-purple-900 dark:text-purple-200 text-[11px]">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-purple-500" />
                                Capital Humain:
                              </span>
                              <span className="font-mono">{selectedNode.activeShift || 8}/{selectedNode.teamMembers || 10} en poste</span>
                            </div>
                            <div className="text-[10px] text-purple-700 dark:text-purple-300 mt-0.5">
                              Lead Technique: <strong className="font-medium">{selectedNode.teamLead}</strong>
                            </div>
                          </div>
                        )}

                        {/* Telemetry Gauge */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                          <div className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-800 flex justify-between">
                            <span className="text-neutral-500">CPU:</span>
                            <span className="font-semibold text-neutral-900 dark:text-white">{selectedNode.cpuUsage}%</span>
                          </div>
                          <div className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-800 flex justify-between">
                            <span className="text-neutral-500">Latence:</span>
                            <span className="font-semibold text-neutral-900 dark:text-white">{selectedNode.latency}ms</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3 flex gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                        <button
                          onClick={() => {
                            if (onSelectNode) onSelectNode(selectedNode);
                            setSelectedNode(null);
                          }}
                          className="flex-1 py-1.5 bg-neutral-900 text-white dark:bg-white dark:text-black rounded-lg text-[11px] font-semibold hover:opacity-90 transition-opacity cursor-pointer text-center"
                        >
                          Détails Dashboard
                        </button>
                        <button
                          onClick={() => {
                            if (onCreateWorkOrderForNode) onCreateWorkOrderForNode(selectedNode.id);
                            setSelectedNode(null);
                          }}
                          className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                          title="Créer un Ordre de Travail"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          </SafeMapErrorBoundary>
        ) : (
          /* High Performance Vector Map Fallback */
          <div className="w-full h-full relative bg-[#06080d] flex items-center justify-center p-4">
            <svg viewBox="0 0 1000 500" className="w-full h-full object-contain opacity-90">
              <defs>
                <radialGradient id="meshGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </radialGradient>
              </defs>
              
              {/* Graticule lines */}
              <g stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="4 4">
                <line x1="0" y1="250" x2="1000" y2="250" />
                <line x1="500" y1="0" x2="500" y2="500" />
                <line x1="250" y1="0" x2="250" y2="500" />
                <line x1="750" y1="0" x2="750" y2="500" />
              </g>

              {/* Vector Continents Minimal Outline */}
              <path 
                d="M150,120 Q200,100 280,140 Q320,180 290,260 Q200,280 160,220 Z M460,110 Q540,90 580,140 Q550,200 480,190 Z M650,120 Q820,100 880,180 Q850,300 700,280 Z"
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1.5"
              />

              {/* Node Vector Points */}
              {filteredNodes.map((node) => {
                const [lng, lat] = resolveCoordinates(node);
                const x = ((lng + 180) / 360) * 1000;
                const y = ((90 - lat) / 180) * 500;
                const isSelected = selectedNode?.id === node.id;

                return (
                  <g key={node.id} onClick={() => setSelectedNode(node)} className="cursor-pointer">
                    <circle cx={x} cy={y} r={isSelected ? "8" : "5"} fill="#f97316" className="animate-pulse" />
                    <circle cx={x} cy={y} r={isSelected ? "14" : "10"} fill="none" stroke="#f97316" strokeWidth="1" opacity="0.6" />
                    <text x={x + 8} y={y + 4} fill="#ffffff" fontSize="10" fontFamily="monospace">
                      {node.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Floating Quick Summary HUD */}
        <div className="absolute top-3 left-3 pointer-events-none hidden sm:flex flex-col gap-1.5 z-10">
          <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/[0.08] text-white text-[11px] font-mono flex items-center gap-2 pointer-events-auto">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            <span>{filteredNodes.length} Sites Cartographiés</span>
          </div>
        </div>

      </div>

      {/* Interactive Modal: Attacher / Ajouter un Site & Associer les Métriques */}
      {isAttachModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#111114] border border-white/[0.12] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  Attacher un Site & Lier les Métriques ERP
                </h3>
                <p className="text-xs text-neutral-400">
                  Associez des données de Stock, de Maintenance CAFM et d'Équipe RH à ce point géographique.
                </p>
              </div>
              <button
                onClick={() => setIsAttachModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAttachedSite} className="space-y-4 text-xs">
              
              {/* Site Name & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Nom du Site / Nœud</label>
                  <input
                    type="text"
                    required
                    value={newSiteData.name}
                    onChange={(e) => setNewSiteData({ ...newSiteData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-hidden focus:border-orange-500"
                    placeholder="Ex: Datacenter Lyon Sud"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Ville / Emplacement</label>
                  <input
                    type="text"
                    required
                    value={newSiteData.location}
                    onChange={(e) => setNewSiteData({ ...newSiteData, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-hidden focus:border-orange-500"
                    placeholder="Ex: Lyon, FR"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono text-[10px]">Latitude (Lat)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newSiteData.lat}
                    onChange={(e) => setNewSiteData({ ...newSiteData, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/[0.06] text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono text-[10px]">Longitude (Lng)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newSiteData.lng}
                    onChange={(e) => setNewSiteData({ ...newSiteData, lng: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/[0.06] text-white font-mono"
                  />
                </div>
              </div>

              {/* Pôle ERP Principal */}
              <div>
                <label className="block text-neutral-400 mb-1">Pôle Principal d'Attachement</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "cafm", label: "CAFM Bâtiment", icon: Building2 },
                    { id: "stock", label: "Stock Logistique", icon: Package },
                    { id: "hr", label: "Équipe & RH", icon: Users }
                  ].map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setNewSiteData({ ...newSiteData, category: cat.id as any })}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                          newSiteData.category === cat.id
                            ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                            : "bg-white/[0.02] text-neutral-400 border border-white/[0.04] hover:bg-white/[0.05]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[10px]">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stock Metric Attachment */}
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-2">
                <div className="font-semibold text-blue-400 flex items-center gap-1.5 text-xs">
                  <Package className="w-3.5 h-3.5" /> Données de Stock Associées
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400">SKU Référencé</label>
                    <input
                      type="text"
                      value={newSiteData.stockSku}
                      onChange={(e) => setNewSiteData({ ...newSiteData, stockSku: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/[0.06] text-white"
                      placeholder="Ex: SKU-PRO-01"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400">Unités en Réserve</label>
                    <input
                      type="number"
                      value={newSiteData.stockUnits}
                      onChange={(e) => setNewSiteData({ ...newSiteData, stockUnits: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/[0.06] text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Personnel HR Metric Attachment */}
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-2">
                <div className="font-semibold text-purple-400 flex items-center gap-1.5 text-xs">
                  <Users className="w-3.5 h-3.5" /> Équipe & Affectation RH
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400">Responsable / Lead</label>
                    <input
                      type="text"
                      value={newSiteData.teamLead}
                      onChange={(e) => setNewSiteData({ ...newSiteData, teamLead: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/[0.06] text-white"
                      placeholder="Ex: S. Dupont"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400">Techniciens en Poste</label>
                    <input
                      type="number"
                      value={newSiteData.activeShift}
                      onChange={(e) => setNewSiteData({ ...newSiteData, activeShift: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/[0.06] text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAttachModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 font-medium transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-lg shadow-orange-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? "Enregistrement..." : "Attacher & Visualiser"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
