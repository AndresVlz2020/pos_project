import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { sessionController } from "./session.controller.js";

const router = Router();

router.use(authenticateToken);

router.get("/current", sessionController.getCurrent);
router.post("/heartbeat", sessionController.heartbeat);
router.post("/end", sessionController.end);
router.get("/active", sessionController.getActiveStaff);
router.get("/history", sessionController.getHistory);

export default router;
