// Componente reutilizable que muestra un switch para activar o desactivar estados
import { StatusSwitch } from "@/shared";

// Componente que contiene los botones de acciones (editar y ver) para cada usuario
import UserRowActions from "../components/UserRowActions";
import { updateUserStatus } from "@/services/userService";

// Definición de las columnas de la tabla de usuarios
export const userColumns = [
  // Columna ID
  {
    accessorKey: "id",
    header: "Id",
  },

  // Columna Nombre
  {
    accessorKey: "userName",
    header: "Nombre",
    cell: ({ row }) => {
      const user = row.original;
      return user.userName || user.name || "";
    },
  },

  // Columna Rol
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const role = row.original.role || row.original.userType || "Mesero";
      return (
        <span className="text-sm text-[var(--color-gray-200)]">
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
      return user.userEmail || user.email || "—";
    },
  },

  // Columna Teléfono
  {
    accessorKey: "userPhone",
    header: "Teléfono",
    cell: ({ row }) => {
      const user = row.original;
      return user.userPhone || user.phone || "—";
    },
  },

  // Columna Estado (activo / inactivo) sincronizada en tiempo real con PostgreSQL
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => {
      const user = row.original;
      const handleChange = async (value) => {
        try {
          await updateUserStatus(user.id, value);
          user.isActive = value;
          console.log("Estado actualizado en PostgreSQL:", user.id, value);
        } catch (error) {
          console.error("Error al actualizar el estado del usuario:", error);
        }
      };

      return (
        <StatusSwitch
          checked={user.isActive ?? true}
          onChange={handleChange}
        />
      );
    },
  },

  // Columna de acciones (editar / ver, sin botón de eliminar)
  {
    id: "actions",
    cell: ({ row }) => <UserRowActions user={row.original} />,
  },
];
