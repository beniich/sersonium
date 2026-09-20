import React, { useState } from "react";
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Package, 
  ShieldAlert, 
  Smartphone, 
  ChevronRight, 
  AlertTriangle, 
  Flame, 
  Snowflake, 
  MapPin, 
  CheckSquare, 
  FileText, 
  Search, 
  Plus, 
  Radio, 
  ArrowLeft,
  Camera,
  Layers,
  Sparkles,
  Wifi,
  WifiOff,
  User,
  History,
  X
} from "lucide-react";
import { useLanguage } from "../App";
import { GlobalState, CAFMWorkOrder, SparePart, MaintenanceChecklistItem, AssetHierarchyItem } from "../types";
import WorkOrderExecutionModal from "./WorkOrderExecutionModal";
import { logAuditEvent } from "../hooks/useGlobalState";

interface MobileFieldTechnicianProps {
  state: GlobalState;
  isDark: boolean;
  onExitMobileMode?: () => void;
}

export default function MobileFieldTechnician({
  state,
  isDark,
  onExitMobileMode
}: MobileFieldTechnicianProps) {
  const { language } = useLanguage();
  
  // Navigation tabs for the mobile field interface
  const [mobileTab, setMobileTab] = useState<"assigned_wo" | "qr_scanner" | "asset_lookup" | "quick_parts">("assigned_wo");
  
  // Selected Work Order to execute
  const [activeExecutionWO, setActiveExecutionWO] = useState<CAFMWorkOrder | null>(null);
  
  // QR code scanning simulation state
  const [isScanning, setIsScanning] = useState(false);
  const [scannedAssetCode, setScannedAssetCode] = useState<string>("");
  const [detectedAsset, setDetectedAsset] = useState<any | null>(null);
  
  // Search query for assets
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter for assigned technician
  const [technicianFilter, setTechnicianFilter] = useState<string>("all");
  
  // Quick quick-incident report modal
  const [showQuickIncidentModal, setShowQuickIncidentModal] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState("");
  const [incidentPriority, setIncidentPriority] = useState<"p1" | "p2" | "p3">("p2");
  const [incidentNode, setIncidentNode] = useState("FRA-EDGE-01");

  const workOrders: CAFMWorkOrder[] = state.workOrders || [];
  const spareParts: SparePart[] = state.spareParts || [];

  // Filter work orders
  const pendingOrders = workOrders.filter(wo => wo.status !== "resolved");
  const resolvedOrders = workOrders.filter(wo => wo.status === "resolved");

  // Simulated QR Code Scan
  const handleSimulateScan = (code: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedAssetCode(code);
      
      // Look for asset in state
      if (code.includes("RACK-A1") || code.includes("SRV-01")) {
        setDetectedAsset({
          tag: code,
          name: "Dell PowerEdge R760 (Rack A01-U12)",
          status: "warning",
          temp: "42.8°C",
          mtbf: "1,485 hrs",
          location: "Data Hall 1 > Row A > Bay 01",
          pendingWO: pendingOrders.find(w => w.nodeId?.includes("FRA") || w.nodeId?.includes("01")) || null
        });
      } else if (code.includes("HVAC-01") || code.includes("CRAC")) {
        setDetectedAsset({
          tag: code,
          name: "Schneider Uniflair CRAC Air Cooling #1",
          status: "critical",
          temp: "54.2°C (Exhaust)",
          mtbf: "2,200 hrs",
          location: "Data Hall 1 > Cooling Corridor East",
          pendingWO: pendingOrders.find(w => w.priority === "p1") || null
        });
      } else {
        setDetectedAsset({
          tag: code,
          name: `Generic Asset Module (${code})`,
          status: "healthy",
          temp: "31.0°C",
          mtbf: "1,200 hrs",
          location: "Facility Room 2B",
          pendingWO: null
        });
      }
    }, 1200);
  };

  const handleCreateQuickIncident = async () => {
    if (!incidentTitle) return;
    
    const newWO: CAFMWorkOrder = {
      id: `WO-${Date.now().toString().slice(-4)}`,
      title: incidentTitle,
      priority: incidentPriority,
      status: "open",
      assignedTo: "Yassine S. (Level 3 Field Lead)",
      nodeId: incidentNode,
      createdAt: new Date().toISOString(),
      checklist: [
        { id: "chk-1", task: "Sécurisation périmètre & coupure circuit si requis", done: false },
        { id: "chk-2", task: "Diagnostic télémétrie in-situ & vérification sondes", done: false },
        { id: "chk-3", task: "Remplacement composant et re-test thermique", done: false }
      ]
    };

    if (!state.workOrders) state.workOrders = [];
    state.workOrders.unshift(newWO);

    await logAuditEvent(
      "FIELD_MOBILE_INCIDENT_REPORTED",
      `Mobile Field Ticket ${newWO.id} created for node ${incidentNode}: ${incidentTitle}`
    );

    setShowQuickIncidentModal(false);
    setIncidentTitle("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-20">
      
      {/* Top Mobile App Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-white/[0.08] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-orange-400">GMAO FIELD OPS</span>
              <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            <h1 className="text-sm font-bold text-white">Technicien Mobile 4.0</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onExitMobileMode && (
            <button
              onClick={onExitMobileMode}
              className="px-2.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-[11px] font-medium text-neutral-300 border border-white/[0.1] transition-colors cursor-pointer"
            >
              {language === "fr" ? "Vue Bureau" : "Desktop"}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area based on Selected Tab */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full space-y-4">

        {/* Tab 1: Work Orders / Interventions */}
        {mobileTab === "assigned_wo" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Quick Status Bar */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
                <span className="text-xl font-bold font-mono text-orange-400">{pendingOrders.length}</span>
                <p className="text-[10px] text-neutral-400 font-medium">{language === "fr" ? "À Traiter" : "Pending"}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
                <span className="text-xl font-bold font-mono text-red-400">
                  {pendingOrders.filter(w => w.priority === "p1").length}
                </span>
                <p className="text-[10px] text-neutral-400 font-medium">{language === "fr" ? "Urgent P1" : "Critical"}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
                <span className="text-xl font-bold font-mono text-emerald-400">{resolvedOrders.length}</span>
                <p className="text-[10px] text-neutral-400 font-medium">{language === "fr" ? "Clôturés" : "Done"}</p>
              </div>
            </div>

            {/* Quick action button: Declare incident on the fly */}
            <button
              onClick={() => setShowQuickIncidentModal(true)}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === "fr" ? "+ Déclarer une Panne / Alerte Terrain" : "+ Report Field Incident"}</span>
            </button>

            {/* Work Orders List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono font-semibold px-1">
                <span>{language === "fr" ? "BONS D'INTERVENTION TERRAIN" : "FIELD WORK ORDERS"}</span>
                <span>{pendingOrders.length} {language === "fr" ? "actifs" : "active"}</span>
              </div>

              {pendingOrders.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-medium text-white">{language === "fr" ? "Aucune intervention en attente !" : "All work orders completed!"}</p>
                  <p className="text-[11px] text-neutral-400">{language === "fr" ? "Toutes les baies et équipements sont au statut nominal." : "All systems operate within nominal range."}</p>
                </div>
              ) : (
                pendingOrders.map(wo => {
                  const isP1 = wo.priority === "p1";
                  return (
                    <div 
                      key={wo.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        isP1 
                          ? "bg-red-500/10 border-red-500/30" 
                          : "bg-white/[0.03] border-white/[0.08]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/[0.1] text-neutral-300 uppercase">
                              {wo.id}
                            </span>
                            <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              isP1 
                                ? "bg-red-500/20 text-red-400 border-red-500/30" 
                                : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                            }`}>
                              {wo.priority}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white leading-snug">{wo.title}</h3>
                        </div>
                      </div>

                      {/* Location & Node Badge */}
                      <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{wo.nodeId}</span>
                        </div>
                        {wo.assignedTo && (
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-neutral-500" />
                            <span className="truncate max-w-[120px]">{wo.assignedTo}</span>
                          </div>
                        )}
                      </div>

                      {/* AI Diagnostic Summary if available */}
                      {wo.aiAnalysis && (
                        <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-200 flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{wo.aiAnalysis}</span>
                        </div>
                      )}

                      {/* Execution CTA Button */}
                      <button
                        onClick={() => setActiveExecutionWO(wo)}
                        className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                      >
                        <Wrench className="w-4 h-4" />
                        <span>{language === "fr" ? "Exécuter, Déstocker & Clôturer" : "Execute, Deduct Parts & Sign"}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Mobile QR / Barcode Scanner */}
        {mobileTab === "qr_scanner" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-orange-400" />
                  <span>{language === "fr" ? "Scanner QR Code d'Équipement" : "Field QR Asset Scanner"}</span>
                </h3>
                <span className="text-[10px] font-mono text-neutral-400">CAMERA API</span>
              </div>

              {/* Camera viewfinder simulation */}
              <div className="relative aspect-video rounded-xl bg-slate-900 border border-white/[0.1] overflow-hidden flex flex-col items-center justify-center">
                {isScanning ? (
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-mono text-orange-400 animate-pulse">{language === "fr" ? "Analyse du tag RFID/QR..." : "Analyzing QR Code..."}</p>
                  </div>
                ) : (
                  <div className="text-center space-y-3 p-4">
                    <div className="w-24 h-24 border-2 border-dashed border-orange-500/60 rounded-2xl mx-auto flex items-center justify-center">
                      <Camera className="w-8 h-8 text-orange-400/80" />
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {language === "fr" ? "Pointez la caméra vers le tag collé sur la baie ou le serveur." : "Point camera at QR asset badge on rack or chassis."}
                    </p>
                  </div>
                )}

                {/* Animated scan bar */}
                {isScanning && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-orange-500 shadow-[0_0_12px_#f97316] animate-bounce" />
                )}
              </div>

              {/* Sample QR Triggers */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-neutral-400 block">{language === "fr" ? "Simulation rapide de scan :" : "Simulate scan tag:"}</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSimulateScan("QR-RACK-A01-SRV-01")}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-left text-xs font-mono text-neutral-200 border border-white/[0.06] cursor-pointer"
                  >
                    🏷️ Rack A01 / Server 01
                  </button>
                  <button
                    onClick={() => handleSimulateScan("QR-HVAC-CRAC-01")}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-left text-xs font-mono text-neutral-200 border border-white/[0.06] cursor-pointer"
                  >
                    ❄️ Climatisation CRAC #1
                  </button>
                </div>
              </div>
            </div>

            {/* Detected Asset Details Card */}
            {detectedAsset && (
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-orange-500/20 pb-2">
                  <span className="font-mono text-xs font-bold text-orange-400">{detectedAsset.tag}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                    {detectedAsset.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-white">{detectedAsset.name}</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">{detectedAsset.location}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-neutral-400 text-[10px] block">{language === "fr" ? "Température" : "Temperature"}</span>
                    <span className="font-mono font-bold text-orange-400">{detectedAsset.temp}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-neutral-400 text-[10px] block">MTBF Estimé</span>
                    <span className="font-mono font-bold text-emerald-400">{detectedAsset.mtbf}</span>
                  </div>
                </div>

                {/* Direct Action based on Scanned Asset */}
                {detectedAsset.pendingWO ? (
                  <button
                    onClick={() => setActiveExecutionWO(detectedAsset.pendingWO)}
                    className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>{language === "fr" ? "Ouvrir l'Ordre de Travail Associé" : "Open Linked Work Order"}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIncidentTitle(`Vérification terrain sur ${detectedAsset.name}`);
                      setIncidentNode(detectedAsset.tag);
                      setShowQuickIncidentModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/[0.1] hover:bg-white/[0.2] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === "fr" ? "Créer une Intervention sur cet Équipement" : "Create New Work Order for Asset"}</span>
                  </button>
                )}
              </div>
            )}

          </div>
        )}

        {/* Tab 3: Spare Parts Quick Look */}
        {mobileTab === "quick_parts" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono font-semibold px-1">
              <span>{language === "fr" ? "MAGASIN PIÈCES DE RECHANGE" : "SPARE PARTS INVENTORY"}</span>
              <span>{spareParts.length} {language === "fr" ? "références" : "SKUs"}</span>
            </div>

            <div className="space-y-2.5">
              {spareParts.map(part => {
                const isLow = part.quantityInStock <= part.minThreshold;
                return (
                  <div 
                    key={part.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isLow 
                        ? "bg-amber-500/10 border-amber-500/30" 
                        : "bg-white/[0.03] border-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-orange-400">{part.sku}</span>
                          <span className="text-[10px] text-neutral-400">Emplacement: {part.locationWarehouse}</span>
                        </div>
                        <h4 className="font-bold text-xs text-white mt-0.5">{part.name}</h4>
                      </div>

                      <div className="text-right">
                        <span className={`text-base font-bold font-mono ${isLow ? "text-amber-400" : "text-white"}`}>
                          {part.quantityInStock}
                        </span>
                        <span className="text-[10px] text-neutral-400 block">{language === "fr" ? "en stock" : "in stock"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[11px] text-neutral-400">
                      <span>Coût : {part.unitCost} €</span>
                      <span>Délai : {part.leadTimeDays} {language === "fr" ? "jours" : "days"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* Persistent Bottom Mobile Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/[0.1] px-2 py-2 flex items-center justify-around max-w-lg mx-auto">
        
        {/* Tab 1: Work Orders */}
        <button
          onClick={() => setMobileTab("assigned_wo")}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
            mobileTab === "assigned_wo" ? "text-orange-400 font-bold" : "text-neutral-400 hover:text-white"
          }`}
        >
          <div className="relative">
            <Wrench className="w-5 h-5" />
            {pendingOrders.length > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                {pendingOrders.length}
              </span>
            )}
          </div>
          <span className="text-[10px]">{language === "fr" ? "Interventions" : "Orders"}</span>
        </button>

        {/* Tab 2: QR Scanner */}
        <button
          onClick={() => setMobileTab("qr_scanner")}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
            mobileTab === "qr_scanner" ? "text-orange-400 font-bold" : "text-neutral-400 hover:text-white"
          }`}
        >
          <QrCode className="w-5 h-5" />
          <span className="text-[10px]">{language === "fr" ? "Scan QR" : "Scan QR"}</span>
        </button>

        {/* Tab 3: Spare Parts */}
        <button
          onClick={() => setMobileTab("quick_parts")}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
            mobileTab === "quick_parts" ? "text-orange-400 font-bold" : "text-neutral-400 hover:text-white"
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px]">{language === "fr" ? "Pièces" : "Parts"}</span>
        </button>

      </nav>

      {/* Execution Modal for active Work Order */}
      {activeExecutionWO && (
        <WorkOrderExecutionModal
          workOrder={activeExecutionWO}
          state={state}
          isDark={isDark}
          onClose={() => setActiveExecutionWO(null)}
          onComplete={(updatedWO) => {
            if (state.workOrders) {
              const idx = state.workOrders.findIndex(w => w.id === updatedWO.id);
              if (idx >= 0) {
                state.workOrders[idx] = updatedWO;
              }
            }
            setActiveExecutionWO(null);
          }}
        />
      )}

      {/* Quick Incident Report Floating Modal */}
      {showQuickIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-white/[0.15] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>{language === "fr" ? "Nouvelle Alerte Terrain" : "Report Field Anomaly"}</span>
              </h3>
              <button onClick={() => setShowQuickIncidentModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  {language === "fr" ? "Description du problème :" : "Issue Description:"}
                </label>
                <input
                  type="text"
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  placeholder="e.g. Surchauffe Baie B03 ou Bruit Ventilateur"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/[0.1] text-white outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    {language === "fr" ? "Priorité :" : "Priority:"}
                  </label>
                  <select
                    value={incidentPriority}
                    onChange={(e) => setIncidentPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/[0.1] text-white outline-none"
                  >
                    <option value="p1">P1 - Critique (Urgent)</option>
                    <option value="p2">P2 - Élevée</option>
                    <option value="p3">P3 - Normale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    {language === "fr" ? "Équipement / Node :" : "Node Tag:"}
                  </label>
                  <input
                    type="text"
                    value={incidentNode}
                    onChange={(e) => setIncidentNode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/[0.1] text-white font-mono outline-none"
                  >
                  </input>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowQuickIncidentModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.1] text-xs font-semibold text-neutral-300"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateQuickIncident}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Créer l'OT
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
