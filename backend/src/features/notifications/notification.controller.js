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

  async waiterCall(req, res) {
    try {
      const notification = await notificationService.createWaiterCallNotification(req.body || {});
      res.status(201).json({ notification });
    } catch (error) {
      console.error("ERROR BACKEND (POST WAITER CALL):", error);
      res.status(error.status || 400).json({ error: error.message });
    }
  },

  async speak(req, res) {
    try {
      const text = String(req.query?.text || "").trim();
      if (!text) {
        return res.status(400).json({ error: "Texto requerido para sintetizar voz." });
      }
      const audioBuffer = await notificationService.synthesizeSpeechBuffer(text);
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.status(200).send(audioBuffer);
    } catch (error) {
      console.error("ERROR BACKEND (GET TTS):", error);
      res.status(error.status || 502).json({ error: "No se pudo generar el audio de voz." });
    }
  },
};
