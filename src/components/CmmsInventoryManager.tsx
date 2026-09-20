import React, { useState } from "react";
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  Wrench, 
  Tag, 
  Layers, 
  Cpu, 
  Zap, 
  Snowflake, 
  HardDrive, 
  Network, 
  Boxes,
  Truck,
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
  TrendingDown
} from "lucide-react";
import { useLanguage } from "../App";
import { GlobalState, SparePart } from "../types";
import { logAuditEvent } from "../hooks/useGlobalState";

interface CmmsInventoryManagerProps {
  state: GlobalState;
  isDark: boolean;
  onSelectPart?: (part: SparePart) => void;
  onWorkOrderLink?: (part: SparePart) => void;
}

export default function CmmsInventoryManager({
  state,
  isDark,
  onSelectPart,
  onWorkOrderLink
}: CmmsInventoryManagerProps) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockAmount, setRestockAmount] = useState<number>(10);
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);

  // New part form
  const [newPart, setNewPart] = useState<Partial<SparePart>>({
    sku: "SKU-ENG-" + Math.floor(100 + Math.random() * 900),
    name: "",
    category: "power",
    quantityInStock: 20,
    minThreshold: 5,
    unitCost: 150,
    locationWarehouse: "Warehouse Paris-CDG / Aisle A-01",
    leadTimeDays: 3,
    compatibleAssets: ["All Standard Edge Nodes"],
    supplier: "Schneider Electric / APC"
  });

  const spareParts: SparePart[] = state.spareParts || [
    {
      id: "part-1",
      sku: "SKU-FIL-H14",
      name: "HEPA H14 High-Efficiency Datacenter Filter",
      category: "cooling",
      quantityInStock: 4,
      minThreshold: 8,
      unitCost: 120,
      locationWarehouse: "Paris-CDG / Aisle C-04 / Shelf 2",
      leadTimeDays: 4,
      compatibleAssets: ["Liebert CRV Cooling", "Stulz CyberAir 3"],
      lastRestockedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      supplier: "Camfil Clean Air Tech"
    },
    {
      id: "part-2",
      sku: "SKU-PSU-1600T",
      name: "1600W Titanium Hot-Swap Redundant Power Supply",
      category: "power",
      quantityInStock: 12,
      minThreshold: 5,
      unitCost: 450,
      locationWarehouse: "Frankfurt-FRA / Aisle P-01 / Bin 12",
      leadTimeDays: 2,
      compatibleAssets: ["SENSORIUM Blade V8", "Dell PowerEdge R750"],
      lastRestockedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      supplier: "Delta Electronics Corp"
    },
    {
      id: "part-3",
      sku: "SKU-NVME-768",
      name: "Enterprise NVMe PCIe 4.0 U.3 SSD (7.68TB, 3 DWPD)",
      category: "storage",
      quantityInStock: 3,
      minThreshold: 6,
      unitCost: 890,
      locationWarehouse: "London-LHR / Secure Storage Cage 1",
      leadTimeDays: 5,
      compatibleAssets: ["SENSORIUM Storage Vault", "HPE ProLiant DL380"],
      lastRestockedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      supplier: "Kioxia Enterprise Storage"
    },
    {
      id: "part-4",
      sku: "SKU-SFP-25G",
      name: "25GbE SFP28 Short-Reach 850nm Optical Transceiver",
      category: "network",
      quantityInStock: 28,
      minThreshold: 10,
      unitCost: 95,
      locationWarehouse: "Paris-CDG / Aisle N-02 / Bin 4",
      leadTimeDays: 1,
      compatibleAssets: ["Cisco Nexus 93180YC", "Arista 7050X3"],
      lastRestockedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
      supplier: "Finisar / II-VI Inc."
    },
    {
      id: "part-5",
      sku: "SKU-FAN-120EC",
      name: "120mm PWM High-Static Pressure Chassis Blower Fan",
      category: "cooling",
      quantityInStock: 16,
      minThreshold: 6,
      unitCost: 65,
      locationWarehouse: "Tokyo-TYO / Aisle C-01 / Bin 9",
      leadTimeDays: 3,
      compatibleAssets: ["SENSORIUM Edge Node", "Chassis 2U Blade"],
      lastRestockedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      supplier: "Sanyo Denki San Ace"
    },
    {
      id: "part-6",
      sku: "SKU-BAT-UPS93",
      name: "VRLA 12V 100Ah High-Rate Discharge Battery Module",
      category: "power",
      quantityInStock: 2,
      minThreshold: 4,
      unitCost: 320,
      locationWarehouse: "Paris-CDG / Heavy Battery Bay 3",
      leadTimeDays: 7,
      compatibleAssets: ["Eaton 93PM 200kW UPS", "APC Symmetra PX"],
      lastRestockedAt: new Date(Date.now() - 86400000 * 45).toISOString(),
      supplier: "Enersys Datasafe"
    },
    {
      id: "part-7",
      sku: "SKU-CBL-C6A",
      name: "Cat6A F/UTP Shielded Low-Smoke 2m Patch Cord (Pack of 10)",
      category: "cables",
      quantityInStock: 45,
      minThreshold: 15,
      unitCost: 40,
      locationWarehouse: "Frankfurt-FRA / Aisle W-04 / Rack 1",
      leadTimeDays: 1,
      compatibleAssets: ["All Structured Cabling Bays"],
      lastRestockedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      supplier: "Panduit Industrial"
    },
    {
      id: "part-8",
      sku: "SKU-TIM-MX6",
      name: "Non-Conductive Carbon Micro-Particle Thermal Interface (20g)",
      category: "mechanical",
      quantityInStock: 8,
      minThreshold: 3,
      unitCost: 28,
      locationWarehouse: "London-LHR / Toolroom Cabinet B",
      leadTimeDays: 2,
      compatibleAssets: ["CPU & GPU Heat Sink Assemblies"],
      lastRestockedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      supplier: "Arctic Thermal Solutions"
    }
  ];

  // Filtered parts
  const filteredParts = spareParts.filter(part => {
    const matchesCategory = selectedCategory === "all" || part.category === selectedCategory;
    const matchesSearch = 
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.locationWarehouse.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Critical items under threshold
  const criticalParts = spareParts.filter(p => p.quantityInStock <= p.minThreshold);
  const totalStockValue = spareParts.reduce((acc, p) => acc + p.quantityInStock * p.unitCost, 0);
  const totalUnits = spareParts.reduce((acc, p) => acc + p.quantityInStock, 0);

  const getCategoryIcon = (cat: SparePart["category"]) => {
    switch (cat) {
      case "cooling": return <Snowflake className="w-4 h-4 text-cyan-500" />;
      case "power": return <Zap className="w-4 h-4 text-amber-500" />;
      case "storage": return <HardDrive className="w-4 h-4 text-emerald-500" />;
      case "network": return <Network className="w-4 h-4 text-blue-500" />;
      case "cables": return <Layers className="w-4 h-4 text-purple-500" />;
      case "mechanical": return <Wrench className="w-4 h-4 text-orange-500" />;
      default: return <Package className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleRestockPart = async (part: SparePart, quantityToAdd: number) => {
    part.quantityInStock += quantityToAdd;
    part.lastRestockedAt = new Date().toISOString();
    
    await logAuditEvent(
      "SPARE_PART_RESTOCKED",
      `Restocked +${quantityToAdd} units of ${part.sku} (${part.name}). Total on hand: ${part.quantityInStock}`
    );

    setIsRestockModalOpen(false);
  };

  const handleCreateNewPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPart.name || !newPart.sku) return;

    const created: SparePart = {
      id: `part-${Date.now()}`,
      sku: newPart.sku || "SKU-GEN",
      name: newPart.name || "Custom Part",
      category: newPart.category || "mechanical",
      quantityInStock: Number(newPart.quantityInStock) || 10,
      minThreshold: Number(newPart.minThreshold) || 3,
      unitCost: Number(newPart.unitCost) || 50,
      locationWarehouse: newPart.locationWarehouse || "Central Storage",
      leadTimeDays: Number(newPart.leadTimeDays) || 3,
      compatibleAssets: newPart.compatibleAssets || ["Universal"],
      lastRestockedAt: new Date().toISOString(),
      supplier: newPart.supplier || "Direct OEM"
    };

    if (!state.spareParts) {
      state.spareParts = [...spareParts, created];
    } else {
      state.spareParts.push(created);
    }

    await logAuditEvent("SPARE_PART_CREATED", `Registered new spare part SKU ${created.sku} (${created.name})`);
    setIsAddPartModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
            <span>{language === "fr" ? "Références SKU" : "Active SKU References"}</span>
            <Package className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {spareParts.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalUnits.toLocaleString()} {language === "fr" ? "unités en stock" : "total physical units"}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
            <span>{language === "fr" ? "Valeur du Stock" : "Inventory Valuation"}</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {totalStockValue.toLocaleString()} €
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {language === "fr" ? "Coût moyen par pièce" : "Weighted average unit cost"} ~{(totalStockValue / Math.max(1, totalUnits)).toFixed(1)} €
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs transition-colors ${
          criticalParts.length > 0 
            ? "bg-red-500/5 dark:bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
            : "bg-white dark:bg-[#0c0c0e] border-slate-200 dark:border-white/[0.08]"
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className={criticalParts.length > 0 ? "font-semibold" : "text-slate-500 dark:text-neutral-400"}>
              {language === "fr" ? "Seuil Critique de Réassort" : "Low Stock Alerts"}
            </span>
            <AlertTriangle className={`w-4 h-4 ${criticalParts.length > 0 ? "text-red-500 animate-pulse" : "text-slate-400"}`} />
          </div>
          <div className="text-2xl font-bold mt-1">
            {criticalParts.length} {language === "fr" ? "SKU critiques" : "SKUs under threshold"}
          </div>
          <div className="text-[11px] mt-1 opacity-80">
            {criticalParts.length > 0 
              ? (language === "fr" ? "Réapprovisionnement immédiat requis" : "Immediate procurement suggested")
              : (language === "fr" ? "Tous les stocks sont nominaux" : "All buffers healthy")}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
            <span>{language === "fr" ? "Entrepôts Connectés" : "Active Logistics Hubs"}</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            4 {language === "fr" ? "Sites" : "Locations"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Paris-CDG • Frankfurt • London • Tokyo
          </div>
        </div>

      </div>

      {/* Critical Stock Alert Banner if items under threshold */}
      {criticalParts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <span className="font-bold">
                {language === "fr" ? "Alerte Rupture Imminente : " : "Critical Buffer Depletion: "}
              </span>
              <span>
                {criticalParts.map(p => `${p.sku} (${p.quantityInStock}/${p.minThreshold} un.)`).join(", ")}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              criticalParts.forEach(p => handleRestockPart(p, 10));
            }}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            {language === "fr" ? "Simuler Réassort Global (+10)" : "Auto-Replenish All (+10)"}
          </button>
        </div>
      )}

      {/* Controls Bar: Search, Category Filter, and Add Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === "fr" ? "Rechercher par SKU, désignation, fournisseur..." : "Search by SKU, part name, supplier, aisle..."}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {[
            { id: "all", label: language === "fr" ? "Tous" : "All" },
            { id: "cooling", label: language === "fr" ? "Climatisation" : "Cooling" },
            { id: "power", label: language === "fr" ? "Énergie & UPS" : "Power & UPS" },
            { id: "storage", label: language === "fr" ? "Stockage & NVMe" : "Storage" },
            { id: "network", label: language === "fr" ? "Réseau SFP+" : "Network" },
            { id: "cables", label: language === "fr" ? "Câblage" : "Cables" },
            { id: "mechanical", label: language === "fr" ? "Mécanique" : "Mechanical" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-black border-transparent shadow-xs"
                  : "bg-white dark:bg-[#111114] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Add Part Button */}
        <button
          onClick={() => setIsAddPartModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === "fr" ? "Nouvelle Pièce" : "Add Spare Part"}</span>
        </button>
      </div>

      {/* Parts Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/[0.08] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-neutral-400 font-mono text-[11px] bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="py-3 px-4">SKU / {language === "fr" ? "Référence" : "Reference"}</th>
                <th className="py-3 px-4">{language === "fr" ? "Désignation & Fournisseur" : "Part Name & Supplier"}</th>
                <th className="py-3 px-4">{language === "fr" ? "Catégorie" : "Category"}</th>
                <th className="py-3 px-4 text-center">{language === "fr" ? "Stock / Seuil" : "Stock / Min"}</th>
                <th className="py-3 px-4">{language === "fr" ? "Emplacement" : "Warehouse Aisle"}</th>
                <th className="py-3 px-4 text-right">{language === "fr" ? "Prix Unitaire" : "Unit Cost"}</th>
                <th className="py-3 px-4 text-right">{language === "fr" ? "Actions" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {filteredParts.map((part) => {
                const isCritical = part.quantityInStock <= part.minThreshold;
                return (
                  <tr 
                    key={part.id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(part.category)}
                        <span>{part.sku}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{part.name}</div>
                      <div className="text-[11px] text-slate-400 dark:text-neutral-500">{part.supplier}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono capitalize bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/[0.08]">
                        {part.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`font-mono font-bold ${isCritical ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>
                          {part.quantityInStock}
                        </span>
                        <span className="text-slate-400 text-[10px]">/ {part.minThreshold} min</span>
                        {isCritical && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Low stock alert" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-neutral-400 text-[11px]">
                      {part.locationWarehouse}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                      {part.unitCost} €
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedPart(part);
                            setIsRestockModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-neutral-300 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          {language === "fr" ? "Réassort" : "Restock"}
                        </button>
                        <button
                          onClick={() => {
                            if (onWorkOrderLink) onWorkOrderLink(part);
                          }}
                          className="p-1 rounded-lg hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 transition-colors cursor-pointer"
                          title={language === "fr" ? "Associer à un Ordre de Travail" : "Dispatch to Work Order"}
                        >
                          <Wrench className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {isRestockModalOpen && selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.12] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {language === "fr" ? "Réapprovisionnement Pièce" : "Restock Spare Part"}
                </h3>
              </div>
              <button 
                onClick={() => setIsRestockModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] text-xs space-y-1">
              <div className="font-mono font-bold text-slate-900 dark:text-white">{selectedPart.sku}</div>
              <div className="text-slate-600 dark:text-neutral-400">{selectedPart.name}</div>
              <div className="text-slate-500 dark:text-neutral-500">
                {language === "fr" ? "Stock actuel : " : "Current on hand: "} 
                <strong>{selectedPart.quantityInStock} units</strong> (Min: {selectedPart.minThreshold})
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-medium text-slate-700 dark:text-neutral-300">
                {language === "fr" ? "Quantité à ajouter au stock :" : "Quantity to add to inventory:"}
              </label>
              <input
                type="number"
                min="1"
                value={restockAmount}
                onChange={(e) => setRestockAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white outline-none focus:border-orange-500"
              />
              <div className="text-[11px] text-slate-400">
                {language === "fr" ? "Montant de la commande estimé : " : "Estimated PO valuation: "}
                <strong>{(restockAmount * selectedPart.unitCost).toLocaleString()} €</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
              <button
                onClick={() => setIsRestockModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] text-xs font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-white/[0.05]"
              >
                {language === "fr" ? "Annuler" : "Cancel"}
              </button>
              <button
                onClick={() => handleRestockPart(selectedPart, restockAmount)}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs"
              >
                {language === "fr" ? "Confirmer la réception" : "Confirm Receiving"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Part Modal */}
      {isAddPartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.12] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {language === "fr" ? "Enregistrer une Nouvelle Référence Pièce" : "Register New Spare Part"}
                </h3>
              </div>
              <button 
                onClick={() => setIsAddPartModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewPart} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-neutral-300">Code SKU</label>
                  <input
                    type="text"
                    required
                    value={newPart.sku}
                    onChange={(e) => setNewPart({ ...newPart, sku: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white outline-none focus:border-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-neutral-300">{language === "fr" ? "Catégorie" : "Category"}</label>
                  <select
                    value={newPart.category}
                    onChange={(e) => setNewPart({ ...newPart, category: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white outline-none focus:border-orange-500"
                  >
                    <option value="cooling">Cooling & HVAC</option>
                    <option value="power">Power & UPS</option>
                    <option value="storage">Storage & NVMe</option>
                    <option value="network">Network & Transceivers</option>
                    <option value="cables">Structured Cabling</option>
                    <option value="mechanical">Mechanical & Hardware</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-neutral-300">{language === "fr" ? "Désignation complète" : "Full Part Description"}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SFP28 25G Optical Transceiver 850nm"
                  value={newPart.name}
                  onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-neutral-300">{language === "fr" ? "Stock initial" : "Initial Qty"}</label>
                  <input
                    type="number"
                    min="0"
                    value={newPart.quantityInStock}
                    onChange={(e) => setNewPart({ ...newPart, quantityInStock: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-neutral-300">{language === "fr" ? "Seuil mini" : "Min Threshold"}</label>
                  <input
                    type="number"
                    min="1"
                    value={newPart.minThreshold}
                    onChange={(e) => setNewPart({ ...newPart, minThreshold: parseInt(e.target.value) || 1 })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-neutral-300">{language === "fr" ? "Prix unitaire (€)" : "Unit Cost (€)"}</label>
                  <input
                    type="number"
                    min="1"
                    value={newPart.unitCost}
                    onChange={(e) => setNewPart({ ...newPart, unitCost: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-neutral-300">{language === "fr" ? "Fournisseur / Fabricant" : "Supplier OEM"}</label>
                  <input
                    type="text"
                    value={newPart.supplier}
                    onChange={(e) => setNewPart({ ...newPart, supplier: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-neutral-300">{language === "fr" ? "Emplacement Entrepôt" : "Aisle / Bin"}</label>
                  <input
                    type="text"
                    value={newPart.locationWarehouse}
                    onChange={(e) => setNewPart({ ...newPart, locationWarehouse: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsAddPartModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] text-xs font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                >
                  {language === "fr" ? "Annuler" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs"
                >
                  {language === "fr" ? "Créer la référence" : "Save Part SKU"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
