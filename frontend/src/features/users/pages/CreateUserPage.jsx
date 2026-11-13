import { useEffect, useState } from "react";
import { Input, Select, Button, FileInput, showSuccessAlert, showErrorAlert, showWarningAlert } from "@/shared";
import { getDocumentTypes } from "../../../services/selectServices";
import { createUser, getUsers } from "../../../services/userService";
import { createUserSchema } from "../schemas/userSchema";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function CreateUser() {
  const navigate = useNavigate();
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
    startDate: "",
    endDate: "",
    pin: "",
    userPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [documentTypes, setDocumentTypes] = useState([]);
  const [existingUsers, setExistingUsers] = useState([]);

  useEffect(() => {
    getDocumentTypes()
      .then(setDocumentTypes)
      .catch(() => setDocumentTypes([]));

    getUsers()
      .then((data) => {
        if (Array.isArray(data)) setExistingUsers(data);
      })
      .catch(() => {});
  }, []);

  const adminCount = existingUsers.filter((u) => 
    u.userType === "admin" || u.role === "Admin" || u.role === "Administrador" || u.isSuperUser
  ).length;

  const isRoleAdmin = form.userType === "admin" || form.userType === "Admin";

  const userTypeOptions = [
    { value: "cajero", label: "Cajero (Acceso por PIN)" },
    { value: "mesero", label: "Mesero (Acceso por PIN)" },
    { value: "cocina", label: "Cocina / Parrilla (Acceso por PIN)" },
    { value: "proveedor", label: "Proveedor (Acceso por PIN)" },
    { 
      value: "admin", 
      label: adminCount >= 2 ? "Administrador (Límite 2/2 alcanzado)" : "Administrador (Acceso por Contraseña)" 
    },
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

    if (isRoleAdmin && adminCount >= 2) {
      await showWarningAlert({
        title: "Límite de administradores alcanzado",
        text: "El restaurante solo permite un máximo de 2 administradores. Para crear uno nuevo, debe reasignar o inhabilitar un administrador existente."
      });
      return;
    }

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

    try {
      // Enviar datos al backend para persistencia en PostgreSQL
      const payload = {
        ...result.data,
        corporateEmail: result.data.userEmail,
        isSuperuser: isRoleAdmin,
        isStaff: true,
      };

      await createUser(payload);

      await showSuccessAlert({
        title: "Usuario registrado",
        text: "Usuario creado correctamente"
      });
      navigate("/dashboard/userList");
    } catch (err) {
      if (err?.isStepUpCancelled) return;
      console.error("Error al registrar usuario en backend:", err);
      const isConnectionError =
        err.message?.toLowerCase().includes("fetch") ||
        err.name === "TypeError" ||
        err.message?.toLowerCase().includes("conexión");

      await showErrorAlert({
        title: "Error inesperado",
        text: isConnectionError
          ? "Error inesperado de conexión con el servidor backend."
          : (err.message || "Error inesperado al procesar la solicitud.")
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
            La creación y alta de usuarios solo está habilitada para el administrador central (<span className="text-[var(--color-primary-400)] font-medium">admin@dpiero.com</span>).
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
    <div className="w-full">
      {/* Body */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto my-2 sm:my-8 p-4 sm:p-8 bg-[var(--color-secondary-900)] rounded-lg border border-[var(--color-secondary-800)] shadow-md text-[var(--color-white)]">
        <h1 className="text-[length:var(--fs-md)] font-bold text-center mb-5 sm:mb-8 text-[var(--color-white)]">Crear Usuario</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 items-start">
          {/* Left: upload placeholder */}
          <div className="col-span-1 flex flex-col items-center">
            <span className="text-center mb-2 text-[var(--color-gray-300)] text-sm font-medium">Cargar Imagen</span>
            <div className="w-full h-56 md:h-64 rounded-xl bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] flex flex-col items-center justify-center text-[var(--color-white)] place-items-center">
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

            {/* Si es Administrador: contraseña segura. Si es Operativo: PIN y fechas laborales */}
            {isRoleAdmin ? (
              <div className="sm:col-span-2">
                <Input
                  label="Contraseña de Administrador"
                  name="userPassword"
                  type="password"
                  value={form.userPassword}
                  onChange={handleChange}
                  placeholder="Mínimo 10 caracteres (Mayús, minús, núm, símbolo)"
                  htmlFor="user-password"
                  error={errors.userPassword}
                />
                <p className="text-[11px] text-[var(--color-gray-400)] mt-1.5">
                  Esta contraseña servirá para que el nuevo administrador ingrese al panel con su correo.
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
          <Button variant="primary" size="md" type="submit">Crear</Button>
        </div>
      </form>
    </div>
  );
}
