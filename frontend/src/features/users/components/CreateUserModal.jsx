import { useState } from "react";
import { createPortal } from "react-dom";
import { X, UserPlus, ShieldCheck, KeyRound } from "lucide-react";
import { Button, Input, Select } from "@/shared";

export default function CreateUserModal({ isOpen, onClose, onUserCreated }) {
  const [form, setForm] = useState({
    name: "",
    documentType: "CC",
    documentNumber: "",
    role: "cajero",
    pin: "",
    station: "Caja Principal #1"
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const roleOptions = [
    { value: "cajero", label: "Cajero" },
    { value: "mesero", label: "Mesero" },
    { value: "cocinero", label: "Cocinero" },
    { value: "admin", label: "Administrador" }
  ];

  const documentTypeOptions = [
    { value: "CC", label: "Cédula de Ciudadanía (CC)" },
    { value: "CE", label: "Cédula de Extranjería (CE)" },
    { value: "NIT", label: "NIT" },
    { value: "PAS", label: "Pasaporte" }
  ];

  const stationOptions = [
    { value: "Caja Principal #1", label: "Caja Principal #1" },
    { value: "Mesas 01 a 08", label: "Salón - Mesas 01 a 08" },
    { value: "Mesas 09 a 16", label: "Salón - Mesas 09 a 16" },
    { value: "Estación de Brasa", label: "Cocina - Estación de Brasa" },
    { value: "Bar & Coctelería", label: "Bar & Coctelería" },
    { value: "Despacho & Almacén", label: "Despacho & Almacén" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si es PIN, limitar a máximo 4 dígitos numéricos
    if (name === "pin") {
      const cleanPin = value.replace(/\D/g, "").slice(0, 4);
      setForm((prev) => ({ ...prev, pin: cleanPin }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!form.documentNumber.trim()) newErrors.documentNumber = "El documento es obligatorio";
    if (!form.pin || form.pin.length !== 4) newErrors.pin = "El PIN debe tener exactamente 4 dígitos";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (onUserCreated) {
      onUserCreated(form);
    }

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 font-[family-name:var(--main-font)] animate-fadeIn">
      <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-primary-800)] bg-[var(--color-primary-950)]">
          <div className="flex items-center gap-2 text-[var(--color-white)]">
            <UserPlus className="size-5 text-[var(--color-secondary-400)]" />
            <h2 className="text-base font-bold">Crear Nuevo Operador / Colaborador</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-gray-400)] hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ej: Carlos Pérez"
              className="w-full px-3 py-2 text-xs rounded-md bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] text-white placeholder:text-[var(--color-gray-500)] outline-none focus:border-[var(--color-secondary-400)]"
            />
            {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1">
                Tipo de Documento
              </label>
              <select
                name="documentType"
                value={form.documentType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-md bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] text-white outline-none focus:border-[var(--color-secondary-400)] cursor-pointer"
              >
                {documentTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[var(--color-primary-950)]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1">
                Número de Documento *
              </label>
              <input
                type="text"
                name="documentNumber"
                value={form.documentNumber}
                onChange={handleChange}
                placeholder="1002345678"
                className="w-full px-3 py-2 text-xs rounded-md bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] text-white placeholder:text-[var(--color-gray-500)] outline-none focus:border-[var(--color-secondary-400)]"
              />
              {errors.documentNumber && <p className="text-[11px] text-rose-400 mt-1">{errors.documentNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1">
                Rol Operativo
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-md bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] text-white outline-none focus:border-[var(--color-secondary-400)] cursor-pointer"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[var(--color-primary-950)]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1 flex items-center gap-1">
                <KeyRound className="size-3.5 text-[var(--color-secondary-400)]" />
                <span>PIN de Terminal (4 dígitos) *</span>
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                name="pin"
                value={form.pin}
                onChange={handleChange}
                placeholder="••••"
                className="w-full px-3 py-2 text-xs font-mono tracking-widest text-center rounded-md bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] text-white placeholder:text-[var(--color-gray-500)] outline-none focus:border-[var(--color-secondary-400)]"
              />
              {errors.pin && <p className="text-[11px] text-rose-400 mt-1">{errors.pin}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1">
              Estación Asignada en Turno
            </label>
            <select
              name="station"
              value={form.station}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-md bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] text-white outline-none focus:border-[var(--color-secondary-400)] cursor-pointer"
            >
              {stationOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[var(--color-primary-950)]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--color-primary-800)]">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="text-xs"
            >
              Cancelar
            </Button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-xs font-semibold text-[var(--color-white)] transition-colors cursor-pointer"
            >
              Guardar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
