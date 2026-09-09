import { z } from "zod";
import { fileSchema } from "../../../shared/schemas/fileSchema";

// Esquema para la vista Crear Usuario (CreateUser.jsx)
export const createUserSchema = z.object({
  userName: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(60, "El nombre es demasiado largo"),

  userDocumentNumber: z
    .string()
    .min(5, "Número de documento inválido")
    .max(20, "Número de documento demasiado largo"),

  userType: z
    .string()
    .min(1, "Debe seleccionar un tipo de usuario"),

  userPhone: z
    .string()
    .min(7, "El teléfono debe tener al menos 7 números")
    .regex(/^[0-9+ -]+$/, "El teléfono debe ser únicamente números"),

  userDocumentTypes: z
    .string()
    .min(1, "Debe seleccionar un tipo de documento"),

  corporateEmail: z
    .string()
    .email("Debe ingresar un email válido"),

  userEmail: z
    .string()
    .email("Debe ingresar un email válido"),

  startDate: z
    .string()
    .min(1, "Debe ingresar la fecha de inicio laboral"),

  endDate: z
    .string()
    .min(1, "Debe ingresar la fecha de fin laboral"),

  userImage: fileSchema.shape.files.optional(),
});

// Esquema general para usuarios (UserRegisterForm.jsx, EditUser1.jsx)
export const userSchema = z.object({
  userName: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(60, "El nombre es demasiado largo"),

  userEmail: z
    .string()
    .email("Debe ingresar un email válido"),

  userPhone: z
    .string()
    .min(7, "El teléfono debe tener al menos 7 números")
    .regex(/^[0-9+ -]+$/, "El teléfono debe ser únicamente números"),

  userDocumentTypes: z
    .string()
    .min(1, "Debe seleccionar un tipo de documento"),

  userType: z.string().optional(),

  userDocumentNumber: z
    .string()
    .min(5, "Número de documento inválido")
    .max(20, "Número de documento demasiado largo"),

  userPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .optional()
    .or(z.literal("")),

  isStaff: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isSuperUser: z.boolean().optional(),

  userImage: fileSchema.shape.files.optional(),
});