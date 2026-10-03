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
}

export const TactileHeader: React.FC<TactileHeaderProps> = ({
  activePath,
  onNavigate,
  onLaunchCockpit,
  onOpenVault,
  onLaunchDashboard,
  tokenCountdown = '23:59:59',
}) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#fbf8ff]/90 backdrop-blur-md shadow-[0_4px_16px_rgba(112,104,133,0.08)]">
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

          <div
            onClick={onOpenVault}
            className="tactile-btn px-3 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            title="Credential Verification"
          >
            <div className="w-8 h-8 rounded-full bg-[#630ed4] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-['Space_Grotesk'] text-[11px] text-[#1b1b20] font-bold">
                Dr. A. Mercer
              </span>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455]">Chief Architect</span>
            </div>
          </div>

          {onLaunchDashboard && (
            <button
              onClick={onLaunchDashboard}
              className="tactile-btn px-4 py-2.5 rounded-xl flex items-center gap-2 text-[#1b1b20] font-['Space_Grotesk'] text-[13px] font-bold hover:text-[#630ed4] active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              <span className="whitespace-nowrap hidden sm:inline">Dashboard</span>
            </button>
          )}
          <button
            onClick={onLaunchCockpit}
            className="tactile-btn-primary px-4 py-2.5 rounded-xl flex items-center gap-2 text-white font-['Space_Grotesk'] text-[15px] font-bold hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">sensors</span>
            <span className="whitespace-nowrap">Launch Cockpit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
