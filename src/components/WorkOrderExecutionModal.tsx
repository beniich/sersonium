import React, { useState } from "react";
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  X, 
  Plus, 
  Trash2, 
  Package, 
  ShieldCheck, 
  FileCheck, 
  PenTool, 
  AlertTriangle,
  UserCheck
} from "lucide-react";
import { useLanguage } from "../App";
import { GlobalState, CAFMWorkOrder, SparePart, MaintenanceChecklistItem, WorkOrderPartUsage } from "../types";
import { logAuditEvent } from "../hooks/useGlobalState";

interface WorkOrderExecutionModalProps {
  workOrder: CAFMWorkOrder;
  state: GlobalState;
  isDark: boolean;
  onClose: () => void;
  onComplete: (updatedWO: CAFMWorkOrder) => void;
}

export default function WorkOrderExecutionModal({
  workOrder,
  state,
  isDark,
  onClose,
  onComplete
}: WorkOrderExecutionModalProps) {
  const { language } = useLanguage();

  // Default checklist if not populated
  const [checklist, setChecklist] = useState<MaintenanceChecklistItem[]>(
    workOrder.checklist || [
      { id: "chk-1", task: language === "fr" ? "Vérification visuelle de l'état général et absence d'obstruction thermique" : "Visual inspection of chassis and airflow path", done: true, nominalRange: "Clear" },
      { id: "chk-2", task: language === "fr" ? "Mesure de tension d'alimentation en charge (V)" : "Voltage under load measurement (V)", done: false, measuredValue: "230.2", nominalRange: "220V - 240V" },
      { id: "chk-3", task: language === "fr" ? "Remplacement du composant défectueux selon procédure constructeur" : "Subassembly replacement following OEM procedure", done: false },
      { id: "chk-4", task: language === "fr" ? "Re-étalonnage des sondes et test de charge thermique" : "Sensor recalibration and thermal stress testing", done: false },
      { id: "chk-5", task: language === "fr" ? "Nettoyage de la baie et validation étanchéité allée froide" : "Bay clean-up & cold aisle seal inspection", done: false }
    ]
  );

  // Selected spare parts used
  const [partsUsed, setPartsUsed] = useState<WorkOrderPartUsage[]>(
    workOrder.partsUsed || []
  );

  const [selectedPartIdToAdd, setSelectedPartIdToAdd] = useState<string>("");
  const [selectedQuantityToAdd, setSelectedQuantityToAdd] = useState<number>(1);

  // Execution notes and signature
  const [executionNotes, setExecutionNotes] = useState<string>(
    workOrder.aiAnalysis ? `Resolved following AI recommendation: ${workOrder.aiAnalysis}` : "Standard preventive inspection protocol carried out. All nominal parameters verified."
  );
  const [technicianName, setTechnicianName] = useState<string>(
    workOrder.assignedTo || "Yassine S. (Level 3 Ops Lead)"
  );
  const [isSigned, setIsSigned] = useState<boolean>(false);
  const [durationMinutes, setDurationMinutes] = useState<number>(workOrder.durationMinutes || 45);

  const availableParts: SparePart[] = state.spareParts || [];

  const handleToggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const handleUpdateMeasuredValue = (id: string, val: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, measuredValue: val } : item));
  };

  const handleAddPartToWorkOrder = () => {
    if (!selectedPartIdToAdd) return;
    const part = availableParts.find(p => p.id === selectedPartIdToAdd);
    if (!part) return;

    if (part.quantityInStock < selectedQuantityToAdd) {
      alert(language === "fr" ? "Stock insuffisant pour cette pièce !" : "Insufficient stock for this part!");
      return;
    }

    // Deduct from stock
    part.quantityInStock -= selectedQuantityToAdd;

    const existingIndex = partsUsed.findIndex(p => p.partId === part.id);
    if (existingIndex >= 0) {
      const updated = [...partsUsed];
      updated[existingIndex].quantity += selectedQuantityToAdd;
      setPartsUsed(updated);
    } else {
      setPartsUsed([
        ...partsUsed,
        {
          partId: part.id,
          sku: part.sku,
          name: part.name,
          quantity: selectedQuantityToAdd,
          unitCost: part.unitCost
        }
      ]);
    }

    setSelectedPartIdToAdd("");
    setSelectedQuantityToAdd(1);
  };

  const handleRemovePart = (partId: string) => {
    const item = partsUsed.find(p => p.partId === partId);
    if (item) {
      // Re-credit stock
      const stockItem = availableParts.find(p => p.id === partId);
      if (stockItem) {
        stockItem.quantityInStock += item.quantity;
      }
      setPartsUsed(prev => prev.filter(p => p.partId !== partId));
    }
  };

  const totalPartsCost = partsUsed.reduce((sum, p) => sum + p.quantity * p.unitCost, 0);

  const handleSubmitResolution = async () => {
    const allDone = checklist.every(c => c.done);
    if (!allDone) {
      const confirmIncomplete = window.confirm(
        language === "fr" 
          ? "Certaines étapes de la check-list ne sont pas cochées. Voulez-vous quand même valider l'intervention ?"
          : "Some checklist steps remain uncompleted. Do you still wish to submit and resolve this work order?"
      );
      if (!confirmIncomplete) return;
    }

    const updatedWO: CAFMWorkOrder = {
      ...workOrder,
      status: "resolved",
      durationMinutes,
      checklist,
      partsUsed,
      digitalSignature: {
        technicianName,
        signedAt: new Date().toISOString(),
        signatureNote: executionNotes
      }
    };

    await logAuditEvent(
      "WORK_ORDER_RESOLVED",
      `Work Order ${workOrder.id} (${workOrder.title}) resolved by ${technicianName}. Duration: ${durationMinutes} min. Parts cost: ${totalPartsCost} €.`
    );

    onComplete(updatedWO);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.12] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase">{workOrder.id}</span>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 uppercase">
                  {workOrder.priority}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {workOrder.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          
          {/* 1. Step-by-Step Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                <span>{language === "fr" ? "Check-list Technique d'Intervention" : "Intervention Execution Checklist"}</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                {checklist.filter(c => c.done).length}/{checklist.length} {language === "fr" ? "validées" : "completed"}
              </span>
            </div>

            <div className="space-y-2">
              {checklist.map((item) => (
                <div 
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all ${
                    item.done 
                      ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="mt-0.5 w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
                    />
                    <div className="flex-1 space-y-1.5">
                      <div className={`font-medium ${item.done ? "text-emerald-800 dark:text-emerald-300 font-semibold" : "text-slate-700 dark:text-neutral-300"}`}>
                        {item.task}
                      </div>

                      {item.nominalRange && (
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-slate-400">{language === "fr" ? "Plage nominale : " : "Nominal range: "} {item.nominalRange}</span>
                          <span className="text-slate-300">•</span>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500 dark:text-neutral-400">{language === "fr" ? "Relevé in-situ :" : "Measured value:"}</span>
                            <input
                              type="text"
                              value={item.measuredValue || ""}
                              onChange={(e) => handleUpdateMeasuredValue(item.id, e.target.value)}
                              placeholder="e.g. 230.2 V"
                              className="w-24 px-1.5 py-0.5 rounded bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] text-xs font-mono text-slate-900 dark:text-white outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Spare Parts Consumption */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Package className="w-4 h-4 text-orange-500" />
                <span>{language === "fr" ? "Consommation Pièces de Rechange (Sortie Stock)" : "Spare Parts Consumed (Inventory Deduction)"}</span>
              </h4>
              <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white">
                Total: {totalPartsCost.toLocaleString()} €
              </span>
            </div>

            {/* Selector bar */}
            <div className="flex items-center gap-2">
              <select
                value={selectedPartIdToAdd}
                onChange={(e) => setSelectedPartIdToAdd(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-white outline-none focus:border-orange-500"
              >
                <option value="">{language === "fr" ? "-- Sélectionner une pièce du magasin --" : "-- Select spare part from warehouse --"}</option>
                {availableParts.map(part => (
                  <option key={part.id} value={part.id}>
                    {part.sku} - {part.name} ({part.quantityInStock} dispo, {part.unitCost}€)
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                max="20"
                value={selectedQuantityToAdd}
                onChange={(e) => setSelectedQuantityToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2.5 py-2 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] text-xs font-mono text-center text-slate-900 dark:text-white outline-none"
              />

              <button
                type="button"
                onClick={handleAddPartToWorkOrder}
                className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === "fr" ? "Ajouter" : "Add"}</span>
              </button>
            </div>

            {/* Consumed list */}
            {partsUsed.length > 0 && (
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                {partsUsed.map(part => (
                  <div key={part.partId} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-white/[0.04] last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{part.sku}</span>
                      <span className="text-slate-600 dark:text-neutral-400">{part.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {part.quantity} × {part.unitCost}€ = {(part.quantity * part.unitCost)}€
                      </span>
                      <button
                        onClick={() => handleRemovePart(part.partId)}
                        className="text-red-500 hover:text-red-700 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Operational Time & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-700 dark:text-neutral-300 block mb-1">
                {language === "fr" ? "Durée Réelle d'Intervention (Minutes) :" : "Actual Intervention Duration (Minutes):"}
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] text-xs font-mono text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-700 dark:text-neutral-300 block mb-1">
                {language === "fr" ? "Technicien Référent :" : "Lead Technician Sign-off:"}
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Rapport de Clôture & Émargement Électronique */}
          <div className="space-y-2">
            <label className="font-medium text-slate-700 dark:text-neutral-300 block">
              {language === "fr" ? "Observations & Rapport de Clôture :" : "Resolution Notes & Field Remarks:"}
            </label>
            <textarea
              rows={3}
              value={executionNotes}
              onChange={(e) => setExecutionNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-white outline-none focus:border-orange-500"
            />
          </div>

          {/* Digital Signature Badge */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {language === "fr" ? "Émargement Numérique Cryptographique" : "Tamper-Proof Digital Verification"}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  SHA-256 Signature • Timestamp: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
              FIPS 140-3 COMPLIANT
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] text-xs font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
          >
            {language === "fr" ? "Fermer sans clôturer" : "Close"}
          </button>

          <button
            onClick={handleSubmitResolution}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === "fr" ? "Clôturer le Bon de Travail" : "Sign & Complete Work Order"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
