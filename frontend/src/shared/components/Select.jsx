export default function Select({
  label,
  name,
  value,
  error,
  onChange,
  options = []
}) {

  return (

    <div className="w-full mb-3">

      {label && (
        <label className={`block text-caption mb-1 font-medium ${error ? "text-red-500" : "text-[var(--color-gray-200)]"}`}>
          {label}
        </label>
      )}

      <select
        value={value}
        onChange={onChange}
        name={name}
        className={`
          w-full
          h-12
          rounded-md
          border
          ${error ? "border-red-500 focus:border-red-500" : "border-[var(--color-primary-700)] focus:border-[var(--color-secondary-400)]"}
          bg-[var(--color-primary-900)]
          text-[var(--color-white)]
          px-4
          outline-none
          cursor-pointer
        `}
      >
        <option value="" className="bg-[var(--color-primary-950)] text-white">
          Seleccione una opción
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[var(--color-primary-950)] text-white"
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