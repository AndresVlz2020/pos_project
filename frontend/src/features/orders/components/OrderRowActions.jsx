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
          onClick={handleEdit}
          className="p-2 rounded-lg bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-500)] text-[var(--color-white)] transition cursor-pointer border border-[var(--color-secondary-700)]"
          title="Editar orden"
        >
          <Pencil size={15} />
        </button>
      )}

      <button
        onClick={() => onViewOrder && onViewOrder(order)}
        className="p-2 rounded-lg bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-600)] text-[var(--color-gray-300)] hover:text-[var(--color-white)] transition cursor-pointer border border-[var(--color-secondary-700)]"
        title="Ver orden"
      >
        <Eye size={15} />
      </button>
    </div>
  );
}
