import { useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import Checkbox from "./Checkbox";
import Select from "./Select";
import Alert from "./Alert";
import { generateExcelReport } from "../../features/users/reports/services/generateExcelReport";
import { generatePdfReport } from "../../features/users/reports/services/generatePdfReport";

export default function ListReportModal({
  isOpen,
  onClose,
  title = "Reporte",
  data = [],
  fields = [],
  filePrefix = "report",
  statusOptions, // Opcional: [{ value: "all", label: "Todos" }, ...]
  statusKey = "status", // Llave sobre la que filtra el estado
  onReportSuccess,
}) {
  const [format, setFormat] = useState("pdf");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedKeys, setSelectedKeys] = useState(() =>
    fields.filter((field) => field.default).map((field) => field.key)
  );
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const toggleField = (key) => {
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
  };

  const handleGenerate = () => {
    setFeedback(null);

    if (!selectedKeys.length) {
      setFeedback({
        type: "warning",
        title: "Campos requeridos",
        message: "Debe seleccionar al menos un campo para generar el reporte.",
      });
      return;
    }

    // Filtrado por estado si aplica
    let filteredData = [...data];
    if (statusOptions && selectedStatus !== "all") {
      filteredData = filteredData.filter((item) => {
        const val = String(item[statusKey] || item.productStatus || "").toLowerCase();
        return val === selectedStatus.toLowerCase();
      });
    }

    if (!filteredData.length) {
      setFeedback({
        type: "warning",
        title: "Sin coincidencias",
        message: "No existen datos coincidentes para los filtros seleccionados.",
      });
      return;
    }

    const selectedFields = fields.filter((field) => selectedKeys.includes(field.key));
    const headers = selectedFields.map((field) => field.label);
    const rows = filteredData.map((item) =>
      selectedFields.map((field) => item[field.key] ?? "")
    );
    const timestamp = new Date().toISOString().split("T")[0];
    const reportTitle = `Reporte de ${title}`;
    const fileName = `${filePrefix}-report-${timestamp}`;

    if (format === "excel") {
      generateExcelReport({
        headers,
        rows,
        title: reportTitle,
        fileName: `${fileName}.xlsx`,
      });
    } else {
      generatePdfReport({
        headers,
        rows,
        title: reportTitle,
        fileName: `${fileName}.pdf`,
      });
    }

    if (onReportSuccess) {
      onReportSuccess("Reporte generado exitosamente");
    }

    setFeedback({
      type: "success",
      title: "Éxito",
      message: "Reporte generado exitosamente",
    });

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] text-[var(--color-white)] p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-[var(--color-white)]">
          Generar reporte de {title}
        </h2>

        {feedback && (
          <div className="mb-4">
            <Alert
              type={feedback.type}
              title={feedback.title}
              message={feedback.message}
              autoClose={false}
              onClose={() => setFeedback(null)}
            />
          </div>
        )}

        <div className="space-y-4 mb-4">
          <Select
            label="Formato del reporte"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            options={[
              { label: "Documento PDF (.pdf)", value: "pdf" },
              { label: "Hoja de Cálculo Excel (.xlsx)", value: "excel" },
            ]}
          />

          {statusOptions && (
            <Select
              label="Filtrar por estado"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statusOptions}
            />
          )}
        </div>

        <p className="mb-2 text-xs font-semibold text-[var(--color-gray-300)] uppercase tracking-wider">
          Campos a incluir en el reporte:
        </p>

        <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1 mb-6">
          {fields.map((field) => (
            <Checkbox
              key={field.key}
              id={`${filePrefix}-${field.key}`}
              label={field.label}
              checked={selectedKeys.includes(field.key)}
              onChange={() => toggleField(field.key)}
            />
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-secondary-800)]">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            disabled={!selectedKeys.length}
          >
            Generar reporte
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
