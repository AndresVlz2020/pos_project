// Componente button

export default function Button ({
    variant = "primary",
    size = "md",
    type = "button",
    children,
    ...props
}){

     const variants = {
     primary: "bg-[var(--color-secondary-500)] text-[var(--color-white)] hover:bg-[var(--color-secondary-600)] font-semibold shadow-sm cursor-pointer",
     secondary: "border border-[var(--color-primary-700)] bg-[var(--color-primary-900)] text-[var(--color-gray-200)] hover:text-[var(--color-white)] hover:bg-[var(--color-primary-800)] hover:border-[var(--color-secondary-400)] cursor-pointer"
   };

    const sizes = {
        sm: `
        h-8
        px-4 
        before:absolute before:content-['']
        before:-inset-y[9px] before:content-x-[0px]
        
        `,
        md: "h-10 px-6 before:absolute before:content-[''] before:-inset-y-[4px]before:-insent-x-[0px] "


    }

    
    return(

        <button
            type = {type}
            className={`
            relative
            inline-flex items-center justify-center
            rounded-md
            transition-colors
            ${variants[variant]}
            ${sizes[size]}
            `}
            {...props}
        
            >
            {children}
        </button>

    )
}