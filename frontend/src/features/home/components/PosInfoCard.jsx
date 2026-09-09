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
    <div className="rounded-lg border border-[var(--color-primary-800)] bg-[var(--color-primary-900)] p-4 flex flex-col justify-between space-y-3 font-[family-name:var(--main-font)] hover:border-[var(--color-primary-700)] transition-colors">
      <div>
        {/* Fila Superior: Badges compactos limpios */}
        <div className="flex items-center justify-between gap-2">
          {tagLeft && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-primary-800)] text-[var(--color-secondary-300)] font-bold">
              {tagLeft}
            </span>
          )}
          {tagRight && (
            <span className="text-[10px] font-semibold text-[var(--color-secondary-300)] bg-[var(--color-primary-800)] px-2 py-0.5 rounded border border-[var(--color-primary-700)]">
              {tagRight}
            </span>
          )}
        </div>

        {/* Título Principal */}
        <h4 className="text-sm font-bold text-[var(--color-white)] mt-2 line-clamp-1">
          {title}
        </h4>

        {/* Subtítulo / Descripción Secundaria */}
        {subtitle && (
          <p className="text-xs text-[var(--color-gray-400)] font-mono mt-0.5 line-clamp-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Fila Inferior: Información + Botón de Acción plano */}
      <div className={`pt-2.5 border-t border-[var(--color-primary-800)] flex items-center ${bottomText || BottomIcon ? "justify-between" : "justify-end"} text-xs`}>
        {(bottomText || BottomIcon) && (
          <div className="flex items-center gap-1 text-[var(--color-secondary-300)] font-semibold text-[11px]">
            {BottomIcon && <BottomIcon className="size-3.5 shrink-0" />}
            {bottomText && <span>{bottomText}</span>}
          </div>
        )}

        {actionLink ? (
          <Link
            to={actionLink}
            aria-label={actionAriaLabel || actionLabel}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-[11px] font-semibold text-white transition-colors cursor-pointer"
          >
            {ActionIcon && <ActionIcon className="size-3" />}
            <span>{actionLabel}</span>
          </Link>
        ) : onActionClick ? (
          <button
            type="button"
            onClick={onActionClick}
            aria-label={actionAriaLabel || actionLabel}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-[11px] font-semibold text-white transition-colors cursor-pointer"
          >
            {ActionIcon && <ActionIcon className="size-3" />}
            <span>{actionLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
