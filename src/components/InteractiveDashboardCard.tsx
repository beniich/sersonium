import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LucideIcon, MoreHorizontal, Sparkles } from "lucide-react";

export interface QuickActionItem {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: (e: React.MouseEvent) => void;
  variant?: "default" | "primary" | "danger" | "success" | "warning";
  tooltip?: string;
}

interface InteractiveDashboardCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  quickActions?: QuickActionItem[];
  quickActionsTitle?: string;
  scaleAmount?: number;
  glowColor?: "orange" | "blue" | "emerald" | "purple" | "red" | "white";
  delay?: number;
  id?: string;
  badge?: string;
  badgeColor?: string;
}

export default function InteractiveDashboardCard({
  children,
  className = "",
  onClick,
  quickActions = [],
  quickActionsTitle = "Actions Rapides",
  scaleAmount = 1.025,
  glowColor = "orange",
  delay = 0,
  id,
  badge,
  badgeColor = "bg-white/10 text-white"
}: InteractiveDashboardCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Cloudflare-harmonized border and glow classes
  const glowBorderClasses = {
    orange: "group-hover:border-orange-500/40 group-hover:shadow-[0_8px_24px_rgba(246,130,31,0.10)]",
    blue: "group-hover:border-orange-500/30 group-hover:shadow-[0_8px_24px_rgba(246,130,31,0.08)]",
    emerald: "group-hover:border-orange-500/30 group-hover:shadow-[0_8px_24px_rgba(246,130,31,0.08)]",
    purple: "group-hover:border-orange-500/30 group-hover:shadow-[0_8px_24px_rgba(246,130,31,0.08)]",
    red: "group-hover:border-red-500/40 group-hover:shadow-[0_8px_24px_rgba(239,68,68,0.12)]",
    white: "group-hover:border-white/25 group-hover:shadow-[0_8px_24px_rgba(255,255,255,0.06)]"
  }[glowColor];

  const actionVariantClasses = {
    default: "bg-white/[0.05] hover:bg-white/[0.12] text-neutral-300 hover:text-white border-white/[0.08]",
    primary: "bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 hover:text-orange-300 border-orange-500/30 font-medium",
    success: "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 border-emerald-500/30",
    warning: "bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 hover:text-amber-300 border-amber-500/30",
    danger: "bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 border-red-500/30"
  };

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      whileHover={{ 
        scale: scaleAmount, 
        y: -3,
        transition: { type: "spring", stiffness: 400, damping: 28 }
      }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`group relative rounded-2xl sm:rounded-3xl bg-[#0c0c0e]/95 border border-white/[0.08] transition-all overflow-hidden flex flex-col justify-between cursor-pointer ${glowBorderClasses} ${className}`}
    >
      {/* Cloudflare Ambient background light beam on hover */}
      <div 
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-opacity duration-500 ${
          isHovered ? "opacity-20" : "opacity-0"
        } ${
          glowColor === "red" ? "bg-red-500" : "bg-orange-500"
        }`} 
      />

      {/* Optional Top Badge */}
      {badge && (
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${badgeColor}`}>
            {badge}
          </span>
        </div>
      )}

      {/* Main Card Content */}
      <div className="relative z-0 flex-1 flex flex-col justify-between">
        {children}
      </div>

      {/* Framer Motion Quick Actions Secondary Menu on Hover */}
      {quickActions.length > 0 && (
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 8, height: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-20 mt-2 pt-2 pb-1 border-t border-white/[0.09] bg-[#08080a]/95 backdrop-blur-md px-4 sm:px-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-orange-400" />
                  {quickActionsTitle}
                </span>
                <span className="text-[9px] font-mono text-neutral-500">
                  {quickActions.length} actions
                </span>
              </div>

              {/* Quick Actions Button Bar */}
              <div className="flex items-center gap-1.5 flex-wrap pb-1">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  const variantClass = actionVariantClasses[action.variant || "default"];
                  return (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(e);
                      }}
                      title={action.tooltip || action.label}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${variantClass}`}
                    >
                      <Icon className="w-3 h-3 flex-shrink-0" />
                      <span className="whitespace-nowrap">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
