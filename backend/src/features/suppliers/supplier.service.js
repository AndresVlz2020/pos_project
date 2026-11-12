import { supplierRepository } from "./supplier.repository.js";

export const supplierService = {
    async createSupplier(data) {
        return await supplierRepository.create(data);
    },

    async getAllSuppliers() {
        return await supplierRepository.findAll();
    },

    async getSupplierById(id) {
        const supplier = await supplierRepository.findById(id);
        if (!supplier) throw new Error("Proveedor no encontrado");
        return supplier;
    },

    async updateSupplier(id, data) {
        return await supplierRepository.update(id, data);
    },

    async updateSupplierStatus(id, is_active) {
        return await supplierRepository.updateStatus(id, is_active);
    }
};
