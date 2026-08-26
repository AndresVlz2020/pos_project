import { useEffect, useState } from "react";
import { Input, Select, Button, FileInput, Checkbox } from "@/shared";
import { getDocumentTypes } from "../../../services/selectServices";
import { userSchema } from "../../users/schemas/userSchema";
import { Link } from "react-router-dom";

export default function EditUser1() {
  const [form, setForm] = useState({
    userName: "",
    userDocumentNumber: "",
    userType: "",
    userPhone: "",
    userDocumentTypes: "",
    userEmail: "",
    isActive: false
  });

  const [errors, setErrors] = useState({});

  const [documentTypes, setDocumentTypes] = useState([]);

  useEffect(() => {
    getDocumentTypes()
      .then(setDocumentTypes)
      .catch(() => setDocumentTypes([]));
  }, []);

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
    <div className="overflow-y-hidden">
      {/* Body */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto my-22 p-6 bg-[var(--color-tertiary-300)] rounded-lg border border-[var(--color-border)] shadow-sm">
        <h1 className="text-[length:var(--fs-md)] font-bold text-center mb-8">Editar Usuario</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left: upload placeholder */}
          <div className="col-span-1 flex flex-col items-center">
            <span className="text-center mb-2">Cargar Imagen</span>
            <div className="w-full h-56 md:h-64 rounded-lg bg-[var(--color-surface)] flex flex-col items-center justify-center text-[var(--color-gray-900)] place-items-center">
                <FileInput className="flex items-center justify-center"
                  value={form.userImage}
                  onChange={(files) => 
                    setForm((prev) => ({ ...prev, userImage: files}))
                  }
                  multiple={true}
                />
            </div>
            {/* Sin switch: solo texto descriptivo si se requiere en el futuro */}
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
              label="Correo Electronico"
              name="userEmail"
              type="email"
              value={form.userEmail}
              onChange={handleChange}
              htmlFor="user-personal-email"
              error={errors.userEmail}
            />

            <Checkbox
            id="isActive"
            name="isActive"
            label="Esta activo"
            checked={form.isActive}
            onChange={handleChange}
            />

          </div>
        </div>

        <div className="max-w-7xl mx-auto flex md:justify-end justify-center mt-8 gap-4">
            <Link to="/dashboard/userList">
              <Button
                variant="secondary"
                size="md"
                type="submit"
              >
                Cancelar
              </Button>
            </Link>
                <Button 
                    variant="primary" 
                    size="md" 
                    type="submit"
                >
                    Hecho
                </Button>
        </div>
      </form>
    </div>
  );
}