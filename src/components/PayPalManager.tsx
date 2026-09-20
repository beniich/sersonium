import React, { useState } from "react";
import { PayPalConfig, PayPalPaymentRecord } from "../types";
import { 
  CreditCard, ShieldCheck, CheckCircle2, AlertCircle, 
  ExternalLink, Eye, EyeOff, RefreshCw, Plus, ArrowUpRight, 
  Download, Check, Sparkles, Send, Lock, DollarSign
} from "lucide-react";
import { logAuditEvent } from "../hooks/useGlobalState";

interface PayPalManagerProps {
  config: PayPalConfig;
  transactions: PayPalPaymentRecord[];
  onUpdateConfig: (newConfig: PayPalConfig) => void;
  onAddTransaction: (newTx: PayPalPaymentRecord) => void;
  isDark: boolean;
}

export default function PayPalManager({
  config,
  transactions,
  onUpdateConfig,
  onAddTransaction,
  isDark
}: PayPalManagerProps) {
  const [currentConfig, setCurrentConfig] = useState<PayPalConfig>(config);
  const [showSecret, setShowSecret] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // PayPal Checkout modal simulator state
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState<number>(499);
  const [checkoutDesc, setCheckoutDesc] = useState<string>("Souscription Forfait Pro CAFM Edge - LACAZA");
  const [checkoutProcessing, setCheckoutProcessing] = useState(false);
  const [checkoutSuccessRecord, setCheckoutSuccessRecord] = useState<PayPalPaymentRecord | null>(null);

  // Webhook simulator state
  const [simulatedWebhook, setSimulatedWebhook] = useState<{
    event: string;
    status: string;
    timestamp: string;
    payload: any;
  } | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(currentConfig);
    await logAuditEvent("PAYPAL_CONFIG_UPDATE", `PayPal configuration update (Mode: ${currentConfig.mode}, Merchant: ${currentConfig.merchantEmail})`);
    setSavedSuccess(true);
    showNotification("PayPal configuration saved successfully!");
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Simulate PayPal Checkout transaction
  const handleExecutePayPalPayment = async (method: "paypal_balance" | "card_via_paypal") => {
    setCheckoutProcessing(true);

    setTimeout(async () => {
      const newTxId = `PAYID-${Math.random().toString(36).substring(2, 8).toUpperCase()}${Math.floor(Math.random() * 89999 + 10000)}`;
      const newRecord: PayPalPaymentRecord = {
        id: `pp-${Date.now()}`,
        orderId: newTxId,
        payerEmail: "buyer@lacaza.clouindustrie.com",
        payerName: "LACAZA Partner Client",
        amount: checkoutAmount,
        currency: currentConfig.currency || "EUR",
        description: checkoutDesc,
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
        paymentMethod: method
      };

      onAddTransaction(newRecord);
      setCheckoutProcessing(false);
      setCheckoutSuccessRecord(newRecord);

      await logAuditEvent("PAYPAL_TRANSACTION_CAPTURED", `PayPal payment succeeded: ${newTxId} (${checkoutAmount} ${currentConfig.currency})`);
      showNotification(`PayPal payment captured: ${newTxId}`);
    }, 1200);
  };

  // Trigger test webhook
  const handleSimulateWebhook = async (eventType: string) => {
    const eventPayload = {
      id: `WH-EV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      event_version: "1.0",
      create_time: new Date().toISOString(),
      event_type: eventType,
      summary: `PayPal Instant Payment Notification (IPN) for LACAZA`,
      resource: {
        id: `PAYID-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        amount: {
          total: `${checkoutAmount}.00`,
          currency: currentConfig.currency
        },
        state: "completed",
        merchant_id: currentConfig.merchantEmail
      }
    };

    setSimulatedWebhook({
      event: eventType,
      status: "VERIFIED_200_OK",
      timestamp: new Date().toLocaleTimeString(),
      payload: eventPayload
    });

    await logAuditEvent("PAYPAL_WEBHOOK_TEST", `Test webhook received: ${eventType}`);
    showNotification(`PayPal webhook validated: ${eventType}`);
  };

  const totalCaptured = transactions
    .filter(t => t.status === "COMPLETED")
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600/10 via-sky-500/5 to-transparent dark:border-blue-500/20 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#003087] text-white flex items-center gap-1.5 shadow-xs">
                <CreditCard className="w-3.5 h-3.5 text-[#0079C1]" />
                PayPal Gateway
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                currentConfig.mode === "live"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
              }`}>
                Mode {currentConfig.mode === "live" ? "Production (Live)" : "Sandbox (Test)"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 dark:bg-neutral-800 dark:text-neutral-300">
                IPN & Webhooks Active
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              PayPal Gateway & Payments Configuration
            </h2>
            <p className="text-xs text-slate-600 dark:text-neutral-400">
              Manage PayPal API credentials, LACAZA subscription collection, and automated balance reload triggers.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setCheckoutSuccessRecord(null);
                setIsCheckoutModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0070BA] hover:bg-[#003087] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Test Smart Checkout
            </button>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-blue-500/15 text-xs">
          <div>
            <span className="text-slate-500 dark:text-neutral-500 block">Total PayPal Captured</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
              {totalCaptured.toLocaleString()} {currentConfig.currency}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-neutral-500 block">Successful Transactions</span>
            <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {transactions.filter(t => t.status === "COMPLETED").length}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-neutral-500 block">Primary Merchant</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white truncate block" title={currentConfig.merchantEmail}>
              {currentConfig.merchantEmail}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-neutral-500 block">IPN Webhook Status</span>
            <span className="text-base font-bold font-mono text-blue-600 dark:text-blue-400">
              Active Listening (200 OK)
            </span>
          </div>
        </div>
      </div>

      {/* Main Form & Credentials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration settings form */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-5">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                PayPal Credentials & Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Security API keys and merchant account configuration for LACAZA
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Mode:</span>
              <button
                type="button"
                onClick={() => setCurrentConfig({ ...currentConfig, mode: currentConfig.mode === "live" ? "sandbox" : "live" })}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  currentConfig.mode === "live"
                    ? "bg-emerald-500 text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                {currentConfig.mode.toUpperCase()}
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                Receiving Merchant Email (PayPal Account)
              </label>
              <input
                required
                type="email"
                value={currentConfig.merchantEmail}
                onChange={e => setCurrentConfig({ ...currentConfig, merchantEmail: e.target.value })}
                className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                PayPal REST API Client ID
              </label>
              <input
                required
                type="text"
                value={currentConfig.clientId}
                onChange={e => setCurrentConfig({ ...currentConfig, clientId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                PayPal Secret Key
              </label>
              <div className="relative">
                <input
                  required
                  type={showSecret ? "text" : "password"}
                  value={currentConfig.clientSecretMasked}
                  onChange={e => setCurrentConfig({ ...currentConfig, clientSecretMasked: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 pr-10"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                  Webhook ID (IPN Endpoint)
                </label>
                <input
                  type="text"
                  value={currentConfig.webhookId || ""}
                  onChange={e => setCurrentConfig({ ...currentConfig, webhookId: e.target.value })}
                  placeholder="WH-9K8247192L883012P"
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                  Primary Currency
                </label>
                <select
                  value={currentConfig.currency}
                  onChange={e => setCurrentConfig({ ...currentConfig, currency: e.target.value as "EUR" | "USD" | "GBP" })}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EUR">Euro (€ - EUR)</option>
                  <option value="USD">US Dollar ($ - USD)</option>
                  <option value="GBP">British Pound (£ - GBP)</option>
                </select>
              </div>
            </div>

            {/* Auto-recharge parameters */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950/50 border border-slate-200 dark:border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Edge Balance Auto-Reload Settings
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Minimum Trigger Threshold (€)
                  </label>
                  <input
                    type="number"
                    value={currentConfig.autoRechargeThreshold || 500}
                    onChange={e => setCurrentConfig({ ...currentConfig, autoRechargeThreshold: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Auto-Reload Amount (€)
                  </label>
                  <input
                    type="number"
                    value={currentConfig.autoRechargeAmount || 2000}
                    onChange={e => setCurrentConfig({ ...currentConfig, autoRechargeAmount: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <ShieldCheck className="w-4 h-4" />}
                {savedSuccess ? "Saved!" : "Save Gateway Settings"}
              </button>
            </div>
          </form>
        </div>

        {/* Webhook & IPN Listener Simulation Box */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-500" />
              Webhook & IPN Tester
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Trigger asynchronous PayPal events to test order and invoice handling.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleSimulateWebhook("PAYMENT.CAPTURE.COMPLETED")}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-neutral-700 text-xs font-mono text-slate-800 dark:text-neutral-200 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>CAPTURE.COMPLETED</span>
                <span className="text-emerald-600 font-bold">200 OK</span>
              </button>

              <button
                onClick={() => handleSimulateWebhook("BILLING.SUBSCRIPTION.ACTIVATED")}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-neutral-700 text-xs font-mono text-slate-800 dark:text-neutral-200 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>SUBSCRIPTION.ACTIVATED</span>
                <span className="text-emerald-600 font-bold">200 OK</span>
              </button>

              <button
                onClick={() => handleSimulateWebhook("CUSTOMER.DISPUTE.RESOLVED")}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-neutral-700 text-xs font-mono text-slate-800 dark:text-neutral-200 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>DISPUTE.RESOLVED</span>
                <span className="text-blue-600 font-bold">ACK</span>
              </button>
            </div>

            {simulatedWebhook && (
              <div className="p-3 rounded-lg bg-slate-900 text-slate-200 dark:bg-black text-[11px] font-mono space-y-1.5 animate-in fade-in duration-200 overflow-x-auto">
                <div className="flex justify-between items-center text-xs text-emerald-400 font-bold border-b border-slate-800 pb-1">
                  <span>{simulatedWebhook.event}</span>
                  <span>{simulatedWebhook.timestamp}</span>
                </div>
                <pre className="text-[10px] text-slate-400">
                  {JSON.stringify(simulatedWebhook.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-neutral-300">IPN Callback URL:</span>
            <div className="font-mono text-blue-600 dark:text-blue-400 break-all mt-0.5">
              https://lacaza.clouindustrie.com/api/v1/paypal/ipn
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/50 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-500" />
              PayPal Payment History ({transactions.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Captured transactions, recurring subscriptions, and account reloads
            </p>
          </div>
          <button
            onClick={() => {
              setCheckoutSuccessRecord(null);
              setIsCheckoutModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Test Payment
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 font-semibold text-slate-600 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Order ID (PAYID)</th>
                <th className="px-4 py-3">Payer / Company</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-neutral-800 font-mono">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-neutral-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    {tx.orderId}
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <div className="font-semibold text-slate-800 dark:text-neutral-200">{tx.payerName}</div>
                    <div className="text-[11px] text-slate-400">{tx.payerEmail}</div>
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-600 dark:text-neutral-300">
                    {tx.description}
                  </td>
                  <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">
                    {tx.amount.toFixed(2)} {tx.currency}
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-[10px]">
                      {tx.paymentMethod === "paypal_balance" ? "PayPal Balance" : "Card via PayPal"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-500 dark:text-neutral-400 text-[11px]">
                    {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive PayPal Smart Buttons Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-2xl w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[#003087] font-bold text-lg font-mono italic">Pay</span>
                <span className="text-[#0079C1] font-bold text-lg font-mono italic -ml-1.5">Pal</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-neutral-400 ml-2">Checkout Simulator</span>
              </div>
              <button 
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {!checkoutSuccessRecord ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-neutral-400">Merchant:</span>
                    <span className="font-bold text-slate-900 dark:text-white">LACAZA ClouIndustrie</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-neutral-400">Amount:</span>
                    <span className="font-mono font-bold text-base text-blue-600 dark:text-blue-400">
                      {checkoutAmount}.00 {currentConfig.currency}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 border-t border-slate-200 dark:border-neutral-700 pt-1.5">
                    {checkoutDesc}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                    Change test amount (€)
                  </label>
                  <div className="flex gap-2">
                    {[99, 299, 499, 1499].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setCheckoutAmount(amt)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                          checkoutAmount === amt 
                            ? "bg-blue-600 text-white border-blue-600" 
                            : "bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border-transparent"
                        }`}
                      >
                        {amt} €
                      </button>
                    ))}
                  </div>
                </div>

                {/* PayPal Smart Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    disabled={checkoutProcessing}
                    onClick={() => handleExecutePayPalPayment("paypal_balance")}
                    className="w-full py-3 rounded-full bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {checkoutProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#003087]" />
                    ) : (
                      <>
                        <span className="italic font-extrabold text-base">Pay<span className="text-[#0079C1]">Pal</span></span>
                        <span>Pay Now</span>
                      </>
                    )}
                  </button>

                  <button
                    disabled={checkoutProcessing}
                    onClick={() => handleExecutePayPalPayment("card_via_paypal")}
                    className="w-full py-3 rounded-full bg-[#2C2E2F] hover:bg-[#1E1F20] text-white font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Debit or Credit Card</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
                  <Lock className="w-3 h-3" />
                  Secure, encrypted payment powered by PayPal infrastructure
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-2 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    PayPal Payment Confirmed!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    The transaction was successfully captured by the LACAZA gateway.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl text-left text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order ID:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{checkoutSuccessRecord.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{checkoutSuccessRecord.amount} {checkoutSuccessRecord.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date:</span>
                    <span>{new Date(checkoutSuccessRecord.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
