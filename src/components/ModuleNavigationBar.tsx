import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, SlidersHorizontal } from "lucide-react";

export interface ModuleTab {
  id: string;
  label: string;
  path?: string;
}

export const MODULE_TABS: ModuleTab[] = [
  { id: "ov-general", label: "Vue Globale", path: "/dashboard" },
  { id: "ov-asset-hub", label: "Fiche Actifs 360°", path: "/dashboard" },
  { id: "cockpit", label: "Jumeau 3D", path: "/cockpit" },
  { id: "compute", label: "Silicon X1", path: "/compute" },
  { id: "ov-telemetry", label: "Télémétrie", path: "/dashboard" },
  { id: "compliance", label: "Conformité DORA", path: "/compliance/dora" },
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
  activeTab = "ov-general",
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
    if (tab.path && tab.id === "cockpit" || tab.id === "compute" || tab.id === "compliance") {
      navigate(tab.path);
    }
  };

  return (
    <div className={`w-full bg-[#0f111a] border-b border-gray-800 px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 shrink-0 ${className}`}>
      {/* Pills Container without any grey scrollbars */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
        {MODULE_TABS.map((tab) => {
          const isSelected = activeTab === tab.id || (activePage === tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? "bg-indigo-600 text-white font-semibold border-indigo-500 shadow-sm"
                  : "bg-gray-800/80 text-gray-400 hover:bg-gray-700/90 hover:text-white border-gray-700/60"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right Tools : AI Studio Pill + Compact View */}
      <div className="flex items-center gap-1.5 shrink-0 pl-2">
        {onOpenAiStudio && (
          <button
            onClick={onOpenAiStudio}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer border ${
              activePage === "ai-studio"
                ? "bg-purple-600 text-white border-purple-500 font-semibold shadow-sm"
                : "bg-purple-950/40 text-purple-300 border-purple-800/50 hover:bg-purple-900/50 hover:text-white"
            }`}
            title="Studio d'Artefacts & Copilote IA"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">Copilote IA</span>
          </button>
        )}

        {onToggleCompactMode && (
          <button
            onClick={onToggleCompactMode}
            className={`p-1.5 rounded-full border transition-all cursor-pointer text-xs ${
              isCompactMode
                ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                : "bg-gray-800/80 text-gray-400 border-gray-700/60 hover:text-white"
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
