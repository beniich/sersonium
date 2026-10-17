import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Zap, 
  Globe,
  FileText, 
  Settings, 
  User, 
  LayoutDashboard, 
  Cpu, 
  Leaf,
  Menu
} from 'lucide-react';
import { useRbac } from '@/hooks/useRbac';
import { useConnectionHealth } from '@/hooks/useConnectionHealth';

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
  const { sla, latency, aiStatus } = useConnectionHealth();

  const conductorActions = {
    operational: [
      { id: 'uem',  label: 'UEM Fleet',    icon: <Cpu size={16} />,            color: 'text-blue-400',    path: '/uem' },
      { id: 'cafm', label: 'CAFM Assets',  icon: <LayoutDashboard size={16} />, color: 'text-indigo-400', path: '/cafm' },
      { id: 'twin', label: 'Digital Twin', icon: <Globe size={16} />,           color: 'text-cyan-400',    path: '/twin' },
    ],
    compliance: [
      { id: 'dora',  label: 'DORA Report', icon: <ShieldCheck size={16} />,   color: 'text-emerald-400', path: '/compliance/dora' },
      { id: 'esg',   label: 'ESG Carbon',  icon: <Leaf size={16} />,          color: 'text-green-400',   path: '/compliance/esg' },
      { id: 'audit', label: 'Audit Logs',  icon: <FileText size={16} />,      color: 'text-yellow-400',  path: '/audit' },
    ],
    system: [
      { id: 'billing',  label: 'Billing',    icon: <Zap size={16} />,         color: 'text-orange-400',  path: '/manage' },
      { id: 'settings', label: 'Settings',   icon: <Settings size={16} />,    color: 'text-gray-400',    path: '/settings' },
      { id: 'admin',    label: 'SuperAdmin', icon: <User size={16} />,        color: 'text-red-400',     path: '/admin' },
    ]
  };

  // Initiales locales — pas d'appel externe (CSP stricte garantie)
  const initials = currentUser?.name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'AU';

  return (
    <header className={`h-16 w-full bg-[#0f111a] border-b border-gray-800
                       flex items-center justify-between px-4 sm:px-6
                       sticky top-0 z-50 backdrop-blur-md ${className}`}>

      {/* ZONE 1 : IDENTITÉ & TENANT ACTIF */}
      <div className="flex items-center gap-2 sm:gap-4">
        {onOpenMenu && (
          <button
            onClick={onOpenMenu}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Ouvrir le menu de navigation"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div 
          onClick={() => navigate('/portal')}
          className="flex items-center gap-2 cursor-pointer group"
          title="Retour au portail SENSORIUM"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-700
                          rounded-lg flex items-center justify-center
                          shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-white font-bold tracking-tighter text-lg uppercase hidden xs:inline">
            Sensorium
          </span>
        </div>

        <div className="h-6 w-px bg-gray-700 mx-1 sm:mx-2" />

        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase font-semibold leading-none">
            Active Tenant
          </span>
          <span className="text-xs sm:text-sm text-gray-200 font-medium leading-tight truncate max-w-[120px] sm:max-w-[200px]">
            {currentTenant?.name ?? '—'}
          </span>
        </div>
      </div>

      {/* ZONE 2 : MONITORING VITAL — valeurs dynamiques en temps réel */}
      <div className="hidden lg:flex items-center gap-6 px-6 py-2
                      bg-black/30 rounded-full border border-gray-800">
        <HealthIndicator label="SLA"          value={sla}      color="text-emerald-400" />
        <HealthIndicator label="AI Engine"    value={aiStatus} color="text-indigo-400" />
        <HealthIndicator label="Edge Latency" value={latency}  color="text-cyan-400" />
        <HealthIndicator label="Security"     value="Zero-Trust" color="text-purple-400" />
      </div>

      {/* ZONE 3 & 4 : CHEF D'ORCHESTRE & PROFIL RBAC */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* CHEF D'ORCHESTRE */}
        <div className="flex items-center gap-1 sm:gap-2 bg-gray-900/50 p-1
                        rounded-xl border border-gray-800 shadow-inner">
          {Object.entries(conductorActions).map(([group, actions]) => (
            <div 
              key={group}
              className="flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 border-r border-gray-800 last:border-0"
            >
              {actions.map(action => (
                <button
                  key={action.id}
                  title={action.label}
                  onClick={() => navigate(action.path)} // ← navigation réelle
                  className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200
                              hover:bg-gray-700/80 active:scale-95 group relative ${action.color}`}
                >
                  {action.icon}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2
                                   scale-0 group-hover:scale-100 transition-all pointer-events-none
                                   bg-gray-800 text-white text-[10px] px-2 py-1
                                   rounded whitespace-nowrap border border-gray-700 z-50 shadow-md">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* ZONE 4 : PROFIL SOUVERAIN (AVATAR LOCAL SANS APPEL EXTERNE) */}
        <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-gray-800">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white leading-none truncate max-w-[110px]">
              {currentUser?.name ?? 'Admin'}
            </p>
            <p className="text-[10px] text-gray-500 uppercase">
              {currentUser?.role ?? '—'}
            </p>
          </div>

          {/* Avatar local avec initiales calculées — aucune requête tiers ui-avatars.com */}
          <div 
            onClick={() => {
              if (onOpenEnterpriseLogin) {
                onOpenEnterpriseLogin();
              } else {
                navigate('/admin');
              }
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-indigo-700
                       to-purple-700 border border-gray-600 flex items-center
                       justify-center cursor-pointer hover:ring-2
                       ring-indigo-500 transition-all shadow-md"
            title={`Session active : ${currentUser?.name ?? 'Admin'} (${currentUser?.role ?? 'SUPER_ADMIN'})`}
          >
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
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
  'text-green-400': 'bg-green-400',
  'text-blue-400': 'bg-blue-400',
  'text-yellow-400': 'bg-yellow-400',
  'text-orange-400': 'bg-orange-400',
  'text-red-400': 'bg-red-400',
  'text-gray-400': 'bg-gray-400',
};

const HealthIndicator = ({ label, value, color }: {
  label: string; value: string; color: string;
}) => (
  <div className="flex items-center gap-2">
    <div className={`w-1.5 h-1.5 rounded-full animate-pulse
                     ${dotColorMap[color] || 'bg-emerald-400'}`} />
    <div className="flex flex-col leading-none">
      <span className="text-[9px] text-gray-500 uppercase font-medium">{label}</span>
      <span className={`text-xs font-bold ${color}`}>{value}</span>
    </div>
  </div>
);

export default MasterHeader;
