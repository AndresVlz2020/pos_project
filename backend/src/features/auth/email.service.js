import nodemailer from "nodemailer";
import { generatePasswordResetEmailHtml, EMAIL_DESIGN_TOKENS } from "./templates/passwordResetEmailTemplate.js";

export async function sendPasswordResetEmail({ to, resetUrl }) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user,
          pass,
        },
      });

      const mailOptions = {
        from: `"${EMAIL_DESIGN_TOKENS.brandName}" <${user}>`,
        to,
        subject: `Restablecimiento de Contraseña - ${EMAIL_DESIGN_TOKENS.brandName}`,
        html: generatePasswordResetEmailHtml({ to, resetUrl }),
      };

      await transporter.sendMail(mailOptions);
      console.log(` [Email enviado exitosamente a ${to}]`);
      return { sent: true };
    } catch (err) {
      console.warn(" Error al enviar correo por Gmail SMTP:", err.message);
      return { sent: false, error: err.message };
    }
  } else {
    console.log(` [SMTP no configurado] Para enviar a tu Gmail real, agrega SMTP_PASS a backend/.env.`);
    console.log(` Enlace generado: ${resetUrl}`);
    return { sent: false, fallback: true };
  }
}
