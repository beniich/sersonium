import React, { useState } from 'react';

interface EsgGrafanaViewProps {
  onNavigate: (path: any) => void;
}

export const EsgGrafanaView: React.FC<EsgGrafanaViewProps> = ({ onNavigate }) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  // CSRD Toggles state
  const [csrdToggles, setCsrdToggles] = useState({
    climate: true,
    water: true,
    circular: false,
    social: true,
  });

  // Slider values
  const [spikeLimit, setSpikeLimit] = useState(85);
  const [intensityCutoff, setIntensityCutoff] = useState(240);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExportPdf = () => {
    setDownloadingPdf(true);
    setTimeout(() => {
      setDownloadingPdf(false);
      setPdfDownloaded(true);
      showToast('Rapport CSRD Certifié ISO 14064-1 généré avec succès !');

      // Trigger text download
      const content = `BeeCarbonat - Rapport ESG CSRD & Décarbonation 2026
======================================================
Norme: CSRD EN ISO 14064-1 (Article 8 Taxonomy Aligned 98.4%)
Périmètre: Campus Omikron - Tour B4 Frankfurt West

SCOPE 1 (Combustion Directe): 842 tCO2e (-18.4% YoY)
SCOPE 2 (Énergie Réseau PPA): 319 tCO2e (-62.1% YoY)
SCOPE 3 (Chaîne de Valeur): 2,959 tCO2e (-24.8% YoY)
TOTAL EMISSIONS ABATUES: 4,120 tCO2e (Verra Standard Validé)
OPEX SAVINGS VERIFIEES: -42%
AUDITEUR EXTERNE: TÜV SÜD Validated
SEAU BLOCKCHAIN HSM: 0x9AF421BD4301C7E8
      `;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'BeeCarbonat-CSRD-Audit-Ledger.txt';
      a.click();

      setTimeout(() => setPdfDownloaded(false), 4000);
    }, 1200);
  };

  return (
    <div className="w-full min-h-screen bg-[#fbf8ff] pt-20 pb-16 flex flex-col justify-between">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 max-w-7xl mx-auto">
        {/* Top Command & Synchronizer Strip */}
        <div className="tactile-plate p-4 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl tactile-debossed flex items-center justify-center text-[#630ed4]">
              <span className="material-symbols-outlined text-[28px]">energy_program_saving</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-xl font-bold text-[#1b1b20] tracking-tight">
                  BeeCarbonat • ESG CSRD Instrumentation Hub
                </span>
                <span className="tactile-debossed px-2.5 py-0.5 rounded-full font-['Space_Grotesk'] text-[10px] text-[#00746a] font-bold">
                  CSRD EN ISO 14064-1
                </span>
              </div>
              <span className="text-xs text-[#4a4455]">
                Real-time telemetric decarbonization telemetry • Integrated Edge PromQL Gateway
              </span>
            </div>
          </div>

          {/* Live Telemetry Status Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="tactile-debossed px-3 py-2 rounded-xl flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#005952] shadow-[0_0_8px_rgba(0,116,106,0.6)]"></span>
                <span className="absolute w-4 h-4 rounded-full bg-[#005952]/20 animate-ping"></span>
              </div>
              <div className="flex flex-col">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase">Taxonomy State</span>
                <span className="font-['Space_Grotesk'] text-xs text-[#1b1b20] font-bold">98.4% Aligned</span>
              </div>
            </div>

            <div className="tactile-debossed px-3 py-2 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-[#630ed4] text-[20px]">verified</span>
              <div className="flex flex-col">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase">Audit Ledger</span>
                <span className="font-['Space_Grotesk'] text-xs text-[#1b1b20] font-bold">Immutable HSM Sealed</span>
              </div>
            </div>

            <button
              onClick={handleExportPdf}
              disabled={downloadingPdf}
              className="tactile-btn-primary px-4 py-2.5 rounded-xl font-['Space_Grotesk'] text-xs text-white font-bold flex items-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[18px] ${downloadingPdf ? 'animate-spin' : ''}`}>
                {downloadingPdf ? 'refresh' : 'picture_as_pdf'}
              </span>
              <span>
                {downloadingPdf
                  ? 'Generating Official CSRD PDF...'
                  : pdfDownloaded
                  ? 'CSRD Audit Ready (Downloaded)'
                  : 'Export CSRD Audit PDF'}
              </span>
            </button>
          </div>
        </div>

        {/* Section 1: Tactile ESG Carbon Accounting Dashboard */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: Scope 1, 2, 3 Physical Debossed Gauge Cluster */}
          <div className="xl:col-span-8 tactile-plate p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#630ed4] shadow-[0_0_10px_rgba(99,14,212,0.5)]"></span>
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#1b1b20]">
                  GHG Protocol Gauge Cluster • Scope 1, 2 &amp; 3
                </h2>
              </div>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#7b7487] uppercase tracking-wider">
                Calibration Unit: metric tCO2e / Annum
              </span>
            </div>

            {/* 3 Circular Dials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Dial 1: Scope 1 */}
              <div className="tactile-debossed p-4 rounded-xl flex flex-col items-center justify-between relative group">
                <div className="w-full flex items-center justify-between">
                  <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1b1b20]">Scope 1: Direct</span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#630ed4] font-bold">TARGET -35%</span>
                </div>

                <div className="relative w-40 h-40 my-3 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" fill="none" r="48" stroke="#ccc3d8" strokeDasharray="301.6" strokeDashoffset="75.4" strokeLinecap="round" strokeWidth="8"></circle>
                    <circle
                      className="text-[#630ed4] transition-all duration-1000 ease-out"
                      cx="60"
                      cy="60"
                      fill="none"
                      r="48"
                      stroke="currentColor"
                      strokeDasharray="301.6"
                      strokeDashoffset="140"
                      strokeLinecap="round"
                      strokeWidth="9"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-['Space_Grotesk'] text-2xl font-bold text-[#1b1b20] tracking-tight">842</span>
                    <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase">tCO2e / YTD</span>
                  </div>
                </div>

                <div className="w-full tactile-plate px-3 py-1.5 rounded-lg flex items-center justify-between">
                  <span className="text-[10px] text-[#4a4455]">Boilers &amp; Fleet</span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#00746a] font-bold">-18.4% YoY</span>
                </div>
              </div>

              {/* Dial 2: Scope 2 */}
              <div className="tactile-debossed p-4 rounded-xl flex flex-col items-center justify-between relative group">
                <div className="w-full flex items-center justify-between">
                  <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1b1b20]">Scope 2: Energy</span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#630ed4] font-bold">100% PPA GREEN</span>
                </div>

                <div className="relative w-40 h-40 my-3 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" fill="none" r="48" stroke="#ccc3d8" strokeDasharray="301.6" strokeDashoffset="75.4" strokeLinecap="round" strokeWidth="8"></circle>
                    <circle
                      className="text-[#005952] transition-all duration-1000 ease-out"
                      cx="60"
                      cy="60"
                      fill="none"
                      r="48"
                      stroke="currentColor"
                      strokeDasharray="301.6"
                      strokeDashoffset="210"
                      strokeLinecap="round"
                      strokeWidth="9"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-['Space_Grotesk'] text-2xl font-bold text-[#1b1b20] tracking-tight">319</span>
                    <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase">tCO2e / YTD</span>
                  </div>
                </div>

                <div className="w-full tactile-plate px-3 py-1.5 rounded-lg flex items-center justify-between">
                  <span className="text-[10px] text-[#4a4455]">Power Purchase</span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#00746a] font-bold">-62.1% YoY</span>
                </div>
              </div>

              {/* Dial 3: Scope 3 */}
              <div className="tactile-debossed p-4 rounded-xl flex flex-col items-center justify-between relative group">
                <div className="w-full flex items-center justify-between">
                  <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1b1b20]">Scope 3: Upstream</span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#630ed4] font-bold">SUPPLY CHAIN</span>
                </div>

                <div className="relative w-40 h-40 my-3 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" fill="none" r="48" stroke="#ccc3d8" strokeDasharray="301.6" strokeDashoffset="75.4" strokeLinecap="round" strokeWidth="8"></circle>
                    <circle
                      className="text-[#712edd] transition-all duration-1000 ease-out"
                      cx="60"
                      cy="60"
                      fill="none"
                      r="48"
                      stroke="currentColor"
                      strokeDasharray="301.6"
                      strokeDashoffset="95"
                      strokeLinecap="round"
                      strokeWidth="9"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-['Space_Grotesk'] text-2xl font-bold text-[#1b1b20] tracking-tight">2,959</span>
                    <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase">tCO2e / YTD</span>
                  </div>
                </div>

                <div className="w-full tactile-plate px-3 py-1.5 rounded-lg flex items-center justify-between">
                  <span className="text-[10px] text-[#4a4455]">Procurement</span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#630ed4] font-bold">-24.8% YoY</span>
                </div>
              </div>
            </div>

            {/* Mechanical Embossed Odometer Counter Array */}
            <div className="tactile-debossed p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg tactile-plate flex items-center justify-center text-[#630ed4]">
                  <span className="material-symbols-outlined text-[24px]">pin</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1b1b20]">
                    Mechanical Abatement Counter
                  </span>
                  <span className="text-xs text-[#4a4455]">Continuous cumulative verified sequestration</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Roll 1: OPEX */}
                <div className="tactile-plate px-3 py-2 rounded-xl flex items-center gap-2">
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase">Total OPEX</span>
                  <div className="flex items-center gap-1 font-['Space_Grotesk'] font-bold text-xl">
                    <span className="tactile-debossed px-2 py-1 rounded text-[#00746a]">-</span>
                    <span className="tactile-debossed px-2 py-1 rounded text-[#1b1b20]">4</span>
                    <span className="tactile-debossed px-2 py-1 rounded text-[#1b1b20]">2</span>
                    <span className="tactile-debossed px-2 py-1 rounded text-[#00746a]">%</span>
                  </div>
                </div>

                {/* Roll 2: Net Abated */}
                <div className="tactile-plate px-3 py-2 rounded-xl flex items-center gap-2">
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase">Net Abated</span>
                  <div className="flex items-center gap-1 font-['Space_Grotesk'] font-bold text-xl">
                    <span className="tactile-debossed px-2 py-1 rounded text-[#630ed4]">4</span>
                    <span className="tactile-debossed px-2 py-1 rounded text-[#1b1b20]">,</span>
                    <span className="tactile-debossed px-2 py-1 rounded text-[#1b1b20]">1</span>
                    <span className="tactile-debossed px-2 py-1 rounded text-[#1b1b20]">2</span>
                    <span className="tactile-debossed px-2 py-1 rounded text-[#1b1b20]">0</span>
                    <span className="tactile-debossed px-2 py-1 rounded text-xs text-[#4a4455]">tCO2e</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: CSRD EU Taxonomy Audit Checklists with Tactile Toggles */}
          <div className="xl:col-span-4 tactile-plate p-6 sm:p-8 rounded-2xl flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#630ed4] text-[22px]">fact_check</span>
                  <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#1b1b20]">
                    CSRD Compliance Board
                  </h3>
                </div>
                <span className="tactile-debossed px-2 py-1 rounded-md font-['Space_Grotesk'] text-[10px] font-bold text-[#00746a]">
                  Art. 8 Ready
                </span>
              </div>
              <p className="text-xs text-[#4a4455]">
                EU Taxonomy Climate Mitigation &amp; DNSH (Do No Significant Harm) protocols.
              </p>
            </div>

            {/* Checklist Items */}
            <div className="flex flex-col gap-3">
              {/* Row 1 */}
              <div className="tactile-debossed p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#005952] shadow-[0_0_8px_rgba(0,116,106,0.8)]"></span>
                  <div className="flex flex-col">
                    <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1b1b20]">
                      Substantial Climate Contrib.
                    </span>
                    <span className="text-[10px] text-[#4a4455]">Annex I / Building Refurbishment</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCsrdToggles({ ...csrdToggles, climate: !csrdToggles.climate })}
                  className="w-12 h-6 tactile-plate rounded-full relative p-0.5 transition-colors cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 rounded-full shadow-md transition-transform flex items-center justify-center ${
                      csrdToggles.climate ? 'translate-x-6 bg-[#7c3aed]' : 'translate-x-0 bg-[#ccc3d8]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </div>
                </button>
              </div>

              {/* Row 2 */}
              <div className="tactile-debossed p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#005952] shadow-[0_0_8px_rgba(0,116,106,0.8)]"></span>
                  <div className="flex flex-col">
                    <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1b1b20]">
                      DNSH: Water &amp; Marine
                    </span>
                    <span className="text-[10px] text-[#4a4455]">Appendix B greywater flow telemetry</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCsrdToggles({ ...csrdToggles, water: !csrdToggles.water })}
                  className="w-12 h-6 tactile-plate rounded-full relative p-0.5 transition-colors cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 rounded-full shadow-md transition-transform flex items-center justify-center ${
                      csrdToggles.water ? 'translate-x-6 bg-[#7c3aed]' : 'translate-x-0 bg-[#ccc3d8]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </div>
                </button>
              </div>

              {/* Row 3 */}
              <div className="tactile-debossed p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8b4ef7] shadow-[0_0_8px_rgba(139,78,247,0.7)]"></span>
                  <div className="flex flex-col">
                    <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1b1b20]">
                      DNSH: Circular Economy
                    </span>
                    <span className="text-[10px] text-[#4a4455]">Demolition &amp; recycled aggregate index</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCsrdToggles({ ...csrdToggles, circular: !csrdToggles.circular })}
                  className="w-12 h-6 tactile-plate rounded-full relative p-0.5 transition-colors cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 rounded-full shadow-md transition-transform flex items-center justify-center ${
                      csrdToggles.circular ? 'translate-x-6 bg-[#7c3aed]' : 'translate-x-0 bg-[#ccc3d8]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </div>
                </button>
              </div>

              {/* Row 4 */}
              <div className="tactile-debossed p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#005952] shadow-[0_0_8px_rgba(0,116,106,0.8)]"></span>
                  <div className="flex flex-col">
                    <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1b1b20]">
                      Minimum Social Safeguards
                    </span>
                    <span className="text-[10px] text-[#4a4455]">OECD Guidelines &amp; UN Guiding Principles</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCsrdToggles({ ...csrdToggles, social: !csrdToggles.social })}
                  className="w-12 h-6 tactile-plate rounded-full relative p-0.5 transition-colors cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 rounded-full shadow-md transition-transform flex items-center justify-center ${
                      csrdToggles.social ? 'translate-x-6 bg-[#7c3aed]' : 'translate-x-0 bg-[#ccc3d8]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </div>
                </button>
              </div>
            </div>

            <div className="tactile-plate p-3 rounded-xl flex items-center justify-between">
              <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase">
                Auditor Certification
              </span>
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#630ed4]">
                TÜV SÜD Validated
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Industrial Grafana Observability Deck */}
        <div className="tactile-plate p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg tactile-debossed flex items-center justify-center text-[#630ed4]">
                <span className="material-symbols-outlined text-[24px]">query_stats</span>
              </div>
              <div>
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#1b1b20]">
                  Industrial Grafana Observability Deck
                </h2>
                <span className="text-xs text-[#4a4455]">
                  High-rate Prometheus edge metrics, latency streams &amp; live active RPS monitoring
                </span>
              </div>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="tactile-debossed px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#7b7487]">EDGE LATENCY:</span>
                <span className="font-['Space_Grotesk'] text-xs font-bold text-[#00746a]">9.42 ms</span>
              </div>
              <div className="tactile-debossed px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#7b7487]">STREAM RPS:</span>
                <span className="font-['Space_Grotesk'] text-xs font-bold text-[#630ed4]">18,490 req/s</span>
              </div>
              <div className="tactile-debossed px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#7b7487]">SCRAPE INTERVAL:</span>
                <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1b1b20]">250ms</span>
              </div>
            </div>
          </div>

          {/* Oscilloscope Display & Telemetry Stream */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Live Oscilloscope Screen (Debossed Inset Lens) */}
            <div className="xl:col-span-8 tactile-debossed p-4 rounded-2xl flex flex-col gap-2 relative overflow-hidden">
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#630ed4] text-[18px]">terminal</span>
                  <code className="font-['JetBrains_Mono'] text-[11px] text-[#630ed4] font-bold">
                    promql: sum(rate(carbon_emissions_sensor_joules_total[1m])) by (substation)
                  </code>
                </div>
                <span className="tactile-plate px-2 py-0.5 rounded font-['Space_Grotesk'] text-[10px] text-[#4a4455] font-bold">
                  BUFFER: 1024 FRAMES
                </span>
              </div>

              {/* CRT Simulation Canvas */}
              <div className="relative w-full h-64 tactile-debossed rounded-xl p-2 flex items-end overflow-hidden">
                {/* Fine Instrument Grid lines */}
                <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-15 pointer-events-none">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="border-b border-r border-[#7b7487]"></div>
                  ))}
                </div>

                {/* Dynamic SVG Chart Waves */}
                <svg className="w-full h-full relative z-10" preserveAspectRatio="none" viewBox="0 0 800 200">
                  <defs>
                    <linearGradient id="grad-wave-1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35"></stop>
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0"></stop>
                    </linearGradient>
                  </defs>
                  {/* Area Fill */}
                  <path
                    d="M 0 160 Q 70 80, 140 120 T 280 90 T 420 140 T 560 60 T 700 110 L 800 85 L 800 200 L 0 200 Z"
                    fill="url(#grad-wave-1)"
                  ></path>
                  {/* Primary Signal Line */}
                  <path
                    d="M 0 160 Q 70 80, 140 120 T 280 90 T 420 140 T 560 60 T 700 110 L 800 85"
                    fill="none"
                    stroke="#630ed4"
                    strokeWidth="2.5"
                  ></path>
                  {/* Secondary Telemetry Line */}
                  <path
                    d="M 0 180 Q 80 140, 160 160 T 320 130 T 480 170 T 640 120 T 800 150"
                    fill="none"
                    stroke="#00746a"
                    strokeDasharray="4,4"
                    strokeWidth="1.5"
                  ></path>
                </svg>

                {/* Ping Heads */}
                <div className="absolute right-12 top-20 flex items-center gap-2 tactile-plate px-2.5 py-1 rounded-lg z-20 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-[#630ed4] animate-ping"></span>
                  <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#1b1b20]">
                    Substation 04B: Peak Spike
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[#4a4455] font-['Space_Grotesk'] text-[10px] z-10 px-1">
                <span>T - 60s (Streaming PromQL)</span>
                <span className="font-bold text-[#630ed4]">AGGREGATE BANDWIDTH: 42.8 GB/s</span>
                <span className="text-emerald-600 font-bold">LIVE NOW</span>
              </div>
            </div>

            {/* Right Instrument Control Rack */}
            <div className="xl:col-span-4 flex flex-col justify-between gap-4">
              {/* Sliders */}
              <div className="tactile-debossed p-4 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-['Space_Grotesk'] text-sm font-bold text-[#1b1b20]">
                    Alarm Trigger Setpoints
                  </span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#630ed4] font-bold">CRITICAL CO2e</span>
                </div>
                <span className="text-xs text-[#4a4455]">Continuous mechanical limit threshold modulation.</span>

                {/* Slider 1 */}
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex justify-between font-['Space_Grotesk'] text-[10px] text-[#1b1b20]">
                    <span className="text-[#4a4455]">Chiller Load Spike Limit</span>
                    <span className="font-bold text-[#630ed4]">{spikeLimit} tCO2e/h</span>
                  </div>
                  <div className="relative w-full h-6 tactile-plate rounded-full p-1 flex items-center">
                    <input
                      type="range"
                      min="10"
                      max="150"
                      value={spikeLimit}
                      onChange={(e) => setSpikeLimit(Number(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#630ed4] bg-[#efedf4]"
                    />
                  </div>
                </div>

                {/* Slider 2 */}
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex justify-between font-['Space_Grotesk'] text-[10px] text-[#1b1b20]">
                    <span className="text-[#4a4455]">Grid Intensity Cutoff</span>
                    <span className="font-bold text-[#00746a]">{intensityCutoff} g/kWh</span>
                  </div>
                  <div className="relative w-full h-6 tactile-plate rounded-full p-1 flex items-center">
                    <input
                      type="range"
                      min="50"
                      max="500"
                      value={intensityCutoff}
                      onChange={(e) => setIntensityCutoff(Number(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#00746a] bg-[#efedf4]"
                    />
                  </div>
                </div>
              </div>

              {/* Hardware Push-Buttons */}
              <div className="tactile-plate p-4 rounded-2xl flex flex-col gap-2">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase tracking-wider font-bold">
                  Emergency &amp; Control Actuators
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => showToast('Grand livre immuable synchronisé sur HSM Node')}
                    className="tactile-btn p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform text-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#630ed4]">sync</span>
                    <span className="font-['Space_Grotesk'] text-[11px] text-[#1b1b20] font-bold">Sync Ledger</span>
                  </button>
                  <button
                    onClick={() => showToast('Zero Trim calibré à 0.00 ppm offset')}
                    className="tactile-btn p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform text-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#712edd]">tune</span>
                    <span className="font-['Space_Grotesk'] text-[11px] text-[#1b1b20] font-bold">Zero Trim</span>
                  </button>
                  <button
                    onClick={() => showToast('Redémarrage des 300+ PoPs Cloudflare Edge')}
                    className="tactile-btn p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform text-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#00746a]">restart_alt</span>
                    <span className="font-['Space_Grotesk'] text-[11px] text-[#1b1b20] font-bold">Restart Edge</span>
                  </button>
                  <button
                    onClick={() => showToast('Export PromQL Prometheus au format JSON débuté')}
                    className="tactile-btn-primary p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform text-center cursor-pointer text-white"
                  >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    <span className="font-['Space_Grotesk'] text-[11px] font-bold">Raw Metrics</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Physical Facility Telemetry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Substation 1 */}
          <div className="tactile-plate p-4 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-['Space_Grotesk'] text-sm font-bold text-[#1b1b20]">
                Substation 01 • Core Chillers
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#005952] shadow-[0_0_8px_rgba(0,116,106,0.6)]"></span>
            </div>
            <div className="tactile-debossed p-3 rounded-xl flex items-center justify-between">
              <span className="text-xs text-[#4a4455]">COP Efficiency</span>
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1b1b20]">5.82 COP</span>
            </div>
            <div className="tactile-debossed p-3 rounded-xl flex items-center justify-between">
              <span className="text-xs text-[#4a4455]">Carbon Delta</span>
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#00746a]">-31.4% vs Base</span>
            </div>
          </div>

          {/* Substation 2 */}
          <div className="tactile-plate p-4 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-['Space_Grotesk'] text-sm font-bold text-[#1b1b20]">
                Substation 02 • Solar Photovoltaic
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#630ed4] shadow-[0_0_8px_rgba(99,14,212,0.6)]"></span>
            </div>
            <div className="tactile-debossed p-3 rounded-xl flex items-center justify-between">
              <span className="text-xs text-[#4a4455]">Instant Yield</span>
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1b1b20]">1,840 kWp</span>
            </div>
            <div className="tactile-debossed p-3 rounded-xl flex items-center justify-between">
              <span className="text-xs text-[#4a4455]">Offset Velocity</span>
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#630ed4]">12.4 tCO2e / day</span>
            </div>
          </div>

          {/* Substation 3 */}
          <div className="tactile-plate p-4 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-['Space_Grotesk'] text-sm font-bold text-[#1b1b20]">
                Substation 03 • Data Floor Heat Exchanger
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#005952] shadow-[0_0_8px_rgba(0,116,106,0.6)]"></span>
            </div>
            <div className="tactile-debossed p-3 rounded-xl flex items-center justify-between">
              <span className="text-xs text-[#4a4455]">PUE Factor</span>
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#00746a]">1.12 Ultra-Low</span>
            </div>
            <div className="tactile-debossed p-3 rounded-xl flex items-center justify-between">
              <span className="text-xs text-[#4a4455]">Heat Recirculation</span>
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1b1b20]">4.2 MW Reclaimed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 tactile-plate px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl z-50">
          <span className="material-symbols-outlined text-[20px] text-[#00746a]">check_circle</span>
          <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1b1b20]">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
