// backend/src/features/access/access.controller.js
// Obtener usuario desde JWT y verificar permiso por codename

import { accessService } from "./access.service.js";

export const accessController = {
  async testPermission(req, res) {
    try {
      const userId = req.user.id;
      const permissionCode = req.params.permissionCode;

      const hasPermission = await accessService.hasPermission(
        userId,
        permissionCode,
      );

      res.json({
        userId,
        permission: permissionCode,
        granted: hasPermission,
      });
    } catch (error) {
      console.error("Error verificando permiso:", error);
      res.status(500).json({
        error: "Error verificando permiso",
      });
    }
  },
};
