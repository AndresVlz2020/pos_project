import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";
import FileInput from "./FileInput";
import M3Icon from "./M3Icon";
import { IconButton } from "./IconButton";
import { getMyProfileApi, updateMyProfileApi } from "@/services/authService";
import { getDocumentTypes } from "@/services/selectServices";
import { getUserAvatar, imgWorkerCarlos } from "@/utils/imageHelper";
import { updateStoredAuthUser } from "@/shared/utils/authStorage";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatShortDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return String(val).slice(0, 10);
  return d.toLocaleDateString("es-CO");
}

/**
 * Modal de Perfil Propio:
 * - Cualquier usuario autenticado puede consultar sus datos y ver el correo de soporte.
 * - Solo el Administrador puede editar su propio perfil y modificar el correo de soporte global.
 */
export default function UserProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [supportEmail, setSupportEmail] = useState("soporte@dpiero.com");
  const [canEdit, setCanEdit] = useState(false);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [avatarFiles, setAvatarFiles] = useState([]);
  const [form, setForm] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
    userDocumentTypes: "CC",
    userDocumentNumber: "",
    userPassword: "",
    supportEmail: "soporte@dpiero.com",
  });
  const [feedback, setFeedback] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    Promise.resolve().then(() => {
      if (!active) return;
      setLoading(true);
      setFeedback(null);
      setFieldErrors({});
      setAvatarFiles([]);

      Promise.all([getMyProfileApi(), getDocumentTypes().catch(() => [])])
        .then(([res, docs]) => {
          if (!active) return;
          const p = res?.profile || null;
          const sup = res?.supportEmail || "soporte@dpiero.com";
          setProfile(p);
          setSupportEmail(sup);
          setCanEdit(Boolean(res?.canEditProfile));
          setDocumentTypes(
            Array.isArray(docs) && docs.length > 0
              ? docs
              : [
                  { value: "CC", label: "Cédula de Ciudadanía (CC)" },
                  { value: "CE", label: "Cédula de Extranjería (CE)" },
                  { value: "TI", label: "Tarjeta de Identidad (TI)" },
                  { value: "NIT", label: "NIT" },
                ]
          );
          if (p) {
            setForm({
              userName: p.userName || "",
              userEmail: p.userEmail || "",
              userPhone: p.userPhone || "",
              userDocumentTypes: p.userDocumentTypes || "CC",
              userDocumentNumber: p.userDocumentNumber || "",
              userPassword: "",
              supportEmail: sup,
            });
          }
        })
        .catch((err) => {
          if (!active) return;
          setFeedback({
            type: "error",
            text: err.message || "No se pudo cargar la información del perfil.",
          });
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });

    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, saving]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canEdit || saving) return;

    const errs = {};
    if (!form.userName || form.userName.trim().length < 3) {
      errs.userName = "El nombre debe tener al menos 3 caracteres.";
    }
    if (!EMAIL_RE.test(String(form.userEmail || "").trim())) {
      errs.userEmail = "Ingresa un correo electrónico válido.";
    }
    if (!EMAIL_RE.test(String(form.supportEmail || "").trim())) {
      errs.supportEmail = "Ingresa un correo de soporte válido.";
    }
    if (form.userPassword && form.userPassword.trim() !== "") {
      const pwd = form.userPassword;
      if (
        pwd.length < 10 ||
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(pwd)
      ) {
        errs.userPassword =
          "Mínimo 10 caracteres incluyendo mayúscula, minúscula, número y símbolo.";
      }
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const imageFile = avatarFiles.length ? avatarFiles[0] : undefined;
      const res = await updateMyProfileApi({
        userName: form.userName.trim(),
        userEmail: form.userEmail.trim().toLowerCase(),
        userPhone: form.userPhone.trim(),
        userDocumentTypes: form.userDocumentTypes,
        userDocumentNumber: form.userDocumentNumber.trim(),
        supportEmail: form.supportEmail.trim().toLowerCase(),
        ...(form.userPassword.trim() ? { userPassword: form.userPassword } : {}),
        ...(imageFile ? { imageFile } : {}),
      });

      const updatedProfile = res?.profile || profile;
      const nextSupport = res?.supportEmail || form.supportEmail.trim().toLowerCase();
      setProfile(updatedProfile);
      setSupportEmail(nextSupport);
      setAvatarFiles([]);
      setForm((prev) => ({
        ...prev,
        userPassword: "",
        supportEmail: nextSupport,
      }));

      if (updatedProfile) {
        const stored = updateStoredAuthUser({
          name: updatedProfile.userName,
          email: updatedProfile.userEmail,
          userAvatarUrl: updatedProfile.userAvatarUrl,
          photo: updatedProfile.userAvatarUrl,
        });
        window.dispatchEvent(
          new CustomEvent("dpiero:user-profile-updated", { detail: stored })
        );
        window.dispatchEvent(
          new CustomEvent("dpiero:settings-updated", {
            detail: { supportEmail: nextSupport },
          })
        );
        onProfileUpdated?.(stored);
      }

      setFeedback({
        type: "success",
        text: "Perfil y correo de soporte actualizados correctamente.",
      });
    } catch (err) {
      if (err?.isStepUpCancelled) return;
      setFeedback({
        type: "error",
        text: err.message || "No se pudieron guardar los cambios del perfil.",
      });
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl = getUserAvatar(profile || {});

  return createPortal(
    <div
      className="fixed inset-0 z-[105] flex items-center justify-center p-3 sm:p-4 bg-[var(--md-sys-color-scrim)] backdrop-blur-xs font-[family-name:var(--main-font)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-profile-modal-title"
      onClick={() => {
        if (!saving) onClose?.();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="dpiero-modal-in w-full max-w-2xl max-h-[92dvh] flex flex-col rounded-[28px] bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] m3-elevation-3 text-[var(--md-sys-color-on-surface)] overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
              <M3Icon name="badge" size={20} />
            </div>
            <div className="min-w-0">
              <h2
                id="user-profile-modal-title"
                className="text-lg sm:text-xl font-semibold text-[var(--md-sys-color-on-surface)] truncate"
              >
                Mi Perfil
              </h2>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
                {canEdit
                  ? "Administrador · Puedes editar tus datos y el correo de soporte"
                  : "Consulta de perfil personal (solo lectura)"}
              </p>
            </div>
          </div>

          <IconButton
            ariaLabel="Cerrar perfil"
            variant="standard"
            onClick={() => {
              if (!saving) onClose?.();
            }}
          >
            <M3Icon name="close" size={20} />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {loading ? (
            <div className="py-12 flex items-center justify-center gap-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
              <M3Icon name="progress_activity" size={20} className="animate-spin text-[var(--md-sys-color-primary)]" />
              <span>Cargando perfil...</span>
            </div>
          ) : (
            <>
              {feedback && (
                <div
                  className={`rounded-xl px-4 py-3 text-xs sm:text-sm font-medium border ${
                    feedback.type === "success"
                      ? "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-border)]"
                      : "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border-[var(--color-error-border)]"
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              {canEdit ? (
                <form onSubmit={handleSave} className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]">
                    <FileInput
                      value={avatarFiles}
                      onChange={setAvatarFiles}
                      multiple={false}
                      maxFiles={1}
                      accept="image/*"
                      existingImageUrl={avatarUrl}
                      fallbackImageUrl={imgWorkerCarlos}
                      shape="circle"
                      altText={form.userName || "Administrador"}
                    />
                    <div className="flex-1 text-center sm:text-left min-w-0 space-y-1">
                      <p className="text-base font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                        {profile?.userName || form.userName}
                      </p>
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
                        {profile?.role || "Administrador"}
                      </span>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] pt-1">
                        Toca o arrastra sobre tu foto para actualizar el avatar.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nombre Completo"
                      name="userName"
                      value={form.userName}
                      onChange={handleChange}
                      error={fieldErrors.userName}
                    />
                    <Input
                      label="Correo de Acceso"
                      name="userEmail"
                      type="email"
                      leadingIcon="mail"
                      value={form.userEmail}
                      onChange={handleChange}
                      error={fieldErrors.userEmail}
                    />
                    <Select
                      label="Tipo de Documento"
                      name="userDocumentTypes"
                      options={documentTypes}
                      value={form.userDocumentTypes}
                      onChange={handleChange}
                    />
                    <Input
                      label="Número de Documento"
                      name="userDocumentNumber"
                      value={form.userDocumentNumber}
                      onChange={handleChange}
                    />
                    <Input
                      label="Teléfono"
                      name="userPhone"
                      type="tel"
                      leadingIcon="call"
                      value={form.userPhone}
                      onChange={handleChange}
                    />
                    <Input
                      label="Nueva Contraseña (opcional)"
                      name="userPassword"
                      type="password"
                      leadingIcon="lock"
                      value={form.userPassword}
                      onChange={handleChange}
                      placeholder="Dejar en blanco para conservar"
                      error={fieldErrors.userPassword}
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                      <M3Icon name="support_agent" size={18} className="text-[var(--md-sys-color-primary)]" />
                      <span>Configuración de Soporte Público</span>
                    </div>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      Este correo se muestra en la pantalla de inicio para usuarios no registrados y en el perfil de todos los colaboradores.
                    </p>
                    <Input
                      label="Correo de Soporte"
                      name="supportEmail"
                      type="email"
                      leadingIcon="mail"
                      value={form.supportEmail}
                      onChange={handleChange}
                      placeholder="soporte@dpiero.com"
                      error={fieldErrors.supportEmail}
                    />
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                    <Button
                      type="button"
                      variant="text"
                      onClick={onClose}
                      disabled={saving}
                    >
                      Cerrar
                    </Button>
                    <Button
                      type="submit"
                      variant="filled"
                      leadingIcon="check_circle"
                      disabled={saving}
                    >
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]">
                    <img
                      src={avatarUrl}
                      alt={profile?.userName || "Usuario"}
                      className="size-24 rounded-full object-cover border-2 border-[var(--md-sys-color-outline-variant)] shrink-0"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = imgWorkerCarlos;
                      }}
                    />
                    <div className="flex-1 text-center sm:text-left min-w-0 space-y-1.5">
                      <h3 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                        {profile?.userName || "Colaborador"}
                      </h3>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
                          {profile?.role || "Colaborador"}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]">
                          <M3Icon name="lock" size={13} />
                          Solo lectura
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-sm">
                    <div>
                      <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block">
                        Correo Electrónico
                      </span>
                      <span className="font-medium text-[var(--md-sys-color-on-surface)] break-all">
                        {profile?.userEmail || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block">
                        Teléfono
                      </span>
                      <span className="font-medium font-mono text-[var(--md-sys-color-on-surface)]">
                        {profile?.userPhone || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block">
                        Documento ({profile?.userDocumentTypes || "CC"})
                      </span>
                      <span className="font-medium font-mono text-[var(--md-sys-color-on-surface)]">
                        {profile?.userDocumentNumber || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block">
                        Contrato / Vigencia
                      </span>
                      <span className="font-medium text-[var(--md-sys-color-on-surface)]">
                        {profile?.startDate
                          ? `${formatShortDate(profile.startDate)} — ${formatShortDate(profile.endDate)}`
                          : "Activo en sistema"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <M3Icon name="support_agent" size={20} className="text-[var(--md-sys-color-primary)] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                          Correo de soporte (para solicitar cambios o asistencia)
                        </p>
                        <a
                          href={`mailto:${supportEmail}`}
                          className="text-sm font-semibold text-[var(--md-sys-color-primary)] hover:underline break-all"
                        >
                          {supportEmail}
                        </a>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] text-center">
                    Tu perfil es informativo. Solo el Administrador puede modificar tus datos personales.
                  </p>

                  <div className="flex justify-end pt-1">
                    <Button type="button" variant="filled" onClick={onClose}>
                      Cerrar
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
