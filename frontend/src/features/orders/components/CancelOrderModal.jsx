// src/features/orders/components/CancelOrderModal.jsx
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/shared";

export function CancelOrderModal({
  isOpen = false,
  orderNumber = "",
  orderStatus = "abierta",
  onConfirmCancel,
  onClose,
}) {
  if (!isOpen) return null;

  const isLocked = orderStatus === "pagada" || orderStatus === "cerrada";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-md bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-lg p-6 shadow-xl text-[var(--color-white)]">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${isLocked ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>
              <AlertTriangle className="size-5" />
            </div>
            <h3 className="text-base font-bold">
              {isLocked ? "No se puede anular la orden" : `Anular Orden #${orderNumber}`}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-[var(--color-gray-400)] hover:text-[var(--color-white)] p-1 rounded-md transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {isLocked ? (
          <p className="text-xs text-red-300 leading-relaxed mb-6">
            Esta orden se encuentra en estado <strong>"{orderStatus}"</strong>. Las órdenes facturadas o cerradas no pueden ser anuladas directamente.
          </p>
        ) : (
          <p className="text-xs text-[var(--color-gray-300)] leading-relaxed mb-6">
            ¿Está seguro de que desea anular la comanda de la orden <strong>#{orderNumber}</strong>? Esta acción liberará la mesa asociada.
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            {isLocked ? "Entendido" : "Conservar Orden"}
          </Button>

          {!isLocked && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onConfirmCancel}
              className="bg-red-600 hover:bg-red-500 border-red-500"
            >
              Anular Comanda
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CancelOrderModal;
