import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import M3Icon from "./M3Icon";
import Button from "./Button";
import Input from "./Input";
import { IconButton } from "./IconButton";
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
      const caps = await getBiometricCapabilities();
      if (caps.isDesktop || !caps.supported || !caps.platformAvailable) {
        cachedOptionsRef.current = null;
        setHasBiometricOption(false);
        setInfoMsg(
          caps.isDesktop
            ? "En este equipo PC confirma la acción con tu contraseña de administrador."
            : "Este dispositivo no admite biometría compatible; confirma con tu contraseña."
        );
        return;
      }

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
        const caps = await getBiometricCapabilities();
        if (!mounted) return;
        if (caps.isDesktop || !caps.supported || !caps.platformAvailable) {
          setHasBiometricOption(false);
          setInfoMsg(
            caps.isDesktop
              ? "En este equipo PC confirma la acción con tu contraseña de administrador."
              : "Este dispositivo no admite biometría compatible; confirma con tu contraseña."
          );
          return;
        }
        const stepUpRes = await getAdminStepUpOptionsApi().catch(() => ({
          hasBiometrics: false,
          options: null,
        }));
        if (!mounted) return;
        const canUseBioHere =
          Boolean(stepUpRes?.hasBiometrics) && Boolean(stepUpRes?.options);
        setHasBiometricOption(canUseBioHere);
        cachedOptionsRef.current = stepUpRes?.options || null;

        if (canUseBioHere && !autoTriggeredRef.current) {
          autoTriggeredRef.current = true;
          setLoadingOptions(false);
          await runBiometricVerification(true);
          return;
        }
        if (!stepUpRes?.hasBiometrics) {
          setInfoMsg(
            "No tienes una huella vinculada en este dispositivo. Confirma con tu contraseña."
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
      className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-[var(--md-sys-color-scrim)] backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stepup-modal-title"
    >
      <div className="dpiero-modal-in w-full max-w-md rounded-[28px] bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] p-6 m3-elevation-3 text-[var(--md-sys-color-on-surface)]">
        <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
              <M3Icon name="admin_panel_settings" filled size={20} />
            </div>
            <div className="min-w-0">
              <h3
                id="stepup-modal-title"
                className="text-2xl leading-8 font-medium text-[var(--md-sys-color-on-surface)]"
              >
                Confirmación de Administrador
              </h3>
              <p className="text-xs leading-4 text-[var(--md-sys-color-on-surface-variant)]">
                {requestState.actionLabel}
              </p>
            </div>
          </div>

          <IconButton
            ariaLabel="Cancelar confirmación"
            variant="standard"
            onClick={handleCloseCancel}
          >
            <M3Icon name="close" size={20} />
          </IconButton>
        </div>

        {loadingOptions && (
          <div className="flex items-center justify-center gap-2 py-4 text-xs text-[var(--md-sys-color-on-surface-variant)]">
            <M3Icon name="progress_activity" size={18} className="animate-spin text-[var(--md-sys-color-primary)]" />
            <span>Preparando verificación de seguridad...</span>
          </div>
        )}

        {!loadingOptions && hasBiometricOption && (
          <div className="mb-4">
            <Button
              type="button"
              variant="filled"
              size="lg"
              leadingIcon={biometricBusy ? "progress_activity" : "fingerprint"}
              onClick={() => runBiometricVerification(false)}
              disabled={biometricBusy || passwordBusy}
              className="w-full"
            >
              {biometricBusy
                ? "Esperando lectura biométrica..."
                : "Confirmar con Huella / Face ID"}
            </Button>

            <div className="flex items-center gap-2 my-3 text-xs text-[var(--md-sys-color-on-surface-variant)]">
              <div className="h-px flex-1 bg-[var(--md-sys-color-outline-variant)]" />
              <span>o confirma con contraseña</span>
              <div className="h-px flex-1 bg-[var(--md-sys-color-outline-variant)]" />
            </div>
          </div>
        )}

        {infoMsg && (
          <div className="mb-3 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] px-4 py-3 text-xs leading-4 text-[var(--md-sys-color-on-surface-variant)]">
            {infoMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-3 rounded-xl bg-[var(--md-sys-color-error-container)] border border-[var(--color-error-border)] px-4 py-3 text-xs leading-4 text-[var(--md-sys-color-on-error-container)] font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Contraseña de Administrador"
            type="password"
            leadingIcon="key"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus={!hasBiometricOption}
            placeholder="••••••••"
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="text"
              size="md"
              onClick={handleCloseCancel}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="filled"
              size="md"
              disabled={passwordBusy || biometricBusy}
            >
              {passwordBusy ? "Validando..." : "Confirmar"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
