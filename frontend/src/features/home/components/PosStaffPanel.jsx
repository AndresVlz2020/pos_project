import { useEffect, useState } from "react";
import { Users, Clock, UserPlus } from "lucide-react";
import PosSectionHeader from "./PosSectionHeader";
import PosCardGrid from "./PosCardGrid";
import PosInfoCard from "./PosInfoCard";
import { API_URL } from "@/features/config";

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

  useEffect(() => {
    let active = true;
    const token =
      localStorage.getItem("auth_token") || sessionStorage.getItem("token");

    fetch(`${API_URL}/users?active=true`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!active) return;
        const operational = (Array.isArray(data) ? data : []).filter((u) => {
          const type = (u.role || u.userType || "").toLowerCase();
          const isAdmin =
            u.isSuperUser ||
            Boolean(u.isSuperuser) ||
            type === "admin" ||
            type === "administrador";
          return (u.isActive ?? true) && !isAdmin;
        });
        setStaff(operational);
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setStaff([]);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = staff.filter((member) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      (member.userName || member.name || "").toLowerCase().includes(q) ||
      (member.role || member.userType || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <PosSectionHeader
        icon={Users}
        title="Personal en Turno"
        subtitle="Equipo operativo activo en salón, cocina y barra (datos reales de PostgreSQL)."
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar por nombre o cargo..."
        actionLabel="Administrar Personal"
        actionIcon={UserPlus}
        actionLink="/dashboard/userList"
      />

      <PosCardGrid
        emptyMessage={
          loading
            ? "Cargando personal desde la base de datos..."
            : "No se encontraron colaboradores con ese criterio."
        }
      >
        {filtered.map((member) => {
          const role = member.role || member.userType;
          const station = STATIONS[(member.userType || role || "").toLowerCase()] || "Operativo";
          return (
            <PosInfoCard
              key={member.id}
              title={member.userName || member.name}
              subtitle={`${role} • ${station}`}
              bottomIcon={Clock}
              bottomText="Activo en turno"
            />
          );
        })}
      </PosCardGrid>
    </div>
  );
}
