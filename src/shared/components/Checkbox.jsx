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
                flex items-center gap-2
                text-sm
                cursor-pointer
                ${disabled ? "opacity-50 cursor-not-allowed opacity-50" :""}
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
            className="w-5 h-5"
        />

        {/* {Texto} */}
        <span>{label}</span>
                </label>

    )
}