// src/shared/components/TextArea.jsx
import { forwardRef } from "react";
import clsx from "clsx";

export const TextArea = forwardRef(function TextArea(
  {
    label,
    name,
    value,
    placeholder,
    onChange,
    onBlur,
    error,
    disabled = false,
    rows = 4,
    maxLength = 500,
    showCounter = true,
    className = "",
    htmlFor,
    ...props
  },
  ref
) {
  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <div className="flex justify-between items-center text-xs font-semibold">
          <label
            htmlFor={htmlFor || name}
            className={clsx(
              "transition-colors",
              error ? "text-[var(--color-error)]" : "text-[var(--color-gray-300)]"
            )}
          >
            {label}
          </label>
          {showCounter && maxLength && (
            <span
              className={clsx(
                "text-[10px]",
                currentLength >= maxLength
                  ? "text-[var(--color-error)] font-bold"
                  : "text-[var(--color-gray-400)]"
              )}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}

      <textarea
        ref={ref}
        id={htmlFor || name}
        name={name}
        value={value}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        className={clsx(
          "w-full rounded-md px-3.5 py-2.5 text-sm transition-all outline-none resize-none",
          "bg-[var(--color-secondary-950)] text-[var(--color-white)] placeholder:text-[var(--color-gray-400)]",
          "border border-[var(--color-secondary-700)] focus:border-[var(--color-primary-400)] focus:ring-1 focus:ring-[var(--color-primary-400)]",
          error && "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-1 focus:ring-[var(--color-error)]",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      />

      {error && (
        <span className="text-[var(--color-error)] text-xs mt-0.5 font-medium">
          {error}
        </span>
      )}
    </div>
  );
});

export default TextArea;
