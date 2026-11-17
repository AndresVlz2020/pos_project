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
      (permission) => permission.permission_codename === codename,
    );
  };

  const handlePermissionChange = (permission, checked) => {
    const codename = permission.permission_codename;

    if (!checked) {
      setPermissionsDraft((prev) =>
        prev.filter((item) => item.permission_codename !== codename),
      );
      return;
    }

    setPermissionsDraft((prev) => [...prev, permission]);
  };

  // Agrupar permisos por módulo usando reduce()
  const permissionsByModule = catalog.reduce(
    (groupedPermissions, permission) => {
      const moduleName = permission.display_name || "Usuarios";

      if (!groupedPermissions[moduleName]) {
        groupedPermissions[moduleName] = [];
      }

      groupedPermissions[moduleName].push(permission);

      return groupedPermissions;
    },
    {},
  );

  const activeName = selectedGroupName || selectedUserName;
  const activeTypeLabel = selectedUser ? "Usuario" : "Grupo";

  return (
    <section className="flex-1 flex flex-col rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] p-5 sm:p-6 text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--md-sys-color-outline-variant)]">
        <div>
          <p className="text-label-sm uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] font-medium">
            {activeTypeLabel}
          </p>

          <h2 className="text-title-lg font-semibold text-[var(--md-sys-color-on-surface)] mt-0.5">
            {activeName || "Seleccione un grupo o usuario"}
          </h2>
        </div>

        {!isEditing && (selectedGroup || selectedUser || activeName) && (
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
        )}
      </div>

      <div className="space-y-6 flex-1">
        {Object.entries(permissionsByModule).map(
          ([moduleName, permissions]) => (
            <div
              key={moduleName}
              className="border-b border-[var(--md-sys-color-outline-variant)] pb-6 last:border-b-0 last:pb-0"
            >
              <h3 className="font-semibold text-[var(--md-sys-color-primary)] mb-4 text-title-sm tracking-wide">
                Módulo {moduleName}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {permissions.map((permission) => (
                  <div
                    key={permission.permission_id}
                    className="p-3 min-h-[48px] flex items-center rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] hover:border-[var(--md-sys-color-primary)]/60 focus-within:border-[var(--md-sys-color-primary)] transition-colors"
                  >
                    <Checkbox
                      id={permission.permission_codename}
                      name={permission.permission_codename}
                      label={permission.permission_name}
                      checked={hasPermission(permission.permission_codename)}
                      disabled={!isEditing}
                      className="w-full"
                      onChange={(e) =>
                        handlePermissionChange(permission, e.target.checked)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ),
        )}
      </div>

      {isEditing && (
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-[var(--md-sys-color-outline-variant)]">
          <Button type="button" variant="outlined" onClick={onCancel}>
            Cancelar
          </Button>

          <Button type="button" variant="filled" leadingIcon="check_circle" onClick={onSave}>
            Guardar
          </Button>
        </div>
      )}
    </section>
  );
}
