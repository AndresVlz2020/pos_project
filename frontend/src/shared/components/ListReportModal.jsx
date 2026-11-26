import { useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import Checkbox from "./Checkbox";
import Select from "./Select";
import Alert from "./Alert";
import M3Icon from "./M3Icon";
import { IconButton } from "./IconButton";
import { useScrollLock } from "../hooks/useScrollLock";
import { generateExcelReport } from "../../features/users/reports/services/generateExcelReport";
import { generatePdfReport } from "../../features/users/reports/services/generatePdfReport";

export default function ListReportModal({
  isOpen,
  onClose,
  title = "Reporte",
  data = [],
  fields = [],
  filePrefix = "report",
  statusOptions,
  statusKey = "status",
  onReportSuccess,
}) {
  useScrollLock(isOpen);

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

  const handleGenerate = async () => {
    setFeedback(null);

    if (!selectedKeys.length) {
      setFeedback({
        type: "warning",
        title: "Campos requeridos",
        message: "Debe seleccionar al menos un campo para generar el reporte.",
      });
      return;
    }

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
      await generateExcelReport({
        headers,
        rows,
        title: reportTitle,
        fileName: `${fileName}.xlsx`,
      });
    } else {
      await generatePdfReport({
        headers,
        rows,
        title: reportTitle,
        fileName: `${fileName}.pdf`,
      });
    }

    onReportSuccess?.("Reporte generado exitosamente");

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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[var(--md-sys-color-scrim)] p-4 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        className="dpiero-modal-in w-full max-w-md rounded-[28px] bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] p-6 m3-elevation-3"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
              <M3Icon name="download" size={20} />
            </div>
            <h2 className="text-2xl leading-8 font-medium text-[var(--md-sys-color-on-surface)]">
              Generar reporte de {title}
            </h2>
          </div>
          <IconButton ariaLabel="Cerrar" variant="standard" onClick={onClose}>
            <M3Icon name="close" size={20} />
          </IconButton>
        </div>

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

        <p className="mb-2 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
          Campos a incluir en el reporte:
        </p>

        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1 mb-6">
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

        <div className="flex justify-end gap-2 pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
          <Button variant="text" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="filled"
            size="md"
            leadingIcon="download"
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
