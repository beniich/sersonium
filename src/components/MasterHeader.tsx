import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon } from 'lucide-react';
import { useRbac } from '@/hooks/useRbac';
import { useConnectionHealth } from '@/hooks/useConnectionHealth';
import { useTheme } from '../App';
import ConnectionBadge from './ConnectionBadge';

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

  // Initiales locales pour profil souverain (zero fuite vers serveurs tiers)
  const initials = currentUser?.name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'AU';

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
          <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="text-white font-bold tracking-tight text-sm uppercase">Sensorium</span>
        </div>

        <div className="h-4 w-[1px] bg-gray-700 mx-1 hidden xs:block" />

        <div className="flex flex-col">
          <span className="text-[9px] text-gray-500 uppercase font-bold leading-none">Active Tenant</span>
          <span className="text-xs text-gray-200 font-medium leading-tight truncate max-w-[140px] sm:max-w-[220px]">
            {currentTenant?.name ?? 'Airbus Defence & Space'}
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

      {/* ZONE 3 : THÈME, PROFIL & SESSION */}
      <div className="flex items-center gap-2.5">
        {/* Badge Interactif Mode Live Cloud vs Mode Simulation */}
        <ConnectionBadge className="hidden sm:inline-flex" />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-gray-900/60 hover:bg-gray-800 border border-gray-700/60 text-amber-400 dark:text-amber-300 hover:text-white transition-all shadow-xs flex items-center justify-center cursor-pointer"
          title={theme === "dark" ? "Passer en Mode Clair" : "Passer en Mode Sombre"}
          aria-label="Basculer le thème"
        >
          {theme === "dark" ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-400" />}
        </button>

        <div className="text-right hidden sm:block">
          <p className="text-[11px] font-bold text-white leading-none truncate max-w-[120px]">
            {currentUser?.name ?? 'Admin User'}
          </p>
          <p className="text-[9px] text-gray-500 uppercase leading-none mt-0.5">
            {currentUser?.role ?? 'SuperAdmin'}
          </p>
        </div>

        {/* Avatar Souverain Local */}
        <div 
          onClick={() => {
            if (onOpenEnterpriseLogin) onOpenEnterpriseLogin();
            else navigate('/admin');
          }}
          className="w-7 h-7 rounded-full bg-indigo-700 border border-indigo-500 flex items-center justify-center cursor-pointer hover:ring-2 ring-indigo-500 transition-all shadow-sm"
          title="Authentification Entreprise (RBAC / SSO)"
        >
          <span className="text-white text-[11px] font-bold tracking-tight">{initials}</span>
        </div>
      </div>
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
