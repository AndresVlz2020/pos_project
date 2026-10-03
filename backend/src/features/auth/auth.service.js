// backend/src/features/auth/auth.service.js
// Lógica de autenticación + JWT
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository.js";
import { sendPasswordResetEmail } from "./email.service.js";

export const authService = {
  async login({ email, password }) {
    const user = await authRepository.findByEmail(email);
    console.log("USER ENCONTRADO:", user);

    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    // Comparar password con bcrypt (soporta hashes y fallback a texto plano si fue sembrado directo)
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch {
      isMatch = false;
    }

    if (!isMatch && password === user.password) {
      isMatch = true;
    }

    if (!isMatch) {
      throw new Error("Credenciales inválidas");
    }

    if (!user.is_active) {
      throw new Error("Usuario inactivo");
    }

    const token = jwt.sign(
      { id: user.id, email: user.user_email },
      process.env.JWT_SECRET || "mi_clave_super_segura",
      { expiresIn: process.env.JWT_EXPIRES || "1h" }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.user_email,
        name: user.user_name,
        role: user.is_superuser ? "Admin" : (user.is_staff ? "Mesero" : "Cajero"),
      },
    };
  },

  async forgotPassword(email) {
    if (!email) {
      throw new Error("El correo electrónico es requerido");
    }

    const user = await authRepository.findByEmail(email.trim().toLowerCase());
    if (!user) {
      throw new Error("No existe ningún usuario registrado con ese correo");
    }

    const resetToken = jwt.sign(
      { id: user.id, email: user.user_email, purpose: "reset_password" },
      process.env.JWT_SECRET || "mi_clave_super_segura",
      { expiresIn: "15m" }
    );

    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
    const fullResetUrl = `${frontendBase}/Auth/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail({
      to: user.user_email,
      resetUrl: fullResetUrl,
    });

    return {
      message: `Enlace de restablecimiento generado y enviado a ${user.user_email}`,
      resetToken,
      resetUrl: `/Auth/reset-password?token=${resetToken}`
    };
  },

  async resetPassword({ token, newPassword }) {
    if (!token) {
      throw new Error("Token de recuperación no proporcionado");
    }
    if (!newPassword || newPassword.length < 10) {
      throw new Error("La nueva contraseña debe tener al menos 10 caracteres");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "mi_clave_super_segura");
    } catch {
      throw new Error("El enlace de recuperación es inválido o ha expirado");
    }

    if (decoded.purpose !== "reset_password") {
      throw new Error("Token no válido para restablecimiento");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await authRepository.updatePassword(decoded.id, hashedPassword);

    return {
      message: "Contraseña actualizada exitosamente",
      user: updatedUser
    };
  },
};
