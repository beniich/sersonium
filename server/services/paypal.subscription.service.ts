import axios from "axios";
import { rawPrisma } from "../db/prisma.js";

export class PayPalSubscriptionService {
  private readonly PAYPAL_API = process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  private readonly CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
  private readonly CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
  private readonly WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || "";

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
   * Vérifie la signature du webhook via l'API officielle PayPal.
   * Référence: https://developer.paypal.com/api/webhooks/v1/#verify-webhook-signature_post
   *
   * NE PAS implémenter de vérification HMAC maison — PayPal utilise un protocole
   * X.509/CRL spécifique fourni uniquement via cette API.
   *
   * @returns true si la signature est valide, false sinon
   */
  async verifyWebhookSignature(
    rawBody: string,
    headers: {
      "paypal-transmission-id": string;
      "paypal-transmission-time": string;
      "paypal-cert-url": string;
      "paypal-auth-algo": string;
      "paypal-transmission-sig": string;
    }
  ): Promise<boolean> {
    if (!this.WEBHOOK_ID) {
      console.warn("[PayPal] ⚠️ PAYPAL_WEBHOOK_ID non configuré — vérification désactivée.");
      // Autoriser seulement en sandbox, refuser en production
      return process.env.PAYPAL_MODE !== "live";
    }

    try {
      const accessToken = await this.getAccessToken();
      const verifyPayload = {
        auth_algo: headers["paypal-auth-algo"],
        cert_url: headers["paypal-cert-url"],
        transmission_id: headers["paypal-transmission-id"],
        transmission_sig: headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id: this.WEBHOOK_ID,
        webhook_event: JSON.parse(rawBody),
      };

      const response = await axios.post(
        `${this.PAYPAL_API}/v1/notifications/verify-webhook-signature`,
        verifyPayload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const verificationStatus = response.data?.verification_status;
      if (verificationStatus !== "SUCCESS") {
        console.error(`[PayPal] ❌ Signature invalide — status: ${verificationStatus}`);
        return false;
      }

      return true;
    } catch (err: any) {
      console.error("[PayPal] ❌ Erreur lors de la vérification de la signature:", err?.message || err);
      return false;
    }
  }

  /**
   * Gestion idempotente des Webhooks PayPal (Vault & Subscription Lifecycle).
   * L'événement est ignoré s'il a déjà été traité (protection contre les replay attacks).
   * IMPORTANT : La signature DOIT être vérifiée via verifyWebhookSignature() AVANT d'appeler cette méthode.
   */
  async handleWebhook(event: any): Promise<void> {
    const eventId: string | undefined = event.id;
    const eventType: string = event.event_type;
    const resource = event.resource || {};

    // ── Idempotence : ignorer les doublons (replay attack ou double-livraison Kafka) ──
    if (eventId) {
      try {
        const existing = await rawPrisma.$queryRaw<{ eventId: string }[]>`
          SELECT "eventId" FROM "ProcessedWebhookEvent" WHERE "eventId" = ${eventId} LIMIT 1
        `;
        if (existing && existing.length > 0) {
          console.log(`[PayPal] ♻️ Événement déjà traité (idempotent skip): ${eventId}`);
          return;
        }
        // Enregistrer atomiquement l'événement avant traitement
        await rawPrisma.$executeRaw`
          INSERT INTO "ProcessedWebhookEvent" ("eventId", "eventType", "processedAt")
          VALUES (${eventId}, ${eventType}, NOW())
          ON CONFLICT ("eventId") DO NOTHING
        `;
      } catch {
        // Table non encore créée (migration non appliquée) — continuer sans idempotence
        console.warn("[PayPal] ⚠️ Table ProcessedWebhookEvent manquante — idempotence désactivée.");
      }
    }

    // Récupération de l'identifiant tenant (custom_id ou purchase_units)
    let tenantId: string | undefined = resource.custom_id;
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
      console.warn("⚠️ [PayPal Webhook] Aucun tenantId trouvé dans l'événement — traitement ignoré.");
      return;
    }

    try {
      switch (eventType) {
        case "BILLING.SUBSCRIPTION.CREATED":
        case "BILLING.SUBSCRIPTION.ACTIVATED":
        case "PAYMENT.CAPTURE.COMPLETED":
          // Activation de la licence PRO — uniquement après signature vérifiée
          await rawPrisma.organization.updateMany({
            where: { tenantId },
            data: { subscriptionTier: "pro" },
          });
          console.log(`✅ [PayPal Webhook] Licence PRO activée pour le Tenant ${tenantId}`);
          break;

        case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
          console.warn(`⚠️ [PayPal Webhook] Échec de prélèvement pour le Tenant ${tenantId}`);
          break;

        case "BILLING.SUBSCRIPTION.CANCELLED":
        case "BILLING.SUBSCRIPTION.EXPIRED":
          // Rétrogradation vers le plan gratuit
          await rawPrisma.organization.updateMany({
            where: { tenantId },
            data: { subscriptionTier: "free" },
          });
          console.log(`ℹ️ [PayPal Webhook] Rétrogradation vers FREE pour le Tenant ${tenantId}`);
          break;

        default:
          console.log(`ℹ️ [PayPal Webhook] Type d'événement non traité: ${eventType}`);
      }
    } catch (err) {
      console.error("[PayPal Webhook Error during DB update]:", err);
      throw err;
    }
  }
}

export const payPalSubscriptionService = new PayPalSubscriptionService();
