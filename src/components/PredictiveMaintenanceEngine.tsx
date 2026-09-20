import React, { useState, useMemo } from "react";
import { GlobalState, EdgeNode } from "../types";
import { 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Shield, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  Download, 
  Cpu, 
  HardDrive, 
  Thermometer, 
  Zap, 
  Crown, 
  Lock,
  ArrowRight,
  Info,
  Calendar,
  Activity
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine,
  Area,
  ComposedChart
} from "recharts";
import { useLanguage } from "../App";

interface PredictiveMaintenanceEngineProps {
  state: GlobalState;
  isDark: boolean;
  onScheduleWorkOrder?: (nodeId: string, title: string, priority: "p1" | "p2" | "p3" | "p4") => void;
  onOpenPricing?: () => void;
}

interface RegressionResult {
  nodeId: string;
  nodeName: string;
  location: string;
  category: string;
  currentHealth: number; // 0 - 100%
  historicalData: { day: number; date: string; health: number; projected?: number }[];
  slope: number; // degradation per day (%/day)
  intercept: number;
  rSquared: number;
  failureThreshold: number;
  daysToFailure: number; // estimated days until health <= failureThreshold
  riskLevel: "critical" | "warning" | "nominal";
  componentAtRisk: string;
  recommendedAction: string;
  temperature: number;
  vibrationScore: number; // 0 - 10
}

/**
 * Calculates Simple Linear Regression: y = mx + b
 * x: time steps (days 1, 2, 3, ...)
 * y: health metric (0 - 100)
 */
function calculateLinearRegression(dataPoints: { x: number; y: number }[]) {
  const n = dataPoints.length;
  if (n < 2) {
    return { slope: 0, intercept: 100, rSquared: 1 };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const p of dataPoints) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n, rSquared: 0 };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared (Coefficient of determination)
  const yMean = sumY / n;
  let ssTot = 0;
  let ssRes = 0;
  for (const p of dataPoints) {
    const yPred = slope * p.x + intercept;
    ssTot += Math.pow(p.y - yMean, 2);
    ssRes += Math.pow(p.y - yPred, 2);
  }

  const rSquared = ssTot === 0 ? 1 : Math.max(0, Math.min(1, 1 - ssRes / ssTot));

  return { slope, intercept, rSquared };
}

export default function PredictiveMaintenanceEngine({
  state,
  isDark,
  onScheduleWorkOrder,
  onOpenPricing
}: PredictiveMaintenanceEngineProps) {
  const { language } = useLanguage();
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const [failureThreshold, setFailureThreshold] = useState<number>(25); // % health considered critical failure
  const [simulationOffset, setSimulationOffset] = useState<number>(0);
  const isPro = state.subscriptionTier === "pro" || (state as any).userRole === "pro";

  // Synthesize realistic degradation history and run linear regression for each node
  const regressionResults: RegressionResult[] = useMemo(() => {
    const nodes = state.nodes || [];
    if (nodes.length === 0) return [];

    return nodes.map((node, index) => {
      // Base degradation parameters influenced by real node metrics (CPU, RAM, Uptime)
      const cpuFactor = (node.cpuUsage || 50) / 100;
      const ramFactor = (node.ramUsage || 50) / 100;
      const baseWearRate = 0.15 + cpuFactor * 0.35 + ramFactor * 0.2 + (simulationOffset * 0.08);
      
      // Determine baseline health from node status
      let baseHealth = node.status === "critical" ? 42 : node.status === "warning" ? 68 : 94;
      if (index === 0) baseHealth = Math.max(28, baseHealth - 15); // make fra-1 or first node close to alert for demo
      
      // Generate 14 historical sample days
      const daysCount = 14;
      const dataPoints: { x: number; y: number }[] = [];
      const historicalData: { day: number; date: string; health: number; projected?: number }[] = [];

      for (let d = daysCount; d >= 1; d--) {
        const x = daysCount - d + 1;
        // Introduce controlled sensor noise around regression trajectory
        const noise = (Math.sin(d * 1.5) * 1.8) + (Math.cos(d * 2.2) * 1.2);
        const dayHealth = Math.min(100, Math.max(10, baseHealth + d * baseWearRate + noise));
        
        const date = new Date();
        date.setDate(date.getDate() - d);
        const dateStr = date.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", { month: "short", day: "numeric" });
        
        dataPoints.push({ x, y: dayHealth });
        historicalData.push({ day: x, date: dateStr, health: +dayHealth.toFixed(1) });
      }

      // Calculate regression
      const { slope, intercept, rSquared } = calculateLinearRegression(dataPoints);
      const currentHealth = historicalData[historicalData.length - 1].health;

      // Project failure date: y = slope * x + intercept => x_failure = (threshold - intercept) / slope
      let daysToFailure = 999;
      if (slope < -0.01) {
        const currentX = daysCount;
        const targetX = (failureThreshold - intercept) / slope;
        daysToFailure = Math.max(1, Math.round(targetX - currentX));
      } else {
        daysToFailure = 365;
      }

      // Add future projection data points for charts (up to 14 days into future)
      for (let f = 1; f <= 14; f++) {
        const futureX = daysCount + f;
        const projHealth = Math.max(0, Math.min(100, slope * futureX + intercept));
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + f);
        const dateStr = futureDate.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", { month: "short", day: "numeric" });
        
        historicalData.push({
          day: futureX,
          date: dateStr,
          health: undefined as any,
          projected: +projHealth.toFixed(1)
        });
      }

      let riskLevel: "critical" | "warning" | "nominal" = "nominal";
      if (daysToFailure <= 14 || currentHealth <= 40) riskLevel = "critical";
      else if (daysToFailure <= 45 || currentHealth <= 70) riskLevel = "warning";

      // Component identification
      const components = ["SSD SMART Endurance NVMe", "Primary Power Distribution Module (PDU)", "Cooling Fan Bearing Array", "RAID Controller Buffer Capacitor"];
      const componentAtRisk = components[index % components.length];

      const recommendedAction = riskLevel === "critical"
        ? language === "fr" ? `Remplacement préventif immédiat sous 48h du ${componentAtRisk}` : `Immediate preventative replacement within 48h for ${componentAtRisk}`
        : riskLevel === "warning"
        ? language === "fr" ? `Planifier inspection thermique & calibrage lors du prochain cycle` : `Schedule thermal inspection & calibration on next maintenance cycle`
        : language === "fr" ? `Équipement nominal. Poursuivre le monitoring de télémétrie standard.` : `Nominal condition. Maintain regular telemetry surveillance.`;

      return {
        nodeId: node.id,
        nodeName: node.name,
        location: node.location,
        category: node.category || "edge",
        currentHealth,
        historicalData,
        slope: +slope.toFixed(3),
        intercept: +intercept.toFixed(2),
        rSquared: +rSquared.toFixed(3),
        failureThreshold,
        daysToFailure,
        riskLevel,
        componentAtRisk,
        recommendedAction,
        temperature: Math.round(42 + cpuFactor * 32),
        vibrationScore: +(1.2 + ramFactor * 4.5).toFixed(1)
      };
    });
  }, [state.nodes, failureThreshold, simulationOffset, language]);

  // Set default selected node
  const activeNodeId = selectedNodeId || (regressionResults[0]?.nodeId ?? "");
  const activeResult = regressionResults.find(r => r.nodeId === activeNodeId) || regressionResults[0];

  // Aggregate metrics
  const criticalCount = regressionResults.filter(r => r.riskLevel === "critical").length;
  const warningCount = regressionResults.filter(r => r.riskLevel === "warning").length;
  const avgHealth = regressionResults.length > 0 
    ? (regressionResults.reduce((acc, r) => acc + r.currentHealth, 0) / regressionResults.length).toFixed(1)
    : "0";
  const shortestDays = regressionResults.length > 0 
    ? Math.min(...regressionResults.map(r => r.daysToFailure))
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/[0.07] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <TrendingDown className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {language === "fr" ? "Maintenance Prédictive par Régression Linéaire" : "Predictive Maintenance (Linear Regression Model)"}
                </h2>
                {isPro ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold">
                    <Crown className="w-3 h-3" /> PRO TIER
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-neutral-400 font-medium">
                    LITE TIER
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                {language === "fr" 
                  ? "Modèle mathématique y = mx + b calculant la pente de dégradation des équipements pour estimer les jours restants avant panne critique."
                  : "Mathematical y = mx + b regression analyzing degradation trajectory to estimate Days to Next Failure before critical downtime."}
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls & Simulation */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] text-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 dark:text-neutral-300">
              {language === "fr" ? "Seuil de Panne :" : "Failure Threshold:"}
            </span>
            <span className="font-mono font-bold text-orange-500">{failureThreshold}%</span>
            <input 
              type="range" 
              min="10" 
              max="40" 
              value={failureThreshold} 
              onChange={e => setFailureThreshold(+e.target.value)}
              className="w-20 accent-orange-500 cursor-pointer"
            />
          </div>

          <button
            onClick={() => setSimulationOffset(prev => prev + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-neutral-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            title="Inject simulated thermal & mechanical strain to test regression slopes"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-500" />
            <span>{language === "fr" ? "Simuler Usure" : "Simulate Wear"}</span>
          </button>

          {!isPro && onOpenPricing && (
            <button
              onClick={onOpenPricing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{language === "fr" ? "Débloquer IA Pro" : "Unlock Pro AI"}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/[0.07] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 mb-1">
            <span>{language === "fr" ? "Équipements Suivis" : "Monitored Fleet"}</span>
            <Cpu className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {regressionResults.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {language === "fr" ? "Régression temps réel active" : "Real-time regression active"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/[0.07] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 mb-1">
            <span>{language === "fr" ? "Pannes Imminentes (<30j)" : "Imminent Failures (<30d)"}</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className={`text-2xl font-bold font-mono ${criticalCount > 0 ? "text-red-500" : "text-emerald-500"}`}>
            {criticalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {criticalCount > 0 
              ? language === "fr" ? `${criticalCount} intervention(s) urgente(s)` : `${criticalCount} critical alert(s)`
              : language === "fr" ? "Aucune panne imminente" : "Zero critical failures"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/[0.07] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 mb-1">
            <span>{language === "fr" ? "Indice Santé Moyen" : "Avg Fleet Health"}</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {avgHealth}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {language === "fr" ? "Score de résilience global" : "Global resilience index"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/[0.07] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 mb-1">
            <span>{language === "fr" ? "Prochaine Panne Estimée" : "Shortest Time to Failure"}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-orange-500">
            {shortestDays} {language === "fr" ? "jours" : "days"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {language === "fr" ? "Basé sur la pente la plus raide" : "Based on steepest slope"}
          </div>
        </div>
      </div>

      {/* Main Analysis Section: Interactive Chart & Details */}
      {activeResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Interactive Linear Regression Chart */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/[0.07] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {activeResult.nodeName} ({activeResult.location})
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    activeResult.riskLevel === "critical"
                      ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                      : activeResult.riskLevel === "warning"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {activeResult.riskLevel.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  Regression Formula: y = {activeResult.slope}x + {activeResult.intercept} | R² = {activeResult.rSquared}
                </div>
              </div>

              {/* Node Selector Switcher */}
              <select
                value={activeNodeId}
                onChange={e => setSelectedNodeId(e.target.value)}
                className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white font-mono focus:outline-hidden focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                {regressionResults.map(r => (
                  <option key={r.nodeId} value={r.nodeId}>
                    {r.nodeName} ({r.daysToFailure}d to failure)
                  </option>
                ))}
              </select>
            </div>

            {/* Regression Chart */}
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={activeResult.historicalData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#262626" : "#f1f5f9"} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke={isDark ? "#737373" : "#94a3b8"} 
                    fontSize={10} 
                    tickLine={false} 
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    stroke={isDark ? "#737373" : "#94a3b8"} 
                    fontSize={10} 
                    tickLine={false}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? "#171717" : "#ffffff", 
                      borderColor: isDark ? "#404040" : "#e2e8f0",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                    }} 
                    formatter={(value: any, name: any) => {
                      if (name === "health") return [`${value}%`, language === "fr" ? "Santé Observée" : "Observed Health"];
                      if (name === "projected") return [`${value}%`, language === "fr" ? "Projection Régression" : "Linear Projection"];
                      return [value, name];
                    }}
                  />
                  <ReferenceLine 
                    y={failureThreshold} 
                    stroke="#ef4444" 
                    strokeDasharray="4 4" 
                    label={{ 
                      value: `Seuil Critique (${failureThreshold}%)`, 
                      fill: "#ef4444", 
                      fontSize: 10, 
                      position: "insideBottomRight" 
                    }} 
                  />
                  {/* Observed real historical sensor health */}
                  <Line 
                    type="monotone" 
                    dataKey="health" 
                    stroke="#f97316" 
                    strokeWidth={2.5} 
                    dot={{ r: 3, fill: "#f97316" }} 
                    activeDot={{ r: 5 }}
                    name="health"
                  />
                  {/* Projected Linear Regression line */}
                  <Line 
                    type="linear" 
                    dataKey="projected" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    dot={false}
                    name="projected"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Regression Model Explanation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Pente de Dégradation (Slope)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">
                  {activeResult.slope} % / jour
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Confiance du Modèle (R²)</span>
                <span className="font-mono font-bold text-emerald-500">
                  {(activeResult.rSquared * 100).toFixed(1)}% ({activeResult.rSquared >= 0.8 ? "Haute précision" : "Modérée"})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Composant à Risque</span>
                <span className="font-medium text-slate-800 dark:text-white truncate block">
                  {activeResult.componentAtRisk}
                </span>
              </div>
            </div>
          </div>

          {/* Right Col: Prognosis & Action Dispatch Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/[0.07] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {language === "fr" ? "DIAGNOSTIC PRÉDICTIF" : "PREDICTIVE PROGNOSIS"}
                </span>
                <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                  <Wrench className="w-4 h-4" />
                </span>
              </div>

              {/* Days to Failure Callout */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-center space-y-1">
                <div className="text-xs text-slate-500 dark:text-neutral-400">
                  {language === "fr" ? "Temps Restant Estimé Avant Panne :" : "Estimated Time To Failure (TTF):"}
                </div>
                <div className={`text-4xl font-extrabold font-mono ${
                  activeResult.daysToFailure <= 14 ? "text-red-500" : activeResult.daysToFailure <= 45 ? "text-amber-500" : "text-emerald-500"
                }`}>
                  {activeResult.daysToFailure} {language === "fr" ? "Jours" : "Days"}
                </div>
                <div className="text-[11px] text-slate-400">
                  {language === "fr" ? `Santé actuelle : ${activeResult.currentHealth}%` : `Current Health: ${activeResult.currentHealth}%`}
                </div>
              </div>

              {/* Physical Parameters */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/[0.06]">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-400">
                    <Thermometer className="w-3.5 h-3.5 text-red-400" />
                    <span>Température CPU/Rack</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {activeResult.temperature}°C
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/[0.06]">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-400">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Score Vibratoire Mécanique</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {activeResult.vibrationScore} / 10
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-400">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span>SLA Garantie Disponibilité</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-500">99.98%</span>
                </div>
              </div>

              {/* Recommended Action Box */}
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-950 dark:text-orange-200 space-y-1">
                <div className="font-bold flex items-center gap-1 text-orange-600 dark:text-orange-400">
                  <Info className="w-3.5 h-3.5" />
                  <span>{language === "fr" ? "Recommandation CAFM" : "Recommended Action"}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{activeResult.recommendedAction}</p>
              </div>
            </div>

            {/* Work Order Action Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  if (onScheduleWorkOrder) {
                    onScheduleWorkOrder(
                      activeResult.nodeId,
                      `Régression IA: Remplacement préventif ${activeResult.componentAtRisk} (${activeResult.nodeName})`,
                      activeResult.daysToFailure <= 14 ? "p1" : "p2"
                    );
                  }
                }}
                className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {language === "fr" ? "Planifier Ordre de Travail CAFM" : "Dispatch Preventative Work Order"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fleet Equipment Predictions Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/[0.07] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {language === "fr" ? "Tableau Prévisionnel de Dégradation de l'Équipement" : "Equipment Fleet Degradation & Failure Forecast"}
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {regressionResults.length} {language === "fr" ? "actifs analysés" : "assets analyzed"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-neutral-400 font-mono text-[11px]">
                <th className="py-2.5 px-3">Équipement / Node</th>
                <th className="py-2.5 px-3">Santé Actuelle</th>
                <th className="py-2.5 px-3">Pente Dégradation (m)</th>
                <th className="py-2.5 px-3">Confiance R²</th>
                <th className="py-2.5 px-3">Jours Restants (TTF)</th>
                <th className="py-2.5 px-3">Risque</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {regressionResults.map(r => (
                <tr 
                  key={r.nodeId}
                  onClick={() => setSelectedNodeId(r.nodeId)}
                  className={`hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer ${
                    activeNodeId === r.nodeId ? "bg-orange-500/5 dark:bg-orange-500/10" : ""
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 dark:text-white">{r.nodeName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{r.location} • {r.componentAtRisk}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            r.currentHealth <= 40 ? "bg-red-500" : r.currentHealth <= 70 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${r.currentHealth}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold">{r.currentHealth}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-neutral-300">
                    {r.slope} %/j
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-500">
                    {(r.rSquared * 100).toFixed(0)}%
                  </td>
                  <td className="py-3 px-3 font-mono font-bold">
                    <span className={r.daysToFailure <= 14 ? "text-red-500" : r.daysToFailure <= 45 ? "text-amber-500" : "text-emerald-500"}>
                      {r.daysToFailure} j
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      r.riskLevel === "critical"
                        ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                        : r.riskLevel === "warning"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    }`}>
                      {r.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onScheduleWorkOrder) {
                          onScheduleWorkOrder(
                            r.nodeId,
                            `Régression IA: Remplacement ${r.componentAtRisk} (${r.nodeName})`,
                            r.daysToFailure <= 14 ? "p1" : "p2"
                          );
                        }
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] rounded-lg text-slate-700 dark:text-neutral-200 font-medium text-[11px] transition-colors cursor-pointer"
                    >
                      {language === "fr" ? "Planifier" : "Schedule"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
