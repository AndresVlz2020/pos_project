import { RouterProvider } from "react-router-dom";
import router from "@/App/router";

// Al abrir la aplicación (carga en frío / refresh), siempre inicia en la
// pantalla de inicio de sesión: no se conserva la sesión entre entradas.
if (typeof window !== "undefined") {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
}

export default function App() {
  return <RouterProvider router={router} />;
}
