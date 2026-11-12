import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { loginSchema } from "@/features/users/schemas/userSchema";
import { Button } from "@/shared";

export default function AdminLoginForm({ onSubmit }) {
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

  const handleSubmit = async (e) => {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-5">
        <h2 className="text-base font-bold text-[var(--color-white)]">Acceso Administrativo</h2>
        <p className="text-xs text-[var(--color-gray-400)] mt-0.5">
          Ingresa con tu correo corporativo y clave de sistema.
        </p>
      </div>

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
            className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[var(--color-secondary-950)] text-[var(--color-white)] text-xs border border-[var(--color-secondary-800)] focus:border-[var(--color-primary-500)] outline-none placeholder:text-[var(--color-gray-500)] transition-colors"
          />
        </div>
        {errors.userEmail && (
          <p className="text-[11px] text-[var(--color-error)] mt-1">{errors.userEmail}</p>
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
            className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[var(--color-secondary-950)] text-[var(--color-white)] text-xs border border-[var(--color-secondary-800)] focus:border-[var(--color-primary-500)] outline-none placeholder:text-[var(--color-gray-500)] transition-colors"
          />
        </div>
        {errors.userPassword && (
          <p className="text-[11px] text-[var(--color-error)] mt-1">{errors.userPassword}</p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 text-[var(--color-gray-400)] cursor-pointer">
          <input
            type="checkbox"
            name="remember"
            checked={form.remember}
            onChange={handleChange}
            className="rounded bg-[var(--color-secondary-950)] border-[var(--color-secondary-800)] text-[var(--color-primary-500)] focus:ring-0 cursor-pointer"
          />
          <span>Recordarme</span>
        </label>

        <Link
          to="/Auth/forgot-password"
          className="text-[var(--color-primary-400)] hover:underline"
        >
          ¿Olvidó su contraseña?
        </Link>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full text-xs font-bold py-2.5"
        >
          Ingresar al Panel Administrativo
        </Button>
      </div>
    </form>
  );
}
