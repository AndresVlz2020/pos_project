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
        className="dpiero-modal-in w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] rounded-[28px] p-5 sm:p-6 m3-elevation-3 text-[var(--md-sys-color-on-surface)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`size-10 mt-0.5 flex items-center justify-center rounded-full shrink-0 ${
                isDestructive
                  ? "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
                  : "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
              }`}
            >
              <M3Icon name="warning" filled size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl leading-6 sm:leading-7 font-semibold text-[var(--md-sys-color-on-surface)]">
                {title}
              </h3>
              <p className="text-sm leading-5 text-[var(--md-sys-color-on-surface-variant)] mt-1.5">
                {description}
              </p>
            </div>
          </div>

          <IconButton
            ariaLabel="Cerrar diálogo"
            variant="standard"
            hitSize={40}
            iconSize={20}
            className="-mt-1 -mr-1 shrink-0"
            onClick={onCancel}
          >
            <M3Icon name="close" size={20} />
          </IconButton>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-2.5 mt-6">
          <Button
            type="button"
            variant="text"
            size="md"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "filled"}
            size="md"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Procesando..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
