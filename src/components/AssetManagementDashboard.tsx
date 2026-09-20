import React, { useState, useEffect, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Users, 
  Building2, 
  Package, 
  AlertTriangle, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  SlidersHorizontal, 
  ChevronUp, 
  ChevronDown, 
  Save, 
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  MapPin,
  TrendingUp,
  Sliders,
  Download
} from "lucide-react";

// --- Types & Interfaces ---

export interface EquipeAsset {
  id: string;
  name: string;
  lead: string;
  membersCount: number;
  activeShift: number;
  role: string;
  compliance: number;
  status: "Active duty" | "Off duty" | "Unavailable" | "Astreinte active" | "En repos" | "Indisponible";
}

export interface BatimentAsset {
  id: string;
  name: string;
  location: string;
  targetTemp: number;
  consumptionMwh: number;
  pue: number;
  status: "Optimal" | "Maintenance Recommended" | "Overheating" | "Maintenance Recommandée" | "Surchauffe";
}

export interface StockAsset {
  id: string;
  name: string;
  quantity: number;
  capacity: number;
  location: string;
  status: "Optimal" | "Normal" | "Urgent Restock" | "Réapprovisionnement Urgent";
}

export interface AlerteAsset {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Normal" | "Low" | "Critique" | "Haute" | "Normale" | "Basse";
  assignedTeam: string;
  building: string;
  status: "New" | "In Progress" | "Resolved" | "Nouveau" | "En cours" | "Résolu";
  time: string;
}

export type AssetCategory = "equipe" | "batiment" | "stock" | "alerte";

interface AssetManagementDashboardProps {
  initialCategory?: AssetCategory;
  isDark?: boolean;
}

// --- Initial Mock Data (Default Fallbacks) ---

const DEFAULT_EQUIPES: EquipeAsset[] = [
  { id: "EQ-101", name: "Building Supervision & CAFM", lead: "Sylvain Dupont", membersCount: 14, activeShift: 12, compliance: 100, role: "Facility Ops", status: "Active duty" },
  { id: "EQ-102", name: "Stock & Inventory Management", lead: "Maxime Leroy", membersCount: 18, activeShift: 16, compliance: 98, role: "Logistics Lead", status: "Active duty" },
  { id: "EQ-103", name: "Telemetry & Edge Nodes", lead: "Amine Benali", membersCount: 8, activeShift: 8, compliance: 100, role: "Systems Arch", status: "Off duty" },
  { id: "EQ-104", name: "ZTNA Security & Compliance", lead: "Chloé Martin", membersCount: 6, activeShift: 5, compliance: 100, role: "Cyber Security", status: "Active duty" },
  { id: "EQ-105", name: "HVAC & Energy Maintenance", lead: "Roland Garros", membersCount: 10, activeShift: 4, compliance: 95, role: "HVAC Engineer", status: "Unavailable" }
];

const DEFAULT_BATIMENTS: BatimentAsset[] = [
  { id: "BAT-201", name: "Paris North Datacenter", location: "Paris, France", targetTemp: 21.2, consumptionMwh: 148.5, pue: 1.13, status: "Optimal" },
  { id: "BAT-202", name: "Lyon Tech Hub Campus", location: "Lyon, France", targetTemp: 20.8, consumptionMwh: 92.4, pue: 1.15, status: "Optimal" },
  { id: "BAT-203", name: "Marseille South Platform", location: "Marseille, France", targetTemp: 22.5, consumptionMwh: 112.1, pue: 1.18, status: "Maintenance Recommended" },
  { id: "BAT-204", name: "Frankfurt POP Cloud Node", location: "Frankfurt, Germany", targetTemp: 23.4, consumptionMwh: 210.8, pue: 1.22, status: "Overheating" },
  { id: "BAT-205", name: "Casablanca Tech Gateway", location: "Casablanca, Morocco", targetTemp: 21.0, consumptionMwh: 65.2, pue: 1.14, status: "Optimal" }
];

const DEFAULT_STOCKS: StockAsset[] = [
  { id: "SKU-PRO-01", name: "Electronic Components & Processors", quantity: 18420, capacity: 85, location: "Zone A, Aisle 3", status: "Optimal" },
  { id: "SKU-IOT-88", name: "IoT Sensors & Building Probes", quantity: 8250, capacity: 92, location: "Zone B, Cabinet 4", status: "Optimal" },
  { id: "SKU-NET-40", name: "Fiber Cabling & Server Racks", quantity: 12300, capacity: 64, location: "Zone C, Aisle 1", status: "Normal" },
  { id: "SKU-PWR-12", name: "UPS & Power Supply Modules", quantity: 3880, capacity: 42, location: "Zone D, Rack 12", status: "Urgent Restock" },
  { id: "SKU-CVC-55", name: "AHU Filters & AC Refills", quantity: 1450, capacity: 78, location: "Zone Facility, Aisle G", status: "Normal" }
];

const DEFAULT_ALERTES: AlerteAsset[] = [
  { id: "ALT-301", title: "Cold aisle thermal drift Rack 12", severity: "Critical", assignedTeam: "HVAC & Energy Maintenance", building: "Paris North Datacenter", status: "New", time: "14 min ago" },
  { id: "ALT-302", title: "Abnormal AHU Fan vibration Floor 5", severity: "High", assignedTeam: "HVAC & Energy Maintenance", building: "Lyon Tech Hub Campus", status: "In Progress", time: "32 min ago" },
  { id: "ALT-303", title: "Imminent stockout of HVAC modules", severity: "Normal", assignedTeam: "Stock & Inventory Management", building: "Marseille South Platform", status: "New", time: "1 hr ago" },
  { id: "ALT-304", title: "2N UPS battery pack replacement", severity: "High", assignedTeam: "Telemetry & Edge Nodes", building: "Paris North Datacenter", status: "Resolved", time: "2 hrs ago" },
  { id: "ALT-305", title: "CPU load spike detected K8s-Worker-04", severity: "Low", assignedTeam: "Telemetry & Edge Nodes", building: "Frankfurt POP Cloud Node", status: "In Progress", time: "3 hrs ago" }
];

export default function AssetManagementDashboard({
  initialCategory = "equipe",
  isDark = true
}: AssetManagementDashboardProps) {
  // --- Persistent State for Categories ---
  const [activeCategory, setActiveCategory] = useState<AssetCategory>(initialCategory);
  
  // Sync with prop when it changes
  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  const [equipes, setEquipes] = useState<EquipeAsset[]>(() => {
    try {
      const stored = localStorage.getItem("cafm_assets_equipes");
      return stored ? JSON.parse(stored) : DEFAULT_EQUIPES;
    } catch {
      return DEFAULT_EQUIPES;
    }
  });

  const [batiments, setBatiments] = useState<BatimentAsset[]>(() => {
    try {
      const stored = localStorage.getItem("cafm_assets_batiments");
      return stored ? JSON.parse(stored) : DEFAULT_BATIMENTS;
    } catch {
      return DEFAULT_BATIMENTS;
    }
  });

  const [stocks, setStocks] = useState<StockAsset[]>(() => {
    try {
      const stored = localStorage.getItem("cafm_assets_stocks");
      return stored ? JSON.parse(stored) : DEFAULT_STOCKS;
    } catch {
      return DEFAULT_STOCKS;
    }
  });

  const [alertes, setAlertes] = useState<AlerteAsset[]>(() => {
    try {
      const stored = localStorage.getItem("cafm_assets_alertes");
      return stored ? JSON.parse(stored) : DEFAULT_ALERTES;
    } catch {
      return DEFAULT_ALERTES;
    }
  });

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem("cafm_assets_equipes", JSON.stringify(equipes));
    } catch {}
  }, [equipes]);

  useEffect(() => {
    try {
      localStorage.setItem("cafm_assets_batiments", JSON.stringify(batiments));
    } catch {}
  }, [batiments]);

  useEffect(() => {
    try {
      localStorage.setItem("cafm_assets_stocks", JSON.stringify(stocks));
    } catch {}
  }, [stocks]);

  useEffect(() => {
    try {
      localStorage.setItem("cafm_assets_alertes", JSON.stringify(alertes));
    } catch {}
  }, [alertes]);

  // --- Filtering & Searching & Sorting State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // --- Inline Editing State ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  // --- Add Record Dialog State ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecordData, setNewRecordData] = useState<any>({});

  // --- Export Report Dropdown State ---
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Reset filtering/sorting when category changes
  useEffect(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortField("id");
    setSortDirection("asc");
    setEditingId(null);
  }, [activeCategory]);

  // --- Reset to Default Action ---
  const handleResetToDefaults = () => {
    if (window.confirm("Do you really want to reset all records in this category to default values?")) {
      if (activeCategory === "equipe") setEquipes(DEFAULT_EQUIPES);
      if (activeCategory === "batiment") setBatiments(DEFAULT_BATIMENTS);
      if (activeCategory === "stock") setStocks(DEFAULT_STOCKS);
      if (activeCategory === "alerte") setAlertes(DEFAULT_ALERTES);
      setEditingId(null);
    }
  };

  // --- Sorting Trigger ---
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // --- Delete Record Action ---
  const handleDelete = (id: string) => {
    if (window.confirm(`Confirm permanent deletion of item ${id}?`)) {
      if (activeCategory === "equipe") {
        setEquipes(prev => prev.filter(item => item.id !== id));
      } else if (activeCategory === "batiment") {
        setBatiments(prev => prev.filter(item => item.id !== id));
      } else if (activeCategory === "stock") {
        setStocks(prev => prev.filter(item => item.id !== id));
      } else if (activeCategory === "alerte") {
        setAlertes(prev => prev.filter(item => item.id !== id));
      }
      if (editingId === id) setEditingId(null);
    }
  };

  // --- Start Inline Edit ---
  const startEdit = (row: any) => {
    setEditingId(row.id);
    setEditData({ ...row });
  };

  // --- Save Inline Edit ---
  const saveEdit = () => {
    if (activeCategory === "equipe") {
      setEquipes(prev => prev.map(item => item.id === editingId ? { ...item, ...editData } : item));
    } else if (activeCategory === "batiment") {
      // Validate inputs
      const validatedData = {
        ...editData,
        targetTemp: parseFloat(editData.targetTemp) || 21.0,
        consumptionMwh: parseFloat(editData.consumptionMwh) || 100,
        pue: parseFloat(editData.pue) || 1.15
      };
      setBatiments(prev => prev.map(item => item.id === editingId ? { ...item, ...validatedData } : item));
    } else if (activeCategory === "stock") {
      const validatedData = {
        ...editData,
        quantity: parseInt(editData.quantity, 10) || 0,
        capacity: parseInt(editData.capacity, 10) || 0
      };
      setStocks(prev => prev.map(item => item.id === editingId ? { ...item, ...validatedData } : item));
    } else if (activeCategory === "alerte") {
      setAlertes(prev => prev.map(item => item.id === editingId ? { ...item, ...editData } : item));
    }
    setEditingId(null);
  };

  // --- Cancel Inline Edit ---
  const cancelEdit = () => {
    setEditingId(null);
  };

  // --- Open Add Record Modal ---
  const openAddModal = () => {
    // Generate fresh template/default ID
    let nextId = "";
    const randNum = Math.floor(100 + Math.random() * 900);
    
    if (activeCategory === "equipe") {
      nextId = `EQ-${randNum}`;
      setNewRecordData({
        id: nextId,
        name: "",
        lead: "",
        membersCount: 8,
        activeShift: 6,
        role: "Facility Ops",
        compliance: 100,
        status: "Active duty"
      });
    } else if (activeCategory === "batiment") {
      nextId = `BAT-${randNum}`;
      setNewRecordData({
        id: nextId,
        name: "",
        location: "",
        targetTemp: 21.0,
        consumptionMwh: 80.0,
        pue: 1.15,
        status: "Optimal"
      });
    } else if (activeCategory === "stock") {
      nextId = `SKU-NEW-${randNum}`;
      setNewRecordData({
        id: nextId,
        name: "",
        quantity: 1000,
        capacity: 50,
        location: "Zone A, Aisle 1",
        status: "Normal"
      });
    } else if (activeCategory === "alerte") {
      nextId = `ALT-${randNum}`;
      setNewRecordData({
        id: nextId,
        title: "",
        severity: "Normal",
        assignedTeam: "HVAC & Energy Maintenance",
        building: "Paris North Datacenter",
        status: "New",
        time: "Just now"
      });
    }
    setShowAddModal(true);
  };

  // --- Add Record Action ---
  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecordData.id || !newRecordData.name && !newRecordData.title) {
      alert("Please fill in the required fields (Name / Title and Reference).");
      return;
    }

    if (activeCategory === "equipe") {
      setEquipes(prev => [...prev, newRecordData as EquipeAsset]);
    } else if (activeCategory === "batiment") {
      setBatiments(prev => [...prev, {
        ...newRecordData,
        targetTemp: parseFloat(newRecordData.targetTemp) || 21.0,
        consumptionMwh: parseFloat(newRecordData.consumptionMwh) || 100.0,
        pue: parseFloat(newRecordData.pue) || 1.15
      } as BatimentAsset]);
    } else if (activeCategory === "stock") {
      setStocks(prev => [...prev, {
        ...newRecordData,
        quantity: parseInt(newRecordData.quantity, 10) || 0,
        capacity: parseInt(newRecordData.capacity, 10) || 0
      } as StockAsset]);
    } else if (activeCategory === "alerte") {
      setAlertes(prev => [...prev, newRecordData as AlerteAsset]);
    }

    setShowAddModal(false);
  };

  // --- Export View to CSV ---
  const handleExportCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM for Excel compatibility

    if (activeCategory === "equipe") {
      csvContent += "Reference,Name,Lead,Members,Active Shift,Role/Specialty,Compliance,Status\n";
      filteredAndSortedData.forEach((row: any) => {
        const csvRow = [
          `"${row.id}"`,
          `"${(row.name || "").replace(/"/g, '""')}"`,
          `"${(row.lead || "").replace(/"/g, '""')}"`,
          row.membersCount || 0,
          row.activeShift || 0,
          `"${(row.role || "").replace(/"/g, '""')}"`,
          `"${row.compliance || 0}%"`,
          `"${(row.status || "").replace(/"/g, '""')}"`
        ].join(",");
        csvContent += csvRow + "\n";
      });
    } else if (activeCategory === "batiment") {
      csvContent += "Reference,Name,Location,Target Temp (°C),Consumption (MWh),PUE,Status\n";
      filteredAndSortedData.forEach((row: any) => {
        const csvRow = [
          `"${row.id}"`,
          `"${(row.name || "").replace(/"/g, '""')}"`,
          `"${(row.location || "").replace(/"/g, '""')}"`,
          row.targetTemp || 21.0,
          row.consumptionMwh || 0,
          row.pue || 1.15,
          `"${(row.status || "").replace(/"/g, '""')}"`
        ].join(",");
        csvContent += csvRow + "\n";
      });
    } else if (activeCategory === "stock") {
      csvContent += "Reference,Name,Quantity,Capacity (%),Status,Location\n";
      filteredAndSortedData.forEach((row: any) => {
        const csvRow = [
          `"${row.id}"`,
          `"${(row.name || "").replace(/"/g, '""')}"`,
          row.quantity || 0,
          row.capacity || 0,
          `"${(row.status || "").replace(/"/g, '""')}"`,
          `"${(row.location || "").replace(/"/g, '""')}"`
        ].join(",");
        csvContent += csvRow + "\n";
      });
    } else if (activeCategory === "alerte") {
      csvContent += "Reference,Title,Severity,Assigned Team,Affected Building,Time,Status\n";
      filteredAndSortedData.forEach((row: any) => {
        const csvRow = [
          `"${row.id}"`,
          `"${(row.title || "").replace(/"/g, '""')}"`,
          `"${(row.severity || "").replace(/"/g, '""')}"`,
          `"${(row.assignedTeam || "").replace(/"/g, '""')}"`,
          `"${(row.building || "").replace(/"/g, '""')}"`,
          `"${(row.time || "").replace(/"/g, '""')}"`,
          `"${(row.status || "").replace(/"/g, '""')}"`
        ].join(",");
        csvContent += csvRow + "\n";
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `CAFM_Report_${activeCategory}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Export View to PDF ---
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    const now = new Date();
    const dateFormatted = now.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    // Brand Header Background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 297, 28, "F");

    // Brand Accent Line
    doc.setFillColor(243, 128, 32); // Brand Orange #F38020
    doc.rect(0, 27, 297, 1, "F");

    // Header text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("CAFM ASSET CONVERGENCE - COMPLIANCE REPORT", 14, 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225); // slate-300
    const catLabel = activeCategory === "equipe" ? "PERSONNEL & HR" :
                     activeCategory === "batiment" ? "BUILDING SUPERVISION" :
                     activeCategory === "stock" ? "LOGISTICS & INVENTORY" : "ACTIVE ALERTS & MAINTENANCE";
    
    doc.text(`EXPORTED CATEGORY: ${catLabel} | SYSTEM: SENSORIUM-OS`, 14, 17);
    doc.text(`Generated on: ${dateFormatted} | Sort order: by ${sortField} (${sortDirection === "asc" ? "ascending" : "descending"})`, 14, 22);

    let currentY = 38;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Operational Registry (${filteredAndSortedData.length} records displayed)`, 14, currentY);
    currentY += 4;

    // Build head & body data based on category
    let tableHead: string[][] = [];
    let tableBody: any[][] = [];

    if (activeCategory === "equipe") {
      tableHead = [["Ref ID", "Team Name", "Lead", "Members", "Active Shift", "Primary Role", "Compliance", "Status"]];
      tableBody = filteredAndSortedData.map((row: any) => [
        row.id,
        row.name,
        row.lead,
        `${row.membersCount} pers.`,
        `${row.activeShift} on shift`,
        row.role,
        `${row.compliance}%`,
        row.status
      ]);
    } else if (activeCategory === "batiment") {
      tableHead = [["Ref ID", "Building / Site Name", "Physical Location", "Target Temp", "Consumption MWh", "PUE", "Status"]];
      tableBody = filteredAndSortedData.map((row: any) => [
        row.id,
        row.name,
        row.location,
        `${row.targetTemp}°C`,
        `${row.consumptionMwh} MWh`,
        row.pue.toFixed(2),
        row.status
      ]);
    } else if (activeCategory === "stock") {
      tableHead = [["Ref ID", "Item Description", "Available Quantity", "Alert Capacity", "Reserve Status", "Storage Location"]];
      tableBody = filteredAndSortedData.map((row: any) => [
        row.id,
        row.name,
        `${row.quantity} units`,
        `${row.capacity}%`,
        row.status,
        row.location
      ]);
    } else if (activeCategory === "alerte") {
      tableHead = [["Ref ID", "Incident Description", "Severity", "Assigned Team", "Building / Site", "Triggered At", "Status"]];
      tableBody = filteredAndSortedData.map((row: any) => [
        row.id,
        row.title,
        row.severity,
        row.assignedTeam,
        row.building,
        row.time,
        row.status
      ]);
    }

    autoTable(doc, {
      startY: currentY,
      head: tableHead,
      body: tableBody,
      theme: "striped",
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2.8
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 }
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 194, 283, 194);

      doc.text("SENSORIUM-OS CONVERGENCE CONSOLE • OFFICIAL CAFM COMPLIANCE REGISTRY", 14, 199);
      doc.text(`Confidential Document • Page ${i} of ${pageCount}`, 283, 199, { align: "right" });
    }

    const dateStr = now.toISOString().split("T")[0];
    doc.save(`Sensorium_CAFM_${activeCategory}_${dateStr}.pdf`);
  };

  // --- Filter and Sort Datasets ---
  
  const currentDataset = useMemo(() => {
    if (activeCategory === "equipe") return equipes;
    if (activeCategory === "batiment") return batiments;
    if (activeCategory === "stock") return stocks;
    return alertes;
  }, [activeCategory, equipes, batiments, stocks, alertes]);

  const filteredAndSortedData = useMemo(() => {
    let result = [...currentDataset];

    // Search term matching (across any string value)
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(row => {
        return Object.values(row).some(val => 
          String(val).toLowerCase().includes(term)
        );
      });
    }

    // Status / Severity / Role filtering
    if (statusFilter !== "all") {
      result = result.filter(row => {
        if (activeCategory === "equipe") {
          return (row as EquipeAsset).status === statusFilter || (row as EquipeAsset).role === statusFilter;
        }
        if (activeCategory === "batiment") {
          return (row as BatimentAsset).status === statusFilter;
        }
        if (activeCategory === "stock") {
          return (row as StockAsset).status === statusFilter;
        }
        if (activeCategory === "alerte") {
          return (row as AlerteAsset).status === statusFilter || (row as AlerteAsset).severity === statusFilter;
        }
        return true;
      });
    }

    // Sorting logic
    result.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === undefined) return 1;
      if (valB === undefined) return -1;

      // Handle strings vs numbers comparison
      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc" 
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return sortDirection === "asc"
          ? (valA > valB ? 1 : -1)
          : (valB > valA ? 1 : -1);
      }
    });

    return result;
  }, [currentDataset, searchTerm, statusFilter, sortField, sortDirection, activeCategory]);

  // --- Compute KPIs/Stats from local state datasets ---
  const stats = useMemo(() => {
    const totalEquipes = equipes.length;
    const activeShiftTotal = equipes.reduce((sum, eq) => sum + eq.activeShift, 0);
    const avgCompliance = Math.round(equipes.reduce((sum, eq) => sum + eq.compliance, 0) / (totalEquipes || 1));

    const totalBatiments = batiments.length;
    const abnormalBatiments = batiments.filter(b => b.status !== "Optimal").length;
    const totalConsumption = Math.round(batiments.reduce((sum, b) => sum + b.consumptionMwh, 0));
    const systemAvgPue = Number((batiments.reduce((sum, b) => sum + b.pue, 0) / (totalBatiments || 1)).toFixed(2));

    const totalStockItems = stocks.reduce((sum, st) => sum + st.quantity, 0);
    const lowStockItems = stocks.filter(st => st.status === "Réapprovisionnement Urgent").length;

    const totalAlertes = alertes.filter(al => al.status !== "Résolu").length;
    const criticalAlertes = alertes.filter(al => al.severity === "Critique" && al.status !== "Résolu").length;

    return {
      totalEquipes,
      activeShiftTotal,
      avgCompliance,
      totalBatiments,
      abnormalBatiments,
      totalConsumption,
      systemAvgPue,
      totalStockItems,
      lowStockItems,
      totalAlertes,
      criticalAlertes
    };
  }, [equipes, batiments, stocks, alertes]);

  // --- Distinct Dropdown Options for Filter Panel ---
  const filterOptions = useMemo(() => {
    if (activeCategory === "equipe") {
      return {
        label: "Filter by Role/Status",
        options: [
          { value: "Active duty", label: "Active duty" },
          { value: "Off duty", label: "Off duty" },
          { value: "Unavailable", label: "Unavailable" },
          { value: "Facility Ops", label: "Facility Ops" },
          { value: "Logistics Lead", label: "Logistics Lead" },
          { value: "Systems Arch", label: "Systems Arch" },
          { value: "Cyber Security", label: "Cyber Security" }
        ]
      };
    }
    if (activeCategory === "batiment") {
      return {
        label: "Filter by Status",
        options: [
          { value: "Optimal", label: "Optimal" },
          { value: "Maintenance Recommended", label: "Maintenance" },
          { value: "Overheating", label: "Overheating" }
        ]
      };
    }
    if (activeCategory === "stock") {
      return {
        label: "Filter by Level",
        options: [
          { value: "Optimal", label: "Optimal" },
          { value: "Normal", label: "Normal" },
          { value: "Urgent Restock", label: "Urgent Restock" }
        ]
      };
    }
    return {
      label: "Filter by Severity/Status",
      options: [
        { value: "New", label: "New" },
        { value: "In Progress", label: "In Progress" },
        { value: "Resolved", label: "Resolved" },
        { value: "Critical", label: "Critical" },
        { value: "High", label: "High" },
        { value: "Normal", label: "Normal" },
        { value: "Low", label: "Low" }
      ]
    };
  }, [activeCategory]);

  return (
    <div className={`space-y-4 rounded-2xl p-4 sm:p-5 border transition-all ${
      isDark 
        ? "bg-[#0a0a0f] border-white/[0.08] text-neutral-100" 
        : "bg-white border-slate-200/80 text-slate-800"
    }`} id="asset-dashboard-root">
      
      {/* 1. Header & Internal Category Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-orange-500 font-bold">
              CAFM ASSET CONVERGENCE
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-tight">Asset Management Console</h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Interactive operations database with sorting, filtering, inline editing, and persistent updates.
          </p>
        </div>

        {/* Dynamic Inner Category Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 dark:bg-white/[0.02] p-1 rounded-xl border border-slate-200/50 dark:border-white/[0.06]">
          <button
            onClick={() => setActiveCategory("equipe")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === "equipe"
                ? "bg-white dark:bg-white/[0.08] shadow-sm text-slate-900 dark:text-white font-semibold"
                : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-orange-500" />
            <span>Personnel ({stats.totalEquipes})</span>
          </button>
          
          <button
            onClick={() => setActiveCategory("batiment")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === "batiment"
                ? "bg-white dark:bg-white/[0.08] shadow-sm text-slate-900 dark:text-white font-semibold"
                : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-orange-500" />
            <span>Buildings ({stats.totalBatiments})</span>
          </button>

          <button
            onClick={() => setActiveCategory("stock")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === "stock"
                ? "bg-white dark:bg-white/[0.08] shadow-sm text-slate-900 dark:text-white font-semibold"
                : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Package className="w-3.5 h-3.5 text-orange-500" />
            <span>Inventory ({stocks.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory("alerte")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === "alerte"
                ? "bg-white dark:bg-white/[0.08] shadow-sm text-slate-900 dark:text-white font-semibold"
                : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
            <span>Alerts ({stats.totalAlertes})</span>
          </button>
        </div>
      </div>

      {/* 2. Micro-KPI Ribbon depending on selected Category */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {activeCategory === "equipe" && (
          <>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200/50"}`}>
              <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500">Staff Members</div>
              <div className="text-xl font-bold font-mono mt-0.5">{equipes.reduce((acc, e) => acc + e.membersCount, 0)} <span className="text-xs font-normal text-slate-400">Total</span></div>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200/50"}`}>
              <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500">On Active Shift</div>
              <div className="text-xl font-bold font-mono text-orange-500 mt-0.5">{stats.activeShiftTotal} <span className="text-xs font-normal text-slate-400">technicians</span></div>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200/50"}`}>
              <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500">Average Compliance</div>
              <div className="text-xl font-bold font-mono text-emerald-500 mt-0.5">{stats.avgCompliance}%</div>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200/50"}`}>
              <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500">Active On-Call Units</div>
              <div className="text-xl font-bold font-mono mt-0.5">{equipes.filter(e => e.status === "Active duty" || e.status === "Astreinte active").length} teams</div>
            </div>
          </>
        )}

        {activeCategory === "batiment" && (
          <>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200/50"}`}>
              <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500">Infrastructure Sites</div>
              <div className="text-xl font-bold font-mono mt-0.5">{stats.totalBatiments} <span className="text-xs font-normal text-slate-400">Facilities</span></div>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200/50"}`}>
              <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500">Average Operational PUE</div>
              <div className="text-xl font-bold font-mono text-orange-500 mt-0.5">{stats.systemAvgPue} <span className="text-xs font-normal text-slate-400">target 1.15</span></div>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200/50"}`}>
              <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500">Total Consumption</div>
              <div className="text-xl font-bold font-mono text-emerald-500 mt-0.5">{stats.totalConsumption} <span className="text-xs font-normal text-slate-400">MWh</span></div>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200/50"}`}>
              <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500">Thermal/HVAC Alerts</div>
              <div className="text-xl font-bold font-mono mt-0.5 text-amber-500">{stats.abnormalBatiments} drifting</div>
            </div>
          </>
        )}

        {activeCategory === "stock" && (
          <>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200/50"}`}>
              <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500">Units in Inventory</div>
              <div className="text-xl font-bold font-mono mt-0.5">{(stats.totalStockItems).toLocaleString()} <span className="text-xs font-normal text-slate-400">u.</span></div>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200/50"}`}>
              <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500">Storage Capacity</div>
              <div className="text-xl font-bold font-mono text-orange-500 mt-0.5">72.2% <span className="text-xs font-normal text-slate-400">avg</span></div>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200/50"}`}>
              <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500">Hardware Categories</div>
              <div className="text-xl font-bold font-mono text-emerald-500 mt-0.5">{stocks.length}</div>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200/50"}`}>
              <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500">Below Critical Threshold</div>
              <div className="text-xl font-bold font-mono text-red-500 mt-0.5">{stats.lowStockItems} reorder</div>
            </div>
          </>
        )}

        {activeCategory === "alerte" && (
          <>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200/50"}`}>
              <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500">Active Incidents</div>
              <div className="text-xl font-bold font-mono mt-0.5 text-orange-500">{stats.totalAlertes} <span className="text-xs font-normal text-slate-400">open</span></div>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200/50"}`}>
              <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500">Critical Priority</div>
              <div className="text-xl font-bold font-mono text-red-500 mt-0.5">{stats.criticalAlertes} <span className="text-xs font-normal text-slate-400">P1 Red</span></div>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200/50"}`}>
              <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500">Resolved Incidents</div>
              <div className="text-xl font-bold font-mono text-emerald-500 mt-0.5">{alertes.filter(a => a.status === "Resolved" || a.status === "Résolu").length} <span className="text-xs font-normal text-slate-400">OK</span></div>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-200/50"}`}>
              <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-neutral-500">Mean SLA Resolution</div>
              <div className="text-xl font-bold font-mono mt-0.5">42 min</div>
            </div>
          </>
        )}
      </div>

      {/* 3. Filter & Control Panel */}
      <div className={`p-3 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
        isDark ? "bg-white/[0.02] border-white/10" : "bg-slate-50 border-slate-200/50"
      }`}>
        {/* Left Actions: Search & Filter dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={`Search in ${activeCategory}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Status Select Filter */}
          <div className="relative w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer appearance-none"
            >
              <option value="all">{filterOptions.label} (All)</option>
              {filterOptions.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <SlidersHorizontal className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Clear filters trigger */}
          {(searchTerm !== "" || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="text-xs text-orange-500 hover:text-orange-600 font-mono font-bold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {/* Right Actions: Add & Reset Data */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end relative">
          <button
            onClick={handleResetToDefaults}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 flex items-center gap-1 transition-colors font-mono cursor-pointer"
            title="Reset to default data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Defaults</span>
          </button>

          {/* Export Report Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-800 dark:text-neutral-200 border border-slate-300 dark:border-white/10 flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
              title="Export filtered data"
            >
              <Download className="w-3.5 h-3.5 text-orange-500" />
              <span>Export Report</span>
            </button>
            {showExportMenu && (
              <>
                {/* Overlay to close menu on outside click */}
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-1.5 w-48 rounded-lg bg-white dark:bg-[#101014] border border-slate-200 dark:border-white/10 shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-white/[0.05]">
                  <button
                    onClick={() => {
                      handleExportCSV();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-neutral-300 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Excel / CSV Format</span>
                  </button>
                  <button
                    onClick={() => {
                      handleExportPDF();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-neutral-300 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span>Compliance PDF Report</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={openAddModal}
            className="px-3 py-1.5 rounded-lg text-xs bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New...</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN DATA TABLE WITH SORTING & INLINE EDITING */}
      <div className="overflow-x-auto border border-slate-100 dark:border-white/[0.05] rounded-xl bg-slate-50/[0.3] dark:bg-[#07070a]/40">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="border-b border-slate-200 dark:border-white/[0.06] text-slate-400 dark:text-neutral-500 font-mono uppercase text-[10px] tracking-wider bg-slate-100/40 dark:bg-white/[0.01]">
            {activeCategory === "equipe" && (
              <tr>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("id")}>
                  Ref {sortField === "id" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("name")}>
                  Team {sortField === "name" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("lead")}>
                  Lead {sortField === "lead" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("membersCount")}>
                  Members {sortField === "membersCount" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("activeShift")}>
                  Active Shift {sortField === "activeShift" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("role")}>
                  Role {sortField === "role" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("compliance")}>
                  Compliance {sortField === "compliance" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("status")}>
                  Status / Duty {sortField === "status" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            )}

            {activeCategory === "batiment" && (
              <tr>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("id")}>
                  Site Ref {sortField === "id" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("name")}>
                  Building Name {sortField === "name" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("location")}>
                  Location {sortField === "location" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("targetTemp")}>
                  Target Temp {sortField === "targetTemp" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("consumptionMwh")}>
                  Cons. (MWh) {sortField === "consumptionMwh" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("pue")}>
                  PUE {sortField === "pue" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("status")}>
                  BMS Status {sortField === "status" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            )}

            {activeCategory === "stock" && (
              <tr>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("id")}>
                  SKU Code {sortField === "id" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("name")}>
                  Item / Description {sortField === "name" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("quantity")}>
                  Available Qty {sortField === "quantity" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("capacity")}>
                  Capacity (%) {sortField === "capacity" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("location")}>
                  Storage Zone {sortField === "location" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("status")}>
                  Level Alert {sortField === "status" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            )}

            {activeCategory === "alerte" && (
              <tr>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("id")}>
                  Alert ID {sortField === "id" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("title")}>
                  Alert Title {sortField === "title" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("severity")}>
                  Severity {sortField === "severity" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("assignedTeam")}>
                  Assigned Team {sortField === "assignedTeam" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("building")}>
                  Linked Site {sortField === "building" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("time")}>
                  Time {sortField === "time" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort("status")}>
                  CMMS Status {sortField === "status" && (sortDirection === "asc" ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-orange-500" /> : <ChevronDown className="inline w-3 h-3 ml-0.5 text-orange-500" />)}
                </th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {filteredAndSortedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400 dark:text-neutral-500 font-mono text-xs">
                  No records found matching criteria.
                </td>
              </tr>
            ) : (
              filteredAndSortedData.map((anyRow) => {
                const row = anyRow as any;
                const isEditing = editingId === row.id;

                return (
                  <tr 
                    key={row.id} 
                    className={`hover:bg-slate-100/50 dark:hover:bg-white/[0.015] transition-all ${
                      isEditing ? "bg-orange-500/[0.04] dark:bg-orange-500/[0.03]" : ""
                    }`}
                  >
                    
                    {/* === CATEGORY: PERSONNEL/EQUIPE === */}
                    {activeCategory === "equipe" && (
                      <>
                        {/* ID */}
                        <td className="p-3 font-mono font-medium text-slate-900 dark:text-white select-all">
                          {row.id}
                        </td>

                        {/* Name */}
                        <td className="p-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.name}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              className="w-full px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          ) : (
                            <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>
                          )}
                        </td>

                        {/* Lead */}
                        <td className="p-3 text-slate-700 dark:text-neutral-300">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.lead}
                              onChange={(e) => setEditData({ ...editData, lead: e.target.value })}
                              className="w-full px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          ) : (
                            row.lead
                          )}
                        </td>

                        {/* Members count */}
                        <td className="p-3 font-mono text-slate-600 dark:text-neutral-400">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editData.membersCount}
                              onChange={(e) => setEditData({ ...editData, membersCount: parseInt(e.target.value, 10) || 0 })}
                              className="w-16 px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          ) : (
                            row.membersCount
                          )}
                        </td>

                        {/* Active Shift */}
                        <td className="p-3 font-mono text-slate-600 dark:text-neutral-400">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editData.activeShift}
                              onChange={(e) => setEditData({ ...editData, activeShift: parseInt(e.target.value, 10) || 0 })}
                              className="w-16 px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          ) : (
                            row.activeShift
                          )}
                        </td>

                        {/* Role */}
                        <td className="p-3">
                          {isEditing ? (
                            <select
                              value={editData.role}
                              onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                              className="px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            >
                              <option value="Facility Ops">Facility Ops</option>
                              <option value="Logistics Lead">Logistics Lead</option>
                              <option value="Systems Arch">Systems Arch</option>
                              <option value="Cyber Security">Cyber Security</option>
                              <option value="HVAC Engineer">HVAC Engineer</option>
                            </select>
                          ) : (
                            <span className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-neutral-300 rounded border border-slate-200 dark:border-white/[0.08]">
                              {row.role}
                            </span>
                          )}
                        </td>

                        {/* Compliance */}
                        <td className="p-3">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editData.compliance}
                                onChange={(e) => setEditData({ ...editData, compliance: parseInt(e.target.value, 10) || 0 })}
                                className="w-16 px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                              />
                              <span className="text-[11px] font-mono">%</span>
                            </div>
                          ) : (
                            <span className={`font-mono font-bold ${row.compliance >= 98 ? "text-emerald-500" : "text-amber-500"}`}>
                              {row.compliance}%
                            </span>
                          )}
                        </td>

                        {/* Status Astreinte */}
                        <td className="p-3">
                          {isEditing ? (
                            <select
                              value={editData.status}
                              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                              className="px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            >
                              <option value="Active duty">Active duty</option>
                              <option value="Off duty">Off duty</option>
                              <option value="Unavailable">Unavailable</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              row.status === "Active duty" || row.status === "Astreinte active" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                              row.status === "Off duty" || row.status === "En repos" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                              "bg-red-500/10 text-red-500 border border-red-500/20"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                row.status === "Active duty" || row.status === "Astreinte active" ? "bg-emerald-500" :
                                row.status === "Off duty" || row.status === "En repos" ? "bg-blue-500" :
                                "bg-red-500"
                              }`} />
                              <span>{row.status}</span>
                            </span>
                          )}
                        </td>
                      </>
                    )}

                    {/* === CATEGORY: BATIMENT === */}
                    {activeCategory === "batiment" && (
                      <>
                        {/* ID */}
                        <td className="p-3 font-mono font-medium text-slate-900 dark:text-white">
                          {row.id}
                        </td>

                        {/* Name */}
                        <td className="p-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.name}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              className="w-full px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          ) : (
                            <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>
                          )}
                        </td>

                        {/* Location */}
                        <td className="p-3 text-slate-700 dark:text-neutral-300">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.location}
                              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                              className="w-full px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{row.location}</span>
                            </span>
                          )}
                        </td>

                        {/* Target Temp */}
                        <td className="p-3 font-mono text-slate-600 dark:text-neutral-400">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.1"
                              value={editData.targetTemp}
                              onChange={(e) => setEditData({ ...editData, targetTemp: e.target.value })}
                              className="w-20 px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          ) : (
                            `${row.targetTemp} °C`
                          )}
                        </td>

                        {/* Consumption */}
                        <td className="p-3 font-mono text-slate-600 dark:text-neutral-400">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.1"
                              value={editData.consumptionMwh}
                              onChange={(e) => setEditData({ ...editData, consumptionMwh: e.target.value })}
                              className="w-20 px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          ) : (
                            `${row.consumptionMwh} MWh`
                          )}
                        </td>

                        {/* PUE */}
                        <td className="p-3">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editData.pue}
                              onChange={(e) => setEditData({ ...editData, pue: e.target.value })}
                              className="w-16 px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          ) : (
                            <span className={`font-mono font-bold ${row.pue <= 1.15 ? "text-emerald-500" : row.pue <= 1.2 ? "text-amber-500" : "text-red-500"}`}>
                              {row.pue}
                            </span>
                          )}
                        </td>

                        {/* Status GTB */}
                        <td className="p-3">
                          {isEditing ? (
                            <select
                              value={editData.status}
                              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                              className="px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            >
                              <option value="Optimal">Optimal</option>
                              <option value="Maintenance Recommended">Maintenance Recommended</option>
                              <option value="Overheating">Overheating</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              row.status === "Optimal" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                              row.status === "Maintenance Recommended" || row.status === "Maintenance Recommandée" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                              "bg-red-500/10 text-red-500 border border-red-500/20"
                            }`}>
                              {row.status === "Optimal" && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                              {(row.status === "Maintenance Recommended" || row.status === "Maintenance Recommandée") && <Clock className="w-3 h-3 text-amber-500" />}
                              {(row.status === "Overheating" || row.status === "Surchauffe") && <AlertTriangle className="w-3 h-3 text-red-500" />}
                              <span>{row.status}</span>
                            </span>
                          )}
                        </td>
                      </>
                    )}

                    {/* === CATEGORY: STOCK === */}
                    {activeCategory === "stock" && (
                      <>
                        {/* SKU ID */}
                        <td className="p-3 font-mono font-medium text-slate-900 dark:text-white">
                          {row.id}
                        </td>

                        {/* Name */}
                        <td className="p-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.name}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              className="w-full px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          ) : (
                            <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>
                          )}
                        </td>

                        {/* Quantity */}
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editData.quantity}
                              onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
                              className="w-24 px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          ) : (
                            `${(row.quantity ?? 0).toLocaleString()} u.`
                          )}
                        </td>

                        {/* Capacity Percentage */}
                        <td className="p-3">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editData.capacity}
                                onChange={(e) => setEditData({ ...editData, capacity: e.target.value })}
                                className="w-16 px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                              />
                              <span className="text-[11px] font-mono">%</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 max-w-[120px]">
                              <span className="font-mono text-[11px] font-semibold w-8">{row.capacity}%</span>
                              <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.06] overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    row.capacity > 80 ? 'bg-orange-500' :
                                    row.capacity > 50 ? 'bg-emerald-500' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${row.capacity}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Location */}
                        <td className="p-3 text-slate-700 dark:text-neutral-300 font-mono">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.location}
                              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                              className="w-full px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          ) : (
                            row.location
                          )}
                        </td>

                        {/* Status (Stock Alert Level) */}
                        <td className="p-3">
                          {isEditing ? (
                            <select
                              value={editData.status}
                              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                              className="px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            >
                              <option value="Optimal">Optimal</option>
                              <option value="Normal">Normal</option>
                              <option value="Urgent Restock">Urgent Restock</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              row.status === "Optimal" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                              row.status === "Normal" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                              "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse"
                            }`}>
                              <span>{row.status}</span>
                            </span>
                          )}
                        </td>
                      </>
                    )}

                    {/* === CATEGORY: ALERTE === */}
                    {activeCategory === "alerte" && (
                      <>
                        {/* ID */}
                        <td className="p-3 font-mono font-medium text-slate-900 dark:text-white">
                          {row.id}
                        </td>

                        {/* Title */}
                        <td className="p-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.title}
                              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                              className="w-full px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          ) : (
                            <span className="font-semibold text-slate-900 dark:text-white">{row.title}</span>
                          )}
                        </td>

                        {/* Severity */}
                        <td className="p-3">
                          {isEditing ? (
                            <select
                              value={editData.severity}
                              onChange={(e) => setEditData({ ...editData, severity: e.target.value })}
                              className="px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            >
                              <option value="Critical">Critical</option>
                              <option value="High">High</option>
                              <option value="Normal">Normal</option>
                              <option value="Low">Low</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              row.severity === "Critical" || row.severity === "Critique" ? "bg-red-500/15 text-red-500 border border-red-500/20" :
                              row.severity === "High" || row.severity === "Haute" ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" :
                              row.severity === "Normal" || row.severity === "Normale" ? "bg-blue-500/15 text-blue-400 border border-blue-500/20" :
                              "bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-white/[0.08]"
                            }`}>
                              {row.severity}
                            </span>
                          )}
                        </td>

                        {/* Assigned Team */}
                        <td className="p-3 text-slate-700 dark:text-neutral-300">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.assignedTeam}
                              onChange={(e) => setEditData({ ...editData, assignedTeam: e.target.value })}
                              className="w-full px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          ) : (
                            row.assignedTeam
                          )}
                        </td>

                        {/* Building */}
                        <td className="p-3 text-slate-600 dark:text-neutral-400">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.building}
                              onChange={(e) => setEditData({ ...editData, building: e.target.value })}
                              className="w-full px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          ) : (
                            row.building
                          )}
                        </td>

                        {/* Time */}
                        <td className="p-3 font-mono text-[11px] text-slate-400 dark:text-neutral-500">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.time}
                              onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                              className="w-full px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            />
                          ) : (
                            row.time
                          )}
                        </td>

                        {/* Status (Alerte Status) */}
                        <td className="p-3">
                          {isEditing ? (
                            <select
                              value={editData.status}
                              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                              className="px-2 py-1 text-xs bg-slate-100 dark:bg-black border border-slate-300 dark:border-white/10 rounded focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                            >
                              <option value="New">New</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                              row.status === 'Resolved' || row.status === 'Résolu' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                              row.status === 'In Progress' || row.status === 'En cours' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                              'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                              {(row.status === 'Resolved' || row.status === 'Résolu') && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                              {(row.status === 'In Progress' || row.status === 'En cours') && <Clock className="w-3 h-3 animate-spin text-blue-500" style={{ animationDuration: '4s' }} />}
                              {(row.status === 'New' || row.status === 'Nouveau') && <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />}
                              <span>{row.status}</span>
                            </span>
                          )}
                        </td>
                      </>
                    )}

                    {/* ACTIONS CELL */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isEditing ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="p-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-500 transition-colors cursor-pointer"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 rounded bg-slate-500/15 hover:bg-slate-500/25 text-slate-400 transition-colors cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(row)}
                              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-neutral-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all cursor-pointer"
                              title="Edit record"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(row.id)}
                              className="p-1 rounded hover:bg-red-500/10 text-slate-500 dark:text-neutral-400 hover:text-red-500 transition-all cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. ADD RECORD DIALOG MODAL OVERLAY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl transition-all ${
            isDark ? "bg-[#0d0d14] border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
          }`}>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/[0.08]">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-500" />
                <span>New Record ({activeCategory.toUpperCase()})</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-4 pt-4 text-xs">
              
              {/* Common Reference Field */}
              <div>
                <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">ID / Reference (Unique)</label>
                <input
                  type="text"
                  required
                  value={newRecordData.id || ""}
                  onChange={(e) => setNewRecordData({ ...newRecordData, id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Equipe Fields */}
              {activeCategory === "equipe" && (
                <>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Team Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Electrical Engineering South"
                      value={newRecordData.name || ""}
                      onChange={(e) => setNewRecordData({ ...newRecordData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Team Lead</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={newRecordData.lead || ""}
                        onChange={(e) => setNewRecordData({ ...newRecordData, lead: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Role</label>
                      <select
                        value={newRecordData.role || "Facility Ops"}
                        onChange={(e) => setNewRecordData({ ...newRecordData, role: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="Facility Ops">Facility Ops</option>
                        <option value="Logistics Lead">Logistics Lead</option>
                        <option value="Systems Arch">Systems Arch</option>
                        <option value="Cyber Security">Cyber Security</option>
                        <option value="HVAC Engineer">HVAC Engineer</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Members</label>
                      <input
                        type="number"
                        min="1"
                        value={newRecordData.membersCount || 1}
                        onChange={(e) => setNewRecordData({ ...newRecordData, membersCount: parseInt(e.target.value, 10) || 1 })}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Active Shift</label>
                      <input
                        type="number"
                        min="0"
                        value={newRecordData.activeShift || 0}
                        onChange={(e) => setNewRecordData({ ...newRecordData, activeShift: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Compliance (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newRecordData.compliance || 100}
                        onChange={(e) => setNewRecordData({ ...newRecordData, compliance: parseInt(e.target.value, 10) || 100 })}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Duty Status</label>
                    <select
                      value={newRecordData.status || "Active duty"}
                      onChange={(e) => setNewRecordData({ ...newRecordData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Active duty">Active duty</option>
                      <option value="Off duty">Off duty</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  </div>
                </>
              )}

              {/* Batiment Fields */}
              {activeCategory === "batiment" && (
                <>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Building / Facility Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Datacenter POP Marseille"
                      value={newRecordData.name || ""}
                      onChange={(e) => setNewRecordData({ ...newRecordData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Location (City, Country)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Marseille, France"
                      value={newRecordData.location || ""}
                      onChange={(e) => setNewRecordData({ ...newRecordData, location: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Target Temp (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newRecordData.targetTemp || 21.0}
                        onChange={(e) => setNewRecordData({ ...newRecordData, targetTemp: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Cons. (MWh)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newRecordData.consumptionMwh || 50.0}
                        onChange={(e) => setNewRecordData({ ...newRecordData, consumptionMwh: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">PUE</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newRecordData.pue || 1.15}
                        onChange={(e) => setNewRecordData({ ...newRecordData, pue: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">BMS Operating State</label>
                    <select
                      value={newRecordData.status || "Optimal"}
                      onChange={(e) => setNewRecordData({ ...newRecordData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Optimal">Optimal</option>
                      <option value="Maintenance Recommended">Maintenance Recommended</option>
                      <option value="Overheating">Overheating</option>
                    </select>
                  </div>
                </>
              )}

              {/* Stock Fields */}
              {activeCategory === "stock" && (
                <>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Hardware / Item Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Liquid Coolant Flow Sensors"
                      value={newRecordData.name || ""}
                      onChange={(e) => setNewRecordData({ ...newRecordData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Initial Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={newRecordData.quantity || 100}
                        onChange={(e) => setNewRecordData({ ...newRecordData, quantity: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Storage Capacity (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newRecordData.capacity || 50}
                        onChange={(e) => setNewRecordData({ ...newRecordData, capacity: parseInt(e.target.value, 10) || 50 })}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Storage Zone / Aisle</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Zone B, Aisle 5"
                      value={newRecordData.location || ""}
                      onChange={(e) => setNewRecordData({ ...newRecordData, location: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Inventory Level Alert</label>
                    <select
                      value={newRecordData.status || "Normal"}
                      onChange={(e) => setNewRecordData({ ...newRecordData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Optimal">Optimal</option>
                      <option value="Normal">Normal</option>
                      <option value="Urgent Restock">Urgent Restock</option>
                    </select>
                  </div>
                </>
              )}

              {/* Alerte Fields */}
              {activeCategory === "alerte" && (
                <>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Alert / Incident Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Power drop on Inverter A-12"
                      value={newRecordData.title || ""}
                      onChange={(e) => setNewRecordData({ ...newRecordData, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Severity</label>
                      <select
                        value={newRecordData.severity || "Normal"}
                        onChange={(e) => setNewRecordData({ ...newRecordData, severity: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Normal">Normal</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">CMMS Status</label>
                      <select
                        value={newRecordData.status || "New"}
                        onChange={(e) => setNewRecordData({ ...newRecordData, status: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Assigned Team</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. HVAC Maintenance"
                        value={newRecordData.assignedTeam || ""}
                        onChange={(e) => setNewRecordData({ ...newRecordData, assignedTeam: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 dark:text-neutral-500 mb-1">Linked Facility</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Datacenter Paris North"
                        value={newRecordData.building || ""}
                        onChange={(e) => setNewRecordData({ ...newRecordData, building: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg font-medium bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-neutral-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors cursor-pointer"
                >
                  Create Record
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
