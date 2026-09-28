import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingDown,
  Zap,
  Leaf,
  DollarSign,
  Building2,
  Server,
  Cloud,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Download,
  FileSpreadsheet,
  X,
  Send,
  CheckCircle,
  Droplets,
  BarChart3,
  Layers,
  Scale,
  Sparkles,
  RefreshCw,
  Info
} from "lucide-react";
import { SubscriptionTier } from "../../types";
import { 
  computeStrategicRoi, 
  computeScenarioComparisonMatrix,
  RiskScenario 
} from "../../config/roiConfig";
import { exportScenariosToCSV, exportScenariosToPDF } from "../../utils/exportUtils";

interface RoiCalculatorSectionProps {
  onEnterDashboard: () => void;
  onSelectPlan?: (tier: SubscriptionTier) => void;
}

export default function RoiCalculatorSection({
  onEnterDashboard,
  onSelectPlan
}: RoiCalculatorSectionProps) {
  // Input parameters (Interactive Sliders)
  const [numSites, setNumSites] = useState<number>(12);
  const [bladesPerSite, setBladesPerSite] = useState<number>(4);
  const [aiInferencesMillion, setAiInferencesMillion] = useState<number>(10);
  const [kwhCostEur, setKwhCostEur] = useState<number>(0.22);
  
  // Strategic Scenario State
  const [activeScenario, setActiveScenario] = useState<RiskScenario>("realistic");
  const [activeAnalysisView, setActiveAnalysisView] = useState<"overview" | "waterfall" | "sensitivity" | "csrd">("overview");

  // B2B Enterprise Quote Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteFormData, setQuoteFormData] = useState({
    companyName: "",
    contactEmail: "",
    phone: "",
    notes: ""
  });
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  // Compute Active Strategic Results
  const currentResults = computeStrategicRoi(
    {
      sites: numSites,
      bladesPerSite,
      aiInferencesMillionPerMonth: aiInferencesMillion,
      kwhCostEur,
    },
    activeScenario
  );

  // Compute 3-Scenario Comparison Matrix (Sensitivity Analysis)
  const sensitivityMatrix = computeScenarioComparisonMatrix({
    sites: numSites,
    bladesPerSite,
    aiInferencesMillionPerMonth: aiInferencesMillion,
    kwhCostEur,
  });

  return (
    <div className="space-y-12">
      {/* SECTION HEADER */}
      <div className="text-left space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Simulateur Stratégique & Audit ESG Non-Linéaire</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Simulateur d'Aide à la Décision CFO / CTO & Rapport CSRD
            </h2>
            <p className="text-sm text-neutral-400 max-w-3xl leading-relaxed mt-1">
              Modélisation probabiliste non-linéaire avec économies d'échelle, analyse de sensibilité en 3 scénarios
              et bilan hydrique / carbone certifiable CSRD.
            </p>
          </div>

          {/* Actions: Scenario Selector & Strategic Reports Export */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-auto">
            {/* Scenario Selector Pills */}
            <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <button
                onClick={() => setActiveScenario("conservative")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeScenario === "conservative"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Conservateur (-20%)
              </button>
              <button
                onClick={() => setActiveScenario("realistic")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeScenario === "realistic"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Réaliste (Base)
              </button>
              <button
                onClick={() => setActiveScenario("optimistic")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeScenario === "optimistic"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Optimiste (+25%)
              </button>
            </div>

            {/* Quick Export Actions (CSV / PDF) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportScenariosToCSV(
                  {
                    sites: numSites,
                    bladesPerSite,
                    aiInferencesMillionPerMonth: aiInferencesMillion,
                    kwhCostEur
                  },
                  sensitivityMatrix,
                  { clientName: "Comité d'Investissement & Direction Financière" }
                )}
                className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Télécharger l'analyse 3 scénarios et le bilan CSRD en fichier CSV tableur"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => exportScenariosToPDF(
                  {
                    sites: numSites,
                    bladesPerSite,
                    aiInferencesMillionPerMonth: aiInferencesMillion,
                    kwhCostEur
                  },
                  sensitivityMatrix,
                  { clientName: "Comité d'Investissement & Direction Financière" }
                )}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                title="Générer le rapport exécutif stratégique officiel au format PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Rapport PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CALCULATOR & SLIDERS INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left 5 Cols: Sliders & Infrastructure Configuration */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-[#0d0d12] border border-white/[0.1] shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Paramètres d'Infrastructure
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
              {currentResults.totalBlades} Lames Silicium X1
            </span>
          </div>

          {/* Slider 1: Sites */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Nombre de sites industriels :
              </span>
              <span className="text-white font-bold">{numSites} sites</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={numSites}
              onChange={(e) => setNumSites(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg bg-neutral-800 accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Slider 2: Blades per site */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-purple-400" />
                Lames EdgeBlade par site :
              </span>
              <span className="text-white font-bold">{bladesPerSite} lames / site</span>
            </div>
            <input
              type="range"
              min={2}
              max={100}
              value={bladesPerSite}
              onChange={(e) => setBladesPerSite(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg bg-neutral-800 accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Slider 3: AI Inference Volume */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                Inférences IA / mois :
              </span>
              <span className="text-white font-bold">{aiInferencesMillion} Millions req/mo</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={aiInferencesMillion}
              onChange={(e) => setAiInferencesMillion(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg bg-neutral-800 accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>Tarif Cloud effectif : {currentResults.effectiveCloudInferencePerMillion}€ / M</span>
              <span>Échelle non-linéaire active</span>
            </div>
          </div>

          {/* Slider 4: Industrial Electricity Price */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Coût kWh électricité :
              </span>
              <span className="text-white font-bold">{kwhCostEur.toFixed(2)} € / kWh</span>
            </div>
            <input
              type="range"
              min={0.10}
              max={0.45}
              step={0.01}
              value={kwhCostEur}
              onChange={(e) => setKwhCostEur(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg bg-neutral-800 accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Non-linear Scale Notification */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-neutral-400 space-y-1">
            <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Économies d'échelle appliquées :</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Maintenance mutualisée :</span>
              <span className="text-white font-semibold">{currentResults.effectiveEdgeMaintenancePerBlade} € / lame / an</span>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Strategic Multi-View Panel */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          
          {/* View Mode Tabs */}
          <div className="flex items-center gap-2 border-b border-white/[0.1] pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveAnalysisView("overview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                activeAnalysisView === "overview"
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Synthèse Financière</span>
            </button>
            <button
              onClick={() => setActiveAnalysisView("waterfall")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                activeAnalysisView === "waterfall"
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Waterfall (Cascade)</span>
            </button>
            <button
              onClick={() => setActiveAnalysisView("sensitivity")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                activeAnalysisView === "sensitivity"
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Sensibilité CFO</span>
            </button>
            <button
              onClick={() => setActiveAnalysisView("csrd")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                activeAnalysisView === "csrd"
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Audit CSRD & Eau</span>
            </button>
          </div>

          {/* VIEW 1: SYNTHÈSE FINANCIÈRE */}
          {activeAnalysisView === "overview" && (
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#0d0d12] to-black border border-emerald-500/30 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                  Économies Nettes Annuelles ({activeScenario.toUpperCase()})
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-400 text-black font-bold">
                  Amortissement : {currentResults.paybackMonths} Mois
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
                  ${currentResults.annualSavingsEur.toLocaleString("en-US")} / an
                </div>
                <p className="text-xs text-emerald-300 font-mono">
                  Gains nets récurrents après amortissement complet des lames EdgeBlade Silicium X1.
                </p>
              </div>

              {/* 4 Financial KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08]">
                  <div className="text-[10px] font-mono text-neutral-400">Payback</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">{currentResults.paybackMonths} mois</div>
                  <div className="text-[10px] text-emerald-400 font-mono">Retour rapide</div>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08]">
                  <div className="text-[10px] font-mono text-neutral-400">Cashflow 5 Ans</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                    ${(currentResults.fiveYearNetCashflowEur / 1000).toFixed(0)} k€
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">CapEx déduit</div>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08]">
                  <div className="text-[10px] font-mono text-neutral-400">ROI 5 Ans</div>
                  <div className="text-base font-bold text-cyan-400 font-mono mt-0.5">+{currentResults.roiPercentage}%</div>
                  <div className="text-[10px] text-neutral-400 font-mono">Rentabilité pure</div>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08]">
                  <div className="text-[10px] font-mono text-neutral-400">Énergie Évitée</div>
                  <div className="text-base font-bold text-amber-400 font-mono mt-0.5">-{currentResults.energyReductionPercent}%</div>
                  <div className="text-[10px] text-neutral-400 font-mono">45W vs 650W</div>
                </div>
              </div>

              {/* Cost Comparison Bars */}
              <div className="pt-3 border-t border-white/[0.08] space-y-2 text-xs font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>Coût Cloud Traditionnel (Inférences + 650W) :</span>
                  <span className="text-red-400 font-bold line-through">
                    ${currentResults.traditionalCloudAnnualCost.toLocaleString("en-US")} / an
                  </span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Coût Réseau Sensorium Edge Sovereign (45W) :</span>
                  <span className="text-emerald-400 font-bold">
                    ${currentResults.sensoriumEdgeAnnualCost.toLocaleString("en-US")} / an
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: WATERFALL CHART (BRIDGE ANALYSIS) */}
          {activeAnalysisView === "waterfall" && (
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0d0d12] border border-white/[0.1] shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div>
                  <h4 className="text-sm font-bold text-white">Analyse en Cascade (Waterfall Bridge)</h4>
                  <p className="text-[11px] text-neutral-400 font-mono">Décomposition détaillée de la création de valeur</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Gain net : ${currentResults.annualSavingsEur.toLocaleString("en-US")}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {currentResults.waterfallBridge.map((step, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-neutral-300 font-medium">{step.name}</span>
                      <span className={`font-bold ${
                        step.type === "negative" ? "text-emerald-400" :
                        step.type === "positive" ? "text-red-400" : "text-white"
                      }`}>
                        {step.amountEur > 0 && step.type === "positive" ? "+" : ""}
                        ${step.amountEur.toLocaleString("en-US")}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden flex">
                      <div
                        style={{
                          width: `${Math.min(100, (Math.abs(step.amountEur) / currentResults.traditionalCloudAnnualCost) * 100)}%`
                        }}
                        className={`h-full rounded-full ${
                          step.type === "negative" ? "bg-emerald-500" :
                          step.type === "positive" ? "bg-red-500" : "bg-blue-500"
                        }`}
                      />
                    </div>
                    <p className="text-[10px] text-neutral-500 font-mono">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: MATRICE DE SENSIBILITÉ CFO */}
          {activeAnalysisView === "sensitivity" && (
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0d0d12] border border-white/[0.1] shadow-2xl space-y-4">
              <div className="pb-3 border-b border-white/[0.08]">
                <h4 className="text-sm font-bold text-white">Matrice de Sensibilité CFO (Comité d'Investissement)</h4>
                <p className="text-[11px] text-neutral-400 font-mono">Preuve de rentabilité sous 3 niveaux de stress opérationnel</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-neutral-400 text-[11px]">
                      <th className="pb-2 font-normal">Métrique Clé</th>
                      <th className="pb-2 font-semibold text-amber-400">Conservateur</th>
                      <th className="pb-2 font-semibold text-emerald-400">Réaliste (Base)</th>
                      <th className="pb-2 font-semibold text-blue-400">Optimiste</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    <tr>
                      <td className="py-2.5 text-neutral-300">Hypothèse Volume IA</td>
                      <td className="py-2.5 text-amber-300">-20% volume</td>
                      <td className="py-2.5 text-emerald-300">Nominal ({aiInferencesMillion}M)</td>
                      <td className="py-2.5 text-blue-300">+25% volume</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-neutral-300">Hypothèse Énergie</td>
                      <td className="py-2.5 text-amber-300">+15% surge</td>
                      <td className="py-2.5 text-emerald-300">{kwhCostEur}€/kWh</td>
                      <td className="py-2.5 text-blue-300">-5% tarif</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-neutral-300 font-semibold text-white">Économies Nettes / an</td>
                      <td className="py-2.5 text-amber-400 font-bold">${sensitivityMatrix.conservative.annualSavingsEur.toLocaleString("en-US")}</td>
                      <td className="py-2.5 text-emerald-400 font-bold">${sensitivityMatrix.realistic.annualSavingsEur.toLocaleString("en-US")}</td>
                      <td className="py-2.5 text-blue-400 font-bold">${sensitivityMatrix.optimistic.annualSavingsEur.toLocaleString("en-US")}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-neutral-300 font-semibold text-white">Délai d'Amortissement</td>
                      <td className="py-2.5 text-amber-300 font-bold">{sensitivityMatrix.conservative.paybackMonths} mois</td>
                      <td className="py-2.5 text-emerald-300 font-bold">{sensitivityMatrix.realistic.paybackMonths} mois</td>
                      <td className="py-2.5 text-blue-300 font-bold">{sensitivityMatrix.optimistic.paybackMonths} mois</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-neutral-300">Cashflow Net 5 Ans</td>
                      <td className="py-2.5 text-neutral-300">${(sensitivityMatrix.conservative.fiveYearNetCashflowEur / 1000).toFixed(0)} k€</td>
                      <td className="py-2.5 text-emerald-300 font-semibold">${(sensitivityMatrix.realistic.fiveYearNetCashflowEur / 1000).toFixed(0)} k€</td>
                      <td className="py-2.5 text-blue-300 font-semibold">${(sensitivityMatrix.optimistic.fiveYearNetCashflowEur / 1000).toFixed(0)} k€</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 4: AUDIT CSRD & ÉCOLOGIQUE AVANCÉ */}
          {activeAnalysisView === "csrd" && (
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0d0d12] border border-white/[0.1] shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    Bilan Décarbonation & Empreinte Hydrique (Norme CSRD E1)
                  </h4>
                  <p className="text-[11px] text-neutral-400 font-mono">Conforme Directive Européenne CSRD et Protocole GHG</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Metric 1: Water Savings */}
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-blue-400 font-mono">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>Eau Évaporée Évitée</span>
                  </div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">
                    {currentResults.waterSavedM3.toLocaleString("en-US")} m³
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    {currentResults.waterSavedLiters.toLocaleString("en-US")} L d'eau économisés (Facteur WUE = 1.8L/kWh)
                  </p>
                </div>

                {/* Metric 2: CO2 Scope 2 & 3 */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                    <Leaf className="w-3.5 h-3.5" />
                    <span>CO2 Évité / An</span>
                  </div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">
                    {currentResults.co2SavedTons} t
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Équivalent à {currentResults.equivalentTreesPlanted} arbres matures plantés
                  </p>
                </div>

                {/* Metric 3: Embodied Carbon Payback */}
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-purple-400 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Amortissement Matériel</span>
                  </div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">
                    {currentResults.embeddedCarbonPaybackMonths} mois
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Délai pour effacer 100% de l'empreinte de fabrication (Scope 3)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Action Bar */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs font-semibold text-white">Besoin d'un audit de site sur-mesure ?</div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                Nos architectes de solutions modélisent vos racks on-premise avec engagement SLA contractuel.
              </div>
            </div>

            <button
              onClick={onEnterDashboard}
              className="px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shrink-0"
            >
              <span>Accéder à la Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* STRATEGIC B2B TIERING CALL TO ACTION */}
      <div className="mt-12 pt-10 border-t border-white/[0.1] space-y-8">
        <div className="text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
            <span>Déploiement Industriel & Souscription</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Passez à l'action : Choisissez votre plan pour réaliser ces ${currentResults.annualSavingsEur.toLocaleString("en-US")} d'économies annuelles
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-3xl">
            Abonnements souverains dimensionnés pour CTOs, directeurs industriels et équipes de fiabilité de site (SRE).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Plan 1: Edge Explorer */}
          <div className="p-6 rounded-2xl bg-[#0d0d12] border border-white/[0.1] hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold">
                  Plan Sandbox
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">Devs / PoC</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Edge Explorer</h4>
                <div className="text-2xl font-black text-white mt-1">
                  49€ <span className="text-xs font-normal text-neutral-400">/ mois</span>
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  Idéal pour valider les scripts V8 et l'inférence locale en environnement d'essai.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-neutral-300 font-mono border-t border-white/[0.08] pt-4">
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Accès Tier 02 (V8 Isolates)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Inférence Sandbox & Démo</span>
                </li>
                <li className="flex items-center gap-2 text-neutral-500">
                  <span>✕ Matériel Silicium X1 non inclus</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectPlan ? onSelectPlan("silver") : onEnterDashboard()}
              className="w-full py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Souscrire Edge Explorer
            </button>
          </div>

          {/* Plan 2: Sovereign Ops (Recommended) */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-950/40 via-[#0d0d12] to-black border-2 border-blue-500 shadow-2xl flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-blue-500 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
              Recommandé ROI
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
                  Plan Pro
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">PME & Scale-ups</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Sovereign Ops</h4>
                <div className="text-2xl font-black text-white mt-1">
                  499€ <span className="text-xs font-normal text-neutral-400">/ mois</span>
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  Accès complet aux Tiers 01 à 04 avec accélération Silicium X1 virtuelle et SLA 99.9%.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-neutral-200 font-mono border-t border-white/[0.08] pt-4">
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Accès Tiers 01 à 04 Inclus</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Silicium X1 NPU Virtuel (240 TOPS)</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Support Prioritaire & SLA 99.9%</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectPlan ? onSelectPlan("pro") : onEnterDashboard()}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Activer Sovereign Ops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Plan 3: Titan Sovereign */}
          <div className="p-6 rounded-2xl bg-[#0d0d12] border border-white/[0.1] hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold">
                  Plan Enterprise
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">Grands Comptes</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Titan Sovereign</h4>
                <div className="text-2xl font-black text-white mt-1">
                  Sur Devis <span className="text-xs font-normal text-neutral-400">(CapEx + OpEx)</span>
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  Full Stack Tiers 01-05, gouvernance HSM, clés privées scellées et matériel EdgeBlade X1 physique.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-neutral-300 font-mono border-t border-white/[0.08] pt-4">
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Tous les Tiers 01 à 05 (Gouvernance)</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Matériel Physique X1 & HSM TPM 2.0</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Déploiement On-Premise / Air-Gapped</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setIsQuoteModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Demander un Devis Entreprise</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* B2B TITAN SOVEREIGN (TIER 05) QUOTE MODAL */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0e0e14] border border-amber-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  Tier 05 - Titan Sovereign
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Dossier de Qualification & Devis B2B</h3>
              </div>
              <button
                onClick={() => {
                  setIsQuoteModalOpen(false);
                  setQuoteSubmitted(false);
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quoteSubmitted ? (
              <div className="py-8 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Demande enregistrée avec succès</h4>
                <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
                  Notre département Ingénierie & Grands Comptes a bien reçu vos spécifications techniques pour vos <span className="text-emerald-400 font-bold">{numSites} sites</span> ({currentResults.totalBlades} modules EdgeBlade). Un ingénieur de solutions vous contactera sous 2h ouvrées.
                </p>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-neutral-400">
                  Économies cibles estimées : <span className="text-emerald-400 font-bold">${currentResults.annualSavingsEur.toLocaleString("en-US")} / an</span>
                </div>
                <button
                  onClick={() => {
                    setIsQuoteModalOpen(false);
                    setQuoteSubmitted(false);
                  }}
                  className="px-6 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setQuoteSubmitted(true);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">Entreprise / Organisation</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Alstom, TotalEnergies..."
                      value={quoteFormData.companyName}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, companyName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">Email Professionnel</label>
                    <input
                      required
                      type="email"
                      placeholder="cto@entreprise.com"
                      value={quoteFormData.contactEmail}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Téléphone Direct</label>
                  <input
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={quoteFormData.phone}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono space-y-1 text-neutral-300">
                  <div className="text-[11px] text-amber-300 font-semibold uppercase">Configuration simulée intégrée :</div>
                  <div className="flex justify-between text-[11px]">
                    <span>Sites industriels : {numSites}</span>
                    <span>EdgeBlades X1 : {currentResults.totalBlades}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-emerald-400 font-bold">
                    <span>Économies annuelles ({activeScenario}) :</span>
                    <span>${currentResults.annualSavingsEur.toLocaleString("en-US")} / an</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Exigences spécifiques (Air-gap, HSM, SCADA...)</label>
                  <textarea
                    rows={3}
                    placeholder="Précisez votre environnement industriel ou contraintes de conformité..."
                    value={quoteFormData.notes}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsQuoteModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-transparent hover:bg-white/[0.05] text-neutral-300 text-xs transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Transmettre le Dossier</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
