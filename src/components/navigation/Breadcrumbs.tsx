import React from 'react';
import { ChevronRight, Shield, Server, Box, Sparkles } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

export const Breadcrumbs: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { breadcrumbs, activeAssetId, activeAssetTab } = useAppContext();

  if (!breadcrumbs || breadcrumbs.length === 0) return null;

  return (
    <nav 
      aria-label="Fil d'Ariane contextuel" 
      className={`h-[28px] w-full bg-[#111317] border-b border-white/[0.06] px-3 sm:px-4.5 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider shrink-0 select-none ${className}`}
    >
      {/* Dynamic Trail */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        <span className="text-[#8E929C] tracking-widest font-mono text-[9px]">SENSORIUM</span>
        <span className="text-white/20">/</span>
        
        {breadcrumbs.map((item, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <span className="text-white/20">/</span>
              )}
              {isLast || item.active ? (
                <span className="text-white font-semibold truncate max-w-[180px] sm:max-w-xs">
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="text-[#8E929C] hover:text-white transition-colors truncate max-w-[140px] sm:max-w-[200px] cursor-pointer"
                >
                  {item.label}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Right Context Badge : Active Sub-system indication */}
      <div className="hidden md:flex items-center gap-2 shrink-0 text-[10px] text-[#8E929C]">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
          <Server size={10} className="text-[#4edea3]" />
          <span className="text-slate-200">ID: {activeAssetId.toUpperCase()}</span>
        </span>
        <span className="text-white/20">•</span>
        <span className="text-[#8E929C] font-mono capitalize">{activeAssetTab}</span>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
    </nav>
  );
};

export default Breadcrumbs;
