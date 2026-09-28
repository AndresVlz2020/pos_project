// Componente reutilizable que muestra un switch para activar o desactivar estados
import { StatusSwitch } from "@/shared";

// Componente que contiene los botones de acciones (editar, eliminar y ver) para cada usuario
import UserRowActions from "../components/UserRowActions";

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
  },

  // Columna Teléfono
  {
    accessorKey: "userPhone",
    header: "Teléfono",
  },

  // Columna Estado (activo / inactivo)
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => {
      const user = row.original;
      const handleChange = (value) => {
        console.log("Actualizar estado usuario:", user.id, value);
      };

      return (
        <StatusSwitch
          checked={user.isActive ?? true}
          onChange={handleChange}
        />
      );
    },
  },

  // Columna de acciones (editar / eliminar / ver)
  {
    id: "actions",
    cell: ({ row }) => <UserRowActions user={row.original} />,
  },
];
