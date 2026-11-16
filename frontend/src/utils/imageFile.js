// Utilidad compartida: redimensiona un archivo de imagen a JPEG
// y devuelve una data URL (p. ej. max 480px, calidad 0.78) para
// guardarla como texto en la base de datos (products.image_url / users.user_avatar_url).
const resizeImageFile = (file, maxDim = 480, quality = 0.78) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No se seleccionó ninguna imagen"));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round((img.width || 1) * scale));
        canvas.height = Math.max(1, Math.round((img.height || 1) * scale));
        const ctx = canvas.getContext("2d");

        // Rellenar fondo blanco para imágenes PNG/WEBP/GIF con transparencia
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      } catch {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("No se pudo procesar la imagen seleccionada."));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error(
          "El navegador no pudo leer este formato de imagen. Prueba con JPG, PNG o WEBP."
        )
      );
    };

    img.src = objectUrl;
  });

export default resizeImageFile;
