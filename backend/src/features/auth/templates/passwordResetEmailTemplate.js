/**
 * @fileoverview Plantilla HTML modular para correo de restablecimiento de contraseña.
 * Alineada al sistema de diseño Material Design 3 (Terracotta / Warm Espresso) de D'Piero.
 */

export const EMAIL_DESIGN_TOKENS = {
  brandName: "D'Piero Restaurante",
  brandSubtitle: "Parrilla, Bar & Sistema POS",
  colors: {
    // Superficies M3 Light (Terracotta / Warm Espresso)
    surface: "#FFF8F5",
    surfaceContainerLowest: "#FFFFFF",
    surfaceContainerLow: "#FAF1EC",
    surfaceContainer: "#F4ECE7",
    surfaceContainerHigh: "#EEE6E1",
    // Primarios y contenedores M3
    primary: "#9E4F24",
    onPrimary: "#FFFFFF",
    primaryContainer: "#FFDBCA",
    onPrimaryContainer: "#351000",
    // Texto y bordes M3
    onSurface: "#221A16",
    onSurfaceVariant: "#52443D",
    outline: "#85746B",
    outlineVariant: "#D7C2B9",
    // Acento oscuro para prefers-color-scheme: dark (idéntico a global.css)
    darkSurface: "#181210",
    darkSurfaceContainerLow: "#211A17",
    darkSurfaceContainer: "#251E1B",
    darkPrimary: "#FFB691",
    darkOnPrimary: "#571F00",
    darkPrimaryContainer: "#7D360E",
    darkOnPrimaryContainer: "#FFDBCA",
    darkOnSurface: "#EDE0DA",
    darkOnSurfaceVariant: "#D7C2B9",
    darkOutlineVariant: "#52443D",
  },
  typography: {
    fontFamily: "'Roboto', 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    monoFamily: "'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  shape: {
    cardRadius: "28px",
    containerRadius: "16px",
    chipRadius: "12px",
    pillRadius: "9999px",
  },
  config: {
    expirationMinutes: 15,
  },
};

/**
 * Componente de cabecera de marca del correo (M3 Terracotta).
 */
export function EmailHeader({ title, subtitle }) {
  const { colors } = EMAIL_DESIGN_TOKENS;
  return `
    <div style="border-bottom: 1px solid ${colors.outlineVariant}; padding-bottom: 18px; margin-bottom: 24px;">
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
        <tr>
          <td>
            <h2 class="dp-brand-title" style="color: ${colors.primary}; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.2;">
              ${title}
            </h2>
            <p class="dp-text-muted" style="color: ${colors.onSurfaceVariant}; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">
              ${subtitle}
            </p>
          </td>
          <td align="right" valign="middle">
            <span class="dp-badge" style="display: inline-block; background-color: ${colors.primaryContainer}; color: ${colors.onPrimaryContainer}; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: ${EMAIL_DESIGN_TOKENS.shape.pillRadius}; letter-spacing: 0.03em;">
              Seguridad POS
            </span>
          </td>
        </tr>
      </table>
    </div>
  `;
}

/**
 * Componente de botón de acción principal (M3 Filled Pill Button).
 */
export function EmailButton({ href, label }) {
  const { colors, shape } = EMAIL_DESIGN_TOKENS;
  return `
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0 8px 0;">
      <tr>
        <td align="center" bgcolor="${colors.primary}" style="border-radius: ${shape.pillRadius};">
          <a href="${href}" target="_blank" style="display: inline-block; padding: 13px 28px; font-size: 14px; font-weight: 600; color: ${colors.onPrimary}; text-decoration: none; border-radius: ${shape.pillRadius}; letter-spacing: 0.01em;">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Componente visual para el código de verificación numérico de 6 dígitos (M3 Primary Container).
 */
export function EmailVerificationCode({ code }) {
  const { colors, typography, shape } = EMAIL_DESIGN_TOKENS;
  const formattedCode = String(code).split("").join(" ");
  return `
    <div class="dp-code-box" style="background-color: ${colors.primaryContainer}; border: 1px solid ${colors.outlineVariant}; border-radius: ${shape.containerRadius}; padding: 24px 16px; text-align: center; margin: 24px 0;">
      <p class="dp-code-eyebrow" style="color: ${colors.onPrimaryContainer}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; margin: 0 0 10px 0;">
        Tu Código de Verificación
      </p>
      <div class="dp-code-digits" style="font-size: 36px; font-weight: 700; color: ${colors.primary}; letter-spacing: 8px; font-family: ${typography.monoFamily}; line-height: 1.15;">
        ${formattedCode}
      </div>
      <p class="dp-code-hint" style="color: ${colors.onPrimaryContainer}; opacity: 0.85; font-size: 12px; margin: 12px 0 0 0; line-height: 1.4;">
        Ingresa este código de 6 dígitos en la pantalla de recuperación
      </p>
    </div>
  `;
}

/**
 * Componente de pie de página con notas de seguridad.
 */
export function EmailFooter({ expirationMinutes }) {
  const { colors } = EMAIL_DESIGN_TOKENS;
  return `
    <div class="dp-footer" style="border-top: 1px solid ${colors.outlineVariant}; margin-top: 24px; padding-top: 16px;">
      <p class="dp-text-muted" style="color: ${colors.onSurfaceVariant}; font-size: 12px; line-height: 1.5; margin: 0 0 8px 0;">
        &#9201; Este código es de un solo uso y vencerá en <strong class="dp-text-strong" style="color: ${colors.onSurface};">${expirationMinutes} minutos</strong> por seguridad.
      </p>
      <p class="dp-text-muted" style="color: ${colors.onSurfaceVariant}; font-size: 11.5px; line-height: 1.5; margin: 0;">
        Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura; tu cuenta no sufrirá modificaciones.
      </p>
    </div>
  `;
}

/**
 * Genera el HTML completo del correo de restablecimiento con código de 6 dígitos.
 * Incluye variables CSS M3 en `<style>` para clientes compatibles y fallbacks inline
 * basados en `EMAIL_DESIGN_TOKENS` para clientes que ignoran `<style>`.
 *
 * @param {Object} params
 * @param {string} params.to - Correo electrónico del destinatario.
 * @param {string} params.code - Código de verificación de 6 dígitos.
 * @returns {string} HTML completo listo para enviar por SMTP.
 */
export function generatePasswordResetEmailHtml({ to, code }) {
  const { brandName, brandSubtitle, colors, typography, shape, config } = EMAIL_DESIGN_TOKENS;

  const header = EmailHeader({
    title: brandName,
    subtitle: brandSubtitle,
  });

  const codeBlock = EmailVerificationCode({ code });
  const footer = EmailFooter({ expirationMinutes: config.expirationMinutes });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Código de Verificación - ${brandName}</title>
  <style>
    :root {
      --md-sys-color-surface: ${colors.surface};
      --md-sys-color-surface-container-lowest: ${colors.surfaceContainerLowest};
      --md-sys-color-surface-container-low: ${colors.surfaceContainerLow};
      --md-sys-color-surface-container: ${colors.surfaceContainer};
      --md-sys-color-primary: ${colors.primary};
      --md-sys-color-primary-container: ${colors.primaryContainer};
      --md-sys-color-on-primary-container: ${colors.onPrimaryContainer};
      --md-sys-color-on-surface: ${colors.onSurface};
      --md-sys-color-on-surface-variant: ${colors.onSurfaceVariant};
      --md-sys-color-outline-variant: ${colors.outlineVariant};
    }
    a.dp-email-link {
      color: ${colors.onSurface} !important;
      text-decoration: none !important;
    }
    @media (prefers-color-scheme: dark) {
      body.dp-body {
        background-color: ${colors.darkSurface} !important;
      }
      table.dp-card {
        background-color: ${colors.darkSurfaceContainerLow} !important;
        border-color: ${colors.darkOutlineVariant} !important;
      }
      .dp-brand-title,
      .dp-code-digits {
        color: ${colors.darkPrimary} !important;
      }
      .dp-text-strong,
      a.dp-email-link {
        color: ${colors.darkOnSurface} !important;
      }
      .dp-text-muted {
        color: ${colors.darkOnSurfaceVariant} !important;
      }
      .dp-email-chip {
        background-color: ${colors.darkSurfaceContainer} !important;
        border-left-color: ${colors.darkPrimary} !important;
      }
      .dp-code-box,
      .dp-badge {
        background-color: ${colors.darkPrimaryContainer} !important;
        border-color: ${colors.darkOutlineVariant} !important;
      }
      .dp-code-eyebrow,
      .dp-code-hint,
      .dp-badge {
        color: ${colors.darkOnPrimaryContainer} !important;
      }
      .dp-footer {
        border-top-color: ${colors.darkOutlineVariant} !important;
      }
    }
  </style>
</head>
<body class="dp-body" style="margin: 0; padding: 28px 12px; background-color: ${colors.surface}; font-family: ${typography.fontFamily}; color: ${colors.onSurface};">
  <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
    <tr>
      <td align="center">
        <table role="presentation" class="dp-card" style="max-width: 520px; width: 100%; background-color: ${colors.surfaceContainerLowest}; border: 1px solid ${colors.outlineVariant}; border-radius: ${shape.cardRadius}; padding: 32px 28px; text-align: left; box-shadow: 0 4px 16px rgba(34, 26, 22, 0.08);" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              ${header}

              <h3 class="dp-text-strong" style="color: ${colors.onSurface}; font-size: 20px; margin: 0 0 10px 0; font-weight: 700; letter-spacing: -0.015em; line-height: 1.3;">
                Código para Restablecer Contraseña
              </h3>

              <p class="dp-text-muted" style="color: ${colors.onSurfaceVariant}; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0;">
                Hemos recibido una solicitud para cambiar la contraseña de tu cuenta:
              </p>

              <div class="dp-email-chip" style="background-color: ${colors.surfaceContainer}; border-left: 4px solid ${colors.primary}; padding: 10px 14px; margin: 14px 0; border-radius: ${shape.chipRadius};">
                <a href="mailto:${to}" class="dp-email-link" style="color: ${colors.onSurface}; font-size: 13.5px; font-family: ${typography.monoFamily}; font-weight: 600; text-decoration: none;">
                  ${to}
                </a>
              </div>

              <p class="dp-text-muted" style="color: ${colors.onSurfaceVariant}; font-size: 14px; line-height: 1.55; margin: 0;">
                Usa el siguiente código de seguridad en el sistema para autorizar el cambio de tu contraseña:
              </p>

              ${codeBlock}

              ${footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
