import { inventoryRepository } from "./inventory.repository.js";
import { notificationService } from "../notifications/notification.service.js";

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

    const normalizedCode = data.code ? String(data.code).trim() : null;
    if (normalizedCode) {
      const existing = await inventoryRepository.findByCode(normalizedCode);
      if (existing) {
        throw new Error(`Ya existe un insumo registrado con el ID/Código "${normalizedCode}".`);
      }
    }

    const payload = {
      code: normalizedCode,
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

    const created = await inventoryRepository.create(payload);
    if (created?.id) {
      await notificationService
        .syncInventoryStockAlertsByInsumoIds([created.id])
        .catch((err) =>
          console.warn("No se pudo evaluar alerta de stock al crear insumo:", err)
        );
    }
    return created;
  },

  async update(id, data, actorUserId = null) {
    const updated = await inventoryRepository.update(id, data, actorUserId);
    if (!updated) throw new Error("Insumo no encontrado para actualizar");
    if (updated?.id) {
      await notificationService
        .syncInventoryStockAlertsByInsumoIds(
          [updated.id],
          actorUserId ? { id: actorUserId } : null
        )
        .catch((err) =>
          console.warn("No se pudo evaluar alerta de stock al actualizar insumo:", err)
        );
    }
    return updated;
  },

  async getMovements(id, limit = 50) {
    const movements = await inventoryRepository.findMovementsByInsumoId(id, limit);
    if (movements === null) throw new Error("Insumo de inventario no encontrado");
    return movements;
  },

  async updateStatus(id, isActive) {
    const updated = await inventoryRepository.updateStatus(id, isActive);
    if (!updated) throw new Error("Insumo no encontrado para actualizar estado");
    return updated;
  },
};
