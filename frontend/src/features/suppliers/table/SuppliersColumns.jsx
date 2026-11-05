// Componente reutilizable que muestra un switch para activar o desactivar estados
import { StatusSwitch } from "@/shared";
import SuppliersRowActions from "../components/SuppliersRowActions";

export const getSuppliersColumns = ({ onRequestStatusChange }) => [
  {
    accessorKey: "id",
    header: "NIT",
  },
  {
    accessorKey: "companyName",
    header: "Compañía",
  },
  {
    accessorKey: "supplierEmail",
    header: "Email",
  },
  {
    accessorKey: "supplierPhone",
    header: "Teléfono",
  },
  // Columna Estado (activo / inactivo)
  {
    accessorKey: "is_active", // Busca el valor de cada usuario en la bd
    header: "Estado",
    cell: ({ row }) => {
      const supplier = row.original;
      const isActiveValue = supplier.isActive ?? supplier.is_active ?? false
      return (
        <StatusSwitch
        checked={Boolean(isActiveValue)} // Define como debe verse el icono segun su valor
        onChange={(value) => {
          onRequestStatusChange(supplier, value); // Cuando se hace click atrapa el nuevo valor junto a la id, llama a la funcion guarda todo y actualiza la bd
        }}  // Función que maneja el cambio
        />
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <SuppliersRowActions supplier={row.original} />,
  },
];

