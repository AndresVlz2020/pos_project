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

  // Clases de tamaño del contenedor del switch (M3 Track estándar: 52x32dp)
  const sizes = {
    sm: "h-7 w-12",
    md: "h-8 w-[52px]",
    lg: "h-9 w-16",
  };

  // Clases de tamaño del "knob" (M3 Thumb: 24x24dp en md)
  const knobSizes = {
    sm: "size-5",
    md: "size-6",
    lg: "size-7",
  };

  const knobTranslate = {
    sm: "translate-x-5",
    md: "translate-x-5",
    lg: "translate-x-7",
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
        ${sizes[size] || sizes.md}
        ${isChecked ? "bg-[var(--color-primary-500)]" : "bg-[var(--color-secondary-700)]"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {/* Knob del switch (el círculo que se desplaza de izquierda a derecha) */}
      <span
        className={`
          absolute left-1 flex items-center justify-center rounded-full bg-[var(--color-on-primary)] shadow transition-transform duration-200
          ${knobSizes[size] || knobSizes.md}
          ${isChecked ? (knobTranslate[size] || knobTranslate.md) : "translate-x-0"}
        `}
      >
        {isChecked ? (
          <Check size={12} className="text-[var(--color-primary-600)]" />
        ) : (
          <X size={12} className="text-[var(--color-gray-500)]" />
        )}
      </span>
    </button>
  );
}
