// Componente reutilizable que muestra un switch para activar o desactivar estados
import { StatusSwitch } from "@/shared";

// Componente que contiene los botones de acciones (editar y ver) para cada usuario
import UserRowActions from "../components/UserRowActions";
import { getUserAvatar, imgWorkerCarlos } from "@/utils/imageHelper";

// Definición de las columnas de la tabla de usuarios
export const getUserColumns = ({ onRequestStatusChange, canToggleStatus = false } = {}) => [
  // Columna ID
  {
    accessorKey: "id",
    header: "Id",
    cell: ({ row }) => (
      <span className="font-mono text-label-md text-[var(--md-sys-color-primary)]">
        #{row.original.id}
      </span>
    ),
  },

  // Columna Nombre con Avatar
  {
    accessorKey: "userName",
    header: "Nombre",
    cell: ({ row }) => {
      const user = row.original;
      const avatarSrc = getUserAvatar(user);
      const name = user.userName || user.name || "—";
      return (
        <div className="flex items-center gap-3">
          <img
            src={avatarSrc}
            alt={name}
            className="size-8 rounded-full object-cover border border-[var(--md-sys-color-outline-variant)] shrink-0"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = imgWorkerCarlos;
            }}
          />
          <span className="font-medium text-[var(--md-sys-color-on-surface)] text-body-md">
            {name}
          </span>
        </div>
      );
    },
  },

  // Columna Rol
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const role = row.original.role || row.original.userType || "Mesero";
      return (
        <span className="text-label-sm px-2.5 py-0.5 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-medium border border-[var(--md-sys-color-outline-variant)]">
          {role}
        </span>
      );
    },
  },

  // Columna Email
  {
    accessorKey: "userEmail",
    header: "Email",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <span className="text-body-sm text-[var(--md-sys-color-on-surface-variant)]">
          {user.userEmail || user.email || "—"}
        </span>
      );
    },
  },

  // Columna Teléfono
  {
    accessorKey: "userPhone",
    header: "Teléfono",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <span className="text-label-md font-mono text-[var(--md-sys-color-on-surface-variant)]">
          {user.userPhone || user.phone || "—"}
        </span>
      );
    },
  },

  // Columna Estado (activo / inactivo) sincronizada en tiempo real con PostgreSQL
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => {
      const user = row.original;
      const isChecked = user.isActive ?? true;

      const handleChange = (newVal) => {
        if (onRequestStatusChange) {
          onRequestStatusChange(user, newVal);
        }
      };

      return (
        <StatusSwitch
          checked={Boolean(isChecked)}
          disabled={!canToggleStatus}
          onChange={handleChange}
        />
      );
    },
  },

  // Columna Acciones (editar y ver)
  {
    id: "actions",
    cell: ({ row }) => <UserRowActions user={row.original} />,
  },
];

export const userColumns = getUserColumns();
