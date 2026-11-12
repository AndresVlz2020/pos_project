// Iconos usados dentro del switch
import { Check, X } from "lucide-react";

/**
 * Componente controlado para representar un switch de estado (habilitado / inhabilitado).
 * No muta su estado internamente: la acción de cambio solo se consolida cuando el
 * componente padre valida la confirmación mediante el botón del diálogo.
 */
export default function StatusSwitch({
  checked = false,   // Valor controlado directamente desde el registro en PostgreSQL
  onChange,          // Callback que notifica la solicitud de cambio (abre diálogo de confirmación)
  disabled = false,  // Permite deshabilitar la interacción
  size = "md",       // Tamaño del switch (sm, md, lg)
}) {
  const isChecked = Boolean(checked);

  // Función que maneja el click en el switch
  // Solo solicita el cambio al componente padre sin mutar el switch prematuramente
  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    if (onChange) {
      onChange(!isChecked);
    }
  };

  // Clases de tamaño del contenedor del switch
  const sizes = {
    sm: "h-5 w-9",
    md: "h-6 w-11",
    lg: "h-7 w-14",
  };

  // Clases de tamaño del "knob" (el círculo que se mueve)
  const knobSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
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
        relative inline-flex items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/40
        ${sizes[size]}
        ${isChecked ? "bg-[var(--color-primary-500)]" : "bg-[var(--color-secondary-700)]"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {/* Knob del switch (el círculo que se desplaza de izquierda a derecha) */}
      <span
        className={`
          absolute left-0.5 flex items-center justify-center rounded-full bg-[var(--color-white)] shadow transition-transform duration-200
          ${knobSizes[size]}
          ${isChecked ? "translate-x-full" : "translate-x-0"}
        `}
      >
        {isChecked ? (
          <Check size={12} className="text-[var(--color-secondary-950)]" />
        ) : (
          <X size={12} className="text-[var(--color-secondary-700)]" />
        )}
      </span>
    </button>
  );
}
