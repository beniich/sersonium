import React, { useState, useEffect, useCallback } from "react";
import { useRbac, ROLE_LABELS, ROLE_COLORS, RbacRole, TenantMember, Tenant } from "../bridge/useRbac";
import { MOCK_TENANTS, ROLE_PERMISSIONS } from "../services/rbac.service";
import type { Permission } from "../services/rbac.service";
import PageHeaderBanner from "../components/PageHeaderBanner";
import { ShieldCheck, RefreshCw, Trash2, Mail, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import apiClient from "../services/apiClient";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_ICON: Record<RbacRole, string> = {
  SUPER_ADMIN: "👑", TENANT_ADMIN: "🏢", FACILITY_LEAD: "🏗️",
  FIELD_TECHNICIAN: "🔧", CSRD_AUDITOR: "📋", VIEWER: "👁️",
};

export const RBAC_TO_BACKEND_ROLE: Record<string, string> = {
  SUPER_ADMIN: "admin",
  TENANT_ADMIN: "admin",
  FACILITY_LEAD: "operator",
  FIELD_TECHNICIAN: "operator",
  CSRD_AUDITOR: "auditor",
  VIEWER: "viewer",
};

export const BACKEND_TO_RBAC_ROLE: Record<string, RbacRole> = {
  admin: "TENANT_ADMIN",
  operator: "FACILITY_LEAD",
  auditor: "CSRD_AUDITOR",
  viewer: "VIEWER",
};

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 600,
      background: `${color}20`, color, border: `1px solid ${color}40`,
    }}>{label}</span>
  );
}

// ─── Interfaces Backend IAM ───────────────────────────────────────────────────

interface BackendMember {
  id: string;
  email: string;
  name: string;
  role: string;
  tokens?: number;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
}

interface BackendInvitation {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
  invitedBy?: { name: string; email: string };
}

interface BackendQuota {
  maxUsers: number;
  activeUsers: number;
  pendingInvitations: number;
  remainingSlots: number;
}

// ─── Member Row ────────────────────────────────────────────────────────────────

function MemberRow({ member, canManage, onRoleChange, onRemove }: {
  member: TenantMember;
  canManage: boolean;
  onRoleChange: (userId: string, role: RbacRole) => Promise<void>;
  onRemove?: (userId: string) => Promise<void>;
}) {
  const color = ROLE_COLORS[member.role] || "#94a3b8";
  const [editing, setEditing] = useState(false);
  const [newRole, setNewRole] = useState<RbacRole>(member.role);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveRole = async () => {
    setIsUpdating(true);
    try {
      await onRoleChange(member.userId, newRole);
      setEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <td style={{ padding: "12px 10px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "34px", height: "34px", borderRadius: "50%",
          background: `${color}20`, border: `1px solid ${color}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", flexShrink: 0,
        }}>
          {member.displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 500 }}>{member.displayName}</div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>{member.email}</div>
        </div>
      </td>
      <td style={{ padding: "12px 10px" }}>
        {editing && canManage ? (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as RbacRole)}
              disabled={isUpdating}
              style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px", color: "#e2e8f0", fontSize: "11px", padding: "4px 8px",
              }}
            >
              {(Object.keys(ROLE_LABELS) as RbacRole[]).map((r) => (
                <option key={r} value={r} style={{ background: "#0f172a" }}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
            <button
              onClick={handleSaveRole}
              disabled={isUpdating}
              style={{ padding: "3px 8px", borderRadius: "4px", background: "#10b981", border: "none", color: "white", fontSize: "10px", cursor: "pointer" }}
            >
              {isUpdating ? "..." : "✓"}
            </button>
            <button
              onClick={() => setEditing(false)}
              disabled={isUpdating}
              style={{ padding: "3px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#64748b", fontSize: "10px", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "14px" }}>{ROLE_ICON[member.role] || "👤"}</span>
            <Badge label={ROLE_LABELS[member.role] || member.role} color={color} />
            {canManage && (
              <button onClick={() => setEditing(true)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "11px" }}>✏️</button>
            )}
          </div>
        )}
      </td>
      <td style={{ padding: "12px 10px" }}>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {member.mfaEnabled
            ? <Badge label="MFA ✓" color="#10b981" />
            : <Badge label="MFA ✗" color="#ef4444" />}
          <Badge label={member.isActive ? "Actif" : "Inactif"} color={member.isActive ? "#00e5a0" : "#64748b"} />
        </div>
      </td>
      <td style={{ padding: "12px 10px", fontSize: "11px", color: "#64748b" }}>
        {member.invitedAt ? new Date(member.invitedAt).toLocaleDateString("fr-FR") : "—"}
      </td>
      {canManage && onRemove && (
        <td style={{ padding: "12px 10px", textAlign: "right" }}>
          <button
            onClick={() => onRemove(member.userId)}
            title="Supprimer le membre"
            style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
          >
            <Trash2 size={13} />
          </button>
        </td>
      )}
    </tr>
  );
}

// ─── Invite Form ───────────────────────────────────────────────────────────────

function InviteForm({ onInviteSubmit }: {
  onInviteSubmit: (email: string, role: string) => Promise<{ success: boolean; invitationUrl?: string; error?: string }>;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RbacRole>("VIEWER");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; invitationUrl?: string; error?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    setResult({});

    try {
      const res = await onInviteSubmit(email.trim(), role);
      setResult(res);
      if (res.success) {
        setEmail("");
        setRole("VIEWER");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const INPUT: React.CSSProperties = {
    padding: "8px 12px", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px",
    color: "#e2e8f0", fontSize: "12px", outline: "none",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "flex-end" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", color: "#64748b" }}>Email du collaborateur</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="collaborateur@domaine.com"
          style={{ ...INPUT, width: "220px" }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", color: "#64748b" }}>Rôle assigné</label>
        <select value={role} onChange={(e) => setRole(e.target.value as RbacRole)} style={{ ...INPUT }}>
          {(Object.keys(ROLE_LABELS) as RbacRole[]).map((r) => (
            <option key={r} value={r} style={{ background: "#0f172a" }}>{ROLE_ICON[r]} {ROLE_LABELS[r]}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: "8px 16px", borderRadius: "8px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          border: "none", color: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer",
        }}
      >
        {submitting ? "Envoi..." : "+ Inviter"}
      </button>
      {result.success && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", marginTop: "6px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "#10b981" }}>✓ Invitation créée et enregistrée</span>
          {result.invitationUrl && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", padding: "4px 8px" }}>
              <input
                type="text"
                readOnly
                value={result.invitationUrl}
                style={{ background: "transparent", border: "none", color: "#a7f3d0", fontSize: "11px", width: "220px", outline: "none" }}
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(result.invitationUrl!);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{ background: "#10b981", border: "none", color: "white", borderRadius: "4px", padding: "2px 8px", fontSize: "10px", cursor: "pointer", fontWeight: 600 }}
              >
                {copied ? "Copié !" : "Copier le lien"}
              </button>
            </div>
          )}
        </div>
      )}
      {result.error && <span style={{ fontSize: "12px", color: "#ef4444" }}>{result.error}</span>}
    </form>
  );
}

// ─── Permission Matrix View ────────────────────────────────────────────────────

function PermissionMatrix() {
  const PERM_GROUPS: { label: string; perms: Permission[] }[] = [
    { label: "Télémétrie", perms: ["telemetry:read", "telemetry:write", "telemetry:configure"] },
    { label: "Assets/GMAO", perms: ["assets:read", "assets:write", "assets:delete", "workorders:read", "workorders:write", "workorders:validate"] },
    { label: "Infrastructure", perms: ["infrastructure:read", "infrastructure:provision", "infrastructure:delete"] },
    { label: "Sécurité", perms: ["security:read", "security:manage", "zerotrust:manage"] },
    { label: "Compliance", perms: ["compliance:read", "compliance:export", "compliance:sign"] },
    { label: "IAM/Tenants", perms: ["users:read", "users:invite", "users:manage", "roles:assign", "tenants:manage"] },
    { label: "Cockpit 3D", perms: ["cockpit:access", "cockpit:actuate"] },
    { label: "Alertes", perms: ["alerts:read", "alerts:acknowledge", "alerts:configure"] },
  ];

  const ALL_ROLES: RbacRole[] = ["VIEWER", "CSRD_AUDITOR", "FIELD_TECHNICIAN", "FACILITY_LEAD", "TENANT_ADMIN", "SUPER_ADMIN"];

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
        <thead>
          <tr>
            <th style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", fontWeight: 500, borderBottom: "1px solid rgba(255,255,255,0.06)", minWidth: "160px" }}>Permission</th>
            {ALL_ROLES.map((r) => (
              <th key={r} style={{ padding: "8px 6px", textAlign: "center", color: ROLE_COLORS[r], fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)", minWidth: "80px" }}>
                {ROLE_ICON[r]}<br />{ROLE_LABELS[r].split(" ")[0]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERM_GROUPS.map((group) => (
            <React.Fragment key={group.label}>
              <tr>
                <td colSpan={ALL_ROLES.length + 1} style={{ padding: "10px 10px 4px", color: "#6366f1", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {group.label}
                </td>
              </tr>
              {group.perms.map((perm) => (
                <tr key={perm} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "6px 10px", color: "#94a3b8" }}>{perm}</td>
                  {ALL_ROLES.map((r) => {
                    const hasIt = (ROLE_PERMISSIONS[r] as Permission[]).includes(perm);
                    return (
                      <td key={r} style={{ padding: "6px", textAlign: "center" }}>
                        {hasIt ? <span style={{ color: "#10b981" }}>✓</span> : <span style={{ color: "#1e293b" }}>–</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main IAM Admin Page ───────────────────────────────────────────────────────

export function IamAdminPage({ isDark = true }: { isDark?: boolean }) {
  const { session, tenantMembers, allTenants, can, changeRole, inviteMember } = useRbac();
  const [activeTab, setActiveTab] = useState<"members" | "tenants" | "matrix" | "session">("session");

  // Backend state
  const [backendMembers, setBackendMembers] = useState<BackendMember[]>([]);
  const [invitations, setInvitations] = useState<BackendInvitation[]>([]);
  const [quota, setQuota] = useState<BackendQuota | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const canManage = can("users:manage");
  const canRoles = can("roles:assign");

  // Chargement réel des membres depuis l'API REST v1 IAM
  const fetchIamData = useCallback(async () => {
    setIsLoading(true);
    setBackendError(null);
    try {
      const res = await apiClient.get("/iam/members");
      if (res.data?.success && res.data?.data) {
        setBackendMembers(res.data.data.members || []);
        setInvitations(res.data.data.invitations || []);
        setQuota(res.data.data.quota || null);
      }
    } catch (err: any) {
      // Fallback gracieux vers les membres mockés en cas de mode hors-ligne
      console.warn("[IamAdminPage] Fallback to local RBAC data:", err.message);
      setBackendError(err.response?.data?.error || null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIamData();
  }, [fetchIamData]);

  // Actions Backend avec synchronisation immédiate
  const handleBackendInvite = async (email: string, role: string) => {
    try {
      const backendRole = RBAC_TO_BACKEND_ROLE[role] || role.toLowerCase();
      const res = await apiClient.post("/iam/invitations", { email, role: backendRole });
      if (res.data?.success) {
        await fetchIamData();
        const fullUrl = res.data.data?.invitationUrl
          ? (typeof window !== "undefined" ? `${window.location.origin}${res.data.data.invitationUrl}` : res.data.data.invitationUrl)
          : undefined;
        return { success: true, invitationUrl: fullUrl };
      }
      return { success: false, error: res.data?.error?.message || res.data?.error || "Erreur lors de l'invitation." };
    } catch (err: any) {
      // Tenter le fallback local
      inviteMember({
        email,
        displayName: email.split("@")[0],
        role: role as RbacRole,
        tenantId: session?.tenantId || "default",
        isActive: true,
        mfaEnabled: false
      });
      return { success: false, error: err.response?.data?.error?.message || err.response?.data?.error || err.message };
    }
  };

  const handleBackendRoleChange = async (userId: string, newRole: RbacRole) => {
    try {
      const backendRole = RBAC_TO_BACKEND_ROLE[newRole] || "viewer";
      await apiClient.patch(`/iam/members/${userId}/role`, { role: backendRole });
      await fetchIamData();
    } catch {
      // Fallback local
      changeRole(userId, newRole);
    }
  };

  const handleBackendRemove = async (userId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce membre de l'organisation ?")) return;
    try {
      await apiClient.delete(`/iam/members/${userId}`);
      await fetchIamData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Impossible de supprimer ce membre.");
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await apiClient.delete(`/iam/invitations/${invitationId}`);
      await fetchIamData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Impossible d'annuler cette invitation.");
    }
  };

  // Fusion des membres réels avec les membres mockés si backend actif
  const displayMembers: TenantMember[] = backendMembers.length > 0
    ? backendMembers.map((bm) => ({
        userId: bm.id,
        email: bm.email,
        displayName: bm.name || bm.email.split("@")[0],
        role: BACKEND_TO_RBAC_ROLE[bm.role.toLowerCase()] || (bm.role as RbacRole) || "VIEWER",
        tenantId: session?.tenantId || "tenant-default",
        isActive: bm.isActive,
        mfaEnabled: true,
        invitedAt: bm.createdAt,
        invitedBy: "System"
      }))
    : tenantMembers;

  const TAB: React.CSSProperties = { padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#64748b", cursor: "pointer", fontSize: "12px", fontWeight: 500 };
  const TAB_ACTIVE: React.CSSProperties = { ...TAB, background: "rgba(99,102,241,0.15)", borderColor: "#6366f1", color: "#818cf8" };

  if (!session) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔐</div>
        <div style={{ fontSize: "16px", color: "#e2e8f0", fontWeight: 600 }}>Authentification requise</div>
        <div style={{ fontSize: "13px", marginTop: "8px" }}>Connectez-vous pour accéder à l'administration IAM.</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#020617",
      padding: "24px", fontFamily: "'Inter', sans-serif", color: "#e2e8f0",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Header Banner */}
      <PageHeaderBanner
        bannerImage="/banners/banner_17.png"
        bannerAlt="IAM Identités et Accès Multi-Tenant RBAC Banner"
        badge="IAM • Identités & Accès Multi-Tenant RBAC"
        badgeIcon={ShieldCheck}
        badgeColor="bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
        status={{ label: `ROLE: ${ROLE_LABELS[session.role]}`, color: "purple" }}
        title="IAM — Gestion des Identités & Accès"
        subtitle="Authentification entreprise multi-tenant · RBAC · SSO · Isolation PostgreSQL"
        description="Panneau d'administration centralisé pour la gestion des membres, invitations, permissions granulaires et isolation cryptographique multi-tenant."
        telemetry={[
          { label: "Tenants Actifs", value: `${allTenants.length}` },
          { label: "Membres Totaux", value: `${displayMembers.length}` },
          { label: "Session", value: session.displayName.split(" ")[0] },
          { label: "Auth Method", value: session.authMethod.toUpperCase(), isPositive: true }
        ]}
      />

      {/* Session badge */}
      <div style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          padding: "10px 14px", borderRadius: "10px", marginBottom: "16px",
          background: `${ROLE_COLORS[session.role]}10`,
          border: `1px solid ${ROLE_COLORS[session.role]}30`,
        }}>
          <span style={{ fontSize: "16px" }}>{ROLE_ICON[session.role]}</span>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: ROLE_COLORS[session.role] }}>
              {session.displayName} · {ROLE_LABELS[session.role]}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              {session.tenant.name} · {session.email} · via {session.authMethod.toUpperCase()}
            </div>
          </div>
        </div>

      {/* Tabs */}
      <div className="sticky top-0 z-20 -mx-2.5 sm:-mx-4 lg:-mx-5 px-2.5 sm:px-4 lg:px-5 py-2 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 shadow-xs">
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "session", label: "🔑 Ma session" },
            { id: "members", label: `👥 Membres (${displayMembers.length})` },
            { id: "tenants", label: "🏢 Tenants" },
            { id: "matrix", label: "🔒 Matrice RBAC" },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id as any)} style={activeTab === id ? TAB_ACTIVE : TAB}>{label}</button>
          ))}
        </div>
        <button
          onClick={fetchIamData}
          disabled={isLoading}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            padding: "6px 12px", borderRadius: "6px", color: "#94a3b8", fontSize: "11px", cursor: "pointer"
          }}
        >
          <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>
      </div>

      {/* Content */}
      <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px", marginTop: "16px" }}>

        {/* Session tab */}
        {activeTab === "session" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
            {[
              { label: "Utilisateur", value: session.displayName, icon: "👤" },
              { label: "Email", value: session.email, icon: "📧" },
              { label: "Rôle", value: ROLE_LABELS[session.role], icon: ROLE_ICON[session.role] },
              { label: "Tenant", value: session.tenant.name, icon: "🏢" },
              { label: "Tier", value: session.tenant.tier, icon: "⭐" },
              { label: "Méthode auth", value: session.authMethod.toUpperCase(), icon: "🔐" },
              { label: "Expiration session", value: new Date(session.sessionExpiresAt).toLocaleTimeString("fr-FR"), icon: "⏰" },
              { label: "Permissions", value: `${session.permissions.length} droits`, icon: "🔑" },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px" }}>{icon} {label}</div>
                <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 500 }}>{value}</div>
              </div>
            ))}
            {/* Permissions list */}
            <div style={{ gridColumn: "1/-1", padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "10px" }}>🔑 Permissions accordées</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {session.permissions.map((p) => (
                  <span key={p} style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "10px", background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>{p}</span>
                ))}
              </div>
            </div>
            {/* Features */}
            <div style={{ gridColumn: "1/-1", padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "10px" }}>🏢 Fonctionnalités tenant activées</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {Object.entries(session.tenant.features).map(([k, v]) => (
                  <span key={k} style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", background: v ? "rgba(0,229,160,0.1)" : "rgba(100,116,139,0.1)", color: v ? "#00e5a0" : "#475569", border: `1px solid ${v ? "rgba(0,229,160,0.2)" : "rgba(100,116,139,0.1)"}` }}>
                    {v ? "✓" : "✗"} {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Members tab */}
        {activeTab === "members" && (
          <div>
            {/* Quota Banner */}
            {quota && (
              <div style={{
                marginBottom: "16px", padding: "12px 16px", borderRadius: "10px",
                background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
                display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <ShieldCheck className="text-indigo-400" size={18} />
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0" }}>Quota Utilisateurs : </span>
                    <span style={{ fontSize: "12px", color: "#818cf8" }}>{quota.activeUsers} actifs / {quota.maxUsers} max</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "#94a3b8" }}>
                  <span>Invitations en attente : <strong style={{ color: "#f59e0b" }}>{quota.pendingInvitations}</strong></span>
                  <span>Places restantes : <strong style={{ color: "#10b981" }}>{quota.remainingSlots}</strong></span>
                </div>
              </div>
            )}

            {canManage && (
              <div style={{ marginBottom: "20px", padding: "16px", background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "10px" }}>
                <div style={{ fontSize: "12px", color: "#818cf8", fontWeight: 600, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <UserPlus size={14} /> Inviter un collaborateur dans l'organisation
                </div>
                <InviteForm onInviteSubmit={handleBackendInvite} />
              </div>
            )}

            {/* Pending Invitations list */}
            {invitations.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 600, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Mail size={13} /> Invitations en attente ({invitations.length})
                </div>
                <div style={{ overflowX: "auto", background: "rgba(245,158,11,0.03)", borderRadius: "8px", border: "1px solid rgba(245,158,11,0.1)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(245,158,11,0.1)", color: "#94a3b8" }}>
                        <th style={{ padding: "8px 10px", textAlign: "left" }}>Email</th>
                        <th style={{ padding: "8px 10px", textAlign: "left" }}>Rôle assigné</th>
                        <th style={{ padding: "8px 10px", textAlign: "left" }}>Expire le</th>
                        <th style={{ padding: "8px 10px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invitations.map((inv) => (
                        <tr key={inv.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          <td style={{ padding: "8px 10px", color: "#e2e8f0" }}>{inv.email}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <Badge label={ROLE_LABELS[inv.role as RbacRole] || inv.role} color="#6366f1" />
                          </td>
                          <td style={{ padding: "8px 10px", color: "#64748b" }}>
                            {new Date(inv.expiresAt).toLocaleDateString("fr-FR")}
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "right" }}>
                            <button
                              onClick={() => handleCancelInvitation(inv.id)}
                              style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "11px" }}
                            >
                              Annuler
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
              {displayMembers.length} membre(s) actif(s) dans l'organisation
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["Membre", "Rôle", "Statut", "Inscrit le", ...(canManage ? ["Action"] : [])].map((h) => (
                      <th key={h} style={{ padding: "10px", textAlign: h === "Action" ? "right" : "left", fontSize: "11px", color: "#64748b", fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayMembers.map((m) => (
                    <MemberRow
                      key={m.userId}
                      member={m}
                      canManage={canRoles}
                      onRoleChange={handleBackendRoleChange}
                      onRemove={canManage ? handleBackendRemove : undefined}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tenants tab */}
        {activeTab === "tenants" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
            {allTenants.map((t) => (
              <div key={t.id} style={{ padding: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🏢</div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>{t.name}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{t.domain}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                  <Badge label={t.tier} color={t.tier === "ENTERPRISE" ? "#f59e0b" : t.tier === "PRO" ? "#6366f1" : "#64748b"} />
                  <Badge label={`SSO: ${t.ssoProvider ?? "none"}`} color="#06b6d4" />
                  <Badge label={`Max ${t.maxUsers} users`} color="#8b5cf6" />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {Object.entries(t.features).map(([k, v]) => v && (
                    <span key={k} style={{ fontSize: "10px", color: "#00e5a0", background: "rgba(0,229,160,0.08)", padding: "2px 6px", borderRadius: "4px" }}>✓ {k}</span>
                  ))}
                </div>
                {t.contractExpiry && (
                  <div style={{ marginTop: "8px", fontSize: "11px", color: "#475569" }}>
                    Contrat jusqu'au {new Date(t.contractExpiry).toLocaleDateString("fr-FR")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Matrix tab */}
        {activeTab === "matrix" && (
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
              Matrice des permissions par rôle — <span style={{ color: "#10b981" }}>✓</span> accordé · <span style={{ color: "#1e293b" }}>–</span> refusé
            </div>
            <PermissionMatrix />
          </div>
        )}
      </div>
    </div>
  );
}

export default IamAdminPage;
