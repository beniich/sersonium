import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { BillingService } from "../services/billing.service.js";
import { AuditService } from "../services/audit.service.js";

/**
 * Contrôleur de Facturation & Gestion des Jetons (Sprint 1: Manage)
 */
export const getBillingSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const userId = req.user!.userId;

    const summary = await BillingService.getBillingSummary(tenantPrisma, userId);

    res.status(200).json({
      success: true,
      data: summary,
      meta: { tenantId: req.tenantId }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "BILLING_SUMMARY_FAILED", message: error.message }
    });
  }
};

export const consumeTokens = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const userId = req.user!.userId;
    const { amount, reason } = req.body;

    const result = await BillingService.consumeTokens(tenantPrisma, userId, amount, reason);

    // Audit de consommation de jetons
    AuditService.logEvent(tenantPrisma, userId, {
      action: "TOKENS_CONSUMED",
      resource: "Billing/Tokens",
      details: { amount, remaining: result.remainingTokens, reason },
      ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress
    }).catch(() => {});

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
        code: error.code || "TOKEN_CONSUMPTION_FAILED",
        message: error.message
      }
    });
  }
};

export const creditTokens = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const userId = req.user!.userId;
    const { amount, description, amountEur } = req.body;

    const result = await BillingService.creditTokens(tenantPrisma, userId, amount, description, amountEur);

    // Audit de rechargement de compte
    AuditService.logEvent(tenantPrisma, userId, {
      action: "TOKENS_CREDITED",
      resource: "Billing/Invoice",
      resourceId: result.invoice.id,
      details: { amount, newBalance: result.totalTokens, amountEur },
      ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress
    }).catch(() => {});

    res.status(201).json({
      success: true,
      data: result,
      meta: { tenantId: req.tenantId }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "TOKEN_CREDIT_FAILED", message: error.message }
    });
  }
};
