export default function Input({
    label,
    error,
    htmlFor,
    type= "text",
    variant= "primary",
    size= "md",
    className = "",
    ...props
}){

    // Obligatorio que estos valores tienen que ser con variables
    const variants = {
        primary:`
        border-color-primary-950
        bg-background
        `,
        secondary:`
        border-color-secondary-300  `,
        tertiary:`
        border-color-tertiary-800
        `,
    }
    const sizes = {
        sm:`
        h-8
        `,
        md:`
        h-10
        `,
        lg:`
        h-12
        `,
    }

    
    return(
        <div className="w-full">

            {/* Label */}
            <label 
            // htmlFor con kebab-case
                htmlFor={htmlFor}
                className={`
                    block
                    text-caption
                    mb-1
                    text-[var(--color-gray-200)] font-medium
                    ${
                      size === "sm"
                      ? "-mb-2"
                      : size === "md"
                      ? "-mb-0"
                      : "mb-1"
                    }
                    ${error ? "text-red-500" : ""}
                `} 
                
                >
                {label}
            </label>

            {/* Contenedor de input */}
            <div className="relative w-full flex items-center">
                {/* Input visual */}
                <input
                    id={htmlFor || props.id || props.name}
                    type={type}
                    className={`
                    w-full
                    h-12
                    rounded-md
                    border
                    ${error ? "border-red-500 focus:border-red-500" : "border-[var(--color-secondary-700)] focus:border-[var(--color-primary-400)]"}
                    px-4
                    text-[var(--color-white)]
                    bg-[var(--color-secondary-900)]
                    placeholder:text-[var(--color-gray-400)]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[var(--color-primary-400)]/30
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                    ${variants[variant]}
                    ${className}
                    `}
                    {...props}
                />
            </div>
            {/* Feedback */}
            {error && (
                <p className="text-caption text-red-500 place-self-start mt-1">{error}</p>
            )}
        </div>
    )
}