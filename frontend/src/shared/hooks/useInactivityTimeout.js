import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { showErrorAlert } from "../services/alertService";
import { endCurrentSession } from "@/services/sessionService";

/**
 * Hook para cierre automático de sesión tras inactividad (RNF09)
 * Tiempo por defecto: 10 minutos (600,000 ms)
 */
export function useInactivityTimeout(timeoutMs = 10 * 60 * 1000) {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const triggeredRef = useRef(false);

  useEffect(() => {
    const hasUser = Boolean(
      localStorage.getItem("auth_user") ||
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("user") ||
        sessionStorage.getItem("token")
    );
    if (!hasUser) return;

    triggeredRef.current = false;
    lastActivityRef.current = Date.now();

    const handleTimeout = async () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;

      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);

      await endCurrentSession();

      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");

      await showErrorAlert({
        title: "Sesión cerrada por inactividad",
        text: "Tu sesión ha expirado tras 10 minutos sin actividad. Por seguridad, inicia sesión nuevamente.",
        confirmButtonText: "Volver al inicio de sesión",
      });

      navigate("/Auth", { replace: true });
    };

    const resetTimer = () => {
      if (triggeredRef.current) return;
      lastActivityRef.current = Date.now();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(handleTimeout, timeoutMs);
    };

    const checkElapsed = () => {
      if (triggeredRef.current) return;
      if (Date.now() - lastActivityRef.current >= timeoutMs) {
        handleTimeout();
      }
    };

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "wheel",
    ];

    resetTimer();
    intervalRef.current = setInterval(checkElapsed, 15000);

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });
    document.addEventListener("visibilitychange", checkElapsed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      document.removeEventListener("visibilitychange", checkElapsed);
    };
  }, [navigate, timeoutMs]);
}

export default useInactivityTimeout;
