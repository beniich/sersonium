import type { OrgMember, Organization } from '../data/organizations';
import type { BillingCycle, PlanCode, PlanDefinition } from '../data/plans';

export interface AuthSessionSnapshot {
  accessToken: string | null;
  refreshToken: string | null;
  csrfToken: string | null;
  user: OrgMember | null;
  organization: Organization | null;
  isAuthenticated: boolean;
}

export interface PendingInvitationSummary {
  id: string;
  name: string;
  email: string;
  role: OrgMember['role'];
  expiresAt: string;
}

export interface InvoiceRecord {
  id: string;
  tenantId: string;
  planCode: PlanCode;
  cycle: BillingCycle;
  amountEur: number;
  currency: 'EUR';
  status: 'paid' | 'pending' | 'refunded';
  paypalOrderId?: string | null;
  paypalSubscriptionId?: string | null;
  createdAt: string;
}

export interface SubscriptionStatusResponse {
  tenantId: string;
  planCode: PlanCode;
  planName: string;
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'canceled';
  hasAccess: boolean;
  quotaUsed: number;
  quotaLimit: number;
  maxUsers: number;
  trialUsed: boolean;
  trialEndsAt: string | null;
  subscriptionExpiresAt: string | null;
}

// Keep all tokens strictly in JS memory (never localStorage / sessionStorage)
let accessToken: string | null = null;
let refreshToken: string | null = null;
let csrfToken: string | null = null;
let sessionUser: OrgMember | null = null;
let sessionOrg: Organization | null = null;
let refreshPromise: Promise<boolean> | null = null;

type SessionListener = (snapshot: AuthSessionSnapshot) => void;
const listeners = new Set<SessionListener>();

export function getAuthSnapshot(): AuthSessionSnapshot {
  return {
    accessToken,
    refreshToken,
    csrfToken,
    user: sessionUser,
    organization: sessionOrg,
    isAuthenticated: Boolean(accessToken && sessionUser),
  };
}

function notifyListeners(): void {
  const snap = getAuthSnapshot();
  for (const listener of listeners) {
    listener(snap);
  }
}

export function subscribeAuth(listener: SessionListener): () => void {
  listeners.add(listener);
  listener(getAuthSnapshot());
  return () => {
    listeners.delete(listener);
  };
}

export function setAuthSession(payload: {
  accessToken: string;
  refreshToken?: string | null;
  csrfToken: string;
  user?: OrgMember | null;
  organization?: Organization | null;
}): void {
  accessToken = payload.accessToken;
  if (payload.refreshToken !== undefined) {
    refreshToken = payload.refreshToken;
  }
  csrfToken = payload.csrfToken;
  if (payload.user !== undefined) sessionUser = payload.user;
  if (payload.organization !== undefined) sessionOrg = payload.organization;
  notifyListeners();
}

export function syncSessionOrganization(org: Organization | null | undefined): void {
  if (!org) return;
  if (!sessionOrg || sessionOrg.id === org.id) {
    sessionOrg = org;
    notifyListeners();
  }
}

export function clearAuthSession(): void {
  accessToken = null;
  refreshToken = null;
  csrfToken = null;
  sessionUser = null;
  sessionOrg = null;
  notifyListeners();
}

async function performRefresh(): Promise<boolean> {
  if (!refreshToken) {
    clearAuthSession();
    return false;
  }

  try {
    const res = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearAuthSession();
      return false;
    }
    const data = (await res.json()) as {
      accessToken: string;
      refreshToken: string;
      csrfToken: string;
      user: OrgMember;
      organization: Organization;
    };
    setAuthSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      csrfToken: data.csrfToken,
      user: data.user,
      organization: data.organization,
    });
    return true;
  } catch {
    clearAuthSession();
    return false;
  }
}

export async function refreshSessionSingleFlight(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function secureFetch(
  input: string,
  init: RequestInit = {},
  allowRetry = true
): Promise<Response> {
  const headers = new Headers(init.headers);
  const method = (init.method || 'GET').toUpperCase();
  const isMutating = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';

  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (isMutating) {
    if (csrfToken && !headers.has('x-csrf-token')) {
      headers.set('x-csrf-token', csrfToken);
    }
    headers.set('x-request-timestamp', String(Date.now()));
    if (init.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && allowRetry && refreshToken) {
    const refreshed = await refreshSessionSingleFlight();
    if (refreshed) {
      return secureFetch(input, init, false);
    }
  }

  return response;
}

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & { error?: string; code?: string };
  if (!res.ok) {
    const err = new Error(data.error || `Server error (${res.status})`) as Error & {
      status?: number;
      code?: string;
    };
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return data;
}

export const authApi = {
  async register(params: {
    name: string;
    email: string;
    password: string;
    organizationName: string;
    invitationToken?: string;
    planCode?: PlanCode;
  }): Promise<{
    user: OrgMember;
    organization: Organization;
  }> {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(params),
    });
    const data = await parseJsonOrThrow<{
      accessToken: string;
      refreshToken: string;
      csrfToken: string;
      user: OrgMember;
      organization: Organization;
    }>(res);
    setAuthSession(data);
    return { user: data.user, organization: data.organization };
  },

  async login(params: { email: string; password: string }): Promise<{
    user: OrgMember;
    organization: Organization;
  }> {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(params),
    });
    const data = await parseJsonOrThrow<{
      accessToken: string;
      refreshToken: string;
      csrfToken: string;
      user: OrgMember;
      organization: Organization;
    }>(res);
    setAuthSession(data);
    return { user: data.user, organization: data.organization };
  },

  async logout(): Promise<void> {
    const tokenToRevoke = refreshToken;
    clearAuthSession();
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: tokenToRevoke }),
      });
    } catch {
      // session already cleared locally
    }
  },

  async googleLink(params: { connected: boolean; email?: string | null }): Promise<{
    googleConnected: boolean;
    googleEmail: string | null;
  }> {
    const res = await secureFetch('/api/v1/auth/google-link', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return parseJsonOrThrow(res);
  },
};

export const iamApi = {
  async listMembers(): Promise<{
    members: OrgMember[];
    pendingInvitations: PendingInvitationSummary[];
    maxUsers: number;
    planCode: PlanCode;
  }> {
    const res = await secureFetch('/api/v1/iam/members');
    return parseJsonOrThrow(res);
  },

  async inviteMember(params: {
    name: string;
    email: string;
    role: OrgMember['role'];
  }): Promise<{
    invitation: PendingInvitationSummary;
    invitationToken: string;
  }> {
    const res = await secureFetch('/api/v1/iam/invitations', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return parseJsonOrThrow(res);
  },

  async revokeInvitation(invitationId: string): Promise<{ ok: boolean; revokedId: string }> {
    const res = await secureFetch(
      `/api/v1/iam/invitations/${encodeURIComponent(invitationId)}`,
      {
        method: 'DELETE',
      }
    );
    return parseJsonOrThrow(res);
  },

  async updateMemberRole(
    userId: string,
    role: OrgMember['role']
  ): Promise<{ member: OrgMember }> {
    const res = await secureFetch(`/api/v1/iam/members/${encodeURIComponent(userId)}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    return parseJsonOrThrow(res);
  },

  async removeMember(userId: string): Promise<{ ok: boolean; removedId: string }> {
    const res = await secureFetch(`/api/v1/iam/members/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    return parseJsonOrThrow(res);
  },

  async updateOnboarding(params: {
    organizationName?: string;
    zeroTrustEnforced?: boolean;
    mfaRequired?: boolean;
  }): Promise<{ organization: Organization }> {
    const res = await secureFetch('/api/v1/iam/onboarding', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    const data = await parseJsonOrThrow<{ organization: Organization }>(res);
    syncSessionOrganization(data.organization);
    return data;
  },
};

export const bridgeApi = {
  async getPlans(): Promise<{ plans: PlanDefinition[] }> {
    const res = await fetch('/api/v1/bridge/plans');
    return parseJsonOrThrow(res);
  },

  async getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
    const res = await secureFetch('/api/v1/bridge/subscription-status');
    return parseJsonOrThrow(res);
  },

  async activateTrial(): Promise<{ ok: boolean; organization: Organization }> {
    const res = await secureFetch('/api/v1/bridge/activate-trial', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const data = await parseJsonOrThrow<{ ok: boolean; organization: Organization }>(res);
    syncSessionOrganization(data.organization);
    return data;
  },
};

export const paypalApi = {
  async getConfig(): Promise<{
    mode: 'sandbox' | 'live';
    restConfigured: boolean;
    clientId: string | null;
    currency: 'EUR';
  }> {
    const res = await fetch('/api/v1/paypal/config');
    return parseJsonOrThrow(res);
  },

  async createOrder(params: {
    planCode: PlanCode;
    cycle: BillingCycle;
  }): Promise<{
    orderId: string;
    planCode: PlanCode;
    cycle: BillingCycle;
    amountEur: number;
    currency: 'EUR';
    mode: string;
  }> {
    const res = await secureFetch('/api/v1/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return parseJsonOrThrow(res);
  },

  async captureOrder(orderId: string): Promise<{
    ok: boolean;
    organization: Organization;
  }> {
    const res = await secureFetch('/api/v1/paypal/capture-order', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
    const data = await parseJsonOrThrow<{ ok: boolean; organization: Organization }>(res);
    syncSessionOrganization(data.organization);
    return data;
  },

  async getBillingSummary(): Promise<{
    organization: Organization;
    invoices: InvoiceRecord[];
  }> {
    const res = await secureFetch('/api/v1/manage/billing/summary');
    return parseJsonOrThrow(res);
  },
};

export const orgsApi = {
  async createOrganization(params: {
    name: string;
    plan: string;
  }): Promise<{ organization: Organization }> {
    const res = await secureFetch('/api/v1/orgs', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    const data = await parseJsonOrThrow<{
      organization: Organization;
      accessToken: string;
      csrfToken: string;
    }>(res);
    setAuthSession({
      accessToken: data.accessToken,
      csrfToken: data.csrfToken,
      organization: data.organization,
    });
    return { organization: data.organization };
  },
};
