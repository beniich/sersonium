/**
 * SENSORIUM CAFM PRO — Service de Gestion du Pass Découverte 10 Jours
 * Octroie un accès illimité de 10 jours à l'intégralité des services Enterprise :
 * - Cockpit 3D & Digital Twin
 * - 36 Agents IA Orbit & Swarm
 * - GMAO & CAFM Intégral
 * - Télémétrie Kafka Temps Réel & Observabilité
 * - Cybersécurité OT, ZTNA & Conformité DORA
 */

export interface TrialStatus {
  isTrialActive: boolean;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  expiresAt: string | null;
  formattedTime: string;
  percentRemaining: number;
}

const TRIAL_KEY = 'sensorium_trial_expires_at';
const TIER_KEY = 'sensorium_subscription_tier';
const USER_TIER_KEY = 'sensorium_user_tier';
const TRIAL_ACTIVATED_KEY = 'sensorium_trial_activated_at';
const TRIAL_DURATION_DAYS = 10;
const TOTAL_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

export class TrialService {
  /**
   * Active instantanément le Pass Gratuit 10 Jours avec accès ENTERPRISE illimité
   */
  public static activate10DayFreeTrial(): { expiresAt: string; daysLeft: number } {
    const expiresAt = new Date(Date.now() + TOTAL_MS).toISOString();
    const activatedAt = new Date().toISOString();

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TRIAL_KEY, expiresAt);
      localStorage.setItem(TRIAL_ACTIVATED_KEY, activatedAt);
      localStorage.setItem(TIER_KEY, 'enterprise');
      localStorage.setItem(USER_TIER_KEY, 'enterprise');
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('sensorium:subscription_changed', {
          detail: {
            tier: 'enterprise',
            planName: 'Pass Découverte 10 Jours (Tous Services Débloqués)',
            expiresAt,
          },
        })
      );
      window.dispatchEvent(new CustomEvent('sensorium:quota_updated', { detail: { tier: 'enterprise' } }));
      window.dispatchEvent(new CustomEvent('sensorium:trial_updated', { detail: { expiresAt } }));
    }

    return { expiresAt, daysLeft: TRIAL_DURATION_DAYS };
  }

  /**
   * Calcule le statut en temps réel du Pass Découverte
   */
  public static getTrialStatus(): TrialStatus {
    if (typeof localStorage === 'undefined') {
      return {
        isTrialActive: false,
        daysLeft: 0,
        hoursLeft: 0,
        minutesLeft: 0,
        expiresAt: null,
        formattedTime: 'Inactif',
        percentRemaining: 0,
      };
    }

    const expiresStr = localStorage.getItem(TRIAL_KEY);
    if (!expiresStr) {
      return {
        isTrialActive: false,
        daysLeft: 0,
        hoursLeft: 0,
        minutesLeft: 0,
        expiresAt: null,
        formattedTime: 'Non activé',
        percentRemaining: 0,
      };
    }

    const expiresTime = new Date(expiresStr).getTime();
    const diff = expiresTime - Date.now();

    if (diff <= 0) {
      return {
        isTrialActive: false,
        daysLeft: 0,
        hoursLeft: 0,
        minutesLeft: 0,
        expiresAt: expiresStr,
        formattedTime: 'Expiré',
        percentRemaining: 0,
      };
    }

    const daysLeft = Math.floor(diff / (24 * 3600 * 1000));
    const hoursLeft = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
    const minutesLeft = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    const percentRemaining = Math.max(0, Math.min(100, Math.round((diff / TOTAL_MS) * 100)));

    let formattedTime = `${daysLeft}j ${hoursLeft}h restants`;
    if (daysLeft === 0) {
      formattedTime = `${hoursLeft}h ${minutesLeft}m restants`;
    }

    return {
      isTrialActive: true,
      daysLeft,
      hoursLeft,
      minutesLeft,
      expiresAt: expiresStr,
      formattedTime,
      percentRemaining,
    };
  }

  /**
   * Vérifie si le pass 10 jours est actif
   */
  public static hasActiveTrial(): boolean {
    return this.getTrialStatus().isTrialActive;
  }
}

export default TrialService;

