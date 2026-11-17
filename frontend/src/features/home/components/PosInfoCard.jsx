import { Link } from "react-router-dom";

/**
 * Componente modular de tarjeta interactiva para módulos del POS (Clientes, Personal, etc.)
 * Estructurado con tokens de diseño y variables CSS de la aplicación.
 */
export default function PosInfoCard({
  tagLeft,
  tagRight,
  title,
  subtitle,
  bottomIcon: BottomIcon,
  bottomText,
  actionIcon: ActionIcon,
  actionLabel,
  actionLink,
  onActionClick,
  actionAriaLabel
}) {
  return (
    <div className="rounded-xl border border-[var(--color-secondary-800)] bg-[var(--color-secondary-900)] p-4 flex flex-col justify-between space-y-3 font-[family-name:var(--main-font)] hover:border-[var(--color-secondary-700)] transition-colors">
      <div>
        {/* Fila Superior: Badges compactos limpios (solo si existen) */}
        {(tagLeft || tagRight) && (
          <div className="flex items-center justify-between gap-2 mb-2">
            {tagLeft && (
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[var(--color-secondary-800)] text-[var(--color-primary-300)] font-semibold">
                {tagLeft}
              </span>
            )}
            {tagRight && (
              <span className="text-xs font-semibold text-[var(--color-primary-300)] bg-[var(--color-secondary-800)] px-2.5 py-0.5 rounded-full border border-[var(--color-secondary-700)]">
                {tagRight}
              </span>
            )}
          </div>
        )}

        {/* Título Principal */}
        <h4 className="text-base leading-6 font-bold text-[var(--color-white)] line-clamp-1">
          {title}
        </h4>

        {/* Subtítulo / Descripción Secundaria */}
        {subtitle && (
          <p className="text-xs leading-4 text-[var(--color-gray-400)] font-mono mt-0.5 line-clamp-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Fila Inferior: Información + Botón de Acción plano */}
      <div className={`pt-2.5 border-t border-[var(--color-secondary-800)] flex items-center ${bottomText || BottomIcon ? "justify-between" : "justify-end"} text-xs`}>
        {(bottomText || BottomIcon) && (
          <div className="flex items-center gap-1.5 text-[var(--color-primary-300)] font-semibold text-xs">
            {BottomIcon && <BottomIcon className="size-3.5 shrink-0" />}
            {bottomText && <span>{bottomText}</span>}
          </div>
        )}

        {actionLink ? (
          <Link
            to={actionLink}
            aria-label={actionAriaLabel || actionLabel}
            className="min-h-[40px] inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-sm font-medium text-[var(--color-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 transition-colors cursor-pointer"
          >
            {ActionIcon && <ActionIcon className="size-4" />}
            <span>{actionLabel}</span>
          </Link>
        ) : onActionClick ? (
          <button
            type="button"
            onClick={onActionClick}
            aria-label={actionAriaLabel || actionLabel}
            className="min-h-[40px] inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-sm font-medium text-[var(--color-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 transition-colors cursor-pointer"
          >
            {ActionIcon && <ActionIcon className="size-4" />}
            <span>{actionLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
