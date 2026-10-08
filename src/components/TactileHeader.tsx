import React, { useState } from 'react';
import type { User } from 'firebase/auth';

export type ActiveNavPath =
  | 'architecture'
  | '6-core-pillars'
  | '3d-digital-twin'
  | 'esg-carbon'
  | 'grafana-observability'
  | 'pricing'
  | 'vault'
  | 'cockpit';

interface TactileHeaderProps {
  activePath: ActiveNavPath;
  onNavigate: (path: ActiveNavPath) => void;
  onLaunchCockpit: () => void;
  onOpenVault: () => void;
  onLaunchDashboard?: () => void;
  tokenCountdown?: string;
  isEmbedded?: boolean;
  user?: User | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  subscriptionTier?: string;
  onOpenPricing?: () => void;
}

export const TactileHeader: React.FC<TactileHeaderProps> = ({
  activePath,
  onNavigate,
  onLaunchCockpit,
  onOpenVault,
  onLaunchDashboard,
  tokenCountdown = '23:59:59',
  isEmbedded = false,
  user,
  onSignIn,
  onSignOut,
  subscriptionTier = 'pro',
  onOpenPricing,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleNavClick = (path: ActiveNavPath) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
  };

  const isPro = subscriptionTier === 'pro' || subscriptionTier === 'enterprise';

  return (
    <>
      <header className={`${isEmbedded ? 'sticky top-0 w-full z-20' : 'fixed top-0 w-full z-50'} bg-[#fbf8ff]/95 backdrop-blur-md shadow-[0_4px_16px_rgba(112,104,133,0.08)] border-b border-purple-100/60`}>
        <div className="h-20 w-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Brand identity */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            <div
              onClick={() => handleNavClick('architecture')}
              className="tactile-plate w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            >
              <img
                src="/apple-touch-icon.png"
                alt="SENSORIUM"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain shadow-sm"
              />
            </div>
            <div className="flex flex-col cursor-pointer" onClick={() => handleNavClick('architecture')}>
              <div className="flex items-center gap-1.5">
                <span className="font-['Space_Grotesk'] text-base sm:text-lg tracking-tight text-[#1b1b20] font-bold">
                  BeeCarbonat
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#eaddff] text-[#25005a] font-['Space_Grotesk'] text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">
                  SPIDER
                </span>
              </div>
              <span className="font-['Space_Grotesk'] text-[9px] sm:text-[10px] text-[#4a4455] uppercase tracking-wider hidden xs:inline">
                CAFM Digital Twin
              </span>
            </div>

            {/* Edge Nodes live pill (visible on tablet and desktop) */}
            <div className="tactile-debossed px-3 py-1.5 rounded-full hidden md:flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-['Space_Grotesk'] text-[10px] sm:text-[11px] text-[#4a4455] font-bold tracking-wider">
                PRODUCTION LIVE
              </span>
              <span className="text-[#ccc3d8] text-[10px]">|</span>
              <span className="font-['Space_Grotesk'] text-[10px] sm:text-[11px] text-[#630ed4] font-bold">
                14,890 Nodes
              </span>
            </div>
          </div>

          {/* Center: Desktop Navigation links (PC >= 1280px) */}
          <nav className="hidden xl:flex items-center gap-1.5">
            <button
              onClick={() => handleNavClick('architecture')}
              className={`transition-all px-3 py-2 rounded-xl font-['Space_Grotesk'] text-[14px] ${
                activePath === 'architecture'
                  ? 'tactile-plate text-[#630ed4] font-bold'
                  : 'text-[#4a4455] hover:text-[#1b1b20]'
              }`}
            >
              Architecture
            </button>
            <button
              onClick={() => handleNavClick('6-core-pillars')}
              className={`transition-all px-3 py-2 rounded-xl font-['Space_Grotesk'] text-[14px] ${
                activePath === '6-core-pillars'
                  ? 'tactile-plate text-[#630ed4] font-bold'
                  : 'text-[#4a4455] hover:text-[#1b1b20]'
              }`}
            >
              6 Piliers
            </button>
            <button
              onClick={() => handleNavClick('3d-digital-twin')}
              className={`transition-all px-3 py-2 rounded-xl font-['Space_Grotesk'] text-[14px] ${
                activePath === '3d-digital-twin'
                  ? 'tactile-plate text-[#630ed4] font-bold'
                  : 'text-[#4a4455] hover:text-[#1b1b20]'
              }`}
            >
              Jumeau 3D
            </button>
            <button
              onClick={() => handleNavClick('esg-carbon')}
              className={`transition-all px-3 py-2 rounded-xl font-['Space_Grotesk'] text-[14px] ${
                activePath === 'esg-carbon'
                  ? 'tactile-plate text-[#630ed4] font-bold'
                  : 'text-[#4a4455] hover:text-[#1b1b20]'
              }`}
            >
              ESG &amp; Carbone
            </button>
            <button
              onClick={() => handleNavClick('grafana-observability')}
              className={`transition-all px-3 py-2 rounded-xl font-['Space_Grotesk'] text-[14px] ${
                activePath === 'grafana-observability'
                  ? 'tactile-plate text-[#630ed4] font-bold'
                  : 'text-[#4a4455] hover:text-[#1b1b20]'
              }`}
            >
              Grafana
            </button>
            <button
              onClick={() => handleNavClick('pricing')}
              className={`transition-all px-3 py-2 rounded-xl font-['Space_Grotesk'] text-[14px] ${
                activePath === 'pricing'
                  ? 'tactile-plate text-[#630ed4] font-bold'
                  : 'text-[#4a4455] hover:text-[#1b1b20]'
              }`}
            >
              Tarifs
            </button>
            <a
              href="/site/index.html"
              className="transition-all px-3 py-2 rounded-xl font-['Space_Grotesk'] text-[14px] text-[#4a4455] hover:text-[#630ed4] flex items-center gap-1"
              title="Site Web Vitrine Complet (12 pages)"
            >
              <span>Site Web</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-[#eaddff] text-[#25005a] rounded-full font-bold uppercase">12 PAGES</span>
            </a>
            <a
              href="/site/benefices_roi.html"
              className="transition-all px-3 py-2 rounded-xl font-['Space_Grotesk'] text-[14px] text-[#4a4455] hover:text-[#1b1b20] flex items-center gap-1"
              title="Bénéfices & ROI"
            >
              <span>ROI</span>
            </a>
            <a
              href="/site/demo.html"
              className="transition-all px-3 py-2 rounded-xl font-['Space_Grotesk'] text-[14px] text-[#4a4455] hover:text-[#1b1b20] flex items-center gap-1"
              title="Demander une Démo"
            >
              <span>Démo</span>
            </a>
          </nav>

          {/* Right action block */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

            {/* User Profile / Registration / Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="tactile-btn px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                  title="Gérer mon compte"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "Utilisateur"}
                      className="w-7 h-7 rounded-full object-cover border border-purple-400"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#630ed4] flex items-center justify-center text-white text-xs font-bold">
                      {(user.displayName || user.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="font-['Space_Grotesk'] text-[11px] text-[#1b1b20] font-bold max-w-[110px] truncate">
                      {user.displayName || user.email?.split("@")[0] || "Compte"}
                    </span>
                    <span className="font-['Space_Grotesk'] text-[9px] text-[#7c3aed] font-bold uppercase">
                      {isPro ? "★ PRO ACTIF" : "PLAN GRATUIT"}
                    </span>
                  </div>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs animate-in fade-in duration-150">
                    <div className="pb-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900">{user.displayName || "Utilisateur"}</div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">{user.email}</div>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {isPro ? "Membre Pro Débloqué" : "Plan Découverte"}
                      </div>
                    </div>
                    
                    <div className="py-2 space-y-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onOpenPricing) onOpenPricing();
                          else handleNavClick('pricing');
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-700 font-medium"
                      >
                        <span className="material-symbols-outlined text-[16px] text-amber-500">credit_card</span>
                        <span>Mon Abonnement / Tarifs</span>
                      </button>
                      
                      {onLaunchDashboard && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLaunchDashboard();
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-purple-700 font-bold"
                        >
                          <span className="material-symbols-outlined text-[16px]">dashboard</span>
                          <span>Ouvrir la Console SENSORIUM</span>
                        </button>
                      )}
                    </div>

                    {onSignOut && (
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onSignOut();
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-red-50 text-red-600 font-medium flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px]">logout</span>
                          <span>Se Déconnecter</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="tactile-btn px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 text-[#630ed4] font-['Space_Grotesk'] text-[12px] sm:text-[13px] font-bold hover:bg-[#ede0ff] active:scale-95 transition-all cursor-pointer"
                title="S'inscrire ou se connecter avec Google"
              >
                <span className="material-symbols-outlined text-[16px]">account_circle</span>
                <span className="whitespace-nowrap">Connexion</span>
              </button>
            )}

            {/* Cockpit 3D Button (hidden on narrow phones to avoid overflow) */}
            <button
              onClick={onLaunchCockpit}
              className="tactile-btn px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl hidden sm:flex items-center gap-1.5 text-[#4a4455] font-['Space_Grotesk'] text-[12px] sm:text-[13px] font-semibold hover:text-[#1b1b20] active:scale-95 transition-all cursor-pointer"
              title="Ouvrir le Jumeau Cockpit 3D"
            >
              <span className="material-symbols-outlined text-[16px]">sensors</span>
              <span className="whitespace-nowrap">Cockpit 3D</span>
            </button>

            {/* CONSOLE / COCKPIT SENSORIUM (CTA principal) */}
            {onLaunchDashboard && (
              <button
                id="btn-mode-pro-sensorium"
                onClick={onLaunchDashboard}
                className="group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-['Space_Grotesk'] text-[12px] sm:text-[13px] font-bold text-white cursor-pointer active:scale-95 transition-all overflow-hidden shadow-lg hover:shadow-[0_0_24px_rgba(99,14,212,0.45)]"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 60%, #2563eb 100%)',
                }}
                title="Accéder à la console / Cockpit applicatif SENSORIUM"
              >
                <span className="pointer-events-none absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-yellow-300">workspace_premium</span>
                <span className="whitespace-nowrap">Console</span>
                <span className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] tracking-widest font-bold uppercase">
                  COCKPIT
                </span>
              </button>
            )}

            {/* Mobile & Tablet Hamburger Toggle (visible on all screens < 1280px) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden tactile-btn p-2 rounded-xl flex items-center justify-center text-[#1b1b20] active:scale-95 transition-all cursor-pointer min-h-[40px] min-w-[40px]"
              aria-label="Ouvrir le menu de navigation"
              title="Menu principal"
            >
              <span className="material-symbols-outlined text-[24px]">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Full Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] xl:hidden flex">
          {/* Backdrop blur */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-5/6 max-w-sm bg-[#faf8ff] text-[#1b1b20] h-full overflow-y-auto p-5 z-10 flex flex-col justify-between shadow-2xl border-r border-purple-200">
            <div className="space-y-4">
              
              {/* Drawer Top Bar */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#7c3aed] flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[18px]">deployed_code</span>
                  </div>
                  <div>
                    <div className="font-['Space_Grotesk'] text-base font-bold text-slate-900 leading-tight">BeeCarbonat</div>
                    <div className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Spider Twin CAFM</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                  aria-label="Fermer le menu"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              </div>

              {/* User Account / Auth Card */}
              <div className="tactile-plate p-3.5 rounded-2xl flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-2.5">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover border border-purple-400" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#630ed4] text-white flex items-center justify-center font-bold text-sm">
                          {(user.displayName || user.email || "U")[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-900 truncate">{user.displayName || "Utilisateur"}</div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-purple-100">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                        {isPro ? "★ Membre Pro" : "Compte Découverte"}
                      </span>
                      {onSignOut && (
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onSignOut();
                          }}
                          className="text-[11px] text-red-600 font-semibold hover:underline"
                        >
                          Déconnexion
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="text-xs text-slate-600">Connectez-vous pour enregistrer votre jumeau et vos abonnements :</div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (onSignIn) onSignIn();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#630ed4] hover:bg-[#5209b5] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">account_circle</span>
                      <span>S'inscrire / Connexion Google</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Links list */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-mono text-slate-400 px-2 tracking-wider font-bold">Navigation Principale</div>
                
                <button
                  onClick={() => handleNavClick('architecture')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-['Space_Grotesk'] text-sm font-semibold transition-all ${
                    activePath === 'architecture' ? 'bg-[#ede0ff] text-[#630ed4]' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">account_tree</span>
                  <span>Architecture &amp; Topologie</span>
                </button>

                <button
                  onClick={() => handleNavClick('6-core-pillars')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-['Space_Grotesk'] text-sm font-semibold transition-all ${
                    activePath === '6-core-pillars' ? 'bg-[#ede0ff] text-[#630ed4]' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">hub</span>
                  <span>6 Piliers Spider CAFM</span>
                </button>

                <button
                  onClick={() => handleNavClick('3d-digital-twin')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-['Space_Grotesk'] text-sm font-semibold transition-all ${
                    activePath === '3d-digital-twin' ? 'bg-[#ede0ff] text-[#630ed4]' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
                  <span>Jumeau Numérique 3D</span>
                </button>

                <button
                  onClick={() => handleNavClick('esg-carbon')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-['Space_Grotesk'] text-sm font-semibold transition-all ${
                    activePath === 'esg-carbon' ? 'bg-[#ede0ff] text-[#630ed4]' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">eco</span>
                  <span>ESG &amp; Conformité Carbone</span>
                </button>

                <button
                  onClick={() => handleNavClick('grafana-observability')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-['Space_Grotesk'] text-sm font-semibold transition-all ${
                    activePath === 'grafana-observability' ? 'bg-[#ede0ff] text-[#630ed4]' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">query_stats</span>
                  <span>Grafana Observabilité</span>
                </button>

                <button
                  onClick={() => handleNavClick('pricing')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-['Space_Grotesk'] text-sm font-semibold transition-all ${
                    activePath === 'pricing' ? 'bg-[#ede0ff] text-[#630ed4]' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                    <span>Tarifs &amp; Abonnements</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-100 text-purple-700 font-bold uppercase">PAYPAL</span>
                </button>

                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[10px] uppercase font-mono text-slate-400 px-2 tracking-wider font-bold mb-1">Site Web &amp; Vitrine Complète (12 Pages)</div>
                  
                  <a
                    href="/site/index.html"
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-['Space_Grotesk'] text-sm text-[#630ed4] hover:bg-purple-50 font-bold"
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px]">home</span>
                      <span>Accueil Vitrine</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-[#eaddff] text-[#25005a] rounded-full font-bold uppercase">12 PAGES</span>
                  </a>

                  <a
                    href="/site/solutions.html"
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-['Space_Grotesk'] text-sm text-slate-700 hover:bg-slate-100 font-medium"
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px]">domain</span>
                      <span>Solutions Métiers</span>
                    </span>
                  </a>

                  <a
                    href="/site/benefices_roi.html"
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-['Space_Grotesk'] text-sm text-slate-700 hover:bg-slate-100 font-medium"
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px]">trending_up</span>
                      <span>Bénéfices &amp; ROI</span>
                    </span>
                    <span className="text-[9px] px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold uppercase">ROI</span>
                  </a>

                  <a
                    href="/site/piliers_industriels.html"
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-['Space_Grotesk'] text-sm text-slate-700 hover:bg-slate-100 font-medium"
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px]">factory</span>
                      <span>Piliers Industriels</span>
                    </span>
                  </a>

                  <a
                    href="/site/jumeau_numerique_3d.html"
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-['Space_Grotesk'] text-sm text-slate-700 hover:bg-slate-100 font-medium"
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
                      <span>Jumeau Numérique 3D</span>
                    </span>
                  </a>

                  <a
                    href="/site/esg_carbon.html"
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-['Space_Grotesk'] text-sm text-slate-700 hover:bg-slate-100 font-medium"
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px]">eco</span>
                      <span>ESG &amp; Carbone</span>
                    </span>
                  </a>

                  <a
                    href="/site/temoignages.html"
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-['Space_Grotesk'] text-sm text-slate-700 hover:bg-slate-100 font-medium"
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px]">reviews</span>
                      <span>Témoignages Clients</span>
                    </span>
                  </a>

                  <a
                    href="/site/tarifs.html"
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-['Space_Grotesk'] text-sm text-slate-700 hover:bg-slate-100 font-medium"
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px]">sell</span>
                      <span>Grille Tarifaire Vitrine</span>
                    </span>
                  </a>

                  <a
                    href="/site/demo.html"
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-['Space_Grotesk'] text-sm text-slate-700 hover:bg-slate-100 font-medium"
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px]">play_circle</span>
                      <span>Démo Interactives</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* Drawer Bottom Action: Launch Application Console */}
            <div className="pt-4 border-t border-slate-200 space-y-2.5">
              {onLaunchDashboard && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLaunchDashboard();
                  }}
                  className="w-full py-3 px-4 rounded-xl font-['Space_Grotesk'] text-sm font-bold text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 60%, #2563eb 100%)',
                  }}
                >
                  <span className="material-symbols-outlined text-[18px] text-yellow-300">workspace_premium</span>
                  <span>Console SENSORIUM (COCKPIT)</span>
                </button>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>14,890 Edge Nodes Live</span>
                </span>
                <span className="text-[#630ed4] font-semibold">Tier-4 Sovereign</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
