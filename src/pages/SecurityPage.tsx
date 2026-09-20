import React, { useState } from "react";
import { GlobalState, SecurityEvent } from "../types";
import { Shield, Filter, Search, Plus, X, Lock, AlertTriangle, ShieldCheck, Cpu, Terminal, CheckCircle2 } from "lucide-react";
import { logAuditEvent } from "../hooks/useGlobalState";
import SecurityComplianceAudit from "../components/SecurityComplianceAudit";

interface SecurityPageProps {
  state: GlobalState;
  isDark: boolean;
  activeItemId?: string;
  onSelectTab?: (id: string) => void;
}

const TABS = [
  { id: "sec-1", label: "WAF Events" },
  { id: "sec-2", label: "Firewall Rules" },
  { id: "sec-3", label: "Bot Management" },
  { id: "sec-4", label: "DDoS Protection" },
  { id: "sec-5", label: "Rate Limiting" },
  { id: "sec-6", label: "Page Shield" },
  { id: "sec-7", label: "API Shield" },
  { id: "sec-8", label: "SOC 2 & ISO 27001 Audit" }
];

export default function SecurityPage({ state, isDark, activeItemId = "sec-1", onSelectTab }: SecurityPageProps) {
  const currentTab = TABS.some(t => t.id === activeItemId) ? activeItemId : "sec-1";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blockIp, setBlockIp] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");

  const [botModeEnabled, setBotModeEnabled] = useState(true);
  const [rateLimitThreshold, setRateLimitThreshold] = useState(120);

  const handleBlockIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockIp) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/security/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: blockIp,
          action: "block",
          reason: blockReason || "Manual IP Block via Edge Admin"
        })
      });
      if (res.ok) {
        await logAuditEvent("SECURITY_IP_BLOCK", `Blocked IP ${blockIp}: ${blockReason}`);
        setIsModalOpen(false);
        setBlockIp("");
        setBlockReason("");
      } else {
        console.error("API error", await res.text());
      }
    } catch (err) {
      console.error("Failed to execute security action", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvents = (state.securityEvents || []).filter(e => {
    const matchesSearch = (e.ip || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.ruleId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.country || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === "all" || e.action.toLowerCase() === filterAction.toLowerCase();
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 dark:border-neutral-800 pb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Security & WAF</h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">enterprise.jeton.com / Web Application Firewall & Zero-Day Defense</p>
        </div>
        {currentTab === "sec-1" && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Block Specific IP
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

      {/* Security Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-neutral-500 font-medium">Total WAF Events</div>
          <div className="text-2xl font-bold font-mono mt-1 text-slate-900 dark:text-white">{(state.securityEvents || []).length}</div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-500 mt-1">Synchronized from Firestore</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-neutral-500 font-medium">OWASP CRS 3.3 Status</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">Paranoia L2</div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-500 mt-1">Strict payload evaluation</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-neutral-500 font-medium">Bot Mitigation</div>
          <div className="text-2xl font-bold font-mono mt-1 text-slate-900 dark:text-white">{botModeEnabled ? "Active" : "Disabled"}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">ML heuristic score: 98/100</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-neutral-500 font-medium">DDoS Attack State</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">Nominal</div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-500 mt-1">0 active volumetric floods</div>
        </div>
      </div>

      {/* Sub-View: WAF Events (sec-1) */}
      {currentTab === "sec-1" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter by IP, Rule ID, or Country (e.g. 192.168, OWASP, CN)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white"
              />
            </div>
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs focus:outline-hidden text-slate-900 dark:text-white"
            >
              <option value="all">All Actions</option>
              <option value="block">Block</option>
              <option value="challenge">Challenge</option>
              <option value="log">Log Only</option>
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-500 font-sans">
                  <tr>
                    <th className="p-3">Action</th>
                    <th className="p-3">Source IP</th>
                    <th className="p-3">Origin Country</th>
                    <th className="p-3">Matched Rule</th>
                    <th className="p-3">Path / Host</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                  {filteredEvents.map(event => (
                    <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-neutral-900/50">
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          event.action.toLowerCase() === "block" 
                            ? "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400"
                            : "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                        }`}>
                          {event.action}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{event.ip}</td>
                      <td className="p-3 font-sans text-slate-700 dark:text-neutral-300">{event.country}</td>
                      <td className="p-3 text-slate-600 dark:text-neutral-400">{event.ruleId}</td>
                      <td className="p-3 text-slate-500 font-sans">{event.path}</td>
                      <td className="p-3 text-slate-500 text-[11px]">{new Date(event.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                  {filteredEvents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                        No security events match your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View: Firewall Rules (sec-2) */}
      {currentTab === "sec-2" && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Custom Firewall Expression Rules</h3>
            <p className="text-xs text-slate-500 dark:text-neutral-500">Wireshark-compatible filter syntax executed at the edge in sub-millisecond time.</p>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 flex justify-between items-center bg-slate-50/50 dark:bg-neutral-900/30">
                <div>
                  <div className="font-bold font-sans text-slate-800 dark:text-neutral-200">Block Known Threat Tor Exit Nodes</div>
                  <div className="text-slate-500 dark:text-neutral-500 mt-1">(ip.geoip.is_tor eq true)</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold">BLOCK</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 flex justify-between items-center bg-slate-50/50 dark:bg-neutral-900/30">
                <div>
                  <div className="font-bold font-sans text-slate-800 dark:text-neutral-200">Enforce Zero Trust Header on Admin Paths</div>
                  <div className="text-slate-500 dark:text-neutral-500 mt-1">(http.request.uri.path contains "/admin" and not http.request.headers["cf-access-jwt-assertion"])</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold">BLOCK</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View: Bot Management (sec-3) */}
      {currentTab === "sec-3" && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bot Fight Mode & Machine Learning Heuristics</h3>
                <p className="text-xs text-slate-500 dark:text-neutral-500">Detects scrapers, automated headless browsers, and credential stuffers.</p>
              </div>
              <button
                onClick={() => setBotModeEnabled(!botModeEnabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  botModeEnabled ? "bg-orange-500 text-white" : "bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-400"
                }`}
              >
                {botModeEnabled ? "Mode: ENFORCED" : "Mode: OFF"}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 space-y-1">
                <div className="font-bold font-mono text-slate-800 dark:text-neutral-200">Automated Threat Score Threshold</div>
                <p className="text-slate-500 dark:text-neutral-500">Any visitor with score &lt; 30 receives an interactive cryptographic proof-of-work challenge.</p>
              </div>
              <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 space-y-1">
                <div className="font-bold font-mono text-slate-800 dark:text-neutral-200">Verified Search Engine Bots</div>
                <p className="text-slate-500 dark:text-neutral-500">Googlebot, Bingbot, and DuckDuckGo reverse-DNS verified and whitelisted automatically.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View: DDoS Protection (sec-4) */}
      {currentTab === "sec-4" && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Autonomous L3/L4 & L7 DDoS Mitigation</h3>
            <p className="text-xs text-slate-500 dark:text-neutral-500">Global Anycast absorption capacity: 192 Tbps</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30">
                <div className="text-slate-500 dark:text-neutral-500">SYN Flood Mitigation</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">Autonomous (eBPF)</div>
              </div>
              <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30">
                <div className="text-slate-500 dark:text-neutral-500">DNS Amplification Filter</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">100% Absorbed</div>
              </div>
              <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30">
                <div className="text-slate-500 dark:text-neutral-500">HTTP/2 Rapid Reset Mitigation</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">Hardened</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View: Rate Limiting (sec-5) */}
      {currentTab === "sec-5" && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">API Rate Limiting Threshold</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-500">Limits requests per IP per minute across the edge network</p>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={rateLimitThreshold} 
                onChange={e => setRateLimitThreshold(Number(e.target.value))}
                className="w-20 px-2 py-1 text-xs border border-slate-200 dark:border-neutral-700 rounded-lg bg-slate-50 dark:bg-neutral-800 font-mono text-slate-900 dark:text-white"
              />
              <span className="text-xs font-mono text-slate-500 dark:text-neutral-500">req/min</span>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 text-xs font-mono flex justify-between items-center">
            <span className="text-slate-700 dark:text-neutral-300">Action on Threshold Exceeded:</span>
            <span className="text-red-500 font-bold">HTTP 429 Too Many Requests (Retry-After: 60s)</span>
          </div>
        </div>
      )}

      {/* Sub-View: Page Shield (sec-6) */}
      {currentTab === "sec-6" && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Page Shield & Client-Side Security</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-500">Monitors JavaScript libraries and CSP violations to prevent Magecart data theft</p>
          <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 text-xs space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-800 dark:text-neutral-200">Third-Party Scripts Monitored</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">0 Anomalies Detected</span>
            </div>
            <p className="text-slate-500 dark:text-neutral-500">No unauthorized modifications detected in loaded JS bundles or external CDNs.</p>
          </div>
        </div>
      )}

      {/* Sub-View: API Shield (sec-7) */}
      {currentTab === "sec-7" && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">API Shield & Schema Validation</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-500">OpenAPI 3.1 schema enforcement and Mutual TLS (mTLS) client verification</p>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 flex justify-between">
              <span className="text-slate-800 dark:text-neutral-200">POST /api/v1/ai/analyze</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Schema Validated (JSON Schema)</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 flex justify-between">
              <span className="text-slate-800 dark:text-neutral-200">POST /api/v1/security/action</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Schema Validated (Strict Types)</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View: Security Center (sec-8) */}
      {currentTab === "sec-8" && (
        <SecurityComplianceAudit state={state} isDark={isDark} />
      )}

      {/* Block IP Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Block Threat IP at Edge</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBlockIp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">IP Address</label>
                <input 
                  required
                  type="text" 
                  value={blockIp}
                  onChange={e => setBlockIp(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white"
                  placeholder="e.g. 192.0.2.1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Reason / Trigger</label>
                <input 
                  type="text" 
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white"
                  placeholder="e.g. Repeated SQL injection attempt"
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
                  className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? "Enforcing Block..." : "Enforce Block at Edge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
