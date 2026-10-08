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
import terminalRoutes from "./terminal.routes.js";
import bridgeRoutes from "./bridge.routes.js";
import complianceRoutes from "./compliance.routes.js";
import iotRoutes from "./iot.routes.js";
import masterControlRoutes from "./masterControl.routes.js";
import { apiRateLimiter } from "../../middlewares/rateLimit.middleware.js";
import { csrfProtection } from "../../middlewares/csrf.middleware.js";
import { executeSecurityAction } from "../../controllers/security.controller.js";
import { requireActiveSubscription } from "../../middlewares/subscriptionGate.middleware.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";

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

// Passerelle d'Accès et d'Abonnement (Bridge Gateway: Plans, License Keys, Subscription Status)
router.use("/bridge", bridgeRoutes);

// Passerelle de Paiement et Abonnements PayPal (Ordres, Captures, Webhooks)
router.use("/paypal", paypalRoutes);

// Hardware Terminal Edge Callbacks & Observability (Installation Success & Heartbeat)
router.use("/terminal", terminalRoutes);

// Application du bouclier anti-CSRF sur toutes les routes à modification d'état (POST, PUT, PATCH, DELETE)
router.use(csrfProtection);

// =========================================================================
// COCKPIT PROTECTED ROUTES (Requiert Auth + Tenant + Abonnement Actif)
// Résout la faille du "Saut du Paywall" et assure l'étanchéité complète.
// =========================================================================
const cockpitAccess = [authenticateToken, requireTenant, requireActiveSubscription("STARTER")];

// Carbon Management & Scope Metrics (Multi-Tenant Isolated)
router.use("/carbon", cockpitAccess, carbonRoutes);

// Infrastructure Assets (Powered by crudFactory & RBAC permissions)
router.use("/assets", cockpitAccess, assetRoutes);

// Observability, Metrics & Audit Trail
router.use("/observability", cockpitAccess, observabilityRoutes);

// Sprint 1: Manage (Billing, Jetons & Credits)
router.use("/manage", cockpitAccess, manageRoutes);

// Sprint 1: Zero Trust (Access Policies & Enforcement)
router.use("/zero-trust", cockpitAccess, zeroTrustRoutes);

// Sprint 2: Infrastructure (CAFM & Predictive Maintenance)
router.use("/cafm", cockpitAccess, cafmRoutes);

// Sprint 2: Storage & DB (S3/R2 Presigned URLs & File Metadata)
router.use("/storage", cockpitAccess, storageRoutes);

// Sprint 3: Global Traffic & Edge Network
router.use("/traffic", cockpitAccess, trafficRoutes);

// Sprint 3: Security & WAF
router.use("/security/waf", cockpitAccess, wafRoutes);

// Sprint 4: Compute & AI (Gemini Log Analysis & Diagnostics)
router.use("/ai", cockpitAccess, aiRoutes);

// Sprint 4: Strategy & OKRs
router.use("/strategy", cockpitAccess, strategyRoutes);

// Niveau 3: Sovereign Compliance Registry (Certifications, Permits, Insurances)
router.use("/compliance", cockpitAccess, complianceRoutes);

// Grounding (Google Search & Maps)
router.use("/grounding", cockpitAccess, groundingRoutes);

// IoT Telemetry Stream (Kafka)
router.use("/iot", cockpitAccess, iotRoutes);

// Master Control Panel (Tableau de Bord Exécutif CEO/CTO)
router.use("/master-control", cockpitAccess, masterControlRoutes);

// Security Actions
router.post("/security/action", executeSecurityAction);

export default router;
