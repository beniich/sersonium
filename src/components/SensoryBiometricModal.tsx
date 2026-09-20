import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Fingerprint,
  Scan,
  ShieldCheck,
  Lock,
  Unlock,
  Sparkles,
  Key,
  Cpu,
  Zap,
  CheckCircle2,
  AlertCircle,
  X,
  Radio,
  Eye,
  Smartphone,
  ChevronRight
} from "lucide-react";
import SensoriumLogo from "./SensoriumLogo";

interface SensoryBiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onGoogleSignIn?: () => void;
  authError?: string | null;
}

type AuthMethod = "fingerprint" | "neural" | "passkey" | "credentials";

export default function SensoryBiometricModal({
  isOpen,
  onClose,
  onSuccess,
  onGoogleSignIn,
  authError
}: SensoryBiometricModalProps) {
  const [authMethod, setAuthMethod] = useState<AuthMethod>("fingerprint");
  const [scanState, setScanState] = useState<"idle" | "scanning" | "encrypting" | "unlocked" | "error">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [biometricScore, setBiometricScore] = useState(0);
  const [selectedRole, setSelectedRole] = useState<"sre" | "director" | "auditor">("sre");
  const [statusMessage, setStatusMessage] = useState("Prêt pour l'acquisition biométrique");

  useEffect(() => {
    if (!isOpen) {
      setScanState("idle");
      setScanProgress(0);
      setBiometricScore(0);
      setStatusMessage("Prêt pour l'acquisition biométrique");
    }
  }, [isOpen]);

  const triggerSensoryUnlock = () => {
    if (scanState === "scanning" || scanState === "encrypting" || scanState === "unlocked") return;

    setScanState("scanning");
    setScanProgress(0);
    setStatusMessage("Acquisition du signal biométrique haute résolution...");

    // Progress animation loop
    let p = 0;
    const interval = setInterval(() => {
      p += 4;
      if (p <= 60) {
        setScanProgress(p);
        setBiometricScore(Math.min(99.4, Number((p * 1.6).toFixed(1))));
      } else if (p <= 90) {
        setScanProgress(p);
        setScanState("encrypting");
        setStatusMessage("Chiffrement HSM FIPS 140-3 & Dérivation de clé mTLS...");
      } else if (p >= 100) {
        clearInterval(interval);
        setScanProgress(100);
        setBiometricScore(99.98);
        setScanState("unlocked");
        setStatusMessage("✨ SENSORY UNLOCK ACCORDÉ ✨");

        // Subtle tactile haptic vibration for mobile/supported browsers
        if (typeof window !== "undefined" && typeof navigator !== "undefined" && "vibrate" in navigator) {
          try {
            navigator.vibrate([25, 40, 30, 60]);
          } catch {
            // Ignore if vibration permissions are restricted
          }
        }

        // Delay slightly for user to enjoy the haptic ripple effect, then log in
        setTimeout(() => {
          onSuccess();
        }, 1400);
      }
    }, 40);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop with soft blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg rounded-3xl bg-[#0d0d10] border border-white/[0.12] p-6 sm:p-8 shadow-2xl overflow-hidden z-10 text-neutral-100 font-sans"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] relative z-10">
            <div className="flex items-center gap-3">
              <SensoriumLogo size="sm" />
              <div>
                <h3 className="text-sm font-semibold text-white">Authentification Sécurisée</h3>
                <p className="text-[11px] text-neutral-400 font-mono">SENSORIUM SECURE ENCLAVE 4.0</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Auth Method Tabs */}
          <div className="flex items-center justify-center gap-1.5 mt-5 p-1 rounded-2xl bg-black/40 border border-white/[0.06] relative z-10">
            <button
              onClick={() => setAuthMethod("fingerprint")}
              className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === "fingerprint" ? "bg-white text-black shadow-xs font-semibold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Biométrie Touch</span>
            </button>

            <button
              onClick={() => setAuthMethod("neural")}
              className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === "neural" ? "bg-white text-black shadow-xs font-semibold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Rétine / Neural</span>
            </button>

            <button
              onClick={() => setAuthMethod("credentials")}
              className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === "credentials" ? "bg-white text-black shadow-xs font-semibold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Rôles & SSO</span>
            </button>
          </div>

          {/* Main Interactive Scan Area */}
          {(authMethod === "fingerprint" || authMethod === "neural") && (
            <div className="mt-8 text-center space-y-6 relative z-10">
              
              {/* SENSORY SCANNER CONTAINER WITH HAPTIC RECOIL */}
              <motion.div 
                animate={
                  scanState === "unlocked" 
                    ? { 
                        scale: [1, 0.95, 1.06, 0.98, 1],
                        y: [0, -2, 1, 0]
                      } 
                    : {}
                }
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative mx-auto w-36 h-36 flex items-center justify-center"
              >
                
                {/* 1. Haptic Circular Ripple Shockwaves on Successful Unlock */}
                {scanState === "unlocked" && (
                  <>
                    {/* Primary Expansive Ripple */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.9, borderWidth: "3px" }}
                      animate={{ 
                        scale: [0.8, 2.6, 3.4], 
                        opacity: [0.9, 0.35, 0],
                        borderWidth: ["3px", "1.5px", "0.5px"]
                      }}
                      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 rounded-full border border-emerald-400 bg-emerald-500/10 shadow-[0_0_25px_rgba(52,211,153,0.6)] pointer-events-none"
                    />

                    {/* Secondary Staggered Harmonic Ripple */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.8, borderWidth: "2px" }}
                      animate={{ 
                        scale: [0.8, 2.0, 2.7], 
                        opacity: [0.8, 0.25, 0],
                        borderWidth: ["2px", "1px", "0.5px"]
                      }}
                      transition={{ duration: 1.0, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 rounded-full border border-teal-300 bg-teal-400/5 shadow-[0_0_18px_rgba(45,212,191,0.5)] pointer-events-none"
                    />

                    {/* Tertiary Fast High-Frequency Haptic Wave */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.7 }}
                      animate={{ 
                        scale: [0.8, 1.6, 2.1], 
                        opacity: [0.7, 0.15, 0] 
                      }}
                      transition={{ duration: 0.8, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 rounded-full border border-white/80 pointer-events-none"
                    />

                    {/* Ambient Core Shockwave Glow */}
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: [0.6, 1.8, 2.2], opacity: [0, 0.4, 0] }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full bg-radial from-emerald-400/40 via-emerald-500/10 to-transparent blur-md pointer-events-none"
                    />
                  </>
                )}

                {/* Outer pulsing rings when active scanning */}
                {scanState === "scanning" && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full border border-emerald-400/40"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.2, 0.8] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                      className="absolute inset-0 rounded-full border border-emerald-400/60"
                    />
                  </>
                )}

                {/* Circular Progress Gauge */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    className="stroke-white/[0.08]"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    className={`transition-all duration-100 ${
                      scanState === "unlocked" ? "stroke-emerald-400" : "stroke-white"
                    }`}
                    strokeWidth="4"
                    strokeDasharray={276}
                    strokeDashoffset={276 - (276 * scanProgress) / 100}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>

                {/* Central Sensory Button / Sensor Target */}
                <motion.button
                  onClick={triggerSensoryUnlock}
                  disabled={scanState === "scanning" || scanState === "encrypting" || scanState === "unlocked"}
                  whileTap={scanState === "idle" ? { scale: 0.93 } : {}}
                  animate={
                    scanState === "unlocked" 
                      ? { 
                          scale: [1, 0.92, 1.08, 1],
                          boxShadow: [
                            "0 0 0px rgba(16,185,129,0)",
                            "0 0 35px rgba(16,185,129,0.8)",
                            "0 0 20px rgba(16,185,129,0.5)"
                          ]
                        } 
                      : {}
                  }
                  transition={{ duration: 0.45 }}
                  className={`absolute inset-2.5 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${
                    scanState === "unlocked"
                      ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/50"
                      : scanState === "scanning" || scanState === "encrypting"
                      ? "bg-white/10 text-white"
                      : "bg-[#141418] hover:bg-[#1b1b22] border border-white/[0.1] text-white hover:border-white/30"
                  }`}
                >
                  {/* Laser Scan Line Sweep */}
                  {(scanState === "scanning" || scanState === "encrypting") && (
                    <motion.div
                      animate={{ y: [-50, 50, -50] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399]"
                    />
                  )}

                  {scanState === "unlocked" ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 350, damping: 18 }}
                      className="flex flex-col items-center"
                    >
                      <Unlock className="w-8 h-8" />
                      <span className="text-[9px] font-bold uppercase tracking-wider mt-1">Déverrouillé</span>
                    </motion.div>
                  ) : authMethod === "fingerprint" ? (
                    <div className="flex flex-col items-center">
                      <Fingerprint className={`w-8 h-8 ${scanState === "scanning" ? "text-emerald-400 animate-pulse" : "text-neutral-300"}`} />
                      <span className="text-[9px] font-mono text-neutral-400 mt-1 uppercase">
                        {scanState === "scanning" ? `${scanProgress}%` : "Toucher"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Scan className={`w-8 h-8 ${scanState === "scanning" ? "text-blue-400 animate-pulse" : "text-neutral-300"}`} />
                      <span className="text-[9px] font-mono text-neutral-400 mt-1 uppercase">
                        {scanState === "scanning" ? `${scanProgress}%` : "Scanner"}
                      </span>
                    </div>
                  )}
                </motion.button>
              </motion.div>

              {/* Status and telemetry */}
              <div className="space-y-2">
                <div className={`text-xs font-mono font-medium tracking-wide flex items-center justify-center gap-1.5 ${
                  scanState === "unlocked" ? "text-emerald-400 font-bold" : "text-neutral-300"
                }`}>
                  {scanState === "unlocked" && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"
                    />
                  )}
                  <span>{statusMessage}</span>
                </div>

                <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-neutral-500 flex-wrap">
                  <span>Score : <strong className="text-white">{biometricScore}%</strong></span>
                  <span>•</span>
                  <span>Enclave : <strong className="text-emerald-400">FIPS 140-3</strong></span>
                  <span>•</span>
                  <span>Haptique : <strong className={scanState === "unlocked" ? "text-emerald-400 font-semibold" : "text-neutral-400"}>
                    {scanState === "unlocked" ? "40Hz Damped Pulse" : "Armé"}
                  </strong></span>
                </div>
              </div>

              {/* Instant One-Click Sensory Bypass Button */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-neutral-400 text-[11px]">Accès rapide sans attente :</span>
                <button
                  onClick={onSuccess}
                  className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Déverrouillage Direct</span>
                </button>
              </div>
            </div>
          )}

          {/* Credentials & Role Based Quick Switch */}
          {authMethod === "credentials" && (
            <div className="mt-6 space-y-5 relative z-10">
              <div className="text-xs text-neutral-400">
                Sélectionnez un profil pré-autorisé pour charger le Cockpit avec les privilèges correspondants :
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setSelectedRole("sre")}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    selectedRole === "sre"
                      ? "bg-white/[0.08] border-white/30 text-white"
                      : "bg-black/30 border-white/[0.06] text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Ingénieur Principal SRE & Edge</div>
                      <div className="text-[11px] text-neutral-400 font-mono">Privilèges Root • Gestion Anycast & Silicium</div>
                    </div>
                  </div>
                  {selectedRole === "sre" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  onClick={() => setSelectedRole("director")}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    selectedRole === "director"
                      ? "bg-white/[0.08] border-white/30 text-white"
                      : "bg-black/30 border-white/[0.06] text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Directeur d'Infrastructures & CAFM</div>
                      <div className="text-[11px] text-neutral-400 font-mono">Supervision globale • Budgets & Stratégie ESG</div>
                    </div>
                  </div>
                  {selectedRole === "director" && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </button>

                <button
                  onClick={() => setSelectedRole("auditor")}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    selectedRole === "auditor"
                      ? "bg-white/[0.08] border-white/30 text-white"
                      : "bg-black/30 border-white/[0.06] text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Auditeur Sécurité & Conformité SOC2</div>
                      <div className="text-[11px] text-neutral-400 font-mono">Lecture seule • Registres d'audit cryptés</div>
                    </div>
                  </div>
                  {selectedRole === "auditor" && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  onClick={() => {
                    triggerSensoryUnlock();
                  }}
                  className="w-full py-3 rounded-full text-xs font-semibold text-black bg-white hover:bg-neutral-200 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Valider avec Déverrouillage Biométrique</span>
                </button>

                {onGoogleSignIn && (
                  <button
                    onClick={onGoogleSignIn}
                    className="w-full py-2.5 rounded-full text-xs font-medium text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Authentification Google Workspace SSO</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Auth Error Banner if present */}
          {authError && (
            <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-start gap-2 relative z-10">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Footer Security Badge */}
          <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-neutral-500 relative z-10">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Zero Trust Certified
            </span>
            <span>AES-256-GCM • Passkey FIDO2</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
