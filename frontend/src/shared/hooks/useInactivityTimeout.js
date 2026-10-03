import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { showErrorAlert } from "../services/alertService";

/**
 * Hook para cierre automático de sesión tras inactividad (RNF09)
 * Tiempo por defecto: 10 minutos (600,000 ms)
 */
export function useInactivityTimeout(timeoutMs = 10 * 60 * 1000) {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    // Si no hay usuario autenticado, no activamos el temporizador
    const hasUser = Boolean(localStorage.getItem("auth_user") || localStorage.getItem("auth_token"));
    if (!hasUser) return;

    const handleTimeout = async () => {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");

      await showErrorAlert({
        title: "Sesión cerrada por inactividad",
        text: "Tu sesión ha expirado tras 10 minutos sin actividad. Por seguridad, inicia sesión nuevamente.",
      });

      navigate("/Auth", { replace: true });
    };

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(handleTimeout, timeoutMs);
    };

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "wheel",
    ];

    // Iniciar temporizador
    resetTimer();

    // Escuchar eventos de interacción del usuario
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate, timeoutMs]);
}

export default useInactivityTimeout;
