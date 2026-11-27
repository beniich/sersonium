import type { BillingCycle, PlanCode } from './plans.ts';

export type OrgPlan = 'Enterprise' | 'Pro' | 'Staging' | 'Free';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled';

export interface Organization {
  id: string;
  name: string;
  initials: string;
  plan: OrgPlan;
  planCode?: PlanCode;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionCycle?: BillingCycle;
  subscriptionExpiresAt?: string | null;
  trialUsedAt?: string | null;
  trialEndsAt?: string | null;
  paypalSubscriptionId?: string | null;
  membersCount: number;
  quotaUsed: number;
  quotaLimit: number;
  passDaysLeft?: number;
  passHoursLeft?: number;
  accentTone: 'lime' | 'neutral';
}

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Operator' | 'Viewer';
  initials: string;
  tenantId?: string;
  isActive?: boolean;
  lastLoginAt?: string | null;
}

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-entreprise-m',
    name: 'Enterprise M',
    initials: 'M',
    plan: 'Enterprise',
    planCode: 'ENTERPRISE',
    subscriptionStatus: 'trialing',
    subscriptionCycle: 'monthly',
    membersCount: 42,
    quotaUsed: 2000,
    quotaLimit: 10000,
    passDaysLeft: 9,
    passHoursLeft: 12,
    accentTone: 'lime',
  },
  {
    id: 'org-studio-nova',
    name: 'Studio Nova',
    initials: 'SN',
    plan: 'Pro',
    planCode: 'PRO',
    subscriptionStatus: 'active',
    subscriptionCycle: 'monthly',
    membersCount: 8,
    quotaUsed: 4200,
    quotaLimit: 25000,
    accentTone: 'neutral',
  },
  {
    id: 'org-acme-dev',
    name: 'Acme Corp Dev',
    initials: 'AC',
    plan: 'Staging',
    planCode: 'STARTER',
    subscriptionStatus: 'active',
    subscriptionCycle: 'monthly',
    membersCount: 15,
    quotaUsed: 6800,
    quotaLimit: 50000,
    accentTone: 'neutral',
  },
  {
    id: 'org-personal',
    name: 'Personal / Sandbox',
    initials: 'PS',
    plan: 'Free',
    planCode: 'FREE',
    subscriptionStatus: 'trialing',
    subscriptionCycle: 'monthly',
    membersCount: 1,
    quotaUsed: 1500,
    quotaLimit: 10000,
    passDaysLeft: 9,
    passHoursLeft: 12,
    accentTone: 'neutral',
  },
];

export const INITIAL_MEMBERS: OrgMember[] = [
  {
    id: 'mem-1',
    name: 'Dana Kim',
    email: 'dana.kim@entreprise-m.io',
    role: 'Owner',
    initials: 'DK',
    tenantId: 'org-entreprise-m',
    isActive: true,
  },
  {
    id: 'mem-2',
    name: 'Trinity Rivera',
    email: 'trinity.rivera@entreprise-m.io',
    role: 'Admin',
    initials: 'TR',
    tenantId: 'org-entreprise-m',
    isActive: true,
  },
  {
    id: 'mem-3',
    name: 'Leo Park',
    email: 'leo.park@entreprise-m.io',
    role: 'Operator',
    initials: 'LP',
    tenantId: 'org-entreprise-m',
    isActive: true,
  },
  {
    id: 'mem-4',
    name: 'Camille Laurent',
    email: 'c.laurent@entreprise-m.io',
    role: 'Viewer',
    initials: 'CL',
    tenantId: 'org-entreprise-m',
    isActive: true,
  },
];
