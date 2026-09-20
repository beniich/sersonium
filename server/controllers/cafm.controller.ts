import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { CafmService } from "../services/cafm.service.js";
import { AuditService } from "../services/audit.service.js";
import { kafkaService } from "../services/kafka.service.js";

/**
 * Contrôleur CAFM & Maintenance Prédictive (Sprint 2: Infrastructure)
 */
export const recordTelemetry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const entry = await CafmService.recordTelemetry(tenantPrisma, req.body);

    // Publication de la télémétrie sur le flux Kafka pour traitement en temps réel (ex: Analytics, WAF AI)
    await kafkaService.publishEvent("cafm.telemetry.events", {
      tenantId: req.tenantId,
      assetId: entry.assetId,
      telemetry: entry
    }, req.tenantId);

    res.status(201).json({
      success: true,
      data: entry,
      meta: { tenantId: req.tenantId }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "TELEMETRY_RECORD_FAILED", message: error.message }
    });
  }
};

export const getAssetTelemetry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const { assetId } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    const data = await CafmService.getAssetTelemetry(tenantPrisma, assetId, limit);

    res.status(200).json({
      success: true,
      data,
      meta: { tenantId: req.tenantId, assetId }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "TELEMETRY_FETCH_FAILED", message: error.message }
    });
  }
};

export const predictAssetFailure = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const { assetId } = req.params;
    const windowSize = req.query.windowSize ? Number(req.query.windowSize) : 50;

    const prediction = await CafmService.predictFailure(tenantPrisma, assetId, windowSize);

    // Si risque élevé ou critique, enregistrer un audit de sécurité infrastructure
    if (prediction.riskLevel === "Risque Élevé" || prediction.riskLevel === "Critique Immédiat") {
      AuditService.logEvent(tenantPrisma, req.user?.userId, {
        action: "PREDICTIVE_MAINTENANCE_ALERT",
        resource: "InfrastructureAsset",
        resourceId: assetId,
        details: {
          riskLevel: prediction.riskLevel,
          trendPct: prediction.temperatureTrendPct,
          recommendation: prediction.recommendation
        },
        ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress
      }).catch(() => {});
    }

    res.status(200).json({
      success: true,
      data: prediction,
      meta: { tenantId: req.tenantId }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "PREDICTION_FAILED", message: error.message }
    });
  }
};
