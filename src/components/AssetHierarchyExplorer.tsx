import React, { useState } from "react";
import { 
  Building2, 
  Server, 
  ChevronRight, 
  ChevronDown, 
  FolderTree, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Wrench, 
  HardDrive, 
  Zap, 
  Thermometer, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Download, 
  ExternalLink,
  Plus
} from "lucide-react";
import { useLanguage } from "../App";
import { GlobalState, AssetHierarchyItem, CAFMWorkOrder } from "../types";
import { logAuditEvent } from "../hooks/useGlobalState";

interface AssetHierarchyExplorerProps {
  state: GlobalState;
  isDark: boolean;
  onDispatchWorkOrder?: (asset: AssetHierarchyItem) => void;
  onSelectAsset?: (asset: AssetHierarchyItem) => void;
}

export default function AssetHierarchyExplorer({
  state,
  isDark,
  onDispatchWorkOrder,
  onSelectAsset
}: AssetHierarchyExplorerProps) {
  const { language } = useLanguage();

  const defaultHierarchy: AssetHierarchyItem[] = state.assetHierarchy || [
    // Sites
    { id: "site-paris", name: "Europe Core Hub (Paris-CDG)", code: "PAR-01", type: "site", status: "operational", location: "Roissy CDG, France", pueRating: 1.11 },
    { id: "site-fra", name: "Central Europe Edge (Frankfurt-FRA)", code: "FRA-02", type: "site", status: "warning", location: "Frankfurt am Main, Germany", pueRating: 1.14 },
    { id: "site-lhr", name: "UK Gateway Node (London-LHR)", code: "LHR-03", type: "site", status: "operational", location: "Slough Trading Estate, UK", pueRating: 1.18 },
    { id: "site-tyo", name: "APAC Hyperscale (Tokyo-TYO)", code: "TYO-04", type: "site", status: "operational", location: "Koto City, Tokyo, JP", pueRating: 1.12 },

    // Buildings under Paris
    { id: "bld-par-a", parentId: "site-paris", name: "Building Alpha (Main Datacenter)", code: "PAR-BLD-A", type: "building", status: "operational" },
    { id: "bld-par-b", parentId: "site-paris", name: "Building Beta (Power Substation)", code: "PAR-BLD-B", type: "building", status: "operational" },

    // Rooms under Building Alpha
    { id: "room-par-h1", parentId: "bld-par-a", name: "Server Hall 01 (High Density)", code: "HALL-01", type: "room", status: "operational" },
    { id: "room-par-h2", parentId: "bld-par-a", name: "Telecom & Meet-Me-Room", code: "MMR-01", type: "room", status: "operational" },

    // Racks under Server Hall 01
    { id: "rack-par-a01", parentId: "room-par-h1", name: "Rack Bay Alpha-01 (48U Cold Aisle)", code: "RACK-A01", type: "rack", status: "operational" },
    { id: "rack-par-a02", parentId: "room-par-h1", name: "Rack Bay Alpha-02 (48U Cold Aisle)", code: "RACK-A02", type: "rack", status: "warning" },

    // Assets under Rack Bay A01
    { 
      id: "asset-srv-01", 
      parentId: "rack-par-a01", 
      name: "SENSORIUM Edge Blade Server V8-PRO", 
      code: "SRV-EDGE-01", 
      type: "asset", 
      status: "operational",
      serialNumber: "SN-SNS-2026-9812A",
      model: "PowerEdge R760xa Custom Edge Blade",
      manufacturer: "Dell EMC / SENSORIUM OEM",
      installationDate: "2024-03-15",
      warrantyExpiry: "2027-03-15 (Gold 24/7 SLA)",
      contractSLA: "4-Hour On-Site Resolution",
      operatingHours: 14280,
      pueRating: 1.11,
      assignedTechnician: "S. Dupont (Level 3 Field Lead)",
      maintenanceCostTCO: 3420
    },
    { 
      id: "asset-cool-01", 
      parentId: "rack-par-a01", 
      name: "Liebert CRV In-Row Precision Cooling Unit", 
      code: "HVAC-CRV-01", 
      type: "asset", 
      status: "operational",
      serialNumber: "SN-VERTIV-88219-X",
      model: "Liebert CRV 30kW Water Chilled",
      manufacturer: "Vertiv Corporation",
      installationDate: "2023-11-01",
      warrantyExpiry: "2026-11-01",
      contractSLA: "Next Business Day Preventive",
      operatingHours: 19450,
      assignedTechnician: "CAFM HVAC Team",
      maintenanceCostTCO: 5800
    },

    // Assets under Rack Bay A02
    { 
      id: "asset-srv-02", 
      parentId: "rack-par-a02", 
      name: "SENSORIUM Storage Vault 128TB NVMe", 
      code: "SRV-STR-02", 
      type: "asset", 
      status: "warning",
      serialNumber: "SN-SNS-2025-4421B",
      model: "Enterprise Storage Vault U.3 Gen4",
      manufacturer: "Supermicro / Kioxia",
      installationDate: "2024-01-10",
      warrantyExpiry: "2027-01-10",
      contractSLA: "2-Hour High Priority",
      operatingHours: 16120,
      assignedTechnician: "M. Leroy (Storage Admin)",
      maintenanceCostTCO: 4190
    },

    // Sub-components
    {
      id: "comp-nvme-01",
      parentId: "asset-srv-01",
      name: "Primary PCIe 4.0 NVMe 7.68TB Array (RAID-10)",
      code: "COMP-NVME-01",
      type: "component",
      status: "operational",
      serialNumber: "KIOX-768-9901"
    },
    {
      id: "comp-fan-01",
      parentId: "asset-srv-01",
      name: "Dual Redundant 120mm PWM Blower Fan",
      code: "COMP-FAN-01",
      type: "component",
      status: "operational",
      serialNumber: "SANACE-120-44"
    },
    {
      id: "comp-ups-inv",
      parentId: "bld-par-b",
      name: "Eaton 93PM 200kW Modular Inverter Unit",
      code: "PWR-UPS-INV",
      type: "asset",
      status: "operational",
      serialNumber: "EATON-93PM-0082",
      model: "93PM 200kVA Double Conversion",
      manufacturer: "Eaton Power Quality",
      installationDate: "2023-08-14",
      warrantyExpiry: "2028-08-14",
      contractSLA: "Critical 2-Hour SLA",
      operatingHours: 23500,
      assignedTechnician: "C. Martin (Electrical Lead)",
      maintenanceCostTCO: 8900
    }
  ];

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "site-paris": true,
    "bld-par-a": true,
    "room-par-h1": true,
    "rack-par-a01": true
  });

  const [selectedAssetId, setSelectedAssetId] = useState<string>("asset-srv-01");

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedAsset = defaultHierarchy.find(item => item.id === selectedAssetId) || defaultHierarchy[0];

  const getStatusBadge = (status: AssetHierarchyItem["status"]) => {
    switch (status) {
      case "operational":
        return <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> {language === "fr" ? "Opérationnel" : "Operational"}</span>;
      case "warning":
        return <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3" /> {language === "fr" ? "Attention" : "Warning"}</span>;
      case "critical":
        return <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3" /> {language === "fr" ? "Critique" : "Critical"}</span>;
      case "maintenance":
        return <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full"><Wrench className="w-3 h-3" /> {language === "fr" ? "En Maintenance" : "In Maintenance"}</span>;
    }
  };

  const getTypeIcon = (type: AssetHierarchyItem["type"]) => {
    switch (type) {
      case "site": return <Building2 className="w-4 h-4 text-orange-500" />;
      case "building": return <Layers className="w-4 h-4 text-blue-500" />;
      case "datacenter":
      case "room": return <Server className="w-4 h-4 text-purple-500" />;
      case "rack": return <Layers className="w-4 h-4 text-indigo-500" />;
      case "asset": return <Cpu className="w-4 h-4 text-emerald-500" />;
      case "component": return <HardDrive className="w-4 h-4 text-amber-500" />;
    }
  };

  // Helper recursive tree builder
  const renderTree = (parentId?: string, depth = 0) => {
    const children = defaultHierarchy.filter(item => item.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <div className="space-y-1">
        {children.map(item => {
          const hasChildren = defaultHierarchy.some(child => child.parentId === item.id);
          const isExpanded = !!expandedNodes[item.id];
          const isSelected = selectedAssetId === item.id;

          return (
            <div key={item.id} className="select-none">
              <div
                onClick={() => setSelectedAssetId(item.id)}
                style={{ paddingLeft: `${Math.max(8, depth * 16)}px` }}
                className={`flex items-center justify-between py-1.5 pr-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-orange-500/10 dark:bg-orange-500/15 border-orange-500/30 text-orange-700 dark:text-orange-300 font-bold"
                    : "hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-neutral-300 border-transparent"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {hasChildren ? (
                    <button
                      onClick={(e) => toggleExpand(item.id, e)}
                      className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  ) : (
                    <span className="w-4" />
                  )}
                  {getTypeIcon(item.type)}
                  <span className="truncate">{item.name}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500">{item.code}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    item.status === "operational" ? "bg-emerald-500" :
                    item.status === "warning" ? "bg-amber-500" : "bg-red-500"
                  }`} />
                </div>
              </div>

              {hasChildren && isExpanded && renderTree(item.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  // Associated simulated work orders for this asset
  const associatedWorkOrders = (state.workOrders || []).filter(wo => wo.nodeId.toLowerCase().includes(selectedAsset.code.toLowerCase().slice(0, 3)) || wo.nodeId === "cdg-2");

  return (
    <div className="space-y-6">
      
      {/* Top Description Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-orange-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === "fr" ? "Arborescence & Fiches de Vie Patrimoine" : "Asset Hierarchy & Lifecycle Explorer"}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            {language === "fr" 
              ? "Hiérarchie multidimensionnelle Site → Bâtiment → Salle → Baie → Machine → Composant avec fiches techniques et historiques de maintenance."
              : "Enterprise multi-tier topological navigation with technical specification sheets, SLA warranty contracts, and operational history."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setExpandedNodes({
                "site-paris": true,
                "site-fra": true,
                "site-lhr": true,
                "site-tyo": true,
                "bld-par-a": true,
                "bld-par-b": true,
                "room-par-h1": true,
                "rack-par-a01": true,
                "rack-par-a02": true
              });
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111114] text-xs font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            {language === "fr" ? "Tout Déplier" : "Expand All"}
          </button>
        </div>
      </div>

      {/* Main Split Layout: Tree on Left, Fiche de Vie on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Tree Navigator (4 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/[0.08] p-4 shadow-xs flex flex-col h-[650px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3 mb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              {language === "fr" ? "Topologie des Actifs" : "Asset Topology Tree"}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {defaultHierarchy.length} {language === "fr" ? "éléments" : "nodes"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-1">
            {renderTree(undefined, 0)}
          </div>
        </div>

        {/* Right Column: Fiche Technique & Fiche de Vie (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/[0.08] p-6 shadow-xs space-y-6">
            
            {/* Asset Header Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.06] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] font-mono text-[11px] font-bold text-slate-700 dark:text-neutral-300">
                    {selectedAsset.code}
                  </span>
                  {getStatusBadge(selectedAsset.status)}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedAsset.name}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onDispatchWorkOrder) onDispatchWorkOrder(selectedAsset);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{language === "fr" ? "Créer un Ordre de Travail" : "Dispatch Work Order"}</span>
                </button>
              </div>
            </div>

            {/* Technical Specifications Grid */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono mb-3">
                {language === "fr" ? "Fiche Technique & Paramètres Industriels" : "Technical Specifications & SLA Contract"}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <span className="text-[11px] text-slate-400 block">{language === "fr" ? "Numéro de Série" : "Serial Number"}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedAsset.serialNumber || "SN-OEM-GENERIC"}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <span className="text-[11px] text-slate-400 block">{language === "fr" ? "Constructeur OEM" : "Manufacturer"}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedAsset.manufacturer || "Enterprise Hardware Corp"}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <span className="text-[11px] text-slate-400 block">{language === "fr" ? "Modèle" : "Model Designation"}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedAsset.model || "Custom Industrial Blade"}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <span className="text-[11px] text-slate-400 block">{language === "fr" ? "Heures de Fonctionnement" : "Operating Hours Counter"}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    {(selectedAsset.operatingHours || 12450).toLocaleString()} h
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <span className="text-[11px] text-slate-400 block">{language === "fr" ? "Contrat de Garantie & SLA" : "Warranty SLA Expiry"}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedAsset.warrantyExpiry || "2027-12-31 (Active)"}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <span className="text-[11px] text-slate-400 block">{language === "fr" ? "Coût Cumulé Maintenance (TCO)" : "Cumulative TCO Cost"}</span>
                  <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{(selectedAsset.maintenanceCostTCO || 2800).toLocaleString()} €</span>
                </div>
              </div>
            </div>

            {/* Historical Maintenance Interventions Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono mb-3">
                {language === "fr" ? "Historique des Interventions & Bons de Travail" : "Intervention Lifecycle & Service History"}
              </h4>

              <div className="space-y-2 text-xs">
                {associatedWorkOrders.length > 0 ? (
                  associatedWorkOrders.map(wo => (
                    <div 
                      key={wo.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{wo.title}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white/[0.1] text-slate-700 dark:text-neutral-300 uppercase">
                            {wo.priority}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {language === "fr" ? "Assigné à : " : "Assigned to: "} <strong>{wo.assignedTo}</strong> • {new Date(wo.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        wo.status === "resolved" 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      }`}>
                        {wo.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-white/[0.08] text-center text-slate-400 text-xs">
                    {language === "fr" 
                      ? "Aucune panne majeure enregistrée. Maintenance préventive à jour."
                      : "No critical failure recorded. Preventive maintenance up to date."}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
