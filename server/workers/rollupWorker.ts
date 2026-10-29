/**
 * SENSORIUM — Rollup Worker (Planificateur Cron d'Agrégation Télémétriques)
 * 
 * Exécute la compression de données en arrière-plan selon 3 fréquences :
 *  - MINUTE : toutes les minutes (fenêtre glissante 1min)
 *  - HOUR   : toutes les heures  (fenêtre glissante 1h)
 *  - DAY    : chaque jour à minuit (fenêtre 24h)
 * 
 * + Purge automatique des données brutes > 7 jours (politique de rétention).
 */

import cron from 'node-cron';
import { RollupService } from '../services/rollup.service.js';

let isWorkerRunning = false;

export function startRollupWorker() {
  if (isWorkerRunning) {
    console.warn('[RollupWorker] ⚠️ Worker déjà actif, démarrage ignoré.');
    return;
  }
  isWorkerRunning = true;
  console.log('[RollupWorker] 🚀 Démarrage du planificateur d\'agrégation télémétriques...');

  // ── Rollup MINUTE : toutes les minutes ─────────────────────────────────────
  cron.schedule('* * * * *', async () => {
    try {
      const result = await RollupService.aggregate('MINUTE');
      if (result.aggregatedCount > 0) {
        console.log(`[RollupWorker] ✅ Rollup MINUTE: ${result.aggregatedCount} capteurs agrégés.`);
      }
    } catch (err: any) {
      console.error('[RollupWorker] ❌ Erreur Rollup MINUTE:', err?.message || err);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  // ── Rollup HOUR : toutes les heures, à la minute 0 ─────────────────────────
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await RollupService.aggregate('HOUR');
      console.log(`[RollupWorker] ✅ Rollup HOUR: ${result.aggregatedCount} capteurs agrégés.`);
    } catch (err: any) {
      console.error('[RollupWorker] ❌ Erreur Rollup HOUR:', err?.message || err);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  // ── Rollup DAY : chaque jour à minuit UTC ───────────────────────────────────
  cron.schedule('0 0 * * *', async () => {
    try {
      const result = await RollupService.aggregate('DAY');
      console.log(`[RollupWorker] ✅ Rollup DAY: ${result.aggregatedCount} capteurs agrégés.`);
    } catch (err: any) {
      console.error('[RollupWorker] ❌ Erreur Rollup DAY:', err?.message || err);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  // ── Purge rétention 7 jours : chaque jour à 01h00 UTC ──────────────────────
  cron.schedule('0 1 * * *', async () => {
    try {
      const deleted = await RollupService.cleanupRawData(7);
      console.log(`[RollupWorker] 🧹 Purge rétention: ${deleted} enregistrements bruts supprimés (>7j).`);
    } catch (err: any) {
      console.error('[RollupWorker] ❌ Erreur purge rétention:', err?.message || err);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  console.log('[RollupWorker] 📅 Planificateurs actifs:');
  console.log('  • Rollup MINUTE : toutes les minutes');
  console.log('  • Rollup HOUR   : toutes les heures (xx:00 UTC)');
  console.log('  • Rollup DAY    : chaque jour à 00:00 UTC');
  console.log('  • Purge données : chaque jour à 01:00 UTC (rétention 7j)');
}
