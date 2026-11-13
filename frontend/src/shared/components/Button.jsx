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
    primary: "bg-[var(--color-primary-500)] text-[#ffffff] hover:bg-[var(--color-primary-600)] font-medium border border-transparent cursor-pointer shadow-sm",
    secondary: "border border-[var(--color-secondary-700)] bg-[var(--color-secondary-900)] text-[var(--color-gray-200)] hover:text-white hover:bg-[var(--color-secondary-800)] hover:border-[var(--color-secondary-600)] font-medium cursor-pointer"
  };

  const sizes = {
    sm: "min-h-[36px] px-3 text-xs font-medium gap-1.5",
    md: "min-h-[40px] px-4 text-sm font-medium gap-2",
    lg: "min-h-[48px] px-6 text-sm font-semibold gap-2",
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