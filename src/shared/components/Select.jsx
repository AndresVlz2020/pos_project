export default function Select({
  label,
  name,
  value,
  error,
  onChange,
  options = []
}) {

  return (

    <div className="mb-3">

      {label && (
        <label className="block text-caption mb-1 text-text-muted">
          {label}
        </label>
      )}


      <select
        value={value}
        onChange={onChange}
        name={name}
        className="
          w-full
          h-12
          rounded-md
          border
          border-border
          px-4
        "
      >

        <option value="">
          Seleccione una opción
        </option>


        {options.map((option) => (

          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>

        ))}


      </select>


      {error && (

        <p className="text-caption text-red-600 mt-1">
          {error}
        </p>

      )}

    </div>

  );
}