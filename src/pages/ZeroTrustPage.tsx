import React, { useState } from "react";
import { GlobalState } from "../types";
import { Users, Lock, ShieldCheck, Plus, X, Globe, Laptop, Radio, Trash2, CheckCircle2 } from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { logAuditEvent } from "../hooks/useGlobalState";

interface ZeroTrustPageProps {
  state: GlobalState;
  isDark: boolean;
  activeItemId?: string;
  onSelectTab?: (id: string) => void;
}

const TABS = [
  { id: "zt-1", label: "Access Policies" },
  { id: "zt-2", label: "Identity Providers" },
  { id: "zt-3", label: "Gateway" },
  { id: "zt-4", label: "DEX" },
  { id: "zt-5", label: "Browser Isolation" }
];

export default function ZeroTrustPage({ state, isDark, activeItemId = "zt-1", onSelectTab }: ZeroTrustPageProps) {
  const currentTab = TABS.some(t => t.id === activeItemId) ? activeItemId : "zt-1";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    name: "",
    action: "Allow" as const,
    users: "",
    status: "Active" as const
  });

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicy.name || !newPolicy.users) return;
    
    setIsSubmitting(true);
    try {
      const colRef = collection(db, "ztPolicies");
      const docRef = await addDoc(colRef, {
        ...newPolicy,
      });
      await updateDoc(doc(db, "ztPolicies", docRef.id), { id: docRef.id });
      await logAuditEvent("ZT_POLICY_CREATE", `Created policy '${newPolicy.name}' (${newPolicy.action})`);
      
      setIsModalOpen(false);
      setNewPolicy({ name: "", action: "Allow", users: "", status: "Active" });
    } catch (err) {
      console.error("Failed to add policy", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePolicy = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, "ztPolicies", id));
      await logAuditEvent("ZT_POLICY_DELETE", `Deleted access policy ${name}`);
    } catch (err) {
      console.error("Failed to delete policy", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 dark:border-neutral-800 pb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Zero Trust & Identity</h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">enterprise.jeton.com / Identity-Aware Proxy & Secure Web Gateway</p>
        </div>
        {currentTab === "zt-1" && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Policy
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 border-b border-slate-200 dark:border-neutral-800 pb-px">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onSelectTab && onSelectTab(tab.id)}
            className={`px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === tab.id
                ? "bg-white dark:bg-neutral-900 border-t-2 border-l border-r border-t-orange-500 border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-neutral-400 mb-2">
            <Lock className="w-4 h-4 text-orange-500" /> Active Access Policies
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{(state.ztPolicies || []).length}</div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">Enforced at Edge POPs</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-neutral-400 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Device Posture Score
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">100% Compliant</div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">CrowdStrike & Disk Encryption verified</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-neutral-400 mb-2">
            <Users className="w-4 h-4 text-blue-500" /> Identity Provider (IdP)
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">Okta + Google</div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">SAML 2.0 / OIDC Connected</div>
        </div>
      </div>

      {/* Sub-View: Access Policies (zt-1) */}
      {currentTab === "zt-1" && (
        <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Configured Access Policies</h3>
            <span className="text-xs text-slate-500 dark:text-neutral-400 font-mono">Zero Trust Network Access (ZTNA)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 font-sans">
                <tr>
                  <th className="p-3">Policy Name</th>
                  <th className="p-3">Decision</th>
                  <th className="p-3">Eligible Users / Groups</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                {(state.ztPolicies || []).map(policy => (
                  <tr key={policy.id} className="hover:bg-slate-50 dark:hover:bg-neutral-900/50">
                    <td className="p-3 font-bold font-sans text-slate-900 dark:text-white">{policy.name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        policy.action === "Allow" 
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                          : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                      }`}>
                        {policy.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-neutral-300">{policy.users}</td>
                    <td className="p-3">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{policy.status}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeletePolicy(policy.id, policy.name)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(state.ztPolicies || []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-sans">
                      No Zero Trust policies configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-View: Identity Providers (zt-2) */}
      {currentTab === "zt-2" && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Connected Identity Providers</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400">Corporate single sign-on (SSO) federated with Zero Trust edge nodes.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 space-y-2">
              <div className="font-bold font-sans text-sm text-slate-900 dark:text-white">Google Workspace Directory</div>
              <div className="text-slate-500 dark:text-neutral-400">Protocol: OpenID Connect (OIDC)</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold">Connected / SCIM Provisioning Active</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 space-y-2">
              <div className="font-bold font-sans text-sm text-slate-900 dark:text-white">Okta Enterprise SSO</div>
              <div className="text-slate-500 dark:text-neutral-400">Protocol: SAML 2.0 (Dual Cert)</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold">Connected / MFA Enforced</div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View: Gateway (zt-3) */}
      {currentTab === "zt-3" && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Secure Web Gateway & DNS Filtering</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400">Inspect outbound employee web traffic, prevent data leakage, and block malware.</p>
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 flex justify-between items-center">
              <div>
                <div className="font-bold font-sans text-slate-900 dark:text-white">Block Phishing & Newly Registered Domains</div>
                <div className="text-slate-500 dark:text-neutral-400">DNS Layer Filter</div>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">ENFORCED</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 flex justify-between items-center">
              <div>
                <div className="font-bold font-sans text-slate-900 dark:text-white">DLP: Block Sensitive Credit Card & PII Uploads</div>
                <div className="text-slate-500 dark:text-neutral-400">HTTP Body Inspection (TLS Decryption)</div>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">ENFORCED</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View: DEX (zt-4) */}
      {currentTab === "zt-4" && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Digital Experience Monitoring (DEX)</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400">Endpoint telemetry, Wi-Fi quality, and application performance for remote workers.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30">
              <div className="text-slate-500 dark:text-neutral-400 font-sans">Avg Client Latency</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">14.2 ms</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30">
              <div className="text-slate-500 dark:text-neutral-400 font-sans">WARP Client Version</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">v24.8.1</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30">
              <div className="text-slate-500 dark:text-neutral-400 font-sans">Active Tunnels</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">45 Devices</div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View: Browser Isolation (zt-5) */}
      {currentTab === "zt-5" && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Remote Browser Isolation (RBI)</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400">Executes untrusted web pages in disposable cloud containers, streaming only safe vector draw commands.</p>
          <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 text-xs space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-800 dark:text-neutral-200">Isolation Technology</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">Chromium Cloud Isolate</span>
            </div>
            <p className="text-slate-500 dark:text-neutral-400">Zero executable code runs on endpoint devices. 100% protection against zero-day browser exploits.</p>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Access Policy</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Policy Name</label>
                <input 
                  required
                  type="text" 
                  value={newPolicy.name}
                  onChange={e => setNewPolicy({...newPolicy, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. SRE Production Bastion Access"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Decision</label>
                <select 
                  value={newPolicy.action}
                  onChange={e => setNewPolicy({...newPolicy, action: e.target.value as any})}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Allow">Allow</option>
                  <option value="Block">Block</option>
                  <option value="Bypass">Bypass</option>
                  <option value="Service Auth">Service Auth</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Users / Group Domain</label>
                <input 
                  required
                  type="text" 
                  value={newPolicy.users}
                  onChange={e => setNewPolicy({...newPolicy, users: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. @enterprise.jeton.com"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? "Saving..." : "Save Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
