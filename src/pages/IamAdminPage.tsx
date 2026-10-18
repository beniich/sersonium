import React, { useState } from "react";
import { useRbac, ROLE_LABELS, ROLE_COLORS, RbacRole, TenantMember, Tenant } from "../bridge/useRbac";
import { MOCK_TENANTS, ROLE_PERMISSIONS } from "../services/rbac.service";
import type { Permission } from "../services/rbac.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_ICON: Record<RbacRole, string> = {
  SUPER_ADMIN: "👑", TENANT_ADMIN: "🏢", FACILITY_LEAD: "🏗️",
  FIELD_TECHNICIAN: "🔧", CSRD_AUDITOR: "📋", VIEWER: "👁️",
};

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 600,
      background: `${color}20`, color, border: `1px solid ${color}40`,
    }}>{label}</span>
  );
}

// ─── Member Row ────────────────────────────────────────────────────────────────

function MemberRow({ member, canManage, onRoleChange }: {
  member: TenantMember;
  canManage: boolean;
  onRoleChange: (userId: string, role: RbacRole) => void;
}) {
  const color = ROLE_COLORS[member.role];
  const [editing, setEditing] = useState(false);
  const [newRole, setNewRole] = useState<RbacRole>(member.role);

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
              style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px", color: "#e2e8f0", fontSize: "11px", padding: "4px 8px",
              }}
            >
              {(Object.keys(ROLE_LABELS) as RbacRole[]).map((r) => (
                <option key={r} value={r} style={{ background: "#0f172a" }}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
            <button onClick={() => { onRoleChange(member.userId, newRole); setEditing(false); }}
              style={{ padding: "3px 8px", borderRadius: "4px", background: "#10b981", border: "none", color: "white", fontSize: "10px", cursor: "pointer" }}>✓</button>
            <button onClick={() => setEditing(false)}
              style={{ padding: "3px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#64748b", fontSize: "10px", cursor: "pointer" }}>✕</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "14px" }}>{ROLE_ICON[member.role]}</span>
            <Badge label={ROLE_LABELS[member.role]} color={ROLE_COLORS[member.role]} />
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
        {new Date(member.invitedAt).toLocaleDateString("fr-FR")}
      </td>
    </tr>
  );
}

// ─── Invite Form ───────────────────────────────────────────────────────────────

function InviteForm({ tenantId, onInvite }: { tenantId: string; onInvite: (m: Omit<TenantMember, "userId" | "invitedAt" | "invitedBy">) => { success: boolean; error?: string } }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<RbacRole>("VIEWER");
  const [result, setResult] = useState<{ success?: boolean; error?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = onInvite({ email, displayName: name, role, tenantId, isActive: true, mfaEnabled: false });
    setResult(r);
    if (r.success) { setEmail(""); setName(""); setRole("VIEWER"); }
  };

  const INPUT: React.CSSProperties = {
    padding: "8px 12px", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px",
    color: "#e2e8f0", fontSize: "12px", outline: "none",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "flex-end" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", color: "#64748b" }}>Nom complet</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Prénom Nom" style={{ ...INPUT, width: "160px" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", color: "#64748b" }}>Email professionnel</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="user@domaine.com" style={{ ...INPUT, width: "200px" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", color: "#64748b" }}>Rôle</label>
        <select value={role} onChange={(e) => setRole(e.target.value as RbacRole)} style={{ ...INPUT }}>
          {(Object.keys(ROLE_LABELS) as RbacRole[]).map((r) => (
            <option key={r} value={r} style={{ background: "#0f172a" }}>{ROLE_ICON[r]} {ROLE_LABELS[r]}</option>
          ))}
        </select>
      </div>
      <button type="submit" style={{
        padding: "8px 16px", borderRadius: "8px",
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        border: "none", color: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer",
      }}>+ Inviter</button>
      {result.success && <span style={{ fontSize: "12px", color: "#10b981" }}>✓ Invitation envoyée</span>}
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

  const canManage = can("users:manage");
  const canRoles = can("roles:assign");

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

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🔐</div>
          <div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, background: "linear-gradient(135deg, #6366f1, #00e5a0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              IAM — Gestion des Identités & Accès
            </h1>
            <div style={{ fontSize: "12px", color: "#475569" }}>
              Authentification entreprise multi-tenant · RBAC · SSO · Audit
            </div>
          </div>
        </div>

        {/* Session badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          padding: "10px 14px", borderRadius: "10px",
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
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-20 -mx-2.5 sm:-mx-4 lg:-mx-5 px-2.5 sm:px-4 lg:px-5 py-2 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 shadow-xs">
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {[
          { id: "session", label: "🔑 Ma session" },
          { id: "members", label: "👥 Membres" },
          { id: "tenants", label: "🏢 Tenants" },
          { id: "matrix", label: "🔒 Matrice RBAC" },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id as any)} style={activeTab === id ? TAB_ACTIVE : TAB}>{label}</button>
        ))}
      </div>
      </div>

      {/* Content */}
      <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px" }}>

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
            {canManage && (
              <div style={{ marginBottom: "20px", padding: "16px", background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "10px" }}>
                <div style={{ fontSize: "12px", color: "#818cf8", fontWeight: 600, marginBottom: "12px" }}>Inviter un nouveau membre</div>
                <InviteForm tenantId={session.tenantId} onInvite={inviteMember} />
              </div>
            )}
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
              {tenantMembers.length} membre(s) dans {session.tenant.name}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["Membre", "Rôle", "Statut", "Invité le"].map((h) => (
                      <th key={h} style={{ padding: "10px", textAlign: "left", fontSize: "11px", color: "#64748b", fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tenantMembers.map((m) => (
                    <MemberRow key={m.userId} member={m} canManage={canRoles} onRoleChange={changeRole} />
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
