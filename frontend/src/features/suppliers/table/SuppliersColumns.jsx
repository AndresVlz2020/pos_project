// Componente reutilizable que muestra un switch para activar o desactivar estados
import { StatusSwitch } from "@/shared";
import SuppliersRowActions from "../components/SuppliersRowActions";

export const getSuppliersColumns = ({ onRequestStatusChange } = {}) => [
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
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => {
      const supplier = row.original;
      const isChecked = supplier.isActive ?? true;

      const handleChange = (newVal) => {
        if (onRequestStatusChange) {
          onRequestStatusChange(supplier, newVal);
        }
      };

      return (
        <StatusSwitch
          checked={isChecked}
          onChange={handleChange}
        />
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <SuppliersRowActions supplier={row.original} />,
  },
];

export const suppliersColumns = getSuppliersColumns();