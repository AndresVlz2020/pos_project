// Componente button

export default function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  children,
  ...props
}) {
  const variants = {
    primary: "bg-[var(--color-secondary-500)] text-[var(--color-white)] hover:bg-[var(--color-secondary-600)] font-medium border border-transparent cursor-pointer",
    secondary: "border border-[var(--color-primary-700)] bg-[var(--color-primary-900)] text-[var(--color-gray-200)] hover:text-[var(--color-white)] hover:bg-[var(--color-primary-800)] hover:border-[var(--color-primary-600)] cursor-pointer",
    outline: "border border-[var(--color-secondary-500)] text-[var(--color-secondary-300)] hover:bg-[var(--color-secondary-500)]/10 cursor-pointer"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-9 px-4 text-xs font-semibold gap-2",
    lg: "h-10 px-5 text-sm font-semibold gap-2",
  };

  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center
        rounded-md
        transition-colors
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}