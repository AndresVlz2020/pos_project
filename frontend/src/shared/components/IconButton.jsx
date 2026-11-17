import React from "react";
import clsx from "clsx";

/**
 * IconButton literal Material Design 3
 * Variantes: standard | filled | tonal | outlined (+ alias default, ghost, primary, secondary)
 */
export const IconButton = React.forwardRef(function IconButton(
  {
    children,
    onClick,
    disabled = false,
    className = "",
    variant = "standard",
    type = "button",
    hitSize = 40,
    iconSize = 20,
    ariaLabel,
    isActive = false,
    ...props
  },
  ref
) {
  const normalizedVariant =
    variant === "default" || variant === "ghost"
      ? "standard"
      : variant === "primary"
      ? "filled"
      : variant === "secondary"
      ? "tonal"
      : variant;

  const variants = {
    standard:
      "bg-transparent text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]",
    filled:
      "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]",
    tonal:
      "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]",
    outlined:
      "bg-transparent border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]",
  };

  return (
    <button
      ref={ref}
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "m3-state inline-flex items-center justify-center shrink-0 p-0 rounded-full cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--md-sys-color-surface)]",
        "disabled:opacity-38 disabled:pointer-events-none",
        variants[normalizedVariant] || variants.standard,
        isActive &&
          normalizedVariant === "standard" &&
          "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]",
        className
      )}
      style={{
        width: `${Math.max(40, hitSize)}px`,
        height: `${Math.max(40, hitSize)}px`,
        minWidth: `${Math.max(40, hitSize)}px`,
        minHeight: `${Math.max(40, hitSize)}px`,
      }}
      {...props}
    >
      <span
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
        }}
        className="flex items-center justify-center shrink-0 pointer-events-none"
      >
        {children}
      </span>
    </button>
  );
});
