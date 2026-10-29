import React, { useState } from "react";
import { 
  Building2, 
  Cpu, 
  Zap, 
  Wrench, 
  FileText, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Database, 
  Folder, 
  Plus, 
  ExternalLink,
  MapPin,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { GlobalState, EdgeNode } from "../types";
import { useAppContext } from "../contexts/AppContext";

export interface CustomField {
  id: string;
  name: string;
  value: string;
  type: "text" | "number" | "date" | "status";
}

interface UnifiedAssetFileProps {
  state: GlobalState;
  isDark?: boolean;
  isCompactMode?: boolean;
  onNavigateTab?: (tabId: string) => void;
}

export const UnifiedAssetFile: React.FC<UnifiedAssetFileProps> = ({
  state,
  isDark = true,
  isCompactMode = false,
  onNavigateTab
}) => {
  const { activeAssetId, activeAssetTab, setActiveAsset, setActiveAssetTab } = useAppContext();
  const nodes = state?.nodes || [];
  const selectedNodeId = activeAssetId || nodes[0]?.id || "node-paris-01";
  const activeTab = activeAssetTab || "telemetrie";
  
  // Custom user-defined fields (Feature #5 NetSuite Malléabilité)
  const [customFields, setCustomFields] = useState<CustomField[]>(() => {
    try {
      const saved = localStorage.getItem("sensorium_custom_asset_fields");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: "cf-1", name: "Police d'Assurance", value: "AXA Real Estate #POL-2025-992", type: "text" },
      { id: "cf-2", name: "Garantie Constructeur", value: "Jusqu'au 15/12/2028", type: "date" },
      { id: "cf-3", name: "Code Imputation Budgétaire", value: "OPEX-IDF-048", type: "text" },
      { id: "cf-4", name: "Fournisseur Pièces de Rechange", value: "Schneider Electric Service Pro", type: "text" },
    ];
  });

  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [isAddingField, setIsAddingField] = useState(false);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0] || {
    id: "node-paris-01",
    name: "Centrale CTA / Chiller Master 01",
    location: "Paris — Siège Tertiaire Opéra",
    status: "online",
    cpuUsage: 34,
    memoryUsage: 48,
    type: "HVAC / CVC Carrier",
    lastHeartbeat: new Date().toISOString()
  };

  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    const updated = [
      ...customFields,
      {
        id: `cf-${Date.now()}`,
        name: newFieldName.trim(),
        value: newFieldValue.trim() || "Non spécifié",
        type: "text" as const
      }
    ];
    setCustomFields(updated);
    try {
      localStorage.setItem("sensorium_custom_asset_fields", JSON.stringify(updated));
    } catch {}
    setNewFieldName("");
    setNewFieldValue("");
    setIsAddingField(false);
  };

  const handleDeleteCustomField = (id: string) => {
    const updated = customFields.filter(f => f.id !== id);
    setCustomFields(updated);
    try {
      localStorage.setItem("sensorium_custom_asset_fields", JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="w-full space-y-4">
      {/* Header Selector & Master Identity Card */}
      <div className={`p-4 rounded-xl border transition-all ${
        isDark ? "bg-[#0b0d13] border-white/10" : "bg-white border-slate-200 shadow-xs"
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-sans text-slate-900 dark:text-white">
                  {selectedNode.name || selectedNode.id}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                  selectedNode.status === "online" 
                    ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30" 
                    : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                }`}>
                  {selectedNode.status === "online" ? "EN SERVICE (OK)" : "MAINTENANCE REQUISE"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-500 border border-slate-200 dark:border-white/[0.08]">
                  ID: {selectedNode.id}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-neutral-400 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  {selectedNode.location || "Site Tertiaire Principal"}
                </span>
                <span>•</span>
                <span>Tenant: <strong>AXA / Caisse des Dépôts</strong></span>
                <span>•</span>
                <span>Type: <strong>{selectedNode.type || "Équipement CVC & Télémétrie"}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Dropdown Node Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs text-slate-400 font-mono">Changer d'équipement :</label>
            <select
              value={selectedNodeId}
              onChange={(e) => setActiveAsset(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id} className="dark:bg-[#0b0d13]">
                  {n.name || n.id} ({n.location || 'Local'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Master Navigation Tabs */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-200 dark:border-white/10 overflow-x-auto no-scrollbar">
          {[
            { id: "technique", label: "Specs & Dossier", icon: Cpu },
            { id: "telemetrie", label: "Télémétrie Live", icon: Zap },
            { id: "maintenance", label: "GMAO & Travaux", icon: Wrench },
            { id: "conformite", label: "Conformité DORA", icon: ShieldCheck },
            { id: "custom", label: `Champs Métier (${customFields.length})`, icon: Sparkles },
          ].map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAssetTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isTabActive
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
                    : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1 : Fiche Technique */}
      {activeTab === "technique" && (
        <div className={`p-5 rounded-xl border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${
          isDark ? "bg-[#0b0d13] border-white/10" : "bg-white border-slate-200"
        } ${isCompactMode ? "text-xs" : "text-sm"}`}>
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Caractéristiques Électromécaniques</span>
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between"><span>Puissance nominale :</span> <strong className="text-slate-800 dark:text-white">45.0 kW</strong></div>
              <div className="flex justify-between"><span>Tension d'alimentation :</span> <strong className="text-slate-800 dark:text-white">400V Triphasé</strong></div>
              <div className="flex justify-between"><span>Débit volumique :</span> <strong className="text-slate-800 dark:text-white">12 500 m³/h</strong></div>
              <div className="flex justify-between"><span>Fluide frigorigène :</span> <strong className="text-emerald-500">R32 Bas-GWP</strong></div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Cycle de Vie &amp; Fournisseur</span>
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between"><span>Date de mise en service :</span> <strong>12 Mai 2023</strong></div>
              <div className="flex justify-between"><span>Durée de vie théorique :</span> <strong>15 ans (2038)</strong></div>
              <div className="flex justify-between"><span>Contrat de garantie :</span> <strong className="text-emerald-500">Gold 24/7 Actif</strong></div>
              <div className="flex justify-between"><span>Constructeur :</span> <strong>Carrier / Schneider</strong></div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Documentation &amp; Plans GED</span>
            <div className="space-y-2 text-xs">
              <a href="#pdf-manual" className="flex items-center justify-between p-2 rounded bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:border-orange-500 transition-colors">
                <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-orange-500" /> Manuel Exploitation (PDF)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a href="#schema-elec" className="flex items-center justify-between p-2 rounded bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:border-orange-500 transition-colors">
                <span className="flex items-center gap-1.5"><Folder className="w-3.5 h-3.5 text-blue-500" /> Schéma Unifilaire CAFM</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2 : Télémétrie en temps réel */}
      {activeTab === "telemetrie" && (
        <div className={`p-5 rounded-xl border space-y-4 ${
          isDark ? "bg-[#0b0d13] border-white/10" : "bg-white border-slate-200"
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase">Température Étage</span>
              <div className="text-lg font-bold text-slate-800 dark:text-white mt-1">21.4 °C</div>
              <span className="text-[10px] text-emerald-500">Consigne 21.0 °C (Optimal)</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase">Pression Delta</span>
              <div className="text-lg font-bold text-slate-800 dark:text-white mt-1">240 Pa</div>
              <span className="text-[10px] text-emerald-500">Filtres propres</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase">Consommation instantanée</span>
              <div className="text-lg font-bold text-orange-500 mt-1">18.2 kW</div>
              <span className="text-[10px] text-slate-400">-14% vs moyenne historique</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase">Pipeline Kafka</span>
              <div className="text-lg font-bold text-emerald-500 mt-1">24 ms latency</div>
              <span className="text-[10px] text-slate-400">100 msg/sec streaming</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3 : GMAO / Maintenance & Bons de Travail */}
      {activeTab === "maintenance" && (
        <div className={`p-5 rounded-xl border space-y-4 ${
          isDark ? "bg-[#0b0d13] border-white/10" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-400">Journal des Bons d'Intervention (CMMS)</h3>
            <button 
              onClick={() => onNavigateTab && onNavigateTab("ov-cafm")}
              className="px-2.5 py-1 rounded bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors"
            >
              + Ouvrir Module GMAO Complet
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-200 dark:border-white/10 text-slate-400">
                <tr>
                  <th className="py-2">Réf. Bon</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Nature Intervention</th>
                  <th className="py-2">Technicien / Prestataire</th>
                  <th className="py-2">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                <tr>
                  <td className="py-2.5 text-orange-500 font-bold">WO-2025-081</td>
                  <td>12/10/2026</td>
                  <td>Nettoyage filtres et étalonnage capteurs CVC</td>
                  <td>SPIE Facility Management</td>
                  <td><span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px]">Terminé</span></td>
                </tr>
                <tr>
                  <td className="py-2.5 text-orange-500 font-bold">WO-2025-044</td>
                  <td>28/08/2026</td>
                  <td>Remplacement roulement ventilateur moteur</td>
                  <td>Equipe Astreinte Interne</td>
                  <td><span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px]">Validé</span></td>
                </tr>
                <tr>
                  <td className="py-2.5 text-orange-500 font-bold">WO-2025-012</td>
                  <td>14/04/2026</td>
                  <td>Inspection réglementaire annuelle F-Gas</td>
                  <td>Bureau Veritas Certif.</td>
                  <td><span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px]">Conforme</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4 : Conformité DORA & CSRD */}
      {activeTab === "conformite" && (
        <div className={`p-5 rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-4 ${
          isDark ? "bg-[#0b0d13] border-white/10" : "bg-white border-slate-200"
        }`}>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Résilience &amp; Audit DORA</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              L'actif est certifié résilient selon les exigences du Règlement UE DORA pour les entités financières et institutionnelles.
            </p>
            <div className="mt-3 space-y-1 font-mono text-xs">
              <div className="flex justify-between"><span>Score Résilience :</span> <strong className="text-emerald-500">98 / 100</strong></div>
              <div className="flex justify-between"><span>Alimentation secourue (Onduleur) :</span> <strong className="text-emerald-500">Oui (Double Adduction)</strong></div>
              <div className="flex justify-between"><span>Redondance N+1 :</span> <strong className="text-emerald-500">Certifié</strong></div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Bilan Carbone CSRD Scope 1 &amp; 2</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Émissions de gaz à effet de serre calculées automatiquement selon la méthode GHG Protocol.
            </p>
            <div className="mt-3 space-y-1 font-mono text-xs">
              <div className="flex justify-between"><span>Intensité CO₂ horaire :</span> <strong>12.4 gCO₂/kWh</strong></div>
              <div className="flex justify-between"><span>Économies certifiées 2026 :</span> <strong className="text-emerald-500">-34.8 Tonnes éq. CO₂</strong></div>
              <div className="flex justify-between"><span>Statut Décret Tertiaire :</span> <strong className="text-emerald-500">Objectif 2030 Dépassé (-42%)</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5 : Malléabilité & Champs Personnalisés (ERP NetSuite Spirit) */}
      {activeTab === "custom" && (
        <div className={`p-5 rounded-xl border space-y-4 ${
          isDark ? "bg-[#0b0d13] border-white/10" : "bg-white border-slate-200"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                Champs Métier Personnalisés (Custom Fields)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Adaptez SENSORIUM aux procédures spécifiques de votre organisation (Contrats, centres de coûts, références client).
              </p>
            </div>
            <button
              onClick={() => setIsAddingField(!isAddingField)}
              className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingField ? "Annuler" : "Ajouter un champ personnalisé"}</span>
            </button>
          </div>

          {/* Form to add custom field */}
          {isAddingField && (
            <form onSubmit={handleAddCustomField} className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Nom du champ (ex: N° Bon de commande, Référent audit)"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-orange-500"
                required
              />
              <input
                type="text"
                placeholder="Valeur du champ (ex: AXA-2026-X14)"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors"
              >
                Enregistrer
              </button>
            </form>
          )}

          {/* List of custom fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customFields.map(field => (
              <div 
                key={field.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 group hover:border-orange-500/40 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    {field.name}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-800 dark:text-white mt-0.5 block">
                    {field.value}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteCustomField(field.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-500 transition-opacity text-xs"
                  title="Supprimer ce champ"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedAssetFile;
