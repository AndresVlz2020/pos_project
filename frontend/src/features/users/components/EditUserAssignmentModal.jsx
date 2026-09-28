import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, UserCheck, Shield, KeyRound, Phone, Mail } from "lucide-react";
import { Button } from "@/shared";

export default function EditUserAssignmentModal({ isOpen, onClose, user, onSave }) {
  const [form, setForm] = useState({
    userName: "",
    role: "Mesero",
    workerStatus: "En Turno",
    station: "Piso 1 - Mesas",
    hasPin: true,
    pin: "",
    userEmail: "",
    userPhone: "",
    documentType: "CC",
    documentNumber: "",
    address: "",
    isActive: true
  });

  useEffect(() => {
    if (user) {
      setForm({
        userName: user.userName || "",
        role: user.role || "Mesero",
        workerStatus: user.workerStatus || "En Turno",
        station: user.station || "Sin asignar",
        hasPin: user.hasPin ?? true,
        pin: user.pin || "",
        userEmail: user.userEmail || "",
        userPhone: user.userPhone || "",
        documentType: user.document_type || "CC",
        documentNumber: user.document_number || "",
        address: user.address || "",
        isActive: user.isActive ?? true
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const roleOptions = ["Admin", "Cajero", "Mesero", "Parrilla/Cocina"];
  const workerStatusOptions = ["En Turno", "Disponible", "En Pausa", "Fuera de Turno"];
  const documentTypeOptions = ["CC", "CE", "NIT", "TI", "PAS"];
  const stationOptions = [
    "Caja Principal #1",
    "Piso 1 - Mesas",
    "Piso 2 - Terraza",
    "Estación Brasa",
    "Barra / Bebidas",
    "Sin asignar"
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Si es PIN, limitar a máximo 4 dígitos numéricos
    if (name === "pin") {
      const cleanPin = value.replace(/\D/g, "").slice(0, 4);
      setForm((prev) => ({ ...prev, pin: cleanPin }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({ ...user, ...form });
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 font-[family-name:var(--main-font)] text-[var(--color-white)] animate-fadeIn">
      <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-primary-800)] bg-[var(--color-primary-950)]">
          <div className="flex items-center gap-2">
            <UserCheck className="size-5 text-[var(--color-secondary-400)]" />
            <h2 className="text-base font-bold">Editar Asignación de Operador</h2>
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
              Nombre del Operador
            </label>
            <input
              type="text"
              name="userName"
              value={form.userName}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-md bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] text-white outline-none focus:border-[var(--color-secondary-400)]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1">
                Rol Asignado
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-md bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] text-white outline-none focus:border-[var(--color-secondary-400)] cursor-pointer"
              >
                {roleOptions.map((r) => (
                  <option key={r} value={r} className="bg-[var(--color-primary-950)]">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1">
                Estado Laboral
              </label>
              <select
                name="workerStatus"
                value={form.workerStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-md bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] text-white outline-none focus:border-[var(--color-secondary-400)] cursor-pointer"
              >
                {workerStatusOptions.map((s) => (
                  <option key={s} value={s} className="bg-[var(--color-primary-950)]">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1 flex items-center gap-1">
                <KeyRound className="size-3.5 text-[var(--color-secondary-400)]" />
                <span>PIN de Terminal (4 dígitos)</span>
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                name="pin"
                value={form.pin}
                onChange={handleChange}
                placeholder="••••"
                className="w-full px-3 py-2 text-xs font-mono tracking-widest text-center rounded-md bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] text-white outline-none focus:border-[var(--color-secondary-400)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1">
                Estación Asignada
              </label>
              <select
                name="station"
                value={form.station}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-md bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] text-white outline-none focus:border-[var(--color-secondary-400)] cursor-pointer"
              >
                {stationOptions.map((s) => (
                  <option key={s} value={s} className="bg-[var(--color-primary-950)]">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--color-primary-800)] space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-gray-400)]">
              Información de Contacto
            </p>

            {form.role === "Admin" && (
              <div>
                <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1 flex items-center gap-1.5">
                  <Mail className="size-3.5 text-[var(--color-secondary-400)]" />
                  <span>Correo Empresarial</span>
                </label>
                <input
                  type="email"
                  name="userEmail"
                  value={form.userEmail}
                  onChange={handleChange}
                  placeholder="nombre@dpiero.com"
                  className="w-full px-3 py-2 text-xs rounded-md bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] text-white outline-none focus:border-[var(--color-secondary-400)]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1 flex items-center gap-1.5">
                <Phone className="size-3.5 text-[var(--color-secondary-400)]" />
                <span>Teléfono de Contacto</span>
              </label>
              <input
                type="tel"
                name="userPhone"
                value={form.userPhone}
                onChange={handleChange}
                placeholder="310 000 0000"
                className="w-full px-3 py-2 text-xs rounded-md bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] text-white outline-none focus:border-[var(--color-secondary-400)]"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--color-primary-800)] space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-gray-400)]">
              Información de Documentación
            </p>

            <div className="grid grid-cols-2 gap-3">
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
                  {documentTypeOptions.map((t) => (
                    <option key={t} value={t} className="bg-[var(--color-primary-950)]">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1">
                  Número de Documento
                </label>
                <input
                  type="text"
                  name="documentNumber"
                  value={form.documentNumber}
                  onChange={handleChange}
                  placeholder="1000000000"
                  className="w-full px-3 py-2 text-xs rounded-md bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] text-white outline-none focus:border-[var(--color-secondary-400)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Calle 1 #10-20"
                className="w-full px-3 py-2 text-xs rounded-md bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] text-white outline-none focus:border-[var(--color-secondary-400)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs text-[var(--color-gray-300)] cursor-pointer">
              <input
                type="checkbox"
                name="hasPin"
                checked={form.hasPin}
                onChange={handleChange}
                className="rounded bg-[var(--color-primary-950)] border-[var(--color-primary-800)] text-[var(--color-secondary-500)] focus:ring-0"
              />
              <span>PIN Habilitado para Terminal POS</span>
            </label>
          </div>

          {/* Modal Actions */}
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
              className="px-4 py-2 rounded-md bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
