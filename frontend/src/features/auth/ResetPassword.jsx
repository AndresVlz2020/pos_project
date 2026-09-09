import { useState } from "react";
import { Input, Button, Alert, BrandLogo } from "@/shared";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "valid-demo-token";

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(token === "expired");

  const validate = () => {
    const errs = {};
    if (!form.password) {
      errs.password = "La contraseña es requerida";
    } else if (form.password.length < 10) {
      errs.password = "Debe tener al menos 10 caracteres";
    } else if (!/[A-Z]/.test(form.password)) {
      errs.password = "Debe incluir al menos una mayúscula";
    } else if (!/[a-z]/.test(form.password)) {
      errs.password = "Debe incluir al menos una minúscula";
    } else if (!/[0-9]/.test(form.password)) {
      errs.password = "Debe incluir al menos un número";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
      errs.password = "Debe incluir un símbolo especial (!@#$...)";
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = "Confirma tu nueva contraseña";
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tokenError) return;
    if (!validate()) return;

    setIsSuccess(true);
    setTimeout(() => {
      navigate("/Auth");
    }, 2000);
  };

  if (tokenError) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-md bg-[var(--color-primary-900)] border border-red-500/50 rounded-lg p-8 shadow-lg text-[var(--color-white)] text-center">
          <Alert
            type="error"
            title="Enlace vencido o inválido"
            message="El enlace de recuperación ha caducado o no es válido. Por favor solicita uno nuevo."
            autoClose={false}
          />
          <div className="mt-6">
            <Link to="/Auth/forgot-password">
              <Button variant="primary" size="md" className="w-full">
                Solicitar Nuevo Enlace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-lg p-8 shadow-lg text-[var(--color-white)] relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo className="h-10 w-auto object-contain mb-3" alt="D,PIERO" />
          <h2 className="text-xl font-bold text-[var(--color-white)]">Nueva Contraseña</h2>
          <p className="text-xs text-[var(--color-gray-400)] mt-1">
            Ingresa tu nueva clave de acceso de mínimo 10 caracteres con mayúscula, minúscula, número y símbolo.
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-4 text-center">
            <Alert
              type="success"
              title="Contraseña actualizada"
              message="Tu contraseña ha sido restablecida exitosamente. Redirigiendo al login..."
              autoClose={false}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nueva Contraseña"
              name="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 10 caracteres seguros"
              htmlFor="reset-password"
              error={errors.password}
            />

            <Input
              label="Confirmar Contraseña"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Repite la contraseña"
              htmlFor="reset-confirm-password"
              error={errors.confirmPassword}
            />

            <Button
              variant="primary"
              size="md"
              type="submit"
              className="w-full mt-2"
            >
              Guardar Nueva Contraseña
            </Button>

            <div className="text-center mt-4">
              <Link
                to="/Auth"
                className="text-xs text-[var(--color-secondary-400)] hover:text-[var(--color-secondary-300)] hover:underline"
              >
                ← Cancelar y volver al Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
