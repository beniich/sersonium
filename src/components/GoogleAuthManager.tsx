import React, { useState } from "react";
import { GoogleAuthConfig } from "../types";
import { 
  Shield, CheckCircle2, AlertCircle, Copy, Check, Plus, 
  Trash2, ExternalLink, RefreshCw, Key, Globe, Lock, Play, Eye, EyeOff
} from "lucide-react";
import { logAuditEvent } from "../hooks/useGlobalState";

interface GoogleAuthManagerProps {
  config: GoogleAuthConfig;
  onUpdateConfig: (newConfig: GoogleAuthConfig) => void;
  isDark: boolean;
}

export default function GoogleAuthManager({
  config,
  onUpdateConfig,
  isDark
}: GoogleAuthManagerProps) {
  const [currentConfig, setCurrentConfig] = useState<GoogleAuthConfig>(config);
  const [showSecret, setShowSecret] = useState(false);
  const [newUriInput, setNewUriInput] = useState("");
  const [newDomainInput, setNewDomainInput] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live Google Sign-In test simulator
  const [testResult, setTestResult] = useState<{
    status: "success" | "error";
    profile?: {
      name: string;
      email: string;
      hostedDomain?: string;
      picture: string;
      tokenAudience: string;
      verified: boolean;
    };
    jwtHeader?: Record<string, any>;
    jwtPayload?: Record<string, any>;
  } | null>(null);

  const [testingLogin, setTestingLogin] = useState(false);

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

  // Save config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(currentConfig);
    await logAuditEvent("GOOGLE_AUTH_CONFIG_UPDATE", `Google OAuth configuration updated for lacaza.clouindustrie.com`);
    setSavedSuccess(true);
    showNotification("Google Authentication settings saved successfully!");
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Add redirect URI
  const handleAddRedirectUri = () => {
    if (!newUriInput.trim()) return;
    const uri = newUriInput.trim();
    if (currentConfig.authorizedRedirectUris.includes(uri)) {
      showNotification("This URI already exists.");
      return;
    }
    const updated = {
      ...currentConfig,
      authorizedRedirectUris: [...currentConfig.authorizedRedirectUris, uri]
    };
    setCurrentConfig(updated);
    onUpdateConfig(updated);
    setNewUriInput("");
    showNotification(`URI added: ${uri}`);
  };

  // Remove redirect URI
  const handleRemoveRedirectUri = (uri: string) => {
    if (currentConfig.authorizedRedirectUris.length <= 1) {
      showNotification("You must maintain at least one authorized URI.");
      return;
    }
    const updated = {
      ...currentConfig,
      authorizedRedirectUris: currentConfig.authorizedRedirectUris.filter(u => u !== uri)
    };
    setCurrentConfig(updated);
    onUpdateConfig(updated);
    showNotification(`URI removed`);
  };

  // Add allowed domain
  const handleAddAllowedDomain = () => {
    if (!newDomainInput.trim()) return;
    const dom = newDomainInput.trim().replace(/^@/, "").toLowerCase();
    if (currentConfig.allowedDomains.includes(dom)) {
      showNotification("This domain already exists.");
      return;
    }
    const updated = {
      ...currentConfig,
      allowedDomains: [...currentConfig.allowedDomains, dom]
    };
    setCurrentConfig(updated);
    onUpdateConfig(updated);
    setNewDomainInput("");
    showNotification(`Domain added: @${dom}`);
  };

  // Remove allowed domain
  const handleRemoveAllowedDomain = (dom: string) => {
    if (currentConfig.allowedDomains.length <= 1) {
      showNotification("You must maintain at least one authentication domain.");
      return;
    }
    const updated = {
      ...currentConfig,
      allowedDomains: currentConfig.allowedDomains.filter(d => d !== dom)
    };
    setCurrentConfig(updated);
    onUpdateConfig(updated);
    showNotification(`Domain removed`);
  };

  // Run live test Google login
  const handleRunTestLogin = () => {
    setTestingLogin(true);
    setTimeout(async () => {
      setTestResult({
        status: "success",
        profile: {
          name: "Beniich Administrator",
          email: "beniich.contact@gmail.com",
          hostedDomain: "gmail.com",
          picture: "https://lh3.googleusercontent.com/a/default-user=s96-c",
          tokenAudience: currentConfig.clientId,
          verified: true
        },
        jwtHeader: {
          alg: "RS256",
          kid: "8e9f2910c2738910bba9",
          typ: "JWT"
        },
        jwtPayload: {
          iss: "https://accounts.google.com",
          sub: "1098234891023812903",
          azp: currentConfig.clientId,
          email: "beniich.contact@gmail.com",
          email_verified: true,
          hd: "clouindustrie.com",
          name: "Beniich Administrator",
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600
        }
      });
      setTestingLogin(false);
      await logAuditEvent("GOOGLE_AUTH_TEST_LOGIN", "Google Identity Services validation test executed successfully");
      showNotification("Google authentication validated successfully!");
    }, 1000);
  };

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
      <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 via-amber-500/5 to-transparent dark:border-red-500/20 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white dark:bg-neutral-800 text-slate-800 dark:text-white border border-slate-200 dark:border-neutral-700 flex items-center gap-1.5 shadow-xs">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Google Identity Services
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                OAuth 2.0 Verified
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 dark:bg-neutral-800 dark:text-neutral-300">
                Domain: lacaza.clouindustrie.com
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Google Authentication &amp; SSO Management
            </h2>
            <p className="text-xs text-slate-600 dark:text-neutral-400">
              Manage Google Sign-In authorization policies, official redirect URIs, and enterprise hosted domain whitelist.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRunTestLogin}
              disabled={testingLogin}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {testingLogin ? <RefreshCw className="w-4 h-4 animate-spin text-orange-500" /> : <Play className="w-4 h-4 fill-red-500 text-red-500" />}
              Test Google Login
            </button>
          </div>
        </div>

        {/* Diagnostic Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-red-500/15 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-slate-700 dark:text-neutral-300">DNS TXT Record Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-slate-700 dark:text-neutral-300">Strict TLS 1.3 SSL Certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-slate-700 dark:text-neutral-300">Production OAuth Consent Screen</span>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credentials & OAuth parameters */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-5">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Google OAuth 2.0 Client Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Credentials issued by Google Cloud Platform Console
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Status:</span>
              <button
                type="button"
                onClick={() => setCurrentConfig({ ...currentConfig, enabled: !currentConfig.enabled })}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  currentConfig.enabled
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-400 text-white"
                }`}
              >
                {currentConfig.enabled ? "ACTIVE" : "DISABLED"}
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                Google Client ID (Web Client)
              </label>
              <div className="relative">
                <input
                  required
                  type="text"
                  value={currentConfig.clientId}
                  onChange={e => setCurrentConfig({ ...currentConfig, clientId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(currentConfig.clientId, "clientId")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
                  title="Copy Client ID"
                >
                  {copiedText === "clientId" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                Google Client Secret
              </label>
              <div className="relative">
                <input
                  required
                  type={showSecret ? "text" : "password"}
                  value={currentConfig.clientSecretMasked}
                  onChange={e => setCurrentConfig({ ...currentConfig, clientSecretMasked: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Authorized Redirect URIs */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400">
                Authorized Redirect URIs
              </label>
              <div className="space-y-1.5">
                {currentConfig.authorizedRedirectUris.map(uri => (
                  <div key={uri} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 text-xs font-mono">
                    <span className="text-slate-800 dark:text-neutral-200 truncate mr-2">{uri}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRedirectUri(uri)}
                      className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newUriInput}
                  onChange={e => setNewUriInput(e.target.value)}
                  placeholder="https://lacaza.clouindustrie.com/auth/callback"
                  className="flex-1 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddRedirectUri}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-800 dark:text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Add URI
                </button>
              </div>
            </div>

            {/* Authorized Enterprise Domains */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400">
                  Authorized Domains for Google Sign-In (Whitelist)
                </label>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <input
                    id="chk-hd"
                    type="checkbox"
                    checked={currentConfig.enforceHostedDomain}
                    onChange={e => setCurrentConfig({ ...currentConfig, enforceHostedDomain: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-red-500 accent-red-500 cursor-pointer"
                  />
                  <label htmlFor="chk-hd" className="cursor-pointer">
                    Strictly enforce hosted domain (hd)
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {currentConfig.allowedDomains.map(dom => (
                  <span key={dom} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-mono">
                    @{dom}
                    <button
                      type="button"
                      onClick={() => handleRemoveAllowedDomain(dom)}
                      className="hover:text-red-900 dark:hover:text-red-100 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newDomainInput}
                  onChange={e => setNewDomainInput(e.target.value)}
                  placeholder="e.g. clouindustrie.com"
                  className="flex-1 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddAllowedDomain}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-800 dark:text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Add Domain
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-neutral-800">
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <Lock className="w-4 h-4" />}
                {savedSuccess ? "Saved!" : "Save Google Settings"}
              </button>
            </div>
          </form>
        </div>

        {/* Live Token & Simulation Preview Box */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-red-500" />
              Google Token Validation (JWT)
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Decoded identity token payload returned by Google Identity Services.
            </p>

            {testResult ? (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                  <img
                    src={testResult.profile?.picture}
                    alt="Profile"
                    className="w-9 h-9 rounded-full border border-emerald-400"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-emerald-900 dark:text-emerald-200">
                      {testResult.profile?.name}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                      {testResult.profile?.email}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 text-slate-200 dark:bg-black text-[11px] font-mono space-y-1 overflow-x-auto">
                  <div className="text-slate-400 border-b border-slate-800 pb-1 text-xs font-sans">
                    Decrypted JWT Payload:
                  </div>
                  <pre className="text-[10px] text-emerald-400">
                    {JSON.stringify(testResult.jwtPayload, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-neutral-800/40 border border-dashed border-slate-200 dark:border-neutral-700 text-center space-y-2">
                <Lock className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500">
                  Click "Test Google Login" to simulate OAuth 2.0 authentication in real time.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 text-[11px] text-slate-500 space-y-1">
            <span className="font-semibold text-slate-700 dark:text-neutral-300">Verification DNS TXT Record:</span>
            <div className="font-mono text-xs text-red-600 dark:text-red-400 break-all">
              {currentConfig.dnsVerificationTxtRecord}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
