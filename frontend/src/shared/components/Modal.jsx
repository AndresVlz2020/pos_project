import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function Modal({
  isOpen = false,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
  className = "",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`dpiero-modal-in w-full ${maxWidth} rounded-xl bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] p-6 shadow-2xl text-[var(--color-white)] transition-all ${className}`}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--color-secondary-800)]">
          {title && <h3 className="text-lg font-bold text-[var(--color-white)]">{title}</h3>}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal"
              className="text-[var(--color-gray-400)] hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;
