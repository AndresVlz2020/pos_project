// src/shared/schemas/fileSchema.js

import { z } from "zod";

const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif|bmp|avif|jfif|tiff?|heic|heif|svg|ico)$/i;
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function isImageFile(file) {
  if (!file) return false;
  if (typeof file.type === "string" && file.type.startsWith("image/")) {
    return true;
  }
  return IMAGE_EXT_RE.test(String(file.name || ""));
}

function isSupportedGeneralFile(file) {
  if (!file) return false;
  if (isImageFile(file)) return true;
  return file.type === "application/pdf" || /\.pdf$/i.test(String(file.name || ""));
}

const fileItem = z
  .instanceof(File)
  .refine(isSupportedGeneralFile, "Tipo de archivo no permitido")
  .refine((f) => f.size <= MAX_SIZE, "El archivo no debe superar 10MB");

const imageItem = z
  .instanceof(File)
  .refine(isImageFile, "El archivo debe ser una imagen válida")
  .refine((f) => f.size <= MAX_SIZE, "La imagen no debe superar 10MB");

const filesArray = z.array(fileItem).max(12, "Máx 12 archivos");
const singleImageArray = z.array(imageItem).max(1, "Solo se permite adjuntar 1 imagen");

export const fileSchema = z.object({
  files: filesArray.min(1, "Requerido"),
});

export const optionalFiles = filesArray.optional().nullable();
export const singleOptionalImage = singleImageArray.optional().nullable();
