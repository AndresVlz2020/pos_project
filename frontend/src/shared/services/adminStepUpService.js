// frontend/src/shared/services/adminStepUpService.js
// Puente global para exigir confirmación de Administrador (huella o contraseña)
// antes de ejecutar mutaciones críticas en el backend.

import { isCurrentUserAdmin } from "@/services/biometricService";

let stepUpListener = null;

export function registerAdminStepUpListener(listener) {
  stepUpListener = listener;
  return () => {
    if (stepUpListener === listener) {
      stepUpListener = null;
    }
  };
}

/**
 * Solicita al administrador actual confirmar su identidad mediante huella
 * (si el dispositivo y la cuenta la tienen) o contraseña de administrador.
 * Para Cajeros, Meseros y Cocina retorna objeto vacío {} sin bloquear el flujo.
 */
export async function getAdminStepUpHeaders(actionLabel = "Confirmar acción crítica") {
  if (!isCurrentUserAdmin()) {
    return {};
  }

  if (typeof stepUpListener !== "function") {
    throw new Error(
      "El módulo de verificación de seguridad del administrador no está disponible."
    );
  }

  const stepUpToken = await stepUpListener({ actionLabel });
  return {
    "X-Admin-Confirm-Token": stepUpToken,
  };
}
