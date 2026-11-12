// src/shared/schemas/fileSchema.js

import { z } from "zod";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Un único archivo validado (tipo permitido + tamaño máximo).
const fileItem = z
  .instanceof(File)
  .refine((f) => ACCEPTED_TYPES.includes(f.type), "Tipo inválido")
  .refine((f) => f.size <= MAX_SIZE, "Máx 10MB");

// Lista de archivos (0 a 12). Base reutilizable.
const filesArray = z.array(fileItem).max(12, "Máx 12 archivos");

// Esquema de carga OBLIGATORIA (mínimo 1 archivo).
export const fileSchema = z.object({
  files: filesArray.min(1, "Requerido"),
});

// Campo de imagen OPCIONAL en los formularios: acepta null, undefined o 0..12 archivos.
// (Los formularios usan `null` o `[]` como "sin imagen"; el antiguo `.optional()`
// rechazaba `null` y el `.min(1)` rechazaba `[]`, rompiendo la validación.)
export const optionalFiles = filesArray.optional().nullable();
