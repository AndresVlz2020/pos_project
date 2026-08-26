import { z } from "zod";
import { fileSchema } from "../../../shared/schemas/fileSchema";

export const supplierSchema = z.object ({
    supplierNit: z
    .string()
    .regex(/^[0-9]{10}$/, "El NIT solo debe contener numeros"),

    supplierName: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(60, "El nombre es demasiado largo"),

    supplierEmail: z
    .string()
    .email("Debe ingresar un email válido")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Debe ingresar un email válido"),

    supplierPhone: z
    .string()
    .regex(/^[0-9]{10}$/, "El telefono debe ser unicamente numeros"),

    supplierDirection: z
    .string()
    .min(5, "Ingrese una direccion valida")
    .max(100, "La direccion supera los 100 caracteres"),

    supplierObservation: z
    .string()
    .min(5, "Ingrese una observacion valida")
    .max(500, "La observacion supera los 500 caracteres"),

    isStaff: z.boolean(),

    isActive: z.boolean(),

    isSuperUser: z.boolean(),

    userImage: fileSchema.shape.files.optional()
    
})