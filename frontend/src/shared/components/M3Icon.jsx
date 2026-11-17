import { M3_ICON_PATHS } from "./m3IconPaths";

export default function M3Icon({
  name,
  filled = false,
  size = 20,
  className = "",
  ariaLabel,
  style,
  ...props
}) {
  const entry = M3_ICON_PATHS[name] || M3_ICON_PATHS.tag;
  const pathData = filled ? entry.f : entry.o;
  const pxSize = typeof size === "number" ? `${size}px` : size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      width={pxSize}
      height={pxSize}
      fill="currentColor"
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      style={{
        width: pxSize,
        height: pxSize,
        minWidth: pxSize,
        minHeight: pxSize,
        ...style,
      }}
      className={`shrink-0 select-none inline-block align-middle ${className}`}
      {...props}
    >
      <path d={pathData} />
    </svg>
  );
}
