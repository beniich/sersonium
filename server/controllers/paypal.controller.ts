import { Request, Response } from "express";
import { paypalService } from "../services/paypal.service.js";
import { rawPrisma } from "../db/prisma.js";
import {
  sendEnterpriseActivationEmail,
  generateActivationKey,
} from "../services/email.service.js";

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
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ success: false, error: "Contexte d'organisation requis pour initialiser la commande." });
    }

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
    const { orderId, subscriptionId, planId, billingCycle } = req.body;
    const effectiveSubId = subscriptionId || (typeof orderId === "string" && orderId.startsWith("I-") ? orderId : null);
    const effectiveOrderId = !effectiveSubId ? orderId : null;

    if (!effectiveSubId && !effectiveOrderId) {
      return res.status(400).json({ success: false, error: "Identifiant de commande orderId ou subscriptionId requis." });
    }

    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ success: false, error: "Contexte d'organisation requis pour le paiement." });
    }

    let amountVal = 49.0;
    let currency = "EUR";
    let payerEmail = (req as any).user?.email || "client@sensorium.ai";
    let cycle = billingCycle || "monthly";

    // Cas 1 : Abonnement Vault / Smart Subscription PayPal (ID préfixé par I-)
    if (effectiveSubId) {
      const isEnterprise = String(planId || "").toLowerCase().includes("enterprise");
      const targetPlanName = isEnterprise ? "enterprise" : "pro";
      amountVal = isEnterprise ? 499.0 : 49.0;

      const expirationDays = cycle === "yearly" ? 365 : 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);

      // 1. Mettre à jour l'Organisation vers le forfait Pro ou Enterprise avec statut ACTIF
      await rawPrisma.organization.update({
        where: { id: tenantId },
        data: {
          plan: targetPlanName,
          subscriptionStatus: "active",
          subscriptionCycle: cycle,
          subscriptionExpiresAt: expiresAt,
          paypalSubscriptionId: effectiveSubId,
        },
      });

      // 2. Créer ou mettre à jour la ligne Subscription officielle
      const matchedPlan = await rawPrisma.plan.findFirst({
        where: { name: { contains: targetPlanName, mode: "insensitive" } }
      });

      if (matchedPlan) {
        await rawPrisma.subscription.create({
          data: {
            tenantId,
            planId: matchedPlan.id,
            paypalSubscriptionId: effectiveSubId,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: expiresAt,
          }
        }).catch((e) => console.warn("[PayPal] Erreur création Subscription:", e?.message));
      }

      // 3. Créer l'enregistrement de facture officiel certifié
      const invoice = await rawPrisma.invoice.create({
        data: {
          tenantId,
          amount: amountVal,
          currency,
          status: "paid",
          description: `Abonnement SENSORIUM ${targetPlanName.toUpperCase()} (${cycle}) - PayPal Subscription`,
          paypalOrderId: effectiveSubId,
          payerEmail,
          paymentMethod: "paypal",
        },
      });

      // 4. Créditer les jetons (tokens) de l'utilisateur pour l'IA
      const reqUser = (req as any).user;
      if (reqUser?.userId) {
        await rawPrisma.user.update({
          where: { id: reqUser.userId },
          data: { tokens: { increment: isEnterprise ? 50000 : 5000 } }
        }).catch(() => {});
      }

      // 5. Logger dans la piste d'audit
      await rawPrisma.auditLog.create({
        data: {
          tenantId,
          action: "PAYPAL_SUBSCRIPTION_ACTIVE",
          resource: "Invoice",
          resourceId: invoice.id,
          details: JSON.stringify({
            subscriptionId: effectiveSubId,
            amount: amountVal,
            currency,
            payerEmail,
            plan: targetPlanName,
            cycle,
            expiresAt: expiresAt.toISOString(),
          }),
        },
      });

      return res.json({
        success: true,
        data: {
          plan: targetPlanName,
          cycle,
          expiresAt: expiresAt.toISOString(),
          invoiceId: invoice.id,
          subscriptionId: effectiveSubId,
          amount: amountVal,
          currency,
        },
      });
    }

    // Cas 2 : Ordre de commande standard PayPal v2 Orders
    const captureResult = await paypalService.captureOrder(effectiveOrderId!);

    if (captureResult.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        error: `Paiement non complété. Statut PayPal: ${captureResult.status}`,
      });
    }

    // Récupérer les détails de la capture
    const purchaseUnit = captureResult.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    amountVal = parseFloat(capture?.amount?.value || "49.0");
    currency = capture?.amount?.currency_code || "EUR";
    payerEmail = captureResult.payer?.email_address || payerEmail;

    let customData: any = {};
    try {
      if (purchaseUnit?.custom_id) {
        customData = JSON.parse(purchaseUnit.custom_id);
      }
    } catch (e) {
      // Ignorer l'erreur de parse si format texte
    }

    cycle = customData.cycle || billingCycle || "monthly";
    const expirationDays = cycle === "yearly" ? 365 : 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    // 1. Mettre à jour l'Organisation vers le forfait Pro avec statut ACTIF
    await rawPrisma.organization.update({
      where: { id: tenantId },
      data: {
        plan: "pro",
        subscriptionStatus: "active",
        subscriptionCycle: cycle,
        subscriptionExpiresAt: expiresAt,
        paypalSubscriptionId: effectiveOrderId,
      },
    });

    // 2. Créer ou mettre à jour la ligne Subscription officielle
    const proPlan = await rawPrisma.plan.findFirst({
      where: { name: { contains: "Pro", mode: "insensitive" } }
    });

    if (proPlan) {
      await rawPrisma.subscription.create({
        data: {
          tenantId,
          planId: proPlan.id,
          paypalSubscriptionId: effectiveOrderId,
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: expiresAt,
        }
      }).catch((e) => console.warn("[PayPal] Erreur création Subscription:", e?.message));
    }

    // 3. Créer l'enregistrement de facture officiel certifié
    const invoice = await rawPrisma.invoice.create({
      data: {
        tenantId,
        amount: amountVal,
        currency,
        status: "paid",
        description: `Abonnement SENSORIUM PRO (${cycle}) - Capture PayPal`,
        paypalOrderId: effectiveOrderId,
        payerEmail,
        paymentMethod: "paypal",
      },
    });

    // 4. Créditer les jetons (tokens) de l'utilisateur pour l'IA
    const reqUser = (req as any).user;
    if (reqUser?.userId) {
      await rawPrisma.user.update({
        where: { id: reqUser.userId },
        data: { tokens: { increment: 5000 } }
      }).catch(() => {});
    }

    // 5. Logger dans la piste d'audit
    await rawPrisma.auditLog.create({
      data: {
        tenantId,
        action: "PAYPAL_SUBSCRIPTION_ACTIVE",
        resource: "Invoice",
        resourceId: invoice.id,
        details: JSON.stringify({
          orderId: effectiveOrderId,
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
        orderId: effectiveOrderId,
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

    // Traitement des abonnements (Subscriptions)
    if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED" || eventType === "BILLING.SUBSCRIPTION.UPDATED") {
      const resource = event.resource;
      const customId = resource.custom_id;
      const planId = resource.plan_id;
      const status = resource.status; // ACTIVE, SUSPENDED, CANCELLED, EXPIRED
      const subscriptionId = resource.id;

      if (customId) {
        // Déterminer le niveau de plan en fonction du plan_id PayPal officiel
        // P-44Y462991D576054FNKY3PKI = PRO | P-0RJ6785234422590FNKY3NXI = SILVER | P-2PN232575Y225210YNKY3QZQ = ENTERPRISE
        const planLevel = planId === "P-44Y462991D576054FNKY3PKI" ? "pro"
                        : planId === "P-2PN232575Y225210YNKY3QZQ" ? "enterprise"
                        : planId === "P-0RJ6785234422590FNKY3NXI" ? "silver"
                        : "free";
        
        await rawPrisma.organization.update({
          where: { id: customId },
          data: {
            plan: planLevel,
            subscriptionStatus: status.toLowerCase(),
            paypalSubscriptionId: subscriptionId,
            // (optionnel) On pourrait extraire next_billing_time de resource.billing_info
          },
        });
        
        // Log the audit event
        const activationKey = planLevel === "enterprise" ? generateActivationKey() : null;
        await rawPrisma.auditLog.create({
          data: {
            tenantId: customId,
            action: "SUBSCRIPTION_WEBHOOK_ACTIVATED",
            resource: "Organization",
            details: JSON.stringify({ planId, planLevel, status, subscriptionId, activationKey }),
          },
        });

        // 📧 Send Enterprise Sovereign Activation Email
        if (planLevel === "enterprise" && activationKey) {
          try {
            // Find the org admin user to get their email and name
            const adminUser = await rawPrisma.user.findFirst({
              where: { tenantId: customId, role: "admin" },
              select: { email: true, name: true },
            });

            if (adminUser?.email) {
              const orgRecord = await rawPrisma.organization.findUnique({
                where: { id: customId },
                select: { name: true },
              });
              const clientName = adminUser.name || orgRecord?.name || "Enterprise Client";
              // Detect locale from name heuristic (fallback fr)
              const locale: 'fr' | 'en' = 'fr';
              await sendEnterpriseActivationEmail(
                adminUser.email,
                clientName,
                activationKey,
                locale
              );
              console.info(`[PayPal Webhook] 📧 Enterprise activation email sent to ${adminUser.email}`);
            } else {
              console.warn(`[PayPal Webhook] ⚠️ No admin user found for org ${customId} — email skipped.`);
            }
          } catch (emailErr: any) {
            // Non-blocking: log error but don't fail the webhook response
            console.error(`[PayPal Webhook] ❌ Email send failed: ${emailErr.message}`);
          }
        }
      }
    } else if (eventType === "BILLING.SUBSCRIPTION.CANCELLED" || eventType === "BILLING.SUBSCRIPTION.SUSPENDED" || eventType === "BILLING.SUBSCRIPTION.EXPIRED") {
      const resource = event.resource;
      const customId = resource.custom_id;
      if (customId) {
        await rawPrisma.organization.update({
          where: { id: customId },
          data: { 
            plan: "free",
            subscriptionStatus: resource.status.toLowerCase(),
          },
        });
        
        await rawPrisma.auditLog.create({
          data: {
            tenantId: customId,
            action: "SUBSCRIPTION_WEBHOOK_CANCELLED",
            resource: "Organization",
            details: JSON.stringify({ status: resource.status, subscriptionId: resource.id }),
          },
        });
      }
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("[PayPal Webhook Processing Error]", error);
    res.status(500).json({ error: error.message });
  }
}
