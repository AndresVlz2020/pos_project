// src/features/orders/components/CancelOrderModal.jsx
import { ConfirmDialog } from "@/shared";

export function CancelOrderModal({
  isOpen = false,
  orderNumber = "",
  orderStatus = "abierta",
  onConfirmCancel,
  onClose,
}) {
  const isLocked = orderStatus === "pagada" || orderStatus === "cerrada";

  const description = isLocked
    ? `Esta orden se encuentra en estado "${orderStatus}". Las órdenes facturadas o cerradas no pueden ser anuladas directamente.`
    : `¿Está seguro de que desea anular la comanda de la orden #${orderNumber}? Esta acción liberará la mesa asociada.`;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={isLocked ? "No se puede anular la orden" : `Anular Orden #${orderNumber}`}
      description={description}
      confirmText={isLocked ? "Entendido" : "Anular Comanda"}
      cancelText={isLocked ? "" : "Conservar Orden"}
      onConfirm={isLocked ? onClose : onConfirmCancel}
      onCancel={onClose}
      isDestructive={!isLocked}
    />
  );
}

export default CancelOrderModal;

