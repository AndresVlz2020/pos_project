import { useState, useEffect, useMemo } from "react";
import { SearchX, UserCheck } from "lucide-react";
import { SearchField } from "@/shared";
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
      src={staff?.photo || staff?.userAvatarUrl || getUserAvatar(staff)}
      alt={staff?.userName || staff?.name || "Colaborador"}
      className={`${sizeClass} rounded-full object-cover border border-[var(--color-secondary-700)] shrink-0`}
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
        <h2 className="text-base font-bold text-[var(--color-white)]">
          Selecciona tu Perfil de Turno
        </h2>
        <p className="text-xs text-[var(--color-gray-400)] mt-0.5">
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
          variant="dark"
          fullWidth={true}
          className="w-full border-[var(--color-secondary-700)] hover:border-[var(--color-primary-400)] shadow-none"
        />
      </div>

      {isSearching ? (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[var(--color-gray-300)] font-medium">
              Resultados encontrados ({filteredStaffList.length})
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[var(--color-primary-400)] hover:underline cursor-pointer text-[11px]"
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
                  className="w-full p-3 rounded-xl border border-[var(--color-secondary-800)] bg-[var(--color-secondary-950)] hover:bg-[var(--color-secondary-800)] hover:border-[var(--color-primary-400)] text-left transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99] group"
                >
                  <StaffAvatar staff={staff} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[var(--color-white)] group-hover:text-[var(--color-primary-300)] transition-colors truncate">
                      {staff.userName || staff.name}
                    </p>
                    <p className="text-[11px] text-[var(--color-gray-400)] truncate mt-0.5">
                      <span className="text-[var(--color-primary-300)] font-medium">
                        {formatRole(staff.role || staff.userType)}
                      </span>{" "}
                      • Doc: {staff.userDocumentTypes || staff.document_type}{" "}
                      {staff.userDocumentNumber || staff.document_number}
                    </p>
                  </div>
                  <UserCheck className="size-4 text-[var(--color-gray-500)] group-hover:text-[var(--color-primary-400)] shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] rounded-xl p-4">
              <SearchX className="size-8 mx-auto text-[var(--color-primary-400)] mb-2" />
              <p className="text-xs font-bold text-[var(--color-white)]">
                Sin coincidencias en la plantilla
              </p>
              <p className="text-[11px] text-[var(--color-gray-400)] mt-0.5 mb-3">
                No se encontró ningún colaborador activo con "{searchQuery}".
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-[var(--color-primary-400)] hover:underline font-semibold cursor-pointer"
              >
                Restablecer búsqueda
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-center text-xs px-0.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-gray-300)]">
              Acceso Rápido
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {quickStaffList.map((staff) => (
              <button
                key={staff.id}
                type="button"
                onClick={() => onSelectStaff(staff)}
                className="p-3 rounded-xl border border-[var(--color-secondary-800)] bg-[var(--color-secondary-950)] hover:bg-[var(--color-secondary-800)] hover:border-[var(--color-primary-400)] text-left transition-all cursor-pointer active:scale-[0.98] group flex items-center gap-2.5"
              >
                <StaffAvatar staff={staff} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--color-white)] group-hover:text-[var(--color-primary-300)] transition-colors truncate">
                    {staff.userName || staff.name}
                  </p>
                  <p className="text-[11px] text-[var(--color-primary-400)] font-medium truncate mt-0.5">
                    {formatRole(staff.role || staff.userType)}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <p className="text-[11px] text-center text-[var(--color-gray-500)] pt-1">
            ¿No apareces en esta lista? Escribe tu nombre o documento en el buscador superior.
          </p>
        </div>
      )}
    </div>
  );
}
