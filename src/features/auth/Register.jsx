import { useState, useEffect } from "react";
import { Input, Button, Select, Checkbox } from "@/shared";
import { Link } from "react-router-dom";
import logoDPiero from "@/assets/images/logo-d,piero.png";
import bgLogin from "@/assets/images/bg-login.png";
import { getDocumentTypes } from "../../services/selectServices";
import { userSchema } from "@/features/users/schemas/userSchema";

export default function Register() {
  const [form, setForm] = useState({
    userName: "",
    surname: "",
    userDocumentTypes: "",
    userDocumentNumber: "",
    userEmail: "",
    userPhone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [documentTypes, setDocumentTypes] = useState([]);

  useEffect(() => {
    getDocumentTypes()
      .then(setDocumentTypes)
      .catch(() => setDocumentTypes([]));
  }, []);

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
    alert("Registro (demo)");
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
          <img src={bgLogin} alt="Fondo Registro" className="absolute inset-0 w-full h-full object-cover" />
        </div>

        {/* Right form */
        }
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
          <div className="rounded-lg border border-[var(--color-border-strong)] p-8">
            <div className="grid gap-4">
              <Input
                label="Nombre"
                name="userName"
                type="text"
                value={form.userName}
                onChange={handleChange}
                htmlFor="register-name"
                error={errors.userName}
              />
              <Input
                label="Apellidos"
                name="surname"
                type="text"
                value={form.surname}
                onChange={handleChange}
                htmlFor="register-surname"
                error={errors.surname}
              />
              <Select
                label="Tipo de documento"
                name="userDocumentTypes"
                htmlFor="register-document-type"
                options={documentTypes}
                value={form.userDocumentTypes}
                onChange={handleChange}
                error={errors.userDocumentTypes}
              />
              <Input
                label="Número de documento"
                name="userDocumentNumber"
                type="text"
                value={form.userDocumentNumber}
                onChange={handleChange}
                htmlFor="register-document-number"
                error={errors.userDocumentNumber}
              />
              <Input
                label="Correo Electrónico"
                name="userEmail"
                type="email"
                value={form.userEmail}
                onChange={handleChange}
                htmlFor="register-email"
                error={errors.userEmail}
              />
              <Input
                label="Teléfono"
                name="userPhone"
                type="tel"
                value={form.userPhone}
                onChange={handleChange}
                htmlFor="register-phone"
                error={errors.userPhone}
              />
              <Input
                label="Contraseña"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                htmlFor="register-password"
                error={errors.password}
              />
              <Input
                label="Confirmar Contraseña"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                htmlFor="register-confirm-password"
                error={errors.confirmPassword}
              />
              <Checkbox
                id="register-terms"
                name="terms"
                label="Acepto términos y condiciones"
                checked={form.terms}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-6">
            <Button variant="primary" type="submit" className="w-full">Registrarse</Button>
          </div>

          <div className="mt-6 text-sm">
            ¿Ya tienes cuenta? {" "}
            <Link to="/Auth" className="underline text-[var(--color-primary-700)]">Inicia Sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
