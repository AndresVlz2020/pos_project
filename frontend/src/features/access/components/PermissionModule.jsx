// frontend/src/features/access/components/PermissionModule.jsx

import { Checkbox, Button, IconButton, M3Icon } from "@/shared";

const DEFAULT_PERMISSIONS = [
  { permission_id: 1, permission_name: "Listar usuarios", permission_codename: "list_user", display_name: "Usuarios" },
  { permission_id: 2, permission_name: "Crear usuarios", permission_codename: "create_user", display_name: "Usuarios" },
  { permission_id: 3, permission_name: "Actualizar usuarios", permission_codename: "update_user", display_name: "Usuarios" },
  { permission_id: 4, permission_name: "Generar Reporte usuarios", permission_codename: "report_user", display_name: "Usuarios" },
  { permission_id: 5, permission_name: "Deshabilitar usuarios", permission_codename: "disable_user", display_name: "Usuarios" },
  { permission_id: 6, permission_name: "Listar productos", permission_codename: "list_product", display_name: "Productos" },
  { permission_id: 7, permission_name: "Crear productos", permission_codename: "create_product", display_name: "Productos" },
  { permission_id: 8, permission_name: "Actualizar productos", permission_codename: "update_product", display_name: "Productos" },
  { permission_id: 9, permission_name: "Deshabilitar productos", permission_codename: "disable_product", display_name: "Productos" },
  { permission_id: 10, permission_name: "Listar órdenes", permission_codename: "list_order", display_name: "Órdenes" },
  { permission_id: 11, permission_name: "Crear órdenes", permission_codename: "create_order", display_name: "Órdenes" },
  { permission_id: 12, permission_name: "Actualizar órdenes", permission_codename: "update_order", display_name: "Órdenes" },
  { permission_id: 13, permission_name: "Cancelar órdenes", permission_codename: "cancel_order", display_name: "Órdenes" },
  { permission_id: 14, permission_name: "Listar inventario", permission_codename: "list_inventory", display_name: "Inventario" },
  { permission_id: 15, permission_name: "Crear insumos", permission_codename: "create_inventory", display_name: "Inventario" },
  { permission_id: 16, permission_name: "Actualizar inventario", permission_codename: "update_inventory", display_name: "Inventario" },
  { permission_id: 17, permission_name: "Deshabilitar insumos", permission_codename: "disable_inventory", display_name: "Inventario" },
  { permission_id: 18, permission_name: "Listar proveedores", permission_codename: "list_supplier", display_name: "Proveedores" },
  { permission_id: 19, permission_name: "Crear proveedores", permission_codename: "create_supplier", display_name: "Proveedores" },
  { permission_id: 20, permission_name: "Actualizar proveedores", permission_codename: "update_supplier", display_name: "Proveedores" },
  { permission_id: 21, permission_name: "Deshabilitar proveedores", permission_codename: "disable_supplier", display_name: "Proveedores" },
];

export default function PermissionModule({
  selectedGroup,
  selectedGroupName,
  selectedUser,
  selectedUserName,
  isEditing,
  allPermissions = [],
  permissionsDraft,
  setPermissionsDraft,
  onEdit,
  onCancel,
  onSave,
}) {
  const catalog = allPermissions.length > 0 ? allPermissions : DEFAULT_PERMISSIONS;

  const hasPermission = (codename) => {
    return permissionsDraft.some(
      (permission) => permission.permission_codename === codename
    );
  };

  const handlePermissionChange = (permission, checked) => {
    const codename = permission.permission_codename;

    if (!checked) {
      setPermissionsDraft((prev) =>
        prev.filter((item) => item.permission_codename !== codename)
      );
      return;
    }

    setPermissionsDraft((prev) => [...prev, permission]);
  };

  const permissionsByModule = catalog.reduce((grouped, permission) => {
    const moduleName = permission.display_name || "Usuarios";
    if (!grouped[moduleName]) {
      grouped[moduleName] = [];
    }
    grouped[moduleName].push(permission);
    return grouped;
  }, {});

  const activeName = selectedGroupName || selectedUserName;
  const activeTypeLabel = selectedUser ? "Usuario" : "Grupo";

  return (
    <section className="flex-1 flex flex-col rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] p-4 sm:p-5 text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
        <div className="min-w-0">
          <p className="text-label-sm uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] font-medium">
            {activeTypeLabel}
          </p>
          <h2 className="text-title-lg font-semibold text-[var(--md-sys-color-on-surface)] truncate">
            {activeName || "Seleccione un grupo o usuario"}
          </h2>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="outlined" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="filled"
              size="sm"
              leadingIcon="check_circle"
              onClick={onSave}
            >
              Guardar
            </Button>
          </div>
        ) : (
          (selectedGroup || selectedUser || activeName) && (
            <IconButton
              variant="tonal"
              hitSize={40}
              iconSize={18}
              ariaLabel="Editar permisos"
              title="Editar permisos"
              onClick={onEdit}
            >
              <M3Icon name="edit" size={18} />
            </IconButton>
          )
        )}
      </div>

      {/* Grilla multi-columna por módulo para reducir drásticamente el scroll vertical */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3 flex-1 items-start">
        {Object.entries(permissionsByModule).map(([moduleName, permissions]) => (
          <div
            key={moduleName}
            className="rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] p-3 sm:p-3.5"
          >
            <h3 className="font-semibold text-[var(--md-sys-color-primary)] mb-2 text-sm tracking-wide flex items-center justify-between gap-2">
              <span>{moduleName}</span>
              <span className="text-label-sm font-medium text-[var(--md-sys-color-on-surface-variant)] tabular-nums">
                {permissions.filter((p) => hasPermission(p.permission_codename)).length}/{permissions.length}
              </span>
            </h3>

            <div className="space-y-1">
              {permissions.map((permission) => (
                <div
                  key={permission.permission_id}
                  className="px-2.5 rounded-lg border border-[var(--md-sys-color-outline-variant)]/70 bg-[var(--md-sys-color-surface)] hover:border-[var(--md-sys-color-primary)]/60 focus-within:border-[var(--md-sys-color-primary)] transition-colors"
                >
                  <Checkbox
                    id={permission.permission_codename}
                    name={permission.permission_codename}
                    label={permission.permission_name}
                    checked={hasPermission(permission.permission_codename)}
                    disabled={!isEditing}
                    className="w-full !min-h-[38px] !py-1 text-[13px]"
                    onChange={(e) =>
                      handlePermissionChange(permission, e.target.checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
