import { Router } from "express";
import { 
  getPayPalPublicConfig, 
  createSubscriptionOrder, 
  captureSubscriptionOrder, 
  handlePayPalWebhook 
} from "../../controllers/paypal.controller.js";

const router = Router();

// Configuration publique (Client ID, mode, devise pour init SDK)
router.get("/config", getPayPalPublicConfig);

// Création d'un ordre de paiement PayPal
router.post("/create-order", createSubscriptionOrder);

// Capture et confirmation de paiement
router.post("/capture-order", captureSubscriptionOrder);

// Réception du Webhook PayPal
router.post("/webhook", handlePayPalWebhook);

export default router;
