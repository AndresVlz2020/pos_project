import { useNavigate } from "react-router-dom";
import { IconButton, M3Icon, showErrorAlert } from "@/shared";
import { normalizeOrderStatus } from "../utils/orderFormHelpers";

export default function OrderRowActions({
  order,
  onViewOrder,
  canEdit = true,
  canPay = true,
}) {
  const navigate = useNavigate();

  const status = normalizeOrderStatus(order.status);
  const isClosed = status === "Pagada" || status === "Anulada";

  const handleEdit = () => {
    if (isClosed) {
      showErrorAlert({
        title: "Operación no permitida",
        text: `La orden ${order.id} se encuentra en estado "${status}" y no puede ser modificada.`,
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
          orderStatus: status,
        },
        qty,
      },
    });
  };

  const editTitle = isClosed
    ? `Orden ${status.toLowerCase()} (cerrada)`
    : status === "Completada"
      ? canPay
        ? "Cobrar / Editar orden"
        : "Editar platillos y notas"
      : "Editar orden";

  return (
    <div className="flex items-center gap-1.5">
      {canEdit && (
        <IconButton
          variant="tonal"
          hitSize={40}
          iconSize={18}
          ariaLabel="Editar orden"
          title={editTitle}
          className={isClosed ? "opacity-40" : ""}
          onClick={handleEdit}
        >
          <M3Icon name="edit" size={18} />
        </IconButton>
      )}

      <IconButton
        variant="standard"
        hitSize={40}
        iconSize={18}
        ariaLabel="Ver orden"
        title="Ver orden"
        onClick={() => onViewOrder && onViewOrder(order)}
      >
        <M3Icon name="visibility" size={18} />
      </IconButton>
    </div>
  );
}
