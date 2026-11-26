import React, { useEffect, useRef, useState } from "react";
import { Lock, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../App";
import { apiClient } from "../services/apiClient";
import authService from "../services/auth.service";

interface PayPalSmartButtonProps {
  planId: string;
  tenantId?: string;
  onSuccess: (details: { subscriptionId: string; planId: string }) => void;
  onError?: (err: any) => void;
  isDark?: boolean;
}

export default function PayPalSmartButton({
  planId,
  tenantId,
  onSuccess,
  onError,
  isDark = true,
}: PayPalSmartButtonProps) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const isRenderedRef = useRef(false);

  // 1. Récupérer la configuration publique PayPal depuis le backend
  useEffect(() => {
    let isMounted = true;

    async function fetchConfig() {
      try {
        const res = await apiClient.get("/paypal/config");
        if (res.data?.success && res.data?.data?.clientId) {
          if (isMounted) setClientId(res.data.data.clientId);
        } else {
          throw new Error("Client ID PayPal non configuré sur le serveur.");
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("[PayPal SDK Init Error]", err);
          setSdkError(err.response?.data?.message || err.message || "Erreur lors du chargement de la passerelle PayPal.");
          setLoading(false);
        }
      }
    }

    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Charger le SDK PayPal et afficher les Smart Buttons officiels
  useEffect(() => {
    if (!clientId) return;

    const scriptId = "paypal-js-sdk-live";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const renderButtons = () => {
      if (!(window as any).paypal || !buttonContainerRef.current) return;

      // Nettoyer les boutons précédents si re-rendu
      buttonContainerRef.current.innerHTML = "";

      try {
        (window as any).paypal
          .Buttons({
            style: {
              layout: "vertical",
              color: "black",
              shape: "pill",
              label: "subscribe",
              height: 42,
            },
            createSubscription: (data: any, actions: any) => {
              const activeTenantId = tenantId || authService.getSession().user?.tenantId || "default-tenant";
              return actions.subscription.create({
                plan_id: planId,
                custom_id: activeTenantId,
              });
            },
            onApprove: async (data: any, actions: any) => {
              setLoading(true);
              try {
                // 1. Finaliser l'ordre de capture côté backend pour activer l'abonnement en base
                const activeTenantId = tenantId || authService.getSession().user?.tenantId;
                await apiClient.post("/paypal/capture-order", {
                  orderId: data.orderID,
                  subscriptionId: data.subscriptionID,
                  planId,
                  tenantId: activeTenantId,
                }).catch((backendErr) => {
                  console.warn("[PayPal Backend Capture Warning - non-blocking for client flow]", backendErr);
                });

                // 2. Synchroniser les composants UI
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("sensorium:subscription_changed", {
                    detail: { planId, subscriptionId: data.subscriptionID }
                  }));
                  window.dispatchEvent(new CustomEvent("sensorium:quota_updated"));
                }

                // 3. Callback parent
                onSuccess({
                  subscriptionId: data.subscriptionID,
                  planId: planId,
                });
              } catch (captureErr: any) {
                console.error("[PayPal Capture Error]", captureErr);
                if (onError) onError(captureErr);
                setSdkError(captureErr.message || "Erreur lors de la finalisation de l'abonnement.");
              } finally {
                setLoading(false);
              }
            },
            onError: (err: any) => {
              console.error("[PayPal SDK Error]", err);
              if (onError) onError(err);
              setSdkError("Une erreur est survenue lors de la transaction PayPal.");
            },
          })
          .render(buttonContainerRef.current)
          .then(() => {
            setLoading(false);
            isRenderedRef.current = true;
          })
          .catch((err: any) => {
            console.warn("[PayPal Button Render Warning]", err);
            setLoading(false);
          });
      } catch (e: any) {
        console.error("[PayPal Button Exception]", e);
        setLoading(false);
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription&components=buttons`;
      script.async = true;
      script.onload = () => renderButtons();
      script.onerror = () => {
        setSdkError("Impossible de contacter les serveurs PayPal. Vérifiez votre connexion Internet.");
        setLoading(false);
      };
      document.body.appendChild(script);
    } else {
      if ((window as any).paypal) {
        renderButtons();
      } else {
        script.onload = () => renderButtons();
      }
    }
  }, [clientId, planId]);

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 font-mono">
        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3 text-emerald-500" />
          <span>PayPal Live Gateway</span>
        </span>
        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
          Chiffrement TLS 1.3
        </span>
      </div>

      {loading && (
        <div className="py-4 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
          <RefreshCw className="w-4 h-4 animate-spin text-[#0070BA]" />
          <span>{language === "fr" ? "Chargement sécurisé PayPal..." : "Connecting to PayPal..."}</span>
        </div>
      )}

      {sdkError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{sdkError}</span>
        </div>
      )}

      {/* Conteneur pour les boutons natifs PayPal Smart Buttons (PayPal + CB / Visa / Mastercard) */}
      <div 
        ref={buttonContainerRef} 
        className={`w-full min-h-[44px] transition-opacity duration-200 ${loading ? "opacity-0" : "opacity-100"}`} 
      />
    </div>
  );
}
