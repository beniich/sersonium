import { Router } from "express";
import {
  getComplianceOverview,
  upsertCertification,
  upsertPermit,
  upsertInsurance,
  createComplianceItem,
  updateComplianceItem,
  deleteComplianceItem,
  ComplianceController,
  getDoraMetrics,
  getServiceHealth,
} from "../../controllers/compliance.controller.js";
import { authenticateToken, requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();

// ── DORA Resilience Endpoints (public-read, authenticated) ────────────────────
router.get("/dora-metrics", authenticateToken, getDoraMetrics);
router.get("/service-health", authenticateToken, getServiceHealth);

// 1. Récupération globale (par défaut ou par orgId)
router.get("/", authenticateToken, getComplianceOverview);
router.get("/:orgId", authenticateToken, getComplianceOverview);

// 2. Routes de modification (Superadmin / Admin RBAC)
router.post("/certifications", authenticateToken, requireRole("admin"), upsertCertification);
router.post("/permits", authenticateToken, requireRole("admin"), upsertPermit);
router.post("/insurances", authenticateToken, requireRole("admin"), upsertInsurance);

// 3. Handlers CRUD génériques
router.post("/item", authenticateToken, requireRole("admin"), createComplianceItem);
router.put("/item", authenticateToken, requireRole("admin"), updateComplianceItem);
router.delete("/:category/:id", authenticateToken, requireRole("admin"), deleteComplianceItem);

export default router;

