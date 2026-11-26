import M3Icon from "./M3Icon";

export default function Button({
  variant = "filled",
  size = "md",
  type = "button",
  leadingIcon,
  trailingIcon,
  className = "",
  children,
  ...props
}) {
  const normalizedVariant =
    variant === "primary"
      ? "filled"
      : variant === "secondary"
      ? "outlined"
      : variant;

  const variants = {
    filled:
      "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border border-transparent m3-elevation-0 hover:m3-elevation-1",
    tonal:
      "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border border-transparent",
    elevated:
      "bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-primary)] border border-transparent m3-elevation-1 hover:m3-elevation-2",
    outlined:
      "bg-transparent border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)]",
    text:
      "bg-transparent border border-transparent text-[var(--md-sys-color-primary)]",
    destructive:
      "bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] border border-transparent",
  };

  const sizes = {
    sm: normalizedVariant === "text" ? "h-10 px-3 text-sm font-medium gap-4" : "h-10 px-4 text-sm font-medium gap-4",
    md: normalizedVariant === "text" ? "h-10 px-4 text-sm font-medium gap-4" : "h-10 px-6 text-sm font-medium gap-4",
    lg: "h-12 px-6 text-sm font-medium gap-4",
    icon: "size-10 p-0",
  };

  return (
    <button
      type={type}
      className={`
        m3-state inline-flex items-center justify-center shrink-0
        rounded-full leading-5 tracking-[0.00625em]
        cursor-pointer select-none whitespace-nowrap
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--md-sys-color-surface)]
        disabled:opacity-38 disabled:pointer-events-none disabled:cursor-not-allowed
        ${variants[normalizedVariant] || variants.filled}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {leadingIcon && <M3Icon name={leadingIcon} size={18} />}
      {children}
      {trailingIcon && <M3Icon name={trailingIcon} size={18} />}
    </button>
  );
}
