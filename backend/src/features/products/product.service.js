import { productRepository } from "./product.repository.js";

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
    if (isNaN(price) || price < 0) {
      throw new Error("El precio debe ser un número mayor o igual a 0");
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
      isActive: data.isActive !== undefined ? data.isActive : (data.is_active !== undefined ? data.is_active : true),
      stock: data.stock !== undefined ? Number(data.stock) : 0,
    };

    return await productRepository.create(payload);
  },

  async updateProduct(id, data) {
    if (data.price !== undefined) {
      const price = Number(data.price);
      if (isNaN(price) || price < 0) {
        throw new Error("El precio debe ser un número mayor o igual a 0");
      }
    }

    const updated = await productRepository.update(id, data);
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
