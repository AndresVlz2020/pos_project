import { useState } from "react";
import { Input, Button, Alert, BrandLogo } from "@/shared";
import { Link } from "react-router-dom";
import bgAuth from "@/assets/images/bg-auth-restaurant.jpg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
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

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8">
      {/* Container */}
      <div className="w-full max-w-md bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-lg p-8 shadow-lg text-[var(--color-white)] relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo className="h-10 w-auto object-contain mb-3" alt="D,PIERO" />
          <h2 className="text-xl font-bold text-[var(--color-white)]">Recuperar Contraseña</h2>
          <p className="text-xs text-[var(--color-gray-400)] mt-1">
            Ingresa tu correo registrado para recibir las instrucciones de restablecimiento.
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-6">
            <Alert
              type="success"
              title="Solicitud enviada"
              message="Se ha enviado un correo de restablecimiento si la cuenta se encuentra registrada en el sistema."
              autoClose={false}
            />
            <div className="text-center">
              <Link to="/Auth">
                <Button variant="primary" size="md" className="w-full">
                  Volver al Inicio de Sesión
                </Button>
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
                className="text-xs text-[var(--color-secondary-400)] hover:text-[var(--color-secondary-300)] hover:underline"
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
