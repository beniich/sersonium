import React from 'react';
import { Sparkles, Terminal, Activity, ShieldCheck, Box, User, ArrowUpRight } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  onOpenCockpit: () => void;
  onOpenPricing: () => void;
  onOpenAuth: () => void;
  user: UserProfile | null;
  onScrollToSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCockpit,
  onOpenPricing,
  onOpenAuth,
  user,
  onScrollToSection,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-xl border-b border-indigo-100/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="flex items-center gap-2.5 group focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              {/* Spider / Carbon Lattice Icon */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-2">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
                <path d="M12 6v12" />
                <path d="M7 9l10 6" />
                <path d="M17 9l-10 6" />
                <circle cx="12" cy="12" r="2.5" className="fill-white" />
              </svg>
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                BeeCarbonat
              </div>
              <div className="text-[10px] font-mono tracking-wider text-indigo-600 font-semibold uppercase -mt-0.5">
                Spider CAFM Twin
              </div>
            </div>
          </a>

          {/* Live Sync Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50/80 border border-indigo-100/80 text-xs text-indigo-950 font-mono">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <span className="font-semibold text-indigo-700">LIVE SYNC</span>
            <span className="text-indigo-300">|</span>
            <span className="text-slate-600 font-mono text-[11px]">14,890 Edge Nodes</span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          <button
            onClick={() => onScrollToSection('architecture')}
            className="px-3 py-1.5 rounded-lg hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
          >
            Architecture
          </button>
          <button
            onClick={() => onScrollToSection('pillars')}
            className="px-3 py-1.5 rounded-lg hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
          >
            6 Core Pillars
          </button>
          <button
            onClick={() => onScrollToSection('digital-twin')}
            className="px-3 py-1.5 rounded-lg hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
          >
            3D Digital Twin
          </button>
          <button
            onClick={() => onScrollToSection('esg-carbon')}
            className="px-3 py-1.5 rounded-lg hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
          >
            ESG & Carbon
          </button>
          <button
            onClick={() => onScrollToSection('grafana')}
            className="px-3 py-1.5 rounded-lg hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
          >
            Grafana Observability
          </button>
          <button
            onClick={onOpenPricing}
            className="px-3 py-1.5 rounded-lg hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
          >
            Pricing
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {/* Console Login */}
          <button
            onClick={onOpenAuth}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100/70 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200/60"
          >
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>{user ? user.name.split(' ')[0] : 'Console Login'}</span>
          </button>

          {/* Launch Cockpit Button */}
          <button
            onClick={onOpenCockpit}
            className="relative group overflow-hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Box className="w-4 h-4 text-indigo-100 group-hover:rotate-12 transition-transform" />
            <span>Launch Cockpit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
