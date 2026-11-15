import Swal from "sweetalert2";

function sanitizeMessage(str) {
  if (!str || typeof str !== "string") return str;
  return str
    .replace(/\s*(en|de|a|desde|con)?\s*(la|tu|nuestra)?\s*(base de datos|PostgreSQL|Postgres)\s*/gi, " ")
    .replace(/\s*servidor backend(\s*\(puerto \d+\))?\s*/gi, " servicio ")
    .replace(/\s*en el puerto \d+\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getUnifiedCustomClass({ isDestructive = false } = {}) {
  return {
    container: "dpiero-swal-container",
    popup: "dpiero-swal-popup dpiero-modal-in",
    title: "dpiero-swal-title",
    htmlContainer: "dpiero-swal-html",
    actions: "dpiero-swal-actions",
    confirmButton: `dpiero-swal-btn ${
      isDestructive ? "dpiero-swal-btn-danger" : "dpiero-swal-btn-primary"
    }`,
    cancelButton: "dpiero-swal-btn dpiero-swal-btn-cancel",
    timerProgressBar: "dpiero-swal-progress",
  };
}

export function showSuccessAlert({
  title = "Éxito",
  text = "",
  confirmButtonText = "Aceptar",
  timer = 3000,
} = {}) {
  return Swal.fire({
    icon: "success",
    title: sanitizeMessage(title),
    text: sanitizeMessage(text),
    confirmButtonText,
    timer,
    timerProgressBar: true,
    customClass: getUnifiedCustomClass({ isDestructive: false }),
    buttonsStyling: false,
  });
}

export function showErrorAlert({
  title = "Error inesperado",
  text = "Ocurrió un error inesperado al procesar la solicitud.",
  confirmButtonText = "Entendido",
} = {}) {
  let cleanText = text;
  if (
    !cleanText ||
    String(cleanText).toLowerCase().includes("failed to fetch") ||
    String(cleanText).toLowerCase().includes("fetch") ||
    String(cleanText).toLowerCase().includes("networkerror")
  ) {
    cleanText = "No fue posible conectar con el servicio. Verifica tu conexión e inténtalo de nuevo.";
  }

  return Swal.fire({
    icon: "error",
    title: sanitizeMessage(title) || "Error inesperado",
    text: sanitizeMessage(cleanText),
    confirmButtonText,
    customClass: getUnifiedCustomClass({ isDestructive: true }),
    buttonsStyling: false,
  });
}

export function showWarningAlert({
  title = "Atención",
  text = "",
  confirmButtonText = "Aceptar",
} = {}) {
  return Swal.fire({
    icon: "warning",
    title: sanitizeMessage(title),
    text: sanitizeMessage(text),
    confirmButtonText,
    customClass: getUnifiedCustomClass({ isDestructive: false }),
    buttonsStyling: false,
  });
}

export function showConfirmAlert({
  title = "¿Está seguro?",
  text = "Esta acción no se puede deshacer.",
  confirmButtonText = "Sí, confirmar",
  cancelButtonText = "Cancelar",
  isDestructive = false,
} = {}) {
  return Swal.fire({
    title: sanitizeMessage(title),
    text: sanitizeMessage(text),
    icon: isDestructive ? "warning" : "question",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    customClass: getUnifiedCustomClass({ isDestructive }),
    buttonsStyling: false,
  });
}

export default {
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
  showConfirmAlert,
};
