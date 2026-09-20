import React, { useState } from "react";
import { GlobalState, AuditLog, WalletTransaction, PayPalConfig, PayPalPaymentRecord, RolePermission, TeamMemberWithPermissions, GoogleAuthConfig } from "../types";
import { 
  CreditCard, ShieldCheck, Users, Key, Bell, Sliders, Plus, X, 
  ArrowUpRight, CheckCircle2, Download, Trash2, Shield, Settings, 
  ToggleLeft, ToggleRight, Check, AlertTriangle, CreditCard as CardIcon 
} from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { 
  logAuditEvent, 
  initialPayPalConfig, 
  initialPayPalTransactions, 
  initialRolesAndPermissions, 
  initialTeamMembers, 
  initialGoogleAuthConfig 
} from "../hooks/useGlobalState";
import PayPalManager from "../components/PayPalManager";
import AuthorizationsManager from "../components/AuthorizationsManager";
import GoogleAuthManager from "../components/GoogleAuthManager";
import { useLanguage } from "../App";

interface SettingsPageProps {
  state: GlobalState;
  isDark: boolean;
  activeItemId?: string;
  onSelectTab?: (id: string) => void;
}

const TABS = [
  { id: "set-1", label: "Billing & PayPal Gateway" },
  { id: "set-2", label: "Access & RBAC Permissions" },
  { id: "set-google", label: "Google Authentication" },
  { id: "set-3", label: "Audit Log" },
  { id: "set-4", label: "API Tokens" },
  { id: "set-5", label: "Notifications & Outages" },
  { id: "set-6", label: "Configurations" }
];

// Available Subscription plans
const PLANS = [
  {
    id: "plan-starter",
    name: "Starter",
    price: "0",
    period: "per month",
    description: "Ideal for evaluation and small infrastructure pilot deployments.",
    features: [
      "Up to 3 physical Edge nodes",
      "Basic reactive maintenance",
      "Community support (48h response)",
      "Audit logs retained for 24h"
    ],
    badgeColor: "bg-neutral-500/10 text-neutral-500"
  },
  {
    id: "plan-pro",
    name: "Professional",
    price: "299",
    period: "per month",
    description: "Designed for enterprises operating regional datacenter fleets.",
    features: [
      "Up to 25 physical Edge nodes",
      "Gemini AI predictive maintenance",
      "Advanced WAF & Zero-Trust policies",
      "Guaranteed 99.9% availability SLA"
    ],
    badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400"
  },
  {
    id: "plan-enterprise",
    name: "Enterprise CAFM Suite",
    price: "1499",
    period: "per month",
    description: "The complete orchestration suite for global networks and critical physical facilities.",
    features: [
      "Unlimited physical Edge nodes",
      "Multi-contract wallet coordinator",
      "Dedicated 24/7/365 crisis engineering team",
      "Persistent cryptographic audit trail",
      "Automated CSRD & ESG compliance exports"
    ],
    badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400"
  }
];

export default function SettingsPage({ state, isDark, activeItemId = "set-1", onSelectTab }: SettingsPageProps) {
  const currentTab = TABS.some(t => t.id === activeItemId) ? activeItemId : "set-1";
  const { language, setLanguage } = useLanguage();

  // Subscription plan state
  const [currentPlan, setCurrentPlan] = useState("plan-enterprise");

  // Custom Toast State for user actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Top up modal
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("12000");

  // Credit Cards states
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardHolder, setNewCardHolder] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [newCardCvc, setNewCardCvc] = useState("");
  const [cards, setCards] = useState([
    { id: "card-1", brand: "Visa Enterprise", last4: "9424", expiry: "12/28", holder: "CAFM Treasury SAS" },
    { id: "card-2", brand: "Mastercard Black", last4: "8841", expiry: "06/27", holder: "Beniich Corp Backup" }
  ]);

  // Invite member state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("SecOps Engineer");
  const [members, setMembers] = useState([
    { email: "beniich.contact@gmail.com", role: "Super Admin", status: "Active", mfa: "Hardware Key" },
    { email: "ops@enterprise.cafm.com", role: "CAFM Facilities Engineer", status: "Active", mfa: "Authenticator App" },
    { email: "sec@enterprise.cafm.com", role: "SecOps Engineer", status: "Active", mfa: "Hardware Key" },
    { email: "compliance@cafm-audit.org", role: "Read-Only Auditor", status: "Suspended", mfa: "None" }
  ]);

  // Dynamic RBAC Permission Grid State
  const [rbacPermissions, setRbacPermissions] = useState<Record<string, Record<string, boolean>>>({
    "Super Admin": { "billing": true, "nodes": true, "compute": true, "waf": true, "logs": true },
    "SecOps Engineer": { "billing": false, "nodes": true, "compute": true, "waf": true, "logs": true },
    "CAFM Facilities Engineer": { "billing": false, "nodes": true, "compute": false, "waf": false, "logs": false },
    "Read-Only Auditor": { "billing": false, "nodes": false, "compute": false, "waf": false, "logs": true },
  });

  // API Tokens state
  const [apiTokens, setApiTokens] = useState([
    { name: "CI/CD Deployment Key", prefix: "cf_live_8f...", permissions: "Workers:Write, DNS:Edit", created: "2026-09-01" },
    { name: "Prometheus Exporter Token", prefix: "cf_live_2a...", permissions: "Telemetry:Read", created: "2026-09-05" }
  ]);
  const [newTokenName, setNewTokenName] = useState("");
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  // Configuration toggles
  const [devMode, setDevMode] = useState(false);
  const [brotliEnabled, setBrotliEnabled] = useState(true);
  const [earlyHints, setEarlyHints] = useState(true);

  // LACAZA & Gateway States
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfig>(state.paypalConfig || initialPayPalConfig);
  const [paypalTxList, setPaypalTxList] = useState<PayPalPaymentRecord[]>(state.paypalTransactions || initialPayPalTransactions);
  const [rbacRoles, setRbacRoles] = useState<RolePermission[]>(state.rolesAndPermissions || initialRolesAndPermissions);
  const [teamMembersWithPerms, setTeamMembersWithPerms] = useState<TeamMemberWithPermissions[]>(state.teamMembers || initialTeamMembers);
  const [googleAuth, setGoogleAuth] = useState<GoogleAuthConfig>(state.googleAuthConfig || initialGoogleAuthConfig);

  const totalWalletBalance = (state.nodes || []).reduce((acc, curr) => acc + (curr.budget || 0), 0) + 12500;

  // Subscriptions switcher
  const handleSelectPlan = (planId: string, planName: string) => {
    setCurrentPlan(planId);
    logAuditEvent("SUBSCRIPTION_CHANGE", `Switched subscription package to ${planName}`);
    triggerToast(`Subscription successfully switched to ${planName}!`);
  };

  // Add Card handler
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber || !newCardHolder) return;
    const cleanNum = newCardNumber.replace(/\s+/g, "");
    const last4 = cleanNum.slice(-4) || "4242";
    const brand = cleanNum.startsWith("5") ? "Mastercard" : "Visa";
    
    setCards(prev => [...prev, {
      id: `card-${Date.now()}`,
      brand: `${brand} Business`,
      last4,
      expiry: newCardExpiry || "12/29",
      holder: newCardHolder
    }]);

    logAuditEvent("CREDIT_CARD_ADDED", `Registered new credit card ending in ****${last4}`);
    triggerToast(`New card ending in ****${last4} added successfully.`);
    setIsCardModalOpen(false);
    setNewCardNumber("");
    setNewCardHolder("");
    setNewCardExpiry("");
    setNewCardCvc("");
  };

  // Delete card handler
  const handleDeleteCard = (cardId: string, last4: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
    logAuditEvent("CREDIT_CARD_REMOVED", `Deleted credit card ending in ****${last4}`);
    triggerToast(`Payment card ending in ****${last4} removed.`);
  };

  // Top Up Wallet Handler
  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(topUpAmount);
    if (!amount || isNaN(amount)) return;

    try {
      const colRef = collection(db, "transactions");
      await addDoc(colRef, {
        nodeId: "global-treasury",
        type: "budget_allocation",
        amount,
        status: "completed",
        timestamp: new Date().toISOString(),
        description: `Manual CAFM Enterprise top-up of € ${amount.toLocaleString()}`,
        txHash: `0x${Math.floor(Math.random()*16777215).toString(16)}${Math.floor(Math.random()*16777215).toString(16)}`
      });
      await logAuditEvent("WALLET_TOP_UP", `Allocated € ${amount.toLocaleString()} to enterprise treasury`);
      triggerToast(`Top-up of € ${amount.toLocaleString()} credited successfully.`);
      setIsTopUpOpen(false);
    } catch (err) {
      console.error("Top-up error", err);
      triggerToast("Top-up failed via Firestore.");
    }
  };

  // Invite team member
  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail) return;
    setMembers(prev => [...prev, { email: newMemberEmail, role: newMemberRole, status: "Invited", mfa: "Pending" }]);
    logAuditEvent("MEMBER_INVITE", `Invited ${newMemberEmail} as ${newMemberRole}`);
    triggerToast(`Invitation sent to ${newMemberEmail}`);
    setIsInviteOpen(false);
    setNewMemberEmail("");
  };

  // Delete team member
  const handleDeleteMember = (email: string) => {
    setMembers(prev => prev.filter(m => m.email !== email));
    logAuditEvent("MEMBER_DELETE", `Removed organization member: ${email}`);
    triggerToast(`Member ${email} revoked from organization.`);
  };

  // Toggle member status
  const toggleMemberStatus = (email: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    setMembers(prev => prev.map(m => m.email === email ? { ...m, status: nextStatus } : m));
    logAuditEvent("MEMBER_STATUS_TOGGLE", `Modified member ${email} status to ${nextStatus}`);
    triggerToast(`Status for ${email}: ${nextStatus}`);
  };

  // Modify user role
  const handleUpdateMemberRole = (email: string, newRole: string) => {
    setMembers(prev => prev.map(m => m.email === email ? { ...m, role: newRole } : m));
    logAuditEvent("MEMBER_ROLE_UPDATE", `Changed role of ${email} to ${newRole}`);
    triggerToast(`Role for ${email} updated to ${newRole}.`);
  };

  // Toggle Permissions directly in UI
  const handleTogglePermission = (role: string, permissionKey: string) => {
    setRbacPermissions(prev => {
      const currentRolePerms = prev[role] || {};
      const updated = {
        ...prev,
        [role]: {
          ...currentRolePerms,
          [permissionKey]: !currentRolePerms[permissionKey]
        }
      };
      return updated;
    });
    logAuditEvent("RBAC_PERMISSION_TOGGLE", `Toggled permission ${permissionKey} for role ${role}`);
    triggerToast(`Permission [${permissionKey}] updated for role ${role}`);
  };

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName) return;
    setApiTokens(prev => [...prev, {
      name: newTokenName,
      prefix: `cf_live_${Math.random().toString(36).substring(2, 6)}...`,
      permissions: "All Zones:Read/Write",
      created: new Date().toISOString().split("T")[0]
    }]);
    logAuditEvent("API_TOKEN_CREATE", `Generated API token '${newTokenName}'`);
    triggerToast(`API Token '${newTokenName}' generated.`);
    setIsTokenModalOpen(false);
    setNewTokenName("");
  };

  const handleExportAuditCsv = () => {
    const rows = [
      ["Timestamp", "Action", "User", "Details", "IP Address"],
      ...(state.auditLogs || []).map(a => [
        a.timestamp,
        a.action,
        a.userEmail || a.userId,
        `"${(a.details || "").replace(/"/g, '""')}"`,
        a.ipAddress
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cafm-audit-logs-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {/* Dynamic Action Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-xl shadow-xl border bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-800 dark:border-neutral-200 flex items-center gap-3 animate-in fade-in slide-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-neutral-200 dark:border-neutral-800 pb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organization & Settings</h1>
          <p className="text-sm text-neutral-500 mt-1">lacaza.clouindustrie.com / Account Governance, Subscriptions & Granular RBAC Permissions</p>
        </div>
        {currentTab === "set-1" && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsCardModalOpen(true)}
              className="px-3.5 py-1.5 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-neutral-700 cursor-pointer shadow-xs"
            >
              <CreditCard className="w-4 h-4 text-orange-500" /> Add Card
            </button>
            <button 
              onClick={() => setIsTopUpOpen(true)}
              className="px-3.5 py-1.5 bg-[#FF6C2C] hover:bg-[#e05b1f] text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Top-Up LACAZA Wallet
            </button>
          </div>
        )}
        {currentTab === "set-2" && (
          <button 
            onClick={() => setIsInviteOpen(true)}
            className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Invite Member
          </button>
        )}
        {currentTab === "set-3" && (
          <button 
            onClick={handleExportAuditCsv}
            className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
        {currentTab === "set-4" && (
          <button 
            onClick={() => setIsTokenModalOpen(true)}
            className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Create API Token
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 border-b border-neutral-200 dark:border-neutral-800 pb-px">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onSelectTab && onSelectTab(tab.id)}
            className={`px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              currentTab === tab.id
                ? "bg-white dark:bg-neutral-900 border-t-2 border-l border-r border-t-neutral-900 dark:border-t-white border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-View: Billing & CAFM Plans (set-1) */}
      {currentTab === "set-1" && (
        <div className="space-y-6">
          
          {/* Subscription Section Heading */}
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight">Active Subscription Management</h2>
            <p className="text-xs text-neutral-500">Select the plan tailored to the capacity of your industrial facilities and distributed datacenters.</p>
          </div>

          {/* Pricing/Subscription Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map(plan => {
              const isActive = currentPlan === plan.id;
              return (
                <div 
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id, plan.name)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isActive 
                      ? "border-orange-500 bg-orange-500/5 ring-1 ring-orange-500" 
                      : "border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900/60 shadow-xs"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${plan.badgeColor}`}>
                        {plan.name}
                      </span>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500">
                          <Check className="w-3.5 h-3.5" /> ACTIVE PLAN
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1 font-mono">
                        <span className="text-2xl font-bold">€ {plan.price}</span>
                        <span className="text-xs text-neutral-500">/{plan.period}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-2 min-h-[32px]">{plan.description}</p>
                    </div>

                    <div className="border-t border-neutral-100 dark:border-neutral-900 pt-3 space-y-2">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                          <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan.id, plan.name);
                    }}
                    className={`mt-4 w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive 
                        ? "bg-orange-500 text-white" 
                        : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                    }`}
                  >
                    {isActive ? "Current Plan" : "Select this Plan"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Section: Payments & Wallets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            
            {/* Wallet Balance Cards & Payment Cards */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold">Payment Methods & Invoicing</h3>
                <p className="text-xs text-neutral-500">Manage credit cards linked to your enterprise infrastructure treasury.</p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map(card => (
                  <div 
                    key={card.id} 
                    className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-neutral-900 dark:to-neutral-850 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white space-y-6 relative overflow-hidden shadow-xs"
                  >
                    {/* Background glows */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl" />
                    
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-neutral-500">Corporate Card</span>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{card.brand}</div>
                      </div>
                      <button 
                        onClick={() => handleDeleteCard(card.id, card.last4)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete Card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="text-lg font-mono tracking-widest text-slate-800 dark:text-neutral-200">
                        ••••  ••••  ••••  {card.last4}
                      </div>
                      <div className="flex justify-between items-end text-xs">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-slate-500 dark:text-neutral-500 block">Cardholder</span>
                          <span className="font-medium text-slate-700 dark:text-neutral-300">{card.holder}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] uppercase tracking-wider text-slate-500 dark:text-neutral-500 block">Expires</span>
                          <span className="font-medium text-slate-700 dark:text-neutral-300">{card.expiry}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty State / Add Card Trigger Box */}
                <div 
                  onClick={() => setIsCardModalOpen(true)}
                  className="p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-neutral-800 hover:border-orange-400 dark:hover:border-orange-500 flex flex-col justify-center items-center text-center gap-2 cursor-pointer transition-colors bg-white dark:bg-neutral-900/40 min-h-[162px]"
                >
                  <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-400">
                    <CardIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">Add Payment Method</span>
                  <p className="text-[10px] text-neutral-500 max-w-[180px]">Visa, Mastercard, Amex accepted securely</p>
                </div>
              </div>
            </div>

            {/* Micro Wallet Balances overview */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-neutral-500">Financial Balance</h3>
              <div className="space-y-1">
                <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white">€ {totalWalletBalance.toLocaleString()}</span>
                <p className="text-xs text-slate-500 dark:text-neutral-500">Infrastructure funds allocated for autonomous predictive maintenance.</p>
              </div>

              <div className="space-y-2 text-xs pt-2 border-t border-slate-200 dark:border-neutral-800">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-500">Base subscription:</span>
                  <span className="font-bold text-slate-800 dark:text-neutral-200">€ {PLANS.find(p => p.id === currentPlan)?.price} / mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-500">Connected physical nodes:</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{(state.nodes || []).length} active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-500">Settlement frequency:</span>
                  <span className="font-bold text-slate-800 dark:text-neutral-200">Automatic / Real-time</span>
                </div>
              </div>

              <button 
                onClick={() => setIsTopUpOpen(true)}
                className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Top-Up Treasury
              </button>
            </div>
          </div>

          {/* Ledger Table Section */}
          <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs overflow-hidden pt-2">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Archived Invoices & Transactions</h3>
              <span className="text-xs text-slate-500 dark:text-neutral-500 font-mono">Ledger secured by Firestore</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-500 font-sans">
                  <tr>
                    <th className="p-3">Type</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Transaction ID</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                  {(state.transactions || []).map(tx => (
                    <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                      <td className="p-3 uppercase font-bold text-neutral-500">{tx.type.replace("_", " ")}</td>
                      <td className="p-3 font-sans text-neutral-800 dark:text-neutral-200">{tx.description}</td>
                      <td className="p-3 font-bold">€ {tx.amount.toLocaleString()}</td>
                      <td className="p-3 text-neutral-500 truncate max-w-[120px]">{tx.txHash}</td>
                      <td className="p-3">
                        <span className="text-green-500 font-bold uppercase">{tx.status}</span>
                      </td>
                    </tr>
                  ))}
                  {(state.transactions || []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-neutral-500 font-sans">
                        No transactions found. Click "Top-Up LACAZA Wallet" to add funds.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PayPal Gateway Configuration & Processing Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-neutral-800">
            <PayPalManager
              config={paypalConfig}
              transactions={paypalTxList}
              onUpdateConfig={setPaypalConfig}
              onAddTransaction={(newTx) => {
                setPaypalTxList(prev => [newTx, ...prev]);
                triggerToast(`PayPal payment of €${newTx.amount} completed successfully!`);
              }}
              isDark={isDark}
            />
          </div>

        </div>
      )}

      {/* Sub-View: Members & RBAC Permissions (set-2) */}
      {currentTab === "set-2" && (
        <div className="space-y-6">
          <AuthorizationsManager
            roles={rbacRoles}
            members={teamMembersWithPerms}
            onUpdateRoles={setRbacRoles}
            onUpdateMembers={setTeamMembersWithPerms}
            isDark={isDark}
          />
        </div>
      )}

      {/* Sub-View: Google Authentication & SSO (set-google) */}
      {currentTab === "set-google" && (
        <div className="space-y-6">
          <GoogleAuthManager
            config={googleAuth}
            onUpdateConfig={setGoogleAuth}
            isDark={isDark}
          />
        </div>
      )}

      {/* Sub-View: Audit Log (set-3) */}
      {currentTab === "set-3" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Cryptographic Edge Audit Trail</h3>
                <p className="text-xs text-slate-500 dark:text-neutral-500">Live stream of all platform administrative actions in Firestore</p>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-neutral-500">{(state.auditLogs || []).length} Events</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-500 font-sans">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Details</th>
                    <th className="p-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {(state.auditLogs || []).map(log => (
                    <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                      <td className="p-3 text-neutral-500 text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-neutral-800 dark:text-neutral-200">{log.action}</td>
                      <td className="p-3 font-sans text-neutral-500">{log.userEmail || log.userId}</td>
                      <td className="p-3 font-sans text-neutral-700 dark:text-neutral-300">{log.details}</td>
                      <td className="p-3 text-neutral-500">{log.ipAddress}</td>
                    </tr>
                  ))}
                  {(state.auditLogs || []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-neutral-500 font-sans">
                        No audit logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View: API Tokens (set-4) */}
      {currentTab === "set-4" && (
        <div className="rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">API Tokens & Authentication Keys</h3>
            <span className="text-xs text-slate-500 dark:text-neutral-500 font-mono">Scoped Edge Tokens</span>
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs font-mono">
            {apiTokens.map((tok, i) => (
              <div key={i} className="p-4 flex justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                <div>
                  <div className="font-bold text-sm font-sans">{tok.name}</div>
                  <div className="text-neutral-500 text-[11px] mt-1 font-mono">Token: {tok.prefix} | Permissions: {tok.permissions}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 font-bold">Active</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-View: Notifications (set-5) */}
      {currentTab === "set-5" && (
        <div className="p-5 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Incident Notification Channels</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-500">Configure automated alerting for P1 outages, DDoS mitigation triggers, and work order escalations.</p>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 flex justify-between items-center bg-slate-50/50 dark:bg-neutral-900/30">
              <div>
                <div className="font-bold font-sans text-slate-800 dark:text-neutral-200">Slack Webhook (#noc-alerts)</div>
                <div className="text-slate-500 dark:text-neutral-500">Triggers on: Node Degraded, DDoS Flood</div>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">CONFIGURED</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 flex justify-between items-center bg-slate-50/50 dark:bg-neutral-900/30">
              <div>
                <div className="font-bold font-sans text-slate-800 dark:text-neutral-200">PagerDuty Escalation Policy</div>
                <div className="text-slate-500 dark:text-neutral-500">Triggers on: P1 CAFM Work Orders, Edge Outages</div>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View: Configurations (set-6) */}
      {currentTab === "set-6" && (
        <div className="p-5 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Zone Advanced Configurations</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-500">Platform optimization toggles for enterprise.cafm.com</p>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30">
              <div>
                <div className="font-bold text-slate-800 dark:text-neutral-200">Development Mode</div>
                <div className="text-slate-500 dark:text-neutral-500">Bypasses edge cache temporarily for 3 hours to inspect origin response changes</div>
              </div>
              <button
                onClick={() => setDevMode(!devMode)}
                className={`px-3 py-1.5 rounded font-bold transition-colors cursor-pointer ${
                  devMode ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-400"
                }`}
              >
                {devMode ? "ON" : "OFF"}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30">
              <div>
                <div className="font-bold text-slate-800 dark:text-neutral-200">Brotli Compression</div>
                <div className="text-slate-500 dark:text-neutral-500">Speed up page load times for visitors by applying compression at edge</div>
              </div>
              <button
                onClick={() => setBrotliEnabled(!brotliEnabled)}
                className={`px-3 py-1.5 rounded font-bold transition-colors cursor-pointer ${
                  brotliEnabled ? "bg-orange-500 text-white" : "bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-400"
                }`}
              >
                {brotliEnabled ? "ENABLED" : "DISABLED"}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30">
              <div>
                <div className="font-bold text-slate-800 dark:text-neutral-200">Early Hints (103)</div>
                <div className="text-slate-500 dark:text-neutral-500">Send 103 Early Hints before final response to preload critical CSS/JS</div>
              </div>
              <button
                onClick={() => setEarlyHints(!earlyHints)}
                className={`px-3 py-1.5 rounded font-bold transition-colors cursor-pointer ${
                  earlyHints ? "bg-orange-500 text-white" : "bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-400"
                }`}
              >
                {earlyHints ? "ENABLED" : "DISABLED"}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30">
              <div>
                <div className="font-bold text-slate-800 dark:text-neutral-200">Application Language / Langue de l'interface</div>
                <div className="text-slate-500 dark:text-neutral-500">Dynamically update application language context between English and French</div>
              </div>
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value as "en" | "fr";
                  setLanguage(newLang);
                  triggerToast(newLang === "fr" ? "Langue changée en Français avec succès !" : "Language successfully switched to English!");
                }}
                className="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="en">English (US)</option>
                <option value="fr">Français (France)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top-Up CAFM Enterprise Wallet</h3>
              <button onClick={() => setIsTopUpOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Amount to Credit (€ EUR)</label>
                <input 
                  required
                  type="number" 
                  value={topUpAmount}
                  onChange={e => setTopUpAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white"
                  placeholder="12000"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsTopUpOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600 cursor-pointer shadow-xs"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invite Team Member</h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={newMemberEmail}
                  onChange={e => setNewMemberEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white"
                  placeholder="colleague@enterprise.cafm.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Initial Role</label>
                <select 
                  value={newMemberRole}
                  onChange={e => setNewMemberRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="SecOps Engineer">SecOps Engineer</option>
                  <option value="CAFM Facilities Engineer">CAFM Facilities Engineer</option>
                  <option value="Read-Only Auditor">Read-Only Auditor</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600 cursor-pointer shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Card Modal */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold">Add Credit Card</h3>
              <button onClick={() => setIsCardModalOpen(false)} className="text-neutral-500 hover:text-black dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Cardholder Name</label>
                <input 
                  required
                  type="text" 
                  value={newCardHolder}
                  onChange={e => setNewCardHolder(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-2 text-sm"
                  placeholder="M. BENIICH"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Card Number</label>
                <input 
                  required
                  type="text" 
                  maxLength={19}
                  value={newCardNumber}
                  onChange={e => {
                    const v = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                    setNewCardNumber(v);
                  }}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-2 text-sm font-mono"
                  placeholder="4242 4242 4242 9424"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Expiration Date</label>
                  <input 
                    required
                    type="text" 
                    maxLength={5}
                    value={newCardExpiry}
                    onChange={e => {
                      let v = e.target.value.replace(/\D/g, "");
                      if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2, 4)}`;
                      setNewCardExpiry(v);
                    }}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-2 text-sm font-mono"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Security Code (CVC)</label>
                  <input 
                    required
                    type="password" 
                    maxLength={3}
                    value={newCardCvc}
                    onChange={e => setNewCardCvc(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-2 text-sm font-mono"
                    placeholder="•••"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsCardModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded hover:bg-orange-600"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Token Modal */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create API Token</h3>
              <button onClick={() => setIsTokenModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateToken} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Token Name / Service</label>
                <input 
                  required
                  type="text" 
                  value={newTokenName}
                  onChange={e => setNewTokenName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white"
                  placeholder="e.g. GitHub Actions Edge Deployer"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsTokenModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
