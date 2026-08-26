import { z } from "zod";
import { fileSchema } from "../../../shared/schemas/fileSchema";

export const productSchema = z.object ({

    productName: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(60, "El nombre es demasiado largo"),

    productPrice: z
    .string()
    .min(1, "El precio del producto debe ser mayor a 0"),
    
    productCategory: z.string().min(1, "Debe seleccionar una categoria"),
    
    productDescription: z
    .string()
    .min(5, "Ingrese una descripcion valida")
    .max(500, "La descripcion supera los 500 caracteres"),
    
    productStatus: z.string().min(1, "Debe seleccionar un estado"),

    userImage: fileSchema.shape.files.optional()
    
})