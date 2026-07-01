import { Business } from "./types";

// ============================================================
// EXPORT CSV (pur JS, zéro dépendance)
// ============================================================

export function exportToCSV(businesses: Business[], filename: string): void {
  const headers = [
    "Nom",
    "Téléphone",
    "Adresse",
    "Site Web",
    "Note",
    "Nb Avis",
    "Catégorie",
  ];

  const rows = businesses.map((b) => [
    b.name,
    b.phone ?? "",
    b.address ?? "",
    b.website ?? "",
    b.rating?.toString() ?? "",
    b.reviewCount?.toString() ?? "",
    b.category,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
    )
    .join("\n");

  // BOM UTF-8 pour Excel (caractères accentués)
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  downloadBlob(blob, `${filename}.csv`);
}

// ============================================================
// EXPORT EXCEL via xlsx (librairie)
// ============================================================

export async function exportToExcel(
  businesses: Business[],
  filename: string
): Promise<void> {
  // Import dynamique pour ne pas alourdir le bundle initial
  const XLSX = await import("xlsx");

  const data = businesses.map((b) => ({
    Nom: b.name,
    Téléphone: b.phone ?? "",
    Adresse: b.address ?? "",
    "Site Web": b.website ?? "",
    Note: b.rating ?? "",
    "Nombre d'avis": b.reviewCount ?? "",
    Catégorie: b.category,
    "A un site web": b.hasWebsite ? "Oui" : "Non",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  // Largeurs de colonnes auto
  const colWidths = [
    { wch: 30 }, // Nom
    { wch: 15 }, // Téléphone
    { wch: 40 }, // Adresse
    { wch: 35 }, // Site Web
    { wch: 8 },  // Note
    { wch: 12 }, // Nb avis
    { wch: 20 }, // Catégorie
    { wch: 14 }, // A un site web
  ];
  worksheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// ============================================================
// HELPER
// ============================================================

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
