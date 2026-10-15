import React, { useState } from 'react';
import { Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface CtaSectionProps {
  onOpenSchedule: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onOpenSchedule }) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadSpec = () => {
    setDownloaded(true);
    // Download simulated PDF spec sheet
    const blob = new Blob([
      `SENSORIUM Sovereign Platform Architecture Specification (v5.2)
=============================================================
Edge Mesh: Cloudflare Workers + MQTT v5 & WebSockets (WSS)
Inference: Edge AI + Sovereign Gemini Multi-Tenant Diagnostics
Persistence: PostgreSQL + Transactional Outbox + Redis LRU
BIM & Digital Twin: IFC 4.3, Revit RVT, WebGL Three.js LOD 400
Compliance: CSRD ESRS E1, ISO 50001, ASHRAE 90.1, DORA, SecNumCloud
      `
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SENSORIUM-Sovereign-Architecture-Spec.txt';
    a.click();
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <section className="py-16 bg-white dark:bg-[#070709] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-white/[0.08] bg-slate-900 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono font-medium text-orange-400 mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              ENTERPRISE DEPLOYMENT
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Deploy SENSORIUM in 48 Hours.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              Ingest your IFC spatial files, connect existing Modbus, BACnet, or MQTT streams, and activate predictive energy balancing and autonomous compliance across your entire infrastructure portfolio.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto shrink-0 relative z-10">
            <button
              onClick={onOpenSchedule}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Architecture Review</span>
            </button>
            <button
              onClick={handleDownloadSpec}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 shadow-sm transition-all"
            >
              {downloaded ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4 text-slate-300" />}
              <span>{downloaded ? 'Spec Downloaded' : 'Request Spec Sheet (PDF)'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
