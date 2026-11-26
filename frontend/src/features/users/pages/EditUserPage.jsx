import { useEffect, useMemo, useState } from "react";
import { Input, Select, Button, FileInput, M3Icon, showSuccessAlert, showErrorAlert } from "@/shared";
import { getDocumentTypes } from "../../../services/selectServices";
import { updateUser } from "../../../services/userService";
import { createUserSchema } from "../schemas/userSchema";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getUserAvatar, imgWorkerCarlos } from "@/utils/imageHelper";
import { getStoredAuthUser, updateStoredAuthUser } from "@/shared/utils/authStorage";

export default function EditUser1() {
  const navigate = useNavigate();
  const location = useLocation();
  const editUser = useMemo(() => {
    if (location.state?.user) return location.state.user;
    try {
      return JSON.parse(sessionStorage.getItem("last_edited_user") || "null");
    } catch {
      return null;
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.user) {
      sessionStorage.setItem("last_edited_user", JSON.stringify(location.state.user));
    }
  }, [location.state]);

  // Verificar si el usuario activo tiene rol de Administrador
  const currentUser = getStoredAuthUser();

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
    if (raw.includes("proveed")) return "mesero";
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
    userImage: [],
  });

  const [errors, setErrors] = useState({});
  const [documentTypes, setDocumentTypes] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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
    if (submitting) return;

    // Si es admin y no ingresó nueva contraseña, usamos una temporal para pasar validación de esquema
    const formToValidate = {
      ...form,
      userImage: form.userImage?.length ? form.userImage : undefined,
    };
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

    setSubmitting(true);
    try {
      const imageFile = form.userImage?.length ? form.userImage[0] : undefined;

      const payload = {
        ...formToValidate,
        userImage: undefined,
        ...(imageFile ? { imageFile } : {}),
      };

      if (editUser?.id) {
        const res = await updateUser(editUser.id, payload);
        sessionStorage.removeItem("last_edited_user");
        sessionStorage.removeItem("last_viewed_user");

        // Si el administrador editó su propia cuenta, reflejar foto/nombre del backend al instante
        if (Number(currentUser?.id) === Number(editUser.id)) {
          const nextAvatar = res?.userAvatarUrl ?? res?.data?.userAvatarUrl ?? currentUser.userAvatarUrl;
          updateStoredAuthUser({
            name: payload.userName || currentUser.name,
            email: payload.userEmail || currentUser.email,
            ...(nextAvatar !== undefined ? { userAvatarUrl: nextAvatar, photo: nextAvatar } : {}),
          });
        }
      }
      setErrors({});
      await showSuccessAlert({
        title: "Usuario actualizado",
        text: "La información del colaborador ha sido actualizada correctamente en el sistema."
      });
      navigate("/dashboard/userList");
    } catch (err) {
      if (err?.isStepUpCancelled) return;
      await showErrorAlert({
        title: "Error al actualizar",
        text: err.message || "No se pudo actualizar el usuario en el servidor."
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
            La edición de usuarios solo está habilitada para el administrador central (<span className="text-[var(--md-sys-color-primary)] font-medium">admin@dpiero.com</span>).
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
              Editar Usuario
            </h1>
          </div>
          <Link to="/dashboard/userList">
            <Button variant="outlined" size="md" leadingIcon="arrow_back">
              Volver al Listado
            </Button>
          </Link>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left: foto actual con '+' superpuesto para cambiarla */}
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
              existingImageUrl={getUserAvatar(editUser)}
              fallbackImageUrl={imgWorkerCarlos}
              shape="circle"
              altText={form.userName || "Usuario"}
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

            {/* Si es Administrador: campo para actualizar contraseña. Si es Operativo: PIN y fechas */}
            {isRoleAdmin ? (
              <div className="md:col-span-2">
                <Input
                  label="Nueva Contraseña (dejar en blanco para conservar actual)"
                  name="userPassword"
                  type="password"
                  leadingIcon="lock"
                  value={form.userPassword}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  htmlFor="user-password"
                  error={errors.userPassword}
                />
                <p className="text-body-sm text-[var(--md-sys-color-on-surface-variant)] mt-1.5">
                  Ingrese una nueva contraseña únicamente si desea modificar las credenciales del administrador.
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
            {submitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </div>
  );
}