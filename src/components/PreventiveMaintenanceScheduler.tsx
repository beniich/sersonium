import React, { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Plus,
  Filter,
  Layers,
  Settings,
  Zap,
  Snowflake,
  HardDrive,
  Network,
  Cpu,
  RefreshCw,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Wrench,
  Bot,
  Sparkles,
  ArrowUpRight,
  UserCheck,
  CheckSquare,
  Search,
  X,
  Radio
} from "lucide-react";
import { useLanguage } from "../App";
import { GlobalState, PreventiveSchedulePlan, CAFMWorkOrder, SparePart } from "../types";
import { logAuditEvent } from "../hooks/useGlobalState";

interface PreventiveMaintenanceSchedulerProps {
  state: GlobalState;
  isDark: boolean;
  onDispatchWorkOrder?: (wo: CAFMWorkOrder) => void;
}

const DEFAULT_PREVENTIVE_PLANS: PreventiveSchedulePlan[] = [
  {
    id: "plan-crac-quarterly",
    name: "Tournée Trimestrielle : Nettoyage Échangeurs & Filtres CRAC",
    assetCategory: "cooling",
    targetAssetTag: "ALL_CRAC_UNITS (CDG, FRA, LHR)",
    frequencyType: "calendar_quarterly",
    calendarIntervalDays: 90,
    counterIntervalHours: 2160,
    currentCounterHours: 2080,
    lastExecutedAt: new Date(Date.now() - 86400000 * 82).toISOString(),
    nextDueDate: new Date(Date.now() + 86400000 * 8).toISOString(),
    estimatedDurationMinutes: 120,
    assignedTeam: "Équipe CVC & Froid Industriel",
    priority: "p2",
    checklistTemplate: [
      { task: "Remplacement préventif des filtres à air HEPA H14", nominalRange: "ΔP < 150 Pa" },
      { task: "Vérification étanchéité circuit fluide frigorigène R410A", nominalRange: "Pression 22-26 bar" },
      { task: "Contrôle rotation et graissage roulements motoventilateur EC", nominalRange: "Vibration < 2.8 mm/s" },
      { task: "Test décharge condensats & sondes d'hygrométrie", nominalRange: "45% à 55% HR" }
    ],
    sparePartsPreReservation: [
      { partId: "part-1", quantity: 4 } // HEPA Filter
    ],
    active: true,
    autoDispatch: true
  },
  {
    id: "plan-ups-batteries",
    name: "Tournée Semestrielle : Impédance & Banc de Décharge Batteries UPS/ASI",
    assetCategory: "power",
    targetAssetTag: "UPS_INVERTERS_SERIES_93",
    frequencyType: "counter_hours",
    counterIntervalHours: 4000,
    currentCounterHours: 3950,
    calendarIntervalDays: 180,
    lastExecutedAt: new Date(Date.now() - 86400000 * 165).toISOString(),
    nextDueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    estimatedDurationMinutes: 180,
    assignedTeam: "Équipe Haute Tension & Courants Forts",
    priority: "p1",
    checklistTemplate: [
      { task: "Mesure résistance interne et tension flottante des blocs VRLA", nominalRange: "13.50V - 13.80V" },
      { task: "Test d'autonomie en décharge contrôlée sur banc de charge (15 min)", nominalRange: "> 100% SLA" },
      { task: "Inspection thermographique infrarouge des bornes et câblages", nominalRange: "T° max < 45°C" },
      { task: "Vérification basculement statique bypass sans coupure (0ms)", nominalRange: "0 ms interruption" }
    ],
    sparePartsPreReservation: [
      { partId: "part-6", quantity: 2 } // VRLA Battery
    ],
    active: true,
    autoDispatch: true
  },
  {
    id: "plan-storage-nvme-wear",
    name: "Contrôle Préventif SMART & Usure Flash NVMe (DWPD)",
    assetCategory: "storage",
    targetAssetTag: "ALL_NVME_ARRAYS",
    frequencyType: "smart_sensor_threshold",
    counterIntervalHours: 1500,
    currentCounterHours: 1480,
    lastExecutedAt: new Date(Date.now() - 86400000 * 40).toISOString(),
    nextDueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    estimatedDurationMinutes: 60,
    assignedTeam: "NOC Stockage & Systèmes",
    priority: "p2",
    checklistTemplate: [
      { task: "Extraction télémétrie SMART NVMe : Percentage Used & Bad Blocks", nominalRange: "Usure < 80%" },
      { task: "Vérification réplication RAID-Z3 et scrubbing de cohérence", nominalRange: "0 checksum error" },
      { task: "Dépoussiérage des grilles d'aération frontales des tiroirs disques", nominalRange: "Flux d'air nominal" }
    ],
    sparePartsPreReservation: [
      { partId: "part-3", quantity: 1 }
    ],
    active: true,
    autoDispatch: false
  },
  {
    id: "plan-optics-clean",
    name: "Audit Optique & Nettoyage Connecteurs Fibres MTP/LC (25G/100G)",
    assetCategory: "network",
    targetAssetTag: "CORE_LEAF_SPINE_SWITCHES",
    frequencyType: "calendar_yearly",
    calendarIntervalDays: 365,
    counterIntervalHours: 8760,
    currentCounterHours: 8200,
    lastExecutedAt: new Date(Date.now() - 86400000 * 320).toISOString(),
    nextDueDate: new Date(Date.now() + 86400000 * 25).toISOString(),
    estimatedDurationMinutes: 90,
    assignedTeam: "Réseau & Câblage Optique",
    priority: "p3",
    checklistTemplate: [
      { task: "Contrôle niveau d'atténuation optique Rx/Tx (DOM SFP28/QSFP)", nominalRange: "-3 dBm à -10 dBm" },
      { task: "Nettoyage par cartouche sèche des férule optiques MTP 12-fibres", nominalRange: "0 poussière microscope" },
      { task: "Test boucle de secours redondance LACP / EVPN-VXLAN", nominalRange: "Failover < 50ms" }
    ],
    sparePartsPreReservation: [
      { partId: "part-4", quantity: 4 }
    ],
    active: true,
    autoDispatch: true
  }
];

export default function PreventiveMaintenanceScheduler({
  state,
  isDark,
  onDispatchWorkOrder
}: PreventiveMaintenanceSchedulerProps) {
  const { language } = useLanguage();

  const [plans, setPlans] = useState<PreventiveSchedulePlan[]>(() => {
    return state.preventivePlans || DEFAULT_PREVENTIVE_PLANS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlan, setSelectedPlan] = useState<PreventiveSchedulePlan | null>(null);
  const [isSimulatingTour, setIsSimulatingTour] = useState(false);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);

  // New Plan State
  const [newPlan, setNewPlan] = useState<Partial<PreventiveSchedulePlan>>({
    name: "",
    assetCategory: "cooling",
    targetAssetTag: "",
    frequencyType: "calendar_monthly",
    calendarIntervalDays: 30,
    counterIntervalHours: 720,
    estimatedDurationMinutes: 90,
    assignedTeam: "Équipe Support Technique",
    priority: "p2",
    active: true,
    autoDispatch: true
  });

  const spareParts = state.spareParts || [];

  // Filter plans
  const filteredPlans = plans.filter(p => {
    if (selectedCategory !== "all" && p.assetCategory !== selectedCategory) return false;
    return true;
  });

  // Calculate statistics
  const activeCount = plans.filter(p => p.active).length;
  const imminentCount = plans.filter(p => {
    if (!p.counterIntervalHours || !p.currentCounterHours) return false;
    return (p.currentCounterHours / p.counterIntervalHours) >= 0.9;
  }).length;

  // Trigger immediate dispatch of a preventive tour
  const handleLaunchPreventiveTour = async (plan: PreventiveSchedulePlan) => {
    setIsSimulatingTour(true);

    const generatedWO: CAFMWorkOrder = {
      id: `WO-PRV-${Date.now().toString().slice(-4)}`,
      title: `[TOUR PRÉVENTIF AUTO] ${plan.name}`,
      priority: plan.priority,
      status: "open",
      assignedTo: plan.assignedTeam,
      nodeId: plan.targetAssetTag.slice(0, 16),
      createdAt: new Date().toISOString(),
      interventionType: plan.frequencyType.startsWith("counter") ? "preventive_counter" : "preventive_time",
      operatingHoursAtFailure: plan.currentCounterHours,
      checklist: plan.checklistTemplate.map((c, i) => ({
        id: `chk-${i + 1}`,
        task: c.task,
        done: false,
        nominalRange: c.nominalRange
      })),
      aiAnalysis: `Tournée préventive auto-déclenchée par l'algorithme GMAO selon la fréquence ${plan.frequencyType}. Respect strict des tolérances nominales constructeur.`
    };

    if (!state.workOrders) state.workOrders = [];
    state.workOrders.unshift(generatedWO);

    // Reset current counter
    setPlans(prev => prev.map(p => {
      if (p.id === plan.id) {
        return {
          ...p,
          lastExecutedAt: new Date().toISOString(),
          currentCounterHours: 0,
          nextDueDate: new Date(Date.now() + (p.calendarIntervalDays || 30) * 86400000).toISOString()
        };
      }
      return p;
    }));

    await logAuditEvent(
      "PREVENTIVE_TOUR_DISPATCHED",
      `Automated Preventive Tour launched for plan ${plan.name} -> Work Order ${generatedWO.id} created.`
    );

    setTimeout(() => {
      setIsSimulatingTour(false);
      if (onDispatchWorkOrder) {
        onDispatchWorkOrder(generatedWO);
      }
    }, 800);
  };

  const handleCreatePlan = async () => {
    if (!newPlan.name || !newPlan.targetAssetTag) return;

    const planToAdd: PreventiveSchedulePlan = {
      id: `plan-${Date.now().toString().slice(-5)}`,
      name: newPlan.name,
      assetCategory: newPlan.assetCategory as any || "cooling",
      targetAssetTag: newPlan.targetAssetTag,
      frequencyType: newPlan.frequencyType as any || "calendar_monthly",
      calendarIntervalDays: Number(newPlan.calendarIntervalDays) || 30,
      counterIntervalHours: Number(newPlan.counterIntervalHours) || 720,
      currentCounterHours: 0,
      lastExecutedAt: new Date().toISOString(),
      nextDueDate: new Date(Date.now() + (Number(newPlan.calendarIntervalDays) || 30) * 86400000).toISOString(),
      estimatedDurationMinutes: Number(newPlan.estimatedDurationMinutes) || 90,
      assignedTeam: newPlan.assignedTeam || "Équipe Terrain",
      priority: newPlan.priority as any || "p2",
      checklistTemplate: [
        { task: "Inspection visuelle et dépoussiérage général", nominalRange: "Conforme" },
        { task: "Relevé des températures d'entrée et sortie", nominalRange: "20°C - 24°C" },
        { task: "Contrôle des serrages électriques et des fixations", nominalRange: "Couple nominal" }
      ],
      active: true,
      autoDispatch: newPlan.autoDispatch ?? true
    };

    const updated = [planToAdd, ...plans];
    setPlans(updated);
    state.preventivePlans = updated;

    await logAuditEvent(
      "PREVENTIVE_PLAN_CREATED",
      `New preventive schedule rule created: ${planToAdd.name} (${planToAdd.frequencyType})`
    );

    setIsAddPlanModalOpen(false);
    setNewPlan({
      name: "",
      assetCategory: "cooling",
      targetAssetTag: "",
      frequencyType: "calendar_monthly",
      calendarIntervalDays: 30,
      counterIntervalHours: 720,
      estimatedDurationMinutes: 90,
      assignedTeam: "Équipe Support Technique",
      priority: "p2",
      active: true,
      autoDispatch: true
    });
  };

  const togglePlanActive = (planId: string) => {
    setPlans(prev => prev.map(p => {
      if (p.id === planId) {
        return { ...p, active: !p.active };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & KPI Summary */}
      <div className="p-6 rounded-3xl bg-slate-900/40 dark:bg-slate-900/60 border border-white/[0.08] backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Calendar className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold font-mono tracking-widest uppercase text-orange-400">
                GMAO PRÉVENTIVE 4.0
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AUTO-DISPATCH ENGINE ACTIF
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              Planificateur de Tournées & Maintenance Préventive
            </h2>
            <p className="text-xs text-neutral-400 max-w-2xl mt-1">
              Génération automatique des ordres de travail selon les compteurs horaires d'exploitation, les échéances calendaires et les seuils d'usure prédictifs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddPlanModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-950/40 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === "fr" ? "Créer une Règle Préventive" : "New Preventive Rule"}</span>
            </button>
          </div>
        </div>

        {/* 4 Overview Mini-Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[11px] font-medium text-neutral-400 block">{language === "fr" ? "Plans Actifs" : "Active Plans"}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-white">{activeCount}</span>
              <span className="text-xs text-neutral-400">/ {plans.length}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[11px] font-medium text-neutral-400 block">{language === "fr" ? "Tournées Imminentes (>90%)" : "Imminent Runs"}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-amber-400">{imminentCount}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Déclenchement proche</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[11px] font-medium text-neutral-400 block">{language === "fr" ? "Ratio Préventif / Curatif" : "Prev vs Corr Ratio"}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">82 %</span>
              <span className="text-[10px] text-emerald-400 font-mono">Standard AFNOR</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[11px] font-medium text-neutral-400 block">{language === "fr" ? "Auto-Génération d'OT" : "Auto Work Orders"}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-orange-400">Actif</span>
              <span className="text-[10px] text-neutral-400">Moteur 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "Toutes les Catégories", icon: Layers },
          { id: "cooling", label: "Climatisation & CVC", icon: Snowflake },
          { id: "power", label: "Énergie & Onduleurs", icon: Zap },
          { id: "storage", label: "Stockage & NVMe", icon: HardDrive },
          { id: "network", label: "Réseau & Optique", icon: Network }
        ].map(cat => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 border ${
                isSelected 
                  ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-950/30" 
                  : "bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white border-white/[0.06]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Plan Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPlans.map(plan => {
          const counterProgress = plan.counterIntervalHours && plan.currentCounterHours
            ? Math.min(100, Math.round((plan.currentCounterHours / plan.counterIntervalHours) * 100))
            : 0;

          const isNearDue = counterProgress >= 90;

          return (
            <div
              key={plan.id}
              className={`p-5 rounded-3xl border transition-all space-y-4 relative ${
                isNearDue 
                  ? "bg-amber-500/[0.04] border-amber-500/30 shadow-lg shadow-amber-950/20" 
                  : "bg-slate-900/30 border-white/[0.08] hover:border-white/[0.15]"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white/[0.08] text-orange-400 uppercase">
                      {plan.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      plan.priority === "p1"
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    }`}>
                      {plan.priority}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {plan.frequencyType.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">{plan.name}</h3>
                  <p className="text-xs text-neutral-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Cible : <strong className="text-neutral-200">{plan.targetAssetTag}</strong></span>
                  </p>
                </div>

                {/* Switch Active/Inactive */}
                <button
                  onClick={() => togglePlanActive(plan.id)}
                  className={`p-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                    plan.active 
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                      : "bg-neutral-800 text-neutral-400 border-white/[0.1] hover:text-white"
                  }`}
                  title="Activer/Désactiver le plan"
                >
                  {plan.active ? "ACTIF" : "PAUSE"}
                </button>
              </div>

              {/* Progress Bar for Operating Hours / Due Date */}
              {plan.counterIntervalHours && (
                <div className="p-3 rounded-2xl bg-black/30 border border-white/[0.04] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-400" />
                      <span>Compteur d'Heures d'Exploitation</span>
                    </span>
                    <span className="font-mono font-bold text-white">
                      {plan.currentCounterHours} / {plan.counterIntervalHours} h ({counterProgress}%)
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isNearDue 
                          ? "bg-gradient-to-r from-amber-500 to-red-500 animate-pulse" 
                          : "bg-gradient-to-r from-orange-500 to-amber-500"
                      }`}
                      style={{ width: `${counterProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                    <span>Dernière exécution : {new Date(plan.lastExecutedAt).toLocaleDateString()}</span>
                    <span>Prochaine échéance : <strong className="text-neutral-200">{new Date(plan.nextDueDate).toLocaleDateString()}</strong></span>
                  </div>
                </div>
              )}

              {/* Checklist Elements Preview */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Check-list de tournée ({plan.checklistTemplate.length} points de contrôle) :
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {plan.checklistTemplate.map((chk, i) => (
                    <div key={i} className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-neutral-300 flex items-start gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" />
                      <span className="truncate">{chk.task}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <UserCheck className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="truncate max-w-[160px]">{plan.assignedTeam}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLaunchPreventiveTour(plan)}
                    disabled={isSimulatingTour}
                    className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{language === "fr" ? "Déclencher Tournée Immédiate" : "Run Tour Now"}</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: Create New Preventive Schedule Plan */}
      {isAddPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-white/[0.15] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span>{language === "fr" ? "Nouvelle Règle de Maintenance Préventive" : "Create Preventive Maintenance Rule"}</span>
              </h3>
              <button onClick={() => setIsAddPlanModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  {language === "fr" ? "Titre / Intitulé de la Tournée :" : "Tour Name:"}
                </label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  placeholder="e.g. Tournée Mensuelle des Groupes Électrogènes & Fuel"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-white outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Catégorie :</label>
                  <select
                    value={newPlan.assetCategory}
                    onChange={(e) => setNewPlan({ ...newPlan, assetCategory: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-white outline-none"
                  >
                    <option value="cooling">Climatisation & Froid</option>
                    <option value="power">Énergie & Onduleurs</option>
                    <option value="storage">Stockage & Baies</option>
                    <option value="network">Réseau & Switchs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Équipements Cibles :</label>
                  <input
                    type="text"
                    value={newPlan.targetAssetTag}
                    onChange={(e) => setNewPlan({ ...newPlan, targetAssetTag: e.target.value })}
                    placeholder="e.g. ALL_UPS_RACKS"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Type de Déclenchement :</label>
                  <select
                    value={newPlan.frequencyType}
                    onChange={(e) => setNewPlan({ ...newPlan, frequencyType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-white outline-none"
                  >
                    <option value="counter_hours">Compteur Horaires (Heures)</option>
                    <option value="calendar_monthly">Mensuel (30 jours)</option>
                    <option value="calendar_quarterly">Trimestriel (90 jours)</option>
                    <option value="calendar_yearly">Annuel (365 jours)</option>
                    <option value="smart_sensor_threshold">Seuil Capteurs IoT / IA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Intervalle Heures / Jours :</label>
                  <input
                    type="number"
                    value={newPlan.counterIntervalHours}
                    onChange={(e) => setNewPlan({ ...newPlan, counterIntervalHours: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Équipe Assignée :</label>
                  <input
                    type="text"
                    value={newPlan.assignedTeam}
                    onChange={(e) => setNewPlan({ ...newPlan, assignedTeam: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Priorité :</label>
                  <select
                    value={newPlan.priority}
                    onChange={(e) => setNewPlan({ ...newPlan, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-white outline-none"
                  >
                    <option value="p1">P1 - Haute</option>
                    <option value="p2">P2 - Moyenne</option>
                    <option value="p3">P3 - Basse</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                onClick={() => setIsAddPlanModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/[0.1] text-xs font-semibold text-neutral-300 hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleCreatePlan}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Créer la Règle Préventive
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
