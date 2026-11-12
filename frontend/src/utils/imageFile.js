// Utilidad compartida: redimensiona un archivo de imagen a JPEG
// y devuelve una data URL (p. ej. max 480px, calidad 0.78) para
// poder guardarla como texto en la base de datos (products.image_url).
const resizeImageFile = (file, maxDim = 480, quality = 0.78) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen seleccionada"));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(
          1,
          maxDim / Math.max(img.width, img.height)
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("La imagen seleccionada no es válida"));
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

export default resizeImageFile;
