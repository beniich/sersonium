import React, { useState } from 'react';
import type { User } from 'firebase/auth';

export type ActiveNavPath =
  | 'hub'
  | 'lacaza'
  | 'sensorium'
  | 'nanobanana'
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
      <header className={`${isEmbedded ? 'sticky top-0 w-full z-20' : 'fixed top-0 w-full z-50'} bg-white/95 dark:bg-[#070709]/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 dark:border-white/[0.08] transition-colors`}>
        <div className="h-20 w-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Brand identity */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            <div
              onClick={() => handleNavClick('architecture')}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform overflow-hidden shrink-0 bg-slate-900 dark:bg-black border border-slate-700 dark:border-white/15 shadow-sm"
              title="SENSORIUM Autonomous Platform"
            >
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-7 sm:h-7">
                <defs>
                  <linearGradient id="thGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="45%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#EA580C" />
                  </linearGradient>
                  <radialGradient id="thCore" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FED7AA" />
                    <stop offset="100%" stopColor="#F97316" />
                  </radialGradient>
                </defs>
                <path d="M16 3L27.25 9.5V22.5L16 29L4.75 22.5V9.5L16 3Z" stroke="url(#thGold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="16" cy="16" r="7.5" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2 2" />
                <circle cx="16" cy="16" r="4.5" stroke="url(#thGold)" strokeWidth="1.2" />
                <circle cx="16" cy="16" r="2.2" fill="url(#thCore)" />
                <circle cx="16" cy="6.5" r="1.1" fill="#FFFFFF" />
                <circle cx="24.2" cy="20.7" r="1.1" fill="#FFFFFF" />
                <circle cx="7.8" cy="20.7" r="1.1" fill="#FFFFFF" />
              </svg>
            </div>
            <div className="flex flex-col cursor-pointer" onClick={() => handleNavClick('architecture')}>
              <div className="flex items-center gap-1.5">
                <span className="font-['Space_Grotesk'] text-base sm:text-lg tracking-tight text-slate-900 dark:text-white font-bold">
                  SENSORIUM
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-['Space_Grotesk'] text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">
                  SOVEREIGN
                </span>
              </div>
              <span className="font-['Space_Grotesk'] text-[9px] sm:text-[10px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider hidden xs:inline">
                Spatial Hypervision &amp; Twin
              </span>
            </div>

            {/* Edge Nodes live pill (visible on tablet and desktop) */}
            <div className="px-3 py-1.5 rounded-full hidden md:flex items-center gap-2 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-['Space_Grotesk'] text-[10px] sm:text-[11px] text-slate-600 dark:text-neutral-400 font-bold tracking-wider">
                PRODUCTION LIVE
              </span>
              <span className="text-slate-300 dark:text-neutral-700 text-[10px]">|</span>
              <span className="font-['Space_Grotesk'] text-[10px] sm:text-[11px] text-orange-600 dark:text-orange-400 font-bold">
                14,890 Nodes
              </span>
            </div>
          </div>

          {/* Center: Desktop Navigation links (PC >= 1280px) */}
          <nav className="hidden xl:flex items-center gap-1.5">
            {[
              { id: 'architecture', label: 'Architecture' },
              { id: '6-core-pillars', label: '6 Piliers' },
              { id: '3d-digital-twin', label: 'Jumeau 3D' },
              { id: 'esg-carbon', label: 'ESG & Carbone' },
              { id: 'grafana-observability', label: 'Grafana' },
              { id: 'pricing', label: 'Tarifs' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as ActiveNavPath)}
                className={`transition-all px-3 py-1.5 rounded-xl font-['Space_Grotesk'] text-[13px] sm:text-[14px] cursor-pointer ${
                  activePath === item.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <a
              href="/site/index.html"
              className="transition-all px-3 py-1.5 rounded-xl font-['Space_Grotesk'] text-[13px] sm:text-[14px] text-slate-600 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1"
              title="Site Web Vitrine Complet (12 pages)"
            >
              <span>Site Web</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 rounded-full font-bold uppercase">12 PAGES</span>
            </a>
            <a
              href="/site/benefices_roi.html"
              className="transition-all px-3 py-1.5 rounded-xl font-['Space_Grotesk'] text-[13px] sm:text-[14px] text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
              title="Bénéfices & ROI"
            >
              <span>ROI</span>
            </a>
            <a
              href="/site/demo.html"
              className="transition-all px-3 py-1.5 rounded-xl font-['Space_Grotesk'] text-[13px] sm:text-[14px] text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
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
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-all bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]"
                  title="Gérer mon compte"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "Utilisateur"}
                      className="w-7 h-7 rounded-full object-cover border border-orange-400"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                      {(user.displayName || user.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="font-['Space_Grotesk'] text-[11px] text-slate-900 dark:text-white font-bold max-w-[110px] truncate">
                      {user.displayName || user.email?.split("@")[0] || "Compte"}
                    </span>
                    <span className="font-['Space_Grotesk'] text-[9px] text-orange-600 dark:text-orange-400 font-bold uppercase">
                      {isPro ? "★ PRO ACTIF" : "PLAN GRATUIT"}
                    </span>
                  </div>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0e0e14] rounded-2xl shadow-xl border border-slate-200 dark:border-white/[0.08] p-3 z-50 text-xs animate-in fade-in duration-150">
                    <div className="pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                      <div className="font-bold text-slate-900 dark:text-white">{user.displayName || "Utilisateur"}</div>
                      <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono truncate">{user.email}</div>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
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
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] flex items-center gap-2 text-slate-700 dark:text-neutral-300 font-medium cursor-pointer"
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
                          className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">dashboard</span>
                          <span>Ouvrir la Console SENSORIUM</span>
                        </button>
                      )}
                    </div>

                    {onSignOut && (
                      <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onSignOut();
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-medium flex items-center gap-2 cursor-pointer"
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
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 text-slate-700 dark:text-neutral-200 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] font-['Space_Grotesk'] text-[12px] sm:text-[13px] font-bold active:scale-95 transition-all cursor-pointer"
                title="S'inscrire ou se connecter avec Google"
              >
                <span className="material-symbols-outlined text-[16px]">account_circle</span>
                <span className="whitespace-nowrap">Connexion</span>
              </button>
            )}

            {/* Cockpit 3D Button (hidden on narrow phones to avoid overflow) */}
            <button
              onClick={onLaunchCockpit}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl hidden sm:flex items-center gap-1.5 text-slate-700 dark:text-neutral-300 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] font-['Space_Grotesk'] text-[12px] sm:text-[13px] font-semibold hover:text-slate-900 dark:hover:text-white active:scale-95 transition-all cursor-pointer"
              title="Ouvrir le Jumeau Cockpit 3D"
            >
              <span className="material-symbols-outlined text-[16px] text-orange-500">sensors</span>
              <span className="whitespace-nowrap">Cockpit 3D</span>
            </button>

            {/* CONSOLE / COCKPIT SENSORIUM (CTA principal) */}
            {onLaunchDashboard && (
              <button
                id="btn-mode-pro-sensorium"
                onClick={onLaunchDashboard}
                className="group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-['Space_Grotesk'] text-[12px] sm:text-[13px] font-bold text-white cursor-pointer active:scale-95 transition-all overflow-hidden shadow-md shadow-orange-500/20 bg-orange-500 hover:bg-orange-600"
                title="Accéder à la console / Cockpit applicatif SENSORIUM"
              >
                <span className="pointer-events-none absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-amber-200">workspace_premium</span>
                <span className="whitespace-nowrap">Console</span>
                <span className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] tracking-widest font-bold uppercase">
                  COCKPIT
                </span>
              </button>
            )}

            {/* Mobile & Tablet Hamburger Toggle (visible on all screens < 1280px) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl flex items-center justify-center text-slate-700 dark:text-neutral-200 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] active:scale-95 transition-all cursor-pointer min-h-[40px] min-w-[40px]"
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
          <div className="relative w-5/6 max-w-sm bg-white dark:bg-[#070709] text-slate-900 dark:text-neutral-100 h-full overflow-y-auto p-5 z-10 flex flex-col justify-between shadow-2xl border-r border-slate-200 dark:border-white/[0.08]">
            <div className="space-y-4">
              
              {/* Drawer Top Bar */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[18px]">deployed_code</span>
                  </div>
                  <div>
                    <div className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white leading-tight">SENSORIUM</div>
                    <div className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">Spatial Twin &amp; Hypervision</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  aria-label="Fermer le menu"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              </div>

              {/* User Account / Auth Card */}
              <div className="p-3.5 rounded-2xl flex flex-col gap-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
                {user ? (
                  <>
                    <div className="flex items-center gap-2.5">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover border border-orange-400" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                          {(user.displayName || user.email || "U")[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{user.displayName || "Utilisateur"}</div>
                        <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono truncate">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/[0.06]">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                        {isPro ? "★ Membre Pro" : "Compte Découverte"}
                      </span>
                      {onSignOut && (
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onSignOut();
                          }}
                          className="text-[11px] text-red-600 dark:text-red-400 font-semibold hover:underline cursor-pointer"
                        >
                          Déconnexion
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="text-xs text-slate-600 dark:text-neutral-400">Connectez-vous pour enregistrer votre jumeau et vos abonnements :</div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (onSignIn) onSignIn();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">account_circle</span>
                      <span>S'inscrire / Connexion Google</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Links list */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500 px-2 tracking-wider font-bold">Navigation Principale</div>
                
                {[
                  { id: 'architecture', label: 'Architecture & Topologie', icon: 'account_tree' },
                  { id: '6-core-pillars', label: '6 Piliers SENSORIUM', icon: 'hub' },
                  { id: '3d-digital-twin', label: 'Jumeau Numérique 3D', icon: 'view_in_ar' },
                  { id: 'esg-carbon', label: 'ESG & Conformité Carbone', icon: 'eco' },
                  { id: 'grafana-observability', label: 'Grafana Observabilité', icon: 'query_stats' },
                  { id: 'pricing', label: 'Tarifs & Abonnements', icon: 'payments', badge: 'PAYPAL' },
                ].map(link => (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id as ActiveNavPath)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-['Space_Grotesk'] text-sm font-semibold transition-all cursor-pointer ${
                      activePath === link.id
                        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                        : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                      <span>{link.label}</span>
                    </span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold uppercase border border-orange-500/20">{link.badge}</span>
                    )}
                  </button>
                ))}

                <div className="pt-2 border-t border-slate-200 dark:border-white/[0.08]">
                  <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500 px-2 tracking-wider font-bold mb-1">Site Web &amp; Vitrine Complète (12 Pages)</div>
                  
                  <a
                    href="/site/index.html"
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-['Space_Grotesk'] text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 font-bold"
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px]">home</span>
                      <span>Accueil Vitrine</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-orange-500/15 text-orange-600 dark:text-orange-400 rounded-full font-bold uppercase">12 PAGES</span>
                  </a>

                  {[
                    { href: '/site/solutions.html', label: 'Solutions Métiers', icon: 'domain' },
                    { href: '/site/benefices_roi.html', label: 'Bénéfices & ROI', icon: 'trending_up', badge: 'ROI' },
                    { href: '/site/piliers_industriels.html', label: 'Piliers Industriels', icon: 'factory' },
                    { href: '/site/jumeau_numerique_3d.html', label: 'Jumeau Numérique 3D', icon: 'view_in_ar' },
                    { href: '/site/esg_carbon.html', label: 'ESG & Carbone', icon: 'eco' },
                    { href: '/site/temoignages.html', label: 'Témoignages Clients', icon: 'reviews' },
                    { href: '/site/tarifs.html', label: 'Grille Tarifaire Vitrine', icon: 'sell' },
                    { href: '/site/demo.html', label: 'Démo Interactives', icon: 'play_circle' },
                  ].map(siteLink => (
                    <a
                      key={siteLink.href}
                      href={siteLink.href}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-['Space_Grotesk'] text-sm text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] font-medium"
                    >
                      <span className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[18px]">{siteLink.icon}</span>
                        <span>{siteLink.label}</span>
                      </span>
                      {siteLink.badge && (
                        <span className="text-[9px] px-1 py-0.2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 rounded font-bold uppercase">{siteLink.badge}</span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Bottom Action: Launch Application Console */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] space-y-2.5">
              {onLaunchDashboard && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLaunchDashboard();
                  }}
                  className="w-full py-3 px-4 rounded-xl font-['Space_Grotesk'] text-sm font-bold text-white shadow-md bg-orange-500 hover:bg-orange-600 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px] text-amber-200">workspace_premium</span>
                  <span>Console SENSORIUM (COCKPIT)</span>
                </button>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 font-mono pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>14,890 Edge Nodes Live</span>
                </span>
                <span className="text-orange-600 dark:text-orange-400 font-semibold">Tier-4 Sovereign</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
