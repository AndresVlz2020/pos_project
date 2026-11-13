// Fuente de datos de usuarios (mock o fuente centralizada)

// Utilidad para transformar datos en dataset de reporte
import { buildReportDataset } from "../utils/buildReportDataset";

// Servicios de exportación
import { generateExcelReport } from "./generateExcelReport";
import { generatePdfReport } from "./generatePdfReport";

// Caso de uso: orquestador de generación de reportes de usuarios
// Patrón: Application Service (coordina utilidades y servicios)

export async function generateUserReport({
  format,        // "excel" o "pdf"
  selectedFields,// Campos seleccionados por el usuario
  scope,         // Alcance del reporte
  documentNumber,
  data = [] // Filtro opcional
}) {

  // Construcción del dataset (desacoplado de la UI)
  const { headers, rows } = buildReportDataset({
    users: data,
    selectedFields,
    scope,
    documentNumber
  });

  // Validación: evita generar archivos vacíos
  if (!rows.length) {
    return {
      success: false,
      message: "No existen datos coincidentes para los filtros seleccionados."
    };
  }

  // Generación de timestamp para nombres únicos de archivo (YYYY-MM-DD)
  const timestamp = new Date().toISOString().split("T")[0];

  // Selección de estrategia de exportación según formato
  if (format === "excel") {
    await generateExcelReport({
      headers,
      rows,
      fileName: `users-report-${timestamp}.xlsx`
    });
  }

  if (format === "pdf") {
    await generatePdfReport({
      headers,
      rows,
      fileName: `users-report-${timestamp}.pdf`
    });
  }

  return { success: true };
}

