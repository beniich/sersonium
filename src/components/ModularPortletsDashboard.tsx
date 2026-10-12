import React, { useState } from "react";
import { 
  AlertTriangle, 
  Cpu, 
  ShieldCheck, 
  Wrench, 
  FileText, 
  GripVertical, 
  ExternalLink, 
  Layers, 
  Zap, 
  RefreshCw,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Building2,
  Table,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { GlobalState, EdgeNode } from "../types";

export type PortletId = "alerts" | "tokens" | "sovereignty" | "quickactions" | "datagrid";

export interface PortletConfig {
  id: PortletId;
  title: string;
  category: string;
  defaultVisible: boolean;
}

const AVAILABLE_PORTLETS: PortletConfig[] = [
  { id: "alerts", title: "Portlet 1 : Alertes Critiques & Pannes", category: "Sécurité & CMMS", defaultVisible: true },
  { id: "tokens", title: "Portlet 2 : Consommation Jetons & Quota IA", category: "Gouvernance Cloud", defaultVisible: true },
  { id: "sovereignty", title: "Portlet 3 : Nœuds Edge & Souveraineté", category: "Infrastructure", defaultVisible: true },
  { id: "quickactions", title: "Portlet 4 : Actions Rapides Opérationnelles", category: "Productivité", defaultVisible: true },
  { id: "datagrid", title: "Portlet 5 : Grille de Données Haute Densité (Excel-like)", category: "ERP NetSuite", defaultVisible: true },
];

interface ModularPortletsDashboardProps {
  state: GlobalState;
  isDark?: boolean;
  isCompactMode?: boolean;
  onNavigateTab?: (tabId: string) => void;
  onSelectNode?: (node: EdgeNode) => void;
  onOpenReportModal?: () => void;
}

export const ModularPortletsDashboard: React.FC<ModularPortletsDashboardProps> = ({
  state,
  isDark = true,
  isCompactMode = false,
  onNavigateTab,
  onSelectNode,
  onOpenReportModal
}) => {
  // Ordered Portlets state with localStorage persistence
  const [portletOrder, setPortletOrder] = useState<PortletId[]>(() => {
    try {
      const saved = localStorage.getItem("sensorium_portlet_order");
      if (saved) return JSON.parse(saved);
    } catch {}
    return ["alerts", "tokens", "sovereignty", "quickactions", "datagrid"];
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const movePortlet = (fromIdx: number, toIdx: number) => {
    const updated = [...portletOrder];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setPortletOrder(updated);
    try {
      localStorage.setItem("sensorium_portlet_order", JSON.stringify(updated));
    } catch {}
  };

  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;
    movePortlet(draggedIndex, idx);
    setDraggedIndex(idx);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const nodes = state?.nodes || [];
  const criticalNodes = nodes.filter(n => (n.status as string) !== "active" || (n.cpuUsage && n.cpuUsage > 75)).slice(0, 5);

  return (
    <div className="w-full space-y-4">
      {/* Portlets Controls Bar */}
      <div className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
        isDark ? "bg-[#0b0d13] border-white/10" : "bg-white border-slate-200 shadow-xs"
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-mono text-orange-500 font-bold uppercase tracking-wider text-[11px]">
            Centre de Commandement NetSuite ERP
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 dark:text-neutral-400">
            Portlets modulaires glissables-déposables (Drag &amp; Drop)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const defaultOrder: PortletId[] = ["alerts", "tokens", "sovereignty", "quickactions", "datagrid"];
              setPortletOrder(defaultOrder);
              localStorage.setItem("sensorium_portlet_order", JSON.stringify(defaultOrder));
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Réinitialiser la disposition</span>
          </button>
        </div>
      </div>

      {/* Grid of Portlets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {portletOrder.map((portletId, index) => {
          return (
            <div
              key={portletId}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`rounded-xl border transition-all duration-150 ${
                isDark ? "bg-[#0b0d13] border-white/10" : "bg-white border-slate-200 shadow-xs"
              } ${draggedIndex === index ? "opacity-40 border-orange-500 scale-[0.99]" : ""} ${
                portletId === "datagrid" ? "md:col-span-2" : ""
              }`}
            >
              {/* Portlet Header with Drag Handle */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-orange-500">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <h3 className="font-sans font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {AVAILABLE_PORTLETS.find(p => p.id === portletId)?.title}
                  </h3>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {AVAILABLE_PORTLETS.find(p => p.id === portletId)?.category}
                </span>
              </div>

              {/* Portlet Content */}
              <div className="p-4">
                {/* 1. Alerte Critique Portlet */}
                {portletId === "alerts" && (
                  <div className="space-y-2.5">
                    {criticalNodes.length > 0 ? (
                      criticalNodes.map(node => (
                        <div 
                          key={node.id} 
                          className="flex items-center justify-between p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-mono"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                            <div className="truncate">
                              <span className="font-bold text-slate-900 dark:text-white">{node.name || node.id}</span>
                              <span className="text-slate-400 block text-[10px]">{node.location} • Charge: {node.cpuUsage}%</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (onSelectNode) onSelectNode(node);
                              if (onNavigateTab) onNavigateTab("ov-asset-hub");
                            }}
                            className="px-2 py-1 rounded bg-rose-500 text-white text-[10px] font-bold hover:bg-rose-600 transition-colors shrink-0"
                          >
                            Diagnostiquer
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs font-mono text-emerald-500 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        ✓ Aucune anomalie critique — Tous les équipements tertiaires opèrent nominalement.
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Consommation IA & Tokens Portlet */}
                {portletId === "tokens" && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Quota Utilisé (Mois en cours) :</span>
                      <strong className="text-slate-800 dark:text-white">14 250 / 50 000 Tokens IA</strong>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" style={{ width: "28.5%" }} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2 rounded bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                        <span className="text-[10px] text-slate-400 uppercase">Prédictions Pannes</span>
                        <div className="text-sm font-bold text-slate-800 dark:text-white">9 420 req</div>
                      </div>
                      <div className="p-2 rounded bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                        <span className="text-[10px] text-slate-400 uppercase">Optimisations CVC</span>
                        <div className="text-sm font-bold text-slate-800 dark:text-white">4 830 req</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Souveraineté & Nœuds Edge */}
                {portletId === "sovereignty" && (
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10">
                      <span>Nœuds Edge Chiffrés HSM :</span>
                      <strong className="text-emerald-500 font-bold">{nodes.length} Nœuds Actifs</strong>
                    </div>
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10">
                      <span>Règlement DORA UE :</span>
                      <strong className="text-emerald-500 font-bold">100% Conforme</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Adduction Réseau :</span>
                      <strong className="text-slate-800 dark:text-white">Double Fibre POP Paris/Lyon</strong>
                    </div>
                  </div>
                )}

                {/* 4. Actions Rapides Portlet */}
                {portletId === "quickactions" && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onNavigateTab && onNavigateTab("ov-cafm")}
                      className="p-3 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Créer Bon de Travail</span>
                    </button>
                    <button
                      onClick={() => onOpenReportModal && onOpenReportModal()}
                      className="p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Rapport DORA / A4</span>
                    </button>
                    <button
                      onClick={() => onNavigateTab && onNavigateTab("ov-asset-hub")}
                      className="p-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Fiche Asset 360°</span>
                    </button>
                    <button
                      onClick={() => onNavigateTab && onNavigateTab("ov-floorplan")}
                      className="p-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Plan 2D Interactif</span>
                    </button>
                  </div>
                )}

                {/* 5. Grille de Données Haute Densité (Excel-like NetSuite) */}
                {portletId === "datagrid" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead className="border-b border-slate-200 dark:border-white/10 text-slate-400 bg-slate-50/50 dark:bg-white/[0.02]">
                        <tr>
                          <th className="py-1.5 px-2">ID Nœud</th>
                          <th className="py-1.5 px-2">Équipement</th>
                          <th className="py-1.5 px-2">Emplacement</th>
                          <th className="py-1.5 px-2">Statut</th>
                          <th className="py-1.5 px-2">CPU</th>
                          <th className="py-1.5 px-2">RAM</th>
                          <th className="py-1.5 px-2">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                        {nodes.slice(0, 6).map(n => (
                          <tr key={n.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="py-1.5 px-2 font-bold text-orange-500">{n.id}</td>
                            <td className="py-1.5 px-2 text-slate-800 dark:text-white">{n.name || n.type}</td>
                            <td className="py-1.5 px-2 text-slate-500">{n.location}</td>
                            <td className="py-1.5 px-2">
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                (n.status as string) === "active" || (n.status as string) === "online"
                                  ? "bg-emerald-500/10 text-emerald-500" 
                                  : "bg-rose-500/10 text-rose-500"
                              }`}>
                                {n.status}
                              </span>
                            </td>
                            <td className="py-1.5 px-2">{n.cpuUsage}%</td>
                            <td className="py-1.5 px-2">{n.ramUsage ?? n.memoryUsage ?? 0}%</td>
                            <td className="py-1.5 px-2">
                              <button
                                onClick={() => {
                                  if (onSelectNode) onSelectNode(n);
                                  if (onNavigateTab) onNavigateTab("ov-asset-hub");
                                }}
                                className="text-orange-500 hover:underline font-bold text-[10px]"
                              >
                                Ouvrir Fiche →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModularPortletsDashboard;
