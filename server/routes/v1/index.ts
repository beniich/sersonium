import { Router } from "express";
import authRoutes from "./auth.routes.js";
import carbonRoutes from "./carbon.routes.js";
import assetRoutes from "./asset.routes.js";
import observabilityRoutes from "./observability.routes.js";
import manageRoutes from "./manage.routes.js";
import zeroTrustRoutes from "./zeroTrust.routes.js";
import cafmRoutes from "./cafm.routes.js";
import storageRoutes from "./storage.routes.js";
import trafficRoutes from "./traffic.routes.js";
import wafRoutes from "./waf.routes.js";
import aiRoutes from "./ai.routes.js";
import strategyRoutes from "./strategy.routes.js";
import groundingRoutes from "./grounding.routes.js";
import showcaseRoutes from "./showcase.routes.js";
import paypalRoutes from "./paypal.routes.js";
import { apiRateLimiter } from "../../middlewares/rateLimit.middleware.js";
import { csrfProtection } from "../../middlewares/csrf.middleware.js";
import { executeSecurityAction } from "../../controllers/security.controller.js";

const router = Router();

// Rate limiter par défaut sur l'ensemble de l'arbre d'API V1
router.use(apiRateLimiter);

// Health Check
router.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Authentication & Session Management (JWT + HttpOnly Refresh Token + CSRF Token distribution)
router.use("/auth", authRoutes);

// Public Showcase Sandbox Endpoints (AI Inference & Worker Execution)
router.use("/showcase", showcaseRoutes);

// Passerelle de Paiement et Abonnements PayPal (Ordres, Captures, Webhooks)
router.use("/paypal", paypalRoutes);

// Application du bouclier anti-CSRF sur toutes les routes à modification d'état (POST, PUT, PATCH, DELETE)
router.use(csrfProtection);

// Carbon Management & Scope Metrics (Multi-Tenant Isolated)
router.use("/carbon", carbonRoutes);

// Infrastructure Assets (Powered by crudFactory & RBAC permissions)
router.use("/assets", assetRoutes);

// Observability, Metrics & Audit Trail
router.use("/observability", observabilityRoutes);

// Sprint 1: Manage (Billing, Jetons & Credits)
router.use("/manage", manageRoutes);

// Sprint 1: Zero Trust (Access Policies & Enforcement)
router.use("/zero-trust", zeroTrustRoutes);

// Sprint 2: Infrastructure (CAFM & Predictive Maintenance)
router.use("/cafm", cafmRoutes);

// Sprint 2: Storage & DB (S3/R2 Presigned URLs & File Metadata)
router.use("/storage", storageRoutes);

// Sprint 3: Global Traffic & Edge Network
router.use("/traffic", trafficRoutes);

// Sprint 3: Security & WAF
router.use("/security/waf", wafRoutes);

// Sprint 4: Compute & AI (Gemini Log Analysis & Diagnostics)
router.use("/ai", aiRoutes);

// Sprint 4: Strategy & OKRs
router.use("/strategy", strategyRoutes);

// Grounding (Google Search & Maps)
router.use("/grounding", groundingRoutes);

// Security Actions
router.post("/security/action", executeSecurityAction);

export default router;
