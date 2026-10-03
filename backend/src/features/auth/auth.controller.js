// backend/src/features/auth/auth.controller.js
// endpoint login

import { authService } from "./auth.service.js";

export const authController = {
  async login(req, res) {
    try {
      const result = await authService.login(req.body);

      res.status(200).json({
        message: "Login exitoso",
        ...result,
      });
    } catch (err) {
      res.status(401).json({
        error: err.message,
      });
    }
  },

  async forgotPassword(req, res) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async resetPassword(req, res) {
    try {
      const result = await authService.resetPassword(req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
