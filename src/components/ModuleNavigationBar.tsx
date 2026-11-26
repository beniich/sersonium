import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, SlidersHorizontal } from "lucide-react";

export interface ModuleTab {
  id: string;
  label: string;
  path?: string;
}

export const MODULE_TABS: ModuleTab[] = [
  { id: "ov-agent-orbit", label: "🤖 36 Agents IA Orbit", path: "/dashboard" },
  { id: "ov-general", label: "Vue Globale ERP", path: "/dashboard" },
  { id: "ov-glass", label: "✨ Vision Dashboard", path: "/dashboard" },
  { id: "site-viewer", label: "🌐 Vitrine & Solutions", path: "/site-viewer" },
  { id: "ov-asset-hub", label: "Fiche Actifs 360°", path: "/dashboard" },
  { id: "cockpit", label: "Jumeau 3D", path: "/cockpit" },
  { id: "robotics", label: "🤖 Flotte AMR", path: "/robotics" },
  { id: "esg-carbon", label: "⚡ Énergie BESS", path: "/compliance/esg" },
  { id: "compute", label: "Silicon X1", path: "/compute" },
  { id: "compliance", label: "Conformité DORA", path: "/compliance/dora" },
  { id: "pricing", label: "💎 Tarifs & Forfaits", path: "/pricing" },
  { id: "ov-telemetry", label: "Télémétrie", path: "/dashboard" },
  { id: "ov-cafm", label: "GMAO & Actifs", path: "/dashboard" },
  { id: "ov-erp-portlets", label: "Command Center", path: "/dashboard" },
  { id: "ov-perf", label: "Métriques", path: "/dashboard" },
  { id: "ov-floorplan", label: "Plan 2D", path: "/dashboard" },
];

export interface ModuleNavigationBarProps {
  activeTab?: string;
  activePage?: string;
  onSelectTab?: (tabId: string) => void;
  onOpenAiStudio?: () => void;
  isCompactMode?: boolean;
  onToggleCompactMode?: () => void;
  className?: string;
}

export const ModuleNavigationBar: React.FC<ModuleNavigationBarProps> = ({
  activeTab = "ov-agent-orbit",
  activePage = "overview",
  onSelectTab,
  onOpenAiStudio,
  isCompactMode = false,
  onToggleCompactMode,
  className = ""
}) => {
  const navigate = useNavigate();

  const handleTabClick = (tab: ModuleTab) => {
    if (onSelectTab) {
      onSelectTab(tab.id);
    }
    if (tab.path) {
      navigate(tab.path);
    }
  };

  return (
    <div className={`w-full bg-[#111317] border-b border-white/[0.08] px-3 sm:px-4.5 py-2 flex items-center justify-between gap-3 shrink-0 ${className}`}>
      {/* Pills Container without any grey scrollbars */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth p-1 bg-[#181A1F] rounded-full border border-white/[0.06]">
        {MODULE_TABS.map((tab) => {
          const isSelected = activeTab === tab.id || (activePage === tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "bg-white text-[#111317] font-semibold shadow-xs"
                  : "text-[#8E929C] hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right Tools : AI Studio Pill + Compact View */}
      <div className="flex items-center gap-2 shrink-0 pl-2">
        {onOpenAiStudio && (
          <button
            onClick={onOpenAiStudio}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer border ${
              activePage === "ai-studio"
                ? "bg-purple-600 text-white border-purple-500 font-semibold shadow-xs"
                : "bg-purple-950/30 text-purple-300 border-purple-800/40 hover:bg-purple-900/40 hover:text-white"
            }`}
            title="Studio d'Artefacts & Copilote IA"
          >
            <Sparkles className="w-3 h-3 text-purple-300" />
            <span className="hidden sm:inline">Copilote IA</span>
          </button>
        )}

        {onToggleCompactMode && (
          <button
            onClick={onToggleCompactMode}
            className={`p-1.5 rounded-full border transition-all cursor-pointer text-xs ${
              isCompactMode
                ? "bg-[#E5FA52]/20 text-[#E5FA52] border-[#E5FA52]/40"
                : "bg-white/[0.04] text-[#8E929C] border-white/[0.08] hover:text-white hover:bg-white/[0.08]"
            }`}
            title={isCompactMode ? "Mode Normal" : "Mode Compact"}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
    </div>
  );
};

export default ModuleNavigationBar;
