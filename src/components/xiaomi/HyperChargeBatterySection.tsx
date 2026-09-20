import React from "react";
import { motion } from "motion/react";
import { GlobalState } from "../../types";

interface HyperChargeBatterySectionProps {
  state?: GlobalState;
}

export const HyperChargeBatterySection: React.FC<HyperChargeBatterySectionProps> = ({ state }) => {
  const averagePue = state?.nodes?.length 
    ? (state.nodes.reduce((acc, n) => acc + (n.pue || 1.15), 0) / state.nodes.length).toFixed(2)
    : "1.14";

  return (
    <section id="battery" className="w-full bg-[#000] text-white py-32 px-4 sm:px-8 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(0,255,200,0.08)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-[1000px] mx-auto text-center relative z-10 flex flex-col items-center">
        
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-5xl sm:text-7xl font-bold tracking-tighter text-white mb-6"
        >
          ESG & Energy Efficiency
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-2xl sm:text-3xl text-neutral-400 font-medium max-w-3xl leading-relaxed mb-16"
        >
          Collect, analyze, and optimize energy performance across your entire real estate portfolio.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full max-w-2xl aspect-[16/9] relative flex flex-col items-center justify-center rounded-[40px] border border-white/10 bg-gradient-to-b from-[#111] to-black shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,255,200,0.1)_0%,transparent_100%)]" />
          
          <div className="text-7xl sm:text-9xl font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(0,255,200,0.4)]">
            -24<span className="text-4xl sm:text-6xl text-emerald-400 font-bold ml-2">%</span>
          </div>
          <p className="text-neutral-400 mt-4 text-lg font-medium tracking-widest uppercase">Average Energy Savings</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full mt-20 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-2xl font-bold text-white mb-2">ESG & CSRD Reports</h4>
            <p className="text-neutral-400 font-medium">Automatically generate your carbon footprints and sustainability reports according to international standards.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-2xl font-bold text-white mb-2">HVAC Optimization</h4>
            <p className="text-neutral-400 font-medium">AI dynamically adjusts heating, cooling, and airflow based on real-time room occupancy telemetry.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-2xl font-bold text-white mb-2">Leak & Anomaly Detection</h4>
            <p className="text-neutral-400 font-medium">Instant automated alerts on abnormal after-hours water, gas, or electrical consumption patterns.</p>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
