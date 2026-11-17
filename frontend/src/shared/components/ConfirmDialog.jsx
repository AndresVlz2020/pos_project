import { useEffect } from "react";
import Button from "./Button";
import M3Icon from "./M3Icon";
import { IconButton } from "./IconButton";

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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[var(--md-sys-color-scrim)] backdrop-blur-xs font-[family-name:var(--main-font)]">
      <div
        role="alertdialog"
        aria-modal="true"
        className="dpiero-modal-in w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] rounded-[28px] p-6 m3-elevation-3 text-[var(--md-sys-color-on-surface)]"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`size-10 flex items-center justify-center rounded-full shrink-0 ${
                isDestructive
                  ? "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
                  : "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
              }`}
            >
              <M3Icon name="warning" filled size={20} />
            </div>
            <h3 className="text-2xl leading-8 font-medium text-[var(--md-sys-color-on-surface)]">
              {title}
            </h3>
          </div>
          <IconButton
            ariaLabel="Cerrar diálogo"
            variant="standard"
            onClick={onCancel}
          >
            <M3Icon name="close" size={20} />
          </IconButton>
        </div>

        <p className="text-sm leading-5 text-[var(--md-sys-color-on-surface-variant)] mb-6">
          {description}
        </p>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="text"
            size="md"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "filled"}
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
