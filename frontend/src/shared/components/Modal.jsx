import { useEffect } from "react";
import { createPortal } from "react-dom";
import M3Icon from "./M3Icon";
import { IconButton } from "./IconButton";
import { useScrollLock } from "../hooks/useScrollLock";

export function Modal({
  isOpen = false,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
  className = "",
}) {
  useScrollLock(isOpen);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[var(--md-sys-color-scrim)] backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        className={`dpiero-modal-in w-full ${maxWidth} max-h-[90dvh] flex flex-col overflow-hidden rounded-[28px] bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] p-6 m3-elevation-3 text-[var(--md-sys-color-on-surface)] ${className}`}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--md-sys-color-outline-variant)] shrink-0">
            {title ? (
              <h3 className="text-2xl leading-8 font-medium text-[var(--md-sys-color-on-surface)] truncate">
                {title}
              </h3>
            ) : (
              <span />
            )}
            {onClose && (
              <IconButton
                ariaLabel="Cerrar modal"
                variant="standard"
                onClick={onClose}
              >
                <M3Icon name="close" size={20} />
              </IconButton>
            )}
          </div>
        )}
        <div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0 pr-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;
