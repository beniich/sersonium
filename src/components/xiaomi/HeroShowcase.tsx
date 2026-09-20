import React from "react";
import { PHONE_COLORS, PhoneColor } from "../../data/xiaomi17tProData";
import { motion } from "motion/react";
import { GlobalState } from "../../types";

interface HeroShowcaseProps {
  onEnterDashboard: () => void;
  onExploreOptics: () => void;
  selectedColor: PhoneColor;
  onSelectColor: (color: PhoneColor) => void;
  state?: GlobalState;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  selectedColor,
  onSelectColor,
  state
}) => {
  return (
    <section className="relative w-full bg-black text-white pt-24 pb-32 flex flex-col items-center justify-center min-h-[90vh] overflow-hidden">
      
      {/* Background glow based on color */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: selectedColor.accentGlow }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        
        {/* Integrated CAFM & ITSM */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-2 mb-8"
        >
          <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center text-white font-serif font-bold text-[10px]">
            L
          </div>
          <span className="text-xs font-semibold tracking-widest text-neutral-300 uppercase">
            Integrated CAFM & ITSM
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-6xl sm:text-7xl lg:text-[100px] font-bold tracking-tighter text-white leading-none mb-4"
        >
          LACAZA OS
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-neutral-400 mb-12"
        >
          Manage your assets. Simplify IT.
        </motion.p>

        {/* The Massive Phone Render / Control Dashboard Representation */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-[340px] aspect-[1/2] mx-auto mb-16"
        >
          {/* Extremely polished, borderless representation of the control node */}
          <div 
            className="w-full h-full rounded-[48px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] border-[4px] border-[#333] transition-all duration-1000 overflow-hidden relative"
            style={{
              background: selectedColor.id === "theme-facility"
                ? "linear-gradient(135deg, #047857 0%, #10b981 50%, #047857 100%)"
                : selectedColor.id === "theme-it"
                ? "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #1d4ed8 100%)"
                : "linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #b45309 100%)"
            }}
          >
            {/* Edge highlights */}
            <div className="absolute inset-0 rounded-[44px] shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

            {/* Dashboard Deco Island */}
            <div className="absolute top-8 left-6 w-[180px] h-[180px] rounded-3xl bg-[#111] shadow-2xl border-2 border-[#222] p-4 flex flex-col justify-between backdrop-blur-md">
              <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium tracking-widest uppercase">
                <span className="text-[#10b981] font-bold">SMART</span>
                <span>Space</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 h-full pt-2">
                <div className="relative rounded-full bg-black border border-[#333] flex flex-col items-center justify-center overflow-hidden">
                   <div className="text-xl font-bold text-white">42</div>
                   <div className="text-[8px] text-neutral-500 uppercase">Sites</div>
                </div>
                <div className="relative rounded-full bg-black border border-[#333] flex flex-col items-center justify-center overflow-hidden">
                   <div className="text-xl font-bold text-white">8K+</div>
                   <div className="text-[8px] text-neutral-500 uppercase">IT Assets</div>
                </div>
                <div className="relative rounded-full bg-black border border-[#333] flex flex-col items-center justify-center overflow-hidden col-span-2">
                   <div className="w-full px-2 h-1 bg-[#333] rounded-full overflow-hidden">
                     <div className="h-full bg-[#10b981] w-4/5 rounded-full" />
                   </div>
                   <div className="text-[8px] text-neutral-500 uppercase mt-1">SLA Compliance</div>
                </div>
              </div>
            </div>

            {/* Brand Logo */}
            <div className="absolute bottom-10 left-6 text-white/50 font-bold text-2xl tracking-tight">
              LACAZA
            </div>
          </div>
        </motion.div>

        {/* Minimalist Color Selector */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex gap-4">
            {PHONE_COLORS.map((col) => {
              const active = selectedColor.id === col.id;
              return (
                <button
                  key={col.id}
                  onClick={() => onSelectColor(col)}
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    active ? "scale-110" : "scale-100 hover:scale-105"
                  }`}
                >
                  {/* Outer Ring */}
                  {active && (
                    <motion.div 
                      layoutId="color-ring"
                      className="absolute inset-0 rounded-full border-2 border-white"
                    />
                  )}
                  {/* Inner Color */}
                  <div 
                    className="w-10 h-10 rounded-full shadow-inner border border-white/20"
                    style={{ backgroundColor: col.hex }}
                  />
                </button>
              );
            })}
          </div>
          <span className="text-sm font-medium text-white tracking-wide">
            {selectedColor.name} Edition
          </span>
        </motion.div>

      </div>
    </section>
  );
};
