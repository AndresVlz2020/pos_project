import { useState } from "react";
import { Input, Button, Checkbox } from "@/shared";
import { Link } from "react-router-dom";
import logoDPiero from "@/assets/images/logo-d,piero.png";
import bgLogin from "@/assets/images/bg-login.png";
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
    <div className="w-full">
      {/* Header */}
      <div className="w-full bg-[var(--color-primary-950)] text-[var(--color-text-inverse)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <img src={logoDPiero} alt="D,PIERO" className="h-8 w-auto object-contain" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-6 py-10">
        {/* Left image */}
        <div className="hidden md:block relative h-[60vh] md:h-[70vh] rounded-lg overflow-hidden border border-[var(--color-border)]">
          <img src={bgLogin} alt="Fondo Login" className="absolute inset-0 w-full h-full object-cover" />
        </div>

        {/* Right form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
          <div className="rounded-lg border border-[var(--color-border-strong)] p-8">
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
          </div>

          <div className="mt-6">
            <Button variant="primary" type="submit" className="w-full">Iniciar Sesión</Button>
          </div>

          <div className="mt-4">
            <Link to="#" className="text-sm underline text-[var(--color-primary-700)]">¿Olvidó su contraseña?</Link>
          </div>

          <div className="mt-6 text-sm">
            ¿Aun no tienes cuenta? {" "}
            <Link to="/Auth/register" className="underline text-[var(--color-primary-700)]">Regístrate Aquí</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
