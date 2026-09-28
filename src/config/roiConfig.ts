/**
 * SENSORIUM - Strategic Financial & CSRD Decarbonization Simulator
 * 
 * Non-linear, multi-scenario (Conservative / Realistic / Optimistic) engine.
 * Full audit-grade precision for CFO, CTO, and ESG Investment Committees.
 */

export const ROI_CONSTANTS = {
  // Thermodynamics & Power Profiles
  CLOUD_SERVER_POWER_WATTS: 650,    // Traditional cloud node (Dual Xeon/EPYC + GPU + DC PUE factor)
  EDGE_SILICIUM_POWER_WATTS: 45,     // EdgeBlade Silicium X1 NPU passive blade
  HOURS_PER_YEAR: 8760,             // 24h * 365d
  HOURS_PER_MONTH: 730,

  // Financial Standard Tariffs
  BASE_CLOUD_INFERENCE_PER_MILLION: 1200, // € per Million Cloud API calls
  BASE_EDGE_MAINTENANCE_PER_BLADE: 450,   // € per blade/year (license, updates, sovereign orchestrator)
  HARDWARE_CAPEX_PER_BLADE: 2400,         // € procurement cost per unit
  CLOUD_EGRESS_PER_TB: 65,                // Standard hyperscaler egress tariff

  // CSRD & ESG Standards (European Taxonomy & GHG Protocol)
  GRID_CO2_GRAMS_PER_KWH: 50,             // European median decarbonized grid (g CO2/kWh)
  TREES_SAVED_PER_TON_CO2: 45,            // Equivalent mature trees for 1T CO2 / yr
  DC_WUE_LITERS_PER_KWH: 1.8,             // Water Usage Effectiveness: 1.8L evaporated per kWh in hyperscale DC
  EMBEDDED_CARBON_KG_PER_BLADE: 120,      // Scope 3: Lifecycle embodied carbon to manufacture one EdgeBlade
} as const;

export type RiskScenario = "conservative" | "realistic" | "optimistic";

export interface StrategicSimulationInputs {
  /** Production plants or industrial sites (1 - 50) */
  sites: number;
  /** EdgeBlade modules per site (2 - 100) */
  bladesPerSite: number;
  /** AI Inference volume in Millions of requests/month (1 - 50 M) */
  aiInferencesMillionPerMonth: number;
  /** Electricity tariff in €/kWh (0.10 - 0.45) */
  kwhCostEur: number;
  /** Active risk scenario */
  scenario?: RiskScenario;
}

export type RoiSimulationInputs = StrategicSimulationInputs;
export type RoiSimulationResults = StrategicSimulationResults;

export interface WaterfallStep {
  name: string;
  amountEur: number;
  type: "positive" | "negative" | "total";
  description: string;
}

export interface StrategicSimulationResults {
  scenario: RiskScenario;
  totalBlades: number;
  
  // Non-linear scaled costs
  effectiveCloudInferencePerMillion: number;
  effectiveEdgeMaintenancePerBlade: number;
  traditionalCloudAnnualCost: number;
  sensoriumEdgeAnnualCost: number;
  
  // Financial Outcomes
  annualSavingsEur: number;
  totalCapexEur: number;
  paybackMonths: number;
  fiveYearNetCashflowEur: number;
  roiPercentage: number;

  // ESG & CSRD Metrics
  annualKwhSaved: number;
  co2SavedTons: number;
  equivalentTreesPlanted: number;
  waterSavedLiters: number;
  waterSavedM3: number;
  embeddedCarbonPaybackMonths: number;
  energyReductionPercent: number;

  // Waterfall Chart Bridge Data
  waterfallBridge: WaterfallStep[];
}

/**
 * 1. Non-linear Tiered Pricing for Cloud Inferences (Economies of scale)
 */
export function getCloudInferenceRate(monthlyMillions: number): number {
  const base = ROI_CONSTANTS.BASE_CLOUD_INFERENCE_PER_MILLION;
  if (monthlyMillions >= 30) return Math.round(base * 0.75); // -25% volume discount
  if (monthlyMillions >= 15) return Math.round(base * 0.82); // -18%
  if (monthlyMillions >= 5)  return Math.round(base * 0.90); // -10%
  return base;
}

/**
 * 2. Non-linear Tiered Maintenance for Edge Blades (Mutualization)
 */
export function getEdgeMaintenanceRate(totalBlades: number): number {
  const base = ROI_CONSTANTS.BASE_EDGE_MAINTENANCE_PER_BLADE;
  if (totalBlades >= 100) return Math.round(base * 0.65); // 292 €/lame
  if (totalBlades >= 50)  return Math.round(base * 0.75); // 338 €/lame
  if (totalBlades >= 20)  return Math.round(base * 0.85); // 382 €/lame
  return base; // 450 €/lame
}

/**
 * Computes strategic ROI across 3 risk scenarios: Conservative, Realistic, Optimistic
 */
export function computeStrategicRoi(
  inputs: StrategicSimulationInputs,
  targetScenario: RiskScenario = "realistic"
): StrategicSimulationResults {
  const totalBlades = inputs.sites * inputs.bladesPerSite;

  // Apply Scenario Stress Factors
  let inferenceMultiplier = 1.0;
  let energyPriceMultiplier = 1.0;
  let edgeMaintenanceMultiplier = 1.0;

  if (targetScenario === "conservative") {
    inferenceMultiplier = 0.80;       // -20% volume (adversity / lower usage)
    energyPriceMultiplier = 1.15;     // +15% electricity surge
    edgeMaintenanceMultiplier = 1.10; // +10% operational overhead
  } else if (targetScenario === "optimistic") {
    inferenceMultiplier = 1.25;       // +25% volume adoption
    energyPriceMultiplier = 0.95;     // -5% favorable tariff
    edgeMaintenanceMultiplier = 0.92; // -8% maximum operational scale
  }

  const effectiveInferencesM = inputs.aiInferencesMillionPerMonth * inferenceMultiplier;
  const effectiveKwhCost = inputs.kwhCostEur * energyPriceMultiplier;

  // 1. Scaled Unit Costs
  const effectiveCloudInferencePerMillion = getCloudInferenceRate(effectiveInferencesM);
  const effectiveEdgeMaintenancePerBlade = Math.round(
    getEdgeMaintenanceRate(totalBlades) * edgeMaintenanceMultiplier
  );

  // 2. Traditional Cloud Cost
  const annualCloudInference = effectiveInferencesM * effectiveCloudInferencePerMillion * 12;
  const annualCloudEnergyKwh = totalBlades * (ROI_CONSTANTS.CLOUD_SERVER_POWER_WATTS / 1000) * ROI_CONSTANTS.HOURS_PER_YEAR;
  const annualCloudEnergyCost = annualCloudEnergyKwh * effectiveKwhCost;
  const traditionalCloudAnnualCost = Math.round(annualCloudInference + annualCloudEnergyCost);

  // 3. Sensorium Edge Cost
  const annualEdgeMaintenance = totalBlades * effectiveEdgeMaintenancePerBlade;
  const annualEdgeEnergyKwh = totalBlades * (ROI_CONSTANTS.EDGE_SILICIUM_POWER_WATTS / 1000) * ROI_CONSTANTS.HOURS_PER_YEAR;
  const annualEdgeEnergyCost = annualEdgeEnergyKwh * effectiveKwhCost;
  const sensoriumEdgeAnnualCost = Math.round(annualEdgeMaintenance + annualEdgeEnergyCost);

  // 4. Financial Bottom Line
  const annualSavingsEur = Math.max(0, traditionalCloudAnnualCost - sensoriumEdgeAnnualCost);
  const totalCapexEur = totalBlades * ROI_CONSTANTS.HARDWARE_CAPEX_PER_BLADE;
  const paybackMonths = annualSavingsEur > 0 
    ? Number((totalCapexEur / (annualSavingsEur / 12)).toFixed(1)) 
    : 0;

  // 5-Year Net Cashflow = (5 * Annual Savings) - Initial CapEx
  const fiveYearNetCashflowEur = Math.round((annualSavingsEur * 5) - totalCapexEur);
  const roiPercentage = totalCapexEur > 0 
    ? Math.round((fiveYearNetCashflowEur / totalCapexEur) * 100) 
    : 0;

  // 5. Environmental & CSRD Metrics
  const annualKwhSaved = Math.round(annualCloudEnergyKwh - annualEdgeEnergyKwh);
  const co2SavedTons = Number(((annualKwhSaved * ROI_CONSTANTS.GRID_CO2_GRAMS_PER_KWH) / 1_000_000).toFixed(2));
  const equivalentTreesPlanted = Math.round(co2SavedTons * ROI_CONSTANTS.TREES_SAVED_PER_TON_CO2);
  
  // Water Savings (WUE = 1.8L per kWh avoided)
  const waterSavedLiters = Math.round(annualKwhSaved * ROI_CONSTANTS.DC_WUE_LITERS_PER_KWH);
  const waterSavedM3 = Number((waterSavedLiters / 1000).toFixed(1));

  // Embedded Carbon Payback (months to offset hardware manufacturing carbon)
  const totalEmbodiedCarbonKg = totalBlades * ROI_CONSTANTS.EMBEDDED_CARBON_KG_PER_BLADE;
  const monthlyCo2AvoidedKg = (co2SavedTons * 1000) / 12;
  const embeddedCarbonPaybackMonths = monthlyCo2AvoidedKg > 0 
    ? Number((totalEmbodiedCarbonKg / monthlyCo2AvoidedKg).toFixed(1))
    : 0;

  const energyReductionPercent = Math.round(
    ((ROI_CONSTANTS.CLOUD_SERVER_POWER_WATTS - ROI_CONSTANTS.EDGE_SILICIUM_POWER_WATTS) / ROI_CONSTANTS.CLOUD_SERVER_POWER_WATTS) * 100
  );

  // 6. Waterfall Chart Data (Financial Bridge)
  const inferenceSavings = Math.round(annualCloudInference);
  const cloudEnergyPortion = Math.round(annualCloudEnergyCost);
  const edgeLicensingCost = Math.round(annualEdgeMaintenance);
  const edgeEnergyPortion = Math.round(annualEdgeEnergyCost);

  const waterfallBridge: WaterfallStep[] = [
    {
      name: "Coût Cloud Brut",
      amountEur: traditionalCloudAnnualCost,
      type: "total",
      description: "Dépenses annuelles initiales Cloud (API + Puissance 650W)",
    },
    {
      name: "Évitement API Cloud",
      amountEur: -inferenceSavings,
      type: "negative",
      description: "Inférences basculées 100% en local sur Silicium X1 NPU",
    },
    {
      name: "Énergie Cloud Évitée",
      amountEur: -cloudEnergyPortion,
      type: "negative",
      description: "Suppression du refroidissement et de l'alimentation 650W",
    },
    {
      name: "Licence & MCO Edge",
      amountEur: edgeLicensingCost,
      type: "positive",
      description: "Orchestration souveraine et maintenance mutualisée",
    },
    {
      name: "Conso Silicium (45W)",
      amountEur: edgeEnergyPortion,
      type: "positive",
      description: "Alimentation électrique passive basse consommation",
    },
    {
      name: "Coût Net Sensorium",
      amountEur: sensoriumEdgeAnnualCost,
      type: "total",
      description: "OPEX annuel définitif de la flotte souveraine",
    },
  ];

  return {
    scenario: targetScenario,
    totalBlades,
    effectiveCloudInferencePerMillion,
    effectiveEdgeMaintenancePerBlade,
    traditionalCloudAnnualCost,
    sensoriumEdgeAnnualCost,
    annualSavingsEur,
    totalCapexEur,
    paybackMonths,
    fiveYearNetCashflowEur,
    roiPercentage,
    annualKwhSaved,
    co2SavedTons,
    equivalentTreesPlanted,
    waterSavedLiters,
    waterSavedM3,
    embeddedCarbonPaybackMonths,
    energyReductionPercent,
    waterfallBridge,
  };
}

/**
 * Returns a 3-scenario comparative matrix for CFO presentation
 */
export function computeScenarioComparisonMatrix(inputs: StrategicSimulationInputs) {
  return {
    conservative: computeStrategicRoi(inputs, "conservative"),
    realistic: computeStrategicRoi(inputs, "realistic"),
    optimistic: computeStrategicRoi(inputs, "optimistic"),
  };
}
