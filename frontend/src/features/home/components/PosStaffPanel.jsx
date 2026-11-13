import { useEffect, useState } from "react";
import { Users, Clock, History } from "lucide-react";
import PosSectionHeader from "./PosSectionHeader";
import PosCardGrid from "./PosCardGrid";
import PosInfoCard from "./PosInfoCard";
import { getActiveStaffSessions, formatDuration } from "@/services/sessionService";
import SessionHistoryModal from "@/shared/components/SessionHistoryModal";

// Estación operativa derivada del rol real en la BD
const STATIONS = {
  cajero: "Caja Principal",
  mesero: "Salón",
  cocina: "Cocina",
  cocinero: "Cocina",
  parrilla: "Parrilla a la Brasa",
};

export default function PosStaffPanel() {
  const [query, setQuery] = useState("");
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadActive = async () => {
      try {
        const data = await getActiveStaffSessions();
        if (active) {
          setStaff(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch {
        if (active) {
          setStaff([]);
          setLoading(false);
        }
      }
    };

    loadActive();
    const pollId = setInterval(loadActive, 15000);
    const tickId = setInterval(() => setTick((t) => t + 1), 1000);

    return () => {
      active = false;
      clearInterval(pollId);
      clearInterval(tickId);
    };
  }, []);

  const filtered = staff.filter((member) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      (member.userName || "").toLowerCase().includes(q) ||
      (member.userType || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="flex-1">
          <PosSectionHeader
            icon={Users}
            title="Personal en Turno (Tiempo Real)"
            subtitle="Colaboradores con sesión activa en este momento y duración de su turno."
            searchQuery={query}
            onSearchChange={setQuery}
            searchPlaceholder="Buscar por nombre o cargo..."
            actionLabel="Administrar Personal"
            actionLink="/dashboard/userList"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[var(--color-secondary-800)] hover:bg-[var(--color-secondary-700)] text-[var(--color-primary-300)] border border-[var(--color-secondary-700)] cursor-pointer transition shrink-0"
        >
          <History className="size-4" />
          Historial de Sesiones
        </button>
      </div>

      <PosCardGrid
        emptyMessage={
          loading
            ? "Verificando sesiones activas en tiempo real..."
            : "No hay colaboradores con sesión activa en este momento."
        }
      >
        {filtered.map((member) => {
          const role = member.userType || "Operativo";
          const station = STATIONS[role.toLowerCase()] || "Operativo";
          const elapsed = member.startedAt
            ? Math.max(0, Math.floor((Date.now() - new Date(member.startedAt).getTime()) / 1000))
            : member.durationSeconds || 0;

          return (
            <PosInfoCard
              key={member.sessionId || member.userId}
              title={member.userName}
              subtitle={`${role} • ${station}`}
              bottomIcon={Clock}
              bottomText={`${formatDuration(elapsed)} en turno`}
            />
          );
        })}
      </PosCardGrid>

      <SessionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        isAdmin={true}
      />
    </div>
  );
}
