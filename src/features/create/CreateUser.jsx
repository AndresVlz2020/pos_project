import { useEffect, useState } from "react";
import { Input, Select, Button } from "@/shared";
import logoDPiero from "@/assets/images/logo-d,piero.png";
import iconUpload from "@/assets/icons/cargar.png";
import { getDocumentTypes } from "../../services/selectServices";
import { userSchema } from "../users/schemas/userSchema";

export default function CreateUser() {
  const [form, setForm] = useState({
    fullName: "",
    documentNumber: "",
    userType: "",
    phone: "",
    documentType: "",
    corporateEmail: "",
    personalEmail: "",
    startDate: "",
    endDate: "",
  });

  const [errors, setErrors] = useState({});

  const [documentTypes, setDocumentTypes] = useState([]);

  useEffect(() => {
    getDocumentTypes()
      .then(setDocumentTypes)
      .catch(() => setDocumentTypes([]));
  }, []);

  const userTypeOptions = [
    { value: "mesero", label: "Mesero" },
    { value: "administrador", label: "Administrador" },
    { value: "superadministrador", label: "SuperAdministrador" },
    { value: "proveedor", label: "Proveedor" },
    { value: "cocina", label: "Cocina" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const { [name]: _omit, ...rest } = errors;
      setErrors(rest);
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
    alert("Usuario creado (demo)");
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="w-full bg-[var(--color-primary-950)] text-[var(--color-text-inverse)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button type="button" onClick={() => window.history.back()} className="px-3 py-1 rounded-md border border-[var(--color-text-inverse)] text-[var(--color-text-inverse)]">←</button>
          <img src={logoDPiero} alt="D,PIERO" className="h-8 w-auto object-contain" />
        </div>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto p-6 bg-[var(--color-tertiary-300)] rounded-lg border border-[var(--color-border)] shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-8">Crear Usuario</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left: upload placeholder */}
          <div className="col-span-1 flex flex-col items-center">
            <div className="w-80 h-56 md:h-64 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-sm flex flex-col items-center justify-center text-[var(--color-gray-900)]">
              <span className="mb-3">Cargar Imagen</span>
              <img src={iconUpload} alt="Cargar" className="w-8 h-8 opacity-80" />
            </div>
            {/* Sin switch: solo texto descriptivo si se requiere en el futuro */}
          </div>

          {/* Right: form fields */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre Completo"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              htmlFor="user-full-name"
              error={errors.fullName}
            />
            <Input
              label="Numero de Documento"
              name="documentNumber"
              type="text"
              value={form.documentNumber}
              onChange={handleChange}
              htmlFor="user-document-number"
              error={errors.documentNumber}
            />

            <Select
              label="Tipo de Usuario"
              name="userType"
              htmlFor="user-type"
              options={userTypeOptions}
              value={form.userType}
              onChange={handleChange}
              error={errors.userType}
            />
            <Input
              label="Numero Telefónico"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              htmlFor="user-phone"
              error={errors.phone}
            />

            <Select
              label="Tipo de Documento"
              name="documentType"
              htmlFor="user-document-type"
              options={documentTypes}
              value={form.documentType}
              onChange={handleChange}
              error={errors.documentType}
            />
            <Input
              label="Correo Empresarial"
              name="corporateEmail"
              type="email"
              value={form.corporateEmail}
              onChange={handleChange}
              htmlFor="user-corporate-email"
              error={errors.corporateEmail}
            />

            <Input
              label="Fecha Inicio Laboral"
              name="startDate"
              type="text"
              placeholder="AAAA/MM/DD"
              value={form.startDate}
              onChange={handleChange}
              htmlFor="user-start-date"
              error={errors.startDate}
            />
            <Input
              label="Correo Electronico"
              name="personalEmail"
              type="email"
              value={form.personalEmail}
              onChange={handleChange}
              htmlFor="user-personal-email"
              error={errors.personalEmail}
            />

            <Input
              label="Fecha Fin Laboral"
              name="endDate"
              type="text"
              placeholder="AAAA/MM/DD"
              value={form.endDate}
              onChange={handleChange}
              htmlFor="user-end-date"
              error={errors.endDate}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex md:justify-end justify-center mt-8">
          <Button variant="primary" size="md" type="submit">Crear</Button>
        </div>
      </form>
    </div>
  );
}
