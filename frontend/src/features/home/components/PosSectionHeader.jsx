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
        <h2 className="text-title-lg font-bold text-[var(--color-white)] flex items-center gap-2 font-[family-name:var(--main-font)]">
          {Icon && <Icon className="size-5 text-[var(--color-primary-400)] shrink-0" />}
          <span>{title}</span>
        </h2>
        {subtitle && (
          <p className="text-xs leading-4 text-[var(--color-gray-400)] mt-0.5 font-[family-name:var(--main-font)]">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
        {onSearchChange && (
          <div className="relative flex-1 sm:flex-initial min-w-[160px]">
            <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 pl-10 pr-4 py-2 rounded-full bg-[var(--color-secondary-900)] border border-[var(--color-secondary-700)] text-sm text-[var(--color-white)] placeholder:text-[var(--color-gray-400)] outline-none focus:border-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-primary-400)]/30 w-full sm:w-60 font-[family-name:var(--main-font)] transition-colors"
            />
          </div>
        )}

        {actionLabel && actionLink && (
          <Link
            to={actionLink}
            className="min-h-[40px] inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--color-secondary-800)] hover:bg-[var(--color-secondary-700)] text-sm font-medium text-[var(--color-white)] border border-[var(--color-secondary-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 transition-colors font-[family-name:var(--main-font)] whitespace-nowrap shrink-0"
          >
            {ActionIcon && <ActionIcon className="size-4" />}
            <span>{actionLabel}</span>
          </Link>
        )}

        {actionLabel && !actionLink && onActionClick && (
          <button
            type="button"
            onClick={onActionClick}
            className="min-h-[40px] inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--color-secondary-800)] hover:bg-[var(--color-secondary-700)] text-sm font-medium text-[var(--color-white)] border border-[var(--color-secondary-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 transition-colors font-[family-name:var(--main-font)] cursor-pointer"
          >
            {ActionIcon && <ActionIcon className="size-4" />}
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
