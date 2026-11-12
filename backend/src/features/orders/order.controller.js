import { orderService } from "./order.service.js";

export const orderController = {
  async getAll(req, res) {
    try {
      const status = req.query.status || null;
      const orders = await orderService.getAllOrders({ status });
      res.status(200).json(orders);
    } catch (error) {
      console.error("ERROR BACKEND (GET ORDERS):", error);
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      res.status(200).json(order);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const order = await orderService.createOrder(req.body);
      res.status(201).json({
        message: "Comanda registrada en PostgreSQL exitosamente",
        order,
      });
    } catch (error) {
      console.error("ERROR BACKEND (CREATE ORDER):", error);
      res.status(400).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const order = await orderService.updateOrder(req.params.id, req.body);
      res.status(200).json({
        message: "Comanda actualizada exitosamente",
        order,
      });
    } catch (error) {
      console.error("ERROR BACKEND (UPDATE ORDER):", error);
      res.status(400).json({ error: error.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(id, status);
      res.status(200).json({
        message: "Estado de la comanda actualizado en PostgreSQL",
        order,
      });
    } catch (error) {
      console.error("ERROR BACKEND (UPDATE ORDER STATUS):", error);
      res.status(400).json({ error: error.message });
    }
  },

  async cancel(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};
      const order = await orderService.cancelOrder(id, reason);
      res.status(200).json({
        message: "Comanda anulada exitosamente",
        order,
      });
    } catch (error) {
      console.error("ERROR BACKEND (CANCEL ORDER):", error);
      res.status(400).json({ error: error.message });
    }
  },

  async getTables(req, res) {
    try {
      const tables = await orderService.getTablesAvailability();
      res.status(200).json(tables);
    } catch (error) {
      console.error("ERROR BACKEND (GET TABLES):", error);
      res.status(500).json({ error: error.message });
    }
  },
};
