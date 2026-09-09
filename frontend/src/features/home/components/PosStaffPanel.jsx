import { useState } from "react";
import { Users, Clock, RefreshCw, UserPlus } from "lucide-react";
import { posStaff } from "../data/posMockData";
import PosSectionHeader from "./PosSectionHeader";
import PosCardGrid from "./PosCardGrid";
import PosInfoCard from "./PosInfoCard";

const INITIAL_STAFF_STATUS = {
  "st-01": "En Caja",
  "st-02": "En Servicio",
  "st-03": "En Servicio",
  "st-04": "En Pausa"
};

export default function PosStaffPanel() {
  const [query, setQuery] = useState("");
  const [staffStatus, setStaffStatus] = useState(INITIAL_STAFF_STATUS);

  const handleToggleStatus = (member) => {
    setStaffStatus((prev) => {
      const current = prev[member.id] || "En Servicio";
      let nextStatus = "En Servicio";

      if (current === "En Caja") {
        nextStatus = "En Pausa";
      } else if (current === "En Pausa") {
        nextStatus = "En Servicio";
      } else {
        nextStatus = "En Caja";
      }

      return {
        ...prev,
        [member.id]: nextStatus
      };
    });
  };

  const filtered = posStaff.filter((member) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      member.name.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q) ||
      member.station.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <PosSectionHeader
        icon={Users}
        title="Personal en Turno"
        subtitle="Monitoreo y control del equipo de atención, cocina y barra en servicio activo."
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar por nombre, cargo o estación..."
        actionLabel="Nuevo Personal"
        actionIcon={UserPlus}
        actionLink="/dashboard/userList"
      />

      <PosCardGrid emptyMessage="No se encontraron colaboradores con ese criterio.">
        {filtered.map((member) => {
          const currentStatus = staffStatus[member.id] || "En Servicio";

          return (
            <PosInfoCard
              key={member.id}
              tagLeft={member.station}
              tagRight={currentStatus}
              title={member.name}
              subtitle={member.role}
              bottomIcon={Clock}
              bottomText={member.shift}
              actionIcon={RefreshCw}
              actionLabel="Cambiar Turno"
              onActionClick={() => handleToggleStatus(member)}
              actionAriaLabel={`Cambiar turno de ${member.name}`}
            />
          );
        })}
      </PosCardGrid>
    </div>
  );
}
