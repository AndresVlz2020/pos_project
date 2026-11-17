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
    primary: "bg-[var(--color-primary-500)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-600)] font-medium border border-transparent cursor-pointer shadow-sm",
    secondary: "border border-[var(--color-secondary-700)] bg-[var(--color-secondary-900)] text-[var(--color-gray-200)] hover:text-[var(--color-white)] hover:bg-[var(--color-secondary-800)] hover:border-[var(--color-secondary-600)] font-medium cursor-pointer",
    destructive: "bg-[var(--color-error)] text-[var(--color-on-error)] hover:opacity-90 font-medium border border-transparent cursor-pointer shadow-sm",
  };

  const sizes = {
    sm: "min-h-[40px] px-4 text-sm font-medium gap-2",
    md: "min-h-[40px] px-6 text-sm font-medium gap-2",
    lg: "min-h-[48px] px-6 text-sm font-semibold gap-2",
  };

  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center
        rounded-full
        transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50
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