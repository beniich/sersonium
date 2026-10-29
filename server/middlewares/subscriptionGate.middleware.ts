/**
 * @file subscriptionGate.middleware.ts
 * @description Middleware Express pour le pont d'accès : vérifie que l'organisation
 * ou l'utilisateur appelant dispose d'un abonnement actif avant d'autoriser l'accès aux API du Cockpit.
 */

import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { rawPrisma } from "../db/prisma.js";

export const requireActiveSubscription = (minimumTier: "STARTER" | "PRO" | "ENTERPRISE" = "STARTER") => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = req.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: {
            code: "TENANT_REQUIRED",
            message: "Accès refusé : Aucun tenant identifié.",
          },
        });
        return;
      }

      // Recherche de l'organisation et son statut
      const org = await rawPrisma.organization.findUnique({
        where: { id: tenantId },
        include: {
          subscriptions: {
            where: { status: "active" },
            include: { plan: true },
            take: 1,
          },
        },
      });

      if (!org) {
        res.status(403).json({
          success: false,
          error: {
            code: "ORGANIZATION_NOT_FOUND",
            message: "Organisation introuvable.",
          },
        });
        return;
      }

      const activeSub = org.subscriptions?.[0];
      const currentTier = (activeSub?.plan?.code || org.plan || "FREE").toUpperCase();
      const isSubActive = (activeSub?.status === "active") || (org.subscriptionStatus === "active");

      // Vérification du statut
      if (!isSubActive || currentTier === "FREE") {
        // Enregistrer le refus dans le journal d'accès
        rawPrisma.accessGateLog.create({
          data: {
            tenantId,
            userId: req.user?.userId,
            requestedUri: req.originalUrl,
            action: "DENIED_UNPAID",
            reason: `Tentative d'accès API cockpit sans abonnement actif (Forfait actuel: ${currentTier})`,
            ipAddress: req.ip,
          },
        }).catch(() => {});

        res.status(402).json({
          success: false,
          error: {
            code: "PAYMENT_REQUIRED",
            message: "Accès au Cockpit réservé aux abonnements actifs. Veuillez souscrire à une offre.",
            currentTier,
            subscriptionStatus: org.subscriptionStatus,
            upgradeUrl: "/site/tarifs.html",
          },
        });
        return;
      }

      // Vérification du niveau de forfait
      const tierRank: Record<string, number> = {
        FREE: 0,
        STARTER: 1,
        PRO: 2,
        ENTERPRISE: 3,
      };

      const userRank = tierRank[currentTier] ?? 0;
      const requiredRank = tierRank[minimumTier] ?? 1;

      if (userRank < requiredRank) {
        res.status(403).json({
          success: false,
          error: {
            code: "INSUFFICIENT_SUBSCRIPTION_TIER",
            message: `Cette fonctionnalité requiert le palier ${minimumTier}. Votre forfait actuel est ${currentTier}.`,
            requiredTier: minimumTier,
            currentTier,
          },
        });
        return;
      }

      // Accès accordé !
      next();
    } catch (err: any) {
      console.error("[subscriptionGate.middleware] Error:", err);
      // Mode tolérant en cas d'erreur inattendue
      next();
    }
  };
};

/**
 * Middleware vérifiant si le tenant possède le droit d'usage (Entitlement)
 * pour une fonctionnalité spécifique (Axe 6 : Monétisation & Subscription Guard).
 */
export const requireEntitlement = (featureKey: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = req.tenantId || req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: {
            code: "TENANT_REQUIRED",
            message: "Accès refusé : Aucun tenant identifié.",
          },
        });
        return;
      }

      // 1. Recherche du forfait global de l'organisation
      const org = await rawPrisma.organization.findUnique({
        where: { id: tenantId },
        select: { id: true, plan: true, subscriptionStatus: true },
      });

      const currentPlan = (org?.plan || "FREE").toUpperCase();

      // Palier ENTERPRISE : accès VIP illimité à tous les entitlements
      if (currentPlan === "ENTERPRISE") {
        next();
        return;
      }

      // 2. Recherche du droit spécifique dans la table Entitlement
      const entitlement = await rawPrisma.entitlement.findUnique({
        where: {
          tenantId_featureKey: {
            tenantId,
            featureKey,
          },
        },
      });

      // Si l'entitlement n'est pas accordé
      if (!entitlement || !entitlement.isGranted) {
        // Journalisation de l'accès refusé dans AccessGateLog
        rawPrisma.accessGateLog.create({
          data: {
            tenantId,
            userId: req.user?.userId,
            requestedUri: req.originalUrl,
            action: "DENIED_UNPAID",
            reason: `Droit manquant pour la fonctionnalité : ${featureKey}`,
            ipAddress: req.ip,
          },
        }).catch(() => {});

        res.status(403).json({
          success: false,
          error: {
            code: "ENTITLEMENT_REQUIRED",
            feature: featureKey,
            message: `Cette opération nécessite le module '${featureKey}' qui n'est pas inclus dans votre abonnement (${currentPlan}).`,
            upgradeUrl: "/site/tarifs.html",
            plan: currentPlan,
          },
        });
        return;
      }

      // 3. Vérification des quotas d'utilisation (si définis)
      if (entitlement.quotaLimit !== null && entitlement.quotaLimit !== -1) {
        if (entitlement.quotaUsed >= entitlement.quotaLimit) {
          rawPrisma.accessGateLog.create({
            data: {
              tenantId,
              userId: req.user?.userId,
              requestedUri: req.originalUrl,
              action: "DENIED_QUOTA_EXCEEDED",
              reason: `Quota dépassé pour ${featureKey} (${entitlement.quotaUsed}/${entitlement.quotaLimit})`,
              ipAddress: req.ip,
            },
          }).catch(() => {});

          res.status(429).json({
            success: false,
            error: {
              code: "QUOTA_EXCEEDED",
              feature: featureKey,
              message: `Le quota alloué pour le module '${featureKey}' a été atteint (${entitlement.quotaUsed}/${entitlement.quotaLimit}).`,
              upgradeUrl: "/site/tarifs.html",
            },
          });
          return;
        }

        // Incrémentation asynchrone de l'usage
        rawPrisma.entitlement.update({
          where: { id: entitlement.id },
          data: { quotaUsed: { increment: 1 } },
        }).catch(() => {});
      }

      // Droit validé avec succès
      next();
    } catch (err: any) {
      console.error("[requireEntitlement] Error:", err);
      // Fail-open contrôlé en développement
      next();
    }
  };
};

