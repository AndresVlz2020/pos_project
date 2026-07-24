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
    accessorKey: "productCategory",
    header: "Categoría",
  },
  {
    accessorKey: "currentStock",
    header: "Stock actual",
    cell: ({ row }) => {
      const item = row.original;
      const isLow = item.currentStock <= item.minStock;
      return (
        <span className={isLow ? "text-red-600 font-semibold" : ""}>
          {item.currentStock}
          {isLow && " (bajo)"}
        </span>
      );
    },
  },
  {
    accessorKey: "minStock",
    header: "Stock mín.",
  },
  {
    accessorKey: "maxStock",
    header: "Stock máx.",
  },
  {
    accessorKey: "supplier",
    header: "Proveedor",
  },
  {
    accessorKey: "lastUpdated",
    header: "Última actualización",
  },
  {
    id: "actions",
    cell: ({ row }) => <InventoryRowActions item={row.original} />,
  },
];
