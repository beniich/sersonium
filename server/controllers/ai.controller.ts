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
 * Route héritée pour compatibilité existante
 */
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
