import React from "react";
import lacazaLogoImg from "../assets/images/lacaza_cpanel_logo_1789587951305.jpg";

interface LacazaLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showDomain?: boolean;
  showPanelBadge?: boolean;
  className?: string;
}

export default function LacazaLogo({
  size = "md",
  showText = true,
  showDomain = false,
  showPanelBadge = false,
  className = ""
}: LacazaLogoProps) {
  // Dimension configurations
  const dimensions = {
    xs: { box: "w-6 h-6", text: "text-xs", badge: "text-[9px] px-1 py-0.2" },
    sm: { box: "w-7 h-7", text: "text-sm", badge: "text-[10px] px-1.5 py-0.5" },
    md: { box: "w-8 h-8", text: "text-base", badge: "text-[10px] px-1.5 py-0.5" },
    lg: { box: "w-11 h-11", text: "text-xl", badge: "text-xs px-2 py-0.5" },
    xl: { box: "w-14 h-14", text: "text-2xl", badge: "text-xs px-2.5 py-1" }
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* cPanel-Style Iconic Badge */}
      <div className="relative group flex-shrink-0">
        <div 
          className={`${dimensions.box} rounded-xl bg-gradient-to-br from-[#FF6C2C] via-[#F85A1B] to-[#E04808] flex items-center justify-center text-white shadow-md shadow-orange-500/25 border border-orange-400/40 relative overflow-hidden transition-transform duration-200 group-hover:scale-105`}
        >
          {/* Subtle reflection glare for cPanel glossy effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/10 pointer-events-none" />
          
          {/* Stylized cPanel-like emblem: 'cP' / 'LZ' monogram */}
          <div className="relative z-10 font-black tracking-tighter flex items-center justify-center font-sans">
            <span className="text-white font-extrabold italic drop-shadow-sm -mr-0.5">c</span>
            <span className="text-white font-black drop-shadow-sm scale-110">P</span>
          </div>

          {/* Micro indicator dot */}
          <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-300 ring-1 ring-white/60 shadow-xs" />
        </div>
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight font-sans text-slate-900 dark:text-white flex items-center">
              <span className="text-slate-800 dark:text-neutral-100">la</span>
              <span className="text-[#FF6C2C] font-black">caza</span>
            </span>

            {showPanelBadge && (
              <span className={`font-mono font-bold uppercase rounded-md bg-[#FF6C2C]/10 dark:bg-[#FF6C2C]/20 text-[#FF6C2C] border border-[#FF6C2C]/30 ${dimensions.badge}`}>
                PANEL
              </span>
            )}
          </div>

          {showDomain && (
            <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400 tracking-tight">
              lacaza.clouindustrie.com
            </span>
          )}
        </div>
      )}
    </div>
  );
}
