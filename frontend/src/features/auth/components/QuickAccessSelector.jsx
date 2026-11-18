import { useState, useEffect, useMemo } from "react";
import M3Icon from "@/shared/components/M3Icon";
import SearchField from "@/shared/components/SearchField";
import { getUsers } from "@/services/userService";
import { formatRole, getUserAvatar, imgWorkerCarlos } from "@/utils/avatarHelper";

const normalizeText = (text = "") =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export function StaffAvatar({ staff, sizeClass = "size-9" }) {
  return (
    <img
      src={getUserAvatar(staff)}
      alt={staff?.userName || staff?.name || "Colaborador"}
      width={36}
      height={36}
      decoding="async"
      className={`${sizeClass} rounded-full object-cover border border-[var(--md-sys-color-outline-variant)] shrink-0`}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = imgWorkerCarlos;
      }}
    />
  );
}

export default function QuickAccessSelector({ onSelectStaff }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [staffUsers, setStaffUsers] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  useEffect(() => {
    let active = true;
    getUsers({ activeOnly: true })
      .then(async (data) => {
        if (!active) return;
        if (Array.isArray(data) && data.length > 0) {
          const operationalActive = data.filter((u) => {
            const isActive = Boolean(u.isActive ?? u.is_active ?? true);
            const roleText = (u.userType || u.role || "").toLowerCase();
            const isAdmin = Boolean(u.isSuperUser || u.is_superuser || roleText === "admin" || roleText === "administrador");
            return isActive && !isAdmin;
          });
          if (operationalActive.length > 0) {
            setStaffUsers(operationalActive);
            return;
          }
        }
        const { users: fallbackUsers } = await import("@/features/users/data/users");
        if (active) {
          setStaffUsers(
            fallbackUsers.filter((u) => u.isActive !== false && u.role !== "Administrador")
          );
        }
      })
      .catch(async () => {
        if (!active) return;
        const { users: fallbackUsers } = await import("@/features/users/data/users");
        if (active) {
          setStaffUsers(
            fallbackUsers.filter((u) => u.isActive !== false && u.role !== "Administrador")
          );
        }
      })
      .finally(() => {
        if (active) setLoadingStaff(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const quickStaffList = useMemo(() => {
    return staffUsers.slice(0, 4);
  }, [staffUsers]);

  const filteredStaffList = useMemo(() => {
    const query = normalizeText(searchQuery);
    if (!query) return [];

    return staffUsers.filter((u) => {
      const nameMatch = normalizeText(u.userName || u.name).includes(query);
      const roleMatch = normalizeText(formatRole(u.role || u.userType)).includes(query);
      const docMatch = normalizeText(u.userDocumentNumber || u.document_number).includes(query);
      return nameMatch || roleMatch || docMatch;
    });
  }, [searchQuery, staffUsers]);

  const isSearching = Boolean(searchQuery.trim());

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h2 className="text-title-md font-semibold text-[var(--md-sys-color-on-surface)]">
          Selecciona tu Perfil de Turno
        </h2>
        <p className="text-sm leading-5 text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
          Elige tu usuario frecuente o búscate en la lista general.
        </p>
      </div>

      <div>
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={setSearchQuery}
          onClear={() => setSearchQuery("")}
          placeholder="Buscar por nombre, cargo o documento..."
          size="md"
          variant="filled"
          fullWidth={true}
          className="w-full min-h-[48px]"
        />
      </div>

      {isSearching ? (
        <div className="space-y-3 pt-0.5">
          <div className="flex items-center justify-between text-sm px-1">
            <span className="text-[var(--md-sys-color-on-surface-variant)] font-medium">
              Resultados encontrados ({filteredStaffList.length})
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="m3-state min-h-[40px] px-3 rounded-full text-[var(--md-sys-color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer text-sm font-medium"
            >
              Limpiar filtro
            </button>
          </div>

          {filteredStaffList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredStaffList.map((staff) => (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => onSelectStaff(staff)}
                  className="m3-state w-full px-3.5 py-2.5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] hover:border-[var(--md-sys-color-primary)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <StaffAvatar staff={staff} />
                  <div className="min-w-0 flex-1">
                    <p className="text-title-sm font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                      {staff.userName || staff.name}
                    </p>
                    <p className="text-sm leading-5 text-[var(--md-sys-color-on-surface-variant)] truncate mt-0.5">
                      <span className="text-[var(--md-sys-color-primary)] font-medium">
                        {formatRole(staff.role || staff.userType)}
                      </span>{" "}
                      • {staff.userDocumentNumber || staff.document_number}
                    </p>
                  </div>
                  <M3Icon name="person_check" size={18} className="text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)] shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-4">
              <M3Icon name="search_off" size={32} className="mx-auto text-[var(--md-sys-color-primary)] mb-2" />
              <p className="text-title-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                Sin coincidencias en la plantilla
              </p>
              <p className="text-sm leading-5 text-[var(--md-sys-color-on-surface-variant)] mt-0.5 mb-3">
                No se encontró ningún colaborador activo con &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="m3-state min-h-[40px] px-4 rounded-full text-sm text-[var(--md-sys-color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] font-medium cursor-pointer"
              >
                Restablecer búsqueda
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 pt-0.5">
          <div className="flex items-center justify-center px-0.5">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              Acceso Rápido
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 min-h-[148px]">
            {loadingStaff ? (
              [0, 1, 2, 3].map((slot) => (
                <div
                  key={slot}
                  aria-hidden="true"
                  className="h-[66px] px-3.5 py-2.5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] flex items-center gap-2.5 animate-pulse"
                >
                  <div className="size-9 rounded-full bg-[var(--md-sys-color-surface-container-high)] shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-3/4 rounded bg-[var(--md-sys-color-surface-container-high)]" />
                    <div className="h-3 w-1/2 rounded bg-[var(--md-sys-color-surface-container)]" />
                  </div>
                </div>
              ))
            ) : (
              quickStaffList.map((staff) => (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => onSelectStaff(staff)}
                  className="m3-state h-[66px] px-3.5 py-2.5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] hover:border-[var(--md-sys-color-primary)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] transition-colors cursor-pointer group flex items-center gap-2.5"
                >
                  <StaffAvatar staff={staff} />
                  <div className="min-w-0 flex-1">
                    <p className="text-title-sm font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                      {staff.userName || staff.name}
                    </p>
                    <p className="text-sm leading-5 text-[var(--md-sys-color-primary)] font-medium truncate">
                      {formatRole(staff.role || staff.userType)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          <p className="min-h-[40px] flex items-center justify-center text-sm leading-5 text-center text-[var(--md-sys-color-on-surface-variant)] pt-0.5">
            ¿No apareces en esta lista? Escribe tu nombre o documento en el buscador superior.
          </p>
        </div>
      )}
    </div>
  );
}
