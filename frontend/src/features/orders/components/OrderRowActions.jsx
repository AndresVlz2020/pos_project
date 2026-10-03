import { Eye, Pencil, Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showErrorAlert } from "@/shared";

export default function OrderRowActions({ order, onViewOrder, onRequestCancel }) {
  const navigate = useNavigate();

  const isClosedOrPaid = order.status === "Pagada" || order.status === "Cerrada";
  const isCanceled = order.status === "Anulada";

  const handleEdit = () => {
    // Regla RFADMIN30: Bloquea modificar órdenes pagadas o cerradas
    if (isClosedOrPaid) {
      showErrorAlert({
        title: "Operación no permitida",
        text: `La orden ${order.id} se encuentra en estado "${order.status}" y no puede ser modificada.`,
      });
      return;
    }
    if (isCanceled) {
      showErrorAlert({
        title: "Orden anulada",
        text: `La orden ${order.id} está anulada y no puede ser editada.`,
      });
      return;
    }

    // Convert items back to qty map if needed
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

  const handleCancel = () => {
    // Regla RFADMIN30: Bloquea anular órdenes pagadas o cerradas
    if (isClosedOrPaid) {
      showErrorAlert({
        title: "Operación no permitida",
        text: `La orden ${order.id} se encuentra en estado "${order.status}" y no puede ser anulada.`,
      });
      return;
    }
    if (isCanceled) {
      showErrorAlert({
        title: "Orden ya anulada",
        text: `La orden ${order.id} ya se encuentra anulada.`,
      });
      return;
    }

    if (onRequestCancel) {
      onRequestCancel(order);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onViewOrder && onViewOrder(order)}
        className="p-1.5 rounded-lg bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-600)] text-[var(--color-gray-300)] hover:text-white transition cursor-pointer border border-[var(--color-secondary-700)]"
        title="Consultar comanda / Ver detalle"
      >
        <Eye size={15} />
      </button>

      <button
        onClick={handleEdit}
        disabled={isClosedOrPaid || isCanceled}
        className={`p-1.5 rounded-lg border transition ${
          isClosedOrPaid || isCanceled
            ? "bg-[var(--color-secondary-800)]/40 text-[var(--color-gray-600)] border-[var(--color-secondary-800)] cursor-not-allowed opacity-50"
            : "bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-500)] text-white border-[var(--color-secondary-700)] cursor-pointer"
        }`}
        title={
          isClosedOrPaid || isCanceled
            ? `No editable (${order.status})`
            : "Editar orden"
        }
      >
        <Pencil size={15} />
      </button>

      <button
        onClick={handleCancel}
        disabled={isClosedOrPaid || isCanceled}
        className={`p-1.5 rounded-lg border transition ${
          isClosedOrPaid || isCanceled
            ? "bg-[var(--color-secondary-800)]/40 text-[var(--color-gray-600)] border-[var(--color-secondary-800)] cursor-not-allowed opacity-50"
            : "bg-[var(--color-secondary-800)] hover:bg-red-600 text-red-400 hover:text-white border-[var(--color-secondary-700)] cursor-pointer"
        }`}
        title={
          isClosedOrPaid || isCanceled
            ? `No anulable (${order.status})`
            : "Anular orden"
        }
      >
        <Ban size={15} />
      </button>
    </div>
  );
}
