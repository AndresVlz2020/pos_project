export default function Select({
  label,
  name,
  id,
  htmlFor,
  value,
  error,
  onChange,
  disabled = false,
  options = [],
  className = "",
  ...props
}) {
  const selectId = id || htmlFor || name;

  return (
    <div className={`w-full mb-3 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className={`block text-caption mb-1 font-medium ${
            error ? "text-[var(--color-error)]" : "text-[var(--color-gray-200)]"
          }`}
        >
          {label}
        </label>
      )}

      <select
        id={selectId}
        value={value}
        onChange={onChange}
        name={name}
        disabled={disabled}
        className={`
          w-full
          h-12
          rounded-md
          border
          ${
            error
              ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
              : "border-[var(--color-secondary-700)] focus:border-[var(--color-primary-400)]"
          }
          bg-[var(--color-secondary-900)]
          text-[var(--color-white)]
          px-4
          outline-none
          cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        {...props}
      >
        <option value="" className="bg-[var(--color-secondary-950)] text-white">
          Seleccione una opción
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={`bg-[var(--color-secondary-950)] ${
              option.disabled ? "text-[var(--color-gray-500)]" : "text-white"
            }`}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-caption text-[var(--color-error)] mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
