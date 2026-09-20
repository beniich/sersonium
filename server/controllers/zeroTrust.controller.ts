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
