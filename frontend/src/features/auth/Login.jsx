import { useState } from "react";
import { Input, Button, Checkbox } from "@/shared";
import { Link } from "react-router-dom";
import logoDPiero from "@/assets/images/logo-d,piero.png";
import bgLogin from "@/assets/images/bg-auth-restaurant.jpg";
import { userSchema } from "@/features/users/schemas/userSchema";

export default function Login() {
  const [form, setForm] = useState({ userEmail: "", userPassword: "", remember: false });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));

    if (errors[name]) {
      const nextErrors = { ...errors };
      delete nextErrors[name];
      setErrors(nextErrors);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = userSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    alert("Inicio de sesión (demo)");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="w-full bg-[var(--color-primary-950)] text-[var(--color-text-inverse)] border-b border-[var(--color-primary-800)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoDPiero} alt="D,PIERO" className="h-9 w-auto object-contain drop-shadow" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-6 py-10">
        {/* Left image with culinary mood */}
        <div className="hidden md:block relative h-[60vh] md:h-[75vh] rounded-2xl overflow-hidden border border-[var(--color-primary-800)] shadow-2xl">
          <img src={bgLogin} alt="D'Piero Restaurante" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary-950)] via-[var(--color-primary-950)]/40 to-transparent flex flex-col justify-end p-8">
            <h2 className="text-2xl font-bold text-[var(--color-white)] mb-2">D'Piero • Parrilla & POS</h2>
            <p className="text-sm text-[var(--color-gray-300)] leading-relaxed">
              Sistema de Punto de Venta optimizado para comandas de mesa, cocina, inventario y facturación.
            </p>
          </div>
        </div>

        {/* Right form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
          <div className="rounded-2xl border border-[var(--color-primary-800)] bg-[var(--color-primary-900)] p-8 shadow-2xl text-[var(--color-white)]">
            <h2 className="text-xl font-bold text-center mb-6 text-[var(--color-white)]">Iniciar Sesión</h2>
            <div className="grid gap-4">
              <Input
                label="Correo Electrónico"
                name="userEmail"
                type="email"
                value={form.userEmail}
                onChange={handleChange}
                htmlFor="login-user-email"
                error={errors.userEmail}
              />
              <Input
                label="Contraseña"
                name="userPassword"
                type="password"
                value={form.userPassword}
                onChange={handleChange}
                htmlFor="login-user-password"
                error={errors.userPassword}
              />
              <Checkbox
                id="login-remember"
                name="remember"
                label="Recordarme"
                checked={form.remember}
                onChange={handleChange}
              />
            </div>

            <div className="mt-6">
              <Button variant="primary" type="submit" className="w-full">Iniciar Sesión</Button>
            </div>

            <div className="mt-4 text-center">
              <Link to="#" className="text-xs text-[var(--color-secondary-400)] hover:text-[var(--color-secondary-300)] hover:underline">¿Olvidó su contraseña?</Link>
            </div>

            <div className="mt-6 text-xs text-center text-[var(--color-gray-300)]">
              ¿Aún no tienes cuenta?{" "}
              <Link to="/Auth/register" className="font-semibold text-[var(--color-secondary-400)] hover:text-[var(--color-secondary-300)] hover:underline">Regístrate Aquí</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
