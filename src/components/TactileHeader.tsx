import React from 'react';

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
}

export const TactileHeader: React.FC<TactileHeaderProps> = ({
  activePath,
  onNavigate,
  onLaunchCockpit,
  onOpenVault,
  onLaunchDashboard,
  tokenCountdown = '23:59:59',
  isEmbedded = false,
}) => {
  return (
    <header className={`${isEmbedded ? 'sticky top-0 w-full z-20' : 'fixed top-0 w-full z-50'} bg-[#fbf8ff]/90 backdrop-blur-md shadow-[0_4px_16px_rgba(112,104,133,0.08)]`}>
      <div className="h-20 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-4 shrink-0">
          <div
            onClick={() => onNavigate('architecture')}
            className="tactile-plate w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="w-7 h-7 rounded-lg bg-[#7c3aed] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px]">deployed_code</span>
            </div>
          </div>
          <div className="flex flex-col cursor-pointer" onClick={() => onNavigate('architecture')}>
            <div className="flex items-center gap-1.5">
              <span className="font-['Space_Grotesk'] text-lg tracking-tight text-[#1b1b20] font-bold">
                BeeCarbonat
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#eaddff] text-[#25005a] font-['Space_Grotesk'] text-[10px] uppercase font-bold tracking-wider">
                SPIDER
              </span>
            </div>
            <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase tracking-wider">
              CAFM Digital Twin
            </span>
          </div>

          <div className="tactile-debossed px-3 py-1.5 rounded-full hidden sm:flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#630ed4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#630ed4]"></span>
            </span>
            <span className="font-['Space_Grotesk'] text-[11px] text-[#4a4455] font-bold tracking-wider">
              LIVE SYNC
            </span>
            <span className="text-[#ccc3d8] text-[10px]">|</span>
            <span className="font-['Space_Grotesk'] text-[11px] text-[#630ed4] font-bold">
              14,890 Edge Nodes
            </span>
          </div>
        </div>

        {/* Navigation links with tactile styling */}
        <nav className="hidden xl:flex items-center gap-2">
          <button
            onClick={() => onNavigate('architecture')}
            className={`transition-all px-3 py-2 rounded-xl font-['Space_Grotesk'] text-[15px] ${
              activePath === 'architecture'
                ? 'tactile-plate text-[#630ed4] font-bold'
                : 'text-[#4a4455] hover:text-[#1b1b20]'
            }`}
          >
            Architecture
          </button>
          <button
            onClick={() => onNavigate('6-core-pillars')}
            className={`transition-all px-3 py-2 rounded-xl font-['Space_Grotesk'] text-[15px] ${
              activePath === '6-core-pillars'
                ? 'tactile-plate text-[#630ed4] font-bold'
                : 'text-[#4a4455] hover:text-[#1b1b20]'
            }`}
          >
            6 Core Pillars
          </button>
          <button
            onClick={() => onNavigate('3d-digital-twin')}
            className={`transition-all px-3 py-2 rounded-xl font-['Space_Grotesk'] text-[15px] ${
              activePath === '3d-digital-twin'
                ? 'tactile-plate text-[#630ed4] font-bold'
                : 'text-[#4a4455] hover:text-[#1b1b20]'
            }`}
          >
            3D Digital Twin
          </button>
          <button
            onClick={() => onNavigate('esg-carbon')}
            className={`transition-all px-3 py-2 rounded-xl font-['Space_Grotesk'] text-[15px] ${
              activePath === 'esg-carbon'
                ? 'tactile-plate text-[#630ed4] font-bold'
                : 'text-[#4a4455] hover:text-[#1b1b20]'
            }`}
          >
            ESG &amp; Carbon
          </button>
          <button
            onClick={() => onNavigate('grafana-observability')}
            className={`transition-all px-3 py-2 rounded-xl font-['Space_Grotesk'] text-[15px] ${
              activePath === 'grafana-observability'
                ? 'tactile-plate text-[#630ed4] font-bold'
                : 'text-[#4a4455] hover:text-[#1b1b20]'
            }`}
          >
            Grafana Observability
          </button>
          <button
            onClick={() => onNavigate('pricing')}
            className={`transition-all px-3 py-2 rounded-xl font-['Space_Grotesk'] text-[15px] ${
              activePath === 'pricing'
                ? 'tactile-plate text-[#630ed4] font-bold'
                : 'text-[#4a4455] hover:text-[#1b1b20]'
            }`}
          >
            Pricing
          </button>
        </nav>

        {/* Right action block */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Rotation Token (vault) */}
          <div
            onClick={onOpenVault}
            className="tactile-debossed px-3 py-1.5 rounded-xl hidden lg:flex items-center gap-2 cursor-pointer hover:bg-[#e9e7ee] transition-colors"
            title="Open Ephemeral Hardware Vault"
          >
            <div className="w-4 h-4 rounded-full border border-[#630ed4]/40 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#630ed4]"></div>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455]">ROTATION TOKEN</span>
              <span className="font-['Space_Grotesk'] text-[11px] text-[#1b1b20] font-semibold">
                {tokenCountdown} EXP
              </span>
            </div>
          </div>

          {/* User badge */}
          <div
            onClick={onOpenVault}
            className="tactile-btn px-3 py-1.5 rounded-xl hidden md:flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            title="Credential Verification"
          >
            <div className="w-8 h-8 rounded-full bg-[#630ed4] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="font-['Space_Grotesk'] text-[11px] text-[#1b1b20] font-bold">
                Dr. A. Mercer
              </span>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455]">Chief Architect</span>
            </div>
          </div>

          {/* Cockpit demo button */}
          <button
            onClick={onLaunchCockpit}
            className="tactile-btn px-3 py-2 rounded-xl flex items-center gap-1.5 text-[#4a4455] font-['Space_Grotesk'] text-[13px] font-semibold hover:text-[#1b1b20] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">sensors</span>
            <span className="whitespace-nowrap hidden sm:inline">Cockpit</span>
          </button>

          {/* ✦ MODE PRO — SENSORIUM — primary bypass CTA */}
          {onLaunchDashboard && (
            <button
              id="btn-mode-pro-sensorium"
              onClick={onLaunchDashboard}
              className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-['Space_Grotesk'] text-[13px] font-bold text-white cursor-pointer active:scale-95 transition-all overflow-hidden shadow-lg hover:shadow-[0_0_24px_rgba(99,14,212,0.45)]"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 60%, #2563eb 100%)',
              }}
              title="Accéder au dashboard SENSORIUM Pro"
            >
              {/* shimmer */}
              <span className="pointer-events-none absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
              {/* crown icon */}
              <span className="material-symbols-outlined text-[16px] text-yellow-300">workspace_premium</span>
              <span className="whitespace-nowrap hidden sm:inline">Mode Pro</span>
              {/* pill badge */}
              <span className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] tracking-widest font-bold uppercase">
                SENSORIUM
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
