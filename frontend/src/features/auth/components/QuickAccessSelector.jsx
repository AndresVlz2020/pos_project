import { useState, useMemo } from "react";
import { SearchX, UserCheck } from "lucide-react";
import { SearchField } from "@/shared";
import { users } from "@/features/users/data/users";

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
  if (r.includes("cocin") || r.includes("parrill") || r.includes("brasa")) return "Cocinero";
  if (r.includes("admin")) return "Administrador";
  return role;
};

const QUICK_STAFF_IDS = [2, 3, 4, 5, 9, 11];

export default function QuickAccessSelector({ onSelectStaff }) {
  const [searchQuery, setSearchQuery] = useState("");

  const quickStaffList = useMemo(() => {
    return users.filter((u) => QUICK_STAFF_IDS.includes(u.id));
  }, []);

  const filteredStaffList = useMemo(() => {
    const query = normalizeText(searchQuery);
    if (!query) return [];

    return users.filter((u) => {
      const nameMatch = normalizeText(u.userName).includes(query);
      const roleMatch = normalizeText(formatRole(u.role)).includes(query);
      const docMatch = normalizeText(u.document_number).includes(query);
      return nameMatch || roleMatch || docMatch;
    });
  }, [searchQuery]);

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
          className="w-full border-[var(--color-primary-700)] hover:border-[var(--color-secondary-400)] shadow-none"
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
              className="text-[var(--color-secondary-400)] hover:underline cursor-pointer text-[11px]"
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
                  className="w-full p-3 rounded-xl border border-[var(--color-primary-800)] bg-[var(--color-primary-950)] hover:bg-[var(--color-primary-800)] hover:border-[var(--color-secondary-400)] text-left transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99] group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[var(--color-white)] group-hover:text-[var(--color-secondary-300)] transition-colors truncate">
                      {staff.userName}
                    </p>
                    <p className="text-[11px] text-[var(--color-gray-400)] truncate mt-0.5">
                      <span className="text-[var(--color-secondary-300)] font-medium">
                        {formatRole(staff.role)}
                      </span>{" "}
                      • Doc: {staff.document_type} {staff.document_number}
                    </p>
                  </div>
                  <UserCheck className="size-4 text-[var(--color-gray-500)] group-hover:text-[var(--color-secondary-400)] shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] rounded-xl p-4">
              <SearchX className="size-8 mx-auto text-[var(--color-secondary-400)] mb-2" />
              <p className="text-xs font-bold text-[var(--color-white)]">
                Sin coincidencias en la plantilla
              </p>
              <p className="text-[11px] text-[var(--color-gray-400)] mt-0.5 mb-3">
                No se encontró ningún colaborador con "{searchQuery}".
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-[var(--color-secondary-400)] hover:underline font-semibold cursor-pointer"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quickStaffList.map((staff) => (
              <button
                key={staff.id}
                type="button"
                onClick={() => onSelectStaff(staff)}
                className="p-3.5 rounded-xl border border-[var(--color-primary-800)] bg-[var(--color-primary-950)] hover:bg-[var(--color-primary-800)] hover:border-[var(--color-secondary-400)] text-left transition-all cursor-pointer active:scale-[0.98] group"
              >
                <p className="text-xs font-bold text-[var(--color-white)] group-hover:text-[var(--color-secondary-300)] transition-colors truncate">
                  {staff.userName}
                </p>
                <p className="text-[11px] text-[var(--color-secondary-400)] font-medium truncate mt-1">
                  {formatRole(staff.role)}
                </p>
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
