import { productRepository } from "./product.repository.js";
import { parseBooleanFlag } from "../../middlewares/upload.middleware.js";

function parseRecipeIngredients(rawIngredients) {
  if (rawIngredients === undefined || rawIngredients === null || rawIngredients === "") {
    return undefined;
  }

  let parsed = rawIngredients;
  if (typeof rawIngredients === "string") {
    try {
      parsed = JSON.parse(rawIngredients);
    } catch {
      throw new Error("Formato inválido en la receta de insumos del producto.");
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Los insumos de la receta deben enviarse como una lista.");
  }

  const seenInsumoIds = new Set();
  return parsed.map((entry, idx) => {
    const insumoId = Number(entry?.insumoId ?? entry?.insumo_id ?? entry?.inventoryId);
    const rawQty = Number(
      entry?.cantidadRequerida ??
        entry?.cantidad_requerida ??
        entry?.quantity ??
        entry?.qty
    );

    if (!Number.isInteger(insumoId) || insumoId <= 0) {
      throw new Error(`El insumo #${idx + 1} de la receta es inválido.`);
    }
    if (seenInsumoIds.has(insumoId)) {
      throw new Error("No se puede repetir un mismo insumo en la receta del platillo.");
    }
    seenInsumoIds.add(insumoId);

    if (!Number.isFinite(rawQty) || rawQty <= 0) {
      throw new Error(
        `La cantidad requerida para el insumo #${idx + 1} debe ser mayor a 0.`
      );
    }

    const cantidadRequerida = Math.round(rawQty * 1000) / 1000;
    if (cantidadRequerida <= 0) {
      throw new Error(
        `La cantidad requerida para el insumo #${idx + 1} debe ser mayor a 0.`
      );
    }

    return { insumoId, cantidadRequerida };
  });
}

function hasManualStockField(data) {
  return (
    data.stock !== undefined &&
    data.stock !== null &&
    String(data.stock).trim() !== ""
  );
}

function resolveRecipePayload(data, { requireOnPresent = true } = {}) {
  const rawRecipe =
    data.ingredients !== undefined
      ? data.ingredients
      : data.recipe !== undefined
      ? data.recipe
      : data.receta;
  const parsedIngredients = parseRecipeIngredients(rawRecipe);

  if (parsedIngredients === undefined) {
    return { shouldSyncRecipe: false, ingredients: undefined };
  }

  if (requireOnPresent && parsedIngredients.length === 0) {
    throw new Error(
      "Todo producto debe tener al menos un insumo vinculado en su receta."
    );
  }

  return {
    shouldSyncRecipe: true,
    ingredients: parsedIngredients,
  };
}

export const productService = {
  async getAllProducts(filters) {
    return await productRepository.findAll(filters);
  },

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error("Producto no encontrado");
    }
    return product;
  },

  async createProduct(data) {
    if (!data.name && !data.title && !data.productName) {
      throw new Error("El nombre del producto es obligatorio");
    }

    const price = Number(data.price || data.productPrice);
    if (isNaN(price) || price <= 0) {
      throw new Error("El precio debe ser un número positivo mayor a 0");
    }

    if (hasManualStockField(data)) {
      throw new Error(
        "El stock del producto no puede asignarse manualmente; se calcula automáticamente según los insumos vinculados en Inventario."
      );
    }

    const recipePayload = resolveRecipePayload(data, { requireOnPresent: true });
    if (!recipePayload.shouldSyncRecipe || !recipePayload.ingredients?.length) {
      throw new Error(
        "Debes vincular al menos un insumo del inventario en la receta para calcular la disponibilidad del producto."
      );
    }

    const payload = {
      name: data.name || data.title || data.productName,
      code: data.code || null,
      description: data.description || data.productDescription || "",
      price,
      category: data.category || data.productCategory || null,
      categoryId: data.categoryId || null,
      imageUrl: data.image || data.imageUrl || null,
      status: data.status || data.productStatus || "Disponible",
      isActive: (() => {
        const rawActive =
          data.isActive !== undefined ? data.isActive : data.is_active;
        return rawActive !== undefined ? parseBooleanFlag(rawActive) : true;
      })(),
      stock: 0,
      ingredients: recipePayload.ingredients,
    };

    return await productRepository.create(payload);
  },

  async updateProduct(id, data) {
    if (hasManualStockField(data)) {
      throw new Error(
        "El stock del producto no puede editarse manualmente; ajusta las existencias desde el módulo de Inventario."
      );
    }

    if (data.price !== undefined) {
      const price = Number(data.price);
      if (isNaN(price) || price <= 0) {
        throw new Error("El precio debe ser un número positivo mayor a 0");
      }
    }

    const recipePayload = resolveRecipePayload(data, { requireOnPresent: true });
    const normalized = {
      ...data,
      shouldSyncRecipe: recipePayload.shouldSyncRecipe,
      ...(recipePayload.shouldSyncRecipe
        ? { ingredients: recipePayload.ingredients }
        : {}),
    };
    delete normalized.stock;

    const updated = await productRepository.update(id, normalized);
    if (!updated) {
      throw new Error("Producto no encontrado para actualizar");
    }
    return updated;
  },

  async updateProductStatus(id, isActive) {
    const updated = await productRepository.updateStatus(id, isActive);
    if (!updated) {
      throw new Error("Producto no encontrado para actualizar estado");
    }
    return updated;
  },

  async getCategories() {
    return await productRepository.getCategories();
  },
};
