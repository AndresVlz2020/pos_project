import OrderRowActions from "../components/OrderRowActions";

export const getOrderColumns = ({ onViewOrder, onRequestCancel } = {}) => [
  {
    accessorKey: "id",
    header: "ID Orden",
    cell: ({ row }) => (
      <span className="font-mono font-bold text-[var(--color-primary-400)]">
        {row.original.id}
      </span>
    ),
  },
  {
    accessorKey: "tableNumber",
    header: "Mesa",
    cell: ({ row }) => (
      <span className="font-semibold text-white">
        {row.original.tableNumber}
      </span>
    ),
  },
  {
    accessorKey: "waiter",
    header: "Mesero",
  },
  {
    accessorKey: "items",
    header: "Resumen Items",
    cell: ({ row }) => {
      const items = row.original.items || [];
      const totalQty = items.reduce((sum, it) => sum + (it.qty || 1), 0);
      return (
        <span className="text-xs text-[var(--color-gray-300)]">
          {totalQty} {totalQty === 1 ? "ítem" : "ítems"} ({items.map((i) => i.name?.split(" ")[0]).slice(0, 2).join(", ")}...)
        </span>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const total = Number(row.original.total || 0);
      return (
        <span className="font-bold text-emerald-400">
          ${total.toLocaleString("es-CO")}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status || "Abierta";
      let badgeStyle = "bg-gray-800 text-gray-300 border-gray-700";

      if (status === "Abierta") {
        badgeStyle = "bg-emerald-950 text-emerald-400 border-emerald-800";
      } else if (status === "En preparación" || status === "en_proceso") {
        badgeStyle = "bg-amber-950 text-amber-400 border-amber-800";
      } else if (status === "Pagada") {
        badgeStyle = "bg-blue-950 text-blue-400 border-blue-800";
      } else if (status === "Cerrada") {
        badgeStyle = "bg-purple-950 text-purple-400 border-purple-800";
      } else if (status === "Anulada") {
        badgeStyle = "bg-red-950 text-red-400 border-red-800";
      }

      return (
        <span
          className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded border ${badgeStyle}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Fecha / Hora",
    cell: ({ row }) => (
      <span className="text-xs text-[var(--color-gray-400)]">
        {row.original.createdAt || "2026-09-28 19:00"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <OrderRowActions
        order={row.original}
        onViewOrder={onViewOrder}
        onRequestCancel={onRequestCancel}
      />
    ),
  },
];
