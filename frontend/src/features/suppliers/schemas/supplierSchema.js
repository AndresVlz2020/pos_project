import { z } from "zod";
import { optionalFiles } from "../../../shared/schemas/fileSchema";

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
    .min(7, "El teléfono debe tener al menos 7 caracteres")
    .regex(/^[0-9+ \-.()]+$/, "El teléfono debe contener únicamente números y caracteres de marcado (+, -, .)"),

  supplierDirection: z
    .string()
    .min(3, "Ingrese una dirección válida (mínimo 3 caracteres)")
    .max(160, "La dirección supera los 160 caracteres"),

  supplierObservation: z
    .string()
    .max(500, "La observación supera los 500 caracteres")
    .optional()
    .or(z.literal("")),

  isStaff: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isSuperUser: z.boolean().optional(),

  userImage: optionalFiles,
});