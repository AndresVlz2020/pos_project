import Swal from "sweetalert2";

function sanitizeMessage(str) {
  if (!str || typeof str !== "string") return str;
  return str
    .replace(/\s*(en|de|a|desde)?\s*(la|tu|nuestra)?\s*base de datos\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
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
    customClass: {
      popup: "rounded-2xl bg-[#0F152D] text-white border border-[#1B2246]",
      title: "text-emerald-400 font-bold",
      htmlContainer: "text-gray-300 text-sm",
      confirmButton: "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer",
    },
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
    cleanText = "Error inesperado de conexión con el servidor backend.";
  }

  return Swal.fire({
    icon: "error",
    title: sanitizeMessage(title) || "Error inesperado",
    text: sanitizeMessage(cleanText),
    confirmButtonText,
    customClass: {
      popup: "rounded-2xl bg-[#0F152D] text-white border border-[#1B2246]",
      title: "text-red-400 font-bold",
      htmlContainer: "text-gray-300 text-sm",
      confirmButton: "bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer",
    },
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
    customClass: {
      popup: "rounded-2xl bg-[#0F152D] text-white border border-[#1B2246]",
      title: "text-amber-400 font-bold",
      htmlContainer: "text-gray-300 text-sm",
      confirmButton: "bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer",
    },
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
    customClass: {
      popup: "rounded-2xl bg-[#0F152D] text-white border border-[#1B2246]",
      title: "text-white font-bold",
      htmlContainer: "text-gray-300 text-sm",
      confirmButton: `${
        isDestructive ? "bg-red-600 hover:bg-red-700" : "bg-[#B3673E] hover:bg-[#8C5132]"
      } text-white font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer ml-3`,
      cancelButtonText: "bg-[#1B2246] hover:bg-[#232B58] text-gray-200 font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer",
    },
    buttonsStyling: false,
  });
}

export default {
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
  showConfirmAlert,
};
