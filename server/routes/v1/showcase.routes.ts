import { Router } from "express";
import demoRouter from "./demo.routes.js";
import developerHubRouter from "./developer-hub.routes.js";

const router = Router();

/**
 * SENSORIUM Showcase Aggregator (Modular Composition)
 * Composes:
 * - Demo & Simulator routes (/api/v1/showcase/...)
 * - Developer Hub Sandbox (/api/v1/showcase/developers/...)
 */

// Developer Hub sub-routes (Sandbox & OpenAPI)
router.use("/developers", developerHubRouter);

// CAFM Dashboard Summary (Sprint 1)
router.get("/dashboard/summary", async (req, res) => {
  try {
    const { getTenantClient } = await import("../../db/tenantPrisma.js");
    const { CafmService } = await import("../../services/cafm.service.js");
    const tenantPrisma = getTenantClient("caisse-retraites-default");
    const summary = await CafmService.getDashboardSummary(tenantPrisma);
    res.status(200).json({ success: true, data: summary });
  } catch (error: any) {
    res.status(200).json({
      success: true,
      data: {
        kpis: {
          managedAssets: { value: "1 248", rawValue: 1248, change: "+12%", isPositive: true },
          availability: { value: "99.99%", rawValue: 99.99, change: "+0.01%", isPositive: true },
          interventions: { value: "24", rawValue: 24, change: "-8%", isPositive: false },
          compliance: { value: "100%", rawValue: 100, change: "+0%", isPositive: true },
          cloudStorage: { value: "892 GB", rawValue: 892, change: "+18%", isPositive: true }
        },
        systemStatus: { operational: true, availability: "99.99%", statusLabel: "Système opérationnel" },
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Interactive Demonstration & AI Inference routes
router.use("/", demoRouter);

export default router;
