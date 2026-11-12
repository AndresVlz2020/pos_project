// Componente reutilizable que muestra un switch para activar o desactivar estados
import { StatusSwitch } from "@/shared";

// Componente que contiene los botones de acciones (editar y ver) para cada usuario
import UserRowActions from "../components/UserRowActions";
import { updateUserStatus } from "@/services/userService";
import { getUserAvatar, imgWorkerCarlos } from "@/utils/imageHelper";

// Definición de las columnas de la tabla de usuarios
export const getUserColumns = ({ onRequestStatusChange, canToggleStatus = false } = {}) => [
  // Columna ID
  {
    accessorKey: "id",
    header: "Id",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-[var(--color-primary-300)]">
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
      const avatarSrc = user.photo || user.userAvatarUrl || getUserAvatar(user);
      const name = user.userName || user.name || "—";
      return (
        <div className="flex items-center gap-3">
          <img
            src={avatarSrc}
            alt={name}
            className="size-8 rounded-full object-cover border border-[var(--color-secondary-700)] shrink-0 shadow-sm"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = imgWorkerCarlos;
            }}
          />
          <span className="font-medium text-[var(--color-white)] text-sm">
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
        <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-secondary-800)] text-[var(--color-primary-300)] font-semibold border border-[var(--color-secondary-700)]">
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
        <span className="text-xs text-[var(--color-gray-300)]">
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
        <span className="text-xs font-mono text-[var(--color-gray-300)]">
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
