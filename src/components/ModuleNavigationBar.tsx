import React from "react";
import { 
  LayoutDashboard, 
  Building2, 
  Layers, 
  TrendingUp, 
  Compass, 
  Globe, 
  Package, 
  Users,
  Sparkles
} from "lucide-react";

export interface ModuleTab {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const MODULE_TABS: ModuleTab[] = [
  { id: "ov-erp-portlets", label: "⚡ Command Center (Portlets ERP)", icon: LayoutDashboard },
  { id: "ov-asset-hub", label: "🏢 Fiche Asset Unifiée 360°", icon: Building2 },
  { id: "ov-general", label: "Chart.js Cockpit", icon: Layers },
  { id: "ov-perf", label: "Performance Metrics", icon: TrendingUp },
  { id: "ov-hybrid", label: "Convergence View", icon: Layers },
  { id: "ov-floorplan", label: "2D Building Floorplan", icon: Compass },
  { id: "ov-map", label: "POP Cartography", icon: Globe },
  { id: "ov-cafm", label: "Maintenance & CMMS", icon: Building2 },
  { id: "ov-stock", label: "Inventory & Hardware", icon: Package },
  { id: "ov-hr", label: "Staff & On-Call Shifts", icon: Users },
];

export interface ModuleNavigationBarProps {
  activeTab?: string;
  activePage?: string;
  onSelectTab: (tabId: string) => void;
  onOpenAiStudio?: () => void;
  isCompactMode?: boolean;
  onToggleCompactMode?: () => void;
  className?: string;
}

export default function ModuleNavigationBar({
  activeTab = "ov-general",
  activePage = "overview",
  onSelectTab,
  onOpenAiStudio,
  isCompactMode = false,
  onToggleCompactMode,
  className = ""
}: ModuleNavigationBarProps) {
  const isOverview = activePage === "overview";

  return (
    <div 
      className={`sticky top-0 z-30 w-full shrink-0 px-2.5 sm:px-4 lg:px-5 py-2.5 bg-[#f8fafc]/95 dark:bg-[#070709]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-2 overflow-x-auto shadow-sm no-scrollbar transition-colors duration-200 ${className}`}
      role="navigation"
      aria-label="Navigation des modules"
    >
      <div className="flex items-center gap-1.5 shrink-0">
        {MODULE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = isOverview && activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
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

      {/* Actions à droite : Bouton IDE Artefacts IA + Bascule Mode Compact */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onOpenAiStudio && (
          <button
            onClick={onOpenAiStudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
              activePage === "ai-studio"
                ? "bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-xs border-transparent"
                : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 hover:bg-purple-500/20"
            }`}
            title="Ouvrir le Studio d'Artefacts & Copilote IDE IA"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>🤖 IDE Artefacts IA</span>
          </button>
        )}

        {/* Compact ERP Mode Toggle Button */}
        {onToggleCompactMode && (
          <button
            onClick={onToggleCompactMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono shrink-0 transition-all cursor-pointer border ${
              isCompactMode 
                ? "bg-orange-500 text-white border-orange-600 font-bold shadow-xs" 
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white"
            }`}
            title="Bascule entre le mode Standard espacé et le mode Opérationnel Compact NetSuite"
          >
            <span>{isCompactMode ? "⚡ Mode Compact ERP (Actif)" : "📐 Mode Standard (Espacé)"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
