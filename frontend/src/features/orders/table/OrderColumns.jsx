import OrderRowActions from "../components/OrderRowActions";
import { PaymentMethodBadge } from "../components/PaymentMethodCards";
import { TableIllustration } from "../components/TableSelectorGrid";
import {
  extractTableNumber,
  getOrderStatusBadgeMeta,
  normalizeOrderStatus,
} from "../utils/orderFormHelpers";

export const getOrderColumns = ({
  onViewOrder,
  onRequestCancel,
  canEdit = true,
  canPay = true,
} = {}) => [
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
            sizeClassName="w-12 h-9"
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
        <span className="text-[var(--md-sys-color-on-surface-variant)]">
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
      return (
        <span className="font-semibold text-[var(--md-sys-color-on-surface)] tabular-nums">
          ${total.toLocaleString("es-CO")}
        </span>
      );
    },
  },
  {
    id: "status",
    accessorFn: (row) => {
      const status = normalizeOrderStatus(row.status);
      const method = row.paymentMethod || row.payment_method || "";
      return status === "Pagada" && method ? `${status} ${method}` : status;
    },
    header: "Estado",
    cell: ({ row }) => {
      const status = normalizeOrderStatus(row.original.status);
      const meta = getOrderStatusBadgeMeta(status);
      const method = row.original.paymentMethod || row.original.payment_method;

      return (
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-label-sm font-medium rounded-full ${meta.className}`}
          >
            {meta.label}
          </span>
          {status === "Pagada" && method && <PaymentMethodBadge method={method} />}
        </div>
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
        canPay={canPay}
      />
    ),
  },
];
