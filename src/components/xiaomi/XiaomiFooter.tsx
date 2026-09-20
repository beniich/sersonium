import React from "react";

export const XiaomiFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#050505] text-[#888890] text-sm pt-20 pb-12 px-4 sm:px-8 font-sans">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-12">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-white/5">
          <div className="flex flex-col gap-4">
            <span className="text-white font-medium mb-2">Solutions</span>
            <span className="hover:text-white transition-colors cursor-pointer">LACAZA CAFM</span>
            <span className="hover:text-white transition-colors cursor-pointer">LACAZA ITSM</span>
            <span className="hover:text-white transition-colors cursor-pointer">Smart Building IoT</span>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-white font-medium mb-2">Developers</span>
            <span className="hover:text-white transition-colors cursor-pointer">Documentation</span>
            <span className="hover:text-white transition-colors cursor-pointer">API Reference</span>
            <span className="hover:text-white transition-colors cursor-pointer">Status</span>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-white font-medium mb-2">Company</span>
            <span className="hover:text-white transition-colors cursor-pointer">About LACAZA</span>
            <span className="hover:text-white transition-colors cursor-pointer">Careers</span>
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-white font-medium mb-2">Connect</span>
            <span className="hover:text-white transition-colors cursor-pointer">Enterprise Sales</span>
            <span className="hover:text-white transition-colors cursor-pointer">X (Twitter)</span>
            <span className="hover:text-white transition-colors cursor-pointer">GitHub</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-xs font-light text-neutral-600 leading-relaxed">
          <p>
            * LACAZA OS and SMART SPACE are registered trademarks of LACAZA Inc. Engineered for enterprise building facility management and IT operations.
          </p>
          <p>
            * ESG metrics (24% energy savings) are based on Q4 telemetry from Class A commercial real estate facilities under optimal workload.
          </p>
          <p>
            * ISO 27001 and ISO 50001 (Energy Management) certify data security standards and resilience during compliance audits.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-neutral-500">
          <span>Copyright © 2026 LACAZA Inc. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Cookie Policy</span>
            <span className="hover:text-white transition-colors cursor-pointer">User Agreement</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
