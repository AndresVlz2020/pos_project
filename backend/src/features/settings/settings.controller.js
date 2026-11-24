import { settingsRepository } from "./settings.repository.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const settingsController = {
  async getPublicSettings(_req, res) {
    try {
      const supportEmail = await settingsRepository.getSupportEmail();
      res.status(200).json({ supportEmail });
    } catch (error) {
      console.error("ERROR BACKEND (GET PUBLIC SETTINGS):", error);
      res.status(500).json({ error: error.message || "Error al obtener configuración" });
    }
  },

  async updateSupportEmail(req, res) {
    try {
      const rawEmail = String(req.body?.supportEmail ?? req.body?.email ?? "").trim().toLowerCase();
      if (!rawEmail || !EMAIL_REGEX.test(rawEmail)) {
        return res.status(400).json({
          error: "Ingresa un correo de soporte válido (ej. soporte@dpiero.com).",
        });
      }

      const updated = await settingsRepository.updateSupportEmail(rawEmail, req.user?.id);
      return res.status(200).json({
        message: "Correo de soporte actualizado correctamente",
        supportEmail: updated.supportEmail,
        updatedAt: updated.updatedAt,
      });
    } catch (error) {
      console.error("ERROR BACKEND (UPDATE SUPPORT EMAIL):", error);
      return res.status(500).json({
        error: error.message || "Error al actualizar correo de soporte",
      });
    }
  },
};
