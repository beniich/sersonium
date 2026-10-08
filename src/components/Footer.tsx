import React from 'react';

interface FooterProps {
  onNavigate?: (path: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#f5f2fa] mt-16 border-t border-[#e3e1e8]/60">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Col 1 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <img 
                src="/apple-touch-icon.png" 
                alt="SENSORIUM Logo" 
                className="w-7 h-7 rounded-lg shadow-md object-contain border border-[#7c3aed]/20" 
              />
              <span className="font-['Space_Grotesk'] text-sm font-bold text-[#1b1b20] tracking-wide">
                SENSORIUM Spider Hub
              </span>
            </div>
            <p className="text-xs text-[#4a4455] leading-relaxed">
              Continuous spatial telemetry, real-time HVAC balancing, and embodied carbon monitoring across tier-4 commercial facility estates.
            </p>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-1">
            <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-wider text-[#1b1b20] font-bold">
              Compliance &amp; Security
            </span>
            <div className="flex flex-wrap gap-2 mt-1">
              <div className="tactile-debossed px-2.5 py-1 rounded-lg text-[#4a4455] font-['Space_Grotesk'] text-[10px] font-semibold">
                ISO 27001
              </div>
              <div className="tactile-debossed px-2.5 py-1 rounded-lg text-[#4a4455] font-['Space_Grotesk'] text-[10px] font-semibold">
                SOC 2 Type II
              </div>
              <div className="tactile-debossed px-2.5 py-1 rounded-lg text-[#4a4455] font-['Space_Grotesk'] text-[10px] font-semibold">
                CSRD Ready
              </div>
              <div className="tactile-debossed px-2.5 py-1 rounded-lg text-[#4a4455] font-['Space_Grotesk'] text-[10px] font-semibold">
                BACnet/IP
              </div>
            </div>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-1">
            <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-wider text-[#1b1b20] font-bold">
              Telemetry Status
            </span>
            <div className="tactile-plate p-3 rounded-xl flex flex-col gap-1">
              <div className="flex justify-between items-center font-['Space_Grotesk'] text-[10px]">
                <span className="text-[#4a4455]">Broker Sync</span>
                <span className="text-[#630ed4] font-bold">99.998% SLA</span>
              </div>
              <div className="w-full bg-[#e9e7ee] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#630ed4] h-full w-[99%]"></div>
              </div>
              <div className="flex justify-between items-center mt-1 font-['Space_Grotesk'] text-[10px]">
                <span className="text-[#4a4455]">Cluster Epoch</span>
                <span className="text-[#1b1b20] font-semibold font-mono">#SP-4981-EU</span>
              </div>
            </div>
          </div>

          {/* Col 4 */}
          <div className="flex flex-col gap-1">
            <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-wider text-[#1b1b20] font-bold">
              Architecture Controls
            </span>
            <div className="flex flex-col gap-1 text-xs">
              <button
                onClick={() => onNavigate?.('3d-digital-twin')}
                className="text-[#4a4455] hover:text-[#1b1b20] text-left transition-colors cursor-pointer"
              >
                BIM Engine 4.0
              </button>
              <button
                onClick={() => onNavigate?.('esg-carbon')}
                className="text-[#4a4455] hover:text-[#1b1b20] text-left transition-colors cursor-pointer"
              >
                Carbon Offset Audit Vault
              </button>
              <button
                onClick={() => onNavigate?.('grafana-observability')}
                className="text-[#4a4455] hover:text-[#1b1b20] text-left transition-colors cursor-pointer"
              >
                Grafana Metric Pipes
              </button>
            </div>
          </div>
        </div>

        {/* Bottom banner */}
        <div className="tactile-debossed p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#4a4455]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#630ed4] text-[18px]">verified_user</span>
            <span className="font-['Space_Grotesk'] text-[11px]">
              Hardware Security Module Active • Zero-Trust Mesh • AES-256 GCM Payload Vault
            </span>
          </div>
          <span className="font-['Space_Grotesk'] text-[10px]">
            © 2026 BeeCarbonat Spider Systems. Industrial Facility Automation.
          </span>
        </div>
      </div>
    </footer>
  );
};
