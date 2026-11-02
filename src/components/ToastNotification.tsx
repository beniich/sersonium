/**
 * @file ToastNotification.tsx
 * @description FEAT-01 — Système de notifications toast pour les événements de quota,
 * d'abonnement, d'alertes critiques et d'actions système.
 */
import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X, Zap, Crown, TrendingUp } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info" | "upgrade" | "quota";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, default 4500
  action?: { label: string; onClick: () => void };
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextType>({
  addToast: () => {},
  removeToast: () => {},
  toasts: [],
});

export const useToast = () => useContext(ToastContext);

/* ─── PROVIDER ─── */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-4), { ...toast, id }]); // max 5 at once
    const duration = toast.duration ?? 4500;
    if (duration > 0) {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Listen to sensorium global events
  useEffect(() => {
    const handleQuotaUpdated = (e: any) => {
      const detail = e.detail as { tier?: string; usage?: any; percent?: number };
      if (!detail) return;
    };

    const handleSubscriptionChanged = (e: any) => {
      const detail = e.detail as { tier?: string; planName?: string };
      if (detail?.tier && detail.tier !== "free") {
        addToast({
          type: "upgrade",
          title: "Abonnement activé !",
          message: `Bienvenue sur ${detail.planName || detail.tier} — vos nouveaux quotas sont actifs.`,
          duration: 6000,
        });
      }
    };

    const handleQuotaWarning = (e: any) => {
      const detail = e.detail as { percent?: number; tier?: string };
      if ((detail?.percent ?? 0) >= 90) {
        addToast({
          type: "error",
          title: "Quota critique — 90% utilisé",
          message: "Quota mensuel presque épuisé. Pensez à passer au palier supérieur.",
          duration: 7000,
          action: { label: "Voir les plans", onClick: () => { window.location.hash = "#pricing"; } },
        });
      } else if ((detail?.percent ?? 0) >= 80) {
        addToast({
          type: "warning",
          title: "⚠️ Quota à 80%",
          message: "Vous approchez de votre limite mensuelle de jetons IA.",
          duration: 5000,
        });
      }
    };

    window.addEventListener("sensorium:quota_updated", handleQuotaUpdated);
    window.addEventListener("sensorium:subscription_changed", handleSubscriptionChanged);
    window.addEventListener("sensorium:quota_warning", handleQuotaWarning);
    return () => {
      window.removeEventListener("sensorium:quota_updated", handleQuotaUpdated);
      window.removeEventListener("sensorium:subscription_changed", handleSubscriptionChanged);
      window.removeEventListener("sensorium:quota_warning", handleQuotaWarning);
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

/* ─── ICONS PER TYPE ─── */
const TOAST_CONFIG: Record<ToastType, { icon: React.ElementType; bg: string; border: string; iconColor: string }> = {
  success: { icon: CheckCircle2, bg: "bg-[#0e1a12]", border: "border-emerald-500/40", iconColor: "text-emerald-400" },
  warning: { icon: AlertTriangle,  bg: "bg-[#1a160a]", border: "border-amber-500/40",   iconColor: "text-amber-400"   },
  error:   { icon: XCircle,        bg: "bg-[#1a0d0d]", border: "border-rose-500/40",    iconColor: "text-rose-400"    },
  info:    { icon: Info,           bg: "bg-[#0e1220]", border: "border-blue-500/40",    iconColor: "text-blue-400"    },
  upgrade: { icon: Crown,          bg: "bg-[#140d1a]", border: "border-purple-500/40",  iconColor: "text-purple-400"  },
  quota:   { icon: TrendingUp,     bg: "bg-[#0e1220]", border: "border-indigo-500/40",  iconColor: "text-indigo-400"  },
};

/* ─── SINGLE TOAST ─── */
const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);
  const cfg = TOAST_CONFIG[toast.type];
  const Icon = cfg.icon;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      role="alert"
      className={`
        relative flex items-start gap-3 w-full max-w-sm px-4 py-3.5 rounded-2xl
        border ${cfg.border} ${cfg.bg} backdrop-blur-xl shadow-2xl
        transition-all duration-300 ease-out cursor-pointer
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      onClick={() => onRemove(toast.id)}
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${cfg.iconColor.replace("text-", "bg-")}`} />

      <div className={`mt-0.5 shrink-0 ${cfg.iconColor}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
        {toast.action && (
          <button
            className={`mt-2 text-xs font-semibold ${cfg.iconColor} hover:underline`}
            onClick={(e) => { e.stopPropagation(); toast.action!.onClick(); onRemove(toast.id); }}
          >
            {toast.action.label} →
          </button>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onRemove(toast.id); }}
        className="shrink-0 text-slate-500 hover:text-white transition-colors mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

/* ─── CONTAINER ─── */
const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-2.5 items-end pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
};

export default ToastProvider;
