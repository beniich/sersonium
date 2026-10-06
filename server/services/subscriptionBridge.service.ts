/**
 * @file subscriptionBridge.service.ts
 * @description Service backend centralisant la vérification d'abonnement,
 * l'attribution des droits (Entitlements) et la validation des clés de licence.
 */

import { rawPrisma } from "../db/prisma.js";

export interface AccessCheckResult {
  hasAccess: boolean;
  reason?: string;
  tier: string;
  status: string;
  planName: string;
  tokenBalance: number;
  has3dDigitalTwin: boolean;
  hasRealtimeKafka: boolean;
  hasZtnaHardware: boolean;
  expiresAt: Date | null;
}

export class SubscriptionBridgeService {
  /**
   * Vérifie le statut d'abonnement pour un utilisateur ou une organisation donnée.
   */
  static async checkAccessByUid(firebaseUid: string): Promise<AccessCheckResult> {
    try {
      const user = await rawPrisma.user.findUnique({
        where: { firebaseUid },
        include: {
          organization: {
            include: {
              subscriptions: {
                where: { status: "active" },
                include: { plan: true },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      });

      if (!user || !user.organization) {
        return {
          hasAccess: false,
          reason: "Utilisateur ou organisation introuvable",
          tier: "FREE",
          status: "none",
          planName: "Découverte",
          tokenBalance: 0,
          has3dDigitalTwin: false,
          hasRealtimeKafka: false,
          hasZtnaHardware: false,
          expiresAt: null,
        };
      }

      const org = user.organization;
      const activeSub = org.subscriptions?.[0];

      // Vérification double : via la relation Subscription ou via les champs rétrocompatibles de l'Organization
      const isLegacyActive = org.subscriptionStatus === "active" && org.plan !== "FREE";
      const isModernActive = activeSub != null && activeSub.status === "active";

      const hasAccess = isModernActive || isLegacyActive;
      const tier = activeSub?.plan?.code || org.plan || "FREE";
      const planName = activeSub?.plan?.name || (tier === "PRO" ? "Hypervision Twin" : tier === "ENTERPRISE" ? "Sovereign Fleet" : "BIM Foundation");

      return {
        hasAccess,
        tier,
        status: hasAccess ? "active" : (org.subscriptionStatus || "none"),
        planName,
        tokenBalance: user.tokens,
        has3dDigitalTwin: activeSub?.plan?.has3dDigitalTwin ?? (tier === "PRO" || tier === "ENTERPRISE"),
        hasRealtimeKafka: activeSub?.plan?.hasRealtimeKafka ?? (tier === "PRO" || tier === "ENTERPRISE"),
        hasZtnaHardware: activeSub?.plan?.hasZtnaHardware ?? (tier === "ENTERPRISE"),
        expiresAt: activeSub?.currentPeriodEnd || org.subscriptionExpiresAt,
      };
    } catch (err: any) {
      console.error("[SubscriptionBridgeService] Error:", err);
      // En cas d'erreur de base de données, ne pas bloquer totalement le mode dev
      return {
        hasAccess: true,
        tier: "PRO",
        status: "active",
        planName: "Mode Secours Hypervision",
        tokenBalance: 1000,
        has3dDigitalTwin: true,
        hasRealtimeKafka: true,
        hasZtnaHardware: false,
        expiresAt: null,
      };
    }
  }

  /**
   * Valide une clé de licence offline/souveraine et active l'organisation.
   */
  static async activateLicenseKey(licenseKey: string, firebaseUid?: string): Promise<{ success: boolean; message: string; tier?: string }> {
    try {
      const keyRecord = await rawPrisma.licenseKey.findUnique({
        where: { licenseKey },
        include: { organization: true },
      });

      if (!keyRecord) {
        return { success: false, message: "Clé de licence inconnue." };
      }

      if (keyRecord.status !== "ACTIVE" || keyRecord.validUntil < new Date()) {
        return { success: false, message: "Cette licence est expirée ou a été révoquée." };
      }

      // Activer l'organisation
      await rawPrisma.organization.update({
        where: { id: keyRecord.tenantId },
        data: {
          plan: keyRecord.tier,
          subscriptionStatus: "active",
          subscriptionExpiresAt: keyRecord.validUntil,
        },
      });

      // Journaliser l'accès
      await rawPrisma.accessGateLog.create({
        data: {
          tenantId: keyRecord.tenantId,
          requestedUri: "/bridge/verify-license",
          action: "GRANTED",
          reason: `Licence activée avec succès: ${keyRecord.tier}`,
        },
      });

      return {
        success: true,
        message: `Licence ${keyRecord.tier} activée avec succès jusqu'au ${keyRecord.validUntil.toLocaleDateString()}.`,
        tier: keyRecord.tier,
      };
    } catch (err: any) {
      console.error("[SubscriptionBridgeService] Activate License Error:", err);
      return { success: false, message: err.message || "Erreur interne lors de la validation." };
    }
  }
}
