import { M3Icon } from "@/shared";
import { extractTableNumber } from "../utils/orderFormHelpers";

export function TableIllustration({
  number,
  capacity = 4,
  isSelected = false,
  isAvailable = true,
  sizeClassName = "w-16 h-[50px]",
}) {
  const cap = Number(capacity) || 4;
  const twoTopBottom = cap >= 6;
  const hasTopBottom = cap >= 3;

  const tableFill = isSelected
    ? "fill-[var(--md-sys-color-primary)]"
    : isAvailable
    ? "fill-[var(--md-sys-color-primary-container)]/55"
    : "fill-[var(--md-sys-color-error-container)]";

  const tableStroke = isSelected
    ? "stroke-[var(--md-sys-color-primary)]"
    : isAvailable
    ? "stroke-[var(--md-sys-color-primary)]/60"
    : "stroke-[var(--md-sys-color-error)]/60";

  const innerRimStroke = isSelected
    ? "stroke-[var(--md-sys-color-on-primary)]/40"
    : isAvailable
    ? "stroke-[var(--md-sys-color-primary)]/30"
    : "stroke-[var(--md-sys-color-error)]/25";

  const chairFill = isSelected
    ? "fill-[var(--md-sys-color-primary-container)] stroke-[var(--md-sys-color-primary)]"
    : isAvailable
    ? "fill-[var(--md-sys-color-surface-container-high)] stroke-[var(--md-sys-color-primary)]/45"
    : "fill-[var(--md-sys-color-surface-container-highest)] stroke-[var(--md-sys-color-error)]/40";

  const numberFill = isSelected
    ? "fill-[var(--md-sys-color-on-primary)]"
    : isAvailable
    ? "fill-[var(--md-sys-color-on-surface)]"
    : "fill-[var(--md-sys-color-on-error-container)]";

  return (
    <svg
      viewBox="0 0 80 62"
      className={`${sizeClassName} shrink-0 overflow-visible`}
      aria-hidden="true"
    >
      {/* Sillas superiores */}
      {hasTopBottom &&
        (twoTopBottom ? (
          <>
            <rect x="23" y="4" width="13" height="6" rx="3" strokeWidth="1.2" className={chairFill} />
            <rect x="44" y="4" width="13" height="6" rx="3" strokeWidth="1.2" className={chairFill} />
          </>
        ) : (
          <rect x="31" y="4" width="18" height="6" rx="3" strokeWidth="1.2" className={chairFill} />
        ))}

      {/* Sillas inferiores */}
      {hasTopBottom &&
        (twoTopBottom ? (
          <>
            <rect x="23" y="52" width="13" height="6" rx="3" strokeWidth="1.2" className={chairFill} />
            <rect x="44" y="52" width="13" height="6" rx="3" strokeWidth="1.2" className={chairFill} />
          </>
        ) : (
          <rect x="31" y="52" width="18" height="6" rx="3" strokeWidth="1.2" className={chairFill} />
        ))}

      {/* Sillas laterales (izquierda y derecha) */}
      <rect x="8" y="22" width="6" height="18" rx="3" strokeWidth="1.2" className={chairFill} />
      <rect x="66" y="22" width="6" height="18" rx="3" strokeWidth="1.2" className={chairFill} />

      {/* Superficie de la mesa */}
      <rect
        x="17"
        y="13"
        width="46"
        height="36"
        rx="9"
        strokeWidth="1.6"
        className={`transition-colors duration-150 ${tableFill} ${tableStroke}`}
      />

      {/* Marco interior decorativo de la mesa */}
      <rect
        x="21"
        y="17"
        width="38"
        height="28"
        rx="6"
        fill="none"
        strokeWidth="1"
        className={innerRimStroke}
      />

      {/* Número de mesa centrado */}
      <text
        x="40"
        y="31.5"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="15.5"
        fontWeight="800"
        className={`select-none ${numberFill}`}
      >
        {number}
      </text>
    </svg>
  );
}

/**
 * Selector visual de mesas estilo mapa de salón: muestra cada mesa ilustrada
 * con su número centrado, sillas, capacidad y estado en tiempo real.
 */
export default function TableSelectorGrid({
  tables = [],
  selectedTableNumber = "",
  onSelectTable,
  error,
}) {
  const freeCount = tables.filter((t) => t.isAvailable).length;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-label-md font-medium text-[var(--md-sys-color-on-surface-variant)]">
          Mesa *{" "}
          {selectedTableNumber && (
            <span className="ml-1 font-semibold text-[var(--md-sys-color-primary)]">
              · {selectedTableNumber}
            </span>
          )}
        </span>
        <span className="text-label-md font-medium text-[var(--md-sys-color-primary)] tabular-nums">
          {freeCount} {freeCount === 1 ? "libre" : "libres"}
        </span>
      </div>

      <div className="p-2 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] max-h-[264px] overflow-y-auto overscroll-contain pr-1">
        <div
          role="radiogroup"
          aria-label="Seleccionar mesa"
          className="grid grid-cols-3 gap-1.5"
        >
          {tables.map((t) => {
            const isSelected = selectedTableNumber === t.tableNumber;
            const number = extractTableNumber(t);

            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${t.tableNumber}, ${t.isAvailable ? "Libre" : "Ocupada"}, capacidad ${t.capacity || 4} personas`}
                onClick={() => onSelectTable?.(t)}
                title={`${t.tableNumber} · ${t.isAvailable ? "Libre" : "Ocupada"} (${t.capacity || 4} pers.)${
                  !t.isAvailable && t.activeOrderNumber ? ` · Orden ${t.activeOrderNumber}` : ""
                }`}
                className={`group relative flex flex-col items-center justify-between gap-1 px-1 pt-2 pb-1.5 rounded-xl border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]/50 transition-colors duration-150 cursor-pointer m3-state ${
                  isSelected
                    ? "bg-[var(--md-sys-color-primary-container)]/35 border-2 border-[var(--md-sys-color-primary)] m3-elevation-1"
                    : t.isAvailable
                    ? "bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-primary)]/60 hover:bg-[var(--md-sys-color-surface-container)]"
                    : "bg-[var(--md-sys-color-surface-container-highest)]/50 border-[var(--md-sys-color-outline-variant)] opacity-75"
                }`}
              >
                {/* Indicador de selección superior derecho */}
                {t.isAvailable && (
                  <span
                    aria-hidden="true"
                    className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
                        : "border border-[var(--md-sys-color-outline)] group-hover:border-[var(--md-sys-color-primary)]"
                    }`}
                  >
                    {isSelected && <M3Icon name="check" size={11} />}
                  </span>
                )}

                <TableIllustration
                  number={number}
                  capacity={t.capacity}
                  isSelected={isSelected}
                  isAvailable={t.isAvailable}
                  sizeClassName="w-10 h-[31px]"
                />

                <div className="flex flex-col items-center gap-0.5 w-full">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-medium leading-4 border ${
                      t.isAvailable
                        ? "bg-[var(--md-sys-color-primary-container)]/50 border-[var(--md-sys-color-primary)]/40 text-[var(--md-sys-color-on-primary-container)]"
                        : "bg-[var(--md-sys-color-error-container)]/60 border-[var(--md-sys-color-error)]/40 text-[var(--md-sys-color-on-error-container)]"
                    }`}
                  >
                    {t.isAvailable ? "Libre" : "Ocupada"}
                  </span>
                  <span className="text-label-sm leading-4 text-[var(--md-sys-color-on-surface-variant)]">
                    {t.capacity || 4} pers.
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {tables.length > 9 && (
        <p className="text-xs leading-4 text-[var(--md-sys-color-on-surface-variant)]">
          Desliza dentro del recuadro para ver las {tables.length} mesas.
        </p>
      )}

      {error && (
        <p className="text-xs font-medium text-[var(--md-sys-color-error)]">{error}</p>
      )}
    </div>
  );
}
