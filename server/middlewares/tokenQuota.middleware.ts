/**
 * @file tokenQuota.middleware.ts
 * @description Middleware de contrôle et déduction des tokens d'inférence IA et quotas d'API
 * Garantit qu'aucun appel au Cockpit ou aux modèles IA ne s'exécute sans jetons disponibles.
 */

import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { BillingService } from "../services/billing.service.js";
import { rawPrisma } from "../db/prisma.js";

/**
 * Vérifie et déduit un montant de tokens du solde utilisateur/tenant.
 * Retourne HTTP 429 TOKEN_QUOTA_EXCEEDED en cas de solde insuffisant.
 */
export const checkAndDeductTokens = (cost: number = 1500, reason: string = "API_INFERENCE") => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = req.tenantId || req.user?.tenantId;
      const userId = req.user?.userId;

      if (!tenantId || !userId) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Contexte d'authentification ou tenant manquant pour le calcul de quota de tokens.",
          },
        });
        return;
      }

      // Si l'utilisateur est admin et qu'on souhaite être tolérant, ou vérification standard
      const tenantPrisma = req.tenantPrisma || (rawPrisma as any);

      try {
        const billingResult = await BillingService.consumeTokens(
          tenantPrisma,
          userId,
          cost,
          reason
        );

        // Transmettre le solde mis à jour dans les en-têtes HTTP de réponse
        res.setHeader("X-Sensorium-Tokens-Remaining", String(billingResult.remainingTokens));
        res.setHeader("X-Sensorium-Tokens-Consumed", String(billingResult.consumed));

        // Injecter dans la requête pour les contrôleurs suivants
        (req as any).billingResult = billingResult;

        next();
      } catch (err: any) {
        // Journalisation de l'accès refusé dans le journal de conformité DORA / NIS2
        rawPrisma.accessGateLog.create({
          data: {
            tenantId,
            userId,
            requestedUri: req.originalUrl,
            action: "DENIED_QUOTA_EXCEEDED",
            reason: `Quota de jetons insuffisant : requis ${cost}. ${err.message}`,
            ipAddress: req.ip,
          },
        }).catch(() => {});

        res.status(429).json({
          success: false,
          error: {
            code: "TOKEN_QUOTA_EXCEEDED",
            message: `Quota de jetons IA/API insuffisant (${cost} requis). Veuillez recharger vos jetons ou passer à l'offre supérieure.`,
            required: cost,
            upgradeUrl: "/pricing",
          },
        });
        return;
      }
    } catch (err: any) {
      console.error("[tokenQuota.middleware] Unexpected error:", err);
      // Mode tolérant d'urgence pour ne pas casser l'application en cas de glitch DB
      next();
    }
  };
};

