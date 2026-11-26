import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Crown, UserPlus, Globe, Sparkles } from 'lucide-react';
import { useRbac } from '@/hooks/useRbac';
import { useConnectionHealth } from '@/hooks/useConnectionHealth';
import { useTheme } from '../App';
import ConnectionBadge from './ConnectionBadge';
import SubscriptionQuotaCounter from './SubscriptionQuotaCounter';
import UserProfileModal from './UserProfileModal';
import { SensoriumAuthModal } from './SensoriumAuthModal';
import { GoogleLogoIcon } from './ShowcaseViewer';
import authService from '../services/auth.service';
import TrialService, { TrialStatus } from '../services/trial.service';

export interface MasterHeaderProps {
  onOpenMenu?: () => void;
  onOpenEnterpriseLogin?: () => void;
  className?: string;
}

export const MasterHeader: React.FC<MasterHeaderProps> = ({ 
  onOpenMenu, 
  onOpenEnterpriseLogin,
  className = '' 
}) => {
  const navigate = useNavigate();
  const { currentUser, currentTenant } = useRbac();
  const { sla, latency, aiStatus, aiCircuitState, zeroTrustStatus, zeroTrustScore } = useConnectionHealth();
  const { theme, toggleTheme } = useTheme();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'register' | 'login'>('register');
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  const [trialStatus, setTrialStatus] = useState<TrialStatus>(() => TrialService.getTrialStatus());

  useEffect(() => {
    const updateTrial = () => setTrialStatus(TrialService.getTrialStatus());
    window.addEventListener('sensorium:trial_updated', updateTrial);
    window.addEventListener('sensorium:subscription_changed', updateTrial);
    const interval = setInterval(updateTrial, 60000);
    return () => {
      window.removeEventListener('sensorium:trial_updated', updateTrial);
      window.removeEventListener('sensorium:subscription_changed', updateTrial);
      clearInterval(interval);
    };
  }, []);

  const handleGoogleQuickLogin = async () => {
    try {
      setIsGoogleLoggingIn(true);
      await authService.loginWithGoogle();
      window.dispatchEvent(new CustomEvent("sensorium:profile_updated"));
    } catch (e) {
      console.warn("[MasterHeader] Google login error:", e);
      // Ouvre la modale d'auth en secours
      setAuthDefaultTab('login');
      setIsAuthModalOpen(true);
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  // Initiales locales pour profil souverain (zero fuite vers serveurs tiers)
  const initials = currentUser?.name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'EM';

  return (
    <header className={`h-[46px] w-full bg-[#111317] border-b border-white/[0.08] flex items-center justify-between px-3 sm:px-4.5 sticky top-0 z-50 backdrop-blur-md transition-colors ${className}`}>
      
      {/* ZONE 1 : macOS WINDOW CONTROLS & IDENTITÉ SOUVERAINE */}
      <div className="flex items-center gap-3">
        {/* macOS Window Traffic Lights */}
        <div className="flex items-center gap-2 pr-1" data-purpose="window-controls">
          <div 
            onClick={() => navigate('/portal')} 
            className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/40 cursor-pointer hover:opacity-80 transition" 
            title="Retour Portail Public SENSORIUM" 
          />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/40 cursor-pointer hover:opacity-80 transition" title="Réduire" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/40 cursor-pointer hover:opacity-80 transition" title="Plein écran" />
        </div>

        <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

        {onOpenMenu && (
          <button
            onClick={onOpenMenu}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Menu"
            aria-label="Menu"
          >
            <Menu size={16} />
          </button>
        )}

        <div 
          onClick={() => navigate('/portal')}
          className="flex items-center gap-2 cursor-pointer group"
          title="Portail Souverain SENSORIUM"
        >
          <div className="w-6.5 h-6.5 bg-[#1C1E22] rounded-lg flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden p-0.5 border border-white/20">
            <img src="/logo-icon.png" alt="SENSORIUM" className="w-full h-full object-contain" />
          </div>
          <span className="text-white font-bold tracking-tight text-xs uppercase font-mono hidden xs:inline">Sensorium</span>
        </div>

        <div className="h-3.5 w-[1px] bg-white/10 mx-0.5 hidden xs:block" />

        <div 
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] cursor-pointer group transition-all" 
          title="Modifier le nom de l'organisation active"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5FA52]" />
          <span className="text-[11px] text-slate-300 font-medium leading-none truncate max-w-[120px] sm:max-w-[180px] group-hover:text-white transition-colors">
            {currentTenant?.name ?? 'SENSORIUM Démo Corp'}
          </span>
        </div>
      </div>

      {/* ZONE 2 : INDICATEURS VITAUX (Tactile Capsule Pills) */}
      <div className="hidden md:flex items-center gap-4 px-3 py-1 bg-[#181A1F] rounded-full border border-white/[0.08] shadow-xs">
        <HealthMetric label="SLA" value={sla || "99.99%"} color="text-emerald-400" />
        <HealthMetric
          label="AI"
          value={aiStatus || "Active"}
          color={
            aiCircuitState === 'OPEN' ? 'text-red-400' :
            aiCircuitState === 'HALF_OPEN' ? 'text-amber-400' :
            aiCircuitState === 'CLOSED' ? 'text-emerald-400' :
            'text-indigo-400'
          }
          title={
            aiCircuitState === 'OPEN' ? 'Circuit Breaker OPEN — Mode secours SRE actif' :
            aiCircuitState === 'HALF_OPEN' ? 'Circuit Breaker HALF-OPEN — Sonde de test en cours' :
            aiCircuitState === 'CLOSED' ? 'Circuit Breaker CLOSED — Gemini opérationnel' :
            'Circuit Breaker — Statut en cours de chargement'
          }
        />
        <HealthMetric label="LATENCY" value={latency || "42ms"} color="text-cyan-400" />
        <HealthMetric 
          label="SECURITY" 
          value={zeroTrustStatus === 'ALERT' ? `ZT Alert (${zeroTrustScore}%)` : (zeroTrustStatus === 'NOMINAL' ? `ZT (${zeroTrustScore}%)` : `ZT ${zeroTrustScore}%`)} 
          color={zeroTrustStatus === 'ALERT' ? 'text-rose-400' : (zeroTrustStatus === 'NOMINAL' ? 'text-amber-400' : 'text-emerald-400')} 
          title={`Architecture Zero-Trust : ${zeroTrustStatus} (${zeroTrustScore}/100) — Validation contextuelle continue`}
        />
      </div>

      {/* ZONE 3 : THÈME, PROFIL, QUOTAS, ABONNEMENT & ACTIONS */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Bouton de bascule Vitrine & Documentation */}
        <button
          onClick={() => navigate('/site-viewer')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95"
          title="Explorer le Site Vitrine, Solutions & Documentation SENSORIUM"
        >
          <Globe size={12} className="text-[#E5FA52]" />
          <span className="hidden lg:inline">Vitrine &amp; Solutions</span>
        </button>

        {/* Bouton d'Abonnement explicite */}
        <button
          onClick={() => navigate('/pricing')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95"
          title="Consulter les forfaits et gérer votre abonnement SENSORIUM"
        >
          <Crown size={12} className="text-amber-400" />
          <span className="hidden sm:inline">Abonnement</span>
        </button>

        {/* Bouton Connexion Google SSO officiel */}
        <button
          onClick={handleGoogleQuickLogin}
          disabled={isGoogleLoggingIn}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 hover:text-white text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95"
          title="Se connecter avec votre compte Google / Gmail"
        >
          <GoogleLogoIcon size={13} />
          <span className="hidden sm:inline">
            {isGoogleLoggingIn ? "Connexion..." : currentUser?.email?.includes("@") ? "Google Connecté" : "Connexion"}
          </span>
        </button>

        {/* Bouton d'Inscription & Connexion explicite */}
        <button
          onClick={() => {
            setAuthDefaultTab('register');
            setIsAuthModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95"
          title="Créer un compte ou se connecter à la plateforme SENSORIUM"
        >
          <UserPlus size={12} className="text-slate-300" />
          <span className="hidden sm:inline">Inscription</span>
        </button>

        {/* Pass Découverte Gratuit 10 Jours (Tous Services Débloqués) */}
        {trialStatus.isTrialActive ? (
          <div
            onClick={() => navigate('/pricing')}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold cursor-pointer shadow-xs hover:border-amber-400 transition-all select-none"
            title="Pass Découverte 10 Jours Actif — Tous les services Enterprise sont 100% débloqués"
          >
            <Sparkles size={11} className="text-amber-400 animate-pulse shrink-0" />
            <span className="font-bold">Pass 10 J :</span>
            <span className="font-mono text-[11px] text-amber-200">{trialStatus.formattedTime}</span>
          </div>
        ) : (
          <button
            onClick={() => {
              TrialService.activate10DayFreeTrial();
              setTrialStatus(TrialService.getTrialStatus());
            }}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#111317] hover:bg-slate-200 text-xs font-bold cursor-pointer shadow-xs transition-all"
            title="Activer un accès gratuit de 10 jours à tous les services"
          >
            <Sparkles size={11} className="text-amber-500 shrink-0" />
            <span>Pass Gratuit 10 J</span>
          </button>
        )}

        {/* Compteur interactif de quotas d'abonnement & Tokens IA */}
        <SubscriptionQuotaCounter 
          variant="pill" 
          onOpenPricing={() => navigate('/pricing')} 
          className="hidden xl:inline-flex"
        />

        {/* Badge Interactif Mode Live Cloud vs Mode Simulation */}
        <ConnectionBadge className="hidden lg:inline-flex" />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-400 hover:text-white transition-all shadow-xs flex items-center justify-center cursor-pointer"
          title={theme === "dark" ? "Passer en Mode Clair" : "Passer en Mode Sombre"}
          aria-label="Basculer le thème"
        >
          {theme === "dark" ? <Sun size={13} className="text-slate-400 hover:text-white" /> : <Moon size={13} className="text-slate-400 hover:text-white" />}
        </button>

        <div 
          onClick={() => setIsProfileModalOpen(true)}
          className="text-right hidden sm:block cursor-pointer group pl-1"
          title="Modifier votre profil et nom d'organisation"
        >
          <p className="text-[11px] font-semibold text-white leading-none truncate max-w-[110px] group-hover:text-[#E5FA52] transition-colors">
            {currentUser?.name ?? 'Admin User'}
          </p>
          <p className="text-[9px] text-[#8E929C] uppercase leading-none mt-0.5">
            {currentUser?.role ?? 'SuperAdmin'}
          </p>
        </div>

        {/* Avatar Souverain Local / Photo de profil Gmail */}
        <div 
          onClick={() => setIsProfileModalOpen(true)}
          className="w-7 h-7 rounded-full bg-[#1C1E22] border border-white/20 flex items-center justify-center cursor-pointer hover:border-[#E5FA52] transition-all shadow-xs overflow-hidden"
          title="Modifier mon profil & photo Gmail"
        >
          {currentUser?.photoUrl ? (
            <img 
              src={currentUser.photoUrl} 
              alt={currentUser.name || "Profil"} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <span className="text-white text-[10px] font-bold tracking-tight">{initials}</span>
          )}
        </div>
      </div>

      {/* Modale de Gestion du Profil Utilisateur & Organisation */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onOpenPricing={() => navigate('/pricing')}
        onOpenAuth={(tab) => {
          setAuthDefaultTab(tab);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Modale d'Inscription & Authentification SENSORIUM */}
      <SensoriumAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authDefaultTab}
        onSuccess={() => {
          setIsAuthModalOpen(false);
        }}
      />
    </header>
  );
};

const dotColorMap: Record<string, string> = {
  'text-emerald-400': 'bg-emerald-400',
  'text-indigo-400': 'bg-indigo-400',
  'text-cyan-400': 'bg-cyan-400',
  'text-purple-400': 'bg-purple-400',
};

const HealthMetric = ({ label, value, color, title }: { label: string; value: string; color: string; title?: string }) => (
  <div className="flex items-center gap-2" title={title}>
    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColorMap[color] || 'bg-emerald-400'}`} />
    <div className="flex flex-col leading-none">
      <span className="text-[8px] text-gray-500 uppercase font-bold">{label}</span>
      <span className={`text-[10px] font-bold ${color}`}>{value}</span>
    </div>
  </div>
);

export default MasterHeader;
