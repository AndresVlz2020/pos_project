import { inventoryService } from "./inventory.service.js";

export const inventoryController = {
  async getAll(req, res) {
    try {
      const activeOnly = req.query.active === "true" || req.query.activeOnly === "true";
      const category = req.query.category || null;

      const items = await inventoryService.getAll({ activeOnly, category });
      res.status(200).json(items);
    } catch (error) {
      console.error("ERROR BACKEND (GET INVENTORY):", error);
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const item = await inventoryService.getById(req.params.id);
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const created = await inventoryService.create(req.body);
      res.status(201).json({
        message: "Insumo creado exitosamente en PostgreSQL",
        item: created,
      });
    } catch (error) {
      console.error("ERROR BACKEND (CREATE INVENTORY):", error);
      res.status(400).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const updated = await inventoryService.update(req.params.id, req.body);
      res.status(200).json({
        message: "Insumo actualizado exitosamente",
        item: updated,
      });
    } catch (error) {
      console.error("ERROR BACKEND (UPDATE INVENTORY):", error);
      res.status(400).json({ error: error.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const isActive = req.body.is_active !== undefined
        ? req.body.is_active
        : (req.body.isActive !== undefined ? req.body.isActive : (req.body.status === "Activo"));

      const updated = await inventoryService.updateStatus(id, Boolean(isActive));
      res.status(200).json({
        message: "Estado del insumo actualizado en PostgreSQL",
        item: updated,
      });
    } catch (error) {
      console.error("ERROR BACKEND (UPDATE INVENTORY STATUS):", error);
      res.status(400).json({ error: error.message });
    }
  },
};
