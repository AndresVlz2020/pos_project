export default function Input({
    label,
    htmlFor,
    type= "text",
    variant= "primary",
    size= "md",
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
        <div>

            {/* Label */}
            <label 
            // htmlFor con kebab-case
                htmlFor={htmlFor}
                className={`
                    block
                    text-caption
                    mb-1
                    text-secondary
                    ${
                      size === "sm" 
                      ? "-mb-2" 
                      : size === "md" 
                      ? "-mb-0" 
                      : "mb-1"
                    }
                `} 
                
                >
                {label}
            </label>

            {/* Contenedor de input */}
            <div
                className="
                    relative
                    h-12
                    flex
                    items-center
                "
                
                >
                    {/* Área interactiva invisible (48px) */}
                <div
                    className="
                        absolute inset-0
                    "
                    onMouseDown={(e)=>{
                        e.preventDefault();
                        e.currentTarget.focus();
                    }}
                    />
                    
                    {/* Input visual */}
                    <input
                        id={htmlFor}
                        type={type}
                        className={`
                        relative
                        w-80
                        rounded-md
                        border
                        px-4
                        text-body
                        focus:outline-none
                        focus:ring-2
                        focus:ring-ring
                        focus:ring-brand
                        ${variants[variant]}
                        ${sizes[size]}
                        `}
                        {...props}
                    />
            </div>
        </div>
    )
}