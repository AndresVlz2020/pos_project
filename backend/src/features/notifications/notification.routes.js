import { Router } from "express";
import { notificationController } from "./notification.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

// Rutas públicas para el menú QR (llamado de mesero y voz neural real)
router.post("/waiter-call", notificationController.waiterCall);
router.get("/tts", notificationController.speak);

router.use(authenticateToken);
router.get("/", notificationController.list);
router.patch("/read-all", notificationController.markAllRead);
router.patch("/:id/read", notificationController.markRead);

export default router;
