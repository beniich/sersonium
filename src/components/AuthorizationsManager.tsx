import React, { useState } from "react";
import { RolePermission, TeamMemberWithPermissions } from "../types";
import { 
  Shield, Users, Check, X, Plus, AlertCircle, 
  CheckCircle2, Lock, UserCheck, Key, RefreshCw, Trash2
} from "lucide-react";
import { logAuditEvent } from "../hooks/useGlobalState";

interface AuthorizationsManagerProps {
  roles: RolePermission[];
  members: TeamMemberWithPermissions[];
  onUpdateRoles: (newRoles: RolePermission[]) => void;
  onUpdateMembers: (newMembers: TeamMemberWithPermissions[]) => void;
  isDark: boolean;
}

export default function AuthorizationsManager({
  roles,
  members,
  onUpdateRoles,
  onUpdateMembers,
  isDark
}: AuthorizationsManagerProps) {
  const [roleList, setRoleList] = useState<RolePermission[]>(roles);
  const [memberList, setMemberList] = useState<TeamMemberWithPermissions[]>(members);
  const [activeTab, setActiveTab] = useState<"matrix" | "members">("matrix");
  const [notification, setNotification] = useState<string | null>(null);
  
  // Member invite modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    roleId: "role-tenant-admin",
    mfaEnabled: true
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Toggle permission for a role
  const handleTogglePermission = async (roleId: string, permKey: keyof RolePermission["permissions"]) => {
    const updated = roleList.map(r => {
      if (r.id === roleId) {
        if (r.isSystem && roleId === "role-super-admin") {
          showNotification("The Super Administrator (Root) role mandatorily retains all privileges.");
          return r;
        }
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [permKey]: !r.permissions[permKey]
          }
        };
      }
      return r;
    });

    setRoleList(updated);
    onUpdateRoles(updated);
    const targetRole = roleList.find(r => r.id === roleId);
    await logAuditEvent("RBAC_PERMISSION_TOGGLE", `Modified permission [${String(permKey)}] for role ${targetRole?.roleName}`);
    showNotification(`Authorization updated for ${targetRole?.roleName}`);
  };

  // Change member role
  const handleChangeMemberRole = async (memberId: string, newRoleId: string) => {
    const updated = memberList.map(m => {
      if (m.id === memberId) {
        return { ...m, roleId: newRoleId };
      }
      return m;
    });

    setMemberList(updated);
    onUpdateMembers(updated);
    const m = memberList.find(mem => mem.id === memberId);
    const r = roleList.find(rol => rol.id === newRoleId);
    await logAuditEvent("MEMBER_ROLE_CHANGE", `Reassigned role for ${m?.email} to ${r?.roleName}`);
    showNotification(`Role updated for ${m?.name}`);
  };

  // Invite member
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;

    const memberToAdd: TeamMemberWithPermissions = {
      id: `mbr-${Date.now()}`,
      name: newMember.name,
      email: newMember.email,
      roleId: newMember.roleId,
      status: "active",
      mfaEnabled: newMember.mfaEnabled,
      lastLoginAt: new Date().toISOString(),
      tenant: "lacaza.clouindustrie.com"
    };

    const updated = [memberToAdd, ...memberList];
    setMemberList(updated);
    onUpdateMembers(updated);
    await logAuditEvent("MEMBER_INVITED", `Member invitation: ${memberToAdd.name} (${memberToAdd.email}) with role ${memberToAdd.roleId}`);
    
    setIsInviteModalOpen(false);
    setNewMember({
      name: "",
      email: "",
      roleId: "role-tenant-admin",
      mfaEnabled: true
    });
    showNotification("New member invited successfully!");
  };

  // Remove member
  const handleRemoveMember = async (id: string) => {
    const member = memberList.find(m => m.id === id);
    if (member?.email === "beniich.contact@gmail.com") {
      showNotification("Cannot delete the primary Super Administrator account.");
      return;
    }
    const updated = memberList.filter(m => m.id !== id);
    setMemberList(updated);
    onUpdateMembers(updated);
    await logAuditEvent("MEMBER_REMOVED", `Removed access for ${member?.email}`);
    showNotification(`Access revoked for ${member?.name}`);
  };

  const permissionDefinitions: { key: keyof RolePermission["permissions"]; label: string; desc: string }[] = [
    { key: "canManageUrlsAndRedirects", label: "URL & Redirection Management", desc: "Create and edit LACAZA 301/302 redirection rules" },
    { key: "canManageDomains", label: "Domains & SSL Certificates", desc: "Subdomain configuration, HSTS, and TLS settings" },
    { key: "canManagePayPal", label: "PayPal Gateway Configuration", desc: "Edit API keys, Webhooks, and PayPal merchant setup" },
    { key: "canProcessPayments", label: "Payments & Edge Top-ups", desc: "Authorize settlements and purchase edge capacity plans" },
    { key: "canManageRoles", label: "Permissions & Roles Management", desc: "Assign permissions and invite workspace users" },
    { key: "canManageGoogleAuth", label: "Google Authentication & SSO", desc: "Configure Google Identity Services and authorized domains" },
    { key: "canManageEdgeNetwork", label: "Network Infrastructure & DNS", desc: "Manage Anycast DNS records and traffic routing" },
    { key: "canViewAuditLogs", label: "Cryptographic Audit Logs", desc: "View complete audit trail of verified security actions" },
    { key: "canExecuteWAFMitigation", label: "Firewall & Edge WAF Mitigation", desc: "Block IP addresses and filter DDoS attack traffic" }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent dark:border-indigo-500/20 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-600 text-white flex items-center gap-1.5 shadow-xs">
                <Shield className="w-3.5 h-3.5" />
                RBAC Matrix
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                MFA Enforced for Administrators
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400">
                Tenant: lacaza.clouindustrie.com
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Authorizations & Access Control Management (RBAC)
            </h2>
            <p className="text-xs text-slate-600 dark:text-neutral-400">
              Define granular privileges for URL redirections, PayPal gateway, Google authentication, and network security.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Invite User
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mt-5 pt-4 border-t border-indigo-500/15">
          <button
            onClick={() => setActiveTab("matrix")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "matrix"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white/80 dark:bg-neutral-800/80 text-slate-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Privileges Matrix ({roleList.length} Roles)
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "members"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white/80 dark:bg-neutral-800/80 text-slate-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Members & Accounts ({memberList.length} Active)
          </button>
        </div>
      </div>

      {/* Tab: Matrix */}
      {activeTab === "matrix" && (
        <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Roles & Granular Permissions Grid
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Toggle checks to grant or revoke an access privilege for a given role.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400">
                <tr>
                  <th className="px-4 py-3 font-semibold min-w-[240px]">Permission / Scope</th>
                  {roleList.map(role => (
                    <th key={role.id} className="px-3 py-3 text-center min-w-[140px]">
                      <div className="font-bold text-slate-900 dark:text-white">{role.roleName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {role.isSystem ? "(System)" : `(${role.usersCount} users)`}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                {permissionDefinitions.map(p => (
                  <tr key={p.key} className="hover:bg-slate-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800 dark:text-neutral-200">{p.label}</div>
                      <div className="text-[11px] text-slate-400 dark:text-neutral-500">{p.desc}</div>
                    </td>
                    {roleList.map(role => {
                      const isGranted = role.permissions[p.key];
                      return (
                        <td key={role.id} className="px-3 py-3 text-center">
                          <button
                            disabled={role.id === "role-super-admin"}
                            onClick={() => handleTogglePermission(role.id, p.key)}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                              isGranted
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900"
                                : "bg-slate-100 text-slate-400 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700"
                            } ${role.id === "role-super-admin" ? "cursor-not-allowed opacity-90" : ""}`}
                            title={role.id === "role-super-admin" ? "Locked for Super Administrator" : "Toggle authorization"}
                          >
                            {isGranted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Members */}
      {activeTab === "members" && (
        <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/50 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                User Accounts & Role Assignments
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Accounts connected to lacaza.clouindustrie.com tenant
              </p>
            </div>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Invite
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 font-semibold">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">MFA (2FA)</th>
                  <th className="px-4 py-3">Last Login</th>
                  <th className="px-4 py-3">Tenant</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                {memberList.map(member => (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{member.name}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{member.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        disabled={member.email === "beniich.contact@gmail.com"}
                        value={member.roleId}
                        onChange={e => handleChangeMemberRole(member.id, e.target.value)}
                        className="bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 disabled:opacity-75 cursor-pointer"
                      >
                        {roleList.map(r => (
                          <option key={r.id} value={r.id}>{r.roleName}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        member.mfaEnabled 
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400"
                      }`}>
                        {member.mfaEnabled ? "Active (FIDO2/TOTP)" : "Not configured"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {new Date(member.lastLoginAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-neutral-400">
                      {member.tenant}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {member.email !== "beniich.contact@gmail.com" && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                          title="Revoke access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-2xl w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Invite Team Member
                </h3>
                <p className="text-xs text-slate-500">
                  Assign access permissions for lacaza.clouindustrie.com
                </p>
              </div>
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={newMember.name}
                  onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="e.g., Sarah Martin"
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={newMember.email}
                  onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="colleague@lacaza.clouindustrie.com"
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                  Role & Assigned Privileges
                </label>
                <select
                  value={newMember.roleId}
                  onChange={e => setNewMember({ ...newMember, roleId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {roleList.filter(r => r.id !== "role-super-admin").map(r => (
                    <option key={r.id} value={r.id}>{r.roleName}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="chk-mfa"
                  type="checkbox"
                  checked={newMember.mfaEnabled}
                  onChange={e => setNewMember({ ...newMember, mfaEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                />
                <label htmlFor="chk-mfa" className="text-xs text-slate-700 dark:text-neutral-300 cursor-pointer">
                  Enforce Two-Factor Authentication (MFA)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
