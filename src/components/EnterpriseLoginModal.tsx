import React, { useState } from "react";
import { useRbac, ROLE_LABELS, RbacRole, Tenant } from "../bridge/useRbac";
import { MOCK_TENANTS } from "../services/rbac.service";

interface EnterpriseLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DEMO_ROLES: { role: RbacRole; tenantId: string; description: string }[] = [
  { role: "SUPER_ADMIN", tenantId: "tenant-demo", description: "Accès total cross-tenant" },
  { role: "TENANT_ADMIN", tenantId: "tenant-cmr", description: "Admin CMR — Toutes les fonctions" },
  { role: "FACILITY_LEAD", tenantId: "tenant-cmr", description: "Responsable site CMR" },
  { role: "FIELD_TECHNICIAN", tenantId: "tenant-cmr", description: "Technicien terrain GMAO" },
  { role: "CSRD_AUDITOR", tenantId: "tenant-cdc", description: "Auditeur CDC — Lecture seule audit" },
  { role: "VIEWER", tenantId: "tenant-demo", description: "Observateur sans action" },
];

const ROLE_ICON: Record<RbacRole, string> = {
  SUPER_ADMIN: "👑",
  TENANT_ADMIN: "🏢",
  FACILITY_LEAD: "🏗️",
  FIELD_TECHNICIAN: "🔧",
  CSRD_AUDITOR: "📋",
  VIEWER: "👁️",
};

const ROLE_COLORS: Record<RbacRole, string> = {
  SUPER_ADMIN: "#ef4444",
  TENANT_ADMIN: "#f59e0b",
  FACILITY_LEAD: "#6366f1",
  FIELD_TECHNICIAN: "#10b981",
  CSRD_AUDITOR: "#06b6d4",
  VIEWER: "#64748b",
};

export function EnterpriseLoginModal({ isOpen, onClose, onSuccess }: EnterpriseLoginModalProps) {
  const { loginWithEmail, loginAsMock, session } = useRbac();
  const [tab, setTab] = useState<"email" | "sso" | "demo">("demo");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant>(MOCK_TENANTS[0]);

  if (!isOpen) return null;

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const result = await loginWithEmail(email, password);
    setLoading(false);
    if (result.success) { onSuccess?.(); onClose(); }
    else setError(result.error ?? "Erreur inconnue");
  };

  const handleMock = (role: RbacRole, tenantId: string) => {
    loginAsMock(role, tenantId);
    onSuccess?.();
    onClose();
  };

  const TAB_STYLE = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px", borderRadius: "8px", border: "none",
    background: active ? "rgba(99,102,241,0.2)" : "transparent",
    color: active ? "#818cf8" : "#64748b",
    cursor: "pointer", fontSize: "13px", fontWeight: 500,
    transition: "all 0.2s",
    borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
  });

  const INPUT_STYLE: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px", color: "#e2e8f0", fontSize: "13px",
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: "min(520px, 95vw)", maxHeight: "90vh", overflowY: "auto",
        background: "linear-gradient(145deg, #0f172a, #1e1b4b)",
        border: "1px solid rgba(99,102,241,0.3)", borderRadius: "20px",
        padding: "28px", boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🔐</div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#e2e8f0" }}>Authentification Entreprise</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Multi-tenant · RBAC · SSO</div>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "20px" }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "4px" }}>
          <button style={TAB_STYLE(tab === "demo")} onClick={() => setTab("demo")}>🧪 Démo Rapide</button>
          <button style={TAB_STYLE(tab === "email")} onClick={() => setTab("email")}>📧 Email / MdP</button>
          <button style={TAB_STYLE(tab === "sso")} onClick={() => setTab("sso")}>🏢 SSO Entreprise</button>
        </div>

        {/* Demo tab */}
        {tab === "demo" && (
          <div>
            <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>
              Sélectionnez un profil pour explorer les permissions RBAC en mode démonstration.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {DEMO_ROLES.map(({ role, tenantId, description }) => {
                const tenant = MOCK_TENANTS.find((t) => t.id === tenantId);
                const color = ROLE_COLORS[role];
                return (
                  <button
                    key={role}
                    onClick={() => handleMock(role, tenantId)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "12px 14px", borderRadius: "10px",
                      background: `${color}10`, border: `1px solid ${color}30`,
                      cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = `${color}20`)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = `${color}10`)}
                  >
                    <span style={{ fontSize: "22px" }}>{ROLE_ICON[role]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color }}>
                        {ROLE_LABELS[role]}
                        <span style={{ marginLeft: "8px", fontSize: "10px", color: "#64748b", fontWeight: 400 }}>
                          {tenant?.name}
                        </span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{description}</div>
                    </div>
                    <span style={{ fontSize: "16px", color: "#475569" }}>→</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Email tab */}
        {tab === "email" && (
          <form onSubmit={handleEmail} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontSize: "12px", color: "#94a3b8" }}>
              Connexion avec email/mot de passe (comptes de démonstration disponibles).
            </p>
            {[
              { label: "Email professionnel", value: email, setter: setEmail, placeholder: "admin@cmr.ma", type: "email" },
              { label: "Mot de passe", value: password, setter: setPassword, placeholder: "••••••••", type: "password" },
            ].map(({ label, value, setter, placeholder, type }) => (
              <label key={label} style={{ fontSize: "12px", color: "#94a3b8" }}>
                {label}
                <input type={type} value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder} required style={{ ...INPUT_STYLE, display: "block", marginTop: "6px" }} />
              </label>
            ))}
            {error && (
              <div style={{ padding: "8px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", fontSize: "12px", color: "#ef4444" }}>
                {error}
              </div>
            )}
            <div style={{ fontSize: "11px", color: "#475569", background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px" }}>
              <strong style={{ color: "#64748b" }}>Comptes de démo :</strong><br />
              admin@cmr.ma · benali@cmr.ma · tech1@cmr.ma · auditor@cmr.ma
            </div>
            <button type="submit" disabled={loading} style={{
              padding: "11px", borderRadius: "8px",
              background: loading ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none", color: "white", fontWeight: 600, fontSize: "13px", cursor: loading ? "not-allowed" : "pointer",
            }}>
              {loading ? "Connexion…" : "Se connecter →"}
            </button>
          </form>
        )}

        {/* SSO tab */}
        {tab === "sso" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "12px", color: "#94a3b8" }}>
              Sélectionnez votre organisation pour une connexion SSO (Azure AD, Google Workspace, SAML 2.0).
            </p>
            <label style={{ fontSize: "12px", color: "#94a3b8" }}>
              Organisation / Tenant
              <select
                value={selectedTenant.id}
                onChange={(e) => setSelectedTenant(MOCK_TENANTS.find((t) => t.id === e.target.value) ?? MOCK_TENANTS[0])}
                style={{ ...INPUT_STYLE, display: "block", marginTop: "6px" }}
              >
                {MOCK_TENANTS.map((t) => (
                  <option key={t.id} value={t.id} style={{ background: "#1e1b4b" }}>{t.name} ({t.domain})</option>
                ))}
              </select>
            </label>

            {/* SSO Provider */}
            <div style={{ padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "10px" }}>Fournisseur d'identité détecté :</div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>
                  {selectedTenant.ssoProvider === "google" ? "🌐" : selectedTenant.ssoProvider === "azure_ad" ? "🔷" : selectedTenant.ssoProvider === "saml" ? "🔐" : "🔑"}
                </span>
                <div>
                  <div style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 500 }}>
                    {selectedTenant.ssoProvider === "google" ? "Google Workspace" :
                     selectedTenant.ssoProvider === "azure_ad" ? "Azure Active Directory" :
                     selectedTenant.ssoProvider === "saml" ? "SAML 2.0" : "Okta"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    {selectedTenant.ssoProvider === "azure_ad" ? `Tenant: ${selectedTenant.ssoConfig?.tenantId}` :
                     selectedTenant.ssoProvider === "saml" ? `Entity: ${selectedTenant.ssoConfig?.samlEntityId}` : selectedTenant.domain}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleMock("TENANT_ADMIN", selectedTenant.id)}
              style={{
                padding: "11px", borderRadius: "8px",
                background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                border: "none", color: "white", fontWeight: 600, fontSize: "13px", cursor: "pointer",
              }}
            >
              🔐 Connexion SSO via {selectedTenant.name} →
            </button>
            <div style={{ fontSize: "11px", color: "#475569", textAlign: "center" }}>
              En production, redirige vers l'IdP de votre organisation.<br />
              MFA obligatoire pour les rôles Admin et Technicien.
            </div>
          </div>
        )}

        {/* Current session */}
        {session && (
          <div style={{ marginTop: "20px", padding: "12px", background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: "10px" }}>
            <div style={{ fontSize: "11px", color: "#64748b" }}>Session active</div>
            <div style={{ fontSize: "13px", color: "#00e5a0", fontWeight: 600 }}>{session.displayName} · {ROLE_LABELS[session.role]}</div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>{session.tenant.name}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnterpriseLoginModal;
