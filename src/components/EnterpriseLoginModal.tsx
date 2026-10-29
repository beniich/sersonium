import React, { useState } from "react";
import { ShieldCheck, Building2, HardHat, Wrench, X, Lock, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRbac, RbacRole } from "../bridge/useRbac";

export interface EnterpriseLoginModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ProfileItem {
  role: RbacRole;
  tenantId: string;
  roleLabel: string;
  org: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}

const profiles: ProfileItem[] = [
  { 
    role: "SUPER_ADMIN", 
    tenantId: "tenant-demo", 
    roleLabel: "Super Administrateur", 
    org: "Sensorium Demo Corp", 
    desc: "Accès total cross-tenant", 
    icon: <ShieldCheck size={20} />, 
    color: "text-purple-400" 
  },
  { 
    role: "TENANT_ADMIN", 
    tenantId: "tenant-cmr", 
    roleLabel: "Administrateur Tenant", 
    org: "Airbus Defence & Space (CMR)", 
    desc: "Admin CMR — Toutes les fonctions", 
    icon: <Building2 size={20} />, 
    color: "text-blue-400" 
  },
  { 
    role: "FACILITY_LEAD", 
    tenantId: "tenant-cmr", 
    roleLabel: "Responsable Site", 
    org: "Airbus Defence & Space (CMR)", 
    desc: "Supervision installations & CAFM", 
    icon: <HardHat size={20} />, 
    color: "text-emerald-400" 
  },
  { 
    role: "FIELD_TECHNICIAN", 
    tenantId: "tenant-cmr", 
    roleLabel: "Technicien Terrain", 
    org: "Airbus Defence & Space (CMR)", 
    desc: "Interventions terrain GMAO", 
    icon: <Wrench size={20} />, 
    color: "text-orange-400" 
  },
];

export const EnterpriseLoginModal: React.FC<EnterpriseLoginModalProps> = ({ 
  isOpen = true, 
  onClose, 
  onSuccess 
}) => {
  const { loginWithEmail, loginAsMock } = useRbac();
  const [activeTab, setActiveTab] = useState<"demo" | "email" | "sso">("demo");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectProfile = (role: RbacRole, tenantId: string) => {
    loginAsMock(role, tenantId);
    onSuccess?.();
    onClose();
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await loginWithEmail(email, password);
    setLoading(false);
    if (result.success) {
      onSuccess?.();
      onClose();
    } else {
      setError(result.error ?? "Erreur de connexion.");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#0f111a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-indigo-950/40 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-none">Authentification Entreprise</h2>
              <p className="text-gray-500 text-[10px] sm:text-xs mt-1 uppercase tracking-widest font-mono">
                Multi-tenant • RBAC • SSO
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-black/30 border-b border-gray-800 gap-1">
          <button 
            onClick={() => setActiveTab("demo")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "demo"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            }`}
          >
            Démo Rapide
          </button>
          <button 
            onClick={() => setActiveTab("email")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "email"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            }`}
          >
            Email / MDP
          </button>
          <button 
            onClick={() => setActiveTab("sso")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "sso"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            }`}
          >
            SSO Entreprise
          </button>
        </div>

        {/* Tab 1 : Profiles List */}
        {activeTab === "demo" && (
          <div className="p-5 sm:p-6 space-y-2.5 max-h-[60vh] overflow-y-auto no-scrollbar">
            <p className="text-gray-400 text-xs mb-3">
              Sélectionnez un profil pour explorer les permissions RBAC en mode souverain :
            </p>
            {profiles.map((p) => (
              <div 
                key={p.role} 
                onClick={() => handleSelectProfile(p.role, p.tenantId)}
                className="group flex items-center justify-between p-3 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-indigo-500/50 transition-all cursor-pointer hover:bg-gray-800/60"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2 rounded-lg bg-gray-800/80 border border-gray-700/50 ${p.color}`}>
                    {p.icon}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className={`font-bold text-xs sm:text-sm ${p.color}`}>{p.roleLabel}</span>
                    <span className="text-gray-400 text-[11px] mt-0.5">{p.org}</span>
                    <span className="text-gray-500 text-[10px] mt-0.5 italic">{p.desc}</span>
                  </div>
                </div>
                <div className="text-gray-600 group-hover:text-indigo-400 transition-colors pr-1">
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2 : Email & Password */}
        {activeTab === "email" && (
          <form onSubmit={handleEmailLogin} className="p-5 sm:p-6 space-y-3.5">
            {error && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Adresse Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sensorium.corp"
                  required
                  className="w-full bg-gray-900/80 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-gray-900/80 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer mt-2"
            >
              {loading ? "Vérification..." : "Se connecter"}
            </button>
          </form>
        )}

        {/* Tab 3 : SSO Entreprise */}
        {activeTab === "sso" && (
          <div className="p-5 sm:p-6 space-y-3">
            <p className="text-xs text-gray-400">
              Authentification fédérée SAML 2.0 / OpenID Connect pour grands comptes :
            </p>
            {["Okta Enterprise SSO", "Azure Active Directory (Entra ID)", "Keycloak Sovereign IDP"].map((provider) => (
              <button
                key={provider}
                onClick={() => handleSelectProfile("TENANT_ADMIN", "tenant-cmr")}
                className="w-full p-2.5 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-indigo-500/50 text-left text-xs text-gray-200 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>{provider}</span>
                <CheckCircle2 size={14} className="text-emerald-400" />
              </button>
            ))}
          </div>
        )}

      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
    </div>
  );
};

export default EnterpriseLoginModal;
