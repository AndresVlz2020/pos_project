/**
 * Optimiza imágenes grandes antes de enviarlas al backend/reverse-proxy
 * (evita rechazos HTTP 412/413 en proxies con límites de 1 MB y acelera la carga).
 */

const TARGET_MAX_BYTES = 750 * 1024; // 750 KB margen holgado < 1 MB
const MAX_DIMENSION = 1280;

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
    img.src = objectUrl;
  });
}

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

export async function compressImageIfNeeded(file) {
  if (!(file instanceof File || file instanceof Blob)) return file;

  const mime = String(file.type || "").toLowerCase();
  // No rasterizar SVG ni GIF animados pequeños
  if (mime === "image/svg+xml" || (mime === "image/gif" && file.size <= TARGET_MAX_BYTES)) {
    return file;
  }

  if (typeof document === "undefined" || typeof Image === "undefined") {
    return file;
  }

  try {
    const img = await loadImageElement(file);
    const origW = img.naturalWidth || img.width || 0;
    const origH = img.naturalHeight || img.height || 0;
    if (!origW || !origH) return file;

    const needsResize = origW > MAX_DIMENSION || origH > MAX_DIMENSION;
    if (!needsResize && file.size <= TARGET_MAX_BYTES) {
      return file;
    }

    const scale = needsResize ? Math.min(MAX_DIMENSION / origW, MAX_DIMENSION / origH) : 1;
    let width = Math.max(1, Math.round(origW * scale));
    let height = Math.max(1, Math.round(origH * scale));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    const outputMime = mime === "image/png" ? "image/webp" : "image/webp";
    const fallbackMime = "image/jpeg";

    for (let attempt = 0; attempt < 4; attempt++) {
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const quality = Math.max(0.55, 0.86 - attempt * 0.1);
      let blob = await canvasToBlob(canvas, outputMime, quality);
      if (!blob || (blob.type && blob.type !== outputMime)) {
        blob = await canvasToBlob(canvas, fallbackMime, quality);
      }

      if (blob && (blob.size <= TARGET_MAX_BYTES || attempt === 3)) {
        if (blob.size >= file.size && file.size <= 950 * 1024) {
          return file;
        }
        const finalMime = blob.type || fallbackMime;
        const ext = finalMime === "image/webp" ? ".webp" : ".jpg";
        const baseName = String(file.name || "imagen").replace(/\.[^.]+$/, "");
        return new File([blob], `${baseName}${ext}`, {
          type: finalMime,
          lastModified: Date.now(),
        });
      }

      width = Math.max(320, Math.round(width * 0.8));
      height = Math.max(320, Math.round(height * 0.8));
    }

    return file;
  } catch {
    return file;
  }
}
