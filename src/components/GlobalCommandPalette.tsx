import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Search, 
  Server, 
  FileText, 
  AlertTriangle, 
  Building2, 
  Compass, 
  ExternalLink, 
  ArrowRight, 
  Cpu, 
  ShieldCheck, 
  Command, 
  X,
  Layers,
  Sparkles,
  Zap,
  Globe
} from "lucide-react";
import { GlobalState, EdgeNode } from "../types";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Equipement / Node" | "Module Cockpit" | "Rapport & Action" | "Alerte & Incident";
  icon: React.ElementType;
  page?: string;
  tabId?: string;
  badge?: string;
  action: () => void;
}

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  state: GlobalState;
  onNavigatePage: (page: string, itemId?: string) => void;
  onSelectNode?: (node: EdgeNode) => void;
  onOpenReportModal?: () => void;
}

export const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({
  isOpen,
  onClose,
  state,
  onNavigatePage,
  onSelectNode,
  onOpenReportModal
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery("");
    }
  }, [isOpen]);

  // Indexing items from state and application features
  const allItems = useMemo<SearchResultItem[]>(() => {
    const list: SearchResultItem[] = [];

    // 1. Modules & Pages Principales
    const pages = [
      { id: "overview", title: "Vue d'ensemble / Cockpit", subtitle: "Centre de commandement unifié et portlets", page: "overview", tabId: "ov-general", icon: Layers, badge: "Dashboard" },
      { id: "portlets", title: "Centre de Commandement (Portlets)", subtitle: "Mode Portlets ERP modulaires drag & drop", page: "overview", tabId: "ov-erp-portlets", icon: LayoutPortletIcon, badge: "ERP" },
      { id: "asset-hub", title: "Fiche Asset Unifiée 360°", subtitle: "Dossier machine maître avec onglets technique, télémétrie, DORA", page: "overview", tabId: "ov-asset-hub", icon: Building2, badge: "Master File" },
      { id: "infrastructure", title: "Infrastructure & Nœuds Edge", subtitle: "Inventaire complet et inspection des baies", page: "infrastructure", icon: Server, badge: "Infra" },
      { id: "compute", title: "Silicon Compute & IA", subtitle: "Accélération TPU / GPU et consommation de jetons", page: "compute", icon: Cpu, badge: "AI Compute" },
      { id: "network", title: "Topologie Réseau & POPs", subtitle: "Latences réseau, tunnels BGP & routage", page: "network", icon: Globe, badge: "Network" },
      { id: "security", title: "Sécurité & Audit DORA / NIS2", subtitle: "Conformité réglementaire et ZTNA", page: "security", icon: ShieldCheck, badge: "Compliance" },
      { id: "telemetry", title: "Télémétrie Sub-seconde Kafka", subtitle: "Flux de données et métriques IoT industrielles", page: "telemetry", icon: Zap, badge: "Kafka" },
      { id: "pricing", title: "Plans & Abonnements Enterprise", subtitle: "Gérer l'accréditation, la licence et la facturation", page: "pricing", icon: Sparkles, badge: "Billing" },
    ];

    pages.forEach(p => {
      list.push({
        id: `page-${p.id}`,
        title: p.title,
        subtitle: p.subtitle,
        category: "Module Cockpit",
        icon: p.icon,
        badge: p.badge,
        action: () => {
          onNavigatePage(p.page, p.tabId);
          onClose();
        }
      });
    });

    // 2. Équipements / Nœuds Edge (dynamique depuis le state)
    const nodes = state?.nodes || [];
    nodes.forEach(node => {
      list.push({
        id: `node-${node.id}`,
        title: `${node.name || node.id} — ${node.location || 'Site Central'}`,
        subtitle: `Type: ${node.type || 'Edge Appliance'} • Charge: ${node.cpuUsage ?? 25}% • Statut: ${node.status}`,
        category: "Equipement / Node",
        icon: Server,
        badge: node.status,
        action: () => {
          if (onSelectNode) onSelectNode(node);
          onNavigatePage("infrastructure", "node-detail");
          onClose();
        }
      });
    });

    // 3. Actions Rapides & Rapports
    list.push({
      id: "act-report-dora",
      title: "Générer Rapport Exécutif DORA & CSRD",
      subtitle: "Exportation PDF A4 haute définition pour commissaires aux comptes",
      category: "Rapport & Action",
      icon: FileText,
      badge: "PDF Export",
      action: () => {
        if (onOpenReportModal) onOpenReportModal();
        onClose();
      }
    });

    list.push({
      id: "act-new-workorder",
      title: "Créer un Bon de Travail / Ordre de Maintenance",
      subtitle: "Affectation aux équipes d'astreinte et journal CMMS",
      category: "Rapport & Action",
      icon: Building2,
      badge: "GMAO",
      action: () => {
        onNavigatePage("overview", "ov-cafm");
        onClose();
      }
    });

    // 4. Alertes Critiques Récentes
    const alerts = state?.securityAlerts || [];
    alerts.forEach((alt, idx) => {
      list.push({
        id: `alert-${idx}`,
        title: alt.title || alt.message || "Alerte de Sécurité",
        subtitle: `Sévérité: ${alt.severity || 'High'} • Source: ${alt.source || 'ZTNA Edge Guard'}`,
        category: "Alerte & Incident",
        icon: AlertTriangle,
        badge: alt.severity || "Alerte",
        action: () => {
          onNavigatePage("security", "alerts");
          onClose();
        }
      });
    });

    return list;
  }, [state, onNavigatePage, onSelectNode, onOpenReportModal, onClose]);

  // Filtrage selon la requête
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems.slice(0, 8); // afficher les 8 actions les plus fréquentes par défaut

    return allItems.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [allItems, query]);

  // Gestion du clavier (Flèche Haut, Bas, Entrée, Echap)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredResults.length - 1));
      } else if (e.key === "Enter" && filteredResults[selectedIndex]) {
        e.preventDefault();
        filteredResults[selectedIndex].action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-white/10 gap-3">
          <Search className="w-5 h-5 text-slate-400 dark:text-neutral-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Tapez un équipement, client, rapport, alerte ou commande... (ex: Pompe 01, DORA, Node)"
            className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 font-sans"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="hidden sm:inline text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-500 border border-slate-200 dark:border-white/[0.08]">
              ESC
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredResults.length > 0 ? (
            filteredResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 text-slate-900 dark:text-white shadow-xs" 
                      : "hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-neutral-300 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isSelected 
                        ? "bg-orange-500 text-white" 
                        : "bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-neutral-400"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-white/[0.06]">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-neutral-500 hidden sm:inline">
                      {item.category}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? "text-orange-500" : "opacity-0"}`} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 dark:text-neutral-500 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Aucun résultat correspondant à "{query}"</p>
              <p className="text-[11px] opacity-70 mt-1">Essayez avec un mot-clé générique comme "Node", "DORA", "Alerte" ou "Stock".</p>
            </div>
          )}
        </div>

        {/* Command Palette Footer Shortcut Hints */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-black/30 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 font-mono">
          <div className="flex items-center gap-3">
            <span><strong className="text-slate-700 dark:text-white">↑↓</strong> Naviguer</span>
            <span><strong className="text-slate-700 dark:text-white">↵</strong> Ouvrir</span>
            <span><strong className="text-slate-700 dark:text-white">ESC</strong> Fermer</span>
          </div>
          <span className="text-orange-500 font-semibold flex items-center gap-1">
            <Command className="w-3 h-3" /> SENSORIUM Omniprésence
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper icon
function LayoutPortletIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export default GlobalCommandPalette;
