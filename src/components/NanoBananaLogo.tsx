import React from "react";

interface NanoBananaLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
  variant?: "gold" | "titanium" | "minimal";
}

export default function NanoBananaLogo({
  size = "md",
  showText = true,
  showBadge = true,
  badgeText = "OS 4.0",
  className = ""
}: NanoBananaLogoProps) {
  const dimensions = {
    xs: { box: "w-5 h-5", text: "text-xs", badge: "text-[9px] px-1.5 py-0.5" },
    sm: { box: "w-6 h-6", text: "text-sm", badge: "text-[9px] px-1.5 py-0.5" },
    md: { box: "w-8 h-8", text: "text-base", badge: "text-[10px] px-2 py-0.5" },
    lg: { box: "w-10 h-10", text: "text-lg", badge: "text-[11px] px-2.5 py-0.5" },
    xl: { box: "w-14 h-14", text: "text-2xl", badge: "text-xs px-3 py-1" }
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* NanoBanana Minimalist Hardware Insignia */}
      <div className="relative group shrink-0">
        <div 
          className={`${dimensions.box} rounded-lg bg-gradient-to-b from-[#242426] to-[#121214] flex items-center justify-center text-amber-400 border border-white/[0.12] shadow-xs relative overflow-hidden transition-transform duration-300 group-hover:scale-105`}
        >
          {/* Subtle glossy glass reflection */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
          
          {/* Apple-grade Minimalist Arc Vector */}
          <svg className="w-3/5 h-3/5 relative z-10 text-amber-400/90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M5.5 17.5C7.5 19.5 11.5 20.5 16 17.5C19 15.5 20.5 12 20.5 8C20.5 6.5 19.5 5 18 5C17.5 6.5 16.5 8 15 9.5C12 12.5 8.5 14 5.5 17.5Z" 
              fill="currentColor"
            />
            <circle cx="17.5" cy="6.5" r="1.3" fill="#ffffff" />
            <circle cx="11.5" cy="14.5" r="1.1" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* Brand Name Typography - Apple Precision */}
      {showText && (
        <div className="flex items-center gap-2.5">
          <span className="font-semibold tracking-tight text-white flex items-center font-sans text-sm sm:text-base">
            <span className="text-white">nano</span>
            <span className="text-neutral-400 font-normal ml-0.5">banana</span>
          </span>

          {showBadge && (
            <span className={`font-mono text-[10px] tracking-wider uppercase rounded-full bg-white/[0.06] text-neutral-300 border border-white/[0.08] ${dimensions.badge}`}>
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
