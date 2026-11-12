import { useState } from "react";
import { Input, Button, Alert, BrandLogo } from "@/shared";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordApi, forgotPasswordApi } from "@/services/authService";
import { showSuccessAlert, showErrorAlert } from "@/shared/services/alertService";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-2xl p-8 shadow-2xl text-[var(--color-white)] relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo className="h-10 w-auto object-contain mb-3" alt="D,PIERO" />
          <div className="flex items-center gap-2 justify-center mb-1">
            <ShieldCheck className="size-5 text-[var(--color-primary-400)]" />
            <h2 className="text-xl font-bold text-[var(--color-white)]">Verificación de Código</h2>
          </div>
          <p className="text-xs text-[var(--color-gray-400)] mt-1">
            Revisa tu correo electrónico e ingresa el código de 6 dígitos junto con tu nueva contraseña.
          </p>
        </div>

        {resendMessage && (
          <div className="mb-4">
            <Alert type="success" title="Código Reenviado" message={resendMessage} autoClose={true} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)]" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="correo@ejemplo.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[var(--color-secondary-950)] text-[var(--color-white)] text-xs border border-[var(--color-secondary-800)] focus:border-[var(--color-primary-500)] outline-none placeholder:text-[var(--color-gray-500)]"
              />
            </div>
            {errors.email && <p className="text-[11px] text-[var(--color-error)] mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1.5">
              Código de Seguridad (6 dígitos del correo)
            </label>
            <div className="relative">
              <KeyRound className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-primary-400)]" />
              <input
                type="text"
                maxLength={6}
                value={form.code}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setForm({ ...form, code: val });
                  if (errors.code) setErrors((prev) => ({ ...prev, code: "" }));
                }}
                placeholder="123456"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[var(--color-secondary-950)] text-[var(--color-primary-400)] font-mono text-base font-bold tracking-[0.3em] border border-[var(--color-secondary-800)] focus:border-[var(--color-primary-500)] outline-none placeholder:text-[var(--color-gray-600)] placeholder:tracking-normal placeholder:font-sans"
              />
            </div>
            {errors.code && <p className="text-[11px] text-[var(--color-error)] mt-1">{errors.code}</p>}
          </div>

          <div>
            <Input
              label="Nueva Contraseña"
              name="password"
              type="password"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
              }}
              placeholder="Mínimo 10 caracteres seguros"
              htmlFor="reset-password"
              error={errors.password}
            />
          </div>

          <div>
            <Input
              label="Confirmar Contraseña"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => {
                setForm({ ...form, confirmPassword: e.target.value });
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }}
              placeholder="Repite la contraseña"
              htmlFor="reset-confirm-password"
              error={errors.confirmPassword}
            />
          </div>

          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2"
          >
            {isSubmitting ? "Verificando y Guardando..." : "Validar Código y Guardar Contraseña"}
          </Button>

          <div className="flex items-center justify-between pt-2 text-xs">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-[var(--color-primary-400)] hover:underline cursor-pointer disabled:opacity-50"
            >
              {isResending ? "Reenviando..." : "¿No recibiste el código? Reenviar"}
            </button>

            <Link
              to="/Auth"
              className="text-[var(--color-gray-400)] hover:text-[var(--color-white)] transition-colors"
            >
              Volver al Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
