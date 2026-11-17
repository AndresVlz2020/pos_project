import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, M3Icon } from "@/shared";
import { getUserAvatar, imgWorkerCarlos } from "@/utils/imageHelper";

export default function ReadUser1() {
  const location = useLocation();

  const user =
    location.state?.user ||
    (() => {
      try {
        return JSON.parse(sessionStorage.getItem("last_viewed_user") || "null");
      } catch {
        return null;
      }
    })() || {
      id: "1",
      userName: "Administrador General",
      userDocumentNumber: "1085678456",
      userPhone: "3001234567",
      userDocumentTypes: "CC",
      userEmail: "admin@dpiero.com",
      role: "Administrador",
      status: "Activo",
    };

  useEffect(() => {
    if (location.state?.user) {
      sessionStorage.setItem("last_viewed_user", JSON.stringify(location.state.user));
    }
  }, [location.state]);

  const userPhoto = getUserAvatar(user);
  const roleName = user?.role || user?.userType || (user?.isSuperUser ? "Administrador" : "Mesero");
  const isUserActive = user?.isActive ?? (user?.status === "Activo" || true);
  const statusText = isUserActive ? "Activo" : "Inactivo";

  return (
    <div className="flex-1 flex flex-col w-full font-[family-name:var(--main-font)]">
      <div className="flex-1 flex flex-col w-full bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-5 sm:p-8 m3-elevation-1 text-[var(--md-sys-color-on-surface)]">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[var(--md-sys-color-outline-variant)]">
          <div>
            <h1 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
              Ver Usuario
            </h1>
          </div>
          <Link to="/dashboard/userList">
            <Button variant="outlined" size="md" leadingIcon="arrow_back">
              Volver al Listado
            </Button>
          </Link>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          <div className="md:col-span-4 xl:col-span-3 flex flex-col items-center p-5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]">
            <img
              src={userPhoto}
              alt={user?.userName}
              className="rounded-full border-2 border-[var(--md-sys-color-outline-variant)] size-36 sm:size-44 object-cover m3-elevation-1"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = imgWorkerCarlos;
              }}
            />
            <span className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-label-md font-medium bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
              {roleName}
            </span>
          </div>

          <div className="md:col-span-8 xl:col-span-9 flex flex-col p-5 sm:p-6 gap-y-4 bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl w-full">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
              <h2 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                {user?.userName}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-label-sm font-medium border ${
                  isUserActive
                    ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)]/40"
                    : "bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)]"
                }`}
              >
                <M3Icon name={isUserActive ? "check_circle" : "cancel"} size={14} />
                {statusText}
              </span>
            </div>

            <div className="text-body-md grid grid-cols-1 sm:grid-cols-2 gap-4 text-[var(--md-sys-color-on-surface-variant)]">
              <div>
                <span className="text-label-md block">ID de Sistema</span>
                <span className="font-semibold text-[var(--md-sys-color-on-surface)] font-mono">
                  #{user?.id}
                </span>
              </div>
              <div>
                <span className="text-label-md block">Documento ({user?.userDocumentTypes || "CC"})</span>
                <span className="font-semibold text-[var(--md-sys-color-on-surface)] font-mono">
                  {user?.userDocumentNumber || "—"}
                </span>
              </div>
              <div>
                <span className="text-label-md block">Rol Asignado</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--md-sys-color-on-surface)] mt-0.5">
                  <M3Icon name="shield" size={16} className="text-[var(--md-sys-color-primary)]" />
                  {roleName}
                </span>
              </div>
              <div>
                <span className="text-label-md block">Teléfono</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[var(--md-sys-color-on-surface)] mt-0.5">
                  <M3Icon name="call" size={16} className="text-[var(--md-sys-color-primary)]" />
                  {user?.userPhone || "No registrado"}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-label-md block">Correo Electrónico</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-[var(--md-sys-color-on-surface)] mt-0.5">
                  <M3Icon name="mail" size={16} className="text-[var(--md-sys-color-primary)]" />
                  {user?.userEmail}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-end mt-auto pt-6 border-t border-[var(--md-sys-color-outline-variant)]">
          <Link to="/dashboard/userList">
            <Button variant="outlined" size="md" leadingIcon="arrow_back">
              Volver al Listado
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
