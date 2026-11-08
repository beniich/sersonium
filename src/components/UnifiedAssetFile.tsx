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
  Sparkles,
  ShieldAlert,
  Save,
  Check
} from "lucide-react";
import { GlobalState, EdgeNode } from "../types";
import { useAppContext } from "../contexts/AppContext";
import { TechnicalInput, TechnicalFieldType } from "./TechnicalInput";

export interface CustomField {
  id: string;
  name: string;
  value: string;
  type: "text" | "number" | "date" | "status" | TechnicalFieldType;
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
  const [newFieldType, setNewFieldType] = useState<"text" | TechnicalFieldType>("text");
  const [isFieldValid, setIsFieldValid] = useState(true);
  const [isAddingField, setIsAddingField] = useState(false);

  // Configuration Réseau OT & Paramètres Sensibles (Signal Cognitif Industriel)
  const [otConfigs, setOtConfigs] = useState<Record<string, {
    ip: string;
    mac: string;
    iot_code: string;
    api_key: string;
    port: string;
    vlan: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem("sensorium_asset_ot_configs");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      "node-paris-01": {
        ip: "192.168.10.45",
        mac: "00:1A:2B:3C:4D:5E",
        iot_code: "NODE-FRA1-PUE-X1",
        api_key: "sk_live_sec_fra1_ot_94827409249",
        port: "502",
        vlan: "120"
      }
    };
  });

  const [otSavedToast, setOtSavedToast] = useState(false);
  const currentOt = otConfigs[selectedNodeId] || {
    ip: "192.168.10.45",
    mac: "00:1A:2B:3C:4D:5E",
    iot_code: `NODE-${selectedNodeId.toUpperCase()}-01`,
    api_key: "sk_live_ot_control_84920482048",
    port: "502",
    vlan: "120"
  };

  const handleUpdateOtField = (field: "ip" | "mac" | "iot_code" | "api_key" | "port" | "vlan", val: string) => {
    setOtConfigs(prev => ({
      ...prev,
      [selectedNodeId]: {
        ...(prev[selectedNodeId] || currentOt),
        [field]: val
      }
    }));
  };

  const handleSaveOtConfig = () => {
    try {
      localStorage.setItem("sensorium_asset_ot_configs", JSON.stringify(otConfigs));
      setOtSavedToast(true);
      setTimeout(() => setOtSavedToast(false), 2500);
    } catch {}
  };

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
    if (!newFieldName.trim() || !isFieldValid) return;
    const updated = [
      ...customFields,
      {
        id: `cf-${Date.now()}`,
        name: newFieldName.trim(),
        value: newFieldValue.trim() || "Non spécifié",
        type: newFieldType
      }
    ];
    setCustomFields(updated);
    try {
      localStorage.setItem("sensorium_custom_asset_fields", JSON.stringify(updated));
    } catch {}
    setNewFieldName("");
    setNewFieldValue("");
    setNewFieldType("text");
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
              <button
                type="button"
                onClick={() => window.open('/site/architecture.html', '_blank')}
                className="w-full flex items-center justify-between p-2 rounded bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:border-orange-500 transition-colors text-left cursor-pointer"
              >
                <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-orange-500" /> Manuel Exploitation (PDF)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => window.open('/site/jumeau_numerique_3d.html', '_blank')}
                className="w-full flex items-center justify-between p-2 rounded bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:border-orange-500 transition-colors text-left cursor-pointer"
              >
                <span className="flex items-center gap-1.5"><Folder className="w-3.5 h-3.5 text-blue-500" /> Schéma Unifilaire CAFM</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Sécurité Réseau OT & Paramètres Sensibles (Signal Cognitif Industriel) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 p-4 rounded-xl bg-gradient-to-br from-yellow-500/[0.06] via-transparent to-slate-900/40 border border-yellow-500/30 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-yellow-500/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-500 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span>Paramètres Réseau OT &amp; Saisie Critique Sécurisée</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/40 font-mono font-semibold">
                      Signal Cognitif Niveau 1 à 3
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                    Signal Jaune Électrique d'alerte, validation instantanée Regex et masquage anti-indiscrétion (Privacy Shoulder Surfing).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveOtConfig}
                className="px-3.5 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-yellow-500/20 cursor-pointer self-start sm:self-auto"
              >
                {otSavedToast ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-black" />
                    <span>Configuration Enregistrée !</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Sauvegarder Réseau OT</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <TechnicalInput
                label="IP Automate PLC (Fieldbus)"
                type="ip"
                value={currentOt.ip}
                onChange={(e) => handleUpdateOtField('ip', e.target.value)}
                helperText="Format IPv4 (0-255 par octet) — Modbus/TCP"
              />
              <TechnicalInput
                label="Adresse MAC Contrôleur"
                type="mac"
                value={currentOt.mac}
                onChange={(e) => handleUpdateOtField('mac', e.target.value)}
                helperText="Format 6 octets hexadécimaux"
              />
              <TechnicalInput
                label="Identifiant Capteur / Nœud IoT"
                type="iot_code"
                value={currentOt.iot_code}
                onChange={(e) => handleUpdateOtField('iot_code', e.target.value)}
                helperText="Code alphanumérique avec masquage"
              />
              <TechnicalInput
                label="Clé Secrète API OT Télémétrie"
                type="api_key"
                value={currentOt.api_key}
                onChange={(e) => handleUpdateOtField('api_key', e.target.value)}
                helperText="Jeton cryptographique sécurisé"
              />
              <TechnicalInput
                label="Port Réseau Bus Modbus/BACnet"
                type="port"
                value={currentOt.port}
                onChange={(e) => handleUpdateOtField('port', e.target.value)}
                helperText="Port TCP/UDP (1 - 65535, ex: 502 Modbus)"
              />
              <TechnicalInput
                label="ID VLAN Industriel Cloisonné"
                type="vlan"
                value={currentOt.vlan}
                onChange={(e) => handleUpdateOtField('vlan', e.target.value)}
                helperText="Segment réseau isolé (1 - 4094)"
              />
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
            <form onSubmit={handleAddCustomField} className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 via-yellow-500/5 to-transparent border border-orange-500/30 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Nom du champ métier :</label>
                  <input
                    type="text"
                    placeholder="ex: Passerelle IP Secours, Adresse MAC, Code Capteur"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Type de validation :</label>
                  <select
                    value={newFieldType}
                    onChange={(e) => {
                      setNewFieldType(e.target.value as any);
                      setIsFieldValid(true);
                    }}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-orange-500"
                  >
                    <option value="text">Texte Standard (Non sensible)</option>
                    <option value="ip">⚠️ Adresse IP (Signal Jaune + Validation IPv4)</option>
                    <option value="mac">⚠️ Adresse MAC (Validation Hex 6 octets)</option>
                    <option value="iot_code">⚠️ Code IoT / Node (Protection &amp; Masquage)</option>
                    <option value="api_key">⚠️ Clé API / Token (Masquage direct)</option>
                    <option value="port">⚠️ Port Réseau (1 - 65535)</option>
                    <option value="vlan">⚠️ VLAN ID (1 - 4094)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic input: TechnicalInput with Regex & Privacy vs Simple text */}
              {newFieldType !== "text" ? (
                <div className="pt-1">
                  <TechnicalInput
                    label={`Valeur technique sécurisée (${newFieldType.toUpperCase()})`}
                    type={newFieldType as TechnicalFieldType}
                    value={newFieldValue}
                    onChange={(e) => setNewFieldValue(e.target.value)}
                    onValidationChange={(valid) => setIsFieldValid(valid)}
                    helperText="Validation Regex active en direct. Saisie requise conforme aux normes OT."
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Valeur standard :</label>
                  <input
                    type="text"
                    placeholder="ex: AXA-2026-X14, Contrat #8942-A"
                    value={newFieldValue}
                    onChange={(e) => setNewFieldValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-orange-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddingField(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!isFieldValid || !newFieldName.trim()}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !isFieldValid || !newFieldName.trim()
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed opacity-60"
                      : "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer shadow-md shadow-orange-500/20"
                  }`}
                >
                  Enregistrer le champ
                </button>
              </div>
            </form>
          )}

          {/* List of custom fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customFields.map(field => {
              const isTech = ['ip', 'mac', 'iot_code', 'api_key', 'port', 'vlan'].includes(field.type);
              return (
                <div 
                  key={field.id}
                  className={`flex items-center justify-between p-3 rounded-lg border group transition-all ${
                    isTech 
                      ? "bg-yellow-500/[0.04] border-yellow-500/30 hover:border-yellow-500/70 shadow-[0_0_8px_rgba(250,204,21,0.08)]" 
                      : "bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:border-orange-500/40"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      {isTech && <ShieldAlert className="w-3.5 h-3.5 text-yellow-500" />}
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        {field.name}
                      </span>
                      {isTech && (
                        <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/40 uppercase">
                          {field.type}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-800 dark:text-white mt-1 block">
                      {field.type === 'api_key' ? '•••••••••••••••• (Masqué)' : field.value}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteCustomField(field.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-slate-400 hover:text-rose-500 transition-opacity text-xs cursor-pointer"
                    title="Supprimer ce champ"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedAssetFile;
