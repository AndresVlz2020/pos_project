import { z } from "zod";
import { fileSchema } from "../../../shared/schemas/fileSchema";

// Esquema para la vista Crear y Editar Usuario (CreateUserPage.jsx / EditUserPage.jsx)
export const createUserSchema = z
  .object({
    userName: z
      .string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(60, "El nombre es demasiado largo")
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre no puede contener números"),

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

    userEmail: z
      .string()
      .email("Debe ingresar un email válido"),

    corporateEmail: z.string().optional().or(z.literal("")),

    startDate: z.string().optional().or(z.literal("")),

    endDate: z.string().optional().or(z.literal("")),

    pin: z.string().optional().or(z.literal("")),

    userPassword: z.string().optional().or(z.literal("")),

    userImage: fileSchema.shape.files.optional(),
  })
  .superRefine((data, ctx) => {
    const isAdmin = ["admin", "Admin", "Administrador"].includes(data.userType);

    if (isAdmin) {
      // Para administrador: se exige contraseña segura
      const pwd = data.userPassword || "";
      if (pwd.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["userPassword"],
          message: "La contraseña debe tener al menos 10 caracteres para el rol Administrador",
        });
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(pwd)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["userPassword"],
          message: "Debe incluir mayúsculas, minúsculas, números y al menos un símbolo especial",
        });
      }
    } else {
      // Para operativos: se exige PIN de 4 dígitos y fechas de contratación
      if (!data.pin || data.pin.length !== 4 || !/^\d{4}$/.test(data.pin)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pin"],
          message: "Debe ingresar un PIN de terminal numérico de exactamente 4 dígitos",
        });
      }

      if (!data.startDate || data.startDate.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startDate"],
          message: "Debe ingresar la fecha de inicio laboral",
        });
      }
      if (!data.endDate || data.endDate.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "Debe ingresar la fecha de fin laboral",
        });
      }
    }
  });

// Esquema general para usuarios (UserRegisterForm.jsx, EditUserPage.jsx)
export const userSchema = z.object({
  userName: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(60, "El nombre es demasiado largo")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre no puede contener números"),


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

// Esquema específico para el login (solo email y contraseña)
export const loginSchema = z.object({
  userEmail: z
    .string()
    .email("Debe ingresar un email válido"),

  userPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),

  remember: z.boolean().optional(),
});