import { useState } from "react";
import { Input, Button, Alert, BrandLogo } from "@/shared";
import { Link } from "react-router-dom";
import { forgotPasswordApi } from "@/services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

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
      const data = await forgotPasswordApi(email.trim().toLowerCase());
      setResetToken(data.resetToken || "");
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || "Error al procesar la solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8">
      {/* Container */}
      <div className="w-full max-w-md bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-lg p-8 shadow-lg text-[var(--color-white)] relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo className="h-10 w-auto object-contain mb-3" alt="D,PIERO" />
          <h2 className="text-xl font-bold text-[var(--color-white)]">Recuperar Contraseña</h2>
          <p className="text-xs text-[var(--color-gray-400)] mt-1">
            Ingresa tu correo registrado para restablecer tu clave de acceso en el sistema.
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-4">
            <Alert
              type="success"
              title="¡Correo Enviado Exitosamente!"
              message={`Hemos enviado un correo a ${email} con el enlace de recuperación. Revisa tu bandeja de entrada o haz clic abajo para continuar.`}
              autoClose={false}
            />

            <Link to={`/Auth/reset-password?token=${resetToken}`}>
              <Button variant="primary" size="md" className="w-full">
                Continuar y Crear Nueva Contraseña
              </Button>
            </Link>

            <div className="text-center pt-2">
              <Link to="/Auth" className="text-xs text-[var(--color-gray-400)] hover:text-white transition-colors">
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
              variant="primary"
              size="md"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2"
            >
              {isLoading ? "Enviando enlace..." : "Enviar Enlace de Recuperación"}
            </Button>

            <div className="text-center mt-4">
              <Link
                to="/Auth"
                className="text-xs text-[var(--color-primary-400)] hover:text-[var(--color-primary-300)] hover:underline"
              >
                ← Volver a Iniciar Sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
