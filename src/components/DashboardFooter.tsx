import React, { useState, useEffect } from "react";

export interface DashboardFooterProps {
  className?: string;
  onNavigate?: (page: string) => void;
}

export const DashboardFooter: React.FC<DashboardFooterProps> = ({ className = "" }) => {
  const [time, setTime] = useState<string>(() => new Date().toLocaleTimeString("en-GB", { timeZone: "UTC" }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-GB", { timeZone: "UTC" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className={`h-[26px] w-full bg-[#0a0b11] border-t border-gray-800 flex items-center justify-between px-3 sm:px-4 text-gray-500 font-mono text-[10px] uppercase tracking-wider select-none shrink-0 z-30 ${className}`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-gray-400">Cluster EU-North: Healthy</span>
        </div>
        <div className="h-3 w-[1px] bg-gray-800 hidden xs:block" />
        <span className="hidden sm:inline text-gray-400">Zero-Trust HSM: Active</span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <span className="hidden md:inline text-gray-500">Build v3.8-Enterprise (2026.10)</span>
        <div className="h-3 w-[1px] bg-gray-800 hidden md:block" />
        <span className="text-gray-400">{time} UTC</span>
      </div>
    </footer>
  );
};

export default DashboardFooter;
