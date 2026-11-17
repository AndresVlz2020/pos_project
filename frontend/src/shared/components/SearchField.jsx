// src/shared/components/SearchField.jsx
import { forwardRef } from "react";
import { Search, X, LoaderCircle } from "lucide-react";
import clsx from "clsx";

const baseStyles =
  "search flex items-center rounded-full px-4 transition-all border";

const sizeStyles = {
    sm: "h-10 text-sm",
    md: "h-12 text-base",
    lg: "h-14 text-base",
};

const variantStyles = {
    filled: 
    "bg-[var(--color-secondary-900)] text-[var(--color-white)] border border-[var(--color-secondary-700)] hover:border-[var(--color-primary-400)] focus-within:border-[var(--color-primary-400)] focus-within:ring-2 focus-within:ring-[var(--color-primary-400)]/30",

    outlined: 
    "bg-[var(--color-secondary-950)] text-[var(--color-white)] border border-[var(--color-secondary-700)] hover:border-[var(--color-primary-400)] focus-within:border-[var(--color-primary-400)]",

    dark:
    "bg-[var(--color-secondary-950)] text-[var(--color-white)] border border-[var(--color-secondary-700)] hover:border-[var(--color-primary-400)] focus-within:border-[var(--color-primary-400)] focus-within:ring-2 focus-within:ring-[var(--color-primary-400)]/40 shadow-inner",
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
            icon,
            className,
        },
        ref
    ) => {
        const SearchIcon = icon || Search;

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
                    sizeStyles[size],
                    variantStyles[variant],
                    fullWidth && "w-full",
                    disabled && "opacity-60 pointer-events-none",
                    error
                        ? "border-[var(--color-error)] focus-within:ring-2 focus-within:ring-[var(--color-error)]/40"
                        : "focus-within:ring-2 focus-within:ring-[var(--color-primary-400)]/30",
                    className
                )}

            >

                {loading ? (
                    <LoaderCircle className="size-5 shrink-0 animate-spin text-[var(--color-primary-400)]" />
                ) : (
                    <SearchIcon
                        className="size-5 shrink-0 text-[var(--color-primary-400)]"
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
                    className="search__input flex-1 bg-transparent px-3 outline-none text-[var(--color-white)] placeholder:text-[var(--color-gray-400)] font-medium"
                />

                {value && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Limpia búsqueda"
                        className="search__clear size-10 -mr-1.5 inline-flex items-center justify-center rounded-full p-2 transition-colors hover:bg-[var(--color-secondary-800)] text-[var(--color-gray-300)] hover:text-[var(--color-white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 cursor-pointer"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </Container>
        );
    }
);

SearchField.displayName = "SearchField";
export default SearchField;
