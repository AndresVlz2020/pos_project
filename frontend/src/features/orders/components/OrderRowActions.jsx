import { Eye, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showErrorAlert } from "@/shared";

export default function OrderRowActions({ order, onViewOrder, canEdit = true }) {
  const navigate = useNavigate();

  const isPaid = order.status === "Pagada";

  const handleEdit = () => {
    if (isPaid) {
      showErrorAlert({
        title: "Operación no permitida",
        text: `La orden ${order.id} se encuentra en estado "Pagada" y no puede ser modificada.`,
      });
      return;
    }

    const qty = {};
    (order.items || []).forEach((it) => {
      qty[it.id] = it.qty;
    });

    navigate("/editorder", {
      state: {
        form: {
          id: order.id,
          tableNumber: order.tableNumber,
          waiter: order.waiter,
          observations: order.observations,
          orderStatus: order.status,
        },
        qty,
      },
    });
  };

  return (
    <div className="flex gap-2">
      {canEdit && (
        <button
          type="button"
          onClick={handleEdit}
          aria-label="Editar orden"
          className="size-10 inline-flex items-center justify-center rounded-full bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-500)] text-[var(--color-white)] hover:text-[var(--color-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 transition cursor-pointer border border-[var(--color-secondary-700)]"
          title="Editar orden"
        >
          <Pencil size={18} />
        </button>
      )}

      <button
        type="button"
        onClick={() => onViewOrder && onViewOrder(order)}
        aria-label="Ver orden"
        className="size-10 inline-flex items-center justify-center rounded-full bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-600)] text-[var(--color-gray-300)] hover:text-[var(--color-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 transition cursor-pointer border border-[var(--color-secondary-700)]"
        title="Ver orden"
      >
        <Eye size={18} />
      </button>
    </div>
  );
}
