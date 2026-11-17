import { useEffect, useState } from "react";
import { API_URL } from "@/features/config";
import { M3Icon } from "@/shared";
import { getAuthToken } from "@/shared/utils/authStorage";
import { normalizeOrderStatus } from "@/features/orders/utils/orderFormHelpers";

export default function PosTerminalHeader() {
  const [kpis, setKpis] = useState({
    ventasTurno: null,
    ordenesCocina: null,
    mesasOcupadas: null,
    totalMesas: null,
    personalTurno: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    const today = new Date().toLocaleDateString("en-CA");
    const token = getAuthToken();
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
          (o) => normalizeOrderStatus(o.status) === "Creada"
        ).length;

        const occupied = (Array.isArray(tables) ? tables : []).filter(
          (t) => t.status === "Ocupada"
        ).length;

        const activeOps = Array.isArray(activeSessions) ? activeSessions.length : 0;

        if (active) {
          setKpis({
            ventasTurno: ventas,
            ordenesCocina: activasCocina,
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
      icon: "payments",
    },
    {
      label: "Órdenes Cocina",
      value: kpiValue(
        kpis.ordenesCocina === null ? null : `${kpis.ordenesCocina} activas`
      ),
      icon: "dining",
    },
    {
      label: "Mesas Ocupadas",
      value:
        kpis.mesasOcupadas === null || kpis.totalMesas === null
          ? "…"
          : `${kpis.mesasOcupadas} / ${kpis.totalMesas} mesas`,
      icon: "table_restaurant",
    },
    {
      label: "Personal Turno",
      value: kpiValue(
        kpis.personalTurno === null ? null : `${kpis.personalTurno} en servicio`
      ),
      icon: "group",
    },
  ];

  return (
    <header className="w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-xl px-4 py-3.5 m3-elevation-1 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] font-medium">
                {card.label}
              </p>
              <p className="text-title-lg font-medium text-[var(--md-sys-color-on-surface)] mt-0.5 truncate">
                {card.value}
              </p>
            </div>
            <div className="size-10 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center shrink-0">
              <M3Icon name={card.icon} filled size={20} />
            </div>
          </div>
        ))}
      </div>
    </header>
  );
}
