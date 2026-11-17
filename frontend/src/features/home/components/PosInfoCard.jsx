import { Link } from "react-router-dom";
import { M3Icon } from "@/shared";

export default function PosInfoCard({
  tagLeft,
  tagRight,
  title,
  subtitle,
  bottomIconName,
  bottomIcon: BottomIcon,
  bottomText,
  actionIconName,
  actionIcon: ActionIcon,
  actionLabel,
  actionLink,
  onActionClick,
  actionAriaLabel,
}) {
  return (
    <div className="rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] m3-elevation-1 p-4 flex flex-col justify-between space-y-3">
      <div>
        {(tagLeft || tagRight) && (
          <div className="flex items-center justify-between gap-2 mb-2">
            {tagLeft && (
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-medium">
                {tagLeft}
              </span>
            )}
            {tagRight && (
              <span className="text-xs font-medium text-[var(--md-sys-color-on-secondary-container)] bg-[var(--md-sys-color-secondary-container)] px-2.5 py-0.5 rounded-full">
                {tagRight}
              </span>
            )}
          </div>
        )}

        <h4 className="text-base leading-6 font-medium text-[var(--md-sys-color-on-surface)] line-clamp-1">
          {title}
        </h4>

        {subtitle && (
          <p className="text-xs leading-4 text-[var(--md-sys-color-on-surface-variant)] font-mono mt-0.5 line-clamp-1">
            {subtitle}
          </p>
        )}
      </div>

      <div
        className={`pt-2.5 border-t border-[var(--md-sys-color-outline-variant)] flex items-center ${
          bottomText || BottomIcon || bottomIconName ? "justify-between" : "justify-end"
        } text-xs`}
      >
        {(bottomText || BottomIcon || bottomIconName) && (
          <div className="flex items-center gap-1.5 text-[var(--md-sys-color-primary)] font-medium text-xs">
            {bottomIconName ? (
              <M3Icon name={bottomIconName} size={16} />
            ) : BottomIcon ? (
              <BottomIcon className="size-3.5 shrink-0" />
            ) : null}
            {bottomText && <span>{bottomText}</span>}
          </div>
        )}

        {actionLink ? (
          <Link
            to={actionLink}
            aria-label={actionAriaLabel || actionLabel}
            className="m3-state h-10 inline-flex items-center gap-2 px-5 rounded-full bg-[var(--md-sys-color-primary)] text-sm font-medium text-[var(--md-sys-color-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer"
          >
            {actionIconName ? (
              <M3Icon name={actionIconName} size={18} />
            ) : ActionIcon ? (
              <ActionIcon className="size-4" />
            ) : null}
            <span>{actionLabel}</span>
          </Link>
        ) : onActionClick ? (
          <button
            type="button"
            onClick={onActionClick}
            aria-label={actionAriaLabel || actionLabel}
            className="m3-state h-10 inline-flex items-center gap-2 px-5 rounded-full bg-[var(--md-sys-color-primary)] text-sm font-medium text-[var(--md-sys-color-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer"
          >
            {actionIconName ? (
              <M3Icon name={actionIconName} size={18} />
            ) : ActionIcon ? (
              <ActionIcon className="size-4" />
            ) : null}
            <span>{actionLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
