import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { CarbonService } from "../services/carbon.service.js";
import { AuditService } from "../services/audit.service.js";

/**
 * Contrôleur Carbone (Orchestration HTTP & Audit Trail)
 * S'appuie sur `req.tenantPrisma` garanti par le middleware `requireTenant`
 * et enregistre automatiquement les mutations dans la piste d'audit isolée.
 */
export const getCarbonEmissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const { scope, category, status } = req.query as any;

    const where: Record<string, any> = {};
    if (scope) where.scope = Number(scope);
    if (category) where.category = String(category);
    if (status) where.status = String(status);

    const emissions = await CarbonService.getEmissions(tenantPrisma, Object.keys(where).length > 0 ? where : undefined);

    res.status(200).json({
      success: true,
      data: emissions,
      meta: {
        tenantId: req.tenantId,
        count: emissions.length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "QUERY_FAILED", message: error.message }
    });
  }
};

export const getCarbonEmissionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const { id } = req.params;

    const emission = await CarbonService.getEmissionById(tenantPrisma, id);
    if (!emission) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Émission carbone introuvable ou n'appartenant pas à votre organisation."
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: emission,
      meta: { tenantId: req.tenantId }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "QUERY_FAILED", message: error.message }
    });
  }
};

export const getCarbonMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const metrics = await CarbonService.getMetrics(tenantPrisma);

    res.status(200).json({
      success: true,
      data: metrics,
      meta: {
        tenantId: req.tenantId
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "METRICS_FAILED", message: error.message }
    });
  }
};

export const createCarbonEmission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const created = await CarbonService.createEmission(tenantPrisma, req.body);

    // Audit automatique de l'action métier
    AuditService.logEvent(tenantPrisma, req.user?.userId, {
      action: "CARBON_EMISSION_CREATED",
      resource: "CarbonEmission",
      resourceId: (created as any).id,
      details: {
        title: (created as any).title,
        scope: (created as any).scope,
        co2EquivalentKg: (created as any).co2EquivalentKg
      },
      ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress
    }).catch(() => {});

    res.status(201).json({
      success: true,
      data: created,
      meta: {
        tenantId: req.tenantId
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "CREATE_FAILED", message: error.message }
    });
  }
};

export const updateCarbonEmission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const { id } = req.params;

    const updated = await CarbonService.updateEmission(tenantPrisma, id, req.body);
    if (!updated) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Émission carbone introuvable ou n'appartenant pas à votre organisation."
        }
      });
      return;
    }

    // Audit de modification
    AuditService.logEvent(tenantPrisma, req.user?.userId, {
      action: "CARBON_EMISSION_UPDATED",
      resource: "CarbonEmission",
      resourceId: id,
      details: req.body,
      ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress
    }).catch(() => {});

    res.status(200).json({
      success: true,
      data: updated,
      meta: { tenantId: req.tenantId }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "UPDATE_FAILED", message: error.message }
    });
  }
};

export const deleteCarbonEmission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const { id } = req.params;

    const deleted = await CarbonService.deleteEmission(tenantPrisma, id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Émission carbone introuvable ou n'appartenant pas à votre organisation."
        }
      });
      return;
    }

    // Audit de suppression
    AuditService.logEvent(tenantPrisma, req.user?.userId, {
      action: "CARBON_EMISSION_DELETED",
      resource: "CarbonEmission",
      resourceId: id,
      ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Enregistrement d'émission carbone supprimé avec succès."
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "DELETE_FAILED", message: error.message }
    });
  }
};
