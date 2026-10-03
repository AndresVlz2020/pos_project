// Librería para manipulación y generación de archivos Excel
import * as XLSX from "xlsx";

// Función utilitaria para generar un archivo Excel con membrete y metadatos
// Cumple con RFADMIN13, RFADMIN19, RFADMIN25 y RFADMIN31
export function generateExcelReport({
  headers,
  rows,
  title = "Reporte del Sistema",
  fileName = "report.xlsx"
}) {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
      return null;
    }
  })();
  const userName = user?.name || user?.userName || user?.email || "Administrador General";
  const now = new Date();
  const dateStr = now.toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" });
  const timeStr = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  const worksheetData = [
    ["D'PIERO • RESTAURANTE, PARRILLA & POS"],
    [String(title).toUpperCase()],
    [`Fecha de generación: ${dateStr} ${timeStr}`, `Generado por: ${userName}`],
    [], // Fila en blanco
    headers,
    ...rows
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
  XLSX.writeFile(workbook, fileName);
}

export default generateExcelReport;
