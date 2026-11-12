import { inventoryRepository } from "./inventory.repository.js";

export const inventoryService = {
  async getAll(filters) {
    return await inventoryRepository.findAll(filters);
  },

  async getById(id) {
    const item = await inventoryRepository.findById(id);
    if (!item) throw new Error("Insumo de inventario no encontrado");
    return item;
  },

  async create(data) {
    if (!data.itemName && !data.productName && !data.inventoryProductName) {
      throw new Error("El nombre del insumo es obligatorio");
    }

    const payload = {
      itemName: data.itemName || data.productName || data.inventoryProductName,
      category: data.category || data.productCategory || "Insumos Secos",
      brand: data.brand || data.productBrandSelect || "Genérica",
      currentStock: Number(data.currentStock || data.initialStock || 0),
      minStock: Number(data.minStock || data.minAmount || 0),
      maxStock: Number(data.maxStock || 0),
      unitMeasure: data.unitMeasure || "unidad",
      supplierId: data.supplierId || null,
      supplierName: data.supplier || data.inventorySupplierSelect || null,
      location: data.location || data.inventoryProductLocation || "Almacén Central",
      priceBuy: Number(data.priceBuy || 0),
      batchNumber: data.batchNumber || data.numberBatch || null,
      expirationDate: data.expirationDate || null,
      status: data.status || "Activo",
      isActive: data.isActive !== undefined ? data.isActive : true,
    };

    return await inventoryRepository.create(payload);
  },

  async update(id, data) {
    const updated = await inventoryRepository.update(id, data);
    if (!updated) throw new Error("Insumo no encontrado para actualizar");
    return updated;
  },

  async updateStatus(id, isActive) {
    const updated = await inventoryRepository.updateStatus(id, isActive);
    if (!updated) throw new Error("Insumo no encontrado para actualizar estado");
    return updated;
  },
};
