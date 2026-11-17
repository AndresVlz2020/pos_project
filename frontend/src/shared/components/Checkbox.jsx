export default function Checkbox({
  id,
  name,
  label,
  checked = false,
  onChange,
  disabled = false,
  className = "",
}) {
  return (
    <label
      htmlFor={id}
      className={`
        min-h-[44px] py-1.5 inline-flex items-center gap-3 text-sm leading-5
        text-[var(--md-sys-color-on-surface)] cursor-pointer select-none
        ${disabled ? "opacity-38 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="size-[18px] shrink-0 rounded-[2px] border-2 border-[var(--md-sys-color-on-surface-variant)] accent-[var(--md-sys-color-primary)] bg-transparent cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--md-sys-color-surface)]"
      />
      <span>{label}</span>
    </label>
  );
}
