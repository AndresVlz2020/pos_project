import { useState, useEffect } from "react";
import { Input, Button, Select, Checkbox, BrandLogo, showSuccessAlert } from "@/shared";
import { Link, useNavigate } from "react-router-dom";
import bgRegister from "@/assets/images/bg-register-restaurant.webp";
import { getDocumentTypes } from "../../services/selectServices";
import { userSchema } from "@/features/users/schemas/userSchema";

export default function Register() {
  const navigate = useNavigate();
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

  const handleSubmit = async (e) => {
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
    await showSuccessAlert({
      title: "Cuenta creada",
      text: "Su cuenta ha sido registrada correctamente. Inicie sesión para continuar."
    });
    navigate("/Auth");
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
      {/* Header */}
      <header className="w-full h-16 bg-[var(--md-sys-color-surface-container)] border-b border-[var(--md-sys-color-outline-variant)]">
        <div className="w-full h-full px-4 sm:px-6 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] rounded-lg">
            <BrandLogo className="h-9 w-auto object-contain" alt="D,PIERO" />
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center px-4 sm:px-8 py-6 sm:py-10">
        {/* Left image */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-7 relative h-[76vh] rounded-[28px] overflow-hidden border border-[var(--md-sys-color-outline-variant)] m3-elevation-2">
          <img src={bgRegister} alt="D'Piero Registro" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex flex-col justify-end p-8">
            <h2 className="text-headline-md font-bold text-white mb-2">Únete al Equipo D&apos;Piero</h2>
            <p className="text-body-lg text-white/90 leading-relaxed max-w-xl">
              Crea tu cuenta de acceso operativo para gestionar órdenes, registrar pedidos y supervisar tu estación.
            </p>
          </div>
        </div>

        {/* Right form */}
        <form onSubmit={handleSubmit} className="lg:col-span-6 xl:col-span-5 w-full max-w-lg mx-auto">
          <div className="rounded-[28px] border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] p-6 sm:p-8 m3-elevation-2 text-[var(--md-sys-color-on-surface)]">
            <h2 className="text-headline-sm font-semibold text-center mb-6 text-[var(--md-sys-color-on-surface)]">
              Registro de Cuenta
            </h2>
            <div className="grid gap-3.5">
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
                leadingIcon="mail"
                value={form.userEmail}
                onChange={handleChange}
                htmlFor="register-email"
                error={errors.userEmail}
              />
              <Input
                label="Teléfono"
                name="userPhone"
                type="tel"
                leadingIcon="call"
                value={form.userPhone}
                onChange={handleChange}
                htmlFor="register-phone"
                error={errors.userPhone}
              />
              <Input
                label="Contraseña"
                name="password"
                type="password"
                leadingIcon="lock"
                value={form.password}
                onChange={handleChange}
                htmlFor="register-password"
                error={errors.password}
              />
              <Input
                label="Confirmar Contraseña"
                name="confirmPassword"
                type="password"
                leadingIcon="lock"
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

            <div className="mt-6">
              <Button variant="filled" type="submit" className="w-full">
                Registrarse
              </Button>
            </div>

            <div className="mt-5 text-body-md text-center text-[var(--md-sys-color-on-surface-variant)]">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/Auth"
                className="inline-flex items-center min-h-[40px] px-3 rounded-full font-semibold text-[var(--md-sys-color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
              >
                Inicia Sesión
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
