import type { OrgPlan, Organization } from '../data/organizations.ts';

export function filterOrganizations(
  organizations: Organization[],
  query: string
): Organization[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return organizations;
  return organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(normalized) ||
      org.plan.toLowerCase().includes(normalized) ||
      org.initials.toLowerCase().includes(normalized)
  );
}

export function deriveOrgInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return 'OR';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export function createOrganization(
  organizations: Organization[],
  input: { name: string; plan?: OrgPlan }
): { organizations: Organization[]; created: Organization | null } {
  const trimmedName = input.name.trim();
  if (!trimmedName) {
    return { organizations, created: null };
  }

  const plan: OrgPlan = input.plan ?? 'Pro';
  const quotaLimit =
    plan === 'Enterprise'
      ? 100000
      : plan === 'Pro'
      ? 25000
      : plan === 'Staging'
      ? 50000
      : 10000;

  const created: Organization = {
    id: `org-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: trimmedName,
    initials: deriveOrgInitials(trimmedName),
    plan,
    membersCount: 1,
    quotaUsed: 0,
    quotaLimit,
    passDaysLeft: 10,
    passHoursLeft: 0,
    accentTone: 'neutral',
  };

  return {
    organizations: [...organizations, created],
    created,
  };
}

export function formatQuotaCompact(value: number): string {
  if (value >= 1000) {
    const k = value / 1000;
    return Number.isInteger(k) ? `${k}k` : `${k.toFixed(1)}k`;
  }
  return String(value);
}

export function formatOrgMetaSubtitle(org: Organization): string {
  if (org.plan === 'Free' && org.membersCount <= 1) {
    return 'Free Plan';
  }
  const memberLabel = org.membersCount === 1 ? '1 member' : `${org.membersCount} members`;
  return `${org.plan} Plan • ${memberLabel}`;
}
