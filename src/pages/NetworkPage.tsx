import React, { useState } from "react";
import { GlobalState, UrlRedirectRule } from "../types";
import { Globe, Server, Activity, ArrowRightLeft, Plus, X, Trash2, Zap, Shield, RefreshCw, CheckCircle2, Lock, Link2, ExternalLink } from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { logAuditEvent, initialUrlRedirects } from "../hooks/useGlobalState";
import LacazaUrlRedirections from "../components/LacazaUrlRedirections";

interface NetworkPageProps {
  state: GlobalState;
  isDark: boolean;
  activeItemId?: string;
  onSelectTab?: (id: string) => void;
}

const TABS = [
  { id: "net-1", label: "DNS Records" },
  { id: "net-redirects", label: "Redirects & LACAZA" },
  { id: "net-2", label: "Traffic Routing" },
  { id: "net-3", label: "Load Balancing" },
  { id: "net-4", label: "Caching Rules" },
  { id: "net-5", label: "Tiered Cache" },
  { id: "net-6", label: "Argo Smart Routing" },
  { id: "net-7", label: "Spectrum" },
  { id: "net-8", label: "Domains (LACAZA)" }
];

export default function NetworkPage({ state, isDark, activeItemId = "net-1", onSelectTab }: NetworkPageProps) {
  const currentTab = TABS.some(t => t.id === activeItemId) ? activeItemId : "net-1";

  const [redirectRules, setRedirectRules] = useState<UrlRedirectRule[]>(state.urlRedirects || initialUrlRedirects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [newRecord, setNewRecord] = useState({
    type: "A",
    name: "",
    content: "",
    proxied: true,
    ttl: "Auto"
  });

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.name || !newRecord.content) return;
    
    setIsSubmitting(true);
    try {
      const colRef = collection(db, "dnsRecords");
      const docRef = await addDoc(colRef, {
        ...newRecord,
      });
      await updateDoc(doc(db, "dnsRecords", docRef.id), { id: docRef.id });
      await logAuditEvent("DNS_RECORD_CREATE", `Created ${newRecord.type} record ${newRecord.name} -> ${newRecord.content}`);
      
      setIsModalOpen(false);
      setNewRecord({ type: "A", name: "", content: "", proxied: true, ttl: "Auto" });
    } catch (err) {
      console.error("Failed to add DNS record", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, "dnsRecords", id));
      await logAuditEvent("DNS_RECORD_DELETE", `Deleted record ${name}`);
    } catch (err) {
      console.error("Failed to delete DNS record", err);
    }
  };

  const handleToggleProxy = async (id: string, currentStatus: boolean, name: string) => {
    try {
      await updateDoc(doc(db, "dnsRecords", id), { proxied: !currentStatus });
      await logAuditEvent("DNS_PROXY_TOGGLE", `Toggled proxy status on ${name} to ${!currentStatus}`);
    } catch (err) {
      console.error("Failed to toggle proxy", err);
    }
  };

  const handlePurgeCache = async () => {
    setPurgeSuccess(true);
    await logAuditEvent("CACHE_PURGE_ALL", "Purged entire global edge cache cluster");
    setTimeout(() => setPurgeSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 dark:border-neutral-800 pb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Edge Network & Routing</h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">lacaza.clouindustrie.com / Network Infrastructure & Global Anycast</p>
        </div>
        {currentTab === "net-1" && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Record
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

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-neutral-500 mb-2">
            <Globe className="w-4 h-4 text-orange-500" /> DNS Records Configured
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white">{(state.dnsRecords || []).length}</div>
          <div className="text-xs text-slate-500 dark:text-neutral-500 mt-1">Active in Anycast zones</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-neutral-500 mb-2">
            <ArrowRightLeft className="w-4 h-4 text-orange-500" /> Active Edge Gateways
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white">{(state.nodes || []).length}</div>
          <div className="text-xs text-slate-500 dark:text-neutral-500 mt-1">Routing pools synced</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-neutral-500 mb-2">
            <Activity className="w-4 h-4 text-orange-500" /> Tiered Cache Status
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">Active</div>
          <div className="text-xs text-slate-500 dark:text-neutral-500 mt-1">Topology: Global Mesh</div>
        </div>
      </div>

      {/* Tab: DNS Records (net-1) */}
      {currentTab === "net-1" && (
        <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">DNS Management Table</h3>
            <span className="text-xs text-slate-500 dark:text-neutral-500 font-mono">Anycast Authoritative DNS</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 text-xs font-semibold text-slate-600 dark:text-neutral-400">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Content</th>
                  <th className="px-4 py-3">Proxy status</th>
                  <th className="px-4 py-3">TTL</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                {(state.dnsRecords || []).map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-800 dark:text-neutral-300">
                      <span className="px-2 py-0.5 rounded border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200">
                        {record.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-xs text-slate-900 dark:text-white">
                      {record.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-neutral-400 font-mono">
                      {record.content}
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => handleToggleProxy(record.id, record.proxied, record.name)}
                        className="inline-flex items-center gap-1.5 text-[11px] uppercase font-bold cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        {record.proxied ? (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> 
                            <span className="text-orange-600 dark:text-orange-400">Proxied (Orange)</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> 
                            <span className="text-slate-500">DNS Only (Grey)</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-neutral-500 font-mono">
                      {record.ttl}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleDeleteRecord(record.id, record.name)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(state.dnsRecords || []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">
                      No DNS records configured. Click "Add Record" above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Redirections & LACAZA (net-redirects) */}
      {currentTab === "net-redirects" && (
        <LacazaUrlRedirections
          redirectRules={redirectRules}
          domainConfigs={state.domainConfigs}
          onUpdateRules={setRedirectRules}
          isDark={isDark}
        />
      )}

      {/* Tab: Traffic Routing (net-2) */}
      {currentTab === "net-2" && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dynamic Traffic Routing Rules</h3>
            <p className="text-xs text-slate-500 dark:text-neutral-500">Route end users to the closest datacenter based on latency and geography.</p>
            <div className="space-y-3">
              {(state.nodes || []).map(node => (
                <div key={node.id} className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-orange-500" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{node.location}</span>
                      <span className="text-slate-500 dark:text-neutral-500 ml-2 font-mono">({node.ip})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{node.latency || 15}ms RTT</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 font-bold uppercase text-[10px] text-slate-700 dark:text-neutral-300">
                      Active Primary
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Load Balancing (net-3) */}
      {currentTab === "net-3" && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Origin Pools & Health Checks</h3>
                <p className="text-xs text-slate-500 dark:text-neutral-500">Automatic failover across edge clusters</p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 text-xs font-bold font-mono">
                ALL POOLS HEALTHY
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 space-y-2">
                <div className="font-bold text-xs text-slate-900 dark:text-white">Primary EU Edge Pool</div>
                <div className="text-xs text-slate-500 dark:text-neutral-500">Weights: Frankfurt (50%), Paris (50%)</div>
                <div className="text-xs font-mono text-slate-500 dark:text-neutral-400">Health Check: GET /health (15s interval)</div>
              </div>
              <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 space-y-2">
                <div className="font-bold text-xs text-slate-900 dark:text-white">US & APAC Backup Pool</div>
                <div className="text-xs text-slate-500 dark:text-neutral-500">Weights: Ashburn (70%), Singapore (30%)</div>
                <div className="text-xs font-mono text-slate-500 dark:text-neutral-400">Health Check: TCP port 443 (10s interval)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Caching Rules (net-4) */}
      {currentTab === "net-4" && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edge Cache Management</h3>
                <p className="text-xs text-slate-500 dark:text-neutral-500">Purge global edge cache instantly across all POPs</p>
              </div>
              <button 
                onClick={handlePurgeCache}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Purge Everything
              </button>
            </div>
            {purgeSuccess && (
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Global purge request dispatched successfully! All POP caches invalidated.
              </div>
            )}
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 flex justify-between">
                <span className="text-slate-800 dark:text-neutral-200">Standard Static Assets (*.css, *.js, *.png, *.webp)</span>
                <span className="text-slate-500 dark:text-neutral-400">Edge TTL: 30 Days</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 flex justify-between">
                <span className="text-slate-800 dark:text-neutral-200">API Endpoints (/api/v1/*)</span>
                <span className="text-orange-600 dark:text-amber-400 font-semibold">Bypass Cache (Always Live)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tiered Cache (net-5) */}
      {currentTab === "net-5" && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tiered Cache Topology</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-500">Upper-tier regional datacenters minimize round trips to the origin server.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 space-y-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white">EU Hub</div>
              <div className="text-slate-500 dark:text-neutral-400">Frankfurt (FRA-Core)</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold mt-2">Active Tier-1</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 space-y-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white">US Hub</div>
              <div className="text-slate-500 dark:text-neutral-400">Ashburn (IAD-Core)</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold mt-2">Active Tier-1</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 space-y-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white">APAC Hub</div>
              <div className="text-slate-500 dark:text-neutral-400">Tokyo & Singapore</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold mt-2">Active Tier-1</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Argo Smart Routing (net-6) */}
      {currentTab === "net-6" && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Argo Smart Routing</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-500">Bypasses public internet congestion using private backbone fibers</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-400 font-bold text-xs font-mono">
              ENABLED
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30">
              <div className="text-xs text-slate-500 dark:text-neutral-500">Average Latency Reduction</div>
              <div className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">-38.4%</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30">
              <div className="text-xs text-slate-500 dark:text-neutral-500">Packet Loss Mitigation</div>
              <div className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">99.99%</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Spectrum (net-7) */}
      {currentTab === "net-7" && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Spectrum TCP/UDP Applications</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-500">DDoS-mitigated raw TCP proxying for enterprise services</p>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">ssh.enterprise.jeton.com</span>
                <span className="text-slate-500 dark:text-neutral-400 ml-2">Port: 22 (SSH)</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active Proxy</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">db-proxy.enterprise.jeton.com</span>
                <span className="text-slate-500 dark:text-neutral-400 ml-2">Port: 5432 (PostgreSQL)</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active Proxy</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Custom Domains (net-8) */}
      {currentTab === "net-8" && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Official LACAZA Domains & SSL/TLS Certificates</h3>
                <p className="text-xs text-slate-500 dark:text-neutral-500">Anycast Edge SSL certificates provisioned and auto-renewed with strict HSTS enforcement</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                100% Encrypted TLS 1.3
              </span>
            </div>

            {/* lacaza.clouindustrie.com */}
            <div className="p-4 rounded-xl border border-orange-300 dark:border-orange-800/60 bg-orange-50/30 dark:bg-orange-950/20 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-sm text-slate-900 dark:text-white">lacaza.clouindustrie.com</span>
                  <span className="px-2 py-0.5 rounded bg-orange-500 text-white font-bold text-[10px]">PRIMARY TENANT</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                  Active / Strict HSTS Auto-Renewed
                </span>
              </div>
              <div className="text-slate-600 dark:text-neutral-300">
                Issuer: Let's Encrypt / Google Trust Services (ECDSA P-256) • Anycast IP: <span className="font-mono text-orange-600 dark:text-orange-400 font-semibold">104.18.2.1</span>
              </div>
              <div className="flex flex-wrap gap-4 text-slate-500 dark:text-neutral-400 font-mono text-[11px] pt-1 border-t border-orange-200 dark:border-orange-900/50">
                <span>Min TLS: 1.3</span>
                <span>HSTS: Max-Age 31536000 (Preload)</span>
                <span>Edge WAF: Active</span>
                <span>Canonical: Official Subdomain</span>
              </div>
            </div>

            {/* clouindustrie.com */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-sm text-slate-900 dark:text-white">clouindustrie.com</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold text-[10px]">APEX DOMAIN</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                  Active / 301 Forward to LACAZA
                </span>
              </div>
              <div className="text-slate-500 dark:text-neutral-400">
                Routing Policy: All requests to /lacaza/* are canonically forwarded to lacaza.clouindustrie.com
              </div>
              <div className="flex flex-wrap gap-4 text-slate-500 dark:text-neutral-400 font-mono text-[11px]">
                <span>Min TLS: 1.3</span>
                <span>OCSP Stapling: Active</span>
                <span>HTTP -&gt; HTTPS Redirect: Automatic</span>
              </div>
            </div>

            {/* api.lacaza.clouindustrie.com */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-sm text-slate-900 dark:text-white">api.lacaza.clouindustrie.com</span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 font-bold text-[10px]">API GATEWAY</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                  Active / Realtime Edge
                </span>
              </div>
              <div className="text-slate-500 dark:text-neutral-400">
                Anycast API Gateway with Google JWT verification & PayPal IPN Webhooks
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add DNS Record</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Type</label>
                  <select 
                    value={newRecord.type}
                    onChange={e => setNewRecord({...newRecord, type: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="A">A</option>
                    <option value="AAAA">AAAA</option>
                    <option value="CNAME">CNAME</option>
                    <option value="TXT">TXT</option>
                    <option value="MX">MX</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Name</label>
                  <input 
                    required
                    type="text" 
                    value={newRecord.name}
                    onChange={e => setNewRecord({...newRecord, name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. api, @, www"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Content / Target</label>
                <input 
                  required
                  type="text" 
                  value={newRecord.content}
                  onChange={e => setNewRecord({...newRecord, content: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. 192.168.1.1, server.domain.com"
                />
              </div>

              <div className="flex items-center gap-4 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={newRecord.proxied}
                    onChange={e => setNewRecord({...newRecord, proxied: e.target.checked})}
                    className="w-4 h-4 rounded bg-slate-50 border border-slate-300 dark:border-neutral-700 dark:bg-neutral-900 text-orange-500 accent-orange-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-neutral-300">Proxy Traffic (Edge Cache & WAF)</span>
                </label>
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
                  {isSubmitting ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
