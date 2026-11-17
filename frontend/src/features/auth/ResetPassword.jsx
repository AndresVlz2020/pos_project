import { useState } from "react";
import { Input, Button, Alert, BrandLogo, M3Icon } from "@/shared";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordApi, forgotPasswordApi } from "@/services/authService";
import { showSuccessAlert, showErrorAlert } from "@/shared/services/alertService";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [form, setForm] = useState({
    email: initialEmail,
    code: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const validate = () => {
    const errs = {};

    if (!form.email || !form.email.trim()) {
      errs.email = "El correo electrónico es requerido";
    }

    const cleanCode = form.code.trim();
    if (!cleanCode) {
      errs.code = "Ingresa el código de 6 dígitos que llegó a tu correo";
    } else if (!/^\d{6}$/.test(cleanCode)) {
      errs.code = "El código debe contener exactamente 6 números";
    }

    if (!form.password) {
      errs.password = "La nueva contraseña es requerida";
    } else if (form.password.length < 10) {
      errs.password = "Debe tener al menos 10 caracteres";
    } else if (!/[A-Z]/.test(form.password)) {
      errs.password = "Debe incluir al menos una letra mayúscula";
    } else if (!/[a-z]/.test(form.password)) {
      errs.password = "Debe incluir al menos una letra minúscula";
    } else if (!/[0-9]/.test(form.password)) {
      errs.password = "Debe incluir al menos un número";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
      errs.password = "Debe incluir al menos un símbolo especial (!@#$...)";
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = "Confirma tu nueva contraseña";
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleResendCode = async () => {
    if (!form.email || !form.email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Ingresa tu correo para reenviar el código" }));
      return;
    }

    setIsResending(true);
    setResendMessage("");
    try {
      await forgotPasswordApi(form.email.trim().toLowerCase());
      setResendMessage("¡Nuevo código de 6 dígitos enviado! Revisa tu bandeja de entrada.");
    } catch (err) {
      setResendMessage("");
      await showErrorAlert({
        title: "Error al reenviar",
        text: err.message || "No se pudo reenviar el código."
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await resetPasswordApi({
        email: form.email.trim().toLowerCase(),
        code: form.code.trim(),
        newPassword: form.password,
      });

      await showSuccessAlert({
        title: "¡Contraseña Actualizada!",
        text: "Tu nueva clave de acceso ha sido guardada en la base de datos. Ya puedes iniciar sesión.",
      });

      navigate("/Auth");
    } catch (err) {
      await showErrorAlert({
        title: "Código o Datos Inválidos",
        text: err.message || "El código de verificación no coincide o ha expirado.",
      });
      setErrors((prev) => ({
        ...prev,
        code: err.message || "Código inválido o expirado",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center px-4 py-8 font-[family-name:var(--main-font)]">
      <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-[28px] p-6 sm:p-8 m3-elevation-2 text-[var(--md-sys-color-on-surface)] relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo className="h-10 w-auto object-contain mb-3" alt="D,PIERO" />
          <div className="flex items-center gap-2 justify-center mb-1">
            <M3Icon name="verified_user" size={22} className="text-[var(--md-sys-color-primary)]" />
            <h2 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
              Verificación de Código
            </h2>
          </div>
          <p className="text-body-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Revisa tu correo electrónico e ingresa el código de 6 dígitos junto con tu nueva contraseña.
          </p>
        </div>

        {resendMessage && (
          <div className="mb-4">
            <Alert type="success" title="Código Reenviado" message={resendMessage} autoClose={true} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Correo Electrónico"
            name="email"
            type="email"
            leadingIcon="mail"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            placeholder="correo@ejemplo.com"
            htmlFor="reset-email"
            error={errors.email}
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reset-code"
              className="text-label-md font-medium text-[var(--md-sys-color-on-surface-variant)]"
            >
              Código de Seguridad (6 dígitos del correo)
            </label>
            <div className={`m3-outlined-field relative flex items-center rounded-[4px] bg-transparent ${errors.code ? "is-invalid" : ""}`}>
              <M3Icon name="key" size={20} className="ml-3.5 text-[var(--md-sys-color-primary)] shrink-0" />
              <input
                id="reset-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={form.code}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setForm({ ...form, code: val });
                  if (errors.code) setErrors((prev) => ({ ...prev, code: "" }));
                }}
                placeholder="123456"
                className="w-full h-14 px-3 bg-transparent text-[var(--md-sys-color-primary)] font-mono text-title-md font-bold tracking-[0.3em] outline-none placeholder:text-[var(--md-sys-color-on-surface-variant)] placeholder:tracking-normal placeholder:font-sans"
              />
            </div>
            {errors.code && (
              <p className="text-label-sm text-[var(--md-sys-color-error)] mt-0.5">{errors.code}</p>
            )}
          </div>

          <Input
            label="Nueva Contraseña"
            name="password"
            type="password"
            leadingIcon="lock"
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
            }}
            placeholder="Mínimo 10 caracteres seguros"
            htmlFor="reset-password"
            error={errors.password}
          />

          <Input
            label="Confirmar Contraseña"
            name="confirmPassword"
            type="password"
            leadingIcon="lock"
            value={form.confirmPassword}
            onChange={(e) => {
              setForm({ ...form, confirmPassword: e.target.value });
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            placeholder="Repite la contraseña"
            htmlFor="reset-confirm-password"
            error={errors.confirmPassword}
          />

          <Button
            variant="filled"
            size="md"
            type="submit"
            leadingIcon="check_circle"
            disabled={isSubmitting}
            className="w-full mt-2"
          >
            {isSubmitting ? "Verificando y Guardando..." : "Validar Código y Guardar Contraseña"}
          </Button>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-label-lg">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="m3-state min-h-[40px] px-3 rounded-full text-[var(--md-sys-color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer disabled:opacity-38"
            >
              {isResending ? "Reenviando..." : "¿No recibiste el código? Reenviar"}
            </button>

            <Link
              to="/Auth"
              className="m3-state inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] transition-colors"
            >
              <M3Icon name="arrow_back" size={18} />
              Volver al Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
