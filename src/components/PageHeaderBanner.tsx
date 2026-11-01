import React from "react";
import { motion } from "motion/react";
import { LucideIcon, Sparkles } from "lucide-react";

export interface TelemetryPill {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
}

export interface PageHeaderBannerProps {
  bannerImage: string;
  bannerAlt?: string;
  badge?: string;
  badgeIcon?: LucideIcon;
  badgeColor?: string;
  status?: {
    label: string;
    color?: "emerald" | "blue" | "amber" | "rose" | "purple" | "orange";
  };
  title: string;
  subtitle?: string;
  description?: string;
  telemetry?: TelemetryPill[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  isDark?: boolean;
  compact?: boolean;
  className?: string;
}

const STATUS_COLOR_MAP = {
  emerald: {
    dot: "bg-emerald-400",
    ping: "bg-emerald-400",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20"
  },
  blue: {
    dot: "bg-sky-400",
    ping: "bg-sky-400",
    text: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20"
  },
  amber: {
    dot: "bg-amber-400",
    ping: "bg-amber-400",
    text: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20"
  },
  rose: {
    dot: "bg-rose-400",
    ping: "bg-rose-400",
    text: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20"
  },
  purple: {
    dot: "bg-purple-400",
    ping: "bg-purple-400",
    text: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20"
  },
  orange: {
    dot: "bg-orange-400",
    ping: "bg-orange-400",
    text: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20"
  }
};

export const PageHeaderBanner: React.FC<PageHeaderBannerProps> = ({
  bannerImage,
  bannerAlt = "Enterprise service header visual",
  badge,
  badgeIcon: BadgeIcon = Sparkles,
  badgeColor = "bg-orange-500/15 text-orange-400 border-orange-500/30",
  status,
  title,
  subtitle,
  description,
  telemetry = [],
  actions,
  children,
  compact = false,
  className = ""
}) => {
  const webpSrc = bannerImage.replace(/\.png$/i, ".webp");
  const statusConfig = status ? STATUS_COLOR_MAP[status.color || "emerald"] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-900 shadow-xl transition-all ${className}`}
    >
      {/* Background Cinematic Visual with WebP + PNG Fallback */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          <img
            src={bannerImage}
            alt={bannerAlt}
            className="w-full h-full object-cover object-right md:object-center transform scale-[1.02] filter brightness-[0.88] dark:brightness-[0.75] contrast-[1.08] transition-transform duration-700 hover:scale-[1.04]"
            loading="eager"
          />
        </picture>

        {/* Multi-stage High-Contrast Lumina Pure Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40 dark:from-[#08080a] dark:via-[#08080a]/90 dark:to-[#08080a]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30 dark:from-[#08080a]/90 dark:via-transparent dark:to-transparent" />
        
        {/* Subtle orange/accent ambient light reflection */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Foreground Content */}
      <div className={`relative z-10 p-5 sm:p-6 lg:p-7 flex flex-col justify-between ${compact ? "min-h-[140px]" : "min-h-[170px]"}`}>
        {/* Top Badges & Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {badge && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase border backdrop-blur-md shadow-xs ${badgeColor}`}>
                <BadgeIcon className="w-3.5 h-3.5" />
                <span>{badge}</span>
              </span>
            )}
            {status && statusConfig && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border backdrop-blur-md ${statusConfig.bg} ${statusConfig.text}`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.ping}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig.dot}`} />
                </span>
                <span>{status.label}</span>
              </span>
            )}
          </div>

          {/* Action buttons (desktop top-right or slot) */}
          {actions && (
            <div className="hidden sm:flex items-center gap-2.5">
              {actions}
            </div>
          )}
        </div>

        {/* Title & Subtitle / Context description */}
        <div className="max-w-3xl space-y-1.5">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm font-['Space_Grotesk']">
            {title}
          </h1>
          {subtitle && (
            <div className="text-xs sm:text-sm font-mono text-orange-300/90 dark:text-orange-400/90 flex items-center gap-2">
              <span className="truncate">{subtitle}</span>
            </div>
          )}
          {description && (
            <p className="text-xs sm:text-sm text-slate-300 dark:text-neutral-300/90 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Bottom Telemetry & Mobile Action buttons */}
        {(telemetry.length > 0 || actions || children) && (
          <div className="mt-4 pt-3 border-t border-white/[0.10] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Telemetry Pills */}
            {telemetry.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {telemetry.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] backdrop-blur-md transition-colors"
                  >
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                      {item.label}
                    </span>
                    <span className="text-xs font-bold font-mono text-white">
                      {item.value}
                    </span>
                    {item.change && (
                      <span
                        className={`text-[10px] font-mono px-1 rounded ${
                          item.isPositive
                            ? "text-emerald-400 bg-emerald-500/10"
                            : "text-amber-400 bg-amber-500/10"
                        }`}
                      >
                        {item.change}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : <div />}

            {/* Mobile Actions or inline children */}
            <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
              <div className="sm:hidden flex items-center gap-2 w-full flex-wrap">
                {actions}
              </div>
              {children}
            </div>
          </div>
        )}
      </div>

      {/* Subtle Lumina Pure Bottom Border Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500/60 via-amber-400/40 to-transparent" />
    </motion.div>
  );
};

export default PageHeaderBanner;
