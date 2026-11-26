import { Router } from "express";
import { 
  getPayPalPublicConfig, 
  createSubscriptionOrder, 
  captureSubscriptionOrder, 
  handlePayPalWebhook 
} from "../../controllers/paypal.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";
import { csrfProtection } from "../../middlewares/csrf.middleware.js";

const router = Router();

// Configuration publique (Client ID, mode, devise pour init SDK)
router.get("/config", getPayPalPublicConfig);

// Création d'un ordre de paiement PayPal (authentifié + tenant)
router.post("/create-order", authenticateToken, requireTenant, csrfProtection, createSubscriptionOrder);

// Capture et confirmation de paiement (authentifié + tenant)
router.post("/capture-order", authenticateToken, requireTenant, csrfProtection, captureSubscriptionOrder);

// Réception du Webhook PayPal (asynchrone, validé par signature PayPal)
router.post("/webhook", handlePayPalWebhook);

export default router;
