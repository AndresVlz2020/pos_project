import OrderRowActions from "../components/OrderRowActions";
import { PaymentMethodBadge } from "../components/PaymentMethodCards";
import { TableIllustration } from "../components/TableSelectorGrid";
import {
  extractTableNumber,
  normalizeOrderStatus,
} from "../utils/orderFormHelpers";

export const getOrderColumns = ({ onViewOrder, onRequestCancel, canEdit = true } = {}) => [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "tableNumber",
    header: "Mesa",
    cell: ({ row }) => {
      const rawTable = row.original.tableNumber || row.original.table_number || "";
      const tableNum = extractTableNumber({ tableNumber: rawTable, id: rawTable });
      return (
        <div
          className="inline-flex items-center justify-center"
          title={rawTable || `Mesa ${tableNum}`}
          aria-label={rawTable || `Mesa ${tableNum}`}
        >
          <TableIllustration
            number={tableNum || "—"}
            isAvailable
            isSelected={false}
            sizeClassName="w-12 h-[38px]"
          />
        </div>
      );
    },
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
    id: "status",
    accessorFn: (row) => {
      const status = row.status || "No Pagada";
      const method = row.paymentMethod || row.payment_method || "";
      return status === "Pagada" && method ? `${status} ${method}` : status;
    },
    header: "Estado",
    cell: ({ row }) => {
      const rawStatus = row.original.status || "No Pagada";
      const isCanceled = String(rawStatus).trim().toLowerCase() === "anulada";
      const normalizedStatus = normalizeOrderStatus(rawStatus);

      if (!isCanceled && normalizedStatus === "Pagada") {
        return (
          <PaymentMethodBadge
            method={row.original.paymentMethod || row.original.payment_method}
          />
        );
      }

      const style = isCanceled
        ? "bg-[var(--color-error-bg)] text-[var(--color-error)] border-[var(--color-error-border)]"
        : "bg-[var(--color-primary-500)]/15 text-[var(--color-primary-400)] border-[var(--color-primary-500)]/40";
      return (
        <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md border ${style}`}>
          {isCanceled ? "Anulada" : normalizedStatus}
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
