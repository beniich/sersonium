import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  Box, 
  Wrench, 
  ShieldCheck, 
  FileText, 
  Clock, 
  Radio, 
  CheckCircle2, 
  ArrowRight, 
  ChevronDown, 
  Globe, 
  Menu,
  X,
  Play,
  Check,
  Send,
  Cloud,
  FileCheck,
  Cpu,
  LayoutDashboard,
  Sparkles,
  UserCheck,
  LogOut
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { PageEnergie } from './vitrine/PageEnergie';
import { PageSecurite } from './vitrine/PageSecurite';
import { PageConformite } from './vitrine/PageConformite';
import { PageFonctionnalites } from './vitrine/PageFonctionnalites';
import { PageCloud } from './vitrine/PageCloud';
import { SensoriumAuthModal } from './SensoriumAuthModal';

type VitrinePage = 'accueil' | 'plateforme' | 'fonctionnalites' | 'securite' | 'conformite' | 'cloud' | 'apropos' | 'contact';

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
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: '', email: '', company: '', phone: '', message: '' });
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [activePage, setActivePage] = useState<VitrinePage>('accueil');

  // Gestion d'authentification et Inscription (Registration Guard)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'register' | 'login' | 'demo'>('register');
  const [registeredUser, setRegisteredUser] = useState<{ name: string; email: string; company?: string; role?: string } | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sensorium_registered_user');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  // Sas d'accès au dashboard : si pas encore enregistré / connecté, ouvrir la modale d'inscription
  const handleRequireAuthOrEnter = (tab: 'register' | 'login' | 'demo' = 'register') => {
    if (registeredUser || user) {
      onEnterDashboard();
    } else {
      setAuthModalTab(tab);
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = (userData?: any) => {
    if (userData) {
      setRegisteredUser(userData);
    }
    onEnterDashboard();
  };

  const handleUserLogout = () => {
    localStorage.removeItem('sensorium_registered_user');
    localStorage.removeItem('sensorium_user_session');
    setRegisteredUser(null);
  };

  const navigateTo = (page: VitrinePage) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
    setTimeout(() => {
      setIsDemoModalOpen(false);
      setDemoSubmitted(false);
      setDemoForm({ name: '', email: '', company: '', phone: '', message: '' });
    }, 2200);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-['Inter',sans-serif] selection:bg-[#e0822d]/20 selection:text-[#e0822d] relative antialiased">
      
      {/* ═══════════════════════════════════════════════════════════
          1. HEADER / NAVBAR
      ════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo SENSORIUM CAFM PRO */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('accueil')}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-xs border border-slate-200 overflow-hidden p-1 shrink-0">
              <img src="/logo-icon.png" alt="SENSORIUM Icon" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-['Manrope'] font-extrabold text-base tracking-tight text-slate-900 leading-none">
                SENSORIUM
              </span>
              <span className="text-[10px] tracking-[0.25em] font-semibold text-slate-500 uppercase mt-0.5">
                CAFM PRO
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-slate-600">
            <button onClick={() => navigateTo('accueil')} className={`${activePage === 'accueil' ? 'text-slate-900 font-semibold border-b-2 border-[#e0822d]' : 'hover:text-slate-900 transition-colors'} cursor-pointer pb-1`}>
              Accueil
            </button>
            <button onClick={() => navigateTo('plateforme')} className={`flex items-center gap-1 ${activePage === 'plateforme' ? 'text-slate-900 font-semibold border-b-2 border-[#e0822d]' : 'hover:text-slate-900 transition-colors'} cursor-pointer pb-1`}>
              Plateforme <ChevronDown className="w-3 h-3 text-slate-400 mt-0.5" />
            </button>
            <button onClick={() => navigateTo('fonctionnalites')} className={`${activePage === 'fonctionnalites' ? 'text-slate-900 font-semibold border-b-2 border-[#e0822d]' : 'hover:text-slate-900 transition-colors'} cursor-pointer pb-1`}>
              Fonctionnalités
            </button>
            <button onClick={() => navigateTo('securite')} className={`flex items-center gap-1 ${activePage === 'securite' ? 'text-slate-900 font-semibold border-b-2 border-[#e0822d]' : 'hover:text-slate-900 transition-colors'} cursor-pointer pb-1`}>
              Sécurité <ChevronDown className="w-3 h-3 text-slate-400 mt-0.5" />
            </button>
            <button onClick={() => navigateTo('conformite')} className={`flex items-center gap-1 ${activePage === 'conformite' ? 'text-slate-900 font-semibold border-b-2 border-[#e0822d]' : 'hover:text-slate-900 transition-colors'} cursor-pointer pb-1`}>
              Conformité <ChevronDown className="w-3 h-3 text-slate-400 mt-0.5" />
            </button>
            <button onClick={() => navigateTo('cloud')} className={`flex items-center gap-1 ${activePage === 'cloud' ? 'text-slate-900 font-semibold border-b-2 border-[#e0822d]' : 'hover:text-slate-900 transition-colors'} cursor-pointer pb-1`}>
              Cloud <ChevronDown className="w-3 h-3 text-slate-400 mt-0.5" />
            </button>
            <button onClick={() => navigateTo('apropos')} className={`flex items-center gap-1 ${activePage === 'apropos' ? 'text-slate-900 font-semibold border-b-2 border-[#e0822d]' : 'hover:text-slate-900 transition-colors'} cursor-pointer pb-1`}>
              À propos <ChevronDown className="w-3 h-3 text-slate-400 mt-0.5" />
            </button>
            <button onClick={() => navigateTo('contact')} className={`${activePage === 'contact' ? 'text-slate-900 font-semibold border-b-2 border-[#e0822d]' : 'hover:text-slate-900 transition-colors'} cursor-pointer pb-1`}>
              Contact
            </button>
            
            {/* Direct Dashboard Link */}
            <button 
              onClick={() => handleRequireAuthOrEnter(registeredUser ? 'login' : 'register')} 
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-[#e0822d] font-bold text-xs hover:from-[#e0822d] hover:to-orange-600 hover:text-white transition-all shadow-xs cursor-pointer group"
              title="Accéder au dashboard opérationnel complet (inscription / connexion requise)"
            >
              <LayoutDashboard className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>{registeredUser ? 'Mon Dashboard' : 'Dashboard'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </button>
          </nav>

          {/* Right Action: Inscription / Connexion / Dashboard / Démo */}
          <div className="flex items-center gap-2">
            {registeredUser ? (
              /* Utilisateur Enregistré / Connecté */
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="font-bold text-slate-800 truncate max-w-[120px]">{registeredUser.name}</span>
                  {registeredUser.company && (
                    <span className="text-[10px] text-slate-500 font-medium hidden xl:inline">({registeredUser.company})</span>
                  )}
                  <button 
                    onClick={handleUserLogout} 
                    title="Se déconnecter" 
                    className="text-slate-400 hover:text-red-500 ml-1 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={onEnterDashboard}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-['Manrope'] font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-orange-400" />
                  <span>Mon Dashboard</span>
                </button>
              </div>
            ) : (
              /* Visiteur Non Enregistré : Inscription & Connexion */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRequireAuthOrEnter('login')}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-orange-600 px-3 py-2 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Connexion
                </button>

                <button
                  onClick={() => handleRequireAuthOrEnter('register')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-['Manrope'] font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
                  title="Créer un compte entreprise et accéder au Dashboard"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-orange-400" />
                  <span>Accéder au Dashboard</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="hidden lg:inline-flex px-4 py-2 rounded-full bg-[#e0822d] hover:bg-[#c66e20] text-white font-['Manrope'] font-semibold text-xs tracking-wide shadow-sm shadow-orange-500/20 hover:shadow-md transition-all cursor-pointer"
            >
              Démo
            </button>

            {/* Language Switcher */}
            <div 
              className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-600 pl-1 cursor-pointer hover:text-slate-900 select-none"
              onClick={() => setActiveLang(activeLang === 'FR' ? 'EN' : 'FR')}
            >
              <span>{activeLang}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-6 py-4 bg-white border-b border-slate-100 space-y-3 text-left animate-in slide-in-from-top-2 duration-150">
            {(['accueil', 'plateforme', 'fonctionnalites', 'securite', 'conformite', 'cloud', 'apropos', 'contact'] as VitrinePage[]).map((page) => (
              <button key={page} onClick={() => navigateTo(page)} className={`block text-sm w-full text-left py-1 capitalize ${activePage === page ? 'font-semibold text-orange-600' : 'text-slate-600'}`}>
                {page === 'fonctionnalites' ? 'Fonctionnalités' : page === 'apropos' ? 'À propos' : page.charAt(0).toUpperCase() + page.slice(1)}
              </button>
            ))}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button 
                onClick={() => { setMobileMenuOpen(false); handleRequireAuthOrEnter(registeredUser ? 'login' : 'register'); }} 
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md"
              >
                <LayoutDashboard className="w-4 h-4 text-orange-400" />
                <span>{registeredUser ? `Mon Dashboard (${registeredUser.name})` : 'Inscription / Connexion Dashboard'}</span>
              </button>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">Langue</span>
                <button onClick={() => setActiveLang(activeLang === 'FR' ? 'EN' : 'FR')} className="text-xs font-semibold text-slate-700 px-2 py-1 rounded bg-slate-100">
                  {activeLang}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════
          SUB-PAGES ROUTER
      ══════════════════════════════════════════ */}
      {activePage === 'plateforme' && <main><PageEnergie onOpenDemo={() => setIsDemoModalOpen(true)} /></main>}
      {activePage === 'fonctionnalites' && <main><PageFonctionnalites onOpenDemo={() => setIsDemoModalOpen(true)} onEnterDashboard={onEnterDashboard} /></main>}
      {activePage === 'securite' && <main><PageSecurite onOpenDemo={() => setIsDemoModalOpen(true)} onEnterDashboard={onEnterDashboard} /></main>}
      {activePage === 'conformite' && <main><PageConformite onOpenDemo={() => setIsDemoModalOpen(true)} /></main>}
      {activePage === 'cloud' && <main><PageCloud onOpenDemo={() => setIsDemoModalOpen(true)} /></main>}
      {activePage === 'apropos' && (
        <main>
          <div className="min-h-[70vh] bg-white">
            <section className="py-20 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
              <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  À PROPOS DE SENSORIUM
                </div>
                <h1 className="font-['Manrope'] font-extrabold text-4xl sm:text-5xl text-slate-900 tracking-tight leading-tight">
                  Une plateforme pensée pour l'excellence opérationnelle
                </h1>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                  SENSORIUM CAFM PRO est né de la conviction que la gestion des infrastructures mérite une technologie de niveau enterprise — souveraine, traçable et conforme aux normes les plus exigeantes.
                </p>
              </div>
            </section>
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { icon: '🎯', title: 'Notre Mission', desc: "Fournir aux gestionnaires d'infrastructures une plateforme unifiée, sécurisée et conforme qui automatise les processus et garantit la traçabilité totale." },
                    { icon: '🔬', title: 'Notre Vision', desc: 'Devenir la référence européenne des solutions CAFM souveraines, en combinant IA prédictive, conformité DORA/RGPD et infrastructure cloud haute disponibilité.' },
                    { icon: '💡', title: 'Nos Valeurs', desc: 'Transparence, sécurité by design, excellence opérationnelle et accompagnement personnalisé de chaque client dans sa transformation numérique.' },
                  ].map((v) => (
                    <div key={v.title} className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-orange-300/50 hover:bg-orange-50/20 transition-all">
                      <div className="text-4xl mb-4">{v.icon}</div>
                      <h3 className="font-['Manrope'] font-bold text-lg text-slate-900 mb-3">{v.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{v.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <section className="py-12 bg-slate-900 text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
                  {[
                    { val: '500+', label: 'Bâtiments & sites gérés' },
                    { val: '99,99%', label: 'SLA garanti' },
                    { val: '< 200ms', label: 'Temps de réponse' },
                    { val: '100%', label: 'Souveraineté des données' },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-3xl font-black text-orange-400 mb-1">{s.val}</div>
                      <div className="text-xs text-slate-400">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <section className="py-16 bg-white border-t border-slate-100">
              <div className="max-w-2xl mx-auto px-4 text-center space-y-6">
                <h2 className="font-['Manrope'] font-bold text-3xl text-slate-900">Rejoignez des centaines d'organisations qui nous font confiance</h2>
                <p className="text-slate-500 text-sm">Prêt à moderniser votre gestion opérationnelle ? Parlons-en.</p>
                <button onClick={() => setIsDemoModalOpen(true)} className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-xl shadow-orange-500/30 hover:brightness-105 transition-all">
                  Demander une démo →
                </button>
              </div>
            </section>
          </div>
        </main>
      )}
      {activePage === 'contact' && (
        <main>
          <div className="min-h-[60vh] flex items-center justify-center bg-white">
            <div className="text-center space-y-6 max-w-md px-6">
              <div className="text-6xl">📧</div>
              <h2 className="text-3xl font-black text-slate-900">Contactez-nous</h2>
              <p className="text-slate-500 text-sm">Notre équipe est disponible pour répondre à toutes vos questions sur SENSORIUM CAFM PRO.</p>
              <button onClick={() => setIsDemoModalOpen(true)} className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-orange-500/30 transition hover:brightness-105">
                Demander une démo →
              </button>
            </div>
          </div>
        </main>
      )}

      {activePage === 'accueil' && (
        <main>
        {/* ═══════════════════════════════════════════════════════════
            2. HERO SECTION
        ════════════════════════════════════════════════════════════ */}
        <section id="accueil" className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50/70 via-white to-white pt-12 sm:pt-20 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              
              {/* Left Column (5 cols) */}
              <div className="lg:col-span-5 space-y-6 text-left">
                
                {/* Pre-title */}
                <div className="text-[11px] font-mono font-bold tracking-[0.2em] text-slate-500 uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e0822d]" />
                  <span>SENSORIUM CAFM PRO</span>
                </div>

                {/* Main Headline */}
                <h1 className="font-['Manrope'] font-extrabold text-3xl sm:text-4xl lg:text-[42px] leading-[1.15] text-slate-900 tracking-tight">
                  La supervision opérationnelle au service de votre performance
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg font-normal">
                  Une plateforme unifiée pour la gestion des infrastructures, la maintenance, la sécurité, la conformité et la traçabilité.
                </p>

                {/* 4 Feature Pills in a row */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-700 shadow-2xs">
                    <Box className="w-3.5 h-3.5 text-[#e0822d]" />
                    <span>CAFM / GMAO</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-700 shadow-2xs">
                    <Lock className="w-3.5 h-3.5 text-[#e0822d]" />
                    <span>Sécurité &amp; Accès</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-700 shadow-2xs">
                    <FileCheck className="w-3.5 h-3.5 text-[#e0822d]" />
                    <span>Conformité &amp; Audit</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-700 shadow-2xs">
                    <Cloud className="w-3.5 h-3.5 text-[#e0822d]" />
                    <span>Cloud &amp; IoT</span>
                  </div>
                </div>

                {/* 2 Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <button
                    onClick={() => setIsDemoModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#e0822d] hover:bg-[#c66e20] text-white font-['Manrope'] font-semibold text-xs tracking-wide shadow-md shadow-orange-500/25 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <span>Demander une démo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleRequireAuthOrEnter(registeredUser ? 'login' : 'register')}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-['Manrope'] font-semibold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white">
                      <LayoutDashboard className="w-3 h-3 group-hover:scale-110 transition-transform" />
                    </div>
                    <span>{registeredUser ? 'Ouvrir mon Dashboard' : 'Créer un compte & Ouvrir le Dashboard'}</span>
                  </button>
                </div>

              </div>

              {/* Right Column: Master Hero Visual (7 cols) */}
              <div className="lg:col-span-7 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-900 group">
                  <img
                    src="/banners/banner-1.png"
                    alt="SENSORIUM CAFM Pro — Architecture d'audit immuable et traçabilité"
                    className="w-full h-[400px] sm:h-[480px] object-cover object-center filter contrast-[1.02] brightness-[0.98] group-hover:scale-101 transition-transform duration-700"
                    loading="eager"
                  />
                  {/* Subtle Gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            3. SECTION "NOS MODULES" (Horizontal Split Layout)
        ════════════════════════════════════════════════════════════ */}
        <section id="plateforme" className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              
              {/* Left Column: Headlines (4 cols) */}
              <div className="lg:col-span-4 space-y-4 text-left lg:sticky lg:top-28">
                <div className="text-xs font-mono font-bold tracking-wider text-[#e0822d] uppercase">
                  ✦ NOS MODULES
                </div>
                <h2 className="font-['Manrope'] font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
                  Une plateforme complète pour une gestion intelligente
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  SENSORIUM CAFM PRO centralise vos données et automatise vos processus pour une supervision en temps réel, fiable et sécurisée.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onEnterDashboard}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#e0822d] hover:text-[#c66e20] transition-colors cursor-pointer"
                  >
                    <span>Explorer toutes les fonctionnalités</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: 2x3 Grid of 6 Cards (8 cols) */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                
                {/* Card 1: Gestion des actifs */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-left flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#e0822d] group-hover:scale-105 transition-transform">
                      <Box className="w-5 h-5" />
                    </div>
                    <h3 className="font-['Manrope'] font-bold text-base text-slate-900">
                      Gestion des actifs
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Inventaire, cycle de vie, maintenance
                    </p>
                  </div>
                </div>

                {/* Card 2: Maintenance (GMAO) */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-left flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#e0822d] group-hover:scale-105 transition-transform">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <h3 className="font-['Manrope'] font-bold text-base text-slate-900">
                      Maintenance (GMAO)
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Planification, interventions, coûts
                    </p>
                  </div>
                </div>

                {/* Card 3: Gestion des accès */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-left flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#e0822d] group-hover:scale-105 transition-transform">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h3 className="font-['Manrope'] font-bold text-base text-slate-900">
                      Gestion des accès
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      RBAC, SSO, identité numérique
                    </p>
                  </div>
                </div>

                {/* Card 4: Traçabilité & Audit */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-left flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#e0822d] group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-['Manrope'] font-bold text-base text-slate-900">
                      Traçabilité &amp; Audit
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Registres immuables, preuves réglementaires
                    </p>
                  </div>
                </div>

                {/* Card 5: Conformité DORA */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-left flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#e0822d] group-hover:scale-105 transition-transform">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="font-['Manrope'] font-bold text-base text-slate-900">
                      Conformité DORA
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Contrôles, rapports, continuité d'activité
                    </p>
                  </div>
                </div>

                {/* Card 6: Supervision temps réel */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-left flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#e0822d] group-hover:scale-105 transition-transform">
                      <Radio className="w-5 h-5" />
                    </div>
                    <h3 className="font-['Manrope'] font-bold text-base text-slate-900">
                      Supervision temps réel
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      IoT, capteurs, tableaux de bord
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            4. SECTION "SÉCURITÉ & IDENTITÉ"
        ════════════════════════════════════════════════════════════ */}
        <section id="securite" className="py-20 bg-slate-50/60 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Left Column: Visual (7 cols) */}
              <div className="lg:col-span-7 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900 group">
                  <img
                    src="/banners/banner-2.png"
                    alt="SENSORIUM CAFM Pro — Sécurité intelligente et confiance totale"
                    className="w-full h-[380px] sm:h-[440px] object-cover object-center filter contrast-[1.02] brightness-[0.98]"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Right Column: Text & Checklist (5 cols) */}
              <div className="lg:col-span-5 space-y-6 text-left">
                
                <div className="text-xs font-mono font-bold tracking-wider text-[#e0822d] uppercase">
                  ✦ SÉCURITÉ &amp; IDENTITÉ
                </div>

                <h2 className="font-['Manrope'] font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
                  Une identité maîtrisée, une confiance renforcée
                </h2>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Contrôlez les accès, protégez vos données et assurez une authentification continue avec des technologies de pointe (RBAC, SSO, mTLS, MFA).
                </p>

                <ul className="space-y-3.5 pt-1 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#e0822d] flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>RBAC dynamique et granulaire</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#e0822d] flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>SSO / MFA / mTLS</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#e0822d] flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>Traçabilité complète des accès</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#e0822d] flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>Détection des anomalies et prévention des fraudes</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <button
                    onClick={() => { if (onNavigate) onNavigate('security'); else onEnterDashboard(); }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <span>En savoir plus</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#e0822d]" />
                  </button>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            5. SECTION "CONFORMITÉ DORA"
        ════════════════════════════════════════════════════════════ */}
        <section id="conformite" className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Left Column: Headlines & Checklist (6 cols) */}
              <div className="lg:col-span-6 space-y-6 text-left">
                
                <div className="text-xs font-mono font-bold tracking-wider text-[#e0822d] uppercase">
                  ✦ CONFORMITÉ
                </div>

                <h2 className="font-['Manrope'] font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
                  DORA et plus encore
                </h2>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Anticipez les réglementations et gardez une longueur d'avance avec une plateforme pensée dès l'origine pour la conformité.
                </p>

                <ul className="space-y-3.5 pt-1 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#e0822d] flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>DORA Art. 24 – Gestion des risques TIC</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#e0822d] flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>Audit et rapports automatisés</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#e0822d] flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>Preuves immuables et horodatées</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#e0822d] flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>ISO 27001 / RGPD / Normes sectorielles</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <button
                    onClick={() => { if (onNavigate) onNavigate('compliance'); else onEnterDashboard(); }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <span>Découvrir la conformité</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#e0822d]" />
                  </button>
                </div>

              </div>

              {/* Right Column: Holographic Card + Shield (6 cols) */}
              <div className="lg:col-span-6">
                <div className="relative rounded-2xl p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-950 to-neutral-900 text-white shadow-xl border border-slate-800 overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-8">
                  
                  <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

                  <div className="space-y-4 text-left z-10">
                    <div className="text-xs font-mono font-bold tracking-wider text-amber-300 uppercase">
                      DORA Art. 24 Compliance
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-amber-400" />
                        <span>Risk Management</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-amber-400" />
                        <span>Incident Reporting</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-amber-400" />
                        <span>Testing &amp; Resilience</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-amber-400" />
                        <span>Third-Party Management</span>
                      </li>
                    </ul>
                  </div>

                  <div className="relative z-10 flex items-center justify-center shrink-0">
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

        {/* ═══════════════════════════════════════════════════════════
            6. BANDEAU DE STATISTIQUES (4 colonnes)
        ════════════════════════════════════════════════════════════ */}
        <section id="apropos" className="py-12 bg-slate-50/80 border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#e0822d] shadow-2xs shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-['Manrope'] text-2xl sm:text-3xl font-extrabold text-slate-900">500+</div>
                  <div className="text-xs text-slate-500">Bâtiments &amp; sites gérés</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#e0822d] shadow-2xs shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-['Manrope'] text-2xl sm:text-3xl font-extrabold text-slate-900">99,99%</div>
                  <div className="text-xs text-slate-500">Disponibilité de la plateforme</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#e0822d] shadow-2xs shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-['Manrope'] text-2xl sm:text-3xl font-extrabold text-slate-900">&lt; 200 ms</div>
                  <div className="text-xs text-slate-500">Temps de réponse audit</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#e0822d] shadow-2xs shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-['Manrope'] text-2xl sm:text-3xl font-extrabold text-slate-900">100%</div>
                  <div className="text-xs text-slate-500">Souveraineté des données</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            7. CALL TO ACTION FINAL & BANNIÈRE PRE-FOOTER
        ════════════════════════════════════════════════════════════ */}
        <section id="contact" className="py-16 bg-[#121316] text-white relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-25 pointer-events-none bg-cover bg-center"
            style={{ backgroundImage: `url('/banners/banner-3.png')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0d0f] via-[#121316]/95 to-[#0c0d0f]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Brand Statement (4 cols) */}
              <div className="lg:col-span-4 space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 p-1">
                    <img src="/logo-icon.png" alt="SENSORIUM" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="font-['Manrope'] font-extrabold text-base tracking-tight text-white leading-none">
                      SENSORIUM
                    </div>
                    <div className="text-[10px] tracking-[0.25em] font-semibold text-orange-400 uppercase mt-0.5">
                      CAFM PRO
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                  Plus qu'une plateforme, un écosystème de confiance pour vos infrastructures.
                </p>
              </div>

              {/* Right Column: CTA Box (8 cols) */}
              <div className="lg:col-span-8 p-8 sm:p-10 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-md">
                  <h3 className="font-['Manrope'] font-bold text-2xl text-white tracking-tight">
                    Prêt à transformer votre gestion opérationnelle ?
                  </h3>
                  <p className="text-xs text-slate-400">
                    Contactez notre équipe pour une démonstration personnalisée.
                  </p>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => setIsDemoModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#e0822d] hover:bg-[#c66e20] text-white font-['Manrope'] font-semibold text-xs tracking-wide shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
                  >
                    <span>Demander une démo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Horizontal Mini Menu in Pre-Footer */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-end gap-6 text-xs text-slate-400">
              <button onClick={() => navigateTo('accueil')} className="hover:text-white transition-colors cursor-pointer">Accueil</button>
              <button onClick={() => navigateTo('plateforme')} className="hover:text-white transition-colors cursor-pointer">Plateforme</button>
              <button onClick={() => navigateTo('securite')} className="hover:text-white transition-colors cursor-pointer">Sécurité</button>
              <button onClick={() => navigateTo('conformite')} className="hover:text-white transition-colors cursor-pointer">Conformité</button>
              <button onClick={() => navigateTo('cloud')} className="hover:text-white transition-colors cursor-pointer">Cloud</button>
              <button onClick={() => navigateTo('apropos')} className="hover:text-white transition-colors cursor-pointer">À propos</button>
              <button onClick={() => navigateTo('contact')} className="hover:text-white transition-colors cursor-pointer">Contact</button>
            </div>

          </div>
        </section>
      </main>
      )}

      {/* ═══════════════════════════════════════════════════════════
          8. FOOTER
      ════════════════════════════════════════════════════════════ */}
      <footer className="py-6 bg-white border-t border-slate-100 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-50 border border-orange-200 overflow-hidden p-0.5 shrink-0">
              <img src="/logo-icon.png" alt="SENSORIUM" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-['Manrope'] font-bold text-xs text-slate-800 leading-none block">SENSORIUM</span>
              <span className="text-[9px] tracking-widest font-semibold text-slate-400 uppercase">CAFM PRO</span>
            </div>
          </div>
          {/* Links */}
          <div className="flex items-center gap-5">
            <button onClick={() => {}} className="hover:text-slate-800 transition-colors cursor-pointer">Mentions légales</button>
            <span>|</span>
            <button onClick={() => {}} className="hover:text-slate-800 transition-colors cursor-pointer">Politique de confidentialité</button>
            <span>|</span>
            <span className="text-slate-700 font-medium cursor-pointer" onClick={() => setActiveLang(activeLang === 'FR' ? 'EN' : 'FR')}>
              {activeLang === 'FR' ? 'Français' : 'English'} ▾
            </span>
          </div>
          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a href="#" aria-label="LinkedIn" className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center transition-colors text-slate-500">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="#" aria-label="YouTube" className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center transition-colors text-slate-500">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="#" aria-label="Twitter/X" className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center transition-colors text-slate-500">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-3 text-center text-[11px] text-slate-400">
          © 2025 SENSORIUM CAFM PRO. Tous droits réservés.
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════
          9. MODAL : DEMANDER UNE DÉMO
      ════════════════════════════════════════════════════════════ */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left relative">
            <button 
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#e0822d]">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Manrope'] font-bold text-xl text-slate-900">Demander une démonstration</h3>
                  <p className="text-xs text-slate-500">Découvrez SENSORIUM CAFM PRO avec un expert produit</p>
                </div>
              </div>

              {demoSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">Demande enregistrée avec succès !</h4>
                  <p className="text-xs text-slate-600">Un conseiller technique vous recontactera sous 24 heures.</p>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nom complet *</label>
                    <input 
                      type="text" 
                      required 
                      value={demoForm.name} 
                      onChange={e => setDemoForm({ ...demoForm, name: e.target.value })}
                      placeholder="Ex : Adam Benaich"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-orange-500 transition-colors" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Email professionnel *</label>
                      <input 
                        type="email" 
                        required 
                        value={demoForm.email} 
                        onChange={e => setDemoForm({ ...demoForm, email: e.target.value })}
                        placeholder="adam@entreprise.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-orange-500 transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Téléphone</label>
                      <input 
                        type="tel" 
                        value={demoForm.phone} 
                        onChange={e => setDemoForm({ ...demoForm, phone: e.target.value })}
                        placeholder="+33 6 12 34 56 78"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-orange-500 transition-colors" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Organisation / Entreprise *</label>
                    <input 
                      type="text" 
                      required 
                      value={demoForm.company} 
                      onChange={e => setDemoForm({ ...demoForm, company: e.target.value })}
                      placeholder="Ex : Airbus, Caisse des Dépôts, TotalEnergies"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-orange-500 transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Message ou besoins spécifiques</label>
                    <textarea 
                      rows={3} 
                      value={demoForm.message} 
                      onChange={e => setDemoForm({ ...demoForm, message: e.target.value })}
                      placeholder="Précisez votre parc immobilier ou vos objectifs (DORA, GMAO, supervision...)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-orange-500 transition-colors resize-none" 
                    />
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsDemoModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2.5 rounded-full bg-[#e0822d] hover:bg-[#c66e20] text-white font-semibold cursor-pointer shadow-md shadow-orange-500/20"
                    >
                      Envoyer ma demande
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modale d'Authentification & Inscription Entreprise (Registration) */}
      <SensoriumAuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        defaultTab={authModalTab}
      />

      {/* Bouton d'accès rapide flottant au Dashboard */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => handleRequireAuthOrEnter(registeredUser ? 'login' : 'register')}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900/95 hover:bg-slate-900 text-white text-xs font-bold shadow-2xl border border-slate-700/80 backdrop-blur-md hover:scale-105 transition-all group cursor-pointer"
          title="Basculer vers le Dashboard exécutif (inscription / connexion requise)"
        >
          <div className="relative">
            <LayoutDashboard className="w-4 h-4 text-orange-400 group-hover:rotate-6 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span>{registeredUser ? 'Mon Dashboard Live' : 'S\'inscrire au Dashboard'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-orange-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
};
