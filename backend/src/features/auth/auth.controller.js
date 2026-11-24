// backend/src/features/auth/auth.controller.js
// endpoint login

import bcrypt from "bcrypt";
import { authService, resolveUserFlagsAndRole } from "./auth.service.js";
import { userRepository } from "../users/user.repository.js";
import { settingsRepository } from "../settings/settings.repository.js";
import {
  cleanupUploadedFile,
  removeUploadedFileByUrl,
} from "../../middlewares/upload.middleware.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeSelfProfile(userRow, reqUser) {
  if (!userRow) return null;
  const { isSuperuser, isAdmin, role } = resolveUserFlagsAndRole({
    is_superuser: userRow.isSuperUser,
    user_type: userRow.userType,
    is_staff: userRow.isStaff,
    is_admin_group: Boolean(reqUser?.isAdmin || reqUser?.isSuperuser),
  });

  return {
    id: userRow.id,
    userName: userRow.userName,
    userEmail: userRow.userEmail,
    corporateEmail: userRow.corporateEmail,
    userPhone: userRow.userPhone || "",
    userDocumentTypes: userRow.userDocumentTypes || "CC",
    userDocumentNumber: userRow.userDocumentNumber || "",
    userType: userRow.userType || role.toLowerCase(),
    role: isAdmin ? "Administrador" : userRow.role || role,
    startDate: userRow.startDate || null,
    endDate: userRow.endDate || null,
    userAvatarUrl: userRow.userAvatarUrl || null,
    photo: userRow.userAvatarUrl || null,
    isActive: Boolean(userRow.isActive),
    isAdmin,
    isSuperUser: isSuperuser,
    dataConsentAcceptedAt: userRow.dataConsentAcceptedAt || null,
    createdAt: userRow.createdAt || null,
  };
}

export const authController = {
  async login(req, res) {
    try {
      const result = await authService.login(req.body);

      res.status(200).json({
        message: "Login exitoso",
        ...result,
      });
    } catch (err) {
      const status = err.status || 401;
      res.status(status).json({
        error: err.message,
        ...(err.meta || {}),
      });
    }
  },

  async getProfile(req, res) {
    try {
      const [userRow, supportEmail] = await Promise.all([
        userRepository.findById(req.user.id),
        settingsRepository.getSupportEmail(),
      ]);

      if (!userRow) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const profile = sanitizeSelfProfile(userRow, req.user);
      const canEdit = Boolean(profile?.isAdmin);

      return res.status(200).json({
        profile,
        supportEmail,
        canEditProfile: canEdit,
        canEditSupportEmail: canEdit,
      });
    } catch (err) {
      console.error("ERROR BACKEND (GET /api/auth/me):", err);
      return res.status(500).json({ error: err.message || "Error al consultar el perfil" });
    }
  },

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const existing = await userRepository.findById(userId);
      if (!existing) {
        cleanupUploadedFile(req.file);
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const body = req.body || {};
      const nextEmail =
        body.userEmail !== undefined
          ? String(body.userEmail).trim().toLowerCase()
          : existing.userEmail;
      if (!EMAIL_REGEX.test(nextEmail)) {
        cleanupUploadedFile(req.file);
        return res.status(400).json({ error: "El correo electrónico ingresado no es válido." });
      }

      let hashedPassword = null;
      if (body.userPassword && String(body.userPassword).trim() !== "") {
        const rawPwd = String(body.userPassword);
        if (
          rawPwd.length < 10 ||
          !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(rawPwd)
        ) {
          cleanupUploadedFile(req.file);
          return res.status(400).json({
            error:
              "La nueva contraseña debe tener mínimo 10 caracteres e incluir mayúsculas, minúsculas, números y símbolos.",
          });
        }
        hashedPassword = await bcrypt.hash(rawPwd, 10);
      }

      const nextSupportEmail =
        body.supportEmail !== undefined ? String(body.supportEmail).trim().toLowerCase() : undefined;
      if (nextSupportEmail !== undefined && !EMAIL_REGEX.test(nextSupportEmail)) {
        cleanupUploadedFile(req.file);
        return res.status(400).json({ error: "El correo de soporte no tiene un formato válido." });
      }

      const updatedUser = await userRepository.update(userId, {
        userName: body.userName !== undefined ? String(body.userName).trim() : undefined,
        userEmail: nextEmail,
        corporateEmail:
          body.corporateEmail !== undefined ? String(body.corporateEmail).trim() : nextEmail,
        userPhone: body.userPhone !== undefined ? String(body.userPhone).trim() : undefined,
        userDocumentTypes:
          body.userDocumentTypes !== undefined ? String(body.userDocumentTypes).trim() : undefined,
        userDocumentNumber:
          body.userDocumentNumber !== undefined ? String(body.userDocumentNumber).trim() : undefined,
        ...(hashedPassword ? { userPassword: hashedPassword } : {}),
        ...(req.uploadedFileUrl ? { userAvatarUrl: req.uploadedFileUrl } : {}),
      });

      if (
        req.uploadedFileUrl &&
        existing.userAvatarUrl &&
        existing.userAvatarUrl !== req.uploadedFileUrl
      ) {
        await removeUploadedFileByUrl(existing.userAvatarUrl);
      }

      let resolvedSupportEmail;
      if (nextSupportEmail !== undefined) {
        const updatedSetting = await settingsRepository.updateSupportEmail(nextSupportEmail, userId);
        resolvedSupportEmail = updatedSetting.supportEmail;
      } else {
        resolvedSupportEmail = await settingsRepository.getSupportEmail();
      }

      const freshRow = await userRepository.findById(userId);
      const profile = sanitizeSelfProfile(freshRow || updatedUser, req.user);

      return res.status(200).json({
        message: "Perfil actualizado correctamente",
        profile,
        supportEmail: resolvedSupportEmail,
        canEditProfile: Boolean(profile?.isAdmin),
        canEditSupportEmail: Boolean(profile?.isAdmin),
      });
    } catch (err) {
      cleanupUploadedFile(req.file);
      console.error("ERROR BACKEND (PUT /api/auth/me):", err);
      return res.status(err.status || 400).json({
        error: err.message || "No se pudo actualizar el perfil",
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
