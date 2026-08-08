import { z } from "zod";
import { fileSchema } from "../../../shared/schemas/fileSchema";

export const inventorySchema = z.object ({

    inventorySupplierSelect: z.string().min(1, "Debe seleccionar un proveedor"),

    inventoryProductName: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(60, "El nombre es demasiado largo"),

    inventoryProductAccountant: z
    .string()
    .min(3, "Debe tener al menos 3 caracteres")
    .max(60, "Es demasiado largo"),

    inventoryProductDescription: z
    .string()
    .min(5, "Ingrese una descripcion valida")
    .max(500, "La descripcion supera los 500 caracteres"),

    inventoryProductLocation: z
    .string()
    .min(5, "Ingrese una ubicacion valida")
    .max(500, "La ubicacion supera los 500 caracteres"),

    productBrandSelect: z.string().min(1, "Debe seleccionar una marca"),

    numberBatch: z
    .string()
    .min(2, "Debe tener al menos 2 caracteres")
    .max(30, "El numero es muy grande"),
    
    initialStock: z
    .string()
    .min(1, "El stock inicial debe ser mayor a 0"),

    minAmount: z
    .string()
    .min(1, "La cantidad minima debe ser mayor a 0"),

    priceBuy: z
    .string()
    .min(1, "El valor de la compra debe ser mayor a 0"),
    
    userImage: fileSchema.shape.files.optional()
    
})