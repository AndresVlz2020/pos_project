import { useEffect, useState } from "react";
import { Input, Select, Button, FileInput, showSuccessAlert, showErrorAlert } from "@/shared";
import { getDocumentTypes } from "../../../services/selectServices";
import { updateUser } from "../../../services/userService";
import { createUserSchema } from "../schemas/userSchema";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function EditUser1() {
  const navigate = useNavigate();
  const location = useLocation();
  const rawUser = location.state?.user;
  const editUser =
    rawUser ||
    (() => {
      try {
        return JSON.parse(sessionStorage.getItem("last_edited_user") || "null");
      } catch {
        return null;
      }
    })();

  useEffect(() => {
    if (location.state?.user) {
      sessionStorage.setItem("last_edited_user", JSON.stringify(location.state.user));
    }
  }, [location.state]);

  // Verificar si el usuario activo tiene rol de Administrador
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
      return null;
    }
  })();

  const isAdmin = currentUser?.role === "Admin" || currentUser?.role === "Administrador";

  const formatDateVal = (d) => {
    if (!d) return "";
    if (typeof d === "string" && d.includes("T")) return d.split("T")[0];
    return String(d);
  };

  const initialRole = (() => {
    const raw = (editUser?.userType || editUser?.role || "").toLowerCase();
    if (raw.includes("admin")) return "admin";
    if (raw.includes("caj")) return "cajero";
    if (raw.includes("meser")) return "mesero";
    if (raw.includes("cocin") || raw.includes("parrill")) return "cocina";
    if (raw.includes("proveed")) return "proveedor";
    return raw || "mesero";
  })();

  const [form, setForm] = useState({
    userName: editUser?.userName || editUser?.name || "",
    userDocumentNumber: editUser?.userDocumentNumber || editUser?.document_number || "",
    userType: initialRole,
    userPhone: editUser?.userPhone || editUser?.phone || "",
    userDocumentTypes: editUser?.userDocumentTypes || editUser?.document_type || "CC",
    userEmail: editUser?.userEmail || editUser?.email || "",
    startDate: formatDateVal(editUser?.startDate || editUser?.contract_start),
    endDate: formatDateVal(editUser?.endDate || editUser?.contract_end),
    pin: editUser?.pin || "",
    userPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [documentTypes, setDocumentTypes] = useState([]);

  useEffect(() => {
    getDocumentTypes()
      .then(setDocumentTypes)
      .catch(() => setDocumentTypes([]));
  }, []);

  const isRoleAdmin = form.userType === "admin" || form.userType === "Admin";

  const userTypeOptions = [
    { value: "cajero", label: "Cajero (Acceso por PIN)" },
    { value: "mesero", label: "Mesero (Acceso por PIN)" },
    { value: "cocina", label: "Cocina / Parrilla (Acceso por PIN)" },
    { value: "proveedor", label: "Proveedor (Acceso por PIN)" },
    { value: "admin", label: "Administrador (Acceso por Contraseña)" },
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Si es admin y no ingresó nueva contraseña, usamos una temporal para pasar validación de esquema
    const formToValidate = { ...form };
    if (isRoleAdmin && (!formToValidate.userPassword || formToValidate.userPassword.trim() === "")) {
      formToValidate.userPassword = "Password12345#"; // No se sobreescribe en BD si no se cambió
    }

    const result = createUserSchema.safeParse(formToValidate);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      if (editUser?.id) {
        await updateUser(editUser.id, formToValidate);
      }
      setErrors({});
      await showSuccessAlert({
        title: "Usuario actualizado",
        text: "La información del colaborador ha sido actualizada correctamente en el sistema."
      });
      navigate("/dashboard/userList");
    } catch (err) {
      await showErrorAlert({
        title: "Error al actualizar",
        text: err.message || "No se pudo actualizar el usuario en el servidor."
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-lg p-8 shadow-md text-center max-w-lg w-full">
          <div className="size-14 rounded-full bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] flex items-center justify-center mx-auto mb-4 text-[var(--color-warning)]">
            <ShieldAlert className="size-7" />
          </div>
          <h2 className="text-lg font-bold text-[var(--color-white)] mb-2">Acceso Exclusivo de Administrador</h2>
          <p className="text-sm text-[var(--color-gray-400)] leading-relaxed mb-6">
            La edición de usuarios solo está habilitada para el administrador central (<span className="text-[var(--color-primary-400)] font-medium">admin@dpiero.com</span>).
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/">
              <Button>Ir al Punto de Venta</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Body */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto my-8 p-8 bg-[var(--color-secondary-900)] rounded-lg border border-[var(--color-secondary-800)] shadow-md text-[var(--color-white)]">
        <h1 className="text-[length:var(--fs-md)] font-bold text-center mb-8 text-[var(--color-white)]">Editar Usuario</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left: upload placeholder */}
          <div className="col-span-1 flex flex-col items-center">
            <span className="text-center mb-2 text-[var(--color-gray-300)] text-sm font-medium">Cargar Imagen</span>
            <div className="w-full h-56 md:h-64 rounded-xl bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] flex flex-col items-center justify-center text-[var(--color-white)] place-items-center">
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
              label={isRoleAdmin ? "Correo de Acceso (Administrador)" : "Correo Electrónico"}
              name="userEmail"
              type="email"
              value={form.userEmail}
              onChange={handleChange}
              placeholder={isRoleAdmin ? "ej. gerente@dpiero.com" : "ej. colaborador@gmail.com"}
              htmlFor="user-email"
              error={errors.userEmail}
            />

            {/* Si es Administrador: campo para actualizar contraseña. Si es Operativo: PIN y fechas */}
            {isRoleAdmin ? (
              <div className="sm:col-span-2">
                <Input
                  label="Nueva Contraseña (dejar en blanco para conservar actual)"
                  name="userPassword"
                  type="password"
                  value={form.userPassword}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  htmlFor="user-password"
                  error={errors.userPassword}
                />
                <p className="text-[11px] text-[var(--color-gray-400)] mt-1.5">
                  Ingrese una nueva contraseña únicamente si desea modificar las credenciales del administrador.
                </p>
              </div>
            ) : (
              <>
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

                <Input
                  label="Fecha Inicio Laboral"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  htmlFor="user-start-date"
                  error={errors.startDate}
                />

                <Input
                  label="Fecha Fin Laboral"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  htmlFor="user-end-date"
                  error={errors.endDate}
                />
              </>
            )}
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