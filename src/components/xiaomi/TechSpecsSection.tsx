import React, { useState, useEffect } from "react";
import { TECH_SPECS } from "../../data/xiaomi17tProData";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { GlobalState } from "../../types";

interface TechSpecsSectionProps {
  state?: GlobalState;
}

export const TechSpecsSection: React.FC<TechSpecsSectionProps> = ({ state }) => {
  const dynamicSpecs = [
    {
      category: "Facilities & Sites (CAFM)",
      items: state?.nodes?.map(n => ({
        label: n.name,
        value: `${n.location} • Status: ${n.status.toUpperCase()} • Efficiency: ${n.pue} PUE`
      })) || []
    },
    {
      category: "Warehouses & Storage Zones",
      items: state?.buckets?.map(b => ({
        label: b.name,
        value: `Region: ${b.location} • Assets: ${b.objects?.toLocaleString()} • Capacity: ${b.sizeGB} GB`
      })) || []
    },
    {
      category: "Support & Field Interventions",
      items: [
        {
          label: "Active Technicians",
          value: `${state?.teamMembers?.length || state?.workOrders?.length || 12} field teams deployed`
        },
        {
          label: "Recent Tickets",
          value: `${state?.securityEvents?.length || 0} requests processed`
        },
        {
          label: "SLA Response Time",
          value: "Under 15 minutes average"
        }
      ]
    }
  ];

  const specsToUse = (state?.nodes?.length ? dynamicSpecs : TECH_SPECS).filter(s => s.items.length > 0);
  
  const [openCategory, setOpenCategory] = useState<string>("");

  useEffect(() => {
    if (specsToUse.length > 0 && !openCategory) {
      setOpenCategory(specsToUse[0].category);
    }
  }, [specsToUse, openCategory]);

  return (
    <section id="specs" className="w-full bg-[#111] text-white py-32 px-4 sm:px-8">
      <div className="max-w-[1000px] mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tighter text-white">
            Platform Specifications
          </h2>
        </motion.div>

        <div className="flex flex-col border-t border-white/10">
          {specsToUse.map((group) => {
            const isOpen = openCategory === group.category;
            return (
              <div key={group.category} className="border-b border-white/10">
                <button
                  onClick={() => setOpenCategory(isOpen ? "" : group.category)}
                  className="w-full py-8 flex items-center justify-between text-left transition-colors hover:text-neutral-300"
                >
                  <span className="text-2xl font-semibold">{group.category}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-6 h-6 text-neutral-500" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 flex flex-col gap-6">
                        {group.items.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-8">
                            <span className="text-sm text-neutral-500 font-medium md:pt-1">
                              {item.label}
                            </span>
                            <span className="text-base text-neutral-300 md:col-span-2 leading-relaxed font-light">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
