import { Search } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Componente modular para el encabezado de paneles en POS (Clientes, Personal, etc.)
 * Estructurado con tokens tipográficos y variables de diseño.
 */
export default function PosSectionHeader({
  icon: Icon,
  title,
  subtitle,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Buscar...",
  actionLabel,
  actionIcon: ActionIcon,
  actionLink,
  onActionClick
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-[var(--color-white)] flex items-center gap-2 font-[family-name:var(--main-font)]">
          {Icon && <Icon className="size-5 text-[var(--color-secondary-400)] shrink-0" />}
          <span>{title}</span>
        </h2>
        {subtitle && (
          <p className="text-xs text-[var(--color-gray-400)] mt-0.5 font-[family-name:var(--main-font)]">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onSearchChange && (
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-8 pr-3 py-1.5 rounded-md bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] text-xs text-white placeholder:text-[var(--color-gray-400)] outline-none focus:border-[var(--color-secondary-400)] w-60 font-[family-name:var(--main-font)] transition-colors"
            />
          </div>
        )}

        {actionLabel && actionLink && (
          <Link
            to={actionLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--color-primary-800)] hover:bg-[var(--color-primary-700)] text-xs font-semibold text-[var(--color-white)] border border-[var(--color-primary-700)] transition-colors font-[family-name:var(--main-font)]"
          >
            {ActionIcon && <ActionIcon className="size-3.5" />}
            <span>{actionLabel}</span>
          </Link>
        )}

        {actionLabel && !actionLink && onActionClick && (
          <button
            type="button"
            onClick={onActionClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--color-primary-800)] hover:bg-[var(--color-primary-700)] text-xs font-semibold text-[var(--color-white)] border border-[var(--color-primary-700)] transition-colors font-[family-name:var(--main-font)] cursor-pointer"
          >
            {ActionIcon && <ActionIcon className="size-3.5" />}
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
