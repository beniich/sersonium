/**
 * @file bridge.routes.ts
 * @description Routes API du Pont d'Accès & d'Abonnement (Gateway Bridge)
 */

import { Router, Request, Response } from "express";
import { SubscriptionBridgeService } from "../../services/subscriptionBridge.service.js";
import { rawPrisma } from "../../db/prisma.js";

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
 * Statut d'accès au cockpit pour un utilisateur
 */
router.get("/subscription-status", async (req: Request, res: Response) => {
  try {
    const uid = req.query.uid as string;
    if (!uid) {
      res.status(400).json({ success: false, error: "Identifiant uid requis" });
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
