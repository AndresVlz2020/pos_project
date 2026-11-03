import OrderRowActions from "../components/OrderRowActions";

export const getOrderColumns = ({ onViewOrder, onRequestCancel } = {}) => [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "tableNumber",
    header: "Mesa",
  },
  {
    accessorKey: "waiter",
    header: "Mesero",
  },
  {
    accessorKey: "items",
    header: "Productos",
    cell: ({ row }) => {
      const items = row.original.items || [];
      const totalQty = items.reduce((sum, it) => sum + (it.qty || 1), 0);
      const summary = items
        .map((i) => i.name?.split(" ")[0])
        .slice(0, 2)
        .join(", ");
      return (
        <span className="text-[var(--color-gray-200)]">
          {totalQty} {totalQty === 1 ? "ítem" : "ítems"}
          {summary ? ` (${summary})` : ""}
        </span>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const total = Number(row.original.total || 0);
      return `$${total.toLocaleString("es-CO")}`;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status || "Abierta";
      return (
        <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-md bg-[var(--color-secondary-800)] text-[var(--color-white)] border border-[var(--color-secondary-700)]">
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Fecha",
    cell: ({ row }) => row.original.createdAt || "2026-09-28 19:00",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <OrderRowActions
        order={row.original}
        onViewOrder={onViewOrder}
        onRequestCancel={onRequestCancel}
      />
    ),
  },
];
