// src/shared/components/FileInput.jsx
// Input controlado: soporta límite de 1 imagen con '+' superpuesto sobre la imagen actual o preview

import { useRef, useState, useEffect, useMemo } from "react";
import { Infinity as InfinityLoader } from "ldrs/react";
import "ldrs/react/Infinity.css";
import { Plus, X } from "lucide-react";
import { isImageFile } from "@/shared/schemas/fileSchema";

const MAX_BYTES = 10 * 1024 * 1024;

export default function FileInput({
  value = [],
  onChange,
  multiple = false,
  maxFiles,
  accept = "image/*",
  disabled = false,
  existingImageUrl = "",
  fallbackImageUrl = "",
  shape = "rounded", // "rounded" | "circle"
  altText = "Imagen",
}) {
  const safeValue = useMemo(
    () => (Array.isArray(value) ? value.filter(Boolean) : []),
    [value]
  );
  const limit = Math.max(1, Number(maxFiles ?? (multiple ? 12 : 1)) || 1);
  const allowMultiple = Boolean(multiple && limit > 1);
  const imagesOnly = !String(accept || "").includes("pdf");

  const inputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [brokenExisting, setBrokenExisting] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const previews = useMemo(
    () =>
      safeValue.map((file) =>
        isImageFile(file) ? URL.createObjectURL(file) : null
      ),
    [safeValue]
  );

  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const handleFiles = async (files) => {
    const picked = Array.from(files || []).filter(Boolean);
    if (picked.length === 0) return;

    setLocalError("");
    const valid = [];
    for (const file of picked) {
      if (imagesOnly && !isImageFile(file)) {
        setLocalError("El archivo elegido no es una imagen válida.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setLocalError("La imagen supera el máximo permitido de 10MB.");
        continue;
      }
      valid.push(file);
    }

    if (valid.length === 0) return;

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 180));

    const data = allowMultiple
      ? [...safeValue, ...valid].slice(0, limit)
      : [valid[0]];
    onChange?.(data);
    setBrokenExisting(false);
    setIsLoading(false);
  };

  const remove = (i, e) => {
    e?.stopPropagation?.();
    setLocalError("");
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

  const openPicker = () => {
    if (isLoading || disabled) return;
    inputRef.current?.click();
  };

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-xl";
  const singleFile = safeValue[0] || null;
  const singlePreview = previews[0] || "";
  const resolvedExisting = brokenExisting ? fallbackImageUrl : existingImageUrl;
  const singleDisplaySrc = singlePreview || resolvedExisting;
  const hasSingleVisual = Boolean(singleFile || singleDisplaySrc);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {!allowMultiple ? (
        <div className="flex flex-col items-center gap-2">
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={hasSingleVisual ? "Cambiar imagen" : "Subir imagen"}
            onClick={openPicker}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openPicker();
              }
            }}
            title={
              hasSingleVisual
                ? "Toca la imagen para subir una nueva"
                : "Toca para subir una imagen"
            }
            className={`relative w-44 h-44 ${shapeClass} overflow-hidden group flex items-center justify-center transition-all ${
              hasSingleVisual
                ? "border-2 border-[var(--color-secondary-700)] hover:border-[var(--color-primary-500)] bg-[var(--color-secondary-950)] shadow-md"
                : "border-2 border-dashed border-[var(--color-secondary-700)] hover:border-[var(--color-primary-400)] bg-[var(--color-secondary-950)]"
            } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {singleDisplaySrc ? (
              <>
                <img
                  src={singleDisplaySrc}
                  alt={singleFile?.name || altText}
                  onError={() => {
                    if (!singlePreview && fallbackImageUrl && !brokenExisting) {
                      setBrokenExisting(true);
                    }
                  }}
                  className="w-full h-full object-cover"
                />

                {/* Botón + directamente encima de la imagen */}
                {!disabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/45 transition-colors">
                    {isLoading ? (
                      <InfinityLoader
                        size="42"
                        stroke="4"
                        strokeLength="0.15"
                        bgOpacity="0.1"
                        speed="1.3"
                        color="#ffffff"
                      />
                    ) : (
                      <div className="size-11 rounded-full bg-black/60 group-hover:bg-[var(--color-primary-500)] border border-white/35 text-white flex items-center justify-center shadow-lg transition-all group-hover:scale-105">
                        <Plus className="size-5" />
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : singleFile ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-xs px-3 text-center gap-1">
                <span className="font-semibold text-[var(--color-primary-400)]">
                  Archivo seleccionado
                </span>
                <span className="truncate w-full text-[var(--color-gray-300)]">
                  {singleFile.name}
                </span>
              </div>
            ) : isLoading ? (
              <InfinityLoader
                size="45"
                stroke="4"
                strokeLength="0.15"
                bgOpacity="0.1"
                speed="1.3"
                color="var(--color-primary-500)"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1.5 text-[var(--color-gray-400)] group-hover:text-[var(--color-primary-400)] transition-colors px-3 text-center">
                <div className="size-11 rounded-full bg-[var(--color-secondary-900)] border border-[var(--color-secondary-700)] group-hover:border-[var(--color-primary-500)]/60 flex items-center justify-center">
                  <Plus className="size-5 text-[var(--color-primary-400)]" />
                </div>
                <span className="text-xs font-medium">Subir imagen</span>
              </div>
            )}

            {/* Botón para quitar la imagen recién adjuntada */}
            {singleFile && !disabled && (
              <button
                type="button"
                aria-label="Quitar imagen seleccionada"
                title="Quitar imagen"
                onClick={(e) => remove(0, e)}
                className={`absolute ${
                  shape === "circle" ? "top-2 right-2" : "top-2 right-2"
                } z-10 size-7 rounded-full bg-black/75 hover:bg-[var(--color-error)] border border-white/25 text-white flex items-center justify-center shadow cursor-pointer transition-colors`}
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <p className="text-center text-[var(--color-gray-400)] text-[11px] font-medium">
            {hasSingleVisual
              ? "Toca la imagen para cambiar · Máx 1 imagen (10MB)"
              : "Máx 1 imagen (10MB)"}
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-center text-[var(--color-gray-400)] text-xs font-semibold mb-1">
            Máx {limit} archivos (10MB)
          </h2>
          <div className="relative flex flex-wrap gap-3 justify-center items-center">
            {safeValue.map((file, i) => (
              <div
                key={`${file.name || "file"}-${i}`}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => reorder(dragIndex, i)}
                className="relative w-24 h-24 border border-[var(--color-secondary-700)] rounded-xl overflow-hidden group bg-[var(--color-secondary-950)]"
              >
                {isImageFile(file) ? (
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
                  <button
                    type="button"
                    aria-label="Reordenar archivo"
                    className="w-6 h-6 bg-[var(--color-secondary-800)] border border-[var(--color-secondary-700)] rounded-md text-[var(--color-white)] text-xs flex items-center justify-center hover:bg-[var(--color-secondary-700)] cursor-grab"
                  >
                    ↕
                  </button>
                  <button
                    type="button"
                    aria-label="Eliminar archivo"
                    disabled={disabled}
                    onClick={(e) => remove(i, e)}
                    className="w-6 h-6 bg-[var(--color-secondary-800)] border border-[var(--color-secondary-700)] rounded-md text-[var(--color-white)] text-xs flex items-center justify-center hover:bg-[var(--color-error)] cursor-pointer disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            {safeValue.length < limit && (
              <div
                onClick={openPicker}
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
        </>
      )}

      {localError && (
        <p className="text-[var(--color-error)] text-xs text-center font-medium">
          {localError}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        tabIndex={-1}
        disabled={disabled}
        multiple={allowMultiple}
        accept={accept}
        onChange={(e) => {
          const picked = Array.from(e.target.files || []);
          e.target.value = "";
          handleFiles(picked);
        }}
      />
    </div>
  );
}
