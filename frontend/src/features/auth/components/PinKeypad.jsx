import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Delete, Check, Fingerprint, Loader2, ShieldAlert } from "lucide-react";
import { formatRole, StaffAvatar } from "./QuickAccessSelector";
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
      if (caps.isDesktop || !caps.supported || !caps.platformAvailable) {
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
        !caps.isDesktop &&
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--color-secondary-800)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <StaffAvatar staff={selectedStaff} sizeClass="size-10" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--color-white)] leading-tight truncate">
              {selectedStaff.userName || selectedStaff.name}
            </p>
            <p className="text-xs text-[var(--color-primary-400)] font-medium mt-0.5 truncate">
              {formatRole(selectedStaff.role)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 min-h-[40px] px-3 rounded-full text-sm font-medium text-[var(--color-primary-400)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 cursor-pointer shrink-0"
        >
          <ArrowLeft className="size-3.5" />
          <span>Cambiar</span>
        </button>
      </div>

      {/* Alerta de bloqueo temporal de 60 segundos por 5 intentos fallidos */}
      {isLocked && (
        <div className="rounded-xl bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-[var(--color-white)]">
          <ShieldAlert className="size-4 text-[var(--color-warning)] shrink-0" />
          <span>
            PIN bloqueado temporalmente por intentos fallidos. Intenta de nuevo en{" "}
            <strong className="font-mono text-[var(--color-warning)]">{lockSeconds}s</strong>.
          </span>
        </div>
      )}

      <div className="py-1 text-center">
        <p className="text-xs text-[var(--color-gray-400)] mb-2">Ingresa tu PIN de 4 dígitos</p>
        <div className="flex items-center justify-center gap-3">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pinInput.length > index;
            return (
              <div
                key={index}
                className={`size-3.5 rounded-full transition-all duration-150 ${
                  isFilled
                    ? "bg-[var(--color-primary-500)] scale-110"
                    : "border-2 border-[var(--color-secondary-700)] bg-[var(--color-secondary-950)]"
                }`}
              />
            );
          })}
        </div>

        {pinError && !isLocked && (
          <p className="text-xs text-[var(--color-error)] mt-2 font-medium">
            {pinError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            disabled={isLocked || biometricBusy}
            onClick={() => handleNumpadPress(num.toString())}
            className="bg-[var(--color-secondary-800)] hover:bg-[var(--color-secondary-700)] border border-[var(--color-secondary-700)] text-[var(--color-white)] text-2xl font-bold rounded-full h-14 transition-colors flex items-center justify-center cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          disabled={isLocked || biometricBusy}
          onClick={handleNumpadDelete}
          aria-label="Borrar dígito"
          className="bg-[var(--color-secondary-800)] hover:bg-[var(--color-secondary-700)] border border-[var(--color-secondary-700)] text-[var(--color-gray-300)] hover:text-[var(--color-white)] text-2xl font-bold rounded-full h-14 transition-colors flex items-center justify-center cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Delete className="size-5" />
        </button>

        <button
          type="button"
          disabled={isLocked || biometricBusy}
          onClick={() => handleNumpadPress("0")}
          className="bg-[var(--color-secondary-800)] hover:bg-[var(--color-secondary-700)] border border-[var(--color-secondary-700)] text-[var(--color-white)] text-2xl font-bold rounded-full h-14 transition-colors flex items-center justify-center cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          0
        </button>

        <button
          type="button"
          disabled={isLocked || biometricBusy || pinInput.length < 4}
          onClick={handleConfirm}
          aria-label="Confirmar PIN"
          className="bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-[var(--color-on-primary)] text-2xl font-bold rounded-full h-14 transition-colors flex items-center justify-center cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="size-6" />
        </button>
      </div>

      {/* Acceso biométrico para trabajadores que tienen huella configurada */}
      {biometricsAvailableHere && (
        <div className="max-w-[280px] mx-auto space-y-1.5 pt-1">
          <button
            type="button"
            disabled={biometricBusy}
            onClick={() => triggerBiometricAuth(false)}
            className="w-full min-h-[48px] flex items-center justify-center gap-2 py-2.5 px-6 rounded-full bg-[var(--color-primary-500)]/15 hover:bg-[var(--color-primary-500)]/25 border border-[var(--color-primary-500)]/50 text-[var(--color-primary-400)] text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 transition-colors cursor-pointer disabled:opacity-60"
          >
            {biometricBusy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Fingerprint className="size-4" />
            )}
            <span>
              {biometricBusy ? "Verificando huella..." : "Ingresar con Huella / Face ID"}
            </span>
          </button>

          {biometricHint && (
            <p className="text-xs text-center text-[var(--color-gray-400)]">
              {biometricHint}
            </p>
          )}
          {localBioError && (
            <p className="text-xs text-center text-[var(--color-error)]">
              {localBioError}
            </p>
          )}
        </div>
      )}

      <div className="text-center pt-0.5">
        <button
          type="button"
          onClick={handleNumpadClear}
          className="min-h-[40px] px-4 rounded-full text-sm font-medium text-[var(--color-gray-400)] hover:text-[var(--color-white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 cursor-pointer"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
