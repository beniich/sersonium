/**
 * Service Backend PayPal REST API (v2 Checkout & Webhooks)
 * Gère l'authentification OAuth 2.0, la création d'ordres, la capture des fonds
 * et la vérification cryptographique des signatures Webhook PayPal.
 */

interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface CreateOrderParams {
  amount: number;
  currency?: string;
  description: string;
  tenantId: string;
  billingCycle?: "monthly" | "yearly";
}

class PayPalService {
  private clientId: string;
  private clientSecret: string;
  private mode: "sandbox" | "live";
  private webhookId: string;
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID || "";
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";
    this.mode = (process.env.PAYPAL_MODE === "live" ? "live" : "sandbox");
    this.webhookId = process.env.PAYPAL_WEBHOOK_ID || "";
  }

  private getBaseUrl(): string {
    return this.mode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
  }

  /**
   * Obtenir un jeton d'accès OAuth 2.0 PayPal avec mise en cache
   */
  public async getAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error("Identifiants PayPal manquants (PAYPAL_CLIENT_ID ou PAYPAL_CLIENT_SECRET).");
    }

    // Réutilisation du token mis en cache s'il est encore valide (> 60s)
    if (this.cachedToken && Date.now() < this.tokenExpiry - 60000) {
      return this.cachedToken;
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    const res = await fetch(`${this.getBaseUrl()}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[PayPal Auth Error]", res.status, errorText);
      throw new Error(`Échec de l'authentification OAuth PayPal (${res.status}): ${errorText}`);
    }

    const data = (await res.json()) as PayPalTokenResponse;
    this.cachedToken = data.access_token;
    this.tokenExpiry = Date.now() + data.expires_in * 1000;

    return this.cachedToken;
  }

  /**
   * Créer un ordre de paiement (PayPal Checkout Orders v2)
   */
  public async createOrder(params: CreateOrderParams) {
    const accessToken = await this.getAccessToken();
    const currency = params.currency || process.env.PAYPAL_CURRENCY || "EUR";

    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `sub_${params.tenantId}_${Date.now()}`,
          description: params.description,
          custom_id: JSON.stringify({
            tenantId: params.tenantId,
            cycle: params.billingCycle || "monthly",
          }),
          amount: {
            currency_code: currency,
            value: params.amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: "SENSORIUM",
        locale: "fr-FR",
        user_action: "PAY_NOW",
        return_url: `${process.env.APP_URL || "http://localhost:3000"}/pricing?status=success`,
        cancel_url: `${process.env.APP_URL || "http://localhost:3000"}/pricing?status=cancelled`,
      },
    };

    const res = await fetch(`${this.getBaseUrl()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[PayPal Create Order Error]", res.status, errorText);
      throw new Error(`Erreur lors de la création de l'ordre PayPal : ${errorText}`);
    }

    return await res.json();
  }

  /**
   * Capturer le paiement d'un ordre PayPal validé par l'utilisateur
   */
  public async captureOrder(orderId: string) {
    const accessToken = await this.getAccessToken();

    const res = await fetch(`${this.getBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[PayPal Capture Order Error]", res.status, errorText);
      throw new Error(`Erreur lors de la capture de l'ordre PayPal (${orderId}) : ${errorText}`);
    }

    return await res.json();
  }

  /**
   * Vérifier la signature d'un Webhook entrant PayPal
   */
  public async verifyWebhookSignature(headers: Record<string, string>, body: any): Promise<boolean> {
    if (!this.webhookId) {
      console.warn("[PayPal Webhook] Aucun PAYPAL_WEBHOOK_ID configuré, signature non vérifiée.");
      return true;
    }

    const accessToken = await this.getAccessToken();

    const verificationPayload = {
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: this.webhookId,
      webhook_event: body,
    };

    const res = await fetch(`${this.getBaseUrl()}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verificationPayload),
    });

    if (!res.ok) {
      console.error("[PayPal Webhook Verification Failed]", res.status);
      return false;
    }

    const result = await res.json();
    return result.verification_status === "SUCCESS";
  }

  /**
   * Retourne la configuration publique pour initialiser les Smart Buttons côté frontend
   */
  public getPublicConfig() {
    return {
      clientId: this.clientId,
      mode: this.mode,
      currency: process.env.PAYPAL_CURRENCY || "EUR",
    };
  }
}

export const paypalService = new PayPalService();
