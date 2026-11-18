import { useEffect, useState } from "react";
import PosSectionHeader from "./PosSectionHeader";
import PosCardGrid from "./PosCardGrid";
import PosInfoCard from "./PosInfoCard";
import { API_URL } from "@/features/config";
import { getAuthToken } from "@/shared/utils/authStorage";
import { normalizeOrderStatus } from "@/features/orders/utils/orderFormHelpers";

export default function PosCustomersPanel() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const token = getAuthToken();

    fetch(`${API_URL}/orders`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!active) return;
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setOrders([]);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const today = new Date().toLocaleDateString("en-CA");
  const todayOrders = orders.filter(
    (o) =>
      (o.createdAt || "").slice(0, 10) === today &&
      (o.status || "").toLowerCase() !== "anulada"
  );
  const ventasTurno = todayOrders.reduce(
    (sum, o) => sum + Number(o.total || o.totalAmount || 0),
    0
  );
  const activas = todayOrders.filter(
    (o) => !["Pagada", "Anulada"].includes(normalizeOrderStatus(o.status))
  ).length;

  const filtered = orders
    .filter((order) => {
      const q = query.toLowerCase().trim();
      if (!q) return true;
      return (
        (order.order_number || order.orderNumber || order.id || "")
          .toLowerCase()
          .includes(q) ||
        (order.table_number || order.tableNumber || "")
          .toLowerCase()
          .includes(q) ||
        (order.waiter || "").toLowerCase().includes(q) ||
        (order.status || "").toLowerCase().includes(q)
      );
    })
    .slice(0, 12);

  const fmtMoney = (n) => `$${Number(n ?? 0).toLocaleString("es-CO")}`;

  return (
    <div className="space-y-4 w-full">
      <PosSectionHeader
        iconName="receipt_long"
        title="Órdenes & Facturación del turno"
        subtitle="Órdenes registradas en tiempo real."
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar por número, mesa, mesero o estado..."
        actionLabel="Nueva Orden"
        actionIconName="add"
        actionLink="/CreateOrder"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] px-4 py-3 text-center m3-elevation-1">
          <p className="text-xs uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] font-medium">
            Ventas del turno
          </p>
          <p className="text-base leading-6 font-bold text-[var(--md-sys-color-on-surface)] mt-0.5 tabular-nums">
            {fmtMoney(ventasTurno)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] px-4 py-3 text-center m3-elevation-1">
          <p className="text-xs uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] font-medium">
            Órdenes hoy
          </p>
          <p className="text-base leading-6 font-bold text-[var(--md-sys-color-on-surface)] mt-0.5 tabular-nums">
            {todayOrders.length}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] px-4 py-3 text-center m3-elevation-1">
          <p className="text-xs uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] font-medium">
            Por cobrar/activas
          </p>
          <p className="text-base leading-6 font-bold text-[var(--md-sys-color-primary)] mt-0.5 tabular-nums">
            {activas}
          </p>
        </div>
      </div>

      <PosCardGrid
        emptyMessage={
          loading
            ? "Cargando órdenes..."
            : "No se encontraron órdenes con el criterio de búsqueda."
        }
      >
        {filtered.map((order) => (
          <PosInfoCard
            key={order.numericId || order.id}
            tagLeft={order.status}
            tagRight={order.table_number || order.tableNumber}
            title={order.order_number || order.orderNumber || order.id}
            subtitle={`${order.waiter || "Mesero"} • Total ${fmtMoney(order.total)}`}
            bottomIconName="receipt_long"
            bottomText={
              order.createdAt ? order.createdAt.slice(11, 16) : "Reciente"
            }
            actionLabel="Detalle"
            actionLink="/orderList"
          />
        ))}
      </PosCardGrid>
    </div>
  );
}
