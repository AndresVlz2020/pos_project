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
      const isDamagedOrExpired =
        item.status === "Vencido" ||
        item.status === "Avería" ||
        item.status === "Agotado";

      // Regla RFADMIN11: marca como no disponible productos en estado vencido, avería o agotado
      const isAvailable = !isDamagedOrExpired && (item.status === "Activo" || item.isActive !== false);

      const handleChange = (newVal) => {
        if (isDamagedOrExpired && newVal) {
          return; // No se puede marcar como disponible un producto vencido, averiado o agotado
        }
        item.status = newVal ? "Activo" : "Inactivo";
        item.isActive = newVal;
      };

      return (
        <div className="flex items-center gap-2">
          <StatusSwitch
            checked={isAvailable}
            disabled={isDamagedOrExpired}
            onChange={handleChange}
          />
          {isDamagedOrExpired && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
              {item.status} (No disp.)
            </span>
          )}
        </div>
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
