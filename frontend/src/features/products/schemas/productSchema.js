import { z } from "zod";
import { optionalFiles } from "../../../shared/schemas/fileSchema";

export const productSchema = z.object({
  productName: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(60, "El nombre es demasiado largo"),

  productPrice: z
    .string()
    .min(1, "El precio del producto es requerido")
    .refine((val) => {
      const num = parseFloat(String(val).replace(/\$/g, "").replace(/\./g, "").trim());
      return !isNaN(num) && num > 0;
    }, "El precio del platillo debe ser un valor numérico positivo mayor a 0"),

  productCategory: z
    .string()
    .min(1, "Debe seleccionar una categoría previamente registrada en el sistema"),

  productDescription: z
    .string()
    .min(5, "Ingrese una descripción válida")
    .max(500, "La descripción supera los 500 caracteres"),

  productStatus: z
    .string()
    .min(1, "Debe seleccionar un estado operativo"),

  userImage: optionalFiles,
});