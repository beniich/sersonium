/**
 * SENSORIUM - Pure Mathematical ROI & ESG Decarbonization Engine
 * 
 * Reusable calculation module for both Web (React/TypeScript) and Mobile (Flutter/Dart).
 * Ensures 100% numerical and financial consistency across all client platforms.
 */

export interface RoiInputs {
  /** Number of production plants or operational sites */
  numSites: number;
  /** Number of EdgeBlade hardware modules per site */
  bladesPerSite: number;
  /** Data volume generated per site per month in Terabytes */
  dataVolumeTb: number;
  /** Local industrial energy tariff in € / kWh */
  kwhCostEur: number;
  /** Cloud egress tariff in € / TB */
  cloudEgressCostPerTb: number;
}

export interface RoiOutputs {
  totalBlades: number;
  totalMonthlyTb: number;
  
  // Traditional Cloud Model
  traditionalMonthlyEgress: number;
  traditionalMonthlyCompute: number;
  traditionalAnnualTotal: number;
  
  // Sensorium Sovereign Edge Model
  sensoriumMonthlyEgress: number;
  monthlyBladeEnergyCost: number;
  sensoriumPlatformFee: number;
  sensoriumAnnualTotal: number;
  
  // Key Financial & ESG Metrics
  annualSavingsEur: number;
  totalCapexEstimate: number;
  paybackMonths: string;
  annualKwhSaved: number;
  annualCo2SavedTons: string;
  egressReductionPercent: number;
}

export const DEFAULT_ROI_INPUTS: RoiInputs = {
  numSites: 12,
  bladesPerSite: 4,
  dataVolumeTb: 45,
  kwhCostEur: 0.22,
  cloudEgressCostPerTb: 65,
};

/**
 * Computes all financial and environmental metrics based on physical edge inputs.
 */
export function calculateRoi(inputs: RoiInputs): RoiOutputs {
  const {
    numSites,
    bladesPerSite,
    dataVolumeTb,
    kwhCostEur,
    cloudEgressCostPerTb,
  } = inputs;

  const totalBlades = numSites * bladesPerSite;
  const totalMonthlyTb = numSites * dataVolumeTb;

  // 1. Traditional Cloud Architecture
  // Cloud instance compute (€420/mo per heavy streaming node) + full raw egress
  const traditionalMonthlyEgress = totalMonthlyTb * cloudEgressCostPerTb;
  const traditionalMonthlyCompute = totalBlades * 420;
  const traditionalAnnualTotal = (traditionalMonthlyEgress + traditionalMonthlyCompute) * 12;

  // 2. Sensorium Sovereign Edge Architecture
  // Only 6% anomaly metadata uploaded to cloud (94% egress reduction via INT4 edge filtering)
  const sensoriumMonthlyEgress = (totalMonthlyTb * 0.06) * cloudEgressCostPerTb;
  // 45W passive low-power consumption per blade vs 350W cloud server
  const monthlyBladeEnergyCost = totalBlades * (0.045 * 24 * 30.5) * kwhCostEur;
  // Edge orchestration and model license fee (€95/mo per blade)
  const sensoriumPlatformFee = totalBlades * 95;
  const sensoriumAnnualTotal = (sensoriumMonthlyEgress + monthlyBladeEnergyCost + sensoriumPlatformFee) * 12;

  // 3. Financial outcomes
  const annualSavingsEur = Math.max(0, traditionalAnnualTotal - sensoriumAnnualTotal);
  const totalCapexEstimate = totalBlades * 2400; // €2,400 per EdgeBlade unit
  const paybackMonths = annualSavingsEur > 0 
    ? (totalCapexEstimate / (annualSavingsEur / 12)).toFixed(1) 
    : "0";

  // 4. ESG Decarbonization outcomes (0.42 kg CO2 per kWh grid average)
  const traditionalAnnualKwh = totalBlades * (0.350 * 24 * 365);
  const sensoriumAnnualKwh = totalBlades * (0.045 * 24 * 365);
  const annualKwhSaved = traditionalAnnualKwh - sensoriumAnnualKwh;
  const annualCo2SavedTons = ((annualKwhSaved * 0.42) / 1000).toFixed(1);

  return {
    totalBlades,
    totalMonthlyTb,
    traditionalMonthlyEgress,
    traditionalMonthlyCompute,
    traditionalAnnualTotal,
    sensoriumMonthlyEgress,
    monthlyBladeEnergyCost,
    sensoriumPlatformFee,
    sensoriumAnnualTotal,
    annualSavingsEur,
    totalCapexEstimate,
    paybackMonths,
    annualKwhSaved,
    annualCo2SavedTons,
    egressReductionPercent: 94,
  };
}
