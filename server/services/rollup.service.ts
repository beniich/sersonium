/**
 * SENSORIUM — Rollup Service (Agrégation Temporelle & Pyramide de Données)
 * Compresse les métriques brutes haute fréquence en fenêtres MINUTE, HOUR, DAY
 * et purge les données brutes au-delà de la politique de rétention (7 jours).
 */

import { rawPrisma as prisma } from "../db/prisma.js";

export type RollupInterval = "MINUTE" | "HOUR" | "DAY";

export class RollupService {
  /**
   * Agrège les données brutes (AssetTelemetry) vers l'intervalle spécifié
   */
  static async aggregate(interval: RollupInterval): Promise<{ aggregatedCount: number; interval: RollupInterval }> {
    const now = new Date();
    let startTime: Date;

    if (interval === "MINUTE") {
      // Dernière minute pleine
      startTime = new Date(now.getTime() - 60 * 1000);
      startTime.setSeconds(0, 0);
    } else if (interval === "HOUR") {
      // Dernière heure pleine
      startTime = new Date(now.getTime() - 60 * 60 * 1000);
      startTime.setMinutes(0, 0, 0);
    } else {
      // Dernier jour plein
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      startTime.setHours(0, 0, 0, 0);
    }

    try {
      // Regroupement par tenantId et assetId sur la fenêtre temporelle
      const aggregations = await (prisma as any).assetTelemetry.groupBy({
        by: ["tenantId", "assetId"],
        where: {
          timestamp: { gte: startTime }
        },
        _avg: { temperatureC: true, vibrationMmS: true, powerKw: true, pueScore: true },
        _max: { temperatureC: true, vibrationMmS: true, powerKw: true, pueScore: true },
        _min: { temperatureC: true, vibrationMmS: true, powerKw: true, pueScore: true },
        _count: { id: true },
      });

      if (aggregations.length === 0) {
        return { aggregatedCount: 0, interval };
      }

      // Préparation de l'insertion dans la table rollup pour les capteurs d'énergie
      const rollupData = aggregations.map((agg: any) => ({
        tenantId: agg.tenantId,
        sensorId: agg.assetId,
        interval,
        timestamp: startTime,
        avgValue: agg._avg.powerKw ?? agg._avg.temperatureC ?? 0,
        maxValue: agg._max.powerKw ?? agg._max.temperatureC ?? 0,
        minValue: agg._min.powerKw ?? agg._min.temperatureC ?? 0,
        count: agg._count.id ?? 1,
      }));

      await (prisma as any).telemetryRollup.createMany({
        data: rollupData
      });

      console.log(`[Rollup Service] ✅ Rollup ${interval} calculé: ${rollupData.length} capteurs agrégés.`);
      return { aggregatedCount: rollupData.length, interval };
    } catch (err: any) {
      console.error(`[Rollup Service] ❌ Erreur calcul rollup ${interval}:`, err?.message || err);
      return { aggregatedCount: 0, interval };
    }
  }

  /**
   * Sélecteur de données intelligent (Pyramide de Précision)
   * Adapte la source interrogée selon l'horizon temporel demandé :
   * - <= 1 jour : Données brutes (précision maximale)
   * - <= 30 jours : Rollup MINUTE / HOUR (équilibre parfait)
   * - > 30 jours (jusqu'à 5 ans) : Rollup DAY (ultra-rapide, 365 lignes/an)
   */
  static async getHistory(tenantId: string, sensorId: string, rangeDays: number) {
    if (rangeDays <= 1) {
      // Moins de 24h -> Données brutes haute fidélité
      return (prisma as any).assetTelemetry.findMany({
        where: {
          tenantId,
          assetId: sensorId,
          timestamp: { gte: new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000) }
        },
        orderBy: { timestamp: "asc" },
        take: 2000
      });
    }

    if (rangeDays <= 30) {
      // Entre 1 et 30 jours -> Rollup MINUTE ou HOUR
      const interval: RollupInterval = rangeDays <= 7 ? "MINUTE" : "HOUR";
      return (prisma as any).telemetryRollup.findMany({
        where: {
          tenantId,
          sensorId,
          interval,
          timestamp: { gte: new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000) }
        },
        orderBy: { timestamp: "asc" },
        take: 2000
      });
    }

    // Plus de 30 jours (Vue annuelle/pluriannuelle) -> Rollup DAY (quelques centaines de lignes)
    return (prisma as any).telemetryRollup.findMany({
      where: {
        tenantId,
        sensorId,
        interval: "DAY",
        timestamp: { gte: new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000) }
      },
      orderBy: { timestamp: "asc" },
      take: 2000
    });
  }

  /**
   * Nettoyage automatique des données brutes selon la politique de rétention (7 jours)
   */
  static async cleanupRawData(retentionDays: number = 7): Promise<number> {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    try {
      const deleted = await (prisma as any).assetTelemetry.deleteMany({
        where: { timestamp: { lt: cutoff } }
      });
      console.log(`[Rollup Service] 🧹 Nettoyage rétention : ${deleted.count} enregistrements bruts purgés (> ${retentionDays}j).`);
      return deleted.count;
    } catch (err: any) {
      console.error("[Rollup Service] ❌ Erreur nettoyage rétention:", err?.message || err);
      return 0;
    }
  }
}
