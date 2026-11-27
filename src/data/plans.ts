/**
 * @file plans.ts
 * @description Source unique de vérité (SSoT) pour les plans d'abonnement SENSORIUM & Agent Orbit.
 * Compatible à la fois avec PricingPage, SettingsPage, SubscriptionGuard et MultiUsersView.
 */

// ── Types pour l'ancien système ERP ──────────────────────────────────────────
export type PlanId = "free" | "silver" | "pro" | "enterprise";

export interface PlanDefinitionERP {
  id: PlanId;
  tier: PlanId;
  tierKey: "FREE" | "STARTER" | "SILVER" | "PRO" | "ENTERPRISE";
  name: string;
  tagline: string;
  price: number;
  yearlyPrice: number;
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

export const PLANS: PlanDefinitionERP[] = [
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

export const getPlanById = (id: PlanId): PlanDefinitionERP =>
  PLANS.find((p) => p.id === id) ?? PLANS[0];

export const getPlanByTierKey = (tierKey: string): PlanDefinitionERP =>
  PLANS.find((p) => p.tierKey === tierKey.toUpperCase()) ?? PLANS[0];

// ── Types pour le système Agent Orbit / new26_11 ──────────────────────────────
export type PlanCode = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
export type BillingCycle = 'monthly' | 'yearly';

export interface PlanDefinition {
  code: PlanCode;
  displayName: string;
  tierRank: number;
  priceMonthlyEur: number;
  priceYearlyEur: number;
  quotaLimit: number;
  maxUsers: number;
  paypalPlanIdMonthly: string;
  paypalPlanIdYearly: string;
  tagline: string;
  features: string[];
}

export const PLAN_CATALOG: PlanDefinition[] = [
  {
    code: 'FREE',
    displayName: 'Free',
    tierRank: 0,
    priceMonthlyEur: 0,
    priceYearlyEur: 0,
    quotaLimit: 10000,
    maxUsers: 2,
    paypalPlanIdMonthly: 'P-SENSORIUM-FREE-M',
    paypalPlanIdYearly: 'P-SENSORIUM-FREE-Y',
    tagline: 'Discovery & prototypes',
    features: ['10,000 runs / month', 'Up to 2 members', '36 Orbit AI Agents'],
  },
  {
    code: 'STARTER',
    displayName: 'Starter',
    tierRank: 1,
    priceMonthlyEur: 29,
    priceYearlyEur: 290,
    quotaLimit: 25000,
    maxUsers: 5,
    paypalPlanIdMonthly: 'P-SENSORIUM-STARTER-M',
    paypalPlanIdYearly: 'P-SENSORIUM-STARTER-Y',
    tagline: 'Agile teams & workflows',
    features: ['25,000 runs / month', '5 members included', '128 services catalog'],
  },
  {
    code: 'PRO',
    displayName: 'Pro',
    tierRank: 2,
    priceMonthlyEur: 99,
    priceYearlyEur: 990,
    quotaLimit: 100000,
    maxUsers: 25,
    paypalPlanIdMonthly: 'P-SENSORIUM-PRO-M',
    paypalPlanIdYearly: 'P-SENSORIUM-PRO-Y',
    tagline: 'Production & AI automation',
    features: ['100,000 runs / month', '25 members included', 'Priority SLA & IAM Audit'],
  },
  {
    code: 'ENTERPRISE',
    displayName: 'Enterprise',
    tierRank: 3,
    priceMonthlyEur: 299,
    priceYearlyEur: 2990,
    quotaLimit: 500000,
    maxUsers: 200,
    paypalPlanIdMonthly: 'P-SENSORIUM-ENT-M',
    paypalPlanIdYearly: 'P-SENSORIUM-ENT-Y',
    tagline: 'Zero-Trust & dedicated multi-tenant',
    features: ['500,000 runs / month', '200 members included', '100% ZTNA & dedicated support'],
  },
];

export const PLAN_BY_CODE: Record<PlanCode, PlanDefinition> = {
  FREE: PLAN_CATALOG[0],
  STARTER: PLAN_CATALOG[1],
  PRO: PLAN_CATALOG[2],
  ENTERPRISE: PLAN_CATALOG[3],
};

export function normalizePlanCode(input: string | undefined | null): PlanCode {
  const upper = (input ?? '').trim().toUpperCase();
  if (upper === 'ENTERPRISE') return 'ENTERPRISE';
  if (upper === 'PRO' || upper === 'GOLD') return 'PRO';
  if (upper === 'STARTER' || upper === 'SILVER' || upper === 'STAGING') return 'STARTER';
  return 'FREE';
}

export function getPlanAmountEur(code: PlanCode, cycle: BillingCycle): number {
  const plan = PLAN_BY_CODE[code];
  return cycle === 'yearly' ? plan.priceYearlyEur : plan.priceMonthlyEur;
}

export function planCodeToOrgPlanLabel(code: PlanCode): 'Free' | 'Staging' | 'Pro' | 'Enterprise' {
  switch (code) {
    case 'ENTERPRISE':
      return 'Enterprise';
    case 'PRO':
      return 'Pro';
    case 'STARTER':
      return 'Staging';
    case 'FREE':
    default:
      return 'Free';
  }
}
