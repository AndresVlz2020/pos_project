// backend/src/features/auth/webauthn.controller.js
// Controladores HTTP para WebAuthn, validación de correo y Step-Up de Administrador

import { webauthnService } from "./webauthn.service.js";

function handleControllerError(res, err, fallbackStatus = 400) {
  const status = err?.status || fallbackStatus;
  res.status(status).json({
    error: err?.message || "Error procesando solicitud biométrica",
    ...(err?.meta || {}),
  });
}

export const webauthnController = {
  async listCredentials(req, res) {
    try {
      const credentials = await webauthnService.listMyCredentials(req.user.id);
      res.status(200).json({ credentials });
    } catch (err) {
      handleControllerError(res, err, 500);
    }
  },

  async deleteCredential(req, res) {
    try {
      const deleted = await webauthnService.deleteMyCredential(req.user.id, req.params.id);
      res.status(200).json({ message: "Credencial eliminada", deleted });
    } catch (err) {
      handleControllerError(res, err, 404);
    }
  },

  async registerOptions(req, res) {
    try {
      const options = await webauthnService.createRegistrationOptions(
        req.user.id,
        req.get("origin")
      );
      res.status(200).json({ options });
    } catch (err) {
      handleControllerError(res, err, 400);
    }
  },

  async registerVerify(req, res) {
    try {
      const credential = await webauthnService.verifyAndSaveRegistration(
        req.user.id,
        {
          response: req.body?.response,
          deviceLabel: req.body?.deviceLabel,
          userAgent: req.get("user-agent"),
        },
        req.get("origin")
      );
      res.status(201).json({
        message: "Huella/biometría registrada correctamente",
        credential,
      });
    } catch (err) {
      handleControllerError(res, err, 400);
    }
  },

  async emailCheck(req, res) {
    try {
      const clientKey = req.ip || req.headers["x-forwarded-for"] || "unknown";
      const result = await webauthnService.checkEmailForLogin(req.body?.email, String(clientKey));
      res.status(200).json(result);
    } catch (err) {
      handleControllerError(res, err, 400);
    }
  },

  async userStatus(req, res) {
    try {
      const status = await webauthnService.getUserBiometricAndLockStatus(req.params.userId);
      res.status(200).json(status);
    } catch (err) {
      handleControllerError(res, err, 400);
    }
  },

  async loginOptions(req, res) {
    try {
      const options = await webauthnService.createLoginOptions(
        {
          userId: req.body?.userId,
          email: req.body?.email,
        },
        req.get("origin")
      );
      res.status(200).json({ options });
    } catch (err) {
      handleControllerError(res, err, 400);
    }
  },

  async loginVerify(req, res) {
    try {
      const result = await webauthnService.verifyLoginAssertion(
        {
          userId: req.body?.userId,
          email: req.body?.email,
          response: req.body?.response,
        },
        req.get("origin")
      );
      res.status(200).json({
        message: "Login biométrico exitoso",
        ...result,
      });
    } catch (err) {
      handleControllerError(res, err, 401);
    }
  },

  async stepUpOptions(req, res) {
    try {
      const result = await webauthnService.createStepUpOptions(
        req.user.id,
        req.get("origin")
      );
      res.status(200).json(result);
    } catch (err) {
      handleControllerError(res, err, 400);
    }
  },

  async stepUpVerify(req, res) {
    try {
      const result = await webauthnService.verifyStepUp(
        req.user.id,
        {
          response: req.body?.response,
          password: req.body?.password,
        },
        req.get("origin")
      );
      res.status(200).json(result);
    } catch (err) {
      handleControllerError(res, err, 401);
    }
  },
};
