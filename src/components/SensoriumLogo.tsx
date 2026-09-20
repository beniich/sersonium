import React from "react";

interface SensoriumLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
  variant?: "obsidian" | "luminescent" | "minimal";
}

export default function SensoriumLogo({
  size = "md",
  showText = true,
  showBadge = true,
  badgeText = "OS 4.0",
  className = "",
  variant = "obsidian"
}: SensoriumLogoProps) {
  const dimensions = {
    xs: { box: "w-5 h-5", text: "text-xs", badge: "text-[8px] px-1.5 py-0.2", icon: "w-3 h-3" },
    sm: { box: "w-7 h-7", text: "text-sm", badge: "text-[9px] px-2 py-0.5", icon: "w-4 h-4" },
    md: { box: "w-9 h-9", text: "text-base", badge: "text-[10px] px-2 py-0.5", icon: "w-5 h-5" },
    lg: { box: "w-11 h-11", text: "text-xl", badge: "text-xs px-2.5 py-0.5", icon: "w-6 h-6" },
    xl: { box: "w-16 h-16", text: "text-2xl", badge: "text-xs px-3 py-1", icon: "w-9 h-9" }
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* SENSORIUM Powerful Sensory Nucleus Insignia */}
      <div className="relative group shrink-0">
        <div 
          className={`${dimensions.box} rounded-xl bg-gradient-to-br from-[#1c1c1f] via-[#0e0e11] to-[#050507] flex items-center justify-center border border-white/[0.16] shadow-lg shadow-black/80 relative overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:border-amber-400/40`}
        >
          {/* Subtle specular glass highlight */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.12] via-transparent to-transparent pointer-events-none" />
          
          {/* Sensory Quantum Iris Vector */}
          <svg className={`${dimensions.icon} relative z-10 text-white`} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sensoriumGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="45%" stopColor="#F5D061" />
                <stop offset="100%" stopColor="#E5A93B" />
              </linearGradient>
              <radialGradient id="sensorCoreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#D97706" />
              </radialGradient>
            </defs>

            {/* Hexagonal Quantum Shield boundary */}
            <path 
              d="M16 3L27.25 9.5V22.5L16 29L4.75 22.5V9.5L16 3Z" 
              stroke="url(#sensoriumGold)" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="opacity-90"
            />

            {/* Tri-Orbital Sensory Waves */}
            <circle cx="16" cy="16" r="7.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="16" cy="16" r="4.5" stroke="url(#sensoriumGold)" strokeWidth="1.2" />

            {/* Central Sensory Nucleus */}
            <circle cx="16" cy="16" r="2.2" fill="url(#sensorCoreGlow)" />

            {/* Micro Precision Sensor Nodes */}
            <circle cx="16" cy="6.5" r="1.1" fill="#FFFFFF" />
            <circle cx="24.2" cy="20.7" r="1.1" fill="#FFFFFF" />
            <circle cx="7.8" cy="20.7" r="1.1" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      {/* SENSORIUM Bold & Pure Typographic Wordmark */}
      {showText && (
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col">
            <span className="font-bold tracking-[0.14em] text-white uppercase font-sans leading-none flex items-center">
              <span>SENSORIUM</span>
            </span>
          </div>

          {showBadge && (
            <span className={`font-mono font-medium tracking-wider uppercase rounded-full bg-white/[0.06] text-neutral-300 border border-white/[0.1] ${dimensions.badge}`}>
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
