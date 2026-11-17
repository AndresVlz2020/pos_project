import { forwardRef } from "react";
import clsx from "clsx";
import M3Icon from "./M3Icon";

const baseStyles =
  "search flex items-center rounded-full px-4 border border-transparent";

const sizeStyles = {
  sm: "h-10 text-sm",
  md: "h-12 text-base",
  lg: "h-14 text-base",
};

const variantStyles = {
  filled:
    "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] focus-within:border-[var(--md-sys-color-primary)] focus-within:ring-1 focus-within:ring-[var(--md-sys-color-primary)]",
  outlined:
    "bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] border-[var(--md-sys-color-outline)] focus-within:border-[var(--md-sys-color-primary)] focus-within:ring-1 focus-within:ring-[var(--md-sys-color-primary)]",
  dark:
    "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] focus-within:border-[var(--md-sys-color-primary)] focus-within:ring-1 focus-within:ring-[var(--md-sys-color-primary)]",
};

const SearchField = forwardRef(
  (
    {
      value = "",
      placeholder = "Buscar",
      onChange = () => {},
      onSubmit,
      onClear = () => {},
      size = "md",
      variant = "filled",
      fullWidth = false,
      disabled = false,
      loading = false,
      error = false,
      name = "search",
      ariaLabel = "Campo de búsqueda",
      autoComplete = "off",
      asForm = true,
      iconName = "search",
      className,
    },
    ref
  ) => {
    const handleClear = () => {
      onChange("");
      onClear();
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (disabled || loading) return;
      if (onSubmit) onSubmit(value);
    };

    const handleKeyDown = (e) => {
      if (!asForm && e.key === "Enter") {
        e.preventDefault();
        if (!disabled && !loading && onSubmit) {
          onSubmit(value);
        }
      }
    };

    const Container = asForm ? "form" : "div";

    return (
      <Container
        {...(asForm ? { onSubmit: handleSubmit } : {})}
        className={clsx(
          baseStyles,
          sizeStyles[size] || sizeStyles.md,
          variantStyles[variant] || variantStyles.filled,
          fullWidth && "w-full",
          disabled && "opacity-38 pointer-events-none",
          error && "border-[var(--md-sys-color-error)] focus-within:ring-[var(--md-sys-color-error)]",
          className
        )}
      >
        {loading ? (
          <M3Icon
            name="progress_activity"
            size={20}
            className="animate-spin text-[var(--md-sys-color-primary)]"
          />
        ) : (
          <M3Icon
            name={iconName}
            size={20}
            className="text-[var(--md-sys-color-on-surface-variant)]"
          />
        )}

        <input
          ref={ref}
          type="text"
          name={name}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={ariaLabel}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="search__input flex-1 min-w-0 bg-transparent px-3 outline-none text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)] font-normal"
        />

        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
            className="m3-state search__clear size-10 -mr-2 inline-flex items-center justify-center rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer shrink-0"
          >
            <M3Icon name="close" size={18} />
          </button>
        )}
      </Container>
    );
  }
);

SearchField.displayName = "SearchField";
export default SearchField;
