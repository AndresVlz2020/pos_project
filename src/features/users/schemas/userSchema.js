import { z } from "zod";

export const userSchema = z.object ({
    userName: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(60, "El nombre es demasiado largo"),

    userEmail: z
    .string()
    .email("Debe ingresar un email válido")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Debe ingresar un email válido"),


    userPhone: z
    .string()
    .regex(/^[0-9]{10}$/, "El telefono debe ser unicamente numeros"),

    userDocumentTypes: z.string().min(1, "Debe seleccionar un tipo de documento"),

    userDocumentNumber: z
    .string()
    .min(5, "Número de documento inválido")
    .max(20, "Número de documento demasiado largo"),

    userPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un caracter especial"),

    isStaff: z.boolean(),

    isActive: z.boolean(),

    isSuperUser: z.boolean(),


})