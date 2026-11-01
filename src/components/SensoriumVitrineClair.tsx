import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  FileCheck, 
  Cloud, 
  Box, 
  Wrench, 
  ShieldCheck, 
  FileText, 
  Clock, 
  Radio, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  ChevronDown, 
  Globe, 
  ArrowUpRight,
  Menu,
  X,
  PlayCircle,
  Check,
  Layers,
  Sparkles,
  Maximize2,
  Sun,
  Moon
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { SENSORIUM_POSTERS } from '../data/postersData';
import { PostersGalleryModal } from './PostersGalleryModal';

interface SensoriumVitrineClairProps {
  onSignIn?: () => void;
  onEnterDashboard: () => void;
  onNavigate?: (path: any) => void;
  onLaunchCockpit?: () => void;
  onOpenPricing?: () => void;
  user?: User | null;
  isDark?: boolean;
  toggleTheme?: () => void;
}

export const SensoriumVitrineClair: React.FC<SensoriumVitrineClairProps> = ({
  onSignIn,
  onEnterDashboard,
  onNavigate,
  onLaunchCockpit,
  onOpenPricing,
  user,
  isDark = false,
  toggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<'FR' | 'EN'>('FR');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedPosterPreview, setSelectedPosterPreview] = useState<number | null>(null);

  // Take first 6 posters as curated showcase for the vitrine
  const showcasePosters = SENSORIUM_POSTERS.slice(0, 6);

  return (
    <div className="min-h-screen bg-white dark:bg-[#070709] text-slate-900 dark:text-slate-100 font-['Inter',sans-serif] selection:bg-[#e78b39]/20 selection:text-[#d97706] relative antialiased transition-colors duration-200">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 w-full z-50 bg-white/95 dark:bg-[#070709]/95 backdrop-blur-md border-b border-slate-100 dark:border-white/[0.08] shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo with Official SENSORIUM CAFM PRO Emblem */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onEnterDashboard}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-xs border border-slate-200 overflow-hidden p-1">
              <img src="/logo-icon.png" alt="SENSORIUM Icon" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-['Manrope'] font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                SENSORIUM
              </span>
              <span className="text-[10px] tracking-[0.25em] font-semibold text-slate-500 dark:text-neutral-400 uppercase mt-0.5">
                CAFM PRO
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-slate-600">
            <a href="#accueil" className="text-slate-900 font-semibold border-b-2 border-[#e0822d] pb-0.5">Accueil</a>
            <a href="#plateforme" className="hover:text-slate-900 transition-colors">Plateforme</a>
            {onNavigate ? (
              <button
                onClick={() => onNavigate('architecture')}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Architecture
              </button>
            ) : (
              <a href="/site/architecture.html" className="hover:text-slate-900 transition-colors">Architecture</a>
            )}
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="hover:text-slate-900 transition-colors flex items-center gap-1.5 font-semibold text-orange-600 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>28 Affiches</span>
            </button>
            <a href="#securite" className="hover:text-slate-900 transition-colors">Sécurité</a>
            <a href="/site/solutions.html" className="hover:text-slate-900 transition-colors">Solutions</a>
            <a href="/site/benefices_roi.html" className="hover:text-slate-900 transition-colors">ROI</a>
            {onOpenPricing ? (
              <button 
                onClick={onOpenPricing} 
                className="hover:text-slate-900 transition-colors cursor-pointer font-medium text-[13px]"
              >
                Tarifs
              </button>
            ) : (
              <a href="/site/tarifs.html" className="hover:text-slate-900 transition-colors">Tarifs</a>
            )}
            <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
          </nav>

          {/* Right Action: CTA, Cockpit & Language dropdown */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ea580c] border border-orange-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Voir les 28 affiches haute résolution"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>28 Affiches</span>
            </button>

            {onLaunchCockpit && (
              <button
                onClick={onLaunchCockpit}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer border border-slate-200"
                title="Accéder au Cockpit 3D"
              >
                <span>Cockpit 3D</span>
              </button>
            )}

            <button
              onClick={onEnterDashboard}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e78b39] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white font-['Manrope'] font-semibold text-xs tracking-wide shadow-sm shadow-orange-500/20 hover:shadow-md transition-all cursor-pointer"
            >
              Demander une démo
            </button>

            {/* Theme Toggle Button */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-amber-500 dark:text-amber-400 border border-slate-200 dark:border-white/[0.08] transition-all cursor-pointer flex items-center justify-center active:scale-95"
                title={isDark ? "Passer en Mode Clair" : "Passer en Mode Sombre"}
                aria-label="Basculer le thème"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>
            )}

            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-neutral-400 pl-1">
              <span 
                className="cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => setActiveLang(activeLang === 'FR' ? 'EN' : 'FR')}
              >
                {activeLang}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-6 py-4 bg-white border-b border-slate-100 space-y-3 text-left">
            <a href="#accueil" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-900">Accueil</a>
            <a href="#plateforme" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-600">Plateforme</a>
            <button 
              onClick={() => { setMobileMenuOpen(false); setIsGalleryOpen(true); }}
              className="block text-sm font-semibold text-orange-600 text-left w-full"
            >
              Affiches &amp; Écrans (28)
            </button>
            <a href="#securite" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-600">Sécurité</a>
            <a href="#conformite" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-600">Conformité</a>
            <a href="/site/solutions.html" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-600">Solutions</a>
            <a href="/site/benefices_roi.html" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-600">ROI</a>
            <a href="/site/temoignages.html" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-600">Témoignages</a>
            <a href="/site/tarifs.html" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-600">Tarifs</a>
            {onLaunchCockpit && (
              <button 
                onClick={() => { setMobileMenuOpen(false); onLaunchCockpit(); }} 
                className="block text-sm text-[#d97706] font-semibold text-left w-full"
              >
                Accéder au Cockpit 3D
              </button>
            )}
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-600">Contact</a>
          </div>
        )}
      </header>

      <main>
        {/* ==============================================================
            2. HERO SECTION : ATRIUM LUMINEUX + AUDIT IMMUABLE SHA-256
        ============================================================== */}
        <section id="accueil" className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50/60 dark:from-[#070709] via-white dark:via-[#070709] to-white dark:to-[#070709] pt-10 sm:pt-16 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Headlines & Pill badges (5 cols) */}
              <div className="lg:col-span-5 space-y-6 text-left">
                
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#d97706] uppercase">
                    SENSORIUM CAFM PRO
                  </span>
                  <span className="text-slate-300">·</span>
                  <button 
                    onClick={() => setIsGalleryOpen(true)}
                    className="text-[11px] font-mono text-orange-600 hover:text-orange-700 underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>28 Visuels 16:9</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>

                <h1 className="font-['Manrope'] font-bold text-3xl sm:text-4xl lg:text-[44px] tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                  La supervision opérationnelle au service de votre performance
                </h1>

                <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-400 leading-relaxed max-w-lg">
                  Une plateforme unifiée pour la gestion des infrastructures, la maintenance, la sécurité, la conformité et la traçabilité.
                </p>

                {/* 4 Feature Pills with Orange Icons */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06] text-xs text-slate-700 dark:text-neutral-300 font-medium">
                    <Box className="w-4 h-4 text-[#e0822d] shrink-0" />
                    <span>CAFM / GMAO</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06] text-xs text-slate-700 dark:text-neutral-300 font-medium">
                    <Lock className="w-4 h-4 text-[#e0822d] shrink-0" />
                    <span>Sécurité &amp; Accès</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06] text-xs text-slate-700 dark:text-neutral-300 font-medium">
                    <FileCheck className="w-4 h-4 text-[#e0822d] shrink-0" />
                    <span>Conformité &amp; Audit</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06] text-xs text-slate-700 dark:text-neutral-300 font-medium">
                    <Cloud className="w-4 h-4 text-[#e0822d] shrink-0" />
                    <span>Cloud &amp; IoT</span>
                  </div>
                </div>

                {/* Dual Action Buttons */}
                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <button
                    onClick={onEnterDashboard}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#e78b39] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white font-['Manrope'] font-semibold text-xs tracking-wide shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <span>Demander une démo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsGalleryOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-neutral-200 font-['Manrope'] font-medium text-xs shadow-2xs transition-all cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-orange-500" />
                    <span>Explorer les 28 affiches</span>
                  </button>
                </div>

              </div>

              {/* Right Column: Master Hero Visual with Atrium & Holographic Audit Architecture (7 cols) */}
              <div className="lg:col-span-7 relative">
                <div 
                  className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-900 group cursor-pointer"
                  onClick={() => setIsGalleryOpen(true)}
                  title="Cliquer pour ouvrir la galerie complète"
                >
                  <img
                    src="/banners/banner-1.png"
                    alt="SENSORIUM CAFM Pro — Architecture d'audit immuable et traçabilité"
                    className="w-full h-[380px] sm:h-[460px] object-cover object-center filter contrast-[1.02] brightness-[0.98] group-hover:scale-102 transition-transform duration-700"
                    loading="eager"
                  />

                  {/* Ambient Badge Header */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200 text-xs font-mono text-slate-800 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#e0822d] animate-pulse" />
                    <span className="font-bold">SENSORIUM CAFM Pro</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 font-sans">Affiche #1 / 28</span>
                  </div>

                  {/* Floating CTA to open all 28 banners */}
                  <div className="absolute bottom-4 left-4 z-10 px-3 py-2 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-2 shadow-lg">
                    <Layers className="w-4 h-4 text-orange-400" />
                    <span>Voir les 28 bannières 16:9</span>
                    <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                  </div>

                  {/* Hologram Floating HUD: Immutable Audit Trail (top-right) */}
                  <div className="absolute top-4 right-4 z-10 p-3 rounded-xl bg-slate-950/75 backdrop-blur-md border border-white/20 text-white shadow-lg max-w-[210px] hidden sm:block text-left">
                    <div className="text-[11px] font-semibold text-amber-300 font-mono flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Immutable Audit Trail</span>
                    </div>
                    <div className="mt-1.5 space-y-1 text-[10px] text-slate-300 font-mono">
                      <div className="flex items-center justify-between">
                        <span>SHA-256</span>
                        <span className="text-emerald-400 font-bold">VERIFIED</span>
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">h(t) = e3b0c44298fc...</div>
                    </div>
                  </div>

                  {/* Hologram Floating HUD: DORA Art. 24 Compliance (bottom-right) */}
                  <div className="absolute bottom-4 right-4 z-10 p-3 rounded-xl bg-slate-950/75 backdrop-blur-md border border-white/20 text-white shadow-lg max-w-[210px] hidden sm:block text-left">
                    <div className="text-[11px] font-semibold text-emerald-400 font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>DORA Art. 24 Compliance</span>
                    </div>
                    <div className="mt-1.5 space-y-1 text-[10px] text-slate-300 font-mono">
                      <div>✓ Risk Management</div>
                      <div>✓ Tamper-proof logs</div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ==============================================================
            NOUVELLE SECTION : VITRINE DES 28 AFFICHES HAUTE RÉSOLUTION
        ============================================================== */}
        <section id="galerie-affiches" className="py-20 bg-slate-50 dark:bg-[#0a0a0e] border-t border-slate-200/80 dark:border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-left">
              <div className="space-y-3 max-w-2xl">
                <div className="text-xs font-mono font-bold tracking-wider text-[#d97706] uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>CATALOGUE D'AFFICHES &amp; ÉCRANS 16:9</span>
                </div>
                <h2 className="font-['Manrope'] font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
                  Les 28 Écrans Opérationnels de la Plateforme
                </h2>
                <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                  Chaque affiche illustre un pilier technique : modélisation 3D, surveillance réseau, gouvernance des identités, reporting CSRD et automatismes robotiques.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsGalleryOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>Ouvrir la Galerie Complète (28)</span>
                </button>
              </div>
            </div>

            {/* Showcase Grid of 6 Selected Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {showcasePosters.map((poster) => (
                <div
                  key={poster.id}
                  onClick={() => setIsGalleryOpen(true)}
                  className="group rounded-2xl bg-white dark:bg-[#0e0e14] border border-slate-200/80 dark:border-white/[0.07] shadow-2xs hover:shadow-xl hover:border-orange-300 dark:hover:border-orange-500/40 transition-all overflow-hidden flex flex-col text-left cursor-pointer"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                    <img
                      src={poster.image}
                      alt={poster.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-[1.02]"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <span>Affiche #{poster.id}</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        {poster.tags.map((t, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-neutral-400 font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-['Manrope'] font-bold text-base text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
                        {poster.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                        {poster.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-orange-600 dark:text-orange-400 font-semibold">
                      <span>Consulter l'affiche</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Banner Quick Strip 7-12 Preview Strip */}
            <div className="mt-8 p-4 rounded-2xl bg-white dark:bg-[#0e0e14] border border-slate-200/80 dark:border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">22 autres affiches haute définition disponibles</div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-500">Parcourez les filtres par catégorie : Énergie, Robotique, DORA, Jumeaux 3D, Sécurité.</div>
                </div>
              </div>
              <button
                onClick={() => setIsGalleryOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-800 dark:text-neutral-200 text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                Explorer tout le catalogue →
              </button>
            </div>

          </div>
        </section>

        {/* ==============================================================
            3. SECTION 02 : NOS MODULES — Bento Grid 6 Cartes Épurées
        ============================================================== */}
        <section id="plateforme" className="py-20 bg-white dark:bg-[#070709] border-t border-slate-100 dark:border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <div className="text-xs font-mono font-bold tracking-wider text-[#d97706] uppercase">
                ✦ NOS MODULES
              </div>
              <h2 className="font-['Manrope'] font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
                Une plateforme complète pour une gestion intelligente
              </h2>
              <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                SENSORIUM CAFM PRO centralise vos données et automatise vos processus pour une supervision en temps réel, fiable et sécurisée.
              </p>
            </div>

            {/* 6 Grid Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e14] border border-slate-200/90 dark:border-white/[0.07] shadow-2xs hover:shadow-md transition-shadow text-left flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center text-[#e0822d]">
                    <Box className="w-5 h-5" />
                  </div>
                  <h3 className="font-['Manrope'] font-bold text-lg text-slate-900 dark:text-white">
                    Gestion des actifs
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                    Inventaire, cycle de vie, maintenance prédictive et hiérarchie multi-sites complète.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e14] border border-slate-200/90 dark:border-white/[0.07] shadow-2xs hover:shadow-md transition-shadow text-left flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center text-[#e0822d]">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h3 className="font-['Manrope'] font-bold text-lg text-slate-900 dark:text-white">
                    Maintenance (GMAO)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                    Planification intelligente, bons d'intervention automatisés par IA et suivi des coûts opérationnels.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e14] border border-slate-200/90 dark:border-white/[0.07] shadow-2xs hover:shadow-md transition-shadow text-left flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center text-[#e0822d]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="font-['Manrope'] font-bold text-lg text-slate-900 dark:text-white">
                    Gestion des accès
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                    RBAC granulaire, SSO entreprise, identité numérique sécurisée et protocoles Zero-Trust.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e14] border border-slate-200/90 dark:border-white/[0.07] shadow-2xs hover:shadow-md transition-shadow text-left flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center text-[#e0822d]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-['Manrope'] font-bold text-lg text-slate-900 dark:text-white">
                    Traçabilité &amp; Audit
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                    Registres immuables SHA-256, rapports horodatés et preuves réglementaires prêtes pour l'audit.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e14] border border-slate-200/90 dark:border-white/[0.07] shadow-2xs hover:shadow-md transition-shadow text-left flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center text-[#e0822d]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="font-['Manrope'] font-bold text-lg text-slate-900 dark:text-white">
                    Conformité DORA
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                    Contrôles réglementaires, rapports de résilience opérationnelle et plan de continuité d'activité TIC.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e14] border border-slate-200/90 dark:border-white/[0.07] shadow-2xs hover:shadow-md transition-shadow text-left flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center text-[#e0822d]">
                    <Radio className="w-5 h-5" />
                  </div>
                  <h3 className="font-['Manrope'] font-bold text-lg text-slate-900 dark:text-white">
                    Supervision temps réel
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                    Ingestion IoT haute fréquence, capteurs environnementaux, jumeaux 3D et tableaux de bord décisionnels.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ==============================================================
            4. SECTION 03 : SÉCURITÉ & IDENTITÉ (Matrice RBAC + Hub Visual)
        ============================================================== */}
        <section id="securite" className="py-20 bg-slate-50/70 dark:bg-[#0a0a0e] border-t border-slate-100 dark:border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Left Column: Photographic RBAC Matrix Visual (7 cols) */}
              <div className="lg:col-span-7 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900 group">
                  <img
                    src="/banners/banner-2.png"
                    alt="SENSORIUM CAFM Pro — Matrice RBAC d'identité et de rôles"
                    className="w-full h-[380px] sm:h-[440px] object-cover object-center filter contrast-[1.02] brightness-[0.98]"
                    loading="lazy"
                  />

                  {/* Floating Tags */}
                  <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200 text-xs font-mono text-slate-800 shadow-sm">
                    <span className="font-bold text-[#e0822d]">RBAC Dynamic Matrix</span>
                    <span className="text-slate-400 ml-1">· rbac.service.ts</span>
                  </div>

                  <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200 text-xs font-mono text-slate-800 shadow-sm hidden sm:block">
                    <span className="font-bold text-[#e0822d]">Affiche #2 · Zero-Trust</span>
                  </div>

                  <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs font-mono text-white shadow-md">
                    <span>Sovereign SSO / mTLS Gateway</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Text & Bullets (5 cols) */}
              <div className="lg:col-span-5 space-y-6 text-left">
                
                <div className="text-xs font-mono font-bold tracking-wider text-[#d97706] uppercase">
                  ✦ SÉCURITÉ &amp; IDENTITÉ
                </div>

                <h2 className="font-['Manrope'] font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight leading-tight">
                  Une identité maîtrisée, une confiance renforcée
                </h2>

                <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                  Contrôlez les accès, protégez vos données et assurez une authentification continue avec des technologies de pointe (RBAC, SSO, mTLS, MFA).
                </p>

                <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700 dark:text-neutral-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#e0822d] shrink-0" />
                    <span>RBAC dynamique et granulaire par tenant</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#e0822d] shrink-0" />
                    <span>SSO / MFA / mTLS avec attestations cryptographiques</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#e0822d] shrink-0" />
                    <span>Traçabilité complète des accès et sessions actives</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#e0822d] shrink-0" />
                    <span>Détection des anomalies et prévention des fraudes (Impossible Travel)</span>
                  </li>
                </ul>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={onEnterDashboard}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/[0.1] hover:border-slate-400 dark:hover:border-white/[0.2] bg-white dark:bg-white/[0.05] text-slate-800 dark:text-neutral-200 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <span>Explorer la sécurité</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#d97706]" />
                  </button>

                  <button
                    onClick={() => setIsGalleryOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 cursor-pointer"
                  >
                    <span>Affiches Sécurité →</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ==============================================================
            5. SECTION 04 : CONFORMITÉ DORA ET PLUS ENCORE
        ============================================================== */}
        <section id="conformite" className="py-20 bg-white dark:bg-[#070709] border-t border-slate-100 dark:border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Left Column: Headlines & Checklist (6 cols) */}
              <div className="lg:col-span-6 space-y-6 text-left">
                
                <div className="text-xs font-mono font-bold tracking-wider text-[#d97706] uppercase">
                  ✦ CONFORMITÉ
                </div>

                <h2 className="font-['Manrope'] font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight leading-tight">
                  DORA et plus encore
                </h2>

                <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed max-w-lg">
                  Anticipez les réglementations et gardez une longueur d'avance avec une plateforme pensée dès l'origine pour la conformité.
                </p>

                <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700 dark:text-neutral-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#e0822d] shrink-0" />
                    <span>DORA Art. 24 — Gestion des risques TIC</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#e0822d] shrink-0" />
                    <span>Audit et rapports automatisés en 1 clic</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#e0822d] shrink-0" />
                    <span>Preuves immuables et horodatées cryptographiquement</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#e0822d] shrink-0" />
                    <span>ISO 27001 / RGPD / Normes sectorielles (CSRD Scope 1-3)</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <button
                    onClick={onEnterDashboard}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/[0.1] hover:border-slate-400 dark:hover:border-white/[0.2] bg-white dark:bg-white/[0.05] text-slate-800 dark:text-neutral-200 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <span>Découvrir la conformité</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#d97706]" />
                  </button>
                </div>

              </div>

              {/* Right Column: Holographic Shield & DORA Art. 24 HUD (6 cols) */}
              <div className="lg:col-span-6">
                <div className="relative rounded-2xl p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-950 to-neutral-900 text-white shadow-xl border border-slate-800 overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-8">
                  
                  <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

                  <div className="space-y-4 text-left z-10">
                    <div className="text-xs font-mono font-bold tracking-wider text-amber-300 uppercase">
                      DORA Art. 24 Compliance
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-400" />
                        <span>Risk Management</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-400" />
                        <span>Incident Reporting</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-400" />
                        <span>Testing &amp; Resilience</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-400" />
                        <span>Third-Party Management</span>
                      </li>
                    </ul>
                  </div>

                  <div className="relative z-10 flex items-center justify-center">
                    <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.25)]">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
                        <Check className="w-12 h-12 text-white stroke-[2.5]" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ==============================================================
            6. BANDEAU DE STATISTIQUES EN 4 COLONNES
        ============================================================== */}
        <section className="py-10 bg-slate-50 dark:bg-[#0a0a0e] border-y border-slate-200/80 dark:border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-[#e0822d] shadow-2xs shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-['Manrope'] text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">500+</div>
                  <div className="text-xs text-slate-500 dark:text-neutral-400">Bâtiments &amp; sites gérés</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-[#e0822d] shadow-2xs shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-['Manrope'] text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">99,99%</div>
                  <div className="text-xs text-slate-500 dark:text-neutral-400">Disponibilité de la plateforme</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-[#e0822d] shadow-2xs shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-['Manrope'] text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">&lt; 200 ms</div>
                  <div className="text-xs text-slate-500 dark:text-neutral-400">Temps de réponse audit</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-[#e0822d] shadow-2xs shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-['Manrope'] text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">100%</div>
                  <div className="text-xs text-slate-500 dark:text-neutral-400">Souveraineté des données</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ==============================================================
            7. CALL TO ACTION FINAL
        ============================================================== */}
        <section id="contact" className="py-20 bg-slate-900 text-white relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none bg-cover bg-center"
            style={{ backgroundImage: `url('/banners/banner-3.png')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950" />

          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center space-y-6">
            <h2 className="font-['Manrope'] font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
              Prêt à transformer votre gestion opérationnelle ?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Contactez notre équipe pour une démonstration personnalisée et découvrez la puissance de SENSORIUM CAFM PRO sur vos propres sites.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onEnterDashboard}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#e78b39] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white font-['Manrope'] font-semibold text-xs tracking-wide shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Demander une démo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsGalleryOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-['Manrope'] font-semibold text-xs cursor-pointer transition-all"
              >
                <Layers className="w-4 h-4 text-orange-400" />
                <span>Voir les 28 affiches</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ==============================================================
            8. FOOTER ÉPURÉ AVEC LIENS VERS LES 20 PAGES DU SITE VITRINE
          ============================================================== */}
      <footer className="py-12 bg-white dark:bg-[#070709] border-t border-slate-200/80 dark:border-white/[0.08] text-xs text-slate-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-white/[0.06]">
            {/* Logo and Tagline with Full Official Logo */}
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 rounded-lg flex items-center justify-center bg-white shadow-2xs border border-slate-200 p-1">
                <img src="/logo-full.png" alt="SENSORIUM CAFM PRO Logo" className="h-8 object-contain" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-400">
                  Plus qu'une plateforme, un écosystème de confiance pour vos infrastructures.
                </div>
              </div>
            </div>

            {/* Quick Gallery Trigger in Footer */}
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 font-semibold text-xs hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Affiches Officielles (28)</span>
            </button>
          </div>

          {/* Site Directory: All site vitrine pages accessible */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-left py-2">
            <div>
              <div className="font-bold text-slate-900 dark:text-white mb-2.5">Plateforme</div>
              <ul className="space-y-1.5 text-slate-600 dark:text-neutral-400">
                <li><a href="#plateforme" className="hover:text-orange-600 dark:hover:text-orange-400">Fonctionnalités</a></li>
                <li><a href="/site/solutions.html" className="hover:text-orange-600 dark:hover:text-orange-400">Solutions par métier</a></li>
                <li><a href="/site/architecture.html" className="hover:text-orange-600 dark:hover:text-orange-400">Architecture système</a></li>
                <li><a href="/site/jumeau_numerique_3d.html" className="hover:text-orange-600 dark:hover:text-orange-400">Jumeau Numérique 3D</a></li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white mb-2.5">Sécurité &amp; RSE</div>
              <ul className="space-y-1.5 text-slate-600 dark:text-neutral-400">
                <li><a href="#securite" className="hover:text-orange-600 dark:hover:text-orange-400">Sécurité &amp; RBAC</a></li>
                <li><a href="#conformite" className="hover:text-orange-600 dark:hover:text-orange-400">Conformité DORA</a></li>
                <li><a href="/site/esg_carbon.html" className="hover:text-orange-600 dark:hover:text-orange-400">Bilan Carbone &amp; ESG</a></li>
                <li><a href="/site/authentification.html" className="hover:text-orange-600 dark:hover:text-orange-400">Authentification SSO</a></li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white mb-2.5">Ressources &amp; ROI</div>
              <ul className="space-y-1.5 text-slate-600 dark:text-neutral-400">
                <li><a href="/site/benefices_roi.html" className="hover:text-orange-600 dark:hover:text-orange-400">Calculateur de ROI</a></li>
                <li><a href="/site/temoignages.html" className="hover:text-orange-600 dark:hover:text-orange-400">Témoignages Clients</a></li>
                <li><a href="/site/developers.html" className="hover:text-orange-600 dark:hover:text-orange-400">API Développeurs</a></li>
                <li><a href="/site/tarifs.html" className="hover:text-orange-600 dark:hover:text-orange-400">Plans &amp; Tarifs</a></li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white mb-2.5">Entreprise</div>
              <ul className="space-y-1.5 text-slate-600 dark:text-neutral-400">
                <li><a href="/site/demo.html" className="hover:text-orange-600 dark:hover:text-orange-400">Demander une démo</a></li>
                <li><a href="/site/mentions-legales.html" className="hover:text-orange-600 dark:hover:text-orange-400">Mentions légales</a></li>
                <li><a href="/site/conditions.html" className="hover:text-orange-600 dark:hover:text-orange-400">Conditions générales</a></li>
                <li><a href="/site/regles.html" className="hover:text-orange-600 dark:hover:text-orange-400">Règles de confidentialité</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 dark:text-neutral-500 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
            <div>
              © {new Date().getFullYear()} SENSORIUM CAFM PRO. Tous droits réservés.
            </div>
            <div className="flex items-center gap-5">
              <a href="/site/mentions-legales.html" className="hover:text-slate-600 dark:hover:text-neutral-300 transition-colors">Mentions légales</a>
              <a href="/site/regles.html" className="hover:text-slate-600 dark:hover:text-neutral-300 transition-colors">Confidentialité</a>
              <span className="text-slate-300 dark:text-neutral-600">|</span>
              <span className="text-slate-600 dark:text-neutral-400 font-medium">Français ▾</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Modal Lightbox for 28 High-Resolution Posters */}
      <PostersGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onEnterDashboard={onEnterDashboard}
        onLaunchCockpit={onLaunchCockpit}
      />

    </div>
  );
};
