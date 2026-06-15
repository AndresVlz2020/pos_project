// Componente select
export default function Select ({
    label,
    htmlFor,
    name,
    options = [],
}) {
    return (
        <div>
            {label && (
                <label 
                    htmlFor={htmlFor}
                    className="block text-caption text-secondary"
                >
                    {label}
                </label>
            )}

            {/* Select */}
            <select 
                name={name}
                id={htmlFor} 
                className="
                    w-80
                    h-10
                    rounded-md
                    border
                    px-4
                    hover:border
                    hover:border-2
                    hover:border-focus-border
                "
            >
                <option value="">Selecciona una opción</option>
                
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}