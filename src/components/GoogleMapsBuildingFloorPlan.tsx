import React, { useState } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { 
  Building2, 
  Server, 
  Zap, 
  Thermometer, 
  Fan, 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  X, 
  Layers, 
  Clock, 
  Cpu, 
  Compass,
  ArrowUpRight,
  Database,
  Radio
} from "lucide-react";
import { GlobalState } from "../types";
import { logAuditEvent } from "../hooks/useGlobalState";
import { useLanguage } from "../App";

interface GoogleMapsBuildingFloorPlanProps {
  state?: GlobalState;
  isDark?: boolean;
}

interface MachineAsset {
  id: string;
  code: string;
  name: string;
  category: "compute" | "power" | "cooling" | "network" | "sensor";
  room: string;
  status: "active" | "warning" | "critical" | "maintenance";
  temperature: number; // °C
  powerKw: number;
  loadPercentage: number;
  latOffset: number; // geographic offset relative to Frankfurt facility center
  lngOffset: number;
  maintenanceHistory: {
    date: string;
    type: string;
    technician: string;
    description: string;
    status: string;
  }[];
  nextScheduled: string;
  specs: {
    model: string;
    serial: string;
    manufacturer: string;
    redundancy: string;
  };
}

const FACILITY_CENTER = { lat: 50.1109, lng: 8.6821 }; // Frankfurt FRA-1

const FACILITY_ASSETS: MachineAsset[] = [
  {
    id: "asset-01",
    code: "RCK-A01",
    name: "Compute Rack Alpha 01 (Anycast Edge POP)",
    category: "compute",
    room: "Cleanroom A (HPC)",
    status: "active",
    temperature: 21.4,
    powerKw: 12.4,
    loadPercentage: 78,
    latOffset: 0.00012,
    lngOffset: 0.00015,
    maintenanceHistory: [
      { date: "2026-08-14", type: "Remplacement bloc d'alimentation", technician: "Marc V.", description: "Échange standard bloc PS-500W suite alerte redondance A.", status: "Terminé" },
      { date: "2026-05-10", type: "Maintenance Préventive Semestrielle", technician: "Équipe SRE Frankfurt", description: "Dépoussiérage filtres à air et vérification connectique fibre.", status: "Terminé" }
    ],
    nextScheduled: "2026-11-14",
    specs: { model: "Open Compute Project OCP Yosemite V3", serial: "OCP-Y3-9921", manufacturer: "Quanta / Meta", redundancy: "N+1" }
  },
  {
    id: "asset-02",
    code: "UPS-A01",
    name: "Central Static UPS Inverter 500kVA",
    category: "power",
    room: "Technical Basement - UPS Room A",
    status: "active",
    temperature: 22.4,
    powerKw: 185.0,
    loadPercentage: 42,
    latOffset: -0.00018,
    lngOffset: -0.00022,
    maintenanceHistory: [
      { date: "2026-07-20", type: "Test de charge batteries VRLA", technician: "Schneider Electric Service", description: "Décharge simulée 80% pendant 30 min. Autonomie validée (14.2 min).", status: "Terminé" },
      { date: "2026-02-11", type: "Étalonnage redresseur", technician: "Jean-Marc P.", description: "Calibration des sondes de tension DC bus.", status: "Terminé" }
    ],
    nextScheduled: "2027-01-20",
    specs: { model: "Schneider Galaxy VXL 500kW", serial: "SCH-GVXL-500", manufacturer: "Schneider Electric", redundancy: "2N" }
  },
  {
    id: "asset-03",
    code: "CHL-01",
    name: "InRow Precision Cooling Chiller Unit #1",
    category: "cooling",
    room: "Perimeter Cooling Gallery",
    status: "warning",
    temperature: 28.9,
    powerKw: 34.2,
    loadPercentage: 89,
    latOffset: 0.00025,
    lngOffset: -0.00015,
    maintenanceHistory: [
      { date: "2026-09-02", type: "Recharge fluide frigorigène R410A", technician: "Climatherm GmbH", description: "Colmatage micro-fuite sur vanne d'expansion et appoint de gaz.", status: "Terminé" },
      { date: "2026-04-15", type: "Nettoyage échangeur thermique", technician: "Alex K.", description: "Détartrage serpentin condenseur extérieur.", status: "Terminé" }
    ],
    nextScheduled: "2026-10-02",
    specs: { model: "Vertiv Liebert Airflow Direct Expansion 120kW", serial: "VRT-DX-120", manufacturer: "Vertiv", redundancy: "N+1" }
  },
  {
    id: "asset-04",
    code: "ODF-01",
    name: "Main High-Density Optical Distribution Frame",
    category: "network",
    room: "Meet-Me Room (MMR)",
    status: "active",
    temperature: 19.5,
    powerKw: 2.1,
    loadPercentage: 28,
    latOffset: 0.00005,
    lngOffset: 0.00028,
    maintenanceHistory: [
      { date: "2026-06-11", type: "Certification liaisons MPO-12", technician: "Corning Field Ops", description: "Test réflectométrique OTDR sur liaisons inter-bâtiments Frankfurt IX.", status: "Terminé" }
    ],
    nextScheduled: "2027-06-11",
    specs: { model: "Corning EDGE HD High-Density Fiber Housing", serial: "CN-EDGE-88", manufacturer: "Corning", redundancy: "2N" }
  },
  {
    id: "asset-05",
    code: "SENS-THERM-04",
    name: "Hotspot Thermal Sensor Aisle B-4",
    category: "sensor",
    room: "Cleanroom B (Storage & AI)",
    status: "critical",
    temperature: 33.5,
    powerKw: 0.02,
    loadPercentage: 95,
    latOffset: 0.00018,
    lngOffset: 0.00008,
    maintenanceHistory: [
      { date: "2026-09-18", type: "Alerte Thermique Critique", technician: "Auto-IoT Dispatch", description: "Détection point chaud localisé à 33.5°C au rack d'archivage NVMe.", status: "En cours" }
    ],
    nextScheduled: "2026-09-20",
    specs: { model: "Sensaphone IoT Mesh Multi-Sensor", serial: "SP-MESH-04", manufacturer: "Sensaphone", redundancy: "N+1" }
  }
];

export default function GoogleMapsBuildingFloorPlan({ state, isDark = true }: GoogleMapsBuildingFloorPlanProps) {
  const { language } = useLanguage();
  const rawKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyA_S4Alz8RAIu2if6izrgyJOPunDCeNmDY").trim();
  const isKeyProvided = Boolean(rawKey && rawKey.length > 15);

  const [mapMode, setMapMode] = useState<"map" | "floorplan">("map");
  const [selectedAsset, setSelectedAsset] = useState<MachineAsset | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const filteredAssets = filterCategory === "all" 
    ? FACILITY_ASSETS 
    : FACILITY_ASSETS.filter(a => a.category === filterCategory);

  const handleCreateWorkOrder = async (asset: MachineAsset) => {
    await logAuditEvent("WORK_ORDER_CREATED", language === "fr" ? `Intervention de maintenance déclenchée pour la machine ${asset.code} (${asset.name})` : `Maintenance intervention triggered for machine ${asset.code} (${asset.name})`);
    triggerToast(language === "fr" ? `🛠️ Ordre de travail créé avec succès pour ${asset.code} !` : `🛠️ Work order successfully created for ${asset.code}!`);
    setSelectedAsset(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden border border-indigo-900/40">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider border border-indigo-500/30">
                {language === "fr" ? "Intégration Google Maps • Plan d'Aménagement Top-Down" : "Google Maps Integration • Top-Down Building Floor Plan"}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {language === "fr" ? "Plan d'Aménagement Bâtiment & Machines en Direct" : "Building Floor Plan & Live Machine Telemetry"}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-1">
              {language === "fr"
                ? "Visualisez l'implantation top-down du Datacenter Frankfurt FRA-1 via Google Maps, avec des marqueurs interactifs affichant la santé temps réel et l'historique de maintenance de chaque machine."
                : "Visualize the top-down layout of Frankfurt FRA-1 Datacenter via Google Maps, with interactive markers displaying real-time health and maintenance history for each machine."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700 flex items-center">
              <button
                onClick={() => setMapMode("map")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mapMode === "map" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                {language === "fr" ? "Google Maps Bâtiment" : "Google Maps Building"}
              </button>
              <button
                onClick={() => setMapMode("floorplan")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mapMode === "floorplan" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {language === "fr" ? "Plan 2D Top-Down" : "2D Top-Down Floor Plan"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-lg flex items-center justify-between animate-fadeIn">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-white hover:text-slate-200 ml-4 font-bold">×</button>
        </div>
      )}

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-xs font-mono text-slate-500 uppercase">{language === "fr" ? "Filtrer Machine :" : "Filter Machine:"}</span>
        {[
          { id: "all", label: language === "fr" ? "Tous les Actifs" : "All Assets", count: FACILITY_ASSETS.length },
          { id: "compute", label: language === "fr" ? "Serveurs & Racks" : "Servers & Racks", count: FACILITY_ASSETS.filter(a => a.category === "compute").length },
          { id: "power", label: language === "fr" ? "Alimentation UPS" : "UPS Power", count: FACILITY_ASSETS.filter(a => a.category === "power").length },
          { id: "cooling", label: language === "fr" ? "Climatisation" : "Cooling Chillers", count: FACILITY_ASSETS.filter(a => a.category === "cooling").length },
          { id: "sensor", label: language === "fr" ? "Capteurs IoT" : "IoT Sensors", count: FACILITY_ASSETS.filter(a => a.category === "sensor").length }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              filterCategory === cat.id
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800"
            }`}
          >
            <span>{cat.label}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/10 dark:bg-white/10">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Main Map / Floor Plan Canvas Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left / Main Interactive Canvas (Google Maps or Top-Down CAD View) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden flex flex-col h-[520px]">
          
          <div className="p-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between bg-slate-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {mapMode === "map" ? "Google Maps — Frankfurt FRA-1 Campus & Cleanroom" : "Plan Top-Down Bâtiment 2D (CAD & Machines)"}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Télémétrie Active
            </span>
          </div>

          <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
            {mapMode === "map" && isKeyProvided ? (
              <APIProvider apiKey={rawKey}>
                <Map
                  defaultCenter={FACILITY_CENTER}
                  defaultZoom={18}
                  mapId={isDark ? "8e0a97af9386fef1" : "DEMO_MAP_ID"}
                  disableDefaultUI={false}
                  gestureHandling="greedy"
                  style={{ width: "100%", height: "100%" }}
                >
                  {filteredAssets.map(asset => {
                    const lat = FACILITY_CENTER.lat + asset.latOffset;
                    const lng = FACILITY_CENTER.lng + asset.lngOffset;
                    
                    let pinBg = "#10b981"; // active
                    if (asset.status === "critical") pinBg = "#ef4444";
                    else if (asset.status === "warning") pinBg = "#f59e0b";
                    else if (asset.status === "maintenance") pinBg = "#6366f1";

                    return (
                      <AdvancedMarker
                        key={asset.id}
                        position={{ lat, lng }}
                        onClick={() => setSelectedAsset(asset)}
                      >
                        <Pin
                          background={pinBg}
                          borderColor="#ffffff"
                          glyphColor="#ffffff"
                          scale={selectedAsset?.id === asset.id ? 1.3 : 1.1}
                        />
                      </AdvancedMarker>
                    );
                  })}

                  {selectedAsset && (
                    <InfoWindow
                      position={{
                        lat: FACILITY_CENTER.lat + selectedAsset.latOffset,
                        lng: FACILITY_CENTER.lng + selectedAsset.lngOffset
                      }}
                      onCloseClick={() => setSelectedAsset(null)}
                    >
                      <div className="p-3 text-slate-900 dark:text-white max-w-xs font-sans text-xs space-y-2">
                        <div className="font-bold text-sm flex items-center gap-1.5">
                          <Server className="w-4 h-4 text-indigo-500" />
                          {selectedAsset.name}
                        </div>
                        <div className="text-slate-500 font-mono text-[10px]">{selectedAsset.room} • Code: {selectedAsset.code}</div>
                        <div className="flex items-center gap-3 py-1 font-mono">
                          <span>Temp: <strong className={selectedAsset.temperature > 28 ? "text-red-500" : "text-emerald-500"}>{selectedAsset.temperature}°C</strong></span>
                          <span>Charge: <strong>{selectedAsset.loadPercentage}%</strong></span>
                        </div>
                        <button
                          onClick={() => setSelectedAsset(selectedAsset)}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs"
                        >
                          Voir l'Historique de Maintenance
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            ) : (
              /* Top-Down CAD Floor Plan View */
              <div className="w-full h-full relative p-8 flex items-center justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
                
                {/* Building Blueprint Box */}
                <div className="w-full max-w-2xl h-[400px] rounded-2xl border-2 border-dashed border-indigo-500/40 bg-slate-900/80 backdrop-blur-md p-6 relative flex flex-col justify-between shadow-2xl">
                  
                  <div className="absolute top-3 left-4 text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                    Frankfurt FRA-1 Flagship — Cleanroom & Power Hall Top-Down Layout
                  </div>

                  {/* Rooms Grid */}
                  <div className="grid grid-cols-2 gap-4 my-auto">
                    <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/60 relative">
                      <div className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Cleanroom A (HPC)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {filteredAssets.filter(a => a.room.includes("Cleanroom A")).map(asset => (
                          <button
                            key={asset.id}
                            onClick={() => setSelectedAsset(asset)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 ${
                              asset.status === "critical" ? "bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse" :
                              asset.status === "warning" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                              "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            }`}
                          >
                            <Server className="w-3 h-3" />
                            {asset.code} ({asset.temperature}°C)
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/60 relative">
                      <div className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" /> Power & UPS Hall
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {filteredAssets.filter(a => a.room.includes("UPS") || a.room.includes("Cooling")).map(asset => (
                          <button
                            key={asset.id}
                            onClick={() => setSelectedAsset(asset)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 ${
                              asset.status === "warning" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                              "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            }`}
                          >
                            {asset.category === "power" ? <Zap className="w-3 h-3" /> : <Fan className="w-3 h-3" />}
                            {asset.code} ({asset.powerKw} kW)
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 text-center font-mono">
                    Cliquez sur n'importe quel actif machine pour inspecter sa télémétrie en direct et son historique de maintenance.
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Selected Machine Detail, Real-time Health Status & Maintenance History */}
        <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-5 flex flex-col justify-between">
          {selectedAsset ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-neutral-800">
                <div>
                  <span className="text-[10px] font-mono text-indigo-500 uppercase tracking-wider">{selectedAsset.room}</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-500" />
                    {selectedAsset.name}
                  </h3>
                </div>
                <button onClick={() => setSelectedAsset(null)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
              </div>

              {/* Real-time Health Status */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">Santé & Télémétrie en Direct</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-center">
                    <div className="text-[10px] text-slate-500">Température</div>
                    <div className={`text-sm font-bold font-mono ${selectedAsset.temperature > 28 ? "text-red-500" : "text-emerald-500"}`}>
                      {selectedAsset.temperature}°C
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-center">
                    <div className="text-[10px] text-slate-500">Puissance</div>
                    <div className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {selectedAsset.powerKw} kW
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-center">
                    <div className="text-[10px] text-slate-500">Charge</div>
                    <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                      {selectedAsset.loadPercentage}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-1 text-xs bg-slate-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-slate-200 dark:border-neutral-800">
                <div className="font-semibold text-slate-800 dark:text-neutral-200 mb-1">Spécifications Matériel</div>
                <div className="flex justify-between text-slate-600 dark:text-neutral-400"><span>Modèle:</span> <span className="font-mono text-slate-900 dark:text-white">{selectedAsset.specs.model}</span></div>
                <div className="flex justify-between text-slate-600 dark:text-neutral-400"><span>N° de Série:</span> <span className="font-mono text-slate-900 dark:text-white">{selectedAsset.specs.serial}</span></div>
                <div className="flex justify-between text-slate-600 dark:text-neutral-400"><span>Redondance:</span> <span className="font-mono text-slate-900 dark:text-white">{selectedAsset.specs.redundancy}</span></div>
              </div>

              {/* Maintenance History */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">Historique de Maintenance</span>
                  <span className="text-[10px] font-mono text-slate-400">Prochaine: {selectedAsset.nextScheduled}</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedAsset.maintenanceHistory.map((hist, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-mono text-[10px] text-indigo-500">
                        <span>{hist.date} • {hist.type}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{hist.status}</span>
                      </div>
                      <div className="text-slate-700 dark:text-neutral-300">{hist.description}</div>
                      <div className="text-[10px] text-slate-400 italic">Technicien: {hist.technician}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleCreateWorkOrder(selectedAsset)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                Déclencher une Intervention / Ordre de Travail
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3 my-auto">
              <Compass className="w-10 h-10 text-indigo-500/40 animate-pulse" />
              <div className="text-sm font-bold text-slate-700 dark:text-neutral-300">Aucun Actif Sélectionné</div>
              <p className="text-xs text-slate-500 max-w-xs">
                Cliquez sur un marqueur sur la carte Google Maps ou sur le plan 2D top-down pour afficher la télémétrie de santé et l'historique de maintenance de la machine.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Campus Francfort FRA-1</span>
            <span className="font-mono text-indigo-500">5 machines surveillées</span>
          </div>
        </div>

      </div>
    </div>
  );
}
