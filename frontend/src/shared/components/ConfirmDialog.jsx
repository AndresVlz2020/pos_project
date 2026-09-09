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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
      <div className="w-full max-w-md bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-lg p-6 shadow-xl text-[var(--color-white)]">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${isDestructive ? "bg-red-500/20 text-red-400" : "bg-[var(--color-secondary-500)]/20 text-[var(--color-secondary-400)]"}`}>
              <AlertTriangle className="size-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-white)]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar diálogo"
            className="text-[var(--color-gray-400)] hover:text-[var(--color-white)] p-1 rounded-md transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="text-xs text-[var(--color-gray-300)] leading-relaxed mb-6">
          {description}
        </p>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className={isDestructive ? "bg-red-600 hover:bg-red-500 border-red-500" : ""}
          >
            {isLoading ? "Procesando..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
