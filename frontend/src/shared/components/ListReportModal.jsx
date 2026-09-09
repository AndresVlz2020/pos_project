import { useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import Checkbox from "./Checkbox";
import Select from "./Select";
import { generateExcelReport } from "../../features/users/reports/services/generateExcelReport";
import { generatePdfReport } from "../../features/users/reports/services/generatePdfReport";

export default function ListReportModal({ isOpen, onClose, title, data, fields, filePrefix }) {
  const [format, setFormat] = useState("pdf");
  const [selectedKeys, setSelectedKeys] = useState(() => fields.filter((field) => field.default).map((field) => field.key));

  if (!isOpen) return null;

  const toggleField = (key) => {
    setSelectedKeys((current) => current.includes(key)
      ? current.filter((item) => item !== key)
      : [...current, key]);
  };

  const handleGenerate = () => {
    const selectedFields = fields.filter((field) => selectedKeys.includes(field.key));
    const headers = selectedFields.map((field) => field.label);
    const rows = data.map((item) => selectedFields.map((field) => item[field.key] ?? ""));
    const timestamp = new Date().toISOString().split("T")[0];
    const fileName = `${filePrefix}-report-${timestamp}`;

    if (format === "excel") {
      generateExcelReport({ headers, rows, fileName: `${fileName}.xlsx` });
    } else {
      generatePdfReport({ headers, rows, fileName: `${fileName}.pdf` });
    }

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] text-[var(--color-white)] px-6 py-6 shadow-xl">
        <h2 className="mb-6 text-xl font-semibold text-[var(--color-white)]">Generar reporte de {title}</h2>
        <div className="mb-4">
          <Select
            label="Formato del reporte"
            value={format}
            onChange={(event) => setFormat(event.target.value)}
            options={[
              { label: "PDF", value: "pdf" },
              { label: "Excel", value: "excel" },
            ]}
          />
        </div>
        <p className="mb-2 font-medium text-[var(--color-gray-200)]">Campos del reporte:</p>
        <div className="grid grid-cols-2 gap-3">
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
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleGenerate} disabled={!selectedKeys.length}>Generar reporte</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
