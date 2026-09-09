import { Users, Phone, ShieldCheck, UserCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { posStaff } from "../data/posMockData";

export default function PosStaffPanel() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-white)] flex items-center gap-2">
            <Users className="size-5 text-[var(--color-secondary-400)]" />
            Personal & Operadores de Turno
          </h2>
          <p className="text-xs text-[var(--color-gray-400)] mt-0.5">
            Registro del equipo activo en caja, atención de salón, cocina y supervisión.
          </p>
        </div>

        <Link
          to="/dashboard/userList"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-secondary-300)] hover:text-[var(--color-secondary-200)] hover:underline"
        >
          <span>Administrar usuarios y permisos</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {posStaff.map((member) => (
          <div
            key={member.id}
            className="rounded-xl border border-[var(--color-primary-800)] bg-[var(--color-primary-900)] p-4 flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="relative size-13 shrink-0">
                <img
                  src={member.image}
                  alt={member.name}
                  className="size-13 rounded-full object-cover border-2 border-[var(--color-primary-700)] shadow-sm"
                />
              </div>

              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-[var(--color-white)] truncate">
                  {member.name}
                </h4>
                <p className="text-xs text-[var(--color-secondary-300)] font-medium truncate">
                  {member.role}
                </p>
                <span className="text-[10px] text-[var(--color-gray-400)] block truncate">
                  {member.station}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--color-primary-800)] text-[11px] text-[var(--color-gray-300)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-gray-400)]">Turno:</span>
                <span className="font-medium text-[var(--color-white)]">{member.shift}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-gray-400)] flex items-center gap-1">
                  <Phone className="size-3" /> Contacto:
                </span>
                <span className="font-mono text-[var(--color-gray-200)]">{member.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
