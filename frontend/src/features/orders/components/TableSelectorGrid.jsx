import { Check } from "lucide-react";
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
    ? "fill-[var(--color-primary-500)]"
    : isAvailable
    ? "fill-[var(--color-primary-500)]/15"
    : "fill-[var(--color-error-bg)]";

  const tableStroke = isSelected
    ? "stroke-[var(--color-primary-400)]"
    : isAvailable
    ? "stroke-[var(--color-primary-500)]/55"
    : "stroke-[var(--color-error-border)]";

  const innerRimStroke = isSelected
    ? "stroke-[var(--color-on-primary)]/35"
    : isAvailable
    ? "stroke-[var(--color-primary-400)]/30"
    : "stroke-[var(--color-error)]/20";

  const chairFill = isSelected
    ? "fill-[var(--color-primary-500)]/35 stroke-[var(--color-primary-400)]"
    : isAvailable
    ? "fill-[var(--color-secondary-800)]/80 stroke-[var(--color-primary-500)]/40"
    : "fill-[var(--color-secondary-900)]/60 stroke-[var(--color-error-border)]";

  const numberFill = isSelected
    ? "fill-[var(--color-on-primary)]"
    : isAvailable
    ? "fill-[var(--color-white)]"
    : "fill-[var(--color-error)]";

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
        <span className="text-[length:var(--fs-xxxs)] font-semibold text-[var(--color-gray-300)]">
          Mesa *{" "}
          {selectedTableNumber && (
            <span className="ml-1 font-bold text-[var(--color-primary-400)]">
              · {selectedTableNumber}
            </span>
          )}
        </span>
        <span className="text-[length:var(--fs-xxxxs)] font-semibold text-[var(--color-primary-400)]">
          {freeCount} {freeCount === 1 ? "libre" : "libres"}
        </span>
      </div>

      <div className="p-1.5 rounded-xl border border-[var(--color-secondary-800)] bg-[var(--color-secondary-950)]/45 max-h-[252px] overflow-y-auto overscroll-contain pr-1">
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
                className={`group relative flex flex-col items-center justify-between gap-1 px-1 pt-2 pb-1.5 rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-[var(--color-primary-500)]/15 border-2 border-[var(--color-primary-500)] shadow-sm ring-1 ring-[var(--color-primary-500)]/25"
                    : t.isAvailable
                    ? "bg-[var(--color-secondary-900)]/80 border-[var(--color-secondary-800)] hover:border-[var(--color-primary-500)]/55 hover:bg-[var(--color-secondary-900)]"
                    : "bg-[var(--color-secondary-950)]/60 border-[var(--color-secondary-800)]/80 opacity-75"
                }`}
              >
                {/* Indicador de selección superior derecho */}
                {t.isAvailable && (
                  <span
                    aria-hidden="true"
                    className={`absolute top-1 right-1 w-3 h-3 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-[var(--color-primary-500)] text-[var(--color-on-primary)]"
                        : "border border-[var(--color-secondary-600)] group-hover:border-[var(--color-primary-400)]"
                    }`}
                  >
                    {isSelected && <Check className="w-2 h-2" strokeWidth={3} />}
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
                    className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[length:var(--fs-xxxxs)] font-semibold leading-none border ${
                      t.isAvailable
                        ? "bg-[var(--color-primary-500)]/15 border-[var(--color-primary-500)]/35 text-[var(--color-primary-400)]"
                        : "bg-[var(--color-error-bg)] border-[var(--color-error-border)] text-[var(--color-error)]"
                    }`}
                  >
                    {t.isAvailable ? "Libre" : "Ocupada"}
                  </span>
                  <span className="text-[length:var(--fs-xxxxs)] text-[var(--color-gray-400)] leading-none">
                    {t.capacity || 4} pers.
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {tables.length > 9 && (
        <p className="text-[length:var(--fs-xxxxs)] text-[var(--color-gray-400)] leading-tight">
          Desliza dentro del recuadro para ver las {tables.length} mesas.
        </p>
      )}

      {error && (
        <p className="text-xs font-medium text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
}
