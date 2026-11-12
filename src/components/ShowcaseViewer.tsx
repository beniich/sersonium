import React, { useState, useEffect, useRef } from "react";
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
  LayoutDashboard,
  LogOut,
  Receipt,
  User,
  ChevronDown
} from "lucide-react";
import { useRbac } from "@/hooks/useRbac";
import authService from "../services/auth.service";

export const GoogleLogoIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0" fill="none">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { currentUser, logout } = useRbac();

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

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentPage = SHOWCASE_PAGES.find(p => p.id === activePageId) || SHOWCASE_PAGES[0];

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(currentPage.url, "_blank");
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await authService.loginWithGoogle();
      window.dispatchEvent(new CustomEvent("sensorium:profile_updated"));
    } catch (err) {
      console.warn("[ShowcaseViewer] Google login error:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const initials = currentUser?.name
    ? currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "GM";

  return (
    <div className={`w-full flex flex-col rounded-2xl border transition-all overflow-hidden ${
      isDark ? "bg-[#0b0c10] border-white/10 shadow-2xl" : "bg-white border-slate-200 shadow-lg"
    }`}>
      {/* ─── EN-TÊTE DE NAVIGATION UNIFIÉE DE LA VITRINE (ShowcaseNavbar) ─── */}
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

          {/* Boutons d'actions rapides & Connexion Gmail Google */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
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
                <span className="hidden md:inline">Cockpit ERP</span>
              </button>
            )}

            {/* ─── BOUTON / MENU GOOGLE GMAIL AUTHENTIFICATION ─── */}
            {currentUser?.email ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs transition cursor-pointer shadow-sm"
                  title="Mon Compte Google SENSORIUM"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center shrink-0 border border-indigo-400">
                    {currentUser.photoUrl ? (
                      <img src={currentUser.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-white">{initials}</span>
                    )}
                  </div>
                  <span className="font-semibold max-w-[120px] truncate hidden sm:inline">
                    {currentUser.name || currentUser.email.split("@")[0]}
                  </span>
                  <ChevronDown size={12} className="text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="p-3 border-b border-slate-800 mb-1 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center shrink-0 border border-indigo-400">
                        {currentUser.photoUrl ? (
                          <img src={currentUser.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-white">{initials}</span>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{currentUser.name || "Utilisateur"}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser.email}</p>
                        <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold uppercase">
                          Compte Gmail Connecté
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (onNavigateToCockpit) onNavigateToCockpit();
                        else window.location.href = "/dashboard";
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer text-left"
                    >
                      <LayoutDashboard size={14} className="text-orange-400" />
                      <span>Tableau de Bord &amp; Cockpit</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        window.location.href = "/pricing";
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer text-left"
                    >
                      <Receipt size={14} className="text-cyan-400" />
                      <span>Factures Certifiées &amp; Quotas IA</span>
                    </button>

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition cursor-pointer text-left"
                    >
                      <LogOut size={14} />
                      <span>Se Déconnecter</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all shadow-md hover:shadow-lg cursor-pointer border border-slate-200"
                title="Se connecter avec un compte Google / Gmail"
              >
                <GoogleLogoIcon size={16} />
                <span className="font-medium text-slate-800">
                  {isLoggingIn ? "Connexion..." : "Connexion Gmail"}
                </span>
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

