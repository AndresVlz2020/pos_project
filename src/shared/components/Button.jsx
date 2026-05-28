// Componente button

export default function Button ({
    variant = "primary",
    size = "md",
    type = "button",
    children,
    ...props
}){

     const variants = {
     primary: "bg-[var(--color-primary-500)] text-white hover:bg-[var   (--color-primary-600)]",
     secondary: "border border-[var(--color-secondary-500)] bg-[var   (--color-secondary-50)] text-[var(--color-secondary-700)] hover:bg-[var   (--color-secondary-100)]"
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