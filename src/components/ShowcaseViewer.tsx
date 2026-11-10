import React, { useState, useEffect } from "react";
import { 
  Globe, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Calculator, 
  Code2, 
  FileText, 
  Users, 
  Layers, 
  ArrowRight, 
  Maximize2,
  RefreshCw,
  LayoutDashboard
} from "lucide-react";

export interface ShowcasePageMeta {
  id: string;
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: string;
  category: "presentation" | "technique" | "commercial" | "legal";
}

export const SHOWCASE_PAGES: ShowcasePageMeta[] = [
  { id: "solutions", title: "Solutions Métiers", url: "/site/solutions.html", icon: Layers, badge: "Hub", category: "presentation" },
  { id: "sectors", title: "Secteurs d'Activité", url: "/site/sector_solutions.html", icon: Globe, category: "presentation" },
  { id: "pillars", title: "6 Piliers Industriels", url: "/site/piliers_industriels.html", icon: Sparkles, badge: "Socle", category: "technique" },
  { id: "architecture", title: "Topologie Système", url: "/site/architecture.html", icon: Layers, category: "technique" },
  { id: "demo", title: "Démonstrateur Live", url: "/site/demo.html", icon: Sparkles, badge: "Interactif", category: "presentation" },
  { id: "roi", title: "Simulateur ROI & Gains", url: "/site/benefices_roi.html", icon: Calculator, badge: "Finance", category: "commercial" },
  { id: "developers", title: "Documentation APIs", url: "/site/developers.html", icon: Code2, badge: "Dev", category: "technique" },
  { id: "security", title: "Livre Blanc Sécurité", url: "/site/securite.html", icon: ShieldCheck, badge: "DORA/FIPS", category: "technique" },
  { id: "tarifs", title: "Grille Tarifaire", url: "/site/tarifs.html", icon: Calculator, category: "commercial" },
  { id: "reviews", title: "Témoignages Clients", url: "/site/temoignages.html", icon: Users, category: "commercial" },
  { id: "lifecycle", title: "Cycle de Vie Jumeau", url: "/site/digital_twin_lifecycle.html", icon: Layers, category: "technique" },
  { id: "legal", title: "Mentions & RGPD", url: "/site/mentions-legales.html", icon: FileText, category: "legal" }
];

interface ShowcaseViewerProps {
  initialPageId?: string;
  isDark?: boolean;
  onNavigateToCockpit?: () => void;
}

export const ShowcaseViewer: React.FC<ShowcaseViewerProps> = ({
  initialPageId = "solutions",
  isDark = true,
  onNavigateToCockpit
}) => {
  const [activePageId, setActivePageId] = useState<string>(initialPageId);
  const [iframeKey, setIframeKey] = useState<number>(0);

  useEffect(() => {
    if (initialPageId && initialPageId !== activePageId) {
      // Map itemId if prefixed
      const cleanId = initialPageId.replace(/^showcase-/, "");
      const match = SHOWCASE_PAGES.find(p => p.id === cleanId || p.id === initialPageId);
      if (match) {
        setActivePageId(match.id);
      }
    }
  }, [initialPageId]);

  const currentPage = SHOWCASE_PAGES.find(p => p.id === activePageId) || SHOWCASE_PAGES[0];

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(currentPage.url, "_blank");
  };

  return (
    <div className={`w-full flex flex-col rounded-2xl border transition-all overflow-hidden ${
      isDark ? "bg-[#0b0c10] border-white/10 shadow-2xl" : "bg-white border-slate-200 shadow-lg"
    }`}>
      {/* ─── EN-TÊTE DE NAVIGATION UNIFIÉE DE LA VITRINE ─── */}
      <div className={`p-3 sm:p-4 border-b flex flex-col gap-3 ${
        isDark ? "bg-[#0f1118] border-white/10" : "bg-slate-50 border-slate-200"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-500 shrink-0">
              <Globe className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-sans">
                  {currentPage.title}
                </h2>
                {currentPage.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 font-semibold">
                    {currentPage.badge}
                  </span>
                )}
                <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400 hidden md:inline">
                  {currentPage.url}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Documentation institutionnelle, portails de présentation et simulateurs officiels SENSORIUM.
              </p>
            </div>
          </div>

          {/* Boutons d'actions rapides */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-slate-200/60 dark:bg-white/[0.06] hover:bg-slate-300 dark:hover:bg-white/[0.1] text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title="Rafraîchir la vue"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Actualiser</span>
            </button>

            <button
              onClick={handleOpenExternal}
              className="px-3 py-1.5 rounded-lg bg-slate-200/60 dark:bg-white/[0.06] hover:bg-slate-300 dark:hover:bg-white/[0.1] text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-medium"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ouvrir en plein écran</span>
            </button>

            {onNavigateToCockpit && (
              <button
                onClick={onNavigateToCockpit}
                className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-orange-500/20"
                title="Retourner au Cockpit ERP"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Cockpit ERP</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── BANDEAU DES PAGES VITRINES & DOCUMENTATION ─── */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pt-1">
          {SHOWCASE_PAGES.map((page) => {
            const Icon = page.icon;
            const isSelected = activePageId === page.id;
            return (
              <button
                key={page.id}
                onClick={() => setActivePageId(page.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-orange-500 text-white font-bold border-orange-400 shadow-sm shadow-orange-500/25"
                    : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border-slate-200/80 dark:border-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.08]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{page.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── CONTENEUR IFRAME INTERACTIF & SÉCURISÉ ─── */}
      <div className="relative w-full h-[calc(100vh-210px)] min-h-[650px] bg-white dark:bg-[#070709]">
        <iframe
          key={`${currentPage.id}-${iframeKey}`}
          src={currentPage.url}
          title={currentPage.title}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default ShowcaseViewer;

