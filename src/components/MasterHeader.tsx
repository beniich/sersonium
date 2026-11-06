import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Crown, UserPlus } from 'lucide-react';
import { useRbac } from '@/hooks/useRbac';
import { useConnectionHealth } from '@/hooks/useConnectionHealth';
import { useTheme } from '../App';
import ConnectionBadge from './ConnectionBadge';
import SubscriptionQuotaCounter from './SubscriptionQuotaCounter';
import UserProfileModal from './UserProfileModal';
import { SensoriumAuthModal } from './SensoriumAuthModal';

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

  // Initiales locales pour profil souverain (zero fuite vers serveurs tiers)
  const initials = currentUser?.name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'EM';

  return (
    <header className={`h-[44px] w-full bg-[#0a0b11] border-b border-gray-800 flex items-center justify-between px-3 sm:px-4 sticky top-0 z-50 backdrop-blur-md bg-opacity-95 ${className}`}>
      
      {/* ZONE 1 : IDENTITÉ SOUVERAINE & TENANT */}
      <div className="flex items-center gap-3">
        {onOpenMenu && (
          <button
            onClick={onOpenMenu}
            className="lg:hidden p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
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
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden p-0.5 border border-white/20">
            <img src="/logo-icon.png" alt="SENSORIUM" className="w-full h-full object-contain" />
          </div>
          <span className="text-white font-bold tracking-tight text-sm uppercase">Sensorium</span>
        </div>

        <div className="h-4 w-[1px] bg-gray-700 mx-1 hidden xs:block" />

        <div 
          onClick={() => setIsProfileModalOpen(true)}
          className="flex flex-col cursor-pointer group" 
          title="Modifier le nom de l'organisation active"
        >
          <span className="text-[9px] text-gray-500 uppercase font-bold leading-none group-hover:text-orange-400 transition-colors">Active Tenant</span>
          <span className="text-xs text-gray-200 font-medium leading-tight truncate max-w-[140px] sm:max-w-[220px] group-hover:text-white transition-colors">
            {currentTenant?.name ?? 'Entreprise M'}
          </span>
        </div>
      </div>

      {/* ZONE 2 : INDICATEURS VITAUX (Compacts) */}
      <div className="hidden md:flex items-center gap-5 px-3 py-1 bg-black/40 rounded-full border border-gray-800">
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

      {/* ZONE 3 : THÈME, PROFIL, QUOTAS, ABONNEMENT & INSCRIPTION */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Bouton d'Abonnement explicite */}
        <button
          onClick={() => navigate('/pricing')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/35 text-orange-400 hover:text-orange-300 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
          title="Consulter les forfaits et gérer votre abonnement SENSORIUM"
        >
          <Crown size={13} className="text-orange-400" />
          <span className="hidden sm:inline">Abonnement</span>
        </button>

        {/* Bouton d'Inscription & Connexion explicite */}
        <button
          onClick={() => {
            setAuthDefaultTab('register');
            setIsAuthModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
          title="Créer un compte ou se connecter à la plateforme SENSORIUM"
        >
          <UserPlus size={13} className="text-indigo-400" />
          <span className="hidden sm:inline">Inscription</span>
        </button>

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
          className="p-1.5 rounded-lg bg-gray-900/60 hover:bg-gray-800 border border-gray-700/60 text-slate-400 dark:text-[#858585] hover:text-white transition-all shadow-xs flex items-center justify-center cursor-pointer"
          title={theme === "dark" ? "Passer en Mode Clair" : "Passer en Mode Sombre"}
          aria-label="Basculer le thème"
        >
          {theme === "dark" ? <Sun size={14} className="text-slate-400 dark:text-[#858585] hover:text-white" /> : <Moon size={14} className="text-slate-400 dark:text-[#858585] hover:text-white" />}
        </button>

        <div 
          onClick={() => setIsProfileModalOpen(true)}
          className="text-right hidden sm:block cursor-pointer group"
          title="Modifier votre profil et nom d'organisation"
        >
          <p className="text-[11px] font-bold text-white leading-none truncate max-w-[120px] group-hover:text-orange-400 transition-colors">
            {currentUser?.name ?? 'Admin User'}
          </p>
          <p className="text-[9px] text-gray-500 uppercase leading-none mt-0.5">
            {currentUser?.role ?? 'SuperAdmin'}
          </p>
        </div>

        {/* Avatar Souverain Local / Photo de profil Gmail */}
        <div 
          onClick={() => setIsProfileModalOpen(true)}
          className="w-7 h-7 rounded-full bg-indigo-700 border border-indigo-500/80 flex items-center justify-center cursor-pointer hover:ring-2 ring-orange-500 transition-all shadow-sm overflow-hidden"
          title="Modifier mon profil & photo Gmail"
        >
          {currentUser?.photoUrl ? (
            <img 
              src={currentUser.photoUrl} 
              alt={currentUser.name || "Profil"} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <span className="text-white text-[11px] font-bold tracking-tight">{initials}</span>
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
