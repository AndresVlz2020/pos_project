import { useState } from "react";
import { Select, Checkbox, Button } from "@/shared";
import logoDPiero from "@/assets/images/logo-d,piero.png";

export default function UsersManagement() {
  const [form, setForm] = useState({ group: "", user: "" });
  const [checks, setChecks] = useState({});

  const groupOptions = [
    { value: "cocina", label: "Cocina" },
    { value: "admins", label: "Administradores" },
    { value: "superadmin", label: "SuperAdministrador" },
    { value: "meseros", label: "Meseros" },
  ];

  const userOptions = [
    { value: "mesero", label: "Mesero" },
    { value: "admin", label: "Administrador" },
    { value: "superadmin", label: "SuperAdministrador" },
    { value: "proveedor", label: "Proveedor" },
    { value: "gestion", label: "Gestion" },
  ];

  const permissionGroups = [
    {
      title: "Gestión de Permisos",
      items: [
        "Configuración Global del Sistema",
        "Gestión de Integraciones",
        "Gestión de Formatos",
        "Actualización del Sistema",
        "Mantenimiento de Datos",
      ],
    },
    {
      title: "Accesos y Cuentas",
      items: [
        "Control de Permisos",
        "Gestión de Cuentas",
        "Gestión de Roles",
        "Restablecimiento de Credenciales",
        "Auditoría de Acceso",
      ],
    },
    {
      title: "Operación y Seguridad",
      items: [
        "Gestión de Procesos y Flujos",
        "Monitoreo de Errores/Rendimiento",
        "Gestión de Conceptos/Etiquetas",
        "Bloqueo de Seguridad",
        "Políticas de Seguridad",
      ],
    },
  ];

  const handleSelect = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCheck = (key) => {
    setChecks((c) => ({ ...c, [key]: !c[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Gestión actualizada (demo)");
  };

  return (
    <div className="w-full users-mgmt">
      {/* Header */}
      <div className="w-full bg-[var(--color-primary-950)] text-[var(--color-text-inverse)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-3 py-1 rounded-md border border-[var(--color-text-inverse)] text-[var(--color-text-inverse)]"
          >
            ←
          </button>
          <div className="flex items-center gap-3">
            <img src={logoDPiero} alt="D,PIERO" className="h-8 w-auto object-contain" />
            <span className="text-xl font-semibold tracking-wide">D,PIERO</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto p-6 bg-[var(--color-tertiary-300)] rounded-lg border border-[var(--color-border)] shadow-sm">
        <h1 className="text-center text-xl font-bold mb-6">Gestión de Permisos</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 items-start">
          {/* Left column: groups and users */}
          <div className="col-span-1 w-full space-y-6">
            <div className="rounded-lg p-5 bg-[var(--color-tertiary-200)] text-[var(--color-gray-900)] shadow-sm border border-[var(--color-border)]">
              <h3 className="text-center font-semibold mb-4">Grupo usuarios.</h3>
              <Select
                label="Grupo Seleccionado"
                name="group"
                value={form.group}
                onChange={handleSelect}
                options={groupOptions}
              />
            </div>

            <div className="rounded-lg p-5 bg-[var(--color-tertiary-200)] text-[var(--color-gray-900)] shadow-sm border border-[var(--color-border)]">
              <h3 className="text-center font-semibold mb-4">Usuarios Individual</h3>
              <Select
                label="Usuario"
                name="user"
                value={form.user}
                onChange={handleSelect}
                options={userOptions}
              />
            </div>
          </div>

          {/* Right column: permissions */}
          <div className="col-span-1 md:col-span-3 grid gap-6">
            {permissionGroups.map((group) => (
              <div key={group.title} className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map((item) => (
                    <label key={item} className="flex items-center gap-3 p-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
                      <Checkbox
                        id={item}
                        name={item}
                        checked={!!checks[item]}
                        onChange={() => toggleCheck(item)}
                      />
                      <span className="text-[var(--color-gray-900)]">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <Button variant="primary" type="submit">Guardar</Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
