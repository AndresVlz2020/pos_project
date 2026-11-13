// backend/src/features/auth/auth.service.js
// Lógica de autenticación + JWT
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository.js";
import { sendPasswordResetEmail } from "./email.service.js";
import { getJWTSecret, getJWTExpires } from "../../config/env.js";
import { sessionRepository } from "../sessions/session.repository.js";

export const authService = {
  async login({ email, password, userId, pin }) {
    let user = null;

    if (userId) {
      user = await authRepository.findById(Number(userId));
    } else if (email) {
      const cleanEmail = String(email).trim().toLowerCase();
      user = await authRepository.findByEmail(cleanEmail);
    }

    const secretInput = String(password || pin || "").trim();

    if ((!email && !userId) || !secretInput) {
      throw new Error("El correo/usuario y la contraseña/PIN son requeridos");
    }

    console.log(
      "USER ENCONTRADO:",
      user ? { id: user.id, email: user.user_email, type: user.user_type } : null
    );

    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    if (!user.is_active) {
      throw new Error("Usuario inactivo");
    }

    // 1. Comparar password con bcrypt (soporta hashes y fallback a texto plano si fue sembrado directo)
    let isMatch = false;
    if (user.password && user.password.length > 0) {
      try {
        isMatch = await bcrypt.compare(secretInput, user.password);
      } catch {
        isMatch = false;
      }

      if (!isMatch && secretInput === user.password) {
        isMatch = true;
      }
    }

    // 2. Soporte para personal operativo (mesero, cajero, cocina) cuyo acceso principal es por PIN
    if (!isMatch && user.pin && secretInput === String(user.pin).trim()) {
      isMatch = true;
    }

    if (!isMatch) {
      throw new Error("Credenciales inválidas");
    }

    const isSuperuser = Boolean(user.is_superuser);
    const isAdmin = Boolean(
      user.is_superuser ||
      user.is_admin_group ||
      String(user.user_type || "").toLowerCase() === "admin" ||
      String(user.user_type || "").toLowerCase() === "administrador"
    );

    // Formatear rol según user_type real de la BD
    let role = "Staff";
    if (isAdmin) {
      role = "Admin";
    } else if (user.user_type) {
      const rawType = user.user_type.toLowerCase();
      if (rawType.includes("caj")) role = "Cajero";
      else if (rawType.includes("meser")) role = "Mesero";
      else if (rawType.includes("cocin")) role = "Cocina";
      else role = user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1).toLowerCase();
    } else if (user.is_staff) {
      role = "Mesero";
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.user_email,
        role,
        isSuperuser,
        isAdmin,
      },
      getJWTSecret(),
      { expiresIn: getJWTExpires() }
    );

    let activeSession = null;
    if (!isAdmin) {
      try {
        activeSession = await sessionRepository.startSession(user.id);
      } catch (err) {
        console.warn("No se pudo iniciar registro de sesión de turno:", err.message);
      }
    }

    return {
      token,
      session: activeSession,
      user: {
        id: user.id,
        email: user.user_email,
        name: user.user_name,
        role,
        isSuperuser,
        isAdmin,
      },
    };
  },

  async forgotPassword(email) {
    if (!email) {
      throw new Error("El correo electrónico es requerido");
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await authRepository.findByEmail(cleanEmail);
    if (!user) {
      throw new Error("No existe ningún usuario registrado con ese correo");
    }

    // Generar código numérico seguro de 6 dígitos
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await authRepository.saveResetCode(user.id, user.user_email, code, expiresAt);

    await sendPasswordResetEmail({
      to: user.user_email,
      code,
    });

    return {
      success: true,
      message: `Código de verificación de 6 dígitos enviado a ${user.user_email}.`,
      email: user.user_email,
    };
  },

  async resetPassword({ email, code, token, newPassword }) {
    if (!newPassword || newPassword.length < 10) {
      throw new Error("La nueva contraseña debe tener al menos 10 caracteres");
    }

    let targetUserId = null;
    let codeRecordId = null;

    // Método principal: Código de verificación de 6 dígitos
    if (email && code) {
      const cleanEmail = String(email).trim().toLowerCase();
      const cleanCode = String(code).trim();

      if (cleanCode.length !== 6) {
        throw new Error("El código de verificación debe tener exactamente 6 dígitos");
      }

      const validCodeRecord = await authRepository.findValidResetCode(cleanEmail, cleanCode);
      if (!validCodeRecord) {
        throw new Error("Código de verificación inválido o expirado. Solicita un nuevo código.");
      }

      targetUserId = validCodeRecord.user_id;
      codeRecordId = validCodeRecord.id;
    } else if (token) {
      // Método de compatibilidad por token
      let decoded;
      try {
        decoded = jwt.verify(token, getJWTSecret());
      } catch {
        throw new Error("El enlace o token de recuperación es inválido o ha expirado");
      }

      if (decoded.purpose !== "reset_password") {
        throw new Error("Token no válido para restablecimiento");
      }

      targetUserId = decoded.id;
    } else {
      throw new Error("Debes proporcionar tu correo y el código de verificación de 6 dígitos");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await authRepository.updatePassword(targetUserId, hashedPassword);

    if (codeRecordId) {
      await authRepository.markCodeAsUsed(codeRecordId);
    }

    return {
      success: true,
      message: "Contraseña actualizada exitosamente",
      user: updatedUser
    };
  },
};
