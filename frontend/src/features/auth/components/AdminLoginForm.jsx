import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { loginSchema } from "@/features/users/schemas/userSchema";
import Button from "@/shared/components/Button";
import M3Icon from "@/shared/components/M3Icon";
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
  const [showPassword, setShowPassword] = useState(false);
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
      const caps = await getBiometricCapabilities();
      if (!caps.supported || !caps.platformAvailable) {
        setBiometricsReadyHere(false);
        return;
      }
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
      <form onSubmit={handleValidateEmail} className="space-y-3.5">
        <div className="text-center mb-3">
          <h2 className="text-title-md font-semibold text-[var(--md-sys-color-on-surface)]">
            Acceso Administrativo
          </h2>
          <p className="text-sm leading-5 text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            Paso 1: Ingresa tu correo para verificar tu cuenta y método de acceso.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="admin-email-step1"
            className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]"
          >
            Correo Electrónico
          </label>
          <div className={`m3-outlined-field relative flex items-center rounded-[4px] bg-transparent ${errors.userEmail ? "is-invalid" : ""}`}>
            <M3Icon name="mail" size={20} className="ml-3.5 text-[var(--md-sys-color-on-surface-variant)] shrink-0" />
            <input
              id="admin-email-step1"
              type="email"
              name="userEmail"
              value={form.userEmail}
              onChange={handleChange}
              placeholder="admin@dpiero.com"
              autoFocus
              className="w-full h-14 px-3 bg-transparent text-[var(--md-sys-color-on-surface)] text-body-lg outline-none placeholder:text-[var(--md-sys-color-on-surface-variant)]"
            />
          </div>
          {errors.userEmail && (
            <p className="text-sm text-[var(--md-sys-color-error)] mt-0.5">{errors.userEmail}</p>
          )}
        </div>

        <div className="flex items-center justify-center pt-0.5">
          <Link
            to="/Auth/forgot-password"
            className="m3-state inline-flex items-center min-h-[40px] px-4 rounded-full text-base leading-6 font-medium text-[var(--md-sys-color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
          >
            ¿Olvidó su contraseña?
          </Link>
        </div>

        <div className="pt-0.5">
          <Button
            type="submit"
            variant="filled"
            size="md"
            leadingIcon={checkingEmail ? undefined : "arrow_forward"}
            disabled={checkingEmail}
            className="w-full"
          >
            {checkingEmail && (
              <M3Icon name="progress_activity" size={18} className="animate-spin" />
            )}
            <span>{checkingEmail ? "Validando correo..." : "Validar correo y continuar"}</span>
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmitCredentials} className="space-y-3.5">
      <div className="text-center mb-2">
        <h2 className="text-title-md font-semibold text-[var(--md-sys-color-on-surface)]">
          Acceso Administrativo
        </h2>
        <p className="text-sm leading-5 text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
          Paso 2: Confirma tu identidad para ingresar.
        </p>
      </div>

      {/* Resumen de correo validado */}
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] px-4 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <M3Icon name="check_circle" filled size={20} className="text-[var(--md-sys-color-primary)] shrink-0" />
          <div className="min-w-0">
            <p className="text-title-sm font-semibold text-[var(--md-sys-color-on-surface)] truncate">
              {validatedAccount?.name || "Administrador"}
            </p>
            <p className="text-sm leading-5 text-[var(--md-sys-color-on-surface-variant)] truncate">
              {validatedAccount?.email || form.userEmail}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleChangeEmail}
          className="m3-state inline-flex items-center gap-1 min-h-[40px] px-3 rounded-full text-sm font-medium text-[var(--md-sys-color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer shrink-0"
        >
          <M3Icon name="arrow_back" size={16} />
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
            className="m3-state w-full min-h-[44px] flex items-center justify-center gap-2.5 py-2.5 px-6 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-medium text-label-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] transition-colors cursor-pointer disabled:opacity-38"
          >
            {biometricBusy ? (
              <M3Icon name="progress_activity" size={18} className="animate-spin" />
            ) : (
              <M3Icon name="fingerprint" size={20} />
            )}
            <span>
              {biometricBusy
                ? "Verificando huella..."
                : "Ingresar con Huella / Face ID"}
            </span>
          </button>

          {biometricHint && (
            <p className="text-sm leading-5 text-center text-[var(--md-sys-color-on-surface-variant)]">
              {biometricHint}
            </p>
          )}
          {errors.biometric && (
            <p className="text-sm text-center text-[var(--md-sys-color-error)]">
              {errors.biometric}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
            <div className="h-px flex-1 bg-[var(--md-sys-color-outline-variant)]" />
            <span>o ingresa con contraseña</span>
            <div className="h-px flex-1 bg-[var(--md-sys-color-outline-variant)]" />
          </div>
        </div>
      )}

      {validatedAccount?.hasBiometrics && !biometricsReadyHere && (
        <p className="text-sm leading-5 text-center text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-xl px-3.5 py-2">
          Este dispositivo no tiene biometría configurada en este navegador; ingresa con tu contraseña.
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="admin-password-step2"
          className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]"
        >
          Contraseña
        </label>
        <div className={`m3-outlined-field relative flex items-center rounded-[4px] bg-transparent ${errors.userPassword ? "is-invalid" : ""}`}>
          <M3Icon name="lock" size={20} className="ml-3.5 text-[var(--md-sys-color-on-surface-variant)] shrink-0" />
          <input
            id="admin-password-step2"
            type={showPassword ? "text" : "password"}
            name="userPassword"
            value={form.userPassword}
            onChange={handleChange}
            placeholder="••••••••"
            autoFocus={!biometricsReadyHere}
            className="w-full h-14 pl-3 pr-12 bg-transparent text-[var(--md-sys-color-on-surface)] text-body-lg outline-none placeholder:text-[var(--md-sys-color-on-surface-variant)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="m3-state absolute right-1.5 flex items-center justify-center size-10 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer"
          >
            <M3Icon name={showPassword ? "visibility_off" : "visibility"} size={20} />
          </button>
        </div>
        {errors.userPassword && (
          <p className="text-sm text-[var(--md-sys-color-error)] mt-0.5">{errors.userPassword}</p>
        )}
      </div>

      <div className="flex items-center justify-center pt-0.5">
        <Link
          to="/Auth/forgot-password"
          className="m3-state inline-flex items-center min-h-[40px] px-4 rounded-full text-base leading-6 font-medium text-[var(--md-sys-color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
        >
          ¿Olvidó su contraseña?
        </Link>
      </div>

      <div className="pt-0.5">
        <Button
          type="submit"
          variant="filled"
          size="md"
          leadingIcon="check_circle"
          disabled={biometricBusy}
          className="w-full"
        >
          Ingresar al Panel Administrativo
        </Button>
      </div>
    </form>
  );
}
