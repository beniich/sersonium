import React, { useState } from "react";
import { GlobalState } from "../types";
import { 
  Calendar, Clock, Wrench, AlertTriangle, CheckCircle2, 
  Factory, Shield, User, Plus, Trash2, Edit3, Sparkles 
} from "lucide-react";
import { useLanguage } from "../App";
import { logAuditEvent } from "../hooks/useGlobalState";
import { db } from "../firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

interface MesMaintenanceSchedulerProps {
  state: GlobalState;
  isDark: boolean;
}

export interface ScheduledIntervention {
  id: string;
  lineName: string;
  lineCode: string;
  anomalyReason: string;
  scheduledDate: string;
  shift: string;
  technician: string;
  priority: "P1 - Urgentes" | "P2 - Élevée" | "P3 - Préventive";
  status: "Planifié" | "En cours" | "Terminé";
  estimatedHours: number;
}

export default function MesMaintenanceScheduler({ state, isDark }: MesMaintenanceSchedulerProps) {
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const [interventions, setInterventions] = useState<ScheduledIntervention[]>([
    {
      id: "int-01",
      lineName: "Ligne Injection Plastique (Boîtiers)",
      lineCode: "MES-LINE-03",
      anomalyReason: "Surchauffe broche (89.7°C) & Vibration excessive (4.8 mm/s)",
      scheduledDate: "2026-09-20T08:00",
      shift: "Matin (06h - 14h)",
      technician: "Marc V. (CAFM SRE)",
      priority: "P1 - Urgentes",
      status: "Planifié",
      estimatedHours: 3.5
    },
    {
      id: "int-02",
      lineName: "Ligne CMS / SMT (Cartes Mères)",
      lineCode: "MES-LINE-02",
      anomalyReason: "Maintenance préventive bimensuelle têtes de pose Pick & Place",
      scheduledDate: "2026-09-22T22:00",
      shift: "Nuit (22h - 06h)",
      technician: "Chloé Martin",
      priority: "P3 - Préventive",
      status: "Planifié",
      estimatedHours: 4.0
    },
    {
      id: "int-03",
      lineName: "Ligne Silicon X1 (Processeurs & NPU)",
      lineCode: "MES-LINE-01",
      anomalyReason: "Calibration optique et étalonnage des sondes NPU",
      scheduledDate: "2026-09-25T14:00",
      shift: "Après-midi (14h - 22h)",
      technician: "Jean-Marc SRE",
      priority: "P2 - Élevée",
      status: "Planifié",
      estimatedHours: 2.0
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLineName, setNewLineName] = useState("Ligne Injection Plastique (Boîtiers)");
  const [newAnomaly, setNewAnomaly] = useState("Vibration anormale roulement tambour");
  const [newDate, setNewDate] = useState("2026-09-21T10:00");
  const [newTechnician, setNewTechnician] = useState("Marc V. (CAFM SRE)");
  const [newPriority, setNewPriority] = useState<"P1 - Urgentes" | "P2 - Élevée" | "P3 - Préventive">("P2 - Élevée");
  const [newHours, setNewHours] = useState(3);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    const newInt: ScheduledIntervention = {
      id: `int-${Date.now()}`,
      lineName: newLineName,
      lineCode: newLineName.includes("Injection") ? "MES-LINE-03" : newLineName.includes("CMS") ? "MES-LINE-02" : "MES-LINE-01",
      anomalyReason: newAnomaly,
      scheduledDate: newDate,
      shift: "Matin (06h - 14h)",
      technician: newTechnician,
      priority: newPriority,
      status: "Planifié",
      estimatedHours: Number(newHours) || 2.0
    };

    setInterventions(prev => [newInt, ...prev]);
    await logAuditEvent("MES_MAINTENANCE_SCHEDULED", `Scheduled maintenance intervention for ${newLineName} on ${newDate} (${newPriority})`);
    triggerToast(language === "fr" ? "📅 Intervention de maintenance planifiée avec succès !" : "📅 Maintenance intervention scheduled successfully!");
    setIsModalOpen(false);
  };

  const handleDeleteIntervention = async (id: string, name: string) => {
    setInterventions(prev => prev.filter(i => i.id !== id));
    await logAuditEvent("MES_MAINTENANCE_CANCELLED", `Cancelled scheduled intervention for ${name}`);
    triggerToast(language === "fr" ? "Intervention annulée." : "Intervention cancelled.");
  };

  const handleToggleStatus = async (id: string) => {
    setInterventions(prev => prev.map(i => {
      if (i.id === id) {
        const nextStatus = i.status === "Planifié" ? "En cours" : i.status === "En cours" ? "Terminé" : "Planifié";
        return { ...i, status: nextStatus };
      }
      return i;
    }));
    triggerToast(language === "fr" ? "Statut de l'intervention mis à jour." : "Intervention status updated.");
  };

  // Generate September 2026 days for monthly calendar grid (30 days)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    return `2026-09-${formattedDay}`;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden border border-indigo-900/40">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider border border-indigo-500/30">
                CAFM • MES Predictive Maintenance Planning
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {language === "fr" ? "Planification des Interventions Prévisionnelles" : "Predictive Maintenance Intervention Scheduler"}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-1">
              {language === "fr"
                ? "Définissez et planifiez les dates prévisionnelles d'intervention sur les lignes de fabrication en fonction des alertes MES, des dérives de température et des cycles d'usure des équipements."
                : "Define and schedule provisional intervention dates on manufacturing lines based on MES alerts, temperature drifts, and equipment wear cycles."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700 flex items-center">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "list" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                {language === "fr" ? "Liste" : "List"}
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "calendar" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                {language === "fr" ? "Calendrier Mensuel" : "Monthly Grid"}
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              {language === "fr" ? "Planifier" : "Schedule"}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-lg flex items-center justify-between animate-fadeIn">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-white hover:text-slate-200 ml-4 font-bold">×</button>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-neutral-400">Interventions Planifiées</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {interventions.filter(i => i.status === "Planifié").length}
          </div>
          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">Basées sur alertes MES & seuils thermiques</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-neutral-400">Urgences P1 en Cours</div>
          <div className="text-2xl font-bold font-mono text-red-500">
            {interventions.filter(i => i.priority.startsWith("P1") && i.status !== "Terminé").length}
          </div>
          <div className="text-[10px] text-red-500 font-mono">Risque d'arrêt de ligne critique</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-neutral-400">Charge de Maintenance Estimée</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {interventions.reduce((acc, curr) => acc + curr.estimatedHours, 0)} h
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Heures technicien requises</div>
        </div>
      </div>

      {/* Conditional View: List vs Monthly Calendar Grid */}
      {viewMode === "list" ? (
        <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              {language === "fr" ? "Calendrier Prévisionnel des Interventions (Mode Liste)" : "Provisional Maintenance Calendar (List View)"}
            </h3>
            <span className="text-xs font-mono text-slate-400">{interventions.length} interventions enregistrées</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-neutral-800/60 border-b border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Ligne MES</th>
                  <th className="px-4 py-3">Motif & Alerte MES</th>
                  <th className="px-4 py-3">Date Prévisionnelle</th>
                  <th className="px-4 py-3">Technicien / Équipe</th>
                  <th className="px-4 py-3">Priorité</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 text-slate-800 dark:text-neutral-200">
                {interventions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/35 transition-colors">
                    <td className="px-4 py-3 font-semibold">
                      <div>{item.lineName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{item.lineCode}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="line-clamp-2 text-slate-700 dark:text-neutral-300">{item.anomalyReason}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                      {item.scheduledDate.replace("T", " @ ")}
                      <div className="text-[10px] font-sans text-slate-400">{item.shift} • {item.estimatedHours}h</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {item.technician}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        item.priority.startsWith("P1") ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25" :
                        item.priority.startsWith("P2") ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25" :
                        "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25"
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(item.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          item.status === "Terminé" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" :
                          item.status === "En cours" ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 animate-pulse" :
                          "bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300"
                        }`}
                      >
                        {item.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteIntervention(item.id, item.lineName)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Supprimer / Annuler"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Monthly Schedule Grid View */
        <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                {language === "fr" ? "Grille Calendrier Mensuel — Septembre 2026" : "Monthly Schedule Grid — September 2026"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                {language === "fr" ? "Visualisation par date des interventions planifiées suite aux alertes MES" : "Date-based visualization of maintenance interventions triggered by MES alerts"}
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold">
              30 Jours • Sept 2026
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {daysInMonth.map((dateStr) => {
              const matchingInts = interventions.filter(i => i.scheduledDate.startsWith(dateStr));
              const hasEvents = matchingInts.length > 0;
              const isToday = dateStr === "2026-09-19";

              return (
                <div
                  key={dateStr}
                  className={`p-3 rounded-xl border flex flex-col justify-between min-h-[110px] transition-all ${
                    hasEvents 
                      ? "border-indigo-500/50 bg-indigo-500/5 dark:bg-indigo-950/20 shadow-xs" 
                      : isToday
                      ? "border-orange-500/50 bg-orange-500/5 dark:bg-orange-950/10"
                      : "border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${isToday ? "text-orange-500" : "text-slate-700 dark:text-neutral-300"}`}>
                      {dateStr.split("-")[2]} Sept
                    </span>
                    {hasEvents && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    )}
                  </div>

                  <div className="space-y-1.5 my-2">
                    {hasEvents ? (
                      matchingInts.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => handleToggleStatus(item.id)}
                          className={`p-1.5 rounded text-[10px] font-medium cursor-pointer transition-transform hover:scale-[1.02] ${
                            item.priority.startsWith("P1") 
                              ? "bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30" 
                              : "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30"
                          }`}
                          title={item.anomalyReason}
                        >
                          <div className="font-bold line-clamp-1">{item.lineName.split(" ")[1] || item.lineName}</div>
                          <div className="text-[9px] opacity-80">{item.scheduledDate.split("T")[1]} • {item.technician.split(" ")[0]}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] text-slate-400 dark:text-neutral-600 italic">Aucune intervention</div>
                    )}
                  </div>

                  <div className="text-[9px] font-mono text-slate-400 text-right">
                    {hasEvents ? `${matchingInts.length} évt` : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal for Scheduling New Intervention */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-neutral-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-500" />
                {language === "fr" ? "Planifier une Intervention MES" : "Schedule MES Intervention"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>

            <form onSubmit={handleCreateIntervention} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">Ligne de Fabrication (MES)</label>
                <select
                  value={newLineName}
                  onChange={e => setNewLineName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="Ligne Injection Plastique (Boîtiers)">Ligne Injection Plastique (MES-LINE-03)</option>
                  <option value="Ligne CMS / SMT (Cartes Mères)">Ligne CMS / SMT (MES-LINE-02)</option>
                  <option value="Ligne Silicon X1 (Processeurs & NPU)">Ligne Silicon X1 (MES-LINE-01)</option>
                  <option value="Ligne Enclave FIPS & Test QA Final">Ligne Enclave FIPS (MES-LINE-04)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">Motif / Alerte MES</label>
                <input
                  required
                  type="text"
                  value={newAnomaly}
                  onChange={e => setNewAnomaly(e.target.value)}
                  placeholder="Ex: Température broche 92°C ou vibration anormale"
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">Date & Heure</label>
                  <input
                    required
                    type="datetime-local"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">Durée Est. (Heures)</label>
                  <input
                    required
                    type="number"
                    step="0.5"
                    value={newHours}
                    onChange={e => setNewHours(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">Technicien / Équipe</label>
                  <input
                    required
                    type="text"
                    value={newTechnician}
                    onChange={e => setNewTechnician(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">Priorité</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="P1 - Urgentes">P1 - Urgentes</option>
                    <option value="P2 - Élevée">P2 - Élevée</option>
                    <option value="P3 - Préventive">P3 - Préventive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Enregistrer l'Intervention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
