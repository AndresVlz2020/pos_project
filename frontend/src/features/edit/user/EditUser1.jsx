import { useEffect, useState } from "react";
import { Input, Select, Button, FileInput } from "@/shared";
import { getDocumentTypes } from "../../../services/selectServices";
import { createUserSchema } from "../../users/schemas/userSchema";
import { Link } from "react-router-dom";

export default function EditUser1() {
  const [form, setForm] = useState({
    userName: "",
    userDocumentNumber: "",
    userType: "",
    userPhone: "",
    userDocumentTypes: "",
    userEmail: "",
    corporateEmail: "",
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
    { value: "administrador", label: "Administrador" },
    { value: "cajero", label: "Cajero" },
    { value: "mesero", label: "Mesero" },
    { value: "cocina", label: "Cocina" },
    { value: "proveedor", label: "Proveedor" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const nextErrors = { ...errors };
      delete nextErrors[name];
      setErrors(nextErrors);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = createUserSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    alert("Usuario actualizado (demo)");
  };

  return (
    <div className="min-h-screen">
      {/* Body */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto my-8 p-8 bg-[var(--color-primary-900)] rounded-lg border border-[var(--color-primary-800)] shadow-md text-[var(--color-white)]">
        <h1 className="text-[length:var(--fs-md)] font-bold text-center mb-8 text-[var(--color-white)]">Editar Usuario</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left: upload placeholder */}
          <div className="col-span-1 flex flex-col items-center">
            <span className="text-center mb-2 text-[var(--color-gray-400)] text-sm font-medium">Cargar Imagen</span>
            <div className="w-full h-56 md:h-64 rounded-xl bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] flex flex-col items-center justify-center text-[var(--color-white)] place-items-center">
                <FileInput className="flex items-center justify-center"
                  value={form.userImage}
                  onChange={(files) => 
                    setForm((prev) => ({ ...prev, userImage: files }))
                  }
                  multiple={true}
                />
            </div>
          </div>

          {/* Right: form fields */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre Completo"
              name="userName"
              type="text"
              value={form.userName}
              onChange={handleChange}
              htmlFor="user-full-name"
              error={errors.userName}
            />
            <Input
              label="Numero de Documento"
              name="userDocumentNumber"
              type="text"
              value={form.userDocumentNumber}
              onChange={handleChange}
              htmlFor="user-document-number"
              error={errors.userDocumentNumber}
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
              name="userPhone"
              type="tel"
              value={form.userPhone}
              onChange={handleChange}
              htmlFor="user-phone"
              error={errors.userPhone}
            />

            <Select
              label="Tipo de Documento"
              name="userDocumentTypes"
              htmlFor="user-document-type"
              options={documentTypes}
              value={form.userDocumentTypes}
              onChange={handleChange}
              error={errors.userDocumentTypes}
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
              name="userEmail"
              type="email"
              value={form.userEmail}
              onChange={handleChange}
              htmlFor="user-personal-email"
              error={errors.userEmail}
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

        <div className="max-w-7xl mx-auto flex md:justify-end justify-center mt-8 gap-4">
            <Link to="/dashboard/userList">
              <Button
                variant="secondary"
                size="md"
                type="button"
              >
                Cancelar
              </Button>
            </Link>
          <Button variant="primary" size="md" type="submit">Guardar</Button>
        </div>
      </form>
    </div>
  );
}