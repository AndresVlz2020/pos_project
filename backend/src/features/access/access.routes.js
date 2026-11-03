// backend/src/features/access/access.routes.js

import { Router } from "express";
import { accessController } from "./access.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/check/:permissionCode",
  authenticateToken,
  accessController.testPermission,
);

export default router;
