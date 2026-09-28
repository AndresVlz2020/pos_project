// src/shared/components/Alert.jsx
import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import clsx from "clsx";

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const styles = {
  success: "bg-[var(--color-primary-900)] border-[var(--color-secondary-500)] text-[var(--color-white)]",
  warning: "bg-[var(--color-primary-900)] border-amber-500 text-[var(--color-white)]",
  error: "bg-[var(--color-primary-900)] border-red-500 text-[var(--color-white)]",
  info: "bg-[var(--color-primary-900)] border-[var(--color-secondary-400)] text-[var(--color-white)]",
};

const iconColors = {
  success: "text-[var(--color-secondary-400)]",
  warning: "text-amber-400",
  error: "text-red-400",
  info: "text-[var(--color-secondary-300)]",
};

export function Alert({
  type = "info",
  title,
  message,
  onClose,
  autoClose = true,
  duration = 4000,
  className = "",
}) {
  const Icon = icons[type] || Info;

  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <div
      role="alert"
      className={clsx(
        "flex items-start gap-3 p-3.5 rounded-md border shadow-md transition-all",
        styles[type],
        className
      )}
    >
      <Icon className={clsx("size-5 shrink-0 mt-0.5", iconColors[type])} />
      <div className="flex-1">
        {title && <h4 className="font-bold text-sm leading-tight mb-0.5">{title}</h4>}
        {message && <p className="text-xs text-[var(--color-gray-300)] leading-relaxed">{message}</p>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar notificación"
          className="text-[var(--color-gray-400)] hover:text-[var(--color-white)] transition-colors p-1 rounded-md"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export default Alert;
