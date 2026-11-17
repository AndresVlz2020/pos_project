// src/features/auth/components/SessionTimeout.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button, showWarningAlert } from "@/shared";

export function SessionTimeout({ timeoutMinutes = 10, warningSeconds = 60 }) {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(warningSeconds);

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = timeoutMs - warningSeconds * 1000;

  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const resetTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setShowWarning(false);
    setRemainingSeconds(warningSeconds);

    // Timer de advertencia
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      countdownIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, warningMs);

    // Timer de cierre definitivo con aviso y confirmación SweetAlert
    timerRef.current = setTimeout(async () => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      setShowWarning(false);

      await showWarningAlert({
        title: "Sesión cerrada por inactividad",
        text: "Tu sesión se cerró automáticamente por seguridad tras un período de inactividad.",
        confirmButtonText: "Volver al inicio de sesión",
      });

      navigate("/Auth", { replace: true });
    }, timeoutMs);
  };

  useEffect(() => {
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    const handleActivity = () => {
      if (!showWarning) {
        resetTimers();
      }
    };

    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetTimers();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showWarning]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="dpiero-modal-in w-full max-w-sm bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-[28px] p-6 shadow-2xl text-[var(--color-white)] text-center">
        <div className="mx-auto size-12 rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning-border)] flex items-center justify-center mb-4">
          <AlertTriangle className="size-6" />
        </div>
        <h3 className="text-title-lg font-bold mb-2">Sesión a punto de expirar</h3>
        <p className="text-sm text-[var(--color-gray-300)] mb-6">
          Por inactividad, tu sesión se cerrará automáticamente en{" "}
          <strong className="text-[var(--color-primary-400)] font-mono">{remainingSeconds}s</strong>.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => {
              localStorage.removeItem("auth_token");
              navigate("/Auth");
            }}
          >
            Cerrar ahora
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={resetTimers}
          >
            Mantener sesión activa
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SessionTimeout;
