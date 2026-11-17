import { useState } from "react";
import M3Icon from "./M3Icon";

export default function Input({
  label,
  error,
  supportingText,
  htmlFor,
  leadingIcon,
  type = "text",
  variant = "primary",
  size = "lg",
  className = "",
  onFocus,
  onBlur,
  ...props
}) {
  const [focused, setFocused] = useState(false);

  const sizes = {
    sm: "h-10 text-sm",
    md: "h-12 text-base",
    lg: "h-14 text-base",
  };

  const bgSurface =
    variant === "secondary"
      ? "bg-[var(--md-sys-color-surface)]"
      : "bg-transparent";

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={htmlFor || props.id || props.name}
          className={`block text-xs leading-4 mb-1.5 font-medium ${
            error
              ? "text-[var(--md-sys-color-error)]"
              : focused
              ? "text-[var(--md-sys-color-primary)]"
              : "text-[var(--md-sys-color-on-surface-variant)]"
          }`}
        >
          {label}
        </label>
      )}

      <div className="relative w-full flex items-center">
        {leadingIcon && (
          <span className="absolute left-3.5 flex items-center pointer-events-none text-[var(--md-sys-color-on-surface-variant)]">
            <M3Icon name={leadingIcon} size={20} />
          </span>
        )}
        <input
          id={htmlFor || props.id || props.name}
          type={type}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={`
            m3-outlined-field w-full
            ${sizes[size] || sizes.lg}
            ${bgSurface}
            ${leadingIcon ? "pl-11 pr-4" : "px-4"}
            text-[var(--md-sys-color-on-surface)]
            placeholder:text-[var(--md-sys-color-on-surface-variant)]/70
            focus:outline-none
            ${focused ? "is-focused" : ""}
            ${error ? "is-error pr-10" : ""}
            ${props.disabled ? "is-disabled opacity-50 cursor-not-allowed bg-[var(--md-sys-color-surface-container)]/50" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="absolute right-3 flex items-center pointer-events-none text-[var(--md-sys-color-error)]">
            <M3Icon name="error" filled size={20} />
          </span>
        )}
      </div>

      {error ? (
        <p className="text-xs leading-4 text-[var(--md-sys-color-error)] mt-1 flex items-center gap-1">
          {error}
        </p>
      ) : supportingText ? (
        <p className="text-xs leading-4 text-[var(--md-sys-color-on-surface-variant)] mt-1">
          {supportingText}
        </p>
      ) : null}
    </div>
  );
}
