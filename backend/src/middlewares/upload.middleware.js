import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOADS_ROOT = path.resolve(__dirname, "../../uploads");

const ALLOWED_FOLDERS = new Set(["products", "users"]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_EXT = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/pjpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function ensureUploadDirectories() {
  fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
  for (const folder of ALLOWED_FOLDERS) {
    fs.mkdirSync(path.join(UPLOADS_ROOT, folder), { recursive: true });
  }
}

ensureUploadDirectories();

/**
 * Normaliza valores booleanos provenientes de JSON o multipart/form-data ("true" / "false").
 */
export function parseBooleanFlag(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0" || normalized === "") return false;
  }
  return Boolean(value);
}

function getSafeExtension(file) {
  const mime = String(file?.mimetype || "").toLowerCase();
  if (ALLOWED_MIME_EXT[mime]) {
    return ALLOWED_MIME_EXT[mime];
  }
  const originalExt = path.extname(file?.originalname || "").toLowerCase();
  return ALLOWED_EXTENSIONS.has(originalExt) ? originalExt : ".jpg";
}

function buildSafeFilename(folder, file) {
  const prefix = folder === "users" ? "user" : "product";
  const ext = getSafeExtension(file);
  const rawStem = path.basename(file?.originalname || prefix, path.extname(file?.originalname || ""));
  const cleanStem = rawStem
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);

  const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  return `${cleanStem || prefix}-${uniqueSuffix}${ext}`;
}

function createImageUploader(folder) {
  if (!ALLOWED_FOLDERS.has(folder)) {
    throw new Error(`Carpeta de subida no permitida: ${folder}`);
  }

  const destinationDir = path.join(UPLOADS_ROOT, folder);
  fs.mkdirSync(destinationDir, { recursive: true });

  const storage = multer.diskStorage({
    destination(_req, _file, cb) {
      fs.mkdirSync(destinationDir, { recursive: true });
      cb(null, destinationDir);
    },
    filename(_req, file, cb) {
      cb(null, buildSafeFilename(folder, file));
    },
  });

  return multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter(_req, file, cb) {
      const mime = String(file?.mimetype || "").toLowerCase();
      if (!ALLOWED_MIME_EXT[mime]) {
        const err = new Error("Solo se permiten imágenes válidas (JPG, PNG, WEBP o GIF).");
        err.status = 400;
        return cb(err);
      }
      return cb(null, true);
    },
  });
}

function mapMulterError(err) {
  if (err?.code === "LIMIT_FILE_SIZE") {
    const friendly = new Error("La imagen supera el tamaño máximo permitido (10 MB).");
    friendly.status = 400;
    return friendly;
  }
  if (err?.code === "LIMIT_UNEXPECTED_FILE") {
    const friendly = new Error("Campo de archivo de imagen no esperado.");
    friendly.status = 400;
    return friendly;
  }
  err.status = err.status || 400;
  return err;
}

/**
 * Middleware condicional que procesa multipart/form-data y guarda la imagen en backend/uploads/<folder>.
 * Mantiene compatibilidad transparente con peticiones JSON sin archivo adjunto.
 */
export function optionalImageUpload(folder) {
  const handler = createImageUploader(folder).fields([
    { name: "image", maxCount: 1 },
    { name: "userImage", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
  ]);

  return (req, res, next) => {
    if (!req.is("multipart/form-data")) {
      return next();
    }

    return handler(req, res, (err) => {
      if (err) {
        return next(mapMulterError(err));
      }

      const uploaded =
        req.files?.image?.[0] ||
        req.files?.userImage?.[0] ||
        req.files?.avatar?.[0] ||
        req.file ||
        null;

      if (uploaded) {
        req.file = uploaded;
        req.uploadedFileUrl = `/api/uploads/${folder}/${uploaded.filename}`;
      }

      return next();
    });
  };
}

/**
 * Elimina de forma segura un archivo temporal recién subido si falló la transacción en BD.
 */
export function cleanupUploadedFile(file) {
  if (!file?.path) return;
  const resolved = path.resolve(file.path);
  if (!resolved.startsWith(`${UPLOADS_ROOT}${path.sep}`)) return;
  fs.promises.unlink(resolved).catch(() => {});
}

/**
 * Elimina un archivo previo guardado bajo /api/uploads/<folder>/<filename> tras ser reemplazado.
 */
export async function removeUploadedFileByUrl(fileUrl) {
  const raw = String(fileUrl || "").trim();
  const match = raw.match(/^\/(?:api\/)?uploads\/(products|users)\/([^/?#]+)$/);
  if (!match) return;

  const [, folder, filename] = match;
  if (!ALLOWED_FOLDERS.has(folder) || filename.includes("..")) return;

  const targetPath = path.resolve(UPLOADS_ROOT, folder, filename);
  if (!targetPath.startsWith(`${UPLOADS_ROOT}${path.sep}`)) return;

  await fs.promises.unlink(targetPath).catch(() => {});
}
