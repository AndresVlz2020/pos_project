//src/shared/components/IconButton.jsx

import React from "react";
import clsx from "clsx";

/**
 * IconButton
 * - Área táctil (hit area): tamaño del botón
 * - Área visible: tamaño del ícono (controlado por wrapper interno)
 */

// React.forwardRef"puente para que el padre controle el DOM interno".

export const IconButton = React.forwardRef(function IconButton(
  {
    children,
    onClick,
    disabled = false,
    className = "",
    variant = "default",

    // Tamaños
    hitSize = 48,    // px (área táctil)
    iconSize = 24,   // px (ícono visible)

    // Accesibilidad
    ariaLabel,

    // Estados
    isActive = false,

    ...props
  },
  ref
) {
  const baseStyles = `
    inline-flex items-center justify-center
    rounded-full
    transition-colors duration-200
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:pointer-events-none
  `;

  const variants = {
    default: `
      text-[var(--color-white)]
      hover:bg-[var(--color-primary-800)]
      focus-visible:ring-[var(--color-primary-600)]
      cursor-pointer
    `,
    ghost: `
      text-[var(--color-gray-300)]
      hover:text-[var(--color-white)]
      hover:bg-[var(--color-primary-800)]
      focus-visible:ring-[var(--color-primary-600)]
      cursor-pointer
    `,
    primary: `
      text-[var(--color-white)]
      bg-[var(--color-secondary-500)]
      hover:bg-[var(--color-secondary-400)]
      border border-[var(--color-secondary-400)]
      focus-visible:ring-[var(--color-secondary-400)]
      shadow-sm
      cursor-pointer
    `,
    secondary: `
      text-[var(--color-white)]
      bg-[var(--color-primary-800)]
      hover:bg-[var(--color-primary-700)]
      border border-[var(--color-primary-700)]
      focus-visible:ring-[var(--color-primary-600)]
      cursor-pointer
    `,
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={clsx(baseStyles, variants[variant], className, {
        "bg-[var(--color-primary-800)]": isActive,
      })}
      style={{
        width: `${hitSize}px`,
        height: `${hitSize}px`,
      }}
      {...props}
    >
      <span
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
        }}
        className="flex items-center justify-center"
      >
        {children}
      </span>
    </button>
  );
});