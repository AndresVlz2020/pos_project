// backend/src/features/groups/groups.routes.js

import { Router } from "express";
import { groupsController } from "./groups.controller.js";

const router = Router();

router.get("/", groupsController.getAll);

router.get("/:groupId/permissions", groupsController.getPermissionsByGroupId);

router.put("/:groupId/permissions", groupsController.updatePermissions);

export default router;
