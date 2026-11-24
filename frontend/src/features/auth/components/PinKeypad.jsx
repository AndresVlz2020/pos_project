import { useEffect, useRef, useState } from "react";
import M3Icon from "@/shared/components/M3Icon";
import { StaffAvatar } from "./QuickAccessSelector";
import { formatRole } from "@/utils/avatarHelper";
import {
  getBiometricCapabilities,
  getUserBiometricStatusApi,
} from "@/services/biometricService";

export default function PinKeypad({
  selectedStaff,
  onBack,
  onValidatePin,
  onBiometricLogin,
  pinError,
  lockSeconds = 0,
  onSyncLockSeconds,
  onClearError,
}) {
  const [pinInput, setPinInput] = useState("");
  const [biometricsAvailableHere, setBiometricsAvailableHere] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);
  const [biometricHint, setBiometricHint] = useState("");
  const [localBioError, setLocalBioError] = useState("");
  const autoTriggeredForStaffRef = useRef(null);

  const isLocked = lockSeconds > 0;

  const triggerBiometricAuth = async (silentOnCancel = false) => {
    if (!onBiometricLogin || biometricBusy || !selectedStaff?.id) return;
    setBiometricBusy(true);
    setLocalBioError("");
    setBiometricHint("");

    try {
      const caps = await getBiometricCapabilities();
      if (!caps.supported || !caps.platformAvailable) {
        setBiometricsAvailableHere(false);
        return;
      }
      await onBiometricLogin(selectedStaff);
    } catch (err) {
      if (err?.isUserCancelled && silentOnCancel) {
        setBiometricHint("Toca 'Ingresar con huella' o digita tu PIN.");
      } else {
        setLocalBioError(err.message || "No se pudo validar tu huella.");
      }
    } finally {
      setBiometricBusy(false);
    }
  };

  useEffect(() => {
    if (!selectedStaff?.id) return;
    let active = true;

    const inspectStaffAccess = async () => {
      const [caps, status] = await Promise.all([
        getBiometricCapabilities(),
        getUserBiometricStatusApi(selectedStaff.id).catch(() => ({
          hasBiometrics: false,
          isLocked: false,
          retryAfterSeconds: 0,
        })),
      ]);

      if (!active) return;

      if (status?.isLocked && status?.retryAfterSeconds > 0 && onSyncLockSeconds) {
        onSyncLockSeconds(status.retryAfterSeconds);
      }

      const canUseBio =
        Boolean(status?.hasBiometrics) &&
        Boolean(caps.supported) &&
        Boolean(caps.platformAvailable);

      setBiometricsAvailableHere(canUseBio);

      if (
        canUseBio &&
        !status?.isLocked &&
        autoTriggeredForStaffRef.current !== selectedStaff.id
      ) {
        autoTriggeredForStaffRef.current = selectedStaff.id;
        await triggerBiometricAuth(true);
      }
    };

    inspectStaffAccess();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStaff?.id]);

  const handleNumpadPress = (digit) => {
    if (isLocked || biometricBusy) return;
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      if (onClearError) onClearError();
    }
  };

  const handleNumpadDelete = () => {
    if (isLocked || biometricBusy) return;
    setPinInput((prev) => prev.slice(0, -1));
    if (onClearError) onClearError();
  };

  const handleNumpadClear = () => {
    setPinInput("");
    if (onClearError) onClearError();
  };

  const handleConfirm = () => {
    if (isLocked || biometricBusy) return;
    if (pinInput.length === 4) {
      onValidatePin(pinInput, () => {
        setPinInput("");
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[var(--md-sys-color-outline-variant)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <StaffAvatar staff={selectedStaff} sizeClass="size-10" />
          <div className="min-w-0">
            <p className="text-title-sm font-semibold text-[var(--md-sys-color-on-surface)] leading-tight truncate">
              {selectedStaff.userName || selectedStaff.name}
            </p>
            <p className="text-sm leading-5 text-[var(--md-sys-color-primary)] font-medium truncate">
              {formatRole(selectedStaff.role)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="m3-state inline-flex items-center gap-1 min-h-[40px] px-3 rounded-full text-sm font-medium text-[var(--md-sys-color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer shrink-0"
        >
          <M3Icon name="arrow_back" size={16} />
          <span>Cambiar</span>
        </button>
      </div>

      {/* Alerta de bloqueo temporal */}
      {isLocked && (
        <div className="rounded-2xl bg-[var(--md-sys-color-error-container)] border border-[var(--md-sys-color-error)]/40 px-4 py-2.5 flex items-center gap-2.5 text-sm text-[var(--md-sys-color-on-error-container)]">
          <M3Icon name="warning" size={20} className="shrink-0" />
          <span>
            PIN bloqueado temporalmente por intentos fallidos. Intenta de nuevo en{" "}
            <strong className="font-mono">{lockSeconds}s</strong>.
          </span>
        </div>
      )}

      <div className="py-0.5 text-center">
        <p className="text-sm leading-5 text-[var(--md-sys-color-on-surface-variant)] mb-2">
          Ingresa tu PIN de 4 dígitos
        </p>
        <div className="flex items-center justify-center gap-3.5">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pinInput.length > index;
            return (
              <div
                key={index}
                className={`size-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? "bg-[var(--md-sys-color-primary)] scale-110"
                    : "border-2 border-[var(--md-sys-color-outline)] bg-transparent"
                }`}
              />
            );
          })}
        </div>

        {pinError && !isLocked && (
          <p className="text-sm text-[var(--md-sys-color-error)] mt-2 font-medium">
            {pinError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-[264px] mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            disabled={isLocked || biometricBusy}
            onClick={() => handleNumpadPress(num.toString())}
            className="m3-state bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] text-title-lg font-semibold rounded-full h-12 transition-colors flex items-center justify-center cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] disabled:opacity-38 disabled:cursor-not-allowed"
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          disabled={isLocked || biometricBusy}
          onClick={handleNumpadDelete}
          aria-label="Borrar dígito"
          className="m3-state bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] rounded-full h-12 transition-colors flex items-center justify-center cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] disabled:opacity-38 disabled:cursor-not-allowed"
        >
          <M3Icon name="backspace" size={20} />
        </button>

        <button
          type="button"
          disabled={isLocked || biometricBusy}
          onClick={() => handleNumpadPress("0")}
          className="m3-state bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] text-title-lg font-semibold rounded-full h-12 transition-colors flex items-center justify-center cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] disabled:opacity-38 disabled:cursor-not-allowed"
        >
          0
        </button>

        <button
          type="button"
          disabled={isLocked || biometricBusy || pinInput.length < 4}
          onClick={handleConfirm}
          aria-label="Confirmar PIN"
          className="m3-state bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full h-12 transition-colors flex items-center justify-center cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] disabled:opacity-38 disabled:cursor-not-allowed"
        >
          <M3Icon name="check" size={22} />
        </button>
      </div>

      {/* Acceso biométrico para trabajadores que tienen huella configurada */}
      {biometricsAvailableHere && (
        <div className="max-w-[264px] mx-auto space-y-1.5 pt-0.5">
          <button
            type="button"
            disabled={biometricBusy}
            onClick={() => triggerBiometricAuth(false)}
            className="m3-state w-full min-h-[44px] flex items-center justify-center gap-2 py-2 px-5 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-label-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] transition-colors cursor-pointer disabled:opacity-38"
          >
            {biometricBusy ? (
              <M3Icon name="progress_activity" size={18} className="animate-spin" />
            ) : (
              <M3Icon name="fingerprint" size={20} />
            )}
            <span>
              {biometricBusy ? "Verificando huella..." : "Ingresar con Huella / Face ID"}
            </span>
          </button>

          {biometricHint && (
            <p className="text-sm text-center text-[var(--md-sys-color-on-surface-variant)]">
              {biometricHint}
            </p>
          )}
          {localBioError && (
            <p className="text-sm text-center text-[var(--md-sys-color-error)]">
              {localBioError}
            </p>
          )}
        </div>
      )}

      <div className="text-center">
        <button
          type="button"
          onClick={handleNumpadClear}
          className="m3-state min-h-[40px] px-4 rounded-full text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
