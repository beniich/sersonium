import React, { useState } from "react";
import { UrlRedirectRule, DomainRoutingConfig } from "../types";
import { 
  Globe, ArrowRight, Plus, X, Trash2, CheckCircle2, 
  ExternalLink, Play, Filter, Sparkles, AlertCircle, Link2, Copy, RefreshCw,
  Shield, Check, Search, Info
} from "lucide-react";
import { logAuditEvent } from "../hooks/useGlobalState";

interface LacazaUrlRedirectionsProps {
  redirectRules: UrlRedirectRule[];
  domainConfigs?: DomainRoutingConfig[];
  onUpdateRules: (newRules: UrlRedirectRule[]) => void;
  isDark: boolean;
}

export default function LacazaUrlRedirections({
  redirectRules,
  domainConfigs = [],
  onUpdateRules,
  isDark
}: LacazaUrlRedirectionsProps) {
  const [rules, setRules] = useState<UrlRedirectRule[]>(redirectRules);
  const [filterDomain, setFilterDomain] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Interactive test simulator state
  const [testUrl, setTestUrl] = useState<string>("https://clouindustrie.com/lacaza/telemetry?ref=partner");
  const [testResult, setTestResult] = useState<{
    matched: boolean;
    rule?: UrlRedirectRule;
    evaluatedUrl: string;
    targetUrl: string;
    statusCode: number;
    latencyMs: number;
    headers: Record<string, string>;
  } | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [newRule, setNewRule] = useState<Partial<UrlRedirectRule>>({
    sourceDomain: "lacaza.clouindustrie.com",
    sourcePath: "",
    targetUrl: "",
    statusCode: 301,
    preserveQueryString: true,
    matchType: "prefix",
    enabled: true,
    description: "",
    priority: 5
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    showNotification(`Copied: ${text}`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Toggle rule status
  const handleToggleRule = async (id: string) => {
    const updated = rules.map(r => {
      if (r.id === id) {
        return { ...r, enabled: !r.enabled };
      }
      return r;
    });
    setRules(updated);
    onUpdateRules(updated);
    const rule = rules.find(r => r.id === id);
    await logAuditEvent("URL_REDIRECT_TOGGLE", `Redirect ${rule?.sourceDomain}${rule?.sourcePath} ${!rule?.enabled ? 'enabled' : 'disabled'}`);
    showNotification(`Rule ${!rule?.enabled ? 'enabled' : 'disabled'}`);
  };

  // Delete rule
  const handleDeleteRule = async (id: string) => {
    const rule = rules.find(r => r.id === id);
    const updated = rules.filter(r => r.id !== id);
    setRules(updated);
    onUpdateRules(updated);
    await logAuditEvent("URL_REDIRECT_DELETE", `Deletion of redirect ${rule?.sourceDomain}${rule?.sourcePath}`);
    showNotification(`Rule deleted`);
  };

  // Add new rule
  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.sourceDomain || !newRule.sourcePath || !newRule.targetUrl) return;

    const ruleToAdd: UrlRedirectRule = {
      id: `redir-${Date.now()}`,
      sourceDomain: newRule.sourceDomain || "lacaza.clouindustrie.com",
      sourcePath: newRule.sourcePath.startsWith("/") ? newRule.sourcePath : `/${newRule.sourcePath}`,
      targetUrl: newRule.targetUrl,
      statusCode: (newRule.statusCode as any) || 301,
      preserveQueryString: newRule.preserveQueryString ?? true,
      matchType: newRule.matchType || "prefix",
      enabled: true,
      hitCount: 0,
      lastHitAt: undefined,
      description: newRule.description || `Redirect ${newRule.sourceDomain}${newRule.sourcePath}`,
      priority: Number(newRule.priority) || 5
    };

    const updated = [ruleToAdd, ...rules];
    setRules(updated);
    onUpdateRules(updated);
    await logAuditEvent("URL_REDIRECT_CREATE", `Created redirect ${ruleToAdd.sourceDomain}${ruleToAdd.sourcePath} -> ${ruleToAdd.targetUrl} (${ruleToAdd.statusCode})`);
    
    setIsModalOpen(false);
    setNewRule({
      sourceDomain: "lacaza.clouindustrie.com",
      sourcePath: "",
      targetUrl: "",
      statusCode: 301,
      preserveQueryString: true,
      matchType: "prefix",
      enabled: true,
      description: "",
      priority: 5
    });
    showNotification("New redirect rule saved successfully!");
  };

  // Apply default LACAZA preset pack
  const handleApplyPresetPack = async () => {
    const defaultLacazaPresets: UrlRedirectRule[] = [
      {
        id: `preset-canon-${Date.now()}`,
        sourceDomain: "clouindustrie.com",
        sourcePath: "/lacaza/*",
        targetUrl: "https://lacaza.clouindustrie.com/$1",
        statusCode: 301,
        preserveQueryString: true,
        matchType: "prefix",
        enabled: true,
        hitCount: 14200,
        description: "Canonical Apex clouindustrie.com/lacaza -> lacaza.clouindustrie.com",
        priority: 1
      },
      {
        id: `preset-shop-${Date.now()}`,
        sourceDomain: "lacaza.clouindustrie.com",
        sourcePath: "/shop",
        targetUrl: "https://lacaza.clouindustrie.com/billing/checkout?gateway=paypal",
        statusCode: 301,
        preserveQueryString: true,
        matchType: "exact",
        enabled: true,
        hitCount: 8900,
        description: "Store Routing to PayPal Payment Gateway",
        priority: 2
      },
      {
        id: `preset-ssl-${Date.now()}`,
        sourceDomain: "*",
        sourcePath: "/http-to-https",
        targetUrl: "https://lacaza.clouindustrie.com/",
        statusCode: 301,
        preserveQueryString: true,
        matchType: "wildcard",
        enabled: true,
        hitCount: 45100,
        description: "Universal Strict SSL HSTS Enforcement for LACAZA",
        priority: 1
      }
    ];

    const merged = [...defaultLacazaPresets, ...rules.filter(r => !r.id.startsWith("preset-"))];
    setRules(merged);
    onUpdateRules(merged);
    await logAuditEvent("URL_REDIRECT_PRESET", "Applied LACAZA official redirection preset pack");
    showNotification("Official LACAZA redirection pack applied!");
  };

  // Evaluate URL against rules
  const handleEvaluateUrl = (urlToTest: string) => {
    try {
      let parsedUrl: URL;
      if (!urlToTest.startsWith("http://") && !urlToTest.startsWith("https://")) {
        parsedUrl = new URL(`https://${urlToTest}`);
      } else {
        parsedUrl = new URL(urlToTest);
      }

      const hostname = parsedUrl.hostname;
      const pathname = parsedUrl.pathname;
      const search = parsedUrl.search;

      // Find matching enabled rule sorted by priority
      const sortedRules = [...rules].filter(r => r.enabled).sort((a, b) => a.priority - b.priority);
      
      let matchedRule: UrlRedirectRule | undefined = undefined;

      for (const rule of sortedRules) {
        // Domain match check
        const domainMatches = rule.sourceDomain === "*" || 
          rule.sourceDomain.toLowerCase() === hostname.toLowerCase() ||
          (rule.sourceDomain.startsWith("*.") && hostname.endsWith(rule.sourceDomain.slice(1)));

        if (!domainMatches) continue;

        // Path match check
        if (rule.matchType === "exact") {
          if (pathname === rule.sourcePath) {
            matchedRule = rule;
            break;
          }
        } else if (rule.matchType === "prefix") {
          const cleanRulePath = rule.sourcePath.replace(/\/\*$/, "");
          if (pathname.startsWith(cleanRulePath)) {
            matchedRule = rule;
            break;
          }
        } else if (rule.matchType === "wildcard") {
          const regexPattern = new RegExp("^" + rule.sourcePath.replace(/\*/g, ".*") + "$");
          if (regexPattern.test(pathname)) {
            matchedRule = rule;
            break;
          }
        } else if (rule.matchType === "regex") {
          try {
            const regex = new RegExp(rule.sourcePath);
            if (regex.test(pathname)) {
              matchedRule = rule;
              break;
            }
          } catch {
            // invalid regex
          }
        }
      }

      if (matchedRule) {
        let finalTarget = matchedRule.targetUrl;
        
        // Handle wildcard replacements if $1 exists
        if (finalTarget.includes("$1")) {
          const cleanRulePath = matchedRule.sourcePath.replace(/\/\*$/, "");
          const remainder = pathname.slice(cleanRulePath.length);
          finalTarget = finalTarget.replace("$1", remainder.startsWith("/") ? remainder.slice(1) : remainder);
        }

        // Handle query string preservation
        if (matchedRule.preserveQueryString && search) {
          finalTarget += (finalTarget.includes("?") ? "&" : "?") + search.slice(1);
        }

        setTestResult({
          matched: true,
          rule: matchedRule,
          evaluatedUrl: urlToTest,
          targetUrl: finalTarget,
          statusCode: matchedRule.statusCode,
          latencyMs: +(Math.random() * 2 + 1.2).toFixed(2),
          headers: {
            "HTTP/2 Status": `${matchedRule.statusCode} ${matchedRule.statusCode === 301 ? "Moved Permanently" : matchedRule.statusCode === 302 ? "Found" : matchedRule.statusCode === 307 ? "Temporary Redirect" : "Permanent Redirect"}`,
            "Location": finalTarget,
            "Server": "CloudIndustrie-Edge/Anycast-v4",
            "X-Edge-Tenant": "LACAZA-clouindustrie",
            "X-Cache-Status": "HIT (Edge Key Evaluated)",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
            "CF-Ray": `8bf7${Math.floor(Math.random() * 89999 + 10000)}-CDG`
          }
        });
      } else {
        setTestResult({
          matched: false,
          evaluatedUrl: urlToTest,
          targetUrl: urlToTest,
          statusCode: 200,
          latencyMs: 1.1,
          headers: {
            "HTTP/2 Status": "200 OK (Pas de redirection applicable)",
            "Server": "CloudIndustrie-Origin",
            "X-Edge-Tenant": "Direct Pass-Through"
          }
        });
      }
    } catch (err: any) {
      showNotification("URL invalide pour le test : " + err.message);
    }
  };

  // Filtered rules
  const filteredRules = rules.filter(r => {
    const matchesDomain = filterDomain === "all" || r.sourceDomain.toLowerCase().includes(filterDomain.toLowerCase());
    const matchesStatus = filterStatus === "all" || String(r.statusCode) === filterStatus;
    const matchesSearch = !searchQuery || 
      r.sourcePath.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.targetUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesStatus && matchesSearch;
  });

  const totalHits = rules.reduce((acc, r) => acc + (r.hitCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* LACAZA Tenant Domain Banner */}
      <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent dark:border-orange-500/20 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-500 text-white shadow-xs">
                Tenant Officiel
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                SSL HSTS Actif (TLS 1.3)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
                Anycast POP Paris Core
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              lacaza.clouindustrie.com
              <button 
                onClick={() => copyToClipboard("https://lacaza.clouindustrie.com", "domain")}
                className="text-slate-400 hover:text-orange-500 transition-colors p-1 cursor-pointer"
                title="Copier le domaine"
              >
                {copiedText === "domain" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </h2>
            <p className="text-xs text-slate-600 dark:text-neutral-400">
              Moteur de redirection Edge Anycast & Routage Canonique pour le site web et le portail LACAZA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleApplyPresetPack}
              className="px-3 py-2 rounded-lg text-xs font-semibold border border-orange-300 dark:border-orange-800 bg-white/80 dark:bg-neutral-900/80 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              LACAZA Preset Pack
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Redirection
            </button>
          </div>
        </div>

        {/* Quick domain status metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-orange-500/15 text-xs">
          <div>
            <span className="text-slate-500 dark:text-neutral-500 block">Active Rules</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
              {rules.filter(r => r.enabled).length} / {rules.length}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-neutral-500 block">Executed Redirects</span>
            <span className="text-base font-bold font-mono text-orange-600 dark:text-orange-400">
              {totalHits.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-neutral-500 block">Avg Edge Latency</span>
            <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
              1.8 ms
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-neutral-500 block">Canonical Apex</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
              clouindustrie.com
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Live Redirection Tester */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-orange-500 fill-orange-500" />
              Redirection Simulator & Live Tester
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Test in real time how an incoming URL is resolved by LACAZA's Anycast Edge cluster.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 dark:text-neutral-500">
            HTTP/2 & Strict HTTP/3 Engine
          </span>
        </div>

        {/* Input bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={testUrl}
              onChange={e => setTestUrl(e.target.value)}
              placeholder="E.g.: https://clouindustrie.com/lacaza/dashboard or lacaza.clouindustrie.com/shop"
              className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            onClick={() => handleEvaluateUrl(testUrl)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-orange-500 dark:hover:bg-orange-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Evaluate Redirection
          </button>
        </div>

        {/* Quick test presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-neutral-500 font-medium">Quick examples:</span>
          {[
            { label: "Apex /lacaza", url: "https://clouindustrie.com/lacaza/telemetry" },
            { label: "Store /shop", url: "https://lacaza.clouindustrie.com/shop?promo=summer26" },
            { label: "Alias /boutique", url: "https://lacaza.clouindustrie.com/boutique/edge-pack" },
            { label: "OAuth /auth/google", url: "https://lacaza.clouindustrie.com/auth/google" },
            { label: "API Migration", url: "https://lacaza.clouindustrie.com/api/legacy/health" }
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTestUrl(preset.url);
                handleEvaluateUrl(preset.url);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-neutral-800 hover:bg-orange-100 dark:hover:bg-orange-950/50 hover:text-orange-600 dark:hover:text-orange-400 text-slate-700 dark:text-neutral-300 text-[11px] font-mono transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Simulation Output Card */}
        {testResult && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-950/60 space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md font-mono text-xs font-bold ${
                  testResult.statusCode === 301 
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300"
                    : testResult.statusCode === 302
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300"
                    : testResult.statusCode === 308
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                }`}>
                  HTTP {testResult.statusCode}
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {testResult.matched ? "Redirection rule matched" : "No matching rule (Pass-Through)"}
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                Edge execution time: {testResult.latencyMs} ms
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Evaluated Source URL</div>
                <div className="text-slate-800 dark:text-neutral-200 break-all">{testResult.evaluatedUrl}</div>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Resolved Target (Location)</div>
                <div className="text-orange-600 dark:text-orange-400 font-bold break-all flex items-center gap-1.5">
                  {testResult.targetUrl}
                  <a 
                    href={testResult.targetUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-slate-400 hover:text-orange-500 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Simulated Edge Headers */}
            <div className="p-3 rounded-lg bg-slate-900 text-slate-200 dark:bg-black text-[11px] font-mono space-y-1 overflow-x-auto">
              <div className="text-slate-400 border-b border-slate-800 pb-1 mb-1 font-sans text-xs">
                Edge response HTTP headers:
              </div>
              {Object.entries(testResult.headers).map(([key, val]) => (
                <div key={key} className="flex justify-between gap-4">
                  <span className="text-slate-400">{key}:</span>
                  <span className="text-emerald-400 text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Redirection Rules Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs overflow-hidden">
        {/* Table Header & Filters */}
        <div className="p-4 border-b border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-orange-500" />
              Active Redirections Table ({filteredRules.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              301, 302, 307, 308 routing executed at the perimeter (Anycast Edge)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter path..."
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Domain Filter */}
            <select
              value={filterDomain}
              onChange={e => setFilterDomain(e.target.value)}
              className="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">All domains</option>
              <option value="lacaza.clouindustrie.com">lacaza.clouindustrie.com</option>
              <option value="clouindustrie.com">clouindustrie.com (Apex)</option>
              <option value="*">Wildcard (*)</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">All statuses</option>
              <option value="301">301 (Permanent)</option>
              <option value="302">302 (Temporary)</option>
              <option value="307">307 (Strict)</option>
              <option value="308">308 (Perm Preserve)</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 font-semibold text-slate-600 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source (Domain & Path)</th>
                <th className="px-4 py-3">Target Destination</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Hit Volume</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-neutral-800 font-mono">
              {filteredRules.map(rule => (
                <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-neutral-900/50 transition-colors">
                  {/* Status badge */}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      rule.statusCode === 301 
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                        : rule.statusCode === 302
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        : rule.statusCode === 308
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                        : "bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}>
                      {rule.statusCode}
                    </span>
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white font-sans">
                      {rule.sourceDomain}
                    </div>
                    <div className="text-orange-600 dark:text-orange-400 font-mono text-[11px]">
                      {rule.sourcePath}
                    </div>
                    {rule.description && (
                      <div className="text-[10px] text-slate-400 dark:text-neutral-500 font-sans mt-0.5">
                        {rule.description}
                      </div>
                    )}
                  </td>

                  {/* Destination Target */}
                  <td className="px-4 py-3">
                    <div className="text-slate-800 dark:text-neutral-200 font-mono max-w-xs truncate" title={rule.targetUrl}>
                      {rule.targetUrl}
                    </div>
                    {rule.preserveQueryString && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans">
                        ✓ URL parameters preserved (?...)
                      </span>
                    )}
                  </td>

                  {/* Match Type */}
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 uppercase text-[10px] font-bold">
                      {rule.matchType}
                    </span>
                  </td>

                  {/* Hit count */}
                  <td className="px-4 py-3">
                    <div className="text-slate-900 dark:text-white font-bold">
                      {(rule.hitCount || 0).toLocaleString()}
                    </div>
                    {rule.lastHitAt && (
                      <div className="text-[10px] text-slate-400 font-sans">
                        Last: {new Date(rule.lastHitAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </td>

                  {/* Enabled toggle */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-sans transition-colors cursor-pointer ${
                        rule.enabled 
                          ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400"
                          : "bg-slate-200 dark:bg-neutral-800 text-slate-500"
                      }`}
                    >
                      {rule.enabled ? "Active" : "Paused"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          const testUrlToRun = `https://${rule.sourceDomain}${rule.sourcePath.replace(/\/\*$/, "")}`;
                          setTestUrl(testUrlToRun);
                          handleEvaluateUrl(testUrlToRun);
                        }}
                        className="p-1.5 text-slate-400 hover:text-orange-500 transition-colors cursor-pointer rounded hover:bg-slate-100 dark:hover:bg-neutral-800"
                        title="Test this rule"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer rounded hover:bg-slate-100 dark:hover:bg-neutral-800"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRules.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500 dark:text-neutral-500 font-sans">
                    No redirection rules match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-2xl w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  New Redirection Rule
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Configure Edge routing for lacaza.clouindustrie.com
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRule} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                    Source Domain
                  </label>
                  <select
                    value={newRule.sourceDomain}
                    onChange={e => setNewRule({ ...newRule, sourceDomain: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="lacaza.clouindustrie.com">lacaza.clouindustrie.com</option>
                    <option value="clouindustrie.com">clouindustrie.com (Apex)</option>
                    <option value="api.lacaza.clouindustrie.com">api.lacaza.clouindustrie.com</option>
                    <option value="*">All domains (*)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                    HTTP Status Code
                  </label>
                  <select
                    value={newRule.statusCode}
                    onChange={e => setNewRule({ ...newRule, statusCode: Number(e.target.value) as any })}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={301}>301 - Permanent Redirect (SEO Recommended)</option>
                    <option value={302}>302 - Temporary Redirect</option>
                    <option value={307}>307 - Strict Redirect (Preserves POST/GET method)</option>
                    <option value={308}>308 - Permanent Strict Redirect</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                  Source Path (Pattern)
                </label>
                <input
                  required
                  type="text"
                  value={newRule.sourcePath}
                  onChange={e => setNewRule({ ...newRule, sourcePath: e.target.value })}
                  placeholder="E.g.: /shop, /lacaza/*, /boutique, /api/v0/*"
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                  Destination URL (Target)
                </label>
                <input
                  required
                  type="text"
                  value={newRule.targetUrl}
                  onChange={e => setNewRule({ ...newRule, targetUrl: e.target.value })}
                  placeholder="E.g.: https://lacaza.clouindustrie.com/billing/checkout"
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                    Match Type
                  </label>
                  <select
                    value={newRule.matchType}
                    onChange={e => setNewRule({ ...newRule, matchType: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="prefix">Prefix (Starts with...)</option>
                    <option value="exact">Exact (Strict match)</option>
                    <option value="wildcard">Wildcard (Uses *)</option>
                    <option value="regex">Regular Expression (Regex)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                    Evaluation Priority
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newRule.priority}
                    onChange={e => setNewRule({ ...newRule, priority: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                  Description / Internal Note
                </label>
                <input
                  type="text"
                  value={newRule.description}
                  onChange={e => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="E.g.: Routing for PayPal store and invoices"
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="chk-query"
                  type="checkbox"
                  checked={newRule.preserveQueryString}
                  onChange={e => setNewRule({ ...newRule, preserveQueryString: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-500 accent-orange-500 cursor-pointer"
                />
                <label htmlFor="chk-query" className="text-xs text-slate-700 dark:text-neutral-300 cursor-pointer">
                  Preserve URL query parameters (e.g., ?source=paypal&ref=partner)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
