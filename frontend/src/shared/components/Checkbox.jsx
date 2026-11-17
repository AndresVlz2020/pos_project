export default function Checkbox({
    id,                // id del input
    name,              // name del input
    label,             // texto que se muestra al lado del checkbox
    checked = false,   // estado del checkbox (marcado o no)
    onChange,          // función que se ejecuta cuando el estado del checkbox
    disabled = false,  // deshabilita el checkbox
    className = "",    // clases adicionales para el label
}) {
    return (
        <label 
            htmlFor={id}
            className={`
                min-h-[44px] py-1.5
                flex items-center gap-3
                text-sm
                cursor-pointer
                ${disabled ? "opacity-50 cursor-not-allowed" :""}
                ${className}
            `}
        >

        {/* {Checkbox} */}

        <input 
            type="checkbox"
            id={id}
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="size-[18px] shrink-0 rounded-[2px] border border-[var(--color-secondary-600)] accent-[var(--color-primary-500)] bg-[var(--color-secondary-900)] cursor-pointer focus:ring-2 focus:ring-[var(--color-primary-400)]/40 transition-all"
        />

        {/* {Texto} */}
        <span>{label}</span>
                </label>

    )
}