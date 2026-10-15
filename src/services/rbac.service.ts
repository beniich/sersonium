import authService, { AuthUser } from "./auth.service";

/**
 * SENSORIUM — RBAC Multi-Tenant Service
 * =======================================
 * Gestion des rôles, permissions et tenants pour l'authentification entreprise.
 *
 * Architecture :
 *   - Tenant  : Organisation cliente (CMR, Caisse des Dépôts, etc.)
 *   - Role    : Ensemble de permissions associé à un utilisateur dans un tenant
 *   - Permission : Action granulaire sur une ressource (ex: "telemetry:read")
 *
 * Modèle RBAC hiérarchique :
 *   SUPER_ADMIN > TENANT_ADMIN > FACILITY_LEAD > FIELD_TECHNICIAN > CSRD_AUDITOR > VIEWER
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type RbacRole =
  | "SUPER_ADMIN"       // Accès total cross-tenant (équipe Sensorium)
  | "TENANT_ADMIN"      // Admin de son organisation
  | "FACILITY_LEAD"     // Responsable site / bâtiment
  | "FIELD_TECHNICIAN"  // Technicien terrain GMAO
  | "CSRD_AUDITOR"      // Auditeur CSRD/ESG (lecture seule audit)
  | "VIEWER";           // Lecture seule générale

export type Permission =
  // Télémétrie
  | "telemetry:read"
  | "telemetry:write"
  | "telemetry:configure"
  // Assets / GMAO
  | "assets:read"
  | "assets:write"
  | "assets:delete"
  | "workorders:read"
  | "workorders:write"
  | "workorders:validate"
  // Sécurité
  | "security:read"
  | "security:manage"
  | "zerotrust:manage"
  // Infrastructure
  | "infrastructure:read"
  | "infrastructure:provision"
  | "infrastructure:delete"
  // Compliance / CSRD
  | "compliance:read"
  | "compliance:export"
  | "compliance:sign"
  // Tenants & IAM
  | "tenants:read"
  | "tenants:manage"
  | "users:read"
  | "users:invite"
  | "users:manage"
  | "roles:assign"
  // Billing
  | "billing:read"
  | "billing:manage"
  // Stratégie / OKR
  | "strategy:read"
  | "strategy:write"
  // Cockpit 3D
  | "cockpit:access"
  | "cockpit:actuate"
  // Alertes
  | "alerts:read"
  | "alerts:acknowledge"
  | "alerts:configure";

export interface Tenant {
  id: string;
  name: string;
  domain: string;        // ex: cmr.fr, caissedesdepots.fr
  logoUrl?: string;
  tier: "STARTER" | "PRO" | "ENTERPRISE";
  ssoProvider?: "google" | "azure_ad" | "okta" | "saml";
  ssoConfig?: {
    clientId?: string;
    tenantId?: string;     // Azure AD
    discoveryUrl?: string; // OIDC
    samlEntityId?: string;
  };
  createdAt: string;
  contractExpiry?: string;
  maxUsers: number;
  features: {
    digitalTwin: boolean;
    realtimeKafka: boolean;
    csrdCompliance: boolean;
    ztnaHardware: boolean;
    souvereign: boolean;
  };
}

export interface TenantMember {
  userId: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  role: RbacRole;
  tenantId: string;
  siteIds?: string[];     // Périmètre géographique restreint
  isActive: boolean;
  lastLoginAt?: string;
  invitedAt: string;
  invitedBy: string;
  mfaEnabled: boolean;
}

export interface RbacSession {
  userId: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  role: RbacRole;
  tenantId: string;
  tenant: Tenant;
  permissions: Permission[];
  siteIds?: string[];
  isAuthenticated: boolean;
  authMethod: "email" | "google" | "azure_ad" | "okta" | "saml" | "mock";
  sessionExpiresAt: number; // Unix ms
}

// ─── Permission Matrix ─────────────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<RbacRole, Permission[]> = {
  SUPER_ADMIN: [
    "telemetry:read", "telemetry:write", "telemetry:configure",
    "assets:read", "assets:write", "assets:delete",
    "workorders:read", "workorders:write", "workorders:validate",
    "security:read", "security:manage", "zerotrust:manage",
    "infrastructure:read", "infrastructure:provision", "infrastructure:delete",
    "compliance:read", "compliance:export", "compliance:sign",
    "tenants:read", "tenants:manage",
    "users:read", "users:invite", "users:manage", "roles:assign",
    "billing:read", "billing:manage",
    "strategy:read", "strategy:write",
    "cockpit:access", "cockpit:actuate",
    "alerts:read", "alerts:acknowledge", "alerts:configure",
  ],
  TENANT_ADMIN: [
    "telemetry:read", "telemetry:write", "telemetry:configure",
    "assets:read", "assets:write", "assets:delete",
    "workorders:read", "workorders:write", "workorders:validate",
    "security:read", "security:manage",
    "infrastructure:read", "infrastructure:provision",
    "compliance:read", "compliance:export", "compliance:sign",
    "tenants:read",
    "users:read", "users:invite", "users:manage", "roles:assign",
    "billing:read",
    "strategy:read", "strategy:write",
    "cockpit:access", "cockpit:actuate",
    "alerts:read", "alerts:acknowledge", "alerts:configure",
  ],
  FACILITY_LEAD: [
    "telemetry:read", "telemetry:write",
    "assets:read", "assets:write",
    "workorders:read", "workorders:write", "workorders:validate",
    "security:read",
    "infrastructure:read",
    "compliance:read", "compliance:export",
    "users:read",
    "strategy:read",
    "cockpit:access", "cockpit:actuate",
    "alerts:read", "alerts:acknowledge", "alerts:configure",
  ],
  FIELD_TECHNICIAN: [
    "telemetry:read",
    "assets:read", "assets:write",
    "workorders:read", "workorders:write",
    "infrastructure:read",
    "cockpit:access",
    "alerts:read", "alerts:acknowledge",
  ],
  CSRD_AUDITOR: [
    "telemetry:read",
    "assets:read",
    "workorders:read",
    "compliance:read", "compliance:export",
    "strategy:read",
    "alerts:read",
  ],
  VIEWER: [
    "telemetry:read",
    "assets:read",
    "workorders:read",
    "infrastructure:read",
    "alerts:read",
  ],
};

export const ROLE_LABELS: Record<RbacRole, string> = {
  SUPER_ADMIN: "Super Administrateur",
  TENANT_ADMIN: "Administrateur Tenant",
  FACILITY_LEAD: "Responsable Site",
  FIELD_TECHNICIAN: "Technicien Terrain",
  CSRD_AUDITOR: "Auditeur CSRD/ESG",
  VIEWER: "Observateur",
};

export const ROLE_COLORS: Record<RbacRole, string> = {
  SUPER_ADMIN: "#ef4444",
  TENANT_ADMIN: "#f59e0b",
  FACILITY_LEAD: "#6366f1",
  FIELD_TECHNICIAN: "#10b981",
  CSRD_AUDITOR: "#06b6d4",
  VIEWER: "#64748b",
};

// ─── Mock Tenant Catalogue ─────────────────────────────────────────────────────

export const MOCK_TENANTS: Tenant[] = [
  {
    id: "tenant-cmr",
    name: "Caisse Marocaine des Retraites",
    domain: "cmr.ma",
    tier: "ENTERPRISE",
    ssoProvider: "azure_ad",
    ssoConfig: { tenantId: "xxxx-cmr-azure-tenant" },
    createdAt: "2025-01-15T09:00:00Z",
    contractExpiry: "2027-01-15T00:00:00Z",
    maxUsers: 250,
    features: { digitalTwin: true, realtimeKafka: true, csrdCompliance: true, ztnaHardware: true, souvereign: true },
  },
  {
    id: "tenant-cdc",
    name: "Caisse des Dépôts et Consignations",
    domain: "caissedesdepots.fr",
    tier: "ENTERPRISE",
    ssoProvider: "saml",
    ssoConfig: { samlEntityId: "urn:caissedesdepots:sensorium" },
    createdAt: "2025-03-01T09:00:00Z",
    contractExpiry: "2028-03-01T00:00:00Z",
    maxUsers: 500,
    features: { digitalTwin: true, realtimeKafka: true, csrdCompliance: true, ztnaHardware: true, souvereign: true },
  },
  {
    id: "tenant-demo",
    name: "Sensorium Demo Corp",
    domain: "demo.sensorium.ai",
    tier: "PRO",
    ssoProvider: "google",
    createdAt: "2024-10-01T09:00:00Z",
    maxUsers: 50,
    features: { digitalTwin: true, realtimeKafka: true, csrdCompliance: false, ztnaHardware: false, souvereign: false },
  },
];

export const MOCK_MEMBERS: TenantMember[] = [
  { userId: "usr-001", email: "admin@cmr.ma", displayName: "Hamid Boulkassimy", role: "TENANT_ADMIN", tenantId: "tenant-cmr", isActive: true, invitedAt: "2025-01-15T09:00:00Z", invitedBy: "system", mfaEnabled: true },
  { userId: "usr-002", email: "benali@cmr.ma", displayName: "Ahmed Benali", role: "FACILITY_LEAD", tenantId: "tenant-cmr", isActive: true, invitedAt: "2025-01-20T10:00:00Z", invitedBy: "usr-001", mfaEnabled: true },
  { userId: "usr-003", email: "tech1@cmr.ma", displayName: "Younes Khalil", role: "FIELD_TECHNICIAN", tenantId: "tenant-cmr", isActive: true, invitedAt: "2025-02-01T10:00:00Z", invitedBy: "usr-001", mfaEnabled: false },
  { userId: "usr-004", email: "auditor@cmr.ma", displayName: "Fatima Zahra Idrissi", role: "CSRD_AUDITOR", tenantId: "tenant-cmr", isActive: true, invitedAt: "2025-03-15T10:00:00Z", invitedBy: "usr-001", mfaEnabled: true },
  { userId: "usr-005", email: "admin@caissedesdepots.fr", displayName: "Sophie Dupont", role: "TENANT_ADMIN", tenantId: "tenant-cdc", isActive: true, invitedAt: "2025-03-01T09:00:00Z", invitedBy: "system", mfaEnabled: true },
  { userId: "usr-006", email: "demo@sensorium.ai", displayName: "Demo User", role: "FACILITY_LEAD", tenantId: "tenant-demo", isActive: true, invitedAt: "2024-10-01T09:00:00Z", invitedBy: "system", mfaEnabled: false },
  { userId: "super-001", email: "beniich.contact@gmail.com", displayName: "Super Admin", role: "SUPER_ADMIN", tenantId: "tenant-demo", isActive: true, invitedAt: "2024-01-01T00:00:00Z", invitedBy: "system", mfaEnabled: true },
];

// ─── RBAC Service ──────────────────────────────────────────────────────────────

const SESSION_KEY = "sensorium_rbac_session";

class RbacService {
  private session: RbacSession | null = null;
  private isSyncing = false;

  constructor() {
    this.loadFromStorage();
    // Auto-sync with AuthService
    if (typeof window !== "undefined") {
      authService.onAuthStateChange((authSession) => {
        if (this.isSyncing) return;
        if (authSession.isAuthenticated && authSession.user) {
          this.syncFromAuthUser(authSession.user);
        } else if (!authSession.isAuthenticated && this.session && this.session.authMethod !== "mock") {
          this.session = null;
          localStorage.removeItem(SESSION_KEY);
        }
      });
    }
  }

  public syncFromAuthUser(user: AuthUser): void {
    const role = this.mapAuthRole(user.role);
    const tenant = MOCK_TENANTS.find((t) => t.id === user.tenantId) || {
      id: user.tenantId || "tenant-default",
      name: user.organizationName || "Organisation SENSORIUM",
      domain: user.email.split("@")[1] || "sensorium.ai",
      tier: "ENTERPRISE",
      createdAt: new Date().toISOString(),
      maxUsers: 100,
      features: { digitalTwin: true, realtimeKafka: true, csrdCompliance: true, ztnaHardware: true, souvereign: true },
    };

    const member: TenantMember = {
      userId: user.userId,
      email: user.email,
      displayName: user.email.split("@")[0],
      role,
      tenantId: tenant.id,
      isActive: true,
      invitedAt: new Date().toISOString(),
      invitedBy: "auth-sync",
      mfaEnabled: true,
    };

    this.session = this.buildSession(member, tenant, "email");
    if (user.permissions && user.permissions.length > 0) {
      this.session.permissions = Array.from(new Set([...this.session.permissions, ...user.permissions as Permission[]]));
    }
    this.saveToStorage();
  }

  private mapAuthRole(roleStr: string): RbacRole {
    const normalized = (roleStr || "").toLowerCase().replace(/[-_]/g, "");
    if (normalized.includes("superadmin")) return "SUPER_ADMIN";
    if (normalized.includes("admin")) return "TENANT_ADMIN";
    if (normalized.includes("facility") || normalized.includes("operator") || normalized.includes("manager")) return "FACILITY_LEAD";
    if (normalized.includes("tech")) return "FIELD_TECHNICIAN";
    if (normalized.includes("audit") || normalized.includes("csrd")) return "CSRD_AUDITOR";
    return "VIEWER";
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) this.session = JSON.parse(raw);
    } catch { /* ignore */ }
  }

  private saveToStorage(): void {
    try {
      if (this.session) localStorage.setItem(SESSION_KEY, JSON.stringify(this.session));
      else localStorage.removeItem(SESSION_KEY);
    } catch { /* ignore */ }
  }

  // ── Login (Hybrid API + Mock resilient) ──────────────────────────────────

  async loginWithEmail(email: string, password: string): Promise<{ success: boolean; session?: RbacSession; error?: string }> {
    // 1. Tente d'abord l'authentification réelle via l'API REST
    this.isSyncing = true;
    try {
      const authRes = await authService.login(email, password);
      if (authRes.success && authRes.user) {
        this.syncFromAuthUser(authRes.user);
        this.isSyncing = false;
        return { success: true, session: this.session! };
      }
    } catch {
      // Repli local en cas d'indisponibilité réseau
    } finally {
      this.isSyncing = false;
    }

    // 2. Repli résilient : recherche dans les membres de démonstration
    const member = MOCK_MEMBERS.find((m) => m.email === email);
    if (!member) return { success: false, error: "Identifiants invalides" };
    if (!member.isActive) return { success: false, error: "Compte désactivé" };
    const tenant = MOCK_TENANTS.find((t) => t.id === member.tenantId);
    if (!tenant) return { success: false, error: "Tenant introuvable" };
    this.session = this.buildSession(member, tenant, "email");
    this.saveToStorage();

    // Synchronisation vers AuthService
    authService.setSession({
      userId: member.userId,
      email: member.email,
      role: member.role,
      tenantId: tenant.id,
      organizationName: tenant.name,
      permissions: this.session.permissions,
    });

    return { success: true, session: this.session };
  }

  async loginWithGoogle(googleEmail: string, displayName: string, photoUrl?: string): Promise<{ success: boolean; session?: RbacSession; error?: string }> {
    // 1. Tente l'authentification Firebase OAuth vers Sensorium API
    this.isSyncing = true;
    try {
      const authRes = await authService.loginWithGoogle();
      if (authRes.success && authRes.user) {
        this.syncFromAuthUser(authRes.user);
        this.isSyncing = false;
        return { success: true, session: this.session! };
      }
    } catch {
      // Repli démo
    } finally {
      this.isSyncing = false;
    }

    // 2. Repli local sur catalogue des tenants
    let member = MOCK_MEMBERS.find((m) => m.email === googleEmail);
    if (!member) {
      const domain = googleEmail.split("@")[1];
      const tenant = MOCK_TENANTS.find((t) => t.domain === domain);
      if (tenant) {
        member = {
          userId: `google-${Date.now()}`,
          email: googleEmail,
          displayName,
          photoUrl,
          role: "VIEWER",
          tenantId: tenant.id,
          isActive: true,
          invitedAt: new Date().toISOString(),
          invitedBy: "sso-auto",
          mfaEnabled: false,
        };
      }
    }
    if (!member) {
      const demoTenant = MOCK_TENANTS.find((t) => t.id === "tenant-demo")!;
      member = { userId: `google-${Date.now()}`, email: googleEmail, displayName, photoUrl, role: "VIEWER", tenantId: "tenant-demo", isActive: true, invitedAt: new Date().toISOString(), invitedBy: "sso-auto", mfaEnabled: false };
      this.session = this.buildSession(member, demoTenant, "google");
      this.saveToStorage();
      authService.setSession({ userId: member.userId, email: member.email, role: member.role, tenantId: demoTenant.id });
      return { success: true, session: this.session };
    }
    const tenant = MOCK_TENANTS.find((t) => t.id === member!.tenantId)!;
    this.session = this.buildSession({ ...member, photoUrl }, tenant, "google");
    this.saveToStorage();
    authService.setSession({ userId: member.userId, email: member.email, role: member.role, tenantId: tenant.id });
    return { success: true, session: this.session };
  }

  loginAsMock(role: RbacRole = "FACILITY_LEAD", tenantId = "tenant-demo"): RbacSession {
    const tenant = MOCK_TENANTS.find((t) => t.id === tenantId) ?? MOCK_TENANTS[2];
    const mockMember: TenantMember = {
      userId: `mock-${role}`,
      email: `${role.toLowerCase()}@demo.sensorium.ai`,
      displayName: `${ROLE_LABELS[role]} (Demo)`,
      role,
      tenantId: tenant.id,
      isActive: true,
      invitedAt: new Date().toISOString(),
      invitedBy: "system",
      mfaEnabled: false,
    };
    this.session = this.buildSession(mockMember, tenant, "mock");
    this.saveToStorage();
    authService.setSession({
      userId: mockMember.userId,
      email: mockMember.email,
      role,
      tenantId: tenant.id,
      organizationName: tenant.name,
      permissions: this.session.permissions,
    });
    return this.session;
  }

  logout(): void {
    this.session = null;
    localStorage.removeItem(SESSION_KEY);
    authService.logout();
  }

  // ── Session helpers ────────────────────────────────────────────────────────

  private buildSession(member: TenantMember & { photoUrl?: string }, tenant: Tenant, method: RbacSession["authMethod"]): RbacSession {
    return {
      userId: member.userId,
      email: member.email,
      displayName: member.displayName,
      photoUrl: member.photoUrl,
      role: member.role,
      tenantId: tenant.id,
      tenant,
      permissions: ROLE_PERMISSIONS[member.role] ?? [],
      siteIds: member.siteIds,
      isAuthenticated: true,
      authMethod: method,
      sessionExpiresAt: Date.now() + 8 * 3600_000, // 8h
    };
  }

  getSession(): RbacSession | null {
    if (!this.session) return null;
    if (this.session.sessionExpiresAt < Date.now()) {
      this.logout();
      return null;
    }
    return this.session;
  }

  // ── Permission checking ────────────────────────────────────────────────────

  can(permission: Permission): boolean {
    return this.session?.permissions.includes(permission) ?? false;
  }

  canAll(...permissions: Permission[]): boolean {
    return permissions.every((p) => this.can(p));
  }

  canAny(...permissions: Permission[]): boolean {
    return permissions.some((p) => this.can(p));
  }

  hasRole(role: RbacRole): boolean {
    return this.session?.role === role;
  }

  hasMinRole(minRole: RbacRole): boolean {
    const HIERARCHY: RbacRole[] = ["VIEWER", "CSRD_AUDITOR", "FIELD_TECHNICIAN", "FACILITY_LEAD", "TENANT_ADMIN", "SUPER_ADMIN"];
    const userIdx = HIERARCHY.indexOf(this.session?.role ?? "VIEWER");
    const minIdx = HIERARCHY.indexOf(minRole);
    return userIdx >= minIdx;
  }

  // ── Tenant & member management ─────────────────────────────────────────────

  getTenantMembers(tenantId?: string): TenantMember[] {
    const id = tenantId ?? this.session?.tenantId;
    if (!id) return [];
    return MOCK_MEMBERS.filter((m) => m.tenantId === id);
  }

  getAllTenants(): Tenant[] {
    if (this.session?.role === "SUPER_ADMIN") return MOCK_TENANTS;
    return MOCK_TENANTS.filter((t) => t.id === this.session?.tenantId);
  }

  inviteMember(member: Omit<TenantMember, "userId" | "invitedAt" | "invitedBy">): { success: boolean; member?: TenantMember; error?: string } {
    if (!this.can("users:invite")) return { success: false, error: "Permission refusée" };
    const existing = MOCK_MEMBERS.find((m) => m.email === member.email);
    if (existing) return { success: false, error: "Cet email est déjà membre" };
    const newMember: TenantMember = {
      ...member,
      userId: `usr-${Date.now()}`,
      invitedAt: new Date().toISOString(),
      invitedBy: this.session?.userId ?? "unknown",
    };
    MOCK_MEMBERS.push(newMember);
    return { success: true, member: newMember };
  }

  changeRole(userId: string, newRole: RbacRole): { success: boolean; error?: string } {
    if (!this.can("roles:assign")) return { success: false, error: "Permission refusée" };
    const member = MOCK_MEMBERS.find((m) => m.userId === userId);
    if (!member) return { success: false, error: "Utilisateur introuvable" };
    // Security: cannot promote to SUPER_ADMIN unless you are SUPER_ADMIN
    if (newRole === "SUPER_ADMIN" && !this.hasRole("SUPER_ADMIN")) return { success: false, error: "Seul un Super Administrateur peut attribuer ce rôle" };
    member.role = newRole;
    return { success: true };
  }
}

export const rbacService = new RbacService();
export default rbacService;
