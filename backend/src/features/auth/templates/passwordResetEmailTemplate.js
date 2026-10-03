// backend/src/features/auth/templates/passwordResetEmailTemplate.js
// Plantilla de correo componentizada con variables y tokens de diseño

/**
 * Tokens y variables centrales de diseño del correo
 */
export const EMAIL_DESIGN_TOKENS = {
  brandName: "D'Piero Restaurante",
  brandSubtitle: "Parrilla, Bar & Sistema POS",
  colors: {
    bgApp: "#090D1E",
    bgCard: "#0F152D",
    borderCard: "#1B2246",
    primary: "#EA580C",
    primaryLight: "#F97316",
    textWhite: "#FFFFFF",
    textMuted: "#94A3B8",
    textFooter: "#64748B",
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  config: {
    expirationMinutes: 15,
  },
};

/**
 * Componente: Encabezado institucional
 */
export function EmailHeader({
  brandName = EMAIL_DESIGN_TOKENS.brandName,
  subtitle = EMAIL_DESIGN_TOKENS.brandSubtitle,
} = {}) {
  const { colors } = EMAIL_DESIGN_TOKENS;
  return `
    <div style="margin-bottom: 24px; border-bottom: 1px solid ${colors.borderCard}; padding-bottom: 16px;">
      <h2 style="color: ${colors.primaryLight}; margin: 0 0 4px 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">
        ${brandName}
      </h2>
      <span style="color: ${colors.textFooter}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">
        ${subtitle}
      </span>
    </div>
  `;
}

/**
 * Componente: Botón de Acción Principal (CTA)
 */
export function EmailButton({
  href,
  label = "Restablecer mi Contraseña",
} = {}) {
  const { colors } = EMAIL_DESIGN_TOKENS;
  return `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${href}" target="_blank" style="
        background-color: ${colors.primary};
        color: ${colors.textWhite};
        padding: 13px 28px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 700;
        font-size: 14px;
        display: inline-block;
        letter-spacing: 0.01em;
        box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
      ">
        ${label}
      </a>
    </div>
  `;
}

/**
 * Componente: Pie de página con vigencia y nota de seguridad
 */
export function EmailFooter({
  expirationMinutes = EMAIL_DESIGN_TOKENS.config.expirationMinutes,
} = {}) {
  const { colors } = EMAIL_DESIGN_TOKENS;
  return `
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid ${colors.borderCard};">
      <p style="color: ${colors.textFooter}; font-size: 11px; line-height: 1.5; margin: 0 0 6px 0;">
        ⏱️ Este enlace es de un solo uso y vencerá en <strong>${expirationMinutes} minutos</strong> por seguridad.
      </p>
      <p style="color: ${colors.textFooter}; font-size: 11px; line-height: 1.5; margin: 0;">
        Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura; tu cuenta no sufrirá modificaciones.
      </p>
    </div>
  `;
}

/**
 * Componente / Plantilla Raíz Ensamblada
 */
export function generatePasswordResetEmailHtml({
  to,
  resetUrl,
  brandName = EMAIL_DESIGN_TOKENS.brandName,
  expirationMinutes = EMAIL_DESIGN_TOKENS.config.expirationMinutes,
} = {}) {
  const { colors, typography } = EMAIL_DESIGN_TOKENS;

  const header = EmailHeader({ brandName });
  const button = EmailButton({ href: resetUrl });
  const footer = EmailFooter({ expirationMinutes });

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Restablecer Contraseña - ${brandName}</title>
    </head>
    <body style="margin: 0; padding: 24px 12px; background-color: ${colors.bgApp}; font-family: ${typography.fontFamily};">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table role="presentation" style="max-width: 520px; width: 100%; background-color: ${colors.bgCard}; border: 1px solid ${colors.borderCard}; border-radius: 14px; padding: 28px; text-align: left; box-shadow: 0 10px 25px rgba(0,0,0,0.4);" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td>
                  ${header}

                  <h3 style="color: ${colors.textWhite}; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
                    Recuperación de Contraseña
                  </h3>

                  <p style="color: ${colors.textMuted}; font-size: 13.5px; line-height: 1.6; margin: 0 0 8px 0;">
                    Hemos recibido una solicitud para restablecer la contraseña de acceso asociada a tu cuenta:
                  </p>

                  <div style="background-color: rgba(27, 34, 70, 0.5); border-left: 3px solid ${colors.primaryLight}; padding: 8px 12px; margin: 12px 0; border-radius: 4px;">
                    <span style="color: ${colors.textWhite}; font-size: 13px; font-family: monospace; font-weight: 600;">
                      ${to}
                    </span>
                  </div>

                  <p style="color: ${colors.textMuted}; font-size: 13px; line-height: 1.5; margin: 0;">
                    Para continuar y configurar una nueva clave de acceso en el sistema, pulsa el siguiente botón:
                  </p>

                  ${button}

                  ${footer}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
