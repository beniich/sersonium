/**
 * @file plans.ts
 * @description Source unique de vérité (SSoT) pour les plans d'abonnement SENSORIUM.
 * Importé par PricingPage, SettingsPage, SubscriptionGuard et FeatureUpgradeModal.
 */

export type PlanId = "free" | "silver" | "pro" | "enterprise";

export interface PlanDefinition {
  id: PlanId;
  /** Slug tier interne (lowercase) */
  tier: PlanId;
  /** Slug tier dans useSubscriptionGate (UPPERCASE) */
  tierKey: "FREE" | "STARTER" | "SILVER" | "PRO" | "ENTERPRISE";
  name: string;
  tagline: string;
  price: number; // EUR/mois, 0 = gratuit
  yearlyPrice: number; // EUR/mois si annuel (-20%)
  period: string;
  badgeLabel?: string;
  recommended?: boolean;
  features: string[];
  limitations?: string[];
  badgeColor: string;
  accentColor: string;
  borderClass: string;
  buttonLabel: string;
}

export const PLANS: PlanDefinition[] = [
  {
    id: "free",
    tier: "free",
    tierKey: "FREE",
    name: "Free Trial",
    tagline: "Idéal pour évaluer la plateforme",
    price: 0,
    yearlyPrice: 0,
    period: "par mois",
    badgeLabel: "Gratuit",
    features: [
      "Accès vitrine en lecture seule",
      "10 000 jetons IA / mois",
      "Support communauté (48h)",
      "1 nœud Edge simulé",
    ],
    limitations: ["Pas d'accès Cockpit", "Pas de temps réel Kafka"],
    badgeColor: "text-slate-400",
    accentColor: "#64748b",
    borderClass: "border-slate-500/20",
    buttonLabel: "Commencer gratuitement",
  },
  {
    id: "silver",
    tier: "silver",
    tierKey: "SILVER",
    name: "BIM Foundation",
    tagline: "Pour les pilotes et déploiements PME",
    price: 49,
    yearlyPrice: 39,
    period: "par mois",
    badgeLabel: "Starter",
    features: [
      "1 Jumeau spatial statique",
      "Télémétrie d'énergie basique",
      "100 000 jetons IA / mois",
      "5 nœuds Edge réels",
      "Support e-mail (24h)",
      "Audit logs 7 jours",
    ],
    badgeColor: "text-blue-400",
    accentColor: "#3b82f6",
    borderClass: "border-blue-500/20",
    buttonLabel: "Choisir BIM Foundation",
  },
  {
    id: "pro",
    tier: "pro",
    tierKey: "PRO",
    name: "Hypervision Twin",
    tagline: "Pour les équipes opérationnelles avancées",
    price: 99,
    yearlyPrice: 79,
    period: "par mois",
    badgeLabel: "Le Plus Populaire",
    recommended: true,
    features: [
      "Jumeaux 3D immersifs illimités",
      "Pipeline Kafka temps réel sub-seconde",
      "1 000 000 jetons IA / mois",
      "Rapports ESG CSRD automatisés",
      "ZTNA Zero-Trust Network Access",
      "Alertes prédictives ML",
      "Support prioritaire (4h)",
    ],
    badgeColor: "text-orange-400",
    accentColor: "#f97316",
    borderClass: "border-orange-500/20",
    buttonLabel: "Débloquer Hypervision Pro",
  },
  {
    id: "enterprise",
    tier: "enterprise",
    tierKey: "ENTERPRISE",
    name: "Sovereign Fleet",
    tagline: "Déploiement souverain sur site",
    price: 299,
    yearlyPrice: 239,
    period: "par mois",
    badgeLabel: "Enterprise",
    features: [
      "Appliance souveraine on-premises",
      "HSM chiffrement matériel ZTNA",
      "Jetons IA illimités (100M/mois)",
      "SLA 99.99% + support dédié 24/7",
      "CSRD / DORA / NIS2 compliance",
      "Multi-site fleet management",
      "Custom API + webhooks",
      "Audit forensique illimité",
    ],
    badgeColor: "text-purple-400",
    accentColor: "#a855f7",
    borderClass: "border-purple-500/20",
    buttonLabel: "Déployer Enterprise",
  },
];

export const getPlanById = (id: PlanId): PlanDefinition =>
  PLANS.find((p) => p.id === id) ?? PLANS[0];

export const getPlanByTierKey = (tierKey: string): PlanDefinition =>
  PLANS.find((p) => p.tierKey === tierKey.toUpperCase()) ?? PLANS[0];
