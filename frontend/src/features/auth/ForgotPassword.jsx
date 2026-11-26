import { useEffect, useState } from "react";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import Alert from "@/shared/components/Alert";
import BrandLogo from "@/shared/components/BrandLogo";
import M3Icon from "@/shared/components/M3Icon";
import { Link } from "react-router-dom";
import { forgotPasswordApi } from "@/services/authService";
import { getPublicSettingsApi } from "@/services/settingsService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [supportEmail, setSupportEmail] = useState("soporte@dpiero.com");

  useEffect(() => {
    let active = true;
    getPublicSettingsApi()
      .then((res) => {
        if (active && res?.supportEmail) setSupportEmail(res.supportEmail);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("El correo electrónico es requerido");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Ingrese un formato de correo válido");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await forgotPasswordApi(email.trim().toLowerCase());
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || "Error al procesar la solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center py-2 sm:py-4 font-[family-name:var(--main-font)]">
      {/* Container M3 */}
      <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-[28px] p-5 sm:p-8 m3-elevation-2 text-[var(--md-sys-color-on-surface)] relative z-10">
        <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
          <BrandLogo className="h-9 sm:h-10 w-auto object-contain mb-3" alt="D,PIERO" />
          <h2 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
            Recuperar Contraseña
          </h2>
          <p className="text-body-md text-[var(--md-sys-color-on-surface-variant)] mt-1.5">
            Ingresa tu correo registrado para recibir un código de seguridad de 6 dígitos.
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-4">
            <Alert
              type="success"
              title="¡Código de 6 Dígitos Enviado!"
              message={`Hemos enviado un código de verificación a ${email}. Abre tu bandeja de entrada de correo y cópialo para continuar.`}
              autoClose={false}
            />

            <Link to={`/Auth/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`} className="block">
              <Button variant="filled" size="lg" trailingIcon="arrow_forward" className="w-full">
                Ingresar código de 6 dígitos
              </Button>
            </Link>

            <div className="text-center pt-1">
              <Link
                to="/Auth"
                className="m3-state inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-full text-label-lg font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] transition-colors"
              >
                <M3Icon name="arrow_back" size={18} />
                Volver al Inicio de Sesión
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo Electrónico"
              name="email"
              type="email"
              leadingIcon="mail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder="correo@ejemplo.com"
              htmlFor="forgot-email"
              error={error}
            />

            <Button
              variant="filled"
              size="lg"
              type="submit"
              leadingIcon="mail"
              disabled={isLoading}
              className="w-full mt-2 !whitespace-normal text-center"
            >
              {isLoading ? "Enviando código..." : "Enviar código de seguridad"}
            </Button>

            <div className="text-center pt-1">
              <Link
                to="/Auth"
                className="m3-state inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-full text-label-lg font-medium text-[var(--md-sys-color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
              >
                <M3Icon name="arrow_back" size={18} />
                Volver a Iniciar Sesión
              </Link>
            </div>
          </form>
        )}
        <div className="mt-5 pt-4 border-t border-[var(--md-sys-color-outline-variant)]/70 flex flex-col items-center justify-center gap-1 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
          <span className="inline-flex items-center gap-1">
            <M3Icon name="support_agent" size={16} className="text-[var(--md-sys-color-primary)] shrink-0" />
            <span>Soporte técnico:</span>
          </span>
          <a
            href={`mailto:${supportEmail}`}
            className="font-semibold text-[var(--md-sys-color-primary)] hover:underline break-all"
          >
            {supportEmail}
          </a>
        </div>
      </div>
    </div>
  );
}
