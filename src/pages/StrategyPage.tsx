import React, { useState } from 'react';
import { Target, TrendingUp, BarChart2, Activity, ArrowUpRight, ArrowDownRight, RefreshCcw, Layers } from 'lucide-react';
import { StrategicObjective, Kpi } from '../types';

export default function StrategyPage({ state, isDark }: any) {
  const [isSyncing, setIsSyncing] = useState(false);
  const objectives = state.objectives || [];
  const kpis = state.kpis || [];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Strategic Steering (OKRs)</h1>
          <p className="text-slate-500 dark:text-neutral-400 text-sm mt-1">
            Transform technical telemetry into high-level strategic performance indicators.
          </p>
        </div>
        <button
          onClick={handleSync}
          className={`flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-xs hover:shadow-sm transition-all font-medium text-sm cursor-pointer ${isSyncing ? 'opacity-80 cursor-wait' : ''}`}
        >
          <RefreshCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Synchronize KPIs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {objectives.map((obj: StrategicObjective) => {
          const objKpis = kpis.filter((k: Kpi) => k.objectiveId === obj.id);
          
          return (
            <div key={obj.id} className="bg-white dark:bg-neutral-900/60 rounded-xl border border-slate-200 dark:border-neutral-800 p-5 flex flex-col relative overflow-hidden shadow-xs">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/30">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">Objective {obj.period}</span>
                    <h3 className="font-bold text-lg leading-tight mt-0.5 text-slate-900 dark:text-white">{obj.title}</h3>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-neutral-400 mb-6 flex-1">
                {obj.description}
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700 dark:text-neutral-300">Overall Progress</span>
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
                  <BarChart2 className="w-3.5 h-3.5" /> Associated KPIs ({objKpis.length})
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
  );
}
