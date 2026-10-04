import axios from "axios";
import { rawPrisma } from "../db/prisma.js";

export class PayPalSubscriptionService {
  private readonly PAYPAL_API = process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
  
  private readonly CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
  private readonly CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";

  /**
   * Génère un Token d'accès OAuth2 pour communiquer avec l'API REST PayPal
   */
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`).toString("base64");
    const response = await axios.post(
      `${this.PAYPAL_API}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  }

  /**
   * Gestion automatisée des Webhooks PayPal (Vault & Subscription Lifecycle)
   */
  async handleWebhook(event: any): Promise<void> {
    const eventType = event.event_type;
    const resource = event.resource || {};
    const subscriptionId = resource.id;

    // Récupération de l'identifiant tenant (passé dans custom_id ou purchase_units)
    let tenantId = resource.custom_id;
    if (!tenantId && resource.purchase_units?.[0]?.custom_id) {
      try {
        const parsed = JSON.parse(resource.purchase_units[0].custom_id);
        tenantId = parsed.tenantId;
      } catch {
        tenantId = resource.purchase_units[0].custom_id;
      }
    }

    console.log(`🔔 [PayPal Webhook] Événement reçu: ${eventType} | Tenant: ${tenantId || "N/A"}`);

    if (!tenantId) {
      console.warn("⚠️ [PayPal Webhook] Aucun tenantId trouvé dans la ressource de l'événement.");
      return;
    }

    try {
      switch (eventType) {
        case "BILLING.SUBSCRIPTION.CREATED":
        case "BILLING.SUBSCRIPTION.ACTIVATED":
        case "PAYMENT.CAPTURE.COMPLETED":
          // Activation de la licence PRO
          await rawPrisma.organization.updateMany({
            where: { tenantId },
            data: {
              subscriptionTier: "pro",
            },
          });
          console.log(`✅ [PayPal Webhook] Licence PRO activée pour le Tenant ${tenantId}`);
          break;

        case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
          // Paiement échoué -> Restriction temporaire
          console.warn(`⚠️ [PayPal Webhook] Échec de prélèvement pour le Tenant ${tenantId}`);
          break;

        case "BILLING.SUBSCRIPTION.CANCELLED":
        case "BILLING.SUBSCRIPTION.EXPIRED":
          // Résiliation / Expiration -> Rétrogradation vers le plan gratuit
          await rawPrisma.organization.updateMany({
            where: { tenantId },
            data: {
              subscriptionTier: "free",
            },
          });
          console.log(`ℹ️ [PayPal Webhook] Rétrogradation vers FREE pour le Tenant ${tenantId}`);
          break;

        default:
          console.log(`ℹ️ [PayPal Webhook] Type d'événement non traité spécifiquement: ${eventType}`);
      }
    } catch (err) {
      console.error("[PayPal Webhook Error during DB update]:", err);
      throw err;
    }
  }
}

export const payPalSubscriptionService = new PayPalSubscriptionService();
