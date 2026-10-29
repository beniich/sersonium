import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { ZeroTrustService } from "../services/zeroTrust.service.js";
import { AuditService } from "../services/audit.service.js";

/**
 * Contrôleur Zero Trust (Sprint 1: Zero Trust)
 */
export const getPolicies = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const policies = await ZeroTrustService.getPolicies(tenantPrisma);

    res.status(200).json({
      success: true,
      data: policies,
      meta: {
        tenantId: req.tenantId,
        count: policies.length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "POLICY_FETCH_FAILED", message: error.message }
    });
  }
};

export const createPolicy = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const policy = await ZeroTrustService.createPolicy(tenantPrisma, req.body);

    // Audit de création de règle de sécurité
    AuditService.logEvent(tenantPrisma, req.user?.userId, {
      action: "ZERO_TRUST_POLICY_CREATED",
      resource: "AccessPolicy",
      resourceId: policy.id,
      details: req.body,
      ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress
    }).catch(() => {});

    res.status(201).json({
      success: true,
      data: policy,
      meta: { tenantId: req.tenantId }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "POLICY_CREATION_FAILED", message: error.message }
    });
  }
};

export const deletePolicy = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const { id } = req.params;

    await ZeroTrustService.deletePolicy(tenantPrisma, id);

    // Audit de suppression de règle de sécurité
    AuditService.logEvent(tenantPrisma, req.user?.userId, {
      action: "ZERO_TRUST_POLICY_DELETED",
      resource: "AccessPolicy",
      resourceId: id,
      ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Politique Zero Trust supprimée avec succès."
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "POLICY_DELETION_FAILED", message: error.message }
    });
  }
};

export const evaluateAccess = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const userId = req.body.targetUserId || req.user!.userId;
    const { resourceId, action } = req.body;

    const evaluation = await ZeroTrustService.evaluateAccess(tenantPrisma, {
      userId,
      resourceId,
      action
    });

    res.status(200).json({
      success: true,
      data: evaluation,
      meta: { tenantId: req.tenantId }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "EVALUATION_FAILED", message: error.message }
    });
  }
};

/**
 * Évalue si le voyage / déplacement d'un utilisateur est physiquement impossible (Axe 3 Zero Trust)
 */
export const evaluateTravel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.body.userId || req.user?.userId || "anonymous";
    const ip = req.body.ip || (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.socket.remoteAddress || "127.0.0.1";
    const country = req.body.country || (req.headers["cf-ipcountry"] as string) || (req.headers["x-country"] as string);
    const coordinates = req.body.coordinates; // { lat: number, lon: number }

    const result = ZeroTrustService.evaluateImpossibleTravel(userId, ip, country, coordinates);

    res.status(200).json({
      success: true,
      data: result,
      meta: {
        userId,
        evaluatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "TRAVEL_EVALUATION_FAILED", message: error.message }
    });
  }
};

/**
 * Récupère les alertes actives de déplacement impossible
 */
export const getTravelAlerts = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const alerts = ZeroTrustService.getTravelAlerts();
    res.status(200).json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "FETCH_TRAVEL_ALERTS_FAILED", message: error.message }
    });
  }
};

/**
 * Récupère les sessions récentes de géolocalisation pour audit
 */
export const getTravelSessions = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const sessions = ZeroTrustService.getRecentSessions();
    res.status(200).json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "FETCH_TRAVEL_SESSIONS_FAILED", message: error.message }
    });
  }
};
