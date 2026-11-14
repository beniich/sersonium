/**
 * @file bridge.routes.ts
 * @description Routes API du Pont d'Accès & d'Abonnement (Gateway Bridge)
 */

import { Router, Request, Response } from "express";
import { SubscriptionBridgeService } from "../../services/subscriptionBridge.service.js";
import { rawPrisma } from "../../db/prisma.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { AuthenticatedRequest } from "../../types/auth.js";

const router = Router();

/**
 * GET /api/v1/bridge/plans
 * Liste des forfaits disponibles pour l'accès au Cockpit
 */
router.get("/plans", async (_req: Request, res: Response) => {
  try {
    const plans = await rawPrisma.plan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: "asc" },
    });

    if (plans.length > 0) {
      res.json({ success: true, data: plans });
      return;
    }

    // Plans par défaut si la table n'a pas encore été migrée
    res.json({
      success: true,
      data: [
        {
          code: "STARTER",
          name: "BIM Foundation",
          priceMonthly: 49,
          priceYearly: 490,
          currency: "EUR",
          maxAssets: 5,
          maxUsers: 2,
          has3dDigitalTwin: false,
          hasRealtimeKafka: false,
        },
        {
          code: "PRO",
          name: "Hypervision Twin",
          priceMonthly: 99,
          priceYearly: 990,
          currency: "EUR",
          maxAssets: 25,
          maxUsers: 10,
          has3dDigitalTwin: true,
          hasRealtimeKafka: true,
        },
        {
          code: "ENTERPRISE",
          name: "Sovereign Fleet",
          priceMonthly: 299,
          priceYearly: 2990,
          currency: "EUR",
          maxAssets: -1,
          maxUsers: -1,
          has3dDigitalTwin: true,
          hasRealtimeKafka: true,
          hasZtnaHardware: true,
        },
      ],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/bridge/subscription-status
 * Statut d'accès au cockpit pour un utilisateur authentifié
 * Vérification stricte du Jeton de session / Bearer Token
 */
router.get("/subscription-status", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = (req.query.uid as string) || req.user?.firebaseUid || req.user?.userId || req.user?.email;
    if (!uid) {
      res.status(400).json({ success: false, error: "Identifiant uid ou session requis" });
      return;
    }

    // Sécurité : un utilisateur standard ne peut sonder que son propre statut
    const currentUserId = req.user?.userId;
    const currentEmail = req.user?.email;
    const currentFirebaseUid = req.user?.firebaseUid;
    const isAdmin = req.user?.role === "admin";

    if (!isAdmin && uid !== currentUserId && uid !== currentEmail && uid !== currentFirebaseUid) {
      res.status(403).json({
        success: false,
        error: "Accès refusé : Impossible de consulter le statut d'un compte tiers."
      });
      return;
    }

    const access = await SubscriptionBridgeService.checkAccessByUid(uid);
    res.json({ success: true, data: access });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/bridge/verify-license
 * Activation d'une clé de licence matérielle ou souveraine
 */
router.post("/verify-license", async (req: Request, res: Response) => {
  try {
    const { licenseKey, uid } = req.body;
    if (!licenseKey) {
      res.status(400).json({ success: false, error: "Clé de licence licenseKey requise" });
      return;
    }

    const result = await SubscriptionBridgeService.activateLicenseKey(licenseKey, uid);
    if (!result.success) {
      res.status(400).json({ success: false, error: result.message });
      return;
    }

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
