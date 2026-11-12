import { useEffect, useState } from "react";
import { API_URL } from "@/features/config";

// KPIs operativos en tiempo real, conectados a PostgreSQL:
// - Venta de Turno: suma de totales de las comandas de hoy (excluye anuladas)
// - Comandas Cocina: comandas de hoy sin cerrar/pagar (en preparación/abierta)
// - Mesas Ocupadas: mesas ocupadas / total de mesas (restaurant_tables)
// - Personal Turno: colaboradores activos no administradores
export default function PosTerminalHeader({
  operator = "Operador",
  role = "Personal",
}) {
  const [kpis, setKpis] = useState({
    ventasTurno: null,
    comandasCocina: null,
    mesasOcupadas: null,
    totalMesas: null,
    personalTurno: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
    const token =
      localStorage.getItem("auth_token") || sessionStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    async function load() {
      try {
        const [ordersRes, tablesRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/orders`, { headers }),
          fetch(`${API_URL}/orders/tables/availability`, { headers }),
          fetch(`${API_URL}/users?active=true`, { headers }),
        ]);

        const orders = ordersRes.ok ? await ordersRes.json() : [];
        const tables = tablesRes.ok ? await tablesRes.json() : [];
        const users = usersRes.ok ? await usersRes.json() : [];

        const todaysOrders = (Array.isArray(orders) ? orders : []).filter(
          (o) =>
            (o.createdAt || "").slice(0, 10) === today &&
            (o.status || "").toLowerCase() !== "anulada"
        );

        const ventas = todaysOrders.reduce(
          (sum, o) => sum + Number(o.total || o.totalAmount || 0),
          0
        );
        const activasCocina = todaysOrders.filter(
          (o) =>
            !["pagada", "cerrada"].includes((o.status || "").toLowerCase())
        ).length;

        const occupied = (Array.isArray(tables) ? tables : []).filter(
          (t) => t.status === "Ocupada"
        ).length;

        const activeOps = (Array.isArray(users) ? users : []).filter((u) => {
          const type = (u.role || u.userType || "").toLowerCase();
          const isAdmin =
            u.isSuperUser ||
            Boolean(u.isSuperuser) ||
            type === "admin" ||
            type === "administrador";
          return (u.isActive ?? true) && !isAdmin;
        }).length;

        if (active) {
          setKpis({
            ventasTurno: ventas,
            comandasCocina: activasCocina,
            mesasOcupadas: occupied,
            totalMesas: Array.isArray(tables) ? tables.length : 0,
            personalTurno: activeOps,
            loading: false,
          });
        }
      } catch (err) {
        console.warn("No se pudieron cargar los KPIs del POS:", err);
        if (active) setKpis((prev) => ({ ...prev, loading: false }));
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const hour = new Date().getHours();
  const shift = hour < 12 ? "Turno Mañana" : hour < 18 ? "Turno Tarde / Noche" : "Turno Noche";

  const fmtMoney = (n) => `$${Number(n ?? 0).toLocaleString("es-CO")}`;
  const kpiValue = (v, fallback = "…") =>
    v === null || v === undefined ? fallback : v;

  return (
    <header className="w-full bg-[var(--color-secondary-950)] border-b border-[var(--color-secondary-800)] py-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Barra superior del POS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-bold text-[var(--color-white)] tracking-tight">
              Punto de Venta
            </h1>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-[var(--color-secondary-800)] text-[var(--color-gray-300)] font-medium border border-[var(--color-secondary-700)]">
                {operator} · {role}
              </span>
              <span className="hidden md:inline-block px-2 py-0.5 rounded bg-[var(--color-secondary-900)] text-[var(--color-gray-400)] text-[10px]">
                {shift}
              </span>
            </div>
          </div>
        </div>

        {/* Métricas Operativas Conectadas a PostgreSQL */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-md px-3.5 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-gray-400)] font-medium">
              Venta de Turno
            </p>
            <p className="text-base sm:text-lg font-bold text-[var(--color-white)] tracking-tight mt-0.5">
              {kpiValue(kpis.ventasTurno === null ? null : fmtMoney(kpis.ventasTurno))}
            </p>
          </div>

          <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-md px-3.5 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-gray-400)] font-medium">
              Comandas Cocina
            </p>
            <p className="text-base sm:text-lg font-bold text-[var(--color-white)] tracking-tight mt-0.5">
              {kpiValue(
                kpis.comandasCocina === null ? null : `${kpis.comandasCocina} activas`
              )}
            </p>
          </div>

          <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-md px-3.5 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-gray-400)] font-medium">
              Mesas Ocupadas
            </p>
            <p className="text-base sm:text-lg font-bold text-[var(--color-white)] tracking-tight mt-0.5">
              {kpis.mesasOcupadas === null || kpis.totalMesas === null
                ? "…"
                : `${kpis.mesasOcupadas} / ${kpis.totalMesas} mesas`}
            </p>
          </div>

          <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-md px-3.5 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-gray-400)] font-medium">
              Personal Turno
            </p>
            <p className="text-base sm:text-lg font-bold text-[var(--color-white)] tracking-tight mt-0.5">
              {kpiValue(
                kpis.personalTurno === null
                  ? null
                  : `${kpis.personalTurno} en servicio`
              )}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
