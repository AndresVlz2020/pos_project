// backend/src/features/auth/auth.service.js
// Lógica de autenticación + JWT
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository.js";
import { sendPasswordResetEmail } from "./email.service.js";

export const authService = {
  async login({ email, password }) {
    if (!email || !password) {
      throw new Error("El correo y la contraseña son requeridos");
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    const user = await authRepository.findByEmail(cleanEmail);
    console.log("USER ENCONTRADO:", user ? { id: user.id, email: user.user_email, type: user.user_type } : null);

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
        isMatch = await bcrypt.compare(cleanPassword, user.password);
      } catch {
        isMatch = false;
      }

      if (!isMatch && cleanPassword === user.password) {
        isMatch = true;
      }
    }

    // 2. Soporte para personal operativo (mesero, cajero, cocina) cuyo acceso principal es por PIN
    if (!isMatch && user.pin && cleanPassword === String(user.pin).trim()) {
      isMatch = true;
    }

    if (!isMatch) {
      throw new Error("Credenciales inválidas");
    }

    const token = jwt.sign(
      { id: user.id, email: user.user_email },
      process.env.JWT_SECRET || "mi_clave_super_segura",
      { expiresIn: process.env.JWT_EXPIRES || "1h" }
    );

    // Formatear rol según user_type real de la BD
    let role = "Staff";
    if (user.is_superuser || user.user_type === "admin" || user.user_type === "Admin") {
      role = "Admin";
    } else if (user.user_type) {
      role = user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1).toLowerCase();
    } else if (user.is_staff) {
      role = "Mesero";
    }

    return {
      token,
      user: {
        id: user.id,
        email: user.user_email,
        name: user.user_name,
        role,
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
        decoded = jwt.verify(token, process.env.JWT_SECRET || "mi_clave_super_segura");
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
