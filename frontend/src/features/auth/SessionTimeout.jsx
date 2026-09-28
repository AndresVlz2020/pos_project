// src/features/auth/components/SessionTimeout.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared";

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

    // Timer de cierre definitivo
    timerRef.current = setTimeout(() => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      navigate("/Auth");
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-sm bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-lg p-6 shadow-xl text-[var(--color-white)] text-center">
        <div className="mx-auto w-12 h-12 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
          <AlertTriangle className="size-6" />
        </div>
        <h3 className="text-base font-bold mb-2">Sesión a punto de expirar</h3>
        <p className="text-xs text-[var(--color-gray-300)] mb-4">
          Por inactividad, tu sesión se cerrará automáticamente en{" "}
          <strong className="text-[var(--color-secondary-400)] font-mono">{remainingSeconds}s</strong>.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
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
            size="sm"
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
