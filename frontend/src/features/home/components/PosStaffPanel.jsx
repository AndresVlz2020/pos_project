import { useState } from "react";
import { Users, Clock, UserPlus } from "lucide-react";
import { posStaff } from "../data/posMockData";
import PosSectionHeader from "./PosSectionHeader";
import PosCardGrid from "./PosCardGrid";
import PosInfoCard from "./PosInfoCard";

export default function PosStaffPanel() {
  const [query, setQuery] = useState("");

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
        subtitle="Visualización informativa del equipo de atención, cocina y barra en servicio activo."
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar por nombre, cargo o estación..."
        actionLabel="Administrar Personal"
        actionIcon={UserPlus}
        actionLink="/dashboard/userList"
      />

      <PosCardGrid emptyMessage="No se encontraron colaboradores con ese criterio.">
        {filtered.map((member) => (
          <PosInfoCard
            key={member.id}
            title={member.name}
            subtitle={`${member.role} • ${member.station}`}
            bottomIcon={Clock}
            bottomText={member.shift}
          />
        ))}
      </PosCardGrid>
    </div>
  );
}
