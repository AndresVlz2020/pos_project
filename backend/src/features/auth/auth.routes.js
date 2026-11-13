// backend/src/features/auth/auth.routes.js
// Rutas de autenticación

import { Router } from "express";
import { authController } from "./auth.controller.js";
import { webauthnController } from "./webauthn.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

// POST /api/auth/login
router.post("/login", authController.login);

// POST /api/auth/forgot-password
router.post("/forgot-password", authController.forgotPassword);

// POST /api/auth/reset-password
router.post("/reset-password", authController.resetPassword);

// Gestión biométrica opcional (todos los roles autenticados)
router.get("/webauthn/credentials", authenticateToken, webauthnController.listCredentials);
router.delete("/webauthn/credentials/:id", authenticateToken, webauthnController.deleteCredential);
router.post("/webauthn/register/options", authenticateToken, webauthnController.registerOptions);
router.post("/webauthn/register/verify", authenticateToken, webauthnController.registerVerify);

// Flujo de acceso por huella (Admin paso 1 + login por huella / PIN status)
router.post("/webauthn/login/email-check", webauthnController.emailCheck);
router.get("/webauthn/users/:userId/status", webauthnController.userStatus);
router.post("/webauthn/login/options", webauthnController.loginOptions);
router.post("/webauthn/login/verify", webauthnController.loginVerify);

// Confirmación Step-Up para acciones críticas de Administrador (huella o contraseña)
router.post("/step-up/options", authenticateToken, webauthnController.stepUpOptions);
router.post("/step-up/verify", authenticateToken, webauthnController.stepUpVerify);

export default router;
