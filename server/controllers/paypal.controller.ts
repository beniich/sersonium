import { Request, Response } from "express";
import { paypalService } from "../services/paypal.service.js";
import { rawPrisma } from "../db/prisma.js";

/**
 * Exposer la configuration publique du client PayPal (Client ID, mode, devise)
 */
export async function getPayPalPublicConfig(req: Request, res: Response) {
  try {
    const config = paypalService.getPublicConfig();
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Créer un ordre de paiement PayPal pour un abonnement Pro (mensuel ou annuel)
 */
export async function createSubscriptionOrder(req: Request, res: Response) {
  try {
    const { cycle = "monthly" } = req.body;
    const tenantId = (req as any).tenantId || "tenant_beecarbonat_global";

    // Tarifs : 49 € / mois ou 499 € / an
    const amount = cycle === "yearly" ? 499.0 : 49.0;
    const description = `SENSORIUM Pro Subscription (${cycle === "yearly" ? "Annuel - 499€" : "Mensuel - 49€"})`;

    const order = await paypalService.createOrder({
      amount,
      description,
      tenantId,
      billingCycle: cycle,
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        status: order.status,
        amount,
        cycle,
      },
    });
  } catch (error: any) {
    console.error("[PayPal Controller Create Order Error]", error);
    res.status(500).json({
      success: false,
      error: error.message || "Impossible d'initier la commande PayPal.",
    });
  }
}

/**
 * Capturer le paiement et mettre à jour l'organisation et la facture dans la base de données
 */
export async function captureSubscriptionOrder(req: Request, res: Response) {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, error: "Identifiant de commande orderId requis." });
    }

    const tenantId = (req as any).tenantId || "tenant_beecarbonat_global";
    const captureResult = await paypalService.captureOrder(orderId);

    if (captureResult.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        error: `Paiement non complété. Statut PayPal: ${captureResult.status}`,
      });
    }

    // Récupérer les détails de la capture
    const purchaseUnit = captureResult.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    const amountVal = parseFloat(capture?.amount?.value || "49.0");
    const currency = capture?.amount?.currency_code || "EUR";
    const payerEmail = captureResult.payer?.email_address || "client@sensorium.ai";

    let customData: any = {};
    try {
      if (purchaseUnit?.custom_id) {
        customData = JSON.parse(purchaseUnit.custom_id);
      }
    } catch (e) {
      // Ignorer l'erreur de parse si format texte
    }

    const cycle = customData.cycle || "monthly";
    const expirationDays = cycle === "yearly" ? 365 : 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    // 1. Mettre à jour l'Organisation vers le forfait Pro
    await rawPrisma.organization.update({
      where: { id: tenantId },
      data: {
        plan: "pro",
        subscriptionCycle: cycle,
        subscriptionExpiresAt: expiresAt,
        paypalSubscriptionId: orderId,
      },
    });

    // 2. Créer l'enregistrement de facture officiel certifié
    const invoice = await rawPrisma.invoice.create({
      data: {
        tenantId,
        amount: amountVal,
        currency,
        status: "paid",
        description: `Abonnement SENSORIUM PRO (${cycle}) - Capture PayPal`,
        paypalOrderId: orderId,
        payerEmail,
        paymentMethod: "paypal",
      },
    });

    // 3. Logger dans la piste d'audit
    await rawPrisma.auditLog.create({
      data: {
        tenantId,
        action: "PAYPAL_SUBSCRIPTION_ACTIVE",
        resource: "Invoice",
        resourceId: invoice.id,
        details: JSON.stringify({
          orderId,
          amount: amountVal,
          currency,
          payerEmail,
          plan: "pro",
          cycle,
          expiresAt: expiresAt.toISOString(),
        }),
      },
    });

    res.json({
      success: true,
      data: {
        plan: "pro",
        cycle,
        expiresAt: expiresAt.toISOString(),
        invoiceId: invoice.id,
        orderId,
        amount: amountVal,
        currency,
      },
    });
  } catch (error: any) {
    console.error("[PayPal Controller Capture Order Error]", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erreur lors de la capture de l'ordre PayPal.",
    });
  }
}

/**
 * Traiter les événements asynchrones PayPal Webhook
 */
export async function handlePayPalWebhook(req: Request, res: Response) {
  try {
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") {
        headers[key] = value;
      }
    }

    const isValid = await paypalService.verifyWebhookSignature(headers, req.body);
    if (!isValid) {
      console.warn("[PayPal Webhook] Signature invalide rejetée.");
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;
    const eventType = event.event_type;
    console.log(`[PayPal Webhook] Événement reçu : ${eventType} (${event.id})`);

    // Traitement des renouvellements automatiques ou annulations
    if (eventType === "PAYMENT.CAPTURE.COMPLETED" || eventType === "PAYMENT.SALE.COMPLETED") {
      const resource = event.resource;
      const customId = resource.custom_id;
      if (customId) {
        try {
          const parsed = JSON.parse(customId);
          if (parsed.tenantId) {
            const nextExpires = new Date();
            nextExpires.setDate(nextExpires.getDate() + (parsed.cycle === "yearly" ? 365 : 30));

            await rawPrisma.organization.update({
              where: { id: parsed.tenantId },
              data: {
                plan: "pro",
                subscriptionExpiresAt: nextExpires,
              },
            });
          }
        } catch (e) {
          // Format custom id non-json
        }
      }
    } else if (eventType === "BILLING.SUBSCRIPTION.CANCELLED" || eventType === "BILLING.SUBSCRIPTION.SUSPENDED") {
      const resource = event.resource;
      const customId = resource.custom_id;
      if (customId) {
        try {
          const parsed = JSON.parse(customId);
          if (parsed.tenantId) {
            await rawPrisma.organization.update({
              where: { id: parsed.tenantId },
              data: { plan: "lite" },
            });
          }
        } catch (e) {
          // ignore
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("[PayPal Webhook Processing Error]", error);
    res.status(500).json({ error: error.message });
  }
}
