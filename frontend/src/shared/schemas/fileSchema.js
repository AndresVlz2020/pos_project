// src/shared/schemas/fileSchema.js

import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const ACCEPTED_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  "application/pdf",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Un único archivo validado (tipo permitido + tamaño máximo).
const fileItem = z
  .instanceof(File)
  .refine((f) => ACCEPTED_TYPES.includes(f.type), "Tipo de archivo inválido")
  .refine((f) => f.size <= MAX_SIZE, "Máx 10MB");

const imageItem = z
  .instanceof(File)
  .refine((f) => ACCEPTED_IMAGE_TYPES.includes(f.type), "Solo se permiten imágenes JPG, PNG o WEBP")
  .refine((f) => f.size <= MAX_SIZE, "La imagen no debe superar 10MB");

// Lista de archivos (0 a 12). Base reutilizable.
const filesArray = z.array(fileItem).max(12, "Máx 12 archivos");
const singleImageArray = z.array(imageItem).max(1, "Solo se permite adjuntar 1 imagen");

// Esquema de carga OBLIGATORIA (mínimo 1 archivo).
export const fileSchema = z.object({
  files: filesArray.min(1, "Requerido"),
});

// Campo de imagen OPCIONAL en formularios multi-archivo (inventario/proveedores).
export const optionalFiles = filesArray.optional().nullable();

// Campo de imagen OPCIONAL limitado estrictamente a 1 imagen (productos y usuarios).
export const singleOptionalImage = singleImageArray.optional().nullable();
