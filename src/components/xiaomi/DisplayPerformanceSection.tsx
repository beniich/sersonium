import React from "react";
import { motion } from "motion/react";
import { GlobalState } from "../../types";

interface DisplayPerformanceSectionProps {
  state?: GlobalState;
}

export const DisplayPerformanceSection: React.FC<DisplayPerformanceSectionProps> = ({ state }) => {
  const currentTraffic = state?.trafficData?.[state.trafficData.length - 1];
  const reqCount = currentTraffic?.requests || 85400;
  const bandwidth = currentTraffic?.bandwidth || 12.4;
  
  return (
    <section id="display" className="w-full bg-[#050505] text-white py-32 px-4 sm:px-8 relative">
      
      <div className="max-w-[1200px] mx-auto flex flex-col gap-32">
        
        {/* Performance - Edge Compute */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl sm:text-6xl font-bold tracking-tighter text-white mb-6">
                IT & ITSM Performance
              </h2>
              <p className="text-xl sm:text-2xl text-neutral-400 font-medium leading-relaxed mb-12">
                An ultra-responsive ITIL service desk. Handle incidents, changes, and service catalogs with complete fluidity.
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-bold text-white mb-2">{Math.floor(reqCount / 1000)}k</div>
                  <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Resolved Tickets</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">{bandwidth}k</div>
                  <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">IT Assets (CMDB)</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">ITIL V4</div>
                  <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Certified Standard</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">&lt; 5m</div>
                  <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Avg Response Time</div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="w-full aspect-square rounded-[40px] bg-gradient-to-br from-[#1a1005] via-[#0d0d0d] to-[#111] border border-white/5 relative flex items-center justify-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,105,0,0.1)_0%,transparent_70%)]" />
              <div className="text-center relative z-10">
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-orange-400 to-red-600 tracking-tighter">
                  HELP-DESK
                </div>
                <div className="text-4xl font-bold text-white mt-2">
                  ITSM
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Display - Edge Caching */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl sm:text-6xl font-bold tracking-tighter text-white mb-6">
                CMMS & Maintenance
              </h2>
              <p className="text-xl sm:text-2xl text-neutral-400 font-medium leading-relaxed mb-12">
                Smart intervention scheduling, spare parts inventory control, and contractor oversight for maximum asset uptime.
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-bold text-white mb-2">99.2%</div>
                  <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Asset Uptime</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">{state?.buckets?.length || 4}k</div>
                  <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Work Orders</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">Auto</div>
                  <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Tech Routing</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">Preventive</div>
                  <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Maintenance Strategy</div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="w-full aspect-square rounded-[40px] bg-gradient-to-br from-[#051120] via-[#0d0d0d] to-[#111] border border-white/5 relative flex items-center justify-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,150,255,0.1)_0%,transparent_70%)]" />
              <div className="text-center relative z-10">
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-200 via-blue-400 to-indigo-600 tracking-tighter">
                  EAM/GMAO
                </div>
                <div className="text-3xl font-bold text-white mt-2">
                  Facilities
                </div>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
};
