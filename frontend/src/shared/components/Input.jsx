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
  hidePasswordToggle = false,
  className = "",
  onFocus,
  onBlur,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === "password" && !hidePasswordToggle;
  const resolvedType = isPasswordField && showPassword ? "text" : type;

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
            <M3Icon name={leadingIcon} size={24} />
          </span>
        )}
        <input
          id={htmlFor || props.id || props.name}
          type={resolvedType}
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
            ${leadingIcon ? "pl-[54px] pr-4" : "px-4"}
            ${isPasswordField ? (error ? "pr-20" : "pr-12") : ""}
            text-[var(--md-sys-color-on-surface)]
            placeholder:text-[var(--md-sys-color-on-surface-variant)]/70
            focus:outline-none
            ${focused ? "is-focused" : ""}
            ${error ? "is-error" : ""}
            ${error && !isPasswordField ? "pr-10" : ""}
            ${props.disabled ? "is-disabled opacity-50 cursor-not-allowed bg-[var(--md-sys-color-surface-container)]/50" : ""}
            ${className}
          `}
          {...props}
        />
        {isPasswordField && !props.disabled && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className={`m3-state !absolute ${
              error ? "right-10" : "right-2"
            } top-1/2 -translate-y-1/2 z-10 flex items-center justify-center size-10 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer`}
          >
            <M3Icon name={showPassword ? "visibility_off" : "visibility"} size={20} />
          </button>
        )}
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
