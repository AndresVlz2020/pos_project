import OrderRowActions from "../components/OrderRowActions";

export const getOrderColumns = ({ onViewOrder, onRequestCancel, canEdit = true } = {}) => [
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
      const status = row.original.status || "No Pagada";
      const style = status === "Pagada"
        ? "bg-[var(--color-white)]/10 text-[var(--color-white)] border-[var(--color-white)]/30"
        : status === "Anulada"
          ? "bg-[var(--color-secondary-800)] text-[var(--color-secondary-200)] border-[var(--color-secondary-600)]"
          : "bg-[var(--color-primary-500)]/15 text-[var(--color-primary-400)] border-[var(--color-primary-500)]/40";
      return (
        <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md border ${style}`}>
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
        canEdit={canEdit}
      />
    ),
  },
];
