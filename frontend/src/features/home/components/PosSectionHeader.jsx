import { Link } from "react-router-dom";
import { SearchField, M3Icon } from "@/shared";

export default function PosSectionHeader({
  iconName,
  icon: Icon,
  title,
  subtitle,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Buscar...",
  actionLabel,
  actionIconName,
  actionIcon: ActionIcon,
  actionLink,
  onActionClick,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
      <div className="min-w-0">
        <h2 className="text-title-lg font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
          {iconName ? (
            <M3Icon name={iconName} size={22} className="text-[var(--md-sys-color-primary)]" />
          ) : Icon ? (
            <Icon className="size-5 text-[var(--md-sys-color-primary)] shrink-0" />
          ) : null}
          <span className="truncate">{title}</span>
        </h2>
        {subtitle && (
          <p className="text-xs leading-4 text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
        {onSearchChange && (
          <div className="flex-1 sm:flex-initial min-w-0 w-full sm:w-72">
            <SearchField
              asForm={false}
              value={searchQuery}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              size="sm"
              fullWidth
            />
          </div>
        )}

        {actionLabel && actionLink && (
          <Link
            to={actionLink}
            className="m3-state h-10 inline-flex items-center gap-2 px-5 rounded-full bg-[var(--md-sys-color-secondary-container)] text-sm font-medium text-[var(--md-sys-color-on-secondary-container)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] whitespace-nowrap shrink-0"
          >
            {actionIconName ? (
              <M3Icon name={actionIconName} size={18} />
            ) : ActionIcon ? (
              <ActionIcon className="size-4" />
            ) : null}
            <span>{actionLabel}</span>
          </Link>
        )}

        {actionLabel && !actionLink && onActionClick && (
          <button
            type="button"
            onClick={onActionClick}
            className="m3-state h-10 inline-flex items-center gap-2 px-5 rounded-full bg-[var(--md-sys-color-secondary-container)] text-sm font-medium text-[var(--md-sys-color-on-secondary-container)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer whitespace-nowrap shrink-0"
          >
            {actionIconName ? (
              <M3Icon name={actionIconName} size={18} />
            ) : ActionIcon ? (
              <ActionIcon className="size-4" />
            ) : null}
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
