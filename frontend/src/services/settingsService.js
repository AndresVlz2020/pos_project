import { API_URL } from "@/features/config";
import { getAdminStepUpHeaders } from "@/shared/services/adminStepUpService";
import { getAuthHeaders } from "@/shared/utils/authStorage";

const SETTINGS_URL = `${API_URL}/settings`;

export async function getPublicSettingsApi() {
  const response = await fetch(`${SETTINGS_URL}/public`, {
    method: "GET",
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "No se pudo consultar la configuración pública.");
  }
  return data;
}

export async function updateSupportEmailApi(supportEmail) {
  const stepUpHeaders = await getAdminStepUpHeaders("Actualizar correo de soporte");
  const response = await fetch(`${SETTINGS_URL}/support-email`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      ...stepUpHeaders,
    },
    body: JSON.stringify({ supportEmail }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || "No se pudo actualizar el correo de soporte.");
  }
  return data;
}
