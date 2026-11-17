import { useEffect } from "react";
import clsx from "clsx";
import M3Icon from "./M3Icon";

const iconNames = {
  success: "check_circle",
  error: "error",
  warning: "warning",
  info: "info",
};

const styles = {
  success:
    "bg-[var(--color-success-bg)] border-[var(--color-success-border)] text-[var(--color-success)]",
  error:
    "bg-[var(--md-sys-color-error-container)] border-[var(--color-error-border)] text-[var(--md-sys-color-on-error-container)]",
  warning:
    "bg-[var(--color-warning-bg)] border-[var(--color-warning-border)] text-[var(--color-warning)]",
  info:
    "bg-[var(--md-sys-color-primary-container)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-primary-container)]",
};

export default function Alert({
  type = "info",
  title,
  message,
  onClose,
  autoClose = false,
  duration = 5000,
  className = "",
}) {
  useEffect(() => {
    if (!autoClose || !onClose) return;
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [autoClose, duration, onClose]);

  return (
    <div
      role="alert"
      className={clsx(
        "flex items-start gap-3 px-4 py-3.5 rounded-xl border m3-elevation-1",
        styles[type] || styles.info,
        className
      )}
    >
      <M3Icon
        name={iconNames[type] || "info"}
        filled
        size={20}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-medium text-sm leading-5 mb-0.5">{title}</h4>
        )}
        {message && (
          <p className="text-xs leading-4 opacity-90">{message}</p>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar notificación"
          className="m3-state size-10 flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer shrink-0 -my-1 -mr-1"
        >
          <M3Icon name="close" size={18} />
        </button>
      )}
    </div>
  );
}
