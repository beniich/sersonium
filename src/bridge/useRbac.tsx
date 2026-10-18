/**
 * useRbac — React Context + Hook pour le RBAC multi-tenant SENSORIUM
 * Fournit la session, les helpers de permission, et les mutations.
 */
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from "react";
import rbacService, {
  RbacSession, RbacRole, Permission, Tenant, TenantMember,
  MOCK_TENANTS, ROLE_LABELS, ROLE_COLORS, ROLE_PERMISSIONS,
} from "../services/rbac.service";

export { ROLE_LABELS, ROLE_COLORS, ROLE_PERMISSIONS };
export type { RbacRole, Permission, Tenant, TenantMember, RbacSession };

// ─── Context ──────────────────────────────────────────────────────────────────

export interface RbacUser {
  id: string;
  name: string;
  email: string;
  role: RbacRole;
  photoUrl?: string;
}

interface RbacContextType {
  session: RbacSession | null;
  isAuthenticated: boolean;
  currentUser: RbacUser | null;
  currentTenant: Tenant | null;
  // Auth actions
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (email: string, name: string, photoUrl?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsMock: (role?: RbacRole, tenantId?: string) => void;
  logout: () => void;
  // Permission helpers
  can: (permission: Permission) => boolean;
  canAll: (...permissions: Permission[]) => boolean;
  canAny: (...permissions: Permission[]) => boolean;
  hasRole: (role: RbacRole) => boolean;
  hasMinRole: (minRole: RbacRole) => boolean;
  // Data
  tenantMembers: TenantMember[];
  allTenants: Tenant[];
  refreshSession: () => void;
  inviteMember: (member: Omit<TenantMember, "userId" | "invitedAt" | "invitedBy">) => { success: boolean; error?: string };
  changeRole: (userId: string, newRole: RbacRole) => { success: boolean; error?: string };
}

const RbacContext = createContext<RbacContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function RbacProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<RbacSession | null>(() => rbacService.getSession());

  const refreshSession = useCallback(() => {
    setSession(rbacService.getSession());
  }, []);

  // Re-check session expiry every 60s
  useEffect(() => {
    const timer = setInterval(refreshSession, 60_000);
    return () => clearInterval(timer);
  }, [refreshSession]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const result = await rbacService.loginWithEmail(email, password);
    if (result.success) setSession(rbacService.getSession());
    return { success: result.success, error: result.error };
  }, []);

  const loginWithGoogle = useCallback(async (email: string, name: string, photoUrl?: string) => {
    const result = await rbacService.loginWithGoogle(email, name, photoUrl);
    if (result.success) setSession(rbacService.getSession());
    return { success: result.success, error: result.error };
  }, []);

  const loginAsMock = useCallback((role?: RbacRole, tenantId?: string) => {
    rbacService.loginAsMock(role, tenantId);
    setSession(rbacService.getSession());
  }, []);

  const logout = useCallback(() => {
    rbacService.logout();
    setSession(null);
  }, []);

  const can = useCallback((p: Permission) => rbacService.can(p), [session]);
  const canAll = useCallback((...p: Permission[]) => rbacService.canAll(...p), [session]);
  const canAny = useCallback((...p: Permission[]) => rbacService.canAny(...p), [session]);
  const hasRole = useCallback((r: RbacRole) => rbacService.hasRole(r), [session]);
  const hasMinRole = useCallback((r: RbacRole) => rbacService.hasMinRole(r), [session]);

  const tenantMembers = session ? rbacService.getTenantMembers() : [];
  const allTenants = session ? rbacService.getAllTenants() : MOCK_TENANTS;

  const inviteMember = useCallback((member: Omit<TenantMember, "userId" | "invitedAt" | "invitedBy">) => {
    const r = rbacService.inviteMember(member);
    refreshSession();
    return r;
  }, [refreshSession]);

  const changeRole = useCallback((userId: string, newRole: RbacRole) => {
    const r = rbacService.changeRole(userId, newRole);
    refreshSession();
    return r;
  }, [refreshSession]);

  const currentUser: RbacUser | null = useMemo(() => {
    if (session) {
      return {
        id: session.userId,
        name: session.displayName || "Admin User",
        email: session.email,
        role: session.role,
        photoUrl: session.photoUrl,
      };
    }
    const s = rbacService.getSession();
    if (s) {
      return {
        id: s.userId,
        name: s.displayName || "Admin User",
        email: s.email,
        role: s.role,
        photoUrl: s.photoUrl,
      };
    }
    return {
      id: "usr-admin",
      name: "Admin User",
      email: "admin@sensorium.ai",
      role: "SUPER_ADMIN" as RbacRole,
    };
  }, [session]);

  const currentTenant = useMemo(() => {
    return session?.tenant ?? rbacService.getCurrentTenant();
  }, [session]);

  return (
    <RbacContext.Provider value={{
      session, isAuthenticated: !!session,
      currentUser, currentTenant,
      loginWithEmail, loginWithGoogle, loginAsMock, logout,
      can, canAll, canAny, hasRole, hasMinRole,
      tenantMembers, allTenants,
      refreshSession, inviteMember, changeRole,
    }}>
      {children}
    </RbacContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useRbac(): RbacContextType {
  const ctx = useContext(RbacContext);
  if (!ctx) throw new Error("useRbac must be used inside <RbacProvider>");
  return ctx;
}

// ─── Guard component ──────────────────────────────────────────────────────────

interface RbacGuardProps {
  permission?: Permission;
  minRole?: RbacRole;
  fallback?: ReactNode;
  children: ReactNode;
}

export function RbacGuard({ permission, minRole, fallback = null, children }: RbacGuardProps) {
  const { can, hasMinRole, isAuthenticated } = useRbac();
  if (!isAuthenticated) return <>{fallback}</>;
  if (permission && !can(permission)) return <>{fallback}</>;
  if (minRole && !hasMinRole(minRole)) return <>{fallback}</>;
  return <>{children}</>;
}

export default useRbac;
