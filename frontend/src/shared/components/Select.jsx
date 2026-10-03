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
            error ? "text-red-500" : "text-[var(--color-gray-200)]"
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
              ? "border-red-500 focus:border-red-500"
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
            className="bg-[var(--color-secondary-950)] text-white"
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-caption text-red-500 mt-1">
          {error}
        </p>
      )}

    </div>

  );
}