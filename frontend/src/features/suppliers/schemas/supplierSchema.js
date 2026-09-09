import { z } from "zod";
import { fileSchema } from "../../../shared/schemas/fileSchema";

export const supplierSchema = z.object({
  supplierNit: z
    .string()
    .min(5, "El NIT debe tener al menos 5 caracteres")
    .max(30, "El NIT es demasiado largo"),

  supplierName: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(60, "El nombre es demasiado largo"),

  supplierEmail: z
    .string()
    .email("Debe ingresar un email válido"),

  supplierPhone: z
    .string()
    .min(7, "El teléfono debe tener al menos 7 números")
    .regex(/^[0-9+ -]+$/, "El teléfono debe ser únicamente números"),

  supplierDirection: z
    .string()
    .min(5, "Ingrese una dirección válida (mínimo 5 caracteres)")
    .max(120, "La dirección supera los 120 caracteres"),

  supplierObservation: z
    .string()
    .min(5, "Ingrese una observación válida (mínimo 5 caracteres)")
    .max(500, "La observación supera los 500 caracteres"),

  isStaff: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isSuperUser: z.boolean().optional(),

  userImage: fileSchema.shape.files.optional(),
});