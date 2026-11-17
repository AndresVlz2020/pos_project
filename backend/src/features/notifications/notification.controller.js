import { notificationService } from "./notification.service.js";

export const notificationController = {
  async list(req, res) {
    try {
      const data = await notificationService.listForUser(req.user);
      res.status(200).json(data);
    } catch (error) {
      console.error("ERROR BACKEND (GET NOTIFICATIONS):", error);
      res.status(error.status || 500).json({ error: error.message });
    }
  },

  async markRead(req, res) {
    try {
      const result = await notificationService.markAsRead(req.params.id, req.user);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 400).json({ error: error.message });
    }
  },

  async markAllRead(req, res) {
    try {
      const result = await notificationService.markAllAsRead(req.user);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 400).json({ error: error.message });
    }
  },
};
