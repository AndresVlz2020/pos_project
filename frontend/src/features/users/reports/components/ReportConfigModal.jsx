import { useState } from "react";
import { createPortal } from "react-dom";
import { userReportFields } from "../config/userReportFields";
import { generateUserReport } from "../services/generateUserReport";
import { Button, Input, Select, Checkbox, Alert, M3Icon, IconButton, useScrollLock } from "@/shared";

export default function ReportConfigModal({ isOpen, onClose, data = [] }) {
  useScrollLock(isOpen);

  const [format, setFormat] = useState("pdf");
  const [scope, setScope] = useState("all");
  const [documentNumber, setDocumentNumber] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedFields, setSelectedFields] = useState(() =>
    userReportFields.filter((f) => f.default)
  );

  if (!isOpen) return null;

  const handleFieldToggle = (field) => {
    const exists = selectedFields.find((f) => f.key === field.key);
    if (exists) {
      setSelectedFields(selectedFields.filter((f) => f.key !== field.key));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  const handleGenerateReport = async () => {
    setAlertMessage("");

    if (!selectedFields.length) {
      setAlertMessage("Debe seleccionar al menos un campo para incluir en el reporte.");
      return;
    }

    if (scope === "document" && !documentNumber.trim()) {
      setAlertMessage("Debe ingresar el número de documento para el reporte individual.");
      return;
    }

    const result = await generateUserReport({
      format,
      selectedFields,
      scope,
      documentNumber,
      data,
    });

    if (result && !result.success) {
      setAlertMessage(result.message || "No existen datos coincidentes para los filtros seleccionados.");
      return;
    }

    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[var(--md-sys-color-scrim)] backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="dpiero-modal-in w-full max-w-md rounded-[28px] bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] p-6 m3-elevation-3">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 className="text-2xl leading-8 font-medium text-[var(--md-sys-color-on-surface)]">
            Generar reporte de usuarios
          </h2>
          <IconButton ariaLabel="Cerrar" variant="standard" onClick={onClose}>
            <M3Icon name="close" size={20} />
          </IconButton>
        </div>

        {alertMessage && (
          <div className="mb-4">
            <Alert
              type="warning"
              title="Atención"
              message={alertMessage}
              autoClose={false}
              onClose={() => setAlertMessage("")}
            />
          </div>
        )}

        <div className="mb-4">
          <Select
            label="Formato del reporte"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            options={[
              { label: "PDF", value: "pdf" },
              { label: "Excel", value: "excel" },
            ]}
          />
        </div>

        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
            Campos del reporte:
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {userReportFields.map((field) => {
              const checked = selectedFields.some((f) => f.key === field.key);
              return (
                <Checkbox
                  key={field.key}
                  id={field.key}
                  label={field.label}
                  checked={checked}
                  onChange={() => handleFieldToggle(field)}
                />
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <Select
            label="Alcance del reporte"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            options={[
              { label: "Todos los usuarios", value: "all" },
              { label: "Usuarios habilitados", value: "enabled" },
              { label: "Usuarios deshabilitados", value: "disabled" },
              { label: "Individual (por documento)", value: "document" },
            ]}
          />
        </div>

        {scope === "document" && (
          <div className="mb-4">
            <Input
              label="Número de documento"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Ingrese número de documento"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6 pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
          <Button variant="text" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="filled" leadingIcon="download" onClick={handleGenerateReport}>
            Generar reporte
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
