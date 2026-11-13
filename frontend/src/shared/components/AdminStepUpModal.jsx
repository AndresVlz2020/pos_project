// frontend/src/shared/components/AdminStepUpModal.jsx
// Modal global de confirmación Step-Up para acciones críticas del Administrador.
// Intenta verificación biométrica primero cuando está disponible y conserva
// respaldo con contraseña para cualquier PC o situación.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Fingerprint, KeyRound, ShieldAlert, X, Loader2 } from "lucide-react";
import { registerAdminStepUpListener } from "@/shared/services/adminStepUpService";
import {
  getBiometricCapabilities,
  getAdminStepUpOptionsApi,
  verifyAdminStepUpWithBiometricsApi,
  verifyAdminStepUpWithPasswordApi,
} from "@/services/biometricService";

export default function AdminStepUpModal() {
  const [requestState, setRequestState] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [hasBiometricOption, setHasBiometricOption] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const autoTriggeredRef = useRef(false);
  const cachedOptionsRef = useRef(null);

  useEffect(() => {
    return registerAdminStepUpListener(({ actionLabel }) => {
      return new Promise((resolve, reject) => {
        setErrorMsg("");
        setInfoMsg("");
        setPassword("");
        setHasBiometricOption(false);
        cachedOptionsRef.current = null;
        autoTriggeredRef.current = false;
        setRequestState({ actionLabel, resolve, reject });
      });
    });
  }, []);

  const handleCloseCancel = () => {
    if (!requestState) return;
    const cancelErr = new Error("Verificación de administrador cancelada.");
    cancelErr.isStepUpCancelled = true;
    requestState.reject(cancelErr);
    setRequestState(null);
  };

  const runBiometricVerification = async (silentOnCancel = false) => {
    if (!requestState || biometricBusy) return;
    setBiometricBusy(true);
    setErrorMsg("");

    try {
      let options = cachedOptionsRef.current;
      if (!options) {
        const res = await getAdminStepUpOptionsApi();
        if (!res?.hasBiometrics || !res?.options) {
          setHasBiometricOption(false);
          setInfoMsg("Tu cuenta o dispositivo usará contraseña de administrador.");
          return;
        }
        options = res.options;
        cachedOptionsRef.current = options;
      }

      const verified = await verifyAdminStepUpWithBiometricsApi(options);
      // Limpiar reto ya consumido para que un reintento futuro genere uno nuevo
      cachedOptionsRef.current = null;

      if (verified?.stepUpToken) {
        requestState.resolve(verified.stepUpToken);
        setRequestState(null);
      }
    } catch (err) {
      cachedOptionsRef.current = null;
      if (err?.isUserCancelled && silentOnCancel) {
        setInfoMsg("Toca el botón de huella para reintentar o ingresa tu contraseña.");
      } else {
        setErrorMsg(err.message || "No se pudo validar la huella.");
      }
    } finally {
      setBiometricBusy(false);
    }
  };

  useEffect(() => {
    if (!requestState) return;

    let mounted = true;
    const prepareModal = async () => {
      setLoadingOptions(true);
      try {
        const [caps, stepUpRes] = await Promise.all([
          getBiometricCapabilities(),
          getAdminStepUpOptionsApi().catch(() => ({ hasBiometrics: false, options: null })),
        ]);

        if (!mounted) return;

        const canUseBioHere =
          caps.supported &&
          caps.platformAvailable &&
          Boolean(stepUpRes?.hasBiometrics) &&
          Boolean(stepUpRes?.options);

        setHasBiometricOption(canUseBioHere);
        cachedOptionsRef.current = stepUpRes?.options || null;

        if (canUseBioHere && !autoTriggeredRef.current) {
          autoTriggeredRef.current = true;
          setLoadingOptions(false);
          // Disparo automático amigable; si el navegador exige gesto usuario, cae sin error rojo
          await runBiometricVerification(true);
          return;
        }

        if (!stepUpRes?.hasBiometrics) {
          setInfoMsg(
            "No tienes una huella vinculada todavía. Confirma con tu contraseña (puedes activar tu huella en el menú de usuario)."
          );
        } else if (!caps.supported || !caps.platformAvailable) {
          setInfoMsg(
            "Este equipo no dispone de lector biométrico compatible; confirma con tu contraseña."
          );
        }
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    };

    prepareModal();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestState]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!requestState || passwordBusy) return;
    if (!password.trim()) {
      setErrorMsg("Ingresa tu contraseña de administrador.");
      return;
    }

    setPasswordBusy(true);
    setErrorMsg("");

    try {
      const verified = await verifyAdminStepUpWithPasswordApi(password);
      if (verified?.stepUpToken) {
        requestState.resolve(verified.stepUpToken);
        setRequestState(null);
      }
    } catch (err) {
      setErrorMsg(err.message || "Contraseña de administrador incorrecta.");
    } finally {
      setPasswordBusy(false);
    }
  };

  if (!requestState) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stepup-modal-title"
    >
      <div className="dpiero-modal-in w-full max-w-md rounded-2xl bg-[var(--color-secondary-900)] border border-[var(--color-secondary-700)] p-5 sm:p-6 shadow-2xl text-[var(--color-white)]">
        <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-[var(--color-secondary-800)]">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[var(--color-primary-500)]/15 border border-[var(--color-primary-500)]/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="size-5 text-[var(--color-primary-400)]" />
            </div>
            <div>
              <h3 id="stepup-modal-title" className="text-base font-bold text-[var(--color-white)]">
                Confirmación de Administrador
              </h3>
              <p className="text-xs text-[var(--color-gray-400)]">
                {requestState.actionLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseCancel}
            aria-label="Cancelar confirmación"
            className="text-[var(--color-gray-400)] hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {loadingOptions && (
          <div className="flex items-center justify-center gap-2 py-4 text-xs text-[var(--color-gray-300)]">
            <Loader2 className="size-4 animate-spin text-[var(--color-primary-400)]" />
            <span>Preparando verificación de seguridad...</span>
          </div>
        )}

        {!loadingOptions && hasBiometricOption && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => runBiometricVerification(false)}
              disabled={biometricBusy || passwordBusy}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {biometricBusy ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Fingerprint className="size-5" />
              )}
              <span>
                {biometricBusy
                  ? "Esperando lectura biométrica..."
                  : "Confirmar con Huella / Face ID"}
              </span>
            </button>

            <div className="flex items-center gap-2 my-3 text-[11px] text-[var(--color-gray-400)]">
              <div className="h-px flex-1 bg-[var(--color-secondary-800)]" />
              <span>o confirma con contraseña</span>
              <div className="h-px flex-1 bg-[var(--color-secondary-800)]" />
            </div>
          </div>
        )}

        {infoMsg && (
          <div className="mb-3 rounded-lg bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] px-3 py-2 text-xs text-[var(--color-gray-300)]">
            {infoMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-3 rounded-lg bg-red-500/15 border border-red-500/40 px-3 py-2 text-xs text-red-200 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1.5">
              Contraseña de Administrador
            </label>
            <div className="relative">
              <KeyRound className="size-4 text-[var(--color-gray-400)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus={!hasBiometricOption}
                placeholder="••••••••"
                className="w-full rounded-xl bg-[var(--color-secondary-950)] border border-[var(--color-secondary-700)] pl-9 pr-3 py-2.5 text-sm text-[var(--color-white)] placeholder:text-[var(--color-gray-500)] focus:outline-none focus:border-[var(--color-primary-500)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleCloseCancel}
              className="px-4 py-2 rounded-xl border border-[var(--color-secondary-700)] text-xs font-semibold text-[var(--color-gray-300)] hover:bg-[var(--color-secondary-800)] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={passwordBusy || biometricBusy}
              className="px-4 py-2 rounded-xl bg-[var(--color-secondary-800)] hover:bg-[var(--color-secondary-700)] border border-[var(--color-secondary-600)] text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-60"
            >
              {passwordBusy ? "Verificando..." : "Confirmar acción"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
