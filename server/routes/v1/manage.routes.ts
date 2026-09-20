import { Router } from "express";
import { 
  getBillingSummary, 
  consumeTokens, 
  creditTokens 
} from "../../controllers/billing.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { consumeTokensSchema, creditTokensSchema } from "../../schemas/manage.schema.js";

const router = Router();

// Toutes les routes Manage sont hermétiquement multi-tenant
router.use(authenticateToken, requireTenant);

// Consultation du solde et factures
router.get("/billing/summary", getBillingSummary);

// Déduction de jetons (ex: inférence IA, export rapport)
router.post("/billing/tokens/consume", validateRequest({ body: consumeTokensSchema }), consumeTokens);

// Recharge de jetons
router.post("/billing/tokens/credit", validateRequest({ body: creditTokensSchema }), creditTokens);

export default router;
