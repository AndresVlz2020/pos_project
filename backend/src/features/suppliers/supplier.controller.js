import { supplierService } from "./supplier.service.js";

export const supplierController = {
    async create(req, res) {
        try {
            const supplier = await supplierService.createSupplier(req.body);
            res.status(201).json({
                message: "Proveedor creado correctamente",
                supplierID: supplier.id,
                supplier
            });
        } catch (err) {
            console.error("ERROR BACKEND (CREATE SUPPLIER): ", err);
            res.status(500).json({ error: err.message });
        }
    },

    async getAll(req, res) {
        try {
            const suppliers = await supplierService.getAllSuppliers();
            res.status(200).json(suppliers);
        } catch (err) {
            console.error("ERROR BACKEND (GET SUPPLIERS): ", err);
            res.status(500).json({ error: err.message });
        }
    },

    async getById(req, res) {
        try {
            const supplier = await supplierService.getSupplierById(req.params.id);
            res.status(200).json(supplier);
        } catch (err) {
            res.status(404).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const supplier = await supplierService.updateSupplier(req.params.id, req.body);
            res.status(200).json({
                message: "Proveedor actualizado correctamente",
                supplier
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    async updateSupplierStatus(req, res) {
        try {
            const { id } = req.params;
            const { is_active } = req.body;
            const updatedSupplier = await supplierService.updateSupplierStatus(id, is_active);

            return res.status(200).json({
                message: "Estado actualizado",
                supplier: updatedSupplier
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};
