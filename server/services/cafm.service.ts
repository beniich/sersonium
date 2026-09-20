import { TenantPrismaClient } from "../db/tenantPrisma.js";

export interface FailurePredictionResult {
  assetId: string;
  assetName: string;
  riskLevel: "Stable" | "Attention Modérée" | "Risque Élevé" | "Critique Immédiat";
  temperatureTrendPct: number;
  vibrationAnomaly: boolean;
  currentTemperatureC: number;
  currentVibrationMmS: number;
  sampleCount: number;
  recommendation: string;
  timestamp: string;
}

export class CafmService {
  /**
   * Enregistre une mesure de télémétrie IoT d'un équipement
   */
  static async recordTelemetry(
    tenantPrisma: TenantPrismaClient,
    data: {
      assetId: string;
      temperatureC: number;
      vibrationMmS: number;
      powerKw: number;
      pueScore: number;
      status?: "nominal" | "warning" | "critical";
    }
  ) {
    const asset = await tenantPrisma.infrastructureAsset.findFirst({
      where: { id: data.assetId }
    });

    if (!asset) {
      throw new Error("Équipement d'infrastructure introuvable.");
    }

    return tenantPrisma.assetTelemetry.create({
      data: {
        assetId: data.assetId,
        temperatureC: data.temperatureC,
        vibrationMmS: data.vibrationMmS,
        powerKw: data.powerKw,
        pueScore: data.pueScore,
        status: data.status || "nominal"
      } as any
    });
  }

  /**
   * Maintenance Prédictive (Pattern Blueprint)
   * Analyse la pente thermique et vibratoire sur les séries temporelles IoT
   */
  static async predictFailure(
    tenantPrisma: TenantPrismaClient,
    assetId: string,
    limit: number = 50
  ): Promise<FailurePredictionResult> {
    const asset = await tenantPrisma.infrastructureAsset.findFirst({
      where: { id: assetId }
    });

    if (!asset) {
      throw new Error("Équipement introuvable.");
    }

    const telemetry = await tenantPrisma.assetTelemetry.findMany({
      where: { assetId },
      orderBy: { timestamp: "desc" },
      take: limit
    });

    if (telemetry.length < 2) {
      return {
        assetId,
        assetName: asset.name,
        riskLevel: "Stable",
        temperatureTrendPct: 0,
        vibrationAnomaly: false,
        currentTemperatureC: telemetry[0]?.temperatureC || 22,
        currentVibrationMmS: telemetry[0]?.vibrationMmS || 0.5,
        sampleCount: telemetry.length,
        recommendation: "Données de télémétrie insuffisantes pour une projection statistique. Équipement présumé nominal.",
        timestamp: new Date().toISOString()
      };
    }

    const latest = telemetry[0];
    const oldest = telemetry[telemetry.length - 1];

    // Calcul de la tendance de température (trend = delta / température initiale)
    const tempDelta = latest.temperatureC - oldest.temperatureC;
    const tempTrendPct = oldest.temperatureC > 0 
      ? Math.round((tempDelta / oldest.temperatureC) * 1000) / 10 
      : 0;

    // Détection d'anomalie vibratoire (seuil de résonance mécanique > 3.5 mm/s)
    const vibrationAnomaly = latest.vibrationMmS > 3.5 || (latest.vibrationMmS - oldest.vibrationMmS) > 1.5;

    let riskLevel: "Stable" | "Attention Modérée" | "Risque Élevé" | "Critique Immédiat" = "Stable";
    let recommendation = "Comportement thermique et vibratoire conforme aux spécifications constructeur.";

    if (latest.temperatureC > 75 || latest.vibrationMmS > 7.0) {
      riskLevel = "Critique Immédiat";
      recommendation = "Seuil critique de surchauffe ou vibration dépassé. Arrêt d'urgence ou bascule de charge recommandée.";
    } else if (tempTrendPct > 10.0 || vibrationAnomaly) {
      riskLevel = "Risque Élevé";
      recommendation = "Dérive thermique supérieure à +10% ou anomalie vibratoire. Programmer une inspection HVAC / ventilateurs sous 24h.";
    } else if (tempTrendPct > 5.0) {
      riskLevel = "Attention Modérée";
      recommendation = "Légère élévation thermique constatée (+5%). Vérifier le flux d'air et l'encrassement des filtres.";
    }

    return {
      assetId,
      assetName: asset.name,
      riskLevel,
      temperatureTrendPct: tempTrendPct,
      vibrationAnomaly,
      currentTemperatureC: latest.temperatureC,
      currentVibrationMmS: latest.vibrationMmS,
      sampleCount: telemetry.length,
      recommendation,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Récupère l'historique récent de télémétrie pour un asset
   */
  static async getAssetTelemetry(tenantPrisma: TenantPrismaClient, assetId: string, limit: number = 30) {
    return tenantPrisma.assetTelemetry.findMany({
      where: { assetId },
      orderBy: { timestamp: "desc" },
      take: limit
    });
  }
}
