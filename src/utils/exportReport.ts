/**
 * @file exportReport.ts
 * @description FEAT-07 — Utilitaire d'export de rapports CSV / JSON pour les pages
 * Infrastructure, Security, Storage, etc.
 */

export type ExportFormat = "csv" | "json";

export interface ExportColumn<T> {
  key: keyof T | string;
  label: string;
  formatter?: (value: any, row: T) => string;
}

/**
 * Génère et télécharge un fichier CSV à partir d'un tableau de données.
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  if (!data.length) return;

  const header = columns.map((c) => `"${c.label}"`).join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const raw = row[col.key as keyof T];
        const val = col.formatter ? col.formatter(raw, row) : String(raw ?? "");
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csvContent = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${sanitizeFilename(filename)}.csv`);
}

/**
 * Génère et télécharge un fichier JSON formaté.
 */
export function exportToJSON<T>(
  data: T,
  filename: string
): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  triggerDownload(blob, `${sanitizeFilename(filename)}.json`);
}

/**
 * Génère un rapport texte structuré (pseudo-PDF en texte brut pour le démo).
 * Pour une vraie génération PDF, intégrer une lib comme `jsPDF`.
 */
export function exportToTextReport(
  title: string,
  sections: { heading: string; lines: string[] }[],
  filename: string
): void {
  const now = new Date().toLocaleString("fr-FR");
  const separator = "═".repeat(60);
  const lines = [
    separator,
    `  SENSORIUM — ${title.toUpperCase()}`,
    `  Généré le : ${now}`,
    separator,
    "",
  ];

  for (const section of sections) {
    lines.push(`▸ ${section.heading}`);
    lines.push("─".repeat(40));
    section.lines.forEach((l) => lines.push(`  ${l}`));
    lines.push("");
  }

  lines.push(separator);
  lines.push("  SENSORIUM — Sovereign Sensory Intelligence & Edge AI Platform");
  lines.push(separator);

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8;" });
  triggerDownload(blob, `${sanitizeFilename(filename)}.txt`);
}

/** Déclenche le téléchargement d'un Blob dans le navigateur */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\.]/g, "_").replace(/_+/g, "_");
}

/**
 * Helper : génère un nom de fichier avec timestamp.
 * Exemple : "sensorium_infrastructure_2024-11-02_15h30"
 */
export function timestampedFilename(prefix: string): string {
  const now = new Date();
  const d = now.toISOString().slice(0, 10);
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `sensorium_${prefix}_${d}_${h}h${m}`;
}

/**
 * Bouton d'export réutilisable — JSX helper
 */
export interface ExportButtonConfig {
  label?: string;
  filename: string;
  getData: () => Record<string, any>[];
  columns?: ExportColumn<any>[];
  format?: ExportFormat;
  onExported?: () => void;
}
