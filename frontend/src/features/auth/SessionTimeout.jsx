import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, M3Icon, showWarningAlert } from "@/shared";

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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--md-sys-color-scrim)] backdrop-blur-xs"
      role="alertdialog"
      aria-modal="true"
    >
      <div className="dpiero-modal-in w-full max-w-sm bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] rounded-[28px] p-6 m3-elevation-3 text-[var(--md-sys-color-on-surface)] text-center">
        <div className="mx-auto size-12 rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning-border)] flex items-center justify-center mb-4">
          <M3Icon name="warning" filled size={24} />
        </div>
        <h3 className="text-2xl leading-8 font-medium mb-2">
          Sesión a punto de expirar
        </h3>
        <p className="text-sm leading-5 text-[var(--md-sys-color-on-surface-variant)] mb-6">
          Por inactividad, tu sesión se cerrará automáticamente en{" "}
          <strong className="text-[var(--md-sys-color-primary)] font-mono">
            {remainingSeconds}s
          </strong>
          .
        </p>
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="text"
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
            variant="filled"
            size="md"
            onClick={resetTimers}
          >
            Mantener activa
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SessionTimeout;
