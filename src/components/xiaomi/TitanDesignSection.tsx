import React from "react";
import { PHONE_COLORS, PhoneColor } from "../../data/xiaomi17tProData";
import { motion } from "motion/react";
import { GlobalState } from "../../types";

interface TitanDesignSectionProps {
  selectedColor: PhoneColor;
  onSelectColor: (color: PhoneColor) => void;
  state?: GlobalState;
}

export const TitanDesignSection: React.FC<TitanDesignSectionProps> = ({
  selectedColor,
  state,
}) => {
  const activeNodesCount = state?.nodes?.filter(n => n.status === "active").length || 0;
  
  return (
    <section id="design" className="w-full bg-[#000] text-white py-32 px-4 sm:px-8 relative overflow-hidden">
      
      {/* Background ambient texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111] to-black opacity-50 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto relative z-10 flex flex-col gap-32">
        
        {/* Massive Typography Intro */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-6">
            Intelligent Spaces.<br />Proactive Management.
          </h2>
          <p className="text-xl sm:text-2xl text-neutral-400 font-medium max-w-3xl mx-auto leading-relaxed">
            3D cartography, environmental IoT sensors, and occupancy optimization. 
            Steer your entire real estate portfolio from a digital twin.
          </p>
        </motion.div>

        {/* Feature Grid without boxes - just huge icons/numbers and text */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-center text-center gap-4"
          >
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-500 mb-2">
              {activeNodesCount > 0 ? activeNodesCount : "120+"}
            </div>
            <h3 className="text-2xl font-semibold text-white">Connected Buildings</h3>
            <p className="text-neutral-400 font-medium">
              Instant telemetry synchronization across all your sites.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center text-center gap-4"
          >
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-500 mb-2">
              IoT
            </div>
            <h3 className="text-2xl font-semibold text-white">Real-Time Telemetry</h3>
            <p className="text-neutral-400 font-medium">
              Native sensors for temperature, CO2, and indoor occupancy.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center text-center gap-4"
          >
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-emerald-500 mb-2">
              BIM
            </div>
            <h3 className="text-2xl font-semibold text-white">Digital Twin</h3>
            <p className="text-neutral-400 font-medium">
              3D BIM modeling to locate equipment and streamline interventions.
            </p>
          </motion.div>

        </div>

        {/* Large Material Immersive View */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="w-full aspect-[2/1] rounded-3xl overflow-hidden relative flex items-center justify-center bg-[#111]"
        >
          {/* We simulate a massive close-up of the metal frame using CSS gradients */}
          <div 
            className="absolute inset-0 transition-colors duration-1000"
            style={{
              background: selectedColor.id === "theme-facility"
                ? "linear-gradient(to right, #047857, #10b981, #047857)"
                : selectedColor.id === "theme-it"
                ? "linear-gradient(to right, #1d4ed8, #3b82f6, #1d4ed8)"
                : "linear-gradient(to right, #b45309, #f59e0b, #b45309)"
            }}
          />
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at center, transparent, black)' }} />
          
          <div className="relative z-10 text-center px-4">
            <h4 className="text-3xl sm:text-5xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">
              Module {selectedColor.name}
            </h4>
            <p className="text-lg text-white font-medium max-w-md mx-auto drop-shadow-md">
              {selectedColor.description}
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
