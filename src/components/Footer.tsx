import React from 'react';

interface FooterProps {
  onNavigate?: (path: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-slate-50 dark:bg-[#070709] mt-16 border-t border-slate-200/80 dark:border-white/[0.08] transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Col 1 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <img 
                src="/apple-touch-icon.png" 
                alt="SENSORIUM Logo" 
                className="w-7 h-7 rounded-lg shadow-xs object-contain border border-orange-500/30" 
              />
              <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                SENSORIUM Platform
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
              Spatial telemetry hypervision, autonomous digital twin orchestration, and embodied carbon monitoring across tier-4 commercial facility estates.
            </p>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-1">
            <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-wider text-slate-900 dark:text-white font-bold">
              Compliance &amp; Security
            </span>
            <div className="flex flex-wrap gap-2 mt-1">
              <div className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-neutral-300 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] font-['Space_Grotesk'] text-[10px] font-semibold">
                ISO 27001
              </div>
              <div className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-neutral-300 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] font-['Space_Grotesk'] text-[10px] font-semibold">
                SOC 2 Type II
              </div>
              <div className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-neutral-300 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] font-['Space_Grotesk'] text-[10px] font-semibold">
                CSRD Ready
              </div>
              <div className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-neutral-300 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] font-['Space_Grotesk'] text-[10px] font-semibold">
                DORA EU 2022/2554
              </div>
            </div>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-1">
            <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-wider text-slate-900 dark:text-white font-bold">
              Telemetry Status
            </span>
            <div className="p-3 rounded-xl bg-white dark:bg-[#0e0e14] border border-slate-200 dark:border-white/[0.08] flex flex-col gap-1 shadow-2xs">
              <div className="flex justify-between items-center font-['Space_Grotesk'] text-[10px]">
                <span className="text-slate-500 dark:text-neutral-400">Broker Sync</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">99.998% SLA</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[99%]"></div>
              </div>
              <div className="flex justify-between items-center mt-1 font-['Space_Grotesk'] text-[10px]">
                <span className="text-slate-500 dark:text-neutral-400">Cluster Epoch</span>
                <span className="text-slate-900 dark:text-white font-semibold font-mono">#SP-4981-EU</span>
              </div>
            </div>
          </div>

          {/* Col 4 */}
          <div className="flex flex-col gap-1">
            <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-wider text-slate-900 dark:text-white font-bold">
              Architecture Controls
            </span>
            <div className="flex flex-col gap-1 text-xs">
              <button
                onClick={() => onNavigate?.('3d-digital-twin')}
                className="text-slate-500 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 text-left transition-colors cursor-pointer"
              >
                BIM Engine 4.0
              </button>
              <button
                onClick={() => onNavigate?.('esg-carbon')}
                className="text-slate-500 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 text-left transition-colors cursor-pointer"
              >
                Carbon Offset Audit Vault
              </button>
              <button
                onClick={() => onNavigate?.('grafana-observability')}
                className="text-slate-500 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 text-left transition-colors cursor-pointer"
              >
                Grafana Metric Pipes
              </button>
            </div>
          </div>
        </div>

        {/* Bottom banner */}
        <div className="p-3 rounded-xl bg-white dark:bg-[#0e0e14] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-neutral-400 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500 text-[18px]">verified_user</span>
            <span className="font-['Space_Grotesk'] text-[11px]">
              Hardware Security Module Active • Zero-Trust Mesh • Sovereign Resilience
            </span>
          </div>
          <span className="font-['Space_Grotesk'] text-[10px]">
            © 2026 SENSORIUM Platform. Industrial Facility Automation &amp; Sovereign Resilience.
          </span>
        </div>
      </div>
    </footer>
  );
};
