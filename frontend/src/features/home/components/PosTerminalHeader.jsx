import { useEffect, useState } from "react";
import { DollarSign, UtensilsCrossed, LayoutGrid, Users } from "lucide-react";
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
        const [ordersRes, tablesRes, activeSessionsRes] = await Promise.all([
          fetch(`${API_URL}/orders`, { headers }),
          fetch(`${API_URL}/orders/tables/availability`, { headers }),
          fetch(`${API_URL}/sessions/active`, { headers, cache: "no-store" }),
        ]);

        const orders = ordersRes.ok ? await ordersRes.json() : [];
        const tables = tablesRes.ok ? await tablesRes.json() : [];
        const activeSessions = activeSessionsRes.ok ? await activeSessionsRes.json() : [];

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

        const activeOps = Array.isArray(activeSessions) ? activeSessions.length : 0;

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

  const fmtMoney = (n) => `$${Number(n ?? 0).toLocaleString("es-CO")}`;
  const kpiValue = (v, fallback = "…") =>
    v === null || v === undefined ? fallback : v;

  const cards = [
    {
      label: "Venta de Turno",
      value: kpiValue(kpis.ventasTurno === null ? null : fmtMoney(kpis.ventasTurno)),
      icon: DollarSign,
    },
    {
      label: "Comandas Cocina",
      value: kpiValue(
        kpis.comandasCocina === null ? null : `${kpis.comandasCocina} activas`
      ),
      icon: UtensilsCrossed,
    },
    {
      label: "Mesas Ocupadas",
      value:
        kpis.mesasOcupadas === null || kpis.totalMesas === null
          ? "…"
          : `${kpis.mesasOcupadas} / ${kpis.totalMesas} mesas`,
      icon: LayoutGrid,
    },
    {
      label: "Personal Turno",
      value: kpiValue(
        kpis.personalTurno === null ? null : `${kpis.personalTurno} en servicio`
      ),
      icon: Users,
    },
  ];

  return (
    <header className="w-full bg-[var(--color-secondary-950)] border-b border-[var(--color-secondary-800)] py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Métricas Operativas Conectadas a PostgreSQL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] hover:border-[var(--color-primary-500)]/40 transition-colors rounded-xl px-5 py-4 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-[var(--color-gray-400)] font-semibold">
                    {card.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--color-white)] tracking-tight mt-1 truncate">
                    {card.value}
                  </p>
                </div>
                <div className="size-11 rounded-xl bg-[var(--color-primary-500)]/15 border border-[var(--color-primary-500)]/30 text-[var(--color-primary-400)] flex items-center justify-center shrink-0">
                  <Icon className="size-5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
