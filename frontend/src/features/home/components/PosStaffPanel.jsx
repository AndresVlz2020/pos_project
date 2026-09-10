import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Card, Button, SearchField } from "@/shared";
import { posStaff } from "../data/posMockData";

export default function PosStaffPanel() {
  const [query, setQuery] = useState("");
  const [staffStatuses, setStaffStatuses] = useState(() =>
    posStaff.reduce((acc, member) => {
      acc[member.id] = member.status || "En Servicio";
      return acc;
    }, {})
  );

  const handleToggleStatus = (memberId) => {
    setStaffStatuses((prev) => {
      const current = prev[memberId] || "En Servicio";
      let nextStatus = "En Servicio";
      if (current === "En Servicio") nextStatus = "En Caja";
      else if (current === "En Caja") nextStatus = "En Pausa";
      else nextStatus = "En Servicio";

      return {
        ...prev,
        [memberId]: nextStatus,
      };
    });
  };

  const filtered = posStaff.filter((member) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const currentStatus = staffStatuses[member.id] || member.status;
    return (
      member.name.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q) ||
      member.station.toLowerCase().includes(q) ||
      member.phone.includes(q) ||
      currentStatus.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-[family-name:var(--main-font)]">

        <div className="w-full sm:w-72">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Buscar por colaborador / cargo..."
            size="sm"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((member) => {
            const currentStatus = staffStatuses[member.id] || member.status;

            return (
              <Card key={member.id} className="p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--color-gray-400)] mb-1.5">
                    <span className="font-mono">{member.station}</span>
                    <span className="font-semibold text-[var(--color-secondary-500)]">
                      {currentStatus}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--color-white)] line-clamp-1">
                    {member.name}
                  </h4>
                  <p className="text-xs text-[var(--color-gray-400)] mt-1">Cargo: {member.role}</p>
                  <p className="text-xs text-[var(--color-gray-400)]">Turno: {member.shift}</p>
                  <p className="text-xs text-[var(--color-gray-400)]">Tel: {member.phone}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--color-primary-800)] flex justify-end">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleToggleStatus(member.id)}
                  >
                    <RefreshCw className="size-3.5 mr-1" />
                    Cambiar Turno
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center rounded-lg border border-[var(--color-primary-800)] bg-[var(--color-primary-900)] p-6">
          <p className="text-xs text-[var(--color-gray-400)]">
            No se encontró personal con el criterio de búsqueda.
          </p>
        </div>
      )}
    </div>
  );
}
