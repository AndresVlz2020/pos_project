import imgWorkerCarlos from "@/assets/images/worker-carlos.webp";
import imgWorkerMaria from "@/assets/images/worker-maria.webp";
import imgWorkerJuan from "@/assets/images/worker-juan.webp";
import imgWorkerAna from "@/assets/images/worker-ana.webp";
import logoOrange from "@/assets/images/logo-dpiero-orange.webp";

const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const API_ORIGIN = RAW_API_URL.replace(/\/+$/, "").startsWith("http")
  ? RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/i, "")
  : "";

/**
 * Resuelve rutas de imágenes almacenadas en el backend (/api/uploads/...)
 */
export function resolveUploadedAssetUrl(rawUrl) {
  const url = String(rawUrl || "").trim();
  if (!url) return "";
  if (url.startsWith("/api/uploads/")) {
    return `${API_ORIGIN}${url}`;
  }
  if (url.startsWith("/uploads/")) {
    return `${API_ORIGIN}/api${url}`;
  }
  return "";
}

const WORKER_ASSETS = {
  "worker-carlos.jpg": imgWorkerCarlos,
  "worker-carlos.webp": imgWorkerCarlos,
  "worker-maria.jpg": imgWorkerMaria,
  "worker-maria.webp": imgWorkerMaria,
  "worker-juan.jpg": imgWorkerJuan,
  "worker-juan.webp": imgWorkerJuan,
  "worker-ana.jpg": imgWorkerAna,
  "worker-ana.webp": imgWorkerAna,
};

/**
 * Resuelve la imagen de avatar para un usuario del sistema POS
 */
export function getUserAvatar(user) {
  if (!user) return imgWorkerCarlos;

  const rawUrl = String(
    user.userAvatarUrl ||
      user.user_avatar_url ||
      user.photo ||
      user.avatar ||
      user.image ||
      ""
  ).trim();

  // Imágenes almacenadas físicamente en backend/uploads
  const uploadedAvatar = resolveUploadedAssetUrl(rawUrl);
  if (uploadedAvatar) {
    return uploadedAvatar;
  }

  // Imágenes personalizadas cargadas por el usuario (Data URL / HTTP / HTTPS)
  if (
    rawUrl.startsWith("data:image/") ||
    rawUrl.startsWith("http://") ||
    rawUrl.startsWith("https://")
  ) {
    return rawUrl;
  }

  // Assets conocidos de empleados (solo si fueron guardados explícitamente)
  const filename = rawUrl.split("/").pop()?.split("?")[0]?.toLowerCase() || "";
  if (filename && WORKER_ASSETS[filename]) {
    return WORKER_ASSETS[filename];
  }

  const text = `${user.userName || user.name || ""} ${user.role || user.userType || ""} ${user.userEmail || user.email || ""}`.toLowerCase();

  if (text.includes("maría") || text.includes("maria") || text.includes("cajera")) {
    return imgWorkerMaria;
  }
  if (text.includes("ana") || text.includes("cocina") || text.includes("cocin")) {
    return imgWorkerAna;
  }
  if (text.includes("santiago") || text.includes("admin") || text.includes("velez") || text.includes("juan")) {
    return imgWorkerJuan;
  }
  if (text.includes("carlos") || text.includes("mesero") || text.includes("salon")) {
    return imgWorkerCarlos;
  }

  return imgWorkerCarlos;
}

export const formatRole = (role = "") => {
  const r = String(role || "").toLowerCase();
  if (r.includes("caj")) return "Cajero";
  if (r.includes("meser") || r.includes("salon")) return "Mesero";
  if (r.includes("cocin") || r.includes("parrill") || r.includes("brasa")) return "Cocina";
  if (r.includes("admin")) return "Administrador";
  return role || "Mesero";
};

export {
  imgWorkerCarlos,
  imgWorkerMaria,
  imgWorkerJuan,
  imgWorkerAna,
  logoOrange,
};
