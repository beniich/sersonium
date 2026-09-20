import React, { useState, useEffect } from "react";
import { GlobalState, CAFMWorkOrder } from "../types";
import { 
  Factory, AlertTriangle, CheckCircle2, Wrench, Activity, 
  Play, RefreshCw, Cpu, Zap, Shield, Thermometer, Clock, 
  Settings, ArrowUpRight, BarChart3, Plus
} from "lucide-react";
import { useLanguage } from "../App";
import { logAuditEvent } from "../hooks/useGlobalState";
import { db } from "../firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";

interface MesProductionMonitorProps {
  state: GlobalState;
  isDark: boolean;
}

export interface ManufacturingLine {
  id: string;
  name: string;
  code: string;
  supervisor: string;
  oee: number; // Taux de Rendement Synthétique (TRS) %
  availability: number; // %
  performance: number; // %
  quality: number; // %
  status: "Optimal" | "Warning" | "Critical" | "Maintenance";
  temperatureC: number;
  vibrationMmS: number;
  defectRatePpm: number;
  currentBatch: string;
  unitsProduced: number;
  targetUnits: number;
  lastMaintenance: string;
}

export default function MesProductionMonitor({ state, isDark }: MesProductionMonitorProps) {
  const { language } = useLanguage();

  const [lines, setLines] = useState<ManufacturingLine[]>([
    {
      id: "line-x1",
      name: language === "fr" ? "Ligne Silicon X1 (Processeurs & NPU)" : "Silicon X1 Line (Processors & NPU)",
      code: "MES-LINE-01",
      supervisor: "Jean-Marc SRE",
      oee: 92.4,
      availability: 96.5,
      performance: 97.0,
      quality: 98.8,
      status: "Optimal",
      temperatureC: 68.4,
      vibrationMmS: 1.2,
      defectRatePpm: 180,
      currentBatch: "BATCH-X1-9924",
      unitsProduced: 14250,
      targetUnits: 15000,
      lastMaintenance: "2026-09-10"
    },
    {
      id: "line-smt",
      name: language === "fr" ? "Ligne CMS / SMT (Cartes Mères)" : "SMT Pick & Place Line (Motherboards)",
      code: "MES-LINE-02",
      supervisor: "Chloé Martin",
      oee: 88.2,
      availability: 91.0,
      performance: 94.5,
      quality: 97.2,
      status: "Optimal",
      temperatureC: 45.1,
      vibrationMmS: 2.1,
      defectRatePpm: 320,
      currentBatch: "BATCH-SMT-4412",
      unitsProduced: 28900,
      targetUnits: 32000,
      lastMaintenance: "2026-09-12"
    },
    {
      id: "line-inject",
      name: language === "fr" ? "Ligne Injection Plastique (Boîtiers)" : "Plastic Injection Line (Chassis)",
      code: "MES-LINE-03",
      supervisor: "Marc V. (CAFM)",
      oee: 74.5,
      availability: 82.0,
      performance: 89.0,
      quality: 93.0,
      status: "Warning",
      temperatureC: 89.7,
      vibrationMmS: 4.8,
      defectRatePpm: 1250,
      currentBatch: "BATCH-INJ-8819",
      unitsProduced: 8400,
      targetUnits: 11000,
      lastMaintenance: "2026-08-28"
    },
    {
      id: "line-qa",
      name: language === "fr" ? "Ligne Enclave FIPS & Test QA Final" : "FIPS Enclave & Final QA Test Line",
      code: "MES-LINE-04",
      supervisor: "SecOps Guardian",
      oee: 98.1,
      availability: 99.5,
      performance: 99.0,
      quality: 99.9,
      status: "Optimal",
      temperatureC: 38.2,
      vibrationMmS: 0.4,
      defectRatePpm: 12,
      currentBatch: "BATCH-FIPS-1092",
      unitsProduced: 4920,
      targetUnits: 5000,
      lastMaintenance: "2026-09-15"
    }
  ]);

  const [selectedLineId, setSelectedLineId] = useState<string>("line-x1");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const selectedLine = lines.find(l => l.id === selectedLineId) || lines[0];

  // Simulate Anomaly & Auto-Trigger Maintenance Intervention Work Order
  const handleSimulateAnomaly = async (lineId: string) => {
    const target = lines.find(l => l.id === lineId);
    if (!target) return;

    const isFrench = language === "fr";
    const updatedStatus = "Critical";
    const anomalyTemp = 96.5;
    const anomalyVibration = 7.8;
    const anomalyOee = 52.3;

    setLines(prev => prev.map(l => l.id === lineId ? {
      ...l,
      status: updatedStatus,
      temperatureC: anomalyTemp,
      vibrationMmS: anomalyVibration,
      oee: anomalyOee,
      defectRatePpm: 3400
    } : l));

    // Automatically trigger maintenance work order in Firestore or state
    try {
      const workOrderPayload = {
        nodeId: lineId,
        title: isFrench ? `ANOMALIE CRITIQUE MES : Surchauffe & Vibration (${target.name})` : `CRITICAL MES ANOMALY: Overheating & Vibration (${target.name})`,
        priority: "p1",
        status: "open",
        assignedTo: target.supervisor || "CAFM Maintenance Team",
        createdAt: new Date().toISOString(),
        aiAnalysis: isFrench 
          ? `Détection automatique MES : Température machine (${anomalyTemp}°C) et vibration (${anomalyVibration} mm/s) au-delà des seuils critiques. Risque d'arrêt de ligne imminent. Intervention corrective immédiate déclenchée.`
          : `Automated MES detection: Machine temperature (${anomalyTemp}°C) and vibration (${anomalyVibration} mm/s) exceeded critical thresholds. Imminent line downtime risk. Immediate corrective intervention dispatched.`
      };

      const colRef = collection(db, "workOrders");
      await addDoc(colRef, workOrderPayload);
      await logAuditEvent("MES_ANOMALY_TRIGGERED", `Critical anomaly detected on ${target.name}. Maintenance intervention work order dispatched.`);
      
      triggerToast(
        isFrench 
          ? `🚨 Anomalie détectée sur ${target.name} ! Ordre de mission de maintenance prioritaire généré.` 
          : `🚨 Anomaly detected on ${target.name}! High-priority maintenance work order generated.`
      );
    } catch (err) {
      console.error("Failed to dispatch MES maintenance work order", err);
      triggerToast(isFrench ? "Erreur lors du déclenchement de l'intervention." : "Error dispatching intervention.");
    }
  };

  const handleResolveAnomaly = async (lineId: string) => {
    const target = lines.find(l => l.id === lineId);
    if (!target) return;

    setLines(prev => prev.map(l => l.id === lineId ? {
      ...l,
      status: "Optimal",
      temperatureC: 42.1,
      vibrationMmS: 0.8,
      oee: 94.5,
      defectRatePpm: 45
    } : l));

    await logAuditEvent("MES_LINE_RESOLVED", `Line ${target.name} restored to optimal production status after maintenance.`);
    triggerToast(language === "fr" ? `✅ Ligne ${target.name} réparée et rétablie en mode Optimal.` : `✅ Line ${target.name} repaired and restored to Optimal status.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950/60 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider border border-orange-500/30">
                MES • Industrial Execution & Telemetry
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider border border-emerald-500/30">
                Real-Time Anomaly Dispatch
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {language === "fr" ? "Supervision MES & Déclenchement Automatique de Maintenance" : "MES Supervision & Automated Maintenance Dispatch"}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-1">
              {language === "fr"
                ? "Collecte en temps réel des flux de production (TRS, capteurs IoT, cadences) pour dispatcher instantanément des ordres de mission correctifs dès qu'une anomalie thermique ou vibratoire est signalée."
                : "Real-time production data feeds (OEE, IoT telemetry, takt times) to instantly dispatch corrective work orders as soon as a thermal or vibrational anomaly is flagged."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSimulateAnomaly(selectedLine.id)}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              {language === "fr" ? "Simuler Anomalie Ligne" : "Simulate Line Anomaly"}
            </button>
            <button
              onClick={() => handleResolveAnomaly(selectedLine.id)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              {language === "fr" ? "Rétablir / Résoudre" : "Resolve & Reset"}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-4 rounded-xl bg-orange-500 text-white text-xs font-semibold shadow-lg flex items-center justify-between animate-fadeIn">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-white hover:text-slate-200 ml-4 font-bold">×</button>
        </div>
      )}

      {/* Manufacturing Lines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {lines.map((line) => {
          const isSelected = line.id === selectedLineId;
          const isCritical = line.status === "Critical" || line.status === "Warning";
          return (
            <div
              key={line.id}
              onClick={() => setSelectedLineId(line.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected 
                  ? "border-orange-500 bg-orange-500/5 dark:bg-orange-950/20 shadow-md ring-1 ring-orange-500/30" 
                  : "border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-slate-300 dark:hover:border-neutral-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    line.status === "Optimal" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                    line.status === "Warning" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                    "bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse"
                  }`}>
                    <Factory className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{line.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{line.code}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  line.status === "Optimal" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                  line.status === "Warning" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20" :
                  "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20"
                }`}>
                  {line.status}
                </span>
              </div>

              {/* OEE / TRS Gauge */}
              <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-neutral-400 font-medium">TRS (OEE)</span>
                  <span className={`font-mono font-bold ${line.oee < 80 ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
                    {line.oee}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      line.oee < 80 ? "bg-red-500" : line.oee < 90 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${line.oee}%` }}
                  />
                </div>
              </div>

              {/* Quick telemetry stats */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Température</span>
                  <span className={`font-bold ${line.temperatureC > 85 ? "text-red-500" : "text-slate-700 dark:text-neutral-300"}`}>
                    {line.temperatureC}°C
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Vibration</span>
                  <span className={`font-bold ${line.vibrationMmS > 4 ? "text-red-500" : "text-slate-700 dark:text-neutral-300"}`}>
                    {line.vibrationMmS} mm/s
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Selected Line View */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedLine.name}</h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300">
                {selectedLine.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              {language === "fr" ? `Responsable atelier : ${selectedLine.supervisor} • Lot en cours : ${selectedLine.currentBatch}` : `Supervisor: ${selectedLine.supervisor} • Current Batch: ${selectedLine.currentBatch}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 dark:text-neutral-400">
              {language === "fr" ? "Production :" : "Production:"} <strong className="text-slate-900 dark:text-white">{selectedLine.unitsProduced.toLocaleString()} / {selectedLine.targetUnits.toLocaleString()} units</strong>
            </span>
          </div>
        </div>

        {/* 4 Pillars of OEE (Availability, Performance, Quality, TRS) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700/50 space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Disponibilité (Availability)</div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">{selectedLine.availability}%</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Temps de marche réel / requis</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700/50 space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Performance (Takt Rate)</div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">{selectedLine.performance}%</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Cadence nominale / réelle</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700/50 space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Qualité (First Pass Yield)</div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">{selectedLine.quality}%</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Pièces conformes / produites</div>
          </div>
          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 space-y-1">
            <div className="text-xs font-semibold text-orange-600 dark:text-orange-400">TRS Global (OEE)</div>
            <div className="text-xl font-bold font-mono text-orange-700 dark:text-orange-300">{selectedLine.oee}%</div>
            <div className="text-[10px] text-orange-600 dark:text-orange-400 font-mono">Dispo × Perf × Qualité</div>
          </div>
        </div>

        {/* Real-time Sensor Probes & Automated Work Order Trigger Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-orange-500" />
                {language === "fr" ? "Capteurs IoT & Enveloppe Thermique" : "IoT Sensors & Thermal Envelope"}
              </h4>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Live 100ms</span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-neutral-800">
                <span className="text-slate-500">Température Broche / Moteur</span>
                <span className={`font-bold ${selectedLine.temperatureC > 85 ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
                  {selectedLine.temperatureC}°C (Max: 85°C)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-neutral-800">
                <span className="text-slate-500">Vibration Axe X/Y</span>
                <span className={`font-bold ${selectedLine.vibrationMmS > 4 ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
                  {selectedLine.vibrationMmS} mm/s (Seuil: 4.0)
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Taux de Défaut (PPM)</span>
                <span className={`font-bold ${selectedLine.defectRatePpm > 1000 ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
                  {selectedLine.defectRatePpm} ppm
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-orange-500" />
                {language === "fr" ? "Automatisation Maintenance & GMAO (CAFM)" : "Maintenance Automation & CMMS (CAFM)"}
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                Actif / Synchro Temps Réel
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              {language === "fr"
                ? "Le système MES analyse en continu les signaux IoT. Dès qu'un seuil critique est dépassé, un ordre de intervention préventive/corrective est automatiquement émis vers l'équipe CAFM sur le canal de permanence."
                : "The MES system continuously evaluates IoT signals. As soon as a critical threshold is breached, a corrective work order is automatically dispatched to the CAFM team on-call channel."}
            </p>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">Dernière révision : {selectedLine.lastMaintenance}</span>
              <button
                onClick={() => handleSimulateAnomaly(selectedLine.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                {language === "fr" ? "Déclencher Intervention Immédiate" : "Dispatch Immediate Intervention"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
