import { useRef, useState, useEffect, useMemo } from "react";
import { Infinity as InfinityLoader } from "ldrs/react";
import "ldrs/react/Infinity.css";
import { isImageFile } from "@/shared/schemas/fileSchema";
import M3Icon from "./M3Icon";

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
  shape = "rounded",
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

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-2xl";
  const singleFile = safeValue[0] || null;
  const singlePreview = previews[0] || "";
  const resolvedExisting = brokenExisting ? fallbackImageUrl : existingImageUrl;
  const singleDisplaySrc = singlePreview || resolvedExisting;
  const hasSingleVisual = Boolean(singleFile || singleDisplaySrc);

  return (
    <div className="flex flex-col items-center gap-2.5 w-full">
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
            className={`relative w-44 h-44 ${shapeClass} overflow-hidden group flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
              hasSingleVisual
                ? "border border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-surface-container)] m3-elevation-1"
                : "border-2 border-dashed border-[var(--md-sys-color-outline)] hover:border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-surface-container-low)]"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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

                {!disabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/45 transition-colors">
                    {isLoading ? (
                      <InfinityLoader
                        size="42"
                        stroke="4"
                        strokeLength="0.15"
                        bgOpacity="0.1"
                        speed="1.3"
                        color="var(--color-on-dark)"
                      />
                    ) : (
                      <div className="size-11 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] m3-elevation-2 flex items-center justify-center transition-transform group-hover:scale-105">
                        <M3Icon name="add_photo_alternate" size={22} />
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : singleFile ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-xs px-3 text-center gap-1">
                <span className="font-medium text-[var(--md-sys-color-primary)]">
                  Archivo seleccionado
                </span>
                <span className="truncate w-full text-[var(--md-sys-color-on-surface-variant)]">
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
                color="var(--md-sys-color-primary)"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)] transition-colors px-3 text-center">
                <div className="size-12 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center">
                  <M3Icon name="add_photo_alternate" size={24} />
                </div>
                <span className="text-sm font-medium">Subir imagen</span>
              </div>
            )}

            {singleFile && !disabled && (
              <button
                type="button"
                aria-label="Quitar imagen seleccionada"
                title="Quitar imagen"
                onClick={(e) => remove(0, e)}
                className="m3-state absolute top-2 right-2 z-10 size-10 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] m3-elevation-1 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
              >
                <M3Icon name="close" size={18} />
              </button>
            )}
          </div>

          <p className="text-center text-[var(--md-sys-color-on-surface-variant)] text-xs leading-4">
            {hasSingleVisual
              ? "Toca la imagen para cambiar · Máx 1 imagen (10MB)"
              : "Máx 1 imagen (10MB)"}
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-center text-[var(--md-sys-color-on-surface-variant)] text-xs font-medium mb-1">
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
                className="relative w-28 h-28 border border-[var(--md-sys-color-outline-variant)] rounded-xl overflow-hidden group bg-[var(--md-sys-color-surface-container)]"
              >
                {isImageFile(file) ? (
                  <img
                    src={previews[i]}
                    alt={file.name || "Vista previa"}
                    className="w-full h-full object-contain bg-[var(--md-sys-color-surface-container)]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] text-xs px-1.5">
                    <span className="font-medium">PDF</span>
                    <span className="truncate w-full text-center">{file.name}</span>
                  </div>
                )}

                <div className="absolute top-1.5 right-1.5 flex flex-col gap-1.5 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    aria-label="Reordenar archivo"
                    className="m3-state size-10 bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] rounded-full text-[var(--md-sys-color-on-surface)] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-grab"
                  >
                    <M3Icon name="swap_vert" size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label="Eliminar archivo"
                    disabled={disabled}
                    onClick={(e) => remove(i, e)}
                    className="m3-state size-10 bg-[var(--md-sys-color-error-container)] border border-[var(--color-error-border)] rounded-full text-[var(--md-sys-color-on-error-container)] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer disabled:opacity-38"
                  >
                    <M3Icon name="close" size={18} />
                  </button>
                </div>
              </div>
            ))}

            {safeValue.length < limit && (
              <div
                onClick={openPicker}
                className={`w-28 h-28 border-2 border-dashed border-[var(--md-sys-color-outline)] hover:border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-surface-container-low)] rounded-xl flex items-center justify-center ${
                  disabled ? "opacity-38 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                {isLoading ? (
                  <InfinityLoader
                    size="45"
                    stroke="4"
                    strokeLength="0.15"
                    bgOpacity="0.1"
                    speed="1.3"
                    color="var(--md-sys-color-primary)"
                  />
                ) : (
                  <M3Icon name="add_photo_alternate" size={24} className="text-[var(--md-sys-color-primary)]" />
                )}
              </div>
            )}
          </div>
        </>
      )}

      {localError && (
        <p className="text-[var(--md-sys-color-error)] text-xs text-center font-medium">
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
