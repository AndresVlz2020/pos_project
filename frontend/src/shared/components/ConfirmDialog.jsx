// src/shared/components/ConfirmDialog.jsx
import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";

export function ConfirmDialog({
  isOpen = false,
  title = "Confirmar acción",
  description = "¿Está seguro de que desea realizar esta acción? Esta operación no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  isDestructive = false,
  isLoading = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && onCancel) {
        onCancel();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-secondary-950)]/80 backdrop-blur-xs animate-fade-in font-[family-name:var(--main-font)]">
      <div className="dpiero-modal-in w-full max-w-md bg-[var(--color-secondary-900)] border border-[var(--color-secondary-700)] rounded-[28px] p-6 shadow-2xl text-[var(--color-white)]">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`size-10 flex items-center justify-center rounded-full shrink-0 ${
                isDestructive
                  ? "bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-error-border)]"
                  : "bg-[var(--color-primary-500)]/20 text-[var(--color-primary-400)] border border-[var(--color-primary-500)]/30"
              }`}
            >
              <AlertTriangle className="size-5" />
            </div>
            <h3 className="text-title-lg font-bold text-[var(--color-white)]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar diálogo"
            className="text-[var(--color-gray-400)] hover:text-[var(--color-white)] hover:bg-[var(--color-secondary-800)] size-10 flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 cursor-pointer shrink-0"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="text-sm leading-5 text-[var(--color-gray-300)] mb-6">
          {description}
        </p>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "primary"}
            size="md"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Procesando..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
