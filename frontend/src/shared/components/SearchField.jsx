// src/shared/components/SearchField.jsx
import { forwardRef } from "react";
import { Search, X, LoaderCircle } from "lucide-react";
import clsx from "clsx";

const baseStyles =
 "search flex items-center rounded-xl px-4 transition-all border";

const sizeStyles = {
    sm: "h-9 text-xs",
    md: "h-11 text-sm",
    lg: "h-12 text-sm sm:text-base",
};

const variantStyles = {
    filled: 
    "bg-[var(--color-primary-900)] text-[var(--color-white)] border border-[var(--color-primary-700)] hover:border-[var(--color-secondary-400)] focus-within:border-[var(--color-secondary-400)] focus-within:ring-2 focus-within:ring-[var(--color-secondary-400)]/30",

    outlined: 
    "bg-[var(--color-primary-950)] text-[var(--color-white)] border border-[var(--color-primary-700)] hover:border-[var(--color-secondary-400)] focus-within:border-[var(--color-secondary-400)]",

    dark:
    "bg-[var(--color-primary-950)] text-[var(--color-white)] border border-[var(--color-primary-700)] hover:border-[var(--color-secondary-400)] focus-within:border-[var(--color-secondary-400)] focus-within:ring-2 focus-within:ring-[var(--color-secondary-400)]/40 shadow-inner",
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

        return (
            <form
                onSubmit={handleSubmit}
                className={clsx(
                    baseStyles,
                    sizeStyles[size],
                    variantStyles[variant],
                    fullWidth && "w-full",
                    disabled && "opacity-60 pointer-events-none",
                    error
                        ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500"
                        : "focus-within:ring-2 focus-within:ring-[var(--color-secondary-400)]/30",
                    className
                )}

            >

                {loading ? (
                    <LoaderCircle className="size-5 shrink-0 animate-spin text-[var(--color-secondary-400)]" />
                ) : (
                    <SearchIcon
                        className="size-5 shrink-0 text-[var(--color-secondary-400)]"
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
                    className="search__input flex-1 bg-transparent px-3 outline-none text-[var(--color-white)] placeholder:text-[var(--color-gray-400)] font-medium"
                />

                {value && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Limpia búsqueda"
                        className="search__clear rounded-full p-1 transition-colors hover:bg-[var(--color-primary-800)] text-[var(--color-gray-300)] hover:text-[var(--color-white)] cursor-pointer"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </form>
        );
    }
);

SearchField.displayName = "SearchField";
export default SearchField;
