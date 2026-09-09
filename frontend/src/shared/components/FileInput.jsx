// src/shared/components/FileInput.jsx
// Input controlado: soporta imágenes + PDF, preview condicional, reorder y limpieza de memoria

import { useRef, useState, useEffect, useMemo } from "react";
import { Infinity as InfinityLoader } from "ldrs/react";
import "ldrs/react/Infinity.css";
import { Plus } from "lucide-react";

export default function FileInput({
  value = [], // estado externo (files)
  onChange, // setter externo
  multiple = false, // modo selección
  accept = "image/*,application/pdf", // tipos permitidos
}) {
  const inputRef = useRef(); // input oculto
  const [isLoading, setIsLoading] = useState(false); // loader
  const [dragIndex, setDragIndex] = useState(null); // índice drag

  const isImage = (file) => file.type.startsWith("image/"); // discriminador MIME

  // Genera previews SOLO para imágenes (evita crear URLs innecesarias)
  const previews = useMemo(
    () =>
      value.map((file) => (isImage(file) ? URL.createObjectURL(file) : null)),
    [value],
  );

  // Limpieza de ObjectURL (prevención memory leak)
  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  // Normaliza FileList, simula async y limita a 12
  const handleFiles = async (files) => {
    setIsLoading(true);

    const list = Array.from(files);
    await new Promise((r) => setTimeout(r, 500));

    const data = multiple ? [...value, ...list] : [list[0]];
    onChange(data.slice(0, 12));

    setIsLoading(false);
  };

  // Eliminación inmutable
  const remove = (i) => {
    const copy = [...value];
    copy.splice(i, 1);
    onChange(copy);
  };

  // Reordenamiento por drag & drop
  const reorder = (from, to) => {
    const copy = [...value];
    const [m] = copy.splice(from, 1);
    copy.splice(to, 0, m);
    onChange(copy);
  };

  return (

    <div className="flex flex-col items-center gap-2 w-full">
      <h2 className="text-center text-[var(--color-gray-400)] text-xs font-semibold mb-1">Máx 12 archivos (10MB)</h2>
      <div className="relative flex flex-wrap gap-3 justify-center items-center">
      {value.map((file, i) => (
        <div
          key={i}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => reorder(dragIndex, i)}
          className="relative w-24 h-24 border border-[var(--color-primary-700)] rounded-xl overflow-hidden group bg-[var(--color-primary-950)]"
        >
          {/* Render condicional: imagen vs archivo genérico */}
          {isImage(file) ? (
            <img src={previews[i]} className="w-full h-full object-contain bg-[var(--color-primary-950)]" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-primary-800)] text-[var(--color-white)] text-[10px] px-1">
              <span className="font-semibold">PDF</span>
              <span className="truncate w-full text-center">{file.name}</span>
            </div>
          )}

          {/* Acciones hover: reorder visual + eliminar */}
          <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="w-6 h-6 bg-[var(--color-primary-800)] border border-[var(--color-primary-700)] rounded-full text-[var(--color-white)] text-xs flex items-center justify-center hover:bg-[var(--color-primary-700)]">
              ↕
            </button>
            <button
              onClick={() => remove(i)}
              className="w-6 h-6 bg-[var(--color-primary-800)] border border-[var(--color-primary-700)] rounded-full text-[var(--color-white)] text-xs flex items-center justify-center hover:bg-[var(--color-primary-700)]"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      {/* Trigger de input oculto + loader */}
      <div
        onClick={() => !isLoading && inputRef.current.click()}
        className="w-24 h-24 border-2 border-dashed border-[var(--color-primary-700)] hover:border-[var(--color-secondary-400)] bg-[var(--color-primary-900)]/60 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
      >
        {isLoading ? (
          <InfinityLoader
            size="45"
            stroke="4"
            strokeLength="0.15"
            bgOpacity="0.1"
            speed="1.3"
            color="var(--color-secondary-500)"
          />
        ) : (
          <Plus className="text-[var(--color-secondary-400)]" size={24} />
        )}
      </div>
      </div>

      {/* Input desacoplado de UI */}
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple={multiple}
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}