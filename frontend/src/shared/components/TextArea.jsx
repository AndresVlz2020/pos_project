export default function TextArea({
  label,
  error,
  htmlFor,
  rows = 4,
  maxLength,
  value = "",
  className = "",
  disabled = false,
  ...props
}) {
  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={htmlFor || props.id || props.name}
          className={`block text-xs leading-4 mb-1.5 font-medium ${
            error
              ? "text-[var(--md-sys-color-error)]"
              : "text-[var(--md-sys-color-on-surface-variant)]"
          }`}
        >
          {label}
        </label>
      )}

      <div className="relative w-full">
        <textarea
          id={htmlFor || props.id || props.name}
          rows={rows}
          maxLength={maxLength}
          value={value}
          disabled={disabled}
          className={`
            m3-outlined-field w-full min-h-[104px] px-4 py-3 text-base leading-6
            text-[var(--md-sys-color-on-surface)]
            placeholder:text-[var(--md-sys-color-on-surface-variant)]/70
            focus:outline-none focus:border-[var(--md-sys-color-primary)] focus:shadow-[inset_0_0_0_1px_var(--md-sys-color-primary)]
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-y
            ${error ? "is-error border-[var(--md-sys-color-error)]" : ""}
            ${className}
          `}
          {...props}
        />
      </div>

      <div className="flex items-center justify-between mt-1 min-h-[1rem]">
        {error ? (
          <p className="text-xs leading-4 text-[var(--md-sys-color-error)]">{error}</p>
        ) : (
          <span />
        )}

        {maxLength && (
          <span className="text-xs leading-4 text-[var(--md-sys-color-on-surface-variant)] tabular-nums">
            {currentLength} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
