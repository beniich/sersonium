import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  BarChart2, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCcw, 
  Layers, 
  Download, 
  FileSpreadsheet, 
  Scale, 
  ShieldCheck, 
  Sparkles,
  Leaf
} from 'lucide-react';
import { StrategicObjective, Kpi } from '../types';
import { exportScenariosToCSV, exportScenariosToPDF } from '../utils/exportUtils';
import { computeScenarioComparisonMatrix, StrategicSimulationInputs } from '../config/roiConfig';

export default function StrategyPage({ state, isDark }: any) {
  const [isSyncing, setIsSyncing] = useState(false);
  const objectives = state.objectives || [];
  const kpis = state.kpis || [];

  // Default simulation parameters for the active tenant
  const currentInputs: StrategicSimulationInputs = {
    sites: 12,
    bladesPerSite: 4,
    aiInferencesMillionPerMonth: 10,
    kwhCostEur: 0.22,
  };

  const simulationMatrix = computeScenarioComparisonMatrix(currentInputs);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  const handleExportCSV = () => {
    exportScenariosToCSV(currentInputs, simulationMatrix, {
      clientName: "Direction Générale & Comité Stratégique",
    });
  };

  const handleExportPDF = () => {
    exportScenariosToPDF(currentInputs, simulationMatrix, {
      clientName: "Direction Générale & Comité Stratégique",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER SECTION WITH STRATEGIC ACTIONS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Pilotage Stratégique & Arbitrage ROI (CFO / CTO)
          </h1>
          <p className="text-slate-500 dark:text-neutral-400 text-sm mt-1 max-w-3xl">
            Transformation de la télémétrie technique en indicateurs de gouvernance, simulation probabiliste de rentabilité et export certifiable.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSync}
            className={`flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 rounded-xl transition-all font-medium text-xs cursor-pointer ${isSyncing ? 'opacity-80 cursor-wait' : ''}`}
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Synchroniser KPIs</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="group flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-emerald-900/20 font-bold text-xs cursor-pointer"
            title="Exporter l'analyse de sensibilité 3 scénarios sous format tableur CSV"
          >
            <FileSpreadsheet className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Exporter Rapport Executive (CSV)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black px-4 py-2.5 rounded-xl transition-all font-bold text-xs cursor-pointer shadow-md"
            title="Générer le rapport officiel A4 PDF pour signature"
          >
            <Download className="w-4 h-4" />
            <span>Rapport Conseil (PDF)</span>
          </button>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY BANNER (CFO HIGHLIGHT) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider border border-emerald-500/30">
              Arbitrage Décisionnel
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              Base : {currentInputs.sites} Sites | 48 Lames Silicium X1 (45W)
            </span>
          </div>

          <div className="text-xs font-mono text-emerald-300 flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>VERDICT : INVESTISSEMENT PRIORITAIRE (Amortissement &lt; 8 mois)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
            <div className="text-xs font-mono text-neutral-400">Économies Nettes (Base)</div>
            <div className="text-2xl font-black text-white font-sans mt-1">
              ${simulationMatrix.realistic.annualSavingsEur.toLocaleString("fr-FR")} / an
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">+674% de ROI sur 5 ans</div>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
            <div className="text-xs font-mono text-neutral-400">Délai d'Amortissement</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {simulationMatrix.realistic.paybackMonths} Mois
            </div>
            <div className="text-[11px] text-neutral-400 font-mono mt-0.5">Scénario pessimiste : 9.2 mois</div>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
            <div className="text-xs font-mono text-neutral-400">Cashflow Net 5 Ans</div>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
              +${(simulationMatrix.realistic.fiveYearNetCashflowEur / 1000).toFixed(0)} k€
            </div>
            <div className="text-[11px] text-neutral-400 font-mono mt-0.5">CapEx matériel 115 k€ déduit</div>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
            <div className="text-xs font-mono text-neutral-400">Eau Évaporée Évitée (WUE)</div>
            <div className="text-2xl font-black text-blue-400 font-mono mt-1">
              {simulationMatrix.realistic.waterSavedM3} m³
            </div>
            <div className="text-[11px] text-neutral-400 font-mono mt-0.5">Norme européenne CSRD E3</div>
          </div>
        </div>
      </div>

      {/* STRATEGIC OBJECTIVES (OKRS) GRID */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-500" />
          <span>Objectifs Stratégiques & Alignement Opérationnel (OKRs)</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {objectives.map((obj: StrategicObjective) => {
            const objKpis = kpis.filter((k: Kpi) => k.objectiveId === obj.id);
            
            return (
              <div key={obj.id} className="bg-white dark:bg-neutral-900/60 rounded-xl border border-slate-200 dark:border-neutral-800 p-5 flex flex-col relative overflow-hidden shadow-xs text-left">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/30">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">Objectif {obj.period}</span>
                      <h3 className="font-bold text-base leading-tight mt-0.5 text-slate-900 dark:text-white">{obj.title}</h3>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-neutral-400 mb-6 flex-1">
                  {obj.description}
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700 dark:text-neutral-300">Progression Globale</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">{obj.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${obj.progress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-neutral-800 pt-4 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5" /> KPIs Associés ({objKpis.length})
                  </h4>
                  {objKpis.map((kpi: Kpi) => {
                    const isGood = kpi.name.includes("PUE") || kpi.name.includes("Dépenses") || kpi.name.includes("Expenses")
                      ? kpi.currentValue <= kpi.targetValue 
                      : kpi.currentValue >= kpi.targetValue;
                      
                    return (
                      <div key={kpi.id} className="bg-slate-50 dark:bg-neutral-800/40 rounded-lg p-3 border border-slate-200/80 dark:border-neutral-800">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800 dark:text-neutral-200">{kpi.name}</span>
                            {kpi.source === 'AUTOMATED' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">Auto</span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-bold ${isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                              {kpi.currentValue} {kpi.unit}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-neutral-400 ml-1">/ {kpi.targetValue}</span>
                          </div>
                        </div>
                        
                        {kpi.history && kpi.history.length > 0 && (
                          <div className="h-8 flex items-end gap-0.5 mt-2 opacity-70">
                            {kpi.history.map((h: any, i: number) => {
                              const hHeight = Math.max(10, (h.value / (kpi.targetValue * 1.5)) * 100);
                              return (
                                <div 
                                  key={i} 
                                  className="w-full bg-orange-500/50 rounded-t-xs" 
                                  style={{ height: `${Math.min(100, hHeight)}%` }}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
