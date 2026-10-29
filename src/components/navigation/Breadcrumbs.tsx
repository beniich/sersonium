import React from 'react';
import { ChevronRight, Shield, Server, Box, Sparkles } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

export const Breadcrumbs: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { breadcrumbs, activeAssetId, activeAssetTab } = useAppContext();

  if (!breadcrumbs || breadcrumbs.length === 0) return null;

  return (
    <nav 
      aria-label="Fil d'Ariane contextuel" 
      className={`h-[28px] w-full bg-[#0a0b12]/95 border-b border-gray-800/80 px-3 sm:px-4 flex items-center justify-between text-[11px] font-mono tracking-tight shrink-0 select-none ${className}`}
    >
      {/* Dynamic Trail */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        <Shield size={12} className="text-indigo-400 shrink-0" />
        
        {breadcrumbs.map((item, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <ChevronRight size={10} className="text-gray-600 shrink-0" />
              )}
              {isLast || item.active ? (
                <span className="text-indigo-400 font-semibold truncate max-w-[180px] sm:max-w-xs">
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="text-gray-400 hover:text-gray-100 hover:underline transition-colors truncate max-w-[140px] sm:max-w-[200px] cursor-pointer"
                >
                  {item.label}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Right Context Badge : Active Sub-system indication */}
      <div className="hidden md:flex items-center gap-2 shrink-0 text-[10px] text-gray-500">
        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-900 border border-gray-800">
          <Server size={10} className="text-emerald-400" />
          <span className="text-gray-300">ID: {activeAssetId.toUpperCase()}</span>
        </span>
        <span className="text-gray-600">•</span>
        <span className="text-gray-400 font-sans capitalize">{activeAssetTab}</span>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
    </nav>
  );
};

export default Breadcrumbs;
