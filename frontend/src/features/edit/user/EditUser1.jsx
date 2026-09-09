import { useEffect, useState } from "react";
import { Input, Select, Button, FileInput } from "@/shared";
import { getDocumentTypes } from "../../../services/selectServices";
import { createUserSchema } from "../../users/schemas/userSchema";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function EditUser1() {
  // Verificar si el usuario activo tiene rol de Administrador
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
      return null;
    }
  })();

  const isAdmin = currentUser?.role === "Admin" || currentUser?.role === "Administrador";

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
    pin: "",
  });

  const [errors, setErrors] = useState({});

  const [documentTypes, setDocumentTypes] = useState([]);

  useEffect(() => {
    getDocumentTypes()
      .then(setDocumentTypes)
      .catch(() => setDocumentTypes([]));
  }, []);

  const userTypeOptions = [
    { value: "cajero", label: "Cajero" },
    { value: "mesero", label: "Mesero" },
    { value: "cocina", label: "Cocina / Parrilla" },
    { value: "proveedor", label: "Proveedor" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === "pin" ? value.replace(/\D/g, "").slice(0, 4) : value;
    setForm((prev) => ({ ...prev, [name]: finalValue }));

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

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-lg p-8 shadow-md text-center max-w-lg w-full">
          <div className="size-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <ShieldAlert className="size-7" />
          </div>
          <h2 className="text-lg font-bold text-[var(--color-white)] mb-2">Acceso Exclusivo de Administrador</h2>
          <p className="text-sm text-[var(--color-gray-400)] leading-relaxed mb-6">
            La edición de usuarios solo está habilitada para el administrador central (<span className="text-[var(--color-secondary-400)] font-medium">admin@dpiero.com</span>).
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/">
              <Button>Ir al Punto de Venta</Button>
            </Link>
            <Link to="/Auth">
              <Button variant="secondary">Cambiar Operador</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Body */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto my-8 p-8 bg-[var(--color-primary-900)] rounded-lg border border-[var(--color-primary-800)] shadow-md text-[var(--color-white)]">
        <h1 className="text-[length:var(--fs-md)] font-bold text-center mb-8 text-[var(--color-white)]">Editar Usuario</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left: upload placeholder */}
          <div className="col-span-1 flex flex-col items-center">
            <span className="text-center mb-2 text-[var(--color-gray-300)] text-sm font-medium">Cargar Imagen</span>
            <div className="w-full h-56 md:h-64 rounded-xl bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] flex flex-col items-center justify-center text-[var(--color-white)] place-items-center">
                <FileInput className="flex items-center justify-center"
                  value={form.userImage}
                  onChange={(files) => 
                    setForm((prev) => ({ ...prev, userImage: files }))
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

            <Input
              label="PIN de Terminal POS (4 dígitos)"
              name="pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={form.pin}
              onChange={handleChange}
              htmlFor="user-pin"
              error={errors.pin}
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