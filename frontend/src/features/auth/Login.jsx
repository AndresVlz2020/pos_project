import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { BrandLogo, Button } from "@/shared";
import { loginSchema } from "@/features/users/schemas/userSchema";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userEmail: "",
    userPassword: "",
    remember: false
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
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

    const emailClean = form.userEmail.trim().toLowerCase();
    // Validación demo o acceso administrativo
    if (emailClean !== "admin@dpiero.com" || form.userPassword !== "12345678") {
      setErrors({
        userPassword: "Credenciales no válidas. Ingrese con las credenciales de administración."
      });
      return;
    }

    const adminSession = {
      name: "Administrador General",
      email: emailClean,
      role: "Admin",
      displayRole: "Administrador",
      station: "Terminal Central"
    };
    localStorage.setItem("auth_user", JSON.stringify(adminSession));
    localStorage.setItem("auth_token", "token-admin-" + Date.now());
    navigate("/");
  };

  return (
    <div className="w-full flex flex-col items-center justify-center font-[family-name:var(--main-font)] text-[var(--color-white)]">
      <div className="text-center mb-6">
        <Link to="/" className="inline-flex items-center justify-center gap-2 mb-2">
          <BrandLogo className="h-10 w-auto object-contain" alt="D'Piero Restaurante" />
        </Link>
        <p className="text-xs text-[var(--color-gray-400)] font-medium tracking-wide">
          Sistema Punto de Venta & Facturación
        </p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-[var(--color-primary-800)] bg-[var(--color-primary-900)] p-6 sm:p-8 text-[var(--color-white)] shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-[var(--color-white)]">Iniciar Sesión</h2>
          <p className="text-xs text-[var(--color-gray-400)] mt-1">
            Ingreso al Panel Administrativo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[var(--color-primary-950)] text-[var(--color-white)] text-xs border border-[var(--color-primary-800)] focus:border-[var(--color-secondary-500)] outline-none placeholder:text-[var(--color-gray-500)] transition-colors"
              />
            </div>
            {errors.userEmail && (
              <p className="text-[11px] text-red-500 mt-1">{errors.userEmail}</p>
            )}
          </div>

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
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[var(--color-primary-950)] text-[var(--color-white)] text-xs border border-[var(--color-primary-800)] focus:border-[var(--color-secondary-500)] outline-none placeholder:text-[var(--color-gray-500)] transition-colors"
              />
            </div>
            {errors.userPassword && (
              <p className="text-[11px] text-red-500 mt-1">{errors.userPassword}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-[var(--color-gray-400)] cursor-pointer">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="rounded bg-[var(--color-primary-950)] border-[var(--color-primary-800)] text-[var(--color-secondary-500)] focus:ring-0 cursor-pointer"
              />
              <span>Recordarme</span>
            </label>

            <Link
              to="/Auth/forgot-password"
              className="text-[var(--color-secondary-500)] hover:underline"
            >
              ¿Olvidó su contraseña?
            </Link>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 px-4 font-bold text-xs"
            >
              <LogIn className="size-4 mr-2" />
              Ingresar al Sistema
            </Button>
          </div>

          <div className="pt-4 text-center text-xs text-[var(--color-gray-400)] border-t border-[var(--color-primary-800)] mt-5">
            ¿Aún no tienes cuenta?{" "}
            <Link to="/Auth/register" className="font-semibold text-[var(--color-secondary-500)] hover:underline">
              Regístrate Aquí
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
