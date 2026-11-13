import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Fingerprint, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { loginSchema } from "@/features/users/schemas/userSchema";
import { Button } from "@/shared";
import {
  checkAdminEmailApi,
  getBiometricCapabilities,
} from "@/services/biometricService";

export default function AdminLoginForm({ onSubmit, onBiometricLogin }) {
  const [step, setStep] = useState("email");
  const [form, setForm] = useState({
    userEmail: "",
    userPassword: "",
  });
  const [validatedAccount, setValidatedAccount] = useState(null);
  const [biometricsReadyHere, setBiometricsReadyHere] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);
  const [biometricHint, setBiometricHint] = useState("");
  const [errors, setErrors] = useState({});
  const autoTriggeredRef = useRef(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const triggerBiometricAttempt = async (email, silentOnCancel = false) => {
    if (!onBiometricLogin || biometricBusy) return;
    setBiometricBusy(true);
    setBiometricHint("");

    try {
      await onBiometricLogin(email);
    } catch (err) {
      if (err?.isUserCancelled && silentOnCancel) {
        setBiometricHint("Toca 'Ingresar con huella' o escribe tu contraseña.");
      } else {
        setErrors((prev) => ({
          ...prev,
          biometric: err.message || "No se pudo validar tu huella.",
        }));
      }
    } finally {
      setBiometricBusy(false);
    }
  };

  useEffect(() => {
    if (
      step === "credentials" &&
      biometricsReadyHere &&
      validatedAccount?.email &&
      !autoTriggeredRef.current
    ) {
      autoTriggeredRef.current = true;
      triggerBiometricAttempt(validatedAccount.email, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, biometricsReadyHere, validatedAccount?.email]);

  const handleValidateEmail = async (e) => {
    e.preventDefault();
    const cleanEmail = form.userEmail.trim().toLowerCase();
    const emailValidation = loginSchema.shape.userEmail.safeParse(cleanEmail);
    if (!emailValidation.success) {
      setErrors({ userEmail: emailValidation.error.issues[0]?.message || "Correo inválido" });
      return;
    }

    setCheckingEmail(true);
    setErrors({});
    setBiometricHint("");
    autoTriggeredRef.current = false;

    try {
      const [emailStatus, caps] = await Promise.all([
        checkAdminEmailApi(cleanEmail),
        getBiometricCapabilities(),
      ]);

      if (!emailStatus?.valid) {
        setErrors({
          userEmail: emailStatus?.message || "No existe una cuenta activa con ese correo.",
        });
        return;
      }

      const canUseBioHere =
        Boolean(emailStatus.hasBiometrics) &&
        Boolean(caps.supported) &&
        Boolean(caps.platformAvailable);

      setValidatedAccount(emailStatus);
      setBiometricsReadyHere(canUseBioHere);
      setForm((prev) => ({ ...prev, userEmail: emailStatus.email || cleanEmail }));
      setStep("credentials");
    } catch (err) {
      setErrors({
        userEmail: err.message || "No se pudo validar el correo en el servidor.",
      });
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleChangeEmail = () => {
    setStep("email");
    setValidatedAccount(null);
    setBiometricsReadyHere(false);
    setBiometricHint("");
    setErrors({});
    setForm((prev) => ({ ...prev, userPassword: "" }));
    autoTriggeredRef.current = false;
  };

  const handleSubmitCredentials = async (e) => {
    e.preventDefault();
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const submitResult = await onSubmit(form);
    if (submitResult?.errors) {
      setErrors(submitResult.errors);
    }
  };

  if (step === "email") {
    return (
      <form onSubmit={handleValidateEmail} className="space-y-4">
        <div className="text-center mb-5">
          <h2 className="text-base font-bold text-[var(--color-white)]">Acceso Administrativo</h2>
          <p className="text-xs text-[var(--color-gray-400)] mt-0.5">
            Paso 1: Ingresa tu correo para verificar tu cuenta y método de acceso.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1.5">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)]" />
            <input
              type="email"
              name="userEmail"
              value={form.userEmail}
              onChange={handleChange}
              placeholder="admin@dpiero.com"
              autoFocus
              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[var(--color-secondary-950)] text-[var(--color-white)] text-xs border border-[var(--color-secondary-800)] focus:border-[var(--color-primary-500)] outline-none placeholder:text-[var(--color-gray-500)] transition-colors"
            />
          </div>
          {errors.userEmail && (
            <p className="text-[11px] text-[var(--color-error)] mt-1">{errors.userEmail}</p>
          )}
        </div>

        <div className="flex items-center justify-center text-xs pt-1">
          <Link
            to="/Auth/forgot-password"
            className="text-[var(--color-primary-400)] hover:underline"
          >
            ¿Olvidó su contraseña?
          </Link>
        </div>

        <div className="pt-1">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={checkingEmail}
            className="w-full text-xs font-bold py-2.5 flex items-center justify-center gap-2"
          >
            {checkingEmail && <Loader2 className="size-4 animate-spin" />}
            <span>{checkingEmail ? "Validando correo..." : "Validar correo y continuar"}</span>
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmitCredentials} className="space-y-4">
      <div className="text-center mb-3">
        <h2 className="text-base font-bold text-[var(--color-white)]">Acceso Administrativo</h2>
        <p className="text-xs text-[var(--color-gray-400)] mt-0.5">
          Paso 2: Confirma tu identidad para ingresar.
        </p>
      </div>

      {/* Resumen de correo validado */}
      <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] px-3.5 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {validatedAccount?.name || "Administrador"}
            </p>
            <p className="text-[11px] text-[var(--color-gray-400)] truncate">
              {validatedAccount?.email || form.userEmail}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleChangeEmail}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-primary-400)] hover:underline cursor-pointer shrink-0"
        >
          <ArrowLeft className="size-3" />
          <span>Cambiar</span>
        </button>
      </div>

      {/* Opción biométrica automática/manual si cuenta y equipo son compatibles */}
      {biometricsReadyHere && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => triggerBiometricAttempt(validatedAccount.email, false)}
            disabled={biometricBusy}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-[var(--color-primary-500)]/15 hover:bg-[var(--color-primary-500)]/25 border border-[var(--color-primary-500)]/50 text-[var(--color-primary-300)] font-semibold text-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {biometricBusy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Fingerprint className="size-4" />
            )}
            <span>
              {biometricBusy
                ? "Verificando huella..."
                : "Ingresar con Huella / Face ID"}
            </span>
          </button>

          {biometricHint && (
            <p className="text-[11px] text-center text-[var(--color-gray-400)]">
              {biometricHint}
            </p>
          )}
          {errors.biometric && (
            <p className="text-[11px] text-center text-[var(--color-error)]">
              {errors.biometric}
            </p>
          )}

          <div className="flex items-center gap-2 text-[11px] text-[var(--color-gray-500)]">
            <div className="h-px flex-1 bg-[var(--color-secondary-800)]" />
            <span>o ingresa con contraseña</span>
            <div className="h-px flex-1 bg-[var(--color-secondary-800)]" />
          </div>
        </div>
      )}

      {validatedAccount?.hasBiometrics && !biometricsReadyHere && (
        <p className="text-[11px] text-center text-[var(--color-gray-400)] bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] rounded-lg px-3 py-1.5">
          Este equipo no dispone de lector biométrico; ingresa con tu contraseña.
        </p>
      )}

      <div>
        <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1.5">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)]" />
          <input
            type="password"
            name="userPassword"
            value={form.userPassword}
            onChange={handleChange}
            placeholder="••••••••"
            autoFocus={!biometricsReadyHere}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[var(--color-secondary-950)] text-[var(--color-white)] text-xs border border-[var(--color-secondary-800)] focus:border-[var(--color-primary-500)] outline-none placeholder:text-[var(--color-gray-500)] transition-colors"
          />
        </div>
        {errors.userPassword && (
          <p className="text-[11px] text-[var(--color-error)] mt-1">{errors.userPassword}</p>
        )}
      </div>

      <div className="flex items-center justify-center text-xs pt-1">
        <Link
          to="/Auth/forgot-password"
          className="text-[var(--color-primary-400)] hover:underline"
        >
          ¿Olvidó su contraseña?
        </Link>
      </div>

      <div className="pt-1">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={biometricBusy}
          className="w-full text-xs font-bold py-2.5"
        >
          Ingresar al Panel Administrativo
        </Button>
      </div>
    </form>
  );
}
