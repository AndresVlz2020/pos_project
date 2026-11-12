import { StatusSwitch } from "@/shared";
import InventoryRowActions from "../components/InventoryRowActions";
import { updateInventoryStatus } from "../services/inventoryServices";
import { showSuccessAlert, showErrorAlert } from "@/shared/services/alertService";

export const getInventoryColumns = ({ onRequestStatusChange, canToggleStatus = false } = {}) => [
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ row }) => row.original.code || `INV-${row.original.id}`,
  },
  {
    accessorKey: "productName",
    header: "Insumo / Producto",
    cell: ({ row }) => row.original.productName || row.original.name || "",
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
    cell: ({ row }) => row.original.productCategory || row.original.category || "General",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const item = row.original;
      const isAvailable =
        item.is_active ??
        (item.status === "Activo" ||
          (item.status !== "Inactivo" &&
            item.status !== "Vencido" &&
            item.status !== "Avería" &&
            item.status !== "Agotado" &&
            item.isActive !== false));

      const handleChange = (newVal) => {
        if (onRequestStatusChange) {
          onRequestStatusChange(item, newVal);
        }
      };

      return (
        <StatusSwitch
          checked={Boolean(isAvailable)}
          onChange={handleChange}
          disabled={!canToggleStatus}
        />
      );
    },
  },
  {
    accessorKey: "currentStock",
    header: "Stock actual",
    cell: ({ row }) => {
      const item = row.original;
      const current = Number(item.currentStock ?? item.quantity ?? 0);
      const min = Number(item.minStock ?? 5);
      const isLow = current <= min;
      const unit = item.unit || "un.";
      return (
        <span className={isLow ? "text-[var(--color-warning)] font-semibold" : ""}>
          {current} {unit}
          {isLow && " (bajo)"}
        </span>
      );
    },
  },
  {
    accessorKey: "supplier",
    header: "Proveedor",
    cell: ({ row }) => row.original.supplier || row.original.supplier_name || "—",
  },
  {
    accessorKey: "lastUpdated",
    header: "Última act.",
    cell: ({ row }) => {
      const date = row.original.lastUpdated || row.original.updated_at;
      if (!date) return "—";
      return new Date(date).toLocaleDateString("es-CO");
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <InventoryRowActions item={row.original} />,
  },
];

export const inventoryColumns = getInventoryColumns();
