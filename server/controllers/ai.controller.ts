import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { AIService } from "../services/ai.service.js";

/**
 * Contrôleur Compute & AI (Sprint 4: Compute & AI)
 */
export const analyzeLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const userId = req.user!.userId;
    const { logs, context, tokenBudget } = req.body;

    const result = await AIService.analyzeLogs(
      tenantPrisma,
      userId,
      logs,
      tokenBudget || 15,
      context
    );

    res.status(200).json({
      success: true,
      data: result,
      meta: { tenantId: req.tenantId }
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      error: {
        code: error.code || "AI_ANALYSIS_FAILED",
        message: error.message
      }
    });
  }
};

/**
 * POST /api/v1/ai/analyze-tenant
 * Analyse déterministe & IA prédictive sur les données réelles du tenant
 */
export const analyzeTenantHealth = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenantId!;
    const { rawPrisma } = await import("../db/prisma.js");

    const [assets, telemetries] = await Promise.all([
      rawPrisma.infrastructureAsset.findMany({ where: { tenantId } }),
      rawPrisma.assetTelemetry.findMany({
        where: { tenantId },
        orderBy: { timestamp: "desc" },
        take: 50
      })
    ]);

    if (assets.length === 0 && telemetries.length === 0) {
      res.status(200).json({
        success: true,
        data: {
          status: "OK",
          isSufficient: false,
          diagnostic: "Aucun équipement ni relevé de télémétrie trouvé dans votre organisation (État T0).",
          recommendation: "Ajoutez votre premier équipement ou importez un fichier CSV/JSON pour déclencher l'analyse.",
          assetCount: 0,
          sampleCount: 0,
          energySaving: 0,
        }
      });
      return;
    }

    if (telemetries.length < 2) {
      res.status(200).json({
        success: true,
        data: {
          status: "OK",
          isSufficient: false,
          diagnostic: `Télémétrie insuffisante (${telemetries.length} point). Au moins 2 points de mesure sont nécessaires pour calculer les pentes thermiques et vibratoires.`,
          recommendation: "Envoyez une seconde mesure ou activez le terminal pour corréler la santé des actifs.",
          assetCount: assets.length,
          sampleCount: telemetries.length,
          energySaving: 0,
        }
      });
      return;
    }

    const result = await AIService.analyzeBuildingHealth(
      tenantId,
      assets[0]?.id || "asset-main",
      telemetries
    );

    res.status(200).json({
      success: true,
      data: {
        ...result,
        isSufficient: true,
        assetCount: assets.length,
        sampleCount: telemetries.length,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const analyzeTelemetry = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { query } = req.body;
    
    if (!query) {
      res.status(400).json({ success: false, error: "Query is required" });
      return;
    }

    if (req.tenantPrisma && req.user) {
      const result = await AIService.analyzeLogs(
        req.tenantPrisma,
        req.user.userId,
        query,
        10
      );
      res.json({
        success: true,
        data: {
          analysis: result.report,
          timestamp: result.timestamp
        }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        analysis: `[AI Ops Analysis] Requête analysée : ${query}. Infrastructure nominale.`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};
