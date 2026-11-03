import { StatusSwitch } from "@/shared";
import InventoryRowActions from "../components/InventoryRowActions";

export const inventoryColumns = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "productName",
    header: "Producto",
  },
  {
    accessorKey: "brand",
    header: "Marca",
    cell: ({ row }) => (
      <span className="font-medium text-[var(--color-gray-200)]">
        {row.original.brand || "Genérica"}
      </span>
    ),
  },
  {
    accessorKey: "productCategory",
    header: "Categoría",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const item = row.original;
      const isAvailable =
        item.status === "Activo" ||
        (item.status !== "Inactivo" &&
          item.status !== "Vencido" &&
          item.status !== "Avería" &&
          item.status !== "Agotado" &&
          item.isActive !== false);

      const handleChange = (newVal) => {
        item.status = newVal ? "Activo" : "Inactivo";
        item.isActive = newVal;
      };

      return (
        <StatusSwitch
          checked={isAvailable}
          onChange={handleChange}
        />
      );
    },
  },
  {
    accessorKey: "currentStock",
    header: "Stock actual",
    cell: ({ row }) => {
      const item = row.original;
      const isLow = item.currentStock <= item.minStock;
      return (
        <span className={isLow ? "text-red-400 font-semibold" : ""}>
          {item.currentStock}
          {isLow && " (bajo)"}
        </span>
      );
    },
  },
  {
    accessorKey: "supplier",
    header: "Proveedor",
  },
  {
    accessorKey: "lastUpdated",
    header: "Última act.",
  },
  {
    id: "actions",
    cell: ({ row }) => <InventoryRowActions item={row.original} />,
  },
];
