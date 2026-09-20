import React from "react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  Activity, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  CheckCircle2, 
  Cpu, 
  Zap, 
  Snowflake, 
  HardDrive, 
  Network,
  Wrench,
  Percent
} from "lucide-react";
import { useLanguage } from "../App";
import { GlobalState } from "../types";

interface CmmsReliabilityKpiDashboardProps {
  state: GlobalState;
  isDark: boolean;
}

export default function CmmsReliabilityKpiDashboard({
  state,
  isDark
}: CmmsReliabilityKpiDashboardProps) {
  const { language } = useLanguage();

  // Reliability trend data over the past 6 months
  const reliabilityTrendData = [
    { month: "Apr", mtbf: 1180, mttr: 58, availability: 99.88, preventiveRatio: 72 },
    { month: "May", mtbf: 1250, mttr: 52, availability: 99.91, preventiveRatio: 75 },
    { month: "Jun", mtbf: 1320, mttr: 48, availability: 99.93, preventiveRatio: 78 },
    { month: "Jul", mtbf: 1390, mttr: 44, availability: 99.94, preventiveRatio: 81 },
    { month: "Aug", mtbf: 1440, mttr: 41, availability: 99.95, preventiveRatio: 83 },
    { month: "Sep", mtbf: 1485, mttr: 38, availability: 99.96, preventiveRatio: 86 },
  ];

  // Root Cause Failure Breakdown
  const failureCauseData = [
    { name: language === "fr" ? "Climatisation & Débit d'Air" : "HVAC & Thermal", value: 34, color: "#06b6d4" },
    { name: language === "fr" ? "Alimentations & Onduleurs" : "Power & UPS Inverters", value: 28, color: "#f59e0b" },
    { name: language === "fr" ? "Usure NVMe & Blocs SMART" : "NVMe Wear & Storage", value: 22, color: "#10b981" },
    { name: language === "fr" ? "Optiques Réseau SFP+" : "Network & Transceivers", value: 16, color: "#3b82f6" },
  ];

  // Financial TCO Budget consumption
  const budgetData = [
    { month: "Apr", planned: 12000, consumed: 11400 },
    { month: "May", planned: 12000, consumed: 10850 },
    { month: "Jun", planned: 13500, consumed: 12900 },
    { month: "Jul", planned: 13500, consumed: 11700 },
    { month: "Aug", planned: 14000, consumed: 13100 },
    { month: "Sep", planned: 14000, consumed: 12200 },
  ];

  // Key metrics
  const currentMtbf = 1485; // hours
  const currentMttr = 38; // minutes
  const globalAvailability = 99.96; // %
  const currentPreventiveRatio = 86; // %

  return (
    <div className="space-y-6">
      
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* MTBF Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
            <span className="font-semibold">{language === "fr" ? "MTBF (Temps Moyen Entre Pannes)" : "MTBF (Mean Time Between Failures)"}</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{currentMtbf}</span>
            <span className="text-xs font-mono text-slate-400">heures / hours</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.4% vs {language === "fr" ? "cible industrielle (1,200h)" : "benchmark (1,200h)"}</span>
          </div>
        </div>

        {/* MTTR Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
            <span className="font-semibold">{language === "fr" ? "MTTR (Temps Moyen de Réparation)" : "MTTR (Mean Time To Repair)"}</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{currentMttr}</span>
            <span className="text-xs font-mono text-slate-400">minutes</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-21% {language === "fr" ? "grâce aux pièces pré-réservées" : "accelerated via stock kits"}</span>
          </div>
        </div>

        {/* Inherent Availability */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
            <span className="font-semibold">{language === "fr" ? "Disponibilité Intrinsèque (A)" : "Inherent Availability (A)"}</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">{globalAvailability}%</span>
            <span className="text-[10px] font-mono text-slate-400">A = MTBF / (MTBF+MTTR)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {language === "fr" ? "Indisponibilité non planifiée < 1.8h / an" : "Unplanned downtime < 1.8h / year"}
          </div>
        </div>

        {/* Preventive vs Corrective Ratio */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
            <span className="font-semibold">{language === "fr" ? "Taux de Préventif / Correctif" : "Preventive vs Corrective Ratio"}</span>
            <Percent className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400">{currentPreventiveRatio}%</span>
            <span className="text-xs font-mono text-slate-400">/ 80% {language === "fr" ? "cible" : "target"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === "fr" ? "Règle des 80/20 respectée" : "World-class 80/20 standard met"}</span>
          </div>
        </div>

      </div>

      {/* Charts Section: MTBF/MTTR Evolution + Failure Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* MTBF / MTTR Trend Line Chart (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                {language === "fr" ? "Évolution MTBF (Heures) & Disponibilité Réseau" : "MTBF (Hours) & Availability Evolution"}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === "fr" ? "Progression semestrielle suite au déploiement des tournées prédictives IA." : "Six-month operational trajectory after predictive AI deployment."}
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
              +25.8% MTBF Gain
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reliabilityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9"} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[1000, 1600]} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? "#111114" : "#ffffff",
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
                    borderRadius: "12px",
                    fontSize: "11px"
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="mtbf" name="MTBF (Heures / Hours)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="preventiveRatio" name="Taux Préventif (%)" stroke="#f97316" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pareto Failure Breakdown Donut (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-100 dark:border-white/[0.06] pb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              {language === "fr" ? "Typologie des Défaillances" : "Root Cause Failure Pareto"}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {language === "fr" ? "Répartition par sous-système matériel" : "Hardware subsystem distribution"}
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={failureCauseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {failureCauseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? "#111114" : "#ffffff",
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
                    borderRadius: "12px",
                    fontSize: "11px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
            {failureCauseData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-neutral-400">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Budget & TCO Tracking Bar Chart */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              {language === "fr" ? "Pilotage Budgétaire & Coûts de Maintenance TCO" : "TCO Maintenance Budget: Planned vs Realized Spend"}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {language === "fr" ? "Comparaison dépenses réelles (Pièces + Heures Main-d'œuvre) vs enveloppe allouée." : "Realized cost of parts + technician labor versus budgeted envelope."}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            -8.4% {language === "fr" ? "Économie Sous Budget" : "Under Allocated Budget"}
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9"} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${val / 1000}k€`} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDark ? "#111114" : "#ffffff",
                  borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
                  borderRadius: "12px",
                  fontSize: "11px"
                }}
                formatter={(value: any) => [`${value.toLocaleString()} €`]}
              />
              <Legend />
              <Bar dataKey="planned" name="Budget Prévu / Planned (€)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="consumed" name="Dépenses Réalisées / Consumed (€)" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
