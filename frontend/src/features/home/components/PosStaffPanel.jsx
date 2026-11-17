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
  const [staffSyncedAt, setStaffSyncedAt] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadActive = async () => {
      try {
        const data = await getActiveStaffSessions();
        if (active) {
          const syncMs = Date.now();
          setStaff(Array.isArray(data) ? data : []);
          setStaffSyncedAt(syncMs);
          setNowMs(syncMs);
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
    const tickId = setInterval(() => setNowMs(Date.now()), 1000);

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
            title="Personal en Turno"
            subtitle="Colaboradores con sesión activa y duración de su turno."
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
          className="min-h-[40px] inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-[var(--color-secondary-800)] hover:bg-[var(--color-secondary-700)] text-[var(--color-primary-300)] border border-[var(--color-secondary-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 cursor-pointer transition shrink-0"
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
          const elapsed =
            Math.max(0, Number(member.durationSeconds) || 0) +
            Math.max(0, Math.floor((nowMs - staffSyncedAt) / 1000));

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
