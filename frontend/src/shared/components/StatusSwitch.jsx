import M3Icon from "./M3Icon";

/**
 * Switch literal Google Material Design 3 (52x32dp track, 24dp thumb checked, outline when unchecked)
 */
export default function StatusSwitch({
  checked = false,
  onChange,
  disabled = false,
  size = "md",
}) {
  const isChecked = Boolean(checked);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    onChange?.(!isChecked);
  };

  const trackSizes = {
    sm: "h-7 w-12",
    md: "h-8 w-[52px]",
    lg: "h-9 w-16",
  };

  const knobSizes = {
    sm: "size-6",
    md: "size-6",
    lg: "size-7",
  };

  const knobPositions = {
    sm: isChecked ? "translate-x-[20px]" : "translate-x-0.5",
    md: isChecked ? "translate-x-[22px]" : "translate-x-0.5",
    lg: isChecked ? "translate-x-[30px]" : "translate-x-0.5",
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-label={isChecked ? "Habilitado / Activo" : "Inhabilitado / Inactivo"}
      onClick={handleToggle}
      disabled={disabled}
      className={`
        relative inline-flex items-center rounded-full shrink-0
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--md-sys-color-surface)]
        ${trackSizes[size] || trackSizes.md}
        ${
          isChecked
            ? "bg-[var(--md-sys-color-primary)] border-2 border-[var(--md-sys-color-primary)]"
            : "bg-[var(--md-sys-color-surface-container-highest)] border-2 border-[var(--md-sys-color-outline)]"
        }
        ${disabled ? "opacity-38 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span
        className={`
          flex items-center justify-center rounded-full transition-transform duration-150
          ${knobSizes[size] || knobSizes.md}
          ${knobPositions[size] || knobPositions.md}
          ${
            isChecked
              ? "bg-[var(--md-sys-color-on-primary)] text-[var(--md-sys-color-on-primary-container)]"
              : "bg-[var(--md-sys-color-outline)] text-[var(--md-sys-color-surface-container-highest)]"
          }
        `}
      >
        <M3Icon name={isChecked ? "check" : "close"} size={14} />
      </span>
    </button>
  );
}
