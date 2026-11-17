import { useEffect, useState } from "react";
import { Input, Select, Button, FileInput, M3Icon, showSuccessAlert, showErrorAlert, showWarningAlert } from "@/shared";
import { getDocumentTypes } from "../../../services/selectServices";
import { createUser, getUsers } from "../../../services/userService";
import { createUserSchema } from "../schemas/userSchema";
import { Link, useNavigate } from "react-router-dom";
import resizeImageFile from "@/utils/imageFile";

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
    userImage: [],
  });

  const [errors, setErrors] = useState({});
  const [documentTypes, setDocumentTypes] = useState([]);
  const [existingUsers, setExistingUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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
    if (submitting) return;

    if (isRoleAdmin && adminCount >= 2) {
      await showWarningAlert({
        title: "Límite de administradores alcanzado",
        text: "El restaurante solo permite un máximo de 2 administradores. Para crear uno nuevo, debe reasignar o inhabilitar un administrador existente."
      });
      return;
    }

    const result = createUserSchema.safeParse({
      ...form,
      userImage: form.userImage?.length ? form.userImage : undefined,
    });
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      let userAvatarUrl = null;
      if (form.userImage?.length) {
        userAvatarUrl = await resizeImageFile(form.userImage[0]);
      }

      // Enviar datos al backend para persistencia en PostgreSQL
      const payload = {
        ...result.data,
        userImage: undefined,
        userAvatarUrl,
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
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 font-[family-name:var(--main-font)]">
        <div className="bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-[28px] p-6 sm:p-8 m3-elevation-1 text-center max-w-lg w-full text-[var(--md-sys-color-on-surface)]">
          <div className="size-14 rounded-full bg-[var(--md-sys-color-error-container)] border border-[var(--md-sys-color-error)]/40 flex items-center justify-center mx-auto mb-4 text-[var(--md-sys-color-on-error-container)]">
            <M3Icon name="warning" size={28} />
          </div>
          <h2 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)] mb-2">
            Acceso Exclusivo de Administrador
          </h2>
          <p className="text-body-md text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mb-6">
            La creación y alta de usuarios solo está habilitada para el administrador central (<span className="text-[var(--md-sys-color-primary)] font-medium">admin@dpiero.com</span>).
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/">
              <Button variant="filled" leadingIcon="home">
                Ir al Punto de Venta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full font-[family-name:var(--main-font)]">
      {/* Body */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col w-full p-5 sm:p-8 bg-[var(--md-sys-color-surface-container-low)] rounded-2xl border border-[var(--md-sys-color-outline-variant)] m3-elevation-1 text-[var(--md-sys-color-on-surface)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[var(--md-sys-color-outline-variant)]">
          <div>
            <h1 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
              Crear Usuario
            </h1>
            <p className="text-body-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              Registra colaboradores operativos o administradores en el sistema POS.
            </p>
          </div>
          <Link to="/dashboard/userList">
            <Button variant="outlined" size="md" leadingIcon="arrow_back">
              Volver al Listado
            </Button>
          </Link>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left: avatar de usuario */}
          <div className="md:col-span-4 xl:col-span-3 flex flex-col items-center p-5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]">
            <span className="text-center mb-3 text-[var(--md-sys-color-on-surface-variant)] text-label-lg font-medium">
              Foto de Perfil
            </span>
            <FileInput
              value={form.userImage}
              onChange={(files) => {
                setForm((prev) => ({ ...prev, userImage: files }));
                if (errors.userImage) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.userImage;
                    return next;
                  });
                }
              }}
              multiple={false}
              maxFiles={1}
              accept="image/*"
              shape="circle"
              altText={form.userName || "Nuevo usuario"}
            />
            {errors.userImage && (
              <span className="text-[var(--md-sys-color-error)] text-label-sm mt-2">{errors.userImage}</span>
            )}
          </div>

          {/* Right: form fields */}
          <div className="md:col-span-8 xl:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-5">
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
              label="Número de Documento"
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
              label="Número Telefónico"
              name="userPhone"
              type="tel"
              leadingIcon="call"
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
              leadingIcon="mail"
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
                  leadingIcon="lock"
                  value={form.userPassword}
                  onChange={handleChange}
                  placeholder="Mínimo 10 caracteres (Mayús, minús, núm, símbolo)"
                  htmlFor="user-password"
                  error={errors.userPassword}
                />
                <p className="text-body-sm text-[var(--md-sys-color-on-surface-variant)] mt-1.5">
                  Esta contraseña servirá para que el nuevo administrador ingrese al panel con su correo.
                </p>
              </div>
            ) : (
              <>
                <Input
                  label="PIN de Terminal POS (4 dígitos)"
                  name="pin"
                  type="password"
                  leadingIcon="key"
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

        <div className="w-full flex justify-end mt-auto pt-6 border-t border-[var(--md-sys-color-outline-variant)] gap-3">
          <Link to="/dashboard/userList">
            <Button
              variant="outlined"
              size="md"
              type="button"
            >
              Cancelar
            </Button>
          </Link>
          <Button variant="filled" size="md" type="submit" leadingIcon="check_circle" disabled={submitting}>
            {submitting ? "Creando..." : "Crear"}
          </Button>
        </div>
      </form>
    </div>
  );
}
