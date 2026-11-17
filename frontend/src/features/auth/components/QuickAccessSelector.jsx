import { useState, useEffect, useMemo } from "react";
import { M3Icon, SearchField } from "@/shared";
import { users as fallbackUsers } from "@/features/users/data/users";
import { getUsers } from "@/services/userService";
import { getUserAvatar, imgWorkerCarlos } from "@/utils/imageHelper";

const normalizeText = (text = "") =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const formatRole = (role = "") => {
  const r = role.toLowerCase();
  if (r.includes("caj")) return "Cajero";
  if (r.includes("meser") || r.includes("salon")) return "Mesero";
  if (r.includes("cocin") || r.includes("parrill") || r.includes("brasa")) return "Cocina";
  if (r.includes("admin")) return "Administrador";
  return role || "Mesero";
};

export function StaffAvatar({ staff, sizeClass = "size-9" }) {
  return (
    <img
      src={getUserAvatar(staff)}
      alt={staff?.userName || staff?.name || "Colaborador"}
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

  useEffect(() => {
    getUsers({ activeOnly: true })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const operationalActive = data.filter((u) => {
            const isActive = Boolean(u.isActive ?? u.is_active ?? true);
            const roleText = (u.userType || u.role || "").toLowerCase();
            const isAdmin = Boolean(u.isSuperUser || u.is_superuser || roleText === "admin" || roleText === "administrador");
            return isActive && !isAdmin;
          });
          setStaffUsers(operationalActive);
        } else {
          setStaffUsers(
            fallbackUsers.filter((u) => u.isActive !== false && u.role !== "Administrador")
          );
        }
      })
      .catch(() => {
        setStaffUsers(
          fallbackUsers.filter((u) => u.isActive !== false && u.role !== "Administrador")
        );
      });
  }, []);

  const quickStaffList = useMemo(() => {
    return staffUsers;
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
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-title-md font-semibold text-[var(--md-sys-color-on-surface)]">
          Selecciona tu Perfil de Turno
        </h2>
        <p className="text-body-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
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
          size="sm"
          variant="filled"
          fullWidth={true}
          className="w-full"
        />
      </div>

      {isSearching ? (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-label-md px-1">
            <span className="text-[var(--md-sys-color-on-surface-variant)] font-medium">
              Resultados encontrados ({filteredStaffList.length})
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="m3-state min-h-[40px] px-3 rounded-full text-[var(--md-sys-color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer text-label-lg font-medium"
            >
              Limpiar filtro
            </button>
          </div>

          {filteredStaffList.length > 0 ? (
            <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
              {filteredStaffList.map((staff) => (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => onSelectStaff(staff)}
                  className="m3-state w-full p-3 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] hover:border-[var(--md-sys-color-primary)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <StaffAvatar staff={staff} />
                  <div className="min-w-0 flex-1">
                    <p className="text-title-sm font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                      {staff.userName || staff.name}
                    </p>
                    <p className="text-body-sm text-[var(--md-sys-color-on-surface-variant)] truncate mt-0.5">
                      <span className="text-[var(--md-sys-color-primary)] font-medium">
                        {formatRole(staff.role || staff.userType)}
                      </span>{" "}
                      • Doc: {staff.userDocumentTypes || staff.document_type}{" "}
                      {staff.userDocumentNumber || staff.document_number}
                    </p>
                  </div>
                  <M3Icon name="person_check" size={18} className="text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)] shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-4">
              <M3Icon name="search_off" size={32} className="mx-auto text-[var(--md-sys-color-primary)] mb-2" />
              <p className="text-title-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                Sin coincidencias en la plantilla
              </p>
              <p className="text-body-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5 mb-3">
                No se encontró ningún colaborador activo con &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="m3-state min-h-[40px] px-4 rounded-full text-label-lg text-[var(--md-sys-color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] font-medium cursor-pointer"
              >
                Restablecer búsqueda
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-center px-0.5">
            <span className="inline-flex items-center gap-1.5 text-label-md font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              Acceso Rápido
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {quickStaffList.map((staff) => (
              <button
                key={staff.id}
                type="button"
                onClick={() => onSelectStaff(staff)}
                className="m3-state p-3 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] hover:border-[var(--md-sys-color-primary)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] transition-colors cursor-pointer group flex items-center gap-2.5"
              >
                <StaffAvatar staff={staff} />
                <div className="min-w-0 flex-1">
                  <p className="text-title-sm font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                    {staff.userName || staff.name}
                  </p>
                  <p className="text-label-md text-[var(--md-sys-color-primary)] font-medium truncate mt-0.5">
                    {formatRole(staff.role || staff.userType)}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <p className="text-body-sm text-center text-[var(--md-sys-color-on-surface-variant)] pt-1">
            ¿No apareces en esta lista? Escribe tu nombre o documento en el buscador superior.
          </p>
        </div>
      )}
    </div>
  );
}
