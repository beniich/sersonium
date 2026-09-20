import React, { useState } from "react";
import { FOCAL_LENGTHS, FocalLengthSpec } from "../../data/xiaomi17tProData";
import { motion, AnimatePresence } from "motion/react";
import { GlobalState } from "../../types";

interface LeicaOpticsSectionProps {
  state?: GlobalState;
}

export const LeicaOpticsSection: React.FC<LeicaOpticsSectionProps> = ({ state }) => {
  const [activeFocal, setActiveFocal] = useState<FocalLengthSpec>(FOCAL_LENGTHS[1]);
  const [wafMode, setWafMode] = useState<"monitor" | "block">("monitor");

  const totalThreats = state?.securityEvents?.length || 0;

  return (
    <section id="optics" className="w-full bg-[#111] text-white pt-32 pb-0 relative overflow-hidden">
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 mb-24 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center text-white font-serif font-bold text-lg mb-6">
            L
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-6">
            360° Real-Time Supervision
          </h2>
          <p className="text-xl sm:text-2xl text-neutral-400 font-medium max-w-3xl mx-auto leading-relaxed mb-16">
            Unify your facilities management (CAFM) and IT service desk (ITSM) within a single observability interface.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full text-left">
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Tickets & Support</h4>
              <p className="text-3xl font-light text-neutral-300 mb-2">99.8%</p>
              <p className="text-sm text-neutral-500 font-medium">SLA Resolution Rate</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Predictive CMMS</h4>
              <p className="text-3xl font-light text-neutral-300 mb-2">Active</p>
              <p className="text-sm text-neutral-500 font-medium">AI-Scheduled Maintenance</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Inventory (CMDB)</h4>
              <p className="text-3xl font-light text-neutral-300 mb-2">100%</p>
              <p className="text-sm text-neutral-500 font-medium">Automated Discovery</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Massive Edge-to-Edge Image Stage */}
      <div className="w-full relative bg-black">
        
        {/* Controls Overlay */}
        <div className="absolute top-8 left-0 right-0 z-20 px-4 sm:px-8 max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Focal Selection */}
          <div className="flex bg-black/50 backdrop-blur-md rounded-full p-1 border border-white/10 overflow-x-auto">
            {FOCAL_LENGTHS.map((focal, idx) => {
              const active = activeFocal.id === focal.id;
              const viewNames = ["Facilities", "IT Fleet", "Helpdesk", "IoT / Energy"];
              return (
                <button
                  key={focal.id}
                  onClick={() => setActiveFocal(focal)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                    active ? "bg-white text-black" : "text-white hover:text-neutral-300"
                  }`}
                >
                  {viewNames[idx % viewNames.length]}
                </button>
              );
            })}
          </div>

          {/* Style Toggle */}
          <div className="flex bg-black/50 backdrop-blur-md rounded-full p-1 border border-white/10 shrink-0">
            <button
              onClick={() => setWafMode("monitor")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                wafMode === "monitor" ? "bg-[#3b82f6] text-white" : "text-white hover:text-neutral-300"
              }`}
            >
              Operational Mode
            </button>
            <button
              onClick={() => setWafMode("block")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                wafMode === "block" ? "bg-[#f59e0b] text-white" : "text-white hover:text-neutral-300"
              }`}
            >
              Intervention Mode
            </button>
          </div>
        </div>

        {/* The Image */}
        <div className="w-full aspect-[4/3] sm:aspect-[21/9] lg:aspect-[2.5/1] relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={`${activeFocal.id}-${wafMode}`}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              src={activeFocal.sampleImage}
              alt={activeFocal.title}
              className={`w-full h-full object-cover ${
                wafMode === "monitor" 
                  ? "contrast-110 brightness-95 saturate-100" 
                  : "contrast-125 brightness-90 saturate-50 sepia-[.3]"
              }`}
            />
          </AnimatePresence>

          {/* Bottom Gradient for Text Legibility */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

          {/* Leica Watermark & Details */}
          <div className="absolute bottom-8 left-4 sm:left-8 right-4 sm:right-8 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <motion.h3 
                key={`title-${activeFocal.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-4xl font-bold text-white mb-2"
              >
                {activeFocal.title}
              </motion.h3>
              <motion.p 
                key={`desc-${activeFocal.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm sm:text-base text-neutral-300 max-w-xl font-medium"
              >
                {activeFocal.caption}
              </motion.p>
            </div>

            <div className="flex items-center gap-4 bg-white text-black px-6 py-3 rounded-sm shadow-xl shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-bold tracking-tight">LACAZA OS</span>
                <div className="w-px h-3 bg-neutral-300" />
                <span className="text-xs font-mono text-neutral-600">
                  {wafMode.toUpperCase()} &bull; AI-ENGINE &bull; FM-ITSM
                </span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center text-white font-serif font-bold text-[10px]">
                  L
                </div>
                <span className="font-serif font-bold tracking-wider text-[11px] text-[#10b981]">
                  SMART SPACE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
