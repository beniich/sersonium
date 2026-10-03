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
      `BeeCarbonat Spider CAFM Architecture Specification (v4.16.2)
=============================================================
Edge Mesh: Cloudflare Workers + MQTT v5 & WebSockets
Inference: Google Gemini 3.8 Flash (Serverless CVC Diagnostics)
Persistence: Neon PostgreSQL & Dexie.js Offline Client Replicas
BIM Ingestion: IFC 4.3, Autodesk Revit RVT, WebGL Three.js LOD 400
Compliance: CSRD ESRS E1, ISO 50001, ASHRAE 90.1, WELL v2 Standard
      `
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BeeCarbonat-Spider-CAFM-Architecture-Spec.txt';
    a.click();
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <section className="py-16 bg-[#fafbff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-indigo-50/90 rounded-3xl p-8 sm:p-12 border border-indigo-100/90 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-indigo-200 text-xs font-mono font-medium text-indigo-700 mb-4 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              ENTERPRISE INGESTION
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Deploy Spider CAFM in 48 Hours.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Ingest your IFC spatial files, connect existing Modbus or BACnet controllers, and activate Gemini AI predictive energy balancing across your portfolio.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto shrink-0">
            <button
              onClick={onOpenSchedule}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Architecture Review</span>
            </button>
            <button
              onClick={handleDownloadSpec}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-2xs hover:border-indigo-200 transition-all"
            >
              {downloaded ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4 text-slate-500" />}
              <span>{downloaded ? 'Spec Downloaded' : 'Request Spec Sheet (PDF)'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
