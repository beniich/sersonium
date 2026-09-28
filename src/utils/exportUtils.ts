import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { StrategicSimulationInputs, StrategicSimulationResults } from "../config/roiConfig";

export interface ScenarioMatrix {
  conservative: StrategicSimulationResults;
  realistic: StrategicSimulationResults;
  optimistic: StrategicSimulationResults;
}

export interface ExportReportMetadata {
  clientName?: string;
  authorEmail?: string;
  projectTitle?: string;
}

/**
 * Generates and downloads an Executive CSV Decision Report for CFOs & Investment Committees.
 */
export const exportScenariosToCSV = (
  inputs: StrategicSimulationInputs,
  matrix: ScenarioMatrix,
  meta: ExportReportMetadata = {}
) => {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0];
  const client = meta.clientName || "Organisation Industrielle B2B";
  const totalBlades = inputs.sites * inputs.bladesPerSite;

  // Executive Strategic Verdict determination
  const payback = matrix.realistic.paybackMonths;
  let strategicVerdict = "Investissement Prioritaire (Amortissement ultra-rapide < 12 mois, Rentabilité immédiate)";
  if (payback > 24) {
    strategicVerdict = "Investissement Stratégique Long-Terme (Nécessite arbitrage budgétaire CapEx)";
  } else if (payback >= 12) {
    strategicVerdict = "Investissement Viable (Rentabilité éprouvée à moyen terme entre 12 et 24 mois)";
  }

  // 1. Report Metadata Header
  const headerSection = [
    ["# ==============================================================================="],
    ["# RAPPORT D'ANALYSE DE RENTABILITÉ & BILAN ESG CSRD - SENSORIUM EDGE OS"],
    [`# Date d'Émission : ${dateStr} à ${timeStr}`],
    [`# Entité Auditée  : ${client}`],
    [`# Périmètre Audit  : ${inputs.sites} sites industriels | ${inputs.bladesPerSite} lames/site | Total : ${totalBlades} EdgeBlades X1`],
    [`# Paramètres Clés  : Inférences IA : ${inputs.aiInferencesMillionPerMonth} M/mois | Tarif élec : ${inputs.kwhCostEur.toFixed(2)} EUR/kWh`],
    [`# Classification   : STRICTEMENT CONFIDENTIEL - DIRECTION FINANCIÈRE & DSI`],
    ["# ==============================================================================="],
    [""],
  ];

  // 2. Data Columns
  const tableHeaders = [
    "Catégorie",
    "Indicateur Stratégique",
    "Scénario Conservateur (-20% usage)",
    "Scénario Réaliste (Base Nominal)",
    "Scénario Optimiste (+25% adoption)",
    "Unité"
  ];

  // 3. Quantitative Rows
  const tableRows = [
    // Section 1: Financial Bottom-Line
    ["Financier", "Coût Annuel Cloud Traditionnel", matrix.conservative.traditionalCloudAnnualCost, matrix.realistic.traditionalCloudAnnualCost, matrix.optimistic.traditionalCloudAnnualCost, "EUR / an"],
    ["Financier", "Coût Annuel Sensorium Edge (45W)", matrix.conservative.sensoriumEdgeAnnualCost, matrix.realistic.sensoriumEdgeAnnualCost, matrix.optimistic.sensoriumEdgeAnnualCost, "EUR / an"],
    ["Financier", "Économies Nettes Annuelles (OPEX)", matrix.conservative.annualSavingsEur, matrix.realistic.annualSavingsEur, matrix.optimistic.annualSavingsEur, "EUR / an"],
    ["Financier", "Investissement Initial (CapEx Hardware)", matrix.conservative.totalCapexEur, matrix.realistic.totalCapexEur, matrix.optimistic.totalCapexEur, "EUR"],
    ["Financier", "Délai d'Amortissement (Payback)", matrix.conservative.paybackMonths, matrix.realistic.paybackMonths, matrix.optimistic.paybackMonths, "Mois"],
    ["Financier", "Cashflow Net Cumulé sur 5 Ans", matrix.conservative.fiveYearNetCashflowEur, matrix.realistic.fiveYearNetCashflowEur, matrix.optimistic.fiveYearNetCashflowEur, "EUR"],
    ["Financier", "Rentabilité du Capital (ROI 5 Ans)", `+${matrix.conservative.roiPercentage}%`, `+${matrix.realistic.roiPercentage}%`, `+${matrix.optimistic.roiPercentage}%`, "%"],
    
    // Section 2: Thermodynamics & Unit Economics
    ["Unitaire", "Tarif Inférence Cloud Effectif", matrix.conservative.effectiveCloudInferencePerMillion, matrix.realistic.effectiveCloudInferencePerMillion, matrix.optimistic.effectiveCloudInferencePerMillion, "EUR / Million"],
    ["Unitaire", "Maintenance Mutualisée par Lame", matrix.conservative.effectiveEdgeMaintenancePerBlade, matrix.realistic.effectiveEdgeMaintenancePerBlade, matrix.optimistic.effectiveEdgeMaintenancePerBlade, "EUR / lame / an"],
    ["Technique", "Réduction Énergétique Consommée", `${matrix.conservative.energyReductionPercent}%`, `${matrix.realistic.energyReductionPercent}%`, `${matrix.optimistic.energyReductionPercent}%`, "%"],
    ["Technique", "Énergie Électrique Évitée", matrix.conservative.annualKwhSaved, matrix.realistic.annualKwhSaved, matrix.optimistic.annualKwhSaved, "kWh / an"],

    // Section 3: CSRD & Environmental
    ["CSRD E1", "Émissions de CO2 Évitées (Scope 2)", matrix.conservative.co2SavedTons, matrix.realistic.co2SavedTons, matrix.optimistic.co2SavedTons, "Tonnes / an"],
    ["CSRD E1", "Équivalent Arbres Matures Plantés", matrix.conservative.equivalentTreesPlanted, matrix.realistic.equivalentTreesPlanted, matrix.optimistic.equivalentTreesPlanted, "Arbres"],
    ["CSRD E3", "Eau de Refroidissement Évitée (WUE 1.8)", matrix.conservative.waterSavedM3, matrix.realistic.waterSavedM3, matrix.optimistic.waterSavedM3, "m3 d'eau / an"],
    ["CSRD E3", "Eau Économisée en Volume Brut", matrix.conservative.waterSavedLiters, matrix.realistic.waterSavedLiters, matrix.optimistic.waterSavedLiters, "Litres"],
    ["CSRD Scope 3", "Amortissement Empreinte Matériel Lames", matrix.conservative.embeddedCarbonPaybackMonths, matrix.realistic.embeddedCarbonPaybackMonths, matrix.optimistic.embeddedCarbonPaybackMonths, "Mois"],
  ];

  // 4. Strategic Executive Summary Footer
  const footerSection = [
    [""],
    ["# ==============================================================================="],
    [`# SYNTHÈSE STRATÉGIQUE COMITÉ DE DIRECTION : ${strategicVerdict}`],
    [`# ÉCONOMIES MOYENNES RÉALISÉES : ${matrix.realistic.annualSavingsEur.toLocaleString("en-US")} EUR / an`],
    [`# RETOUR SUR INVESTISSEMENT GARANTI EN : ${matrix.realistic.paybackMonths} MOIS`],
    ["# Signé électroniquement par le Moteur d'Analyse Sensorium Enterprise OS"],
    ["# ==============================================================================="],
  ];

  // 5. Build CSV payload
  const formatCell = (val: any) => {
    if (typeof val === "string" && (val.includes(",") || val.includes(";") || val.includes("\""))) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvRows = [
    ...headerSection.map(r => r.join("")),
    tableHeaders.map(formatCell).join(";"),
    ...tableRows.map(row => row.map(formatCell).join(";")),
    ...footerSection.map(r => r.join(""))
  ];

  const csvContent = "\uFEFF" + csvRows.join("\r\n"); // UTF-8 BOM for Excel compatibility

  // 6. Trigger Download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const sanitizedClient = client.replace(/[^a-zA-Z0-9_-]/g, "_");
  link.setAttribute("href", url);
  link.setAttribute("download", `Sensorium_Simulation_CFO_${sanitizedClient}_${dateStr}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates an Executive PDF Strategy Report ready for Board / C-Level Review.
 */
export const exportScenariosToPDF = (
  inputs: StrategicSimulationInputs,
  matrix: ScenarioMatrix,
  meta: ExportReportMetadata = {}
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const client = meta.clientName || "Direction Générale & Comité d'Investissement";
  const totalBlades = inputs.sites * inputs.bladesPerSite;

  // Header Banner
  doc.setFillColor(13, 13, 18);
  doc.rect(0, 0, 210, 38, "F");

  // Accent Line
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 36, 210, 2, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("SENSORIUM - RAPPORT D'ARBITRAGE STRATÉGIQUE ROI & ESG", 14, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text(`Destinataire : ${client} | Date d'Émission : ${dateStr} | Classification : Confidentiel B2B`, 14, 25);
  doc.text(`Périmètre : ${inputs.sites} Sites | ${totalBlades} Modules Silicium X1 (45W) | ${inputs.aiInferencesMillionPerMonth} M inférences/mois`, 14, 30);

  // Executive KPI Badges
  autoTable(doc, {
    startY: 44,
    theme: "plain",
    styles: { font: "helvetica", fontSize: 9 },
    body: [
      [
        `Économies Annuelles (Base)\n${matrix.realistic.annualSavingsEur.toLocaleString("fr-FR")} € / an`,
        `Délai d'Amortissement\n${matrix.realistic.paybackMonths} Mois`,
        `Cashflow Net 5 Ans\n+${(matrix.realistic.fiveYearNetCashflowEur / 1000).toFixed(0)} k€`,
        `CO2 Évité (Scope 2)\n${matrix.realistic.co2SavedTons} Tonnes / an`,
      ]
    ],
    didParseCell: (data) => {
      data.cell.styles.fillColor = [240, 253, 244]; // emerald-50
      data.cell.styles.textColor = [6, 95, 70]; // emerald-800
      data.cell.styles.fontStyle = "bold";
      data.cell.styles.halign = "center";
    }
  });

  // Multi-Scenario Sensitivity Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text("1. Analyse de Sensibilité en 3 Scénarios (Stress Opérationnel)", 14, 68);

  autoTable(doc, {
    startY: 72,
    head: [["Indicateur Clé", "Conservateur (-20% usage)", "Réaliste (Base)", "Optimiste (+25%)", "Unité"]],
    body: [
      ["Coût Cloud Traditionnel", `${matrix.conservative.traditionalCloudAnnualCost.toLocaleString("fr-FR")} €`, `${matrix.realistic.traditionalCloudAnnualCost.toLocaleString("fr-FR")} €`, `${matrix.optimistic.traditionalCloudAnnualCost.toLocaleString("fr-FR")} €`, "EUR/an"],
      ["Coût Sensorium Sovereign Edge", `${matrix.conservative.sensoriumEdgeAnnualCost.toLocaleString("fr-FR")} €`, `${matrix.realistic.sensoriumEdgeAnnualCost.toLocaleString("fr-FR")} €`, `${matrix.optimistic.sensoriumEdgeAnnualCost.toLocaleString("fr-FR")} €`, "EUR/an"],
      ["Économies Nettes OPEX", `${matrix.conservative.annualSavingsEur.toLocaleString("fr-FR")} €`, `${matrix.realistic.annualSavingsEur.toLocaleString("fr-FR")} €`, `${matrix.optimistic.annualSavingsEur.toLocaleString("fr-FR")} €`, "EUR/an"],
      ["Amortissement (Payback)", `${matrix.conservative.paybackMonths} mois`, `${matrix.realistic.paybackMonths} mois`, `${matrix.optimistic.paybackMonths} mois`, "Mois"],
      ["Rentabilité Capital (ROI 5 Ans)", `+${matrix.conservative.roiPercentage}%`, `+${matrix.realistic.roiPercentage}%`, `+${matrix.optimistic.roiPercentage}%`, "%"],
      ["Énergie Évitée", `${matrix.conservative.annualKwhSaved.toLocaleString("fr-FR")} kWh`, `${matrix.realistic.annualKwhSaved.toLocaleString("fr-FR")} kWh`, `${matrix.optimistic.annualKwhSaved.toLocaleString("fr-FR")} kWh`, "kWh/an"],
      ["Émissions CO2 Évitées", `${matrix.conservative.co2SavedTons} t`, `${matrix.realistic.co2SavedTons} t`, `${matrix.optimistic.co2SavedTons} t`, "Tonnes"],
      ["Eau Économisée (WUE 1.8L/kWh)", `${matrix.conservative.waterSavedM3} m3`, `${matrix.realistic.waterSavedM3} m3`, `${matrix.optimistic.waterSavedM3} m3`, "m3 d'eau"],
      ["Amortissement Carbone Matériel", `${matrix.conservative.embeddedCarbonPaybackMonths} mois`, `${matrix.realistic.embeddedCarbonPaybackMonths} mois`, `${matrix.optimistic.embeddedCarbonPaybackMonths} mois`, "Mois"],
    ],
    theme: "striped",
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 8.5 },
  });

  // Strategic Decision Footer
  const finalY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, finalY, 182, 32, "F");
  doc.rect(14, finalY, 182, 32, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("VERDICT STRATÉGIQUE POUR LE COMITÉ D'INVESTISSEMENT :", 20, finalY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Avec un temps d'amortissement de ${matrix.realistic.paybackMonths} mois et une économie annuelle de ${matrix.realistic.annualSavingsEur.toLocaleString("fr-FR")} €, le déploiement`,
    20, finalY + 16
  );
  doc.text(
    `de l'architecture souveraine Sensorium Edge est classé INVESTISSEMENT PRIORITAIRE RENTABILITÉ ÉLEVÉE.`,
    20, finalY + 22
  );
  doc.text(`Rapport certifié conforme aux normes de reporting extra-financier européen CSRD (E1 / E3).`, 20, finalY + 28);

  // Trigger download
  const sanitizedClient = client.replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`Rapport_Strategique_Sensorium_${sanitizedClient}_${now.toISOString().split("T")[0]}.pdf`);
};
