// src/shared/components/FileInput.jsx
// Input controlado: soporta imágenes + PDF, preview condicional, límite configurable y limpieza de memoria

import { useRef, useState, useEffect, useMemo } from "react";
import { Infinity as InfinityLoader } from "ldrs/react";
import "ldrs/react/Infinity.css";
import { Plus } from "lucide-react";

export default function FileInput({
  value = [], // estado externo (files) — se tolera null/undefined
  onChange, // setter externo
  multiple = false, // modo selección
  maxFiles, // límite máximo (1 si multiple=false, 12 si multiple=true por defecto)
  accept = "image/*,application/pdf", // tipos permitidos
  disabled = false,
}) {
  const safeValue = useMemo(
    () => (Array.isArray(value) ? value.filter(Boolean) : []),
    [value]
  );
  const limit = Math.max(1, Number(maxFiles ?? (multiple ? 12 : 1)) || 1);
  const allowMultiple = Boolean(multiple && limit > 1);

  const inputRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const isImage = (file) => Boolean(file?.type?.startsWith("image/"));

  const previews = useMemo(
    () =>
      safeValue.map((file) => (isImage(file) ? URL.createObjectURL(file) : null)),
    [safeValue],
  );

  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const handleFiles = async (files) => {
    const list = Array.from(files || []).filter(Boolean);
    if (list.length === 0) return;

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 250));

    const data = allowMultiple
      ? [...safeValue, ...list].slice(0, limit)
      : [list[0]];
    onChange?.(data);

    setIsLoading(false);
  };

  const remove = (i) => {
    const copy = [...safeValue];
    copy.splice(i, 1);
    onChange?.(copy);
  };

  const reorder = (from, to) => {
    if (from === null || from === undefined || from === to) return;
    const copy = [...safeValue];
    const [m] = copy.splice(from, 1);
    copy.splice(to, 0, m);
    onChange?.(copy);
  };

  const showAddButton = allowMultiple ? safeValue.length < limit : safeValue.length === 0;
  const helperText =
    limit === 1
      ? "Máx 1 imagen (10MB)"
      : `Máx ${limit} archivos (10MB)`;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <h2 className="text-center text-[var(--color-gray-400)] text-xs font-semibold mb-1">
        {helperText}
      </h2>
      <div className="relative flex flex-wrap gap-3 justify-center items-center">
        {safeValue.map((file, i) => (
          <div
            key={`${file.name || "file"}-${i}`}
            draggable={allowMultiple}
            onDragStart={() => allowMultiple && setDragIndex(i)}
            onDragOver={(e) => allowMultiple && e.preventDefault()}
            onDrop={() => allowMultiple && reorder(dragIndex, i)}
            className="relative w-24 h-24 border border-[var(--color-secondary-700)] rounded-xl overflow-hidden group bg-[var(--color-secondary-950)]"
          >
            {isImage(file) ? (
              <img
                src={previews[i]}
                alt={file.name || "Vista previa"}
                className="w-full h-full object-contain bg-[var(--color-secondary-950)]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-secondary-800)] text-[var(--color-white)] text-[10px] px-1">
                <span className="font-semibold">PDF</span>
                <span className="truncate w-full text-center">{file.name}</span>
              </div>
            )}

            <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {allowMultiple && (
                <button
                  type="button"
                  aria-label="Reordenar archivo"
                  className="w-6 h-6 bg-[var(--color-secondary-800)] border border-[var(--color-secondary-700)] rounded-md text-[var(--color-white)] text-xs flex items-center justify-center hover:bg-[var(--color-secondary-700)] cursor-grab"
                >
                  ↕
                </button>
              )}
              <button
                type="button"
                aria-label="Eliminar archivo"
                disabled={disabled}
                onClick={() => remove(i)}
                className="w-6 h-6 bg-[var(--color-secondary-800)] border border-[var(--color-secondary-700)] rounded-md text-[var(--color-white)] text-xs flex items-center justify-center hover:bg-[var(--color-error)] cursor-pointer disabled:opacity-50"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {showAddButton && (
          <div
            onClick={() => !isLoading && !disabled && inputRef.current?.click()}
            className={`w-24 h-24 border-2 border-dashed border-[var(--color-secondary-700)] hover:border-[var(--color-primary-400)] bg-[var(--color-secondary-900)]/60 rounded-xl flex items-center justify-center transition-colors ${
              disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isLoading ? (
              <InfinityLoader
                size="45"
                stroke="4"
                strokeLength="0.15"
                bgOpacity="0.1"
                speed="1.3"
                color="var(--color-primary-500)"
              />
            ) : (
              <Plus className="text-[var(--color-primary-400)]" size={24} />
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        hidden
        disabled={disabled}
        multiple={allowMultiple}
        accept={accept}
        onChange={(e) => {
          const picked = e.target.files;
          e.target.value = "";
          handleFiles(picked);
        }}
      />
    </div>
  );
}
