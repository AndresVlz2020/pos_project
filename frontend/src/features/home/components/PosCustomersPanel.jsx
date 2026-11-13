import { useEffect, useState } from "react";
import { Receipt, Plus } from "lucide-react";
import PosSectionHeader from "./PosSectionHeader";
import PosCardGrid from "./PosCardGrid";
import PosInfoCard from "./PosInfoCard";
import { API_URL } from "@/features/config";

// Reemplazo del listado ficticio de clientes por datos REALES del POS:
// comandas registradas y totales del turno, conectados a PostgreSQL.
export default function PosCustomersPanel() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const token =
      localStorage.getItem("auth_token") || sessionStorage.getItem("token");

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

  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
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
    (o) => !["pagada", "cerrada"].includes((o.status || "").toLowerCase())
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
    .slice(0, 9);

  const fmtMoney = (n) => `$${Number(n ?? 0).toLocaleString("es-CO")}`;

  return (
    <div className="space-y-4">
      <PosSectionHeader
        icon={Receipt}
        title="Comandas & Facturación del turno"
        subtitle="Comandas registradas en tiempo real."
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar por número, mesa, mesero o estado..."
        actionLabel="Nueva Comanda"
        actionIcon={Plus}
        actionLink="/CreateOrder"
      />

      {/* Resumen real del turno */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-[family-name:var(--main-font)]">
        <div className="col-span-2 sm:col-span-1 rounded-md border border-[var(--color-secondary-800)] bg-[var(--color-secondary-900)] px-2 py-2 text-center">
          <p className="text-[9px] uppercase tracking-wider text-[var(--color-gray-400)] font-semibold">
            Ventas del turno
          </p>
          <p className="text-sm font-bold text-[var(--color-white)] mt-0.5">
            {fmtMoney(ventasTurno)}
          </p>
        </div>
        <div className="rounded-md border border-[var(--color-secondary-800)] bg-[var(--color-secondary-900)] px-2 py-2 text-center">
          <p className="text-[9px] uppercase tracking-wider text-[var(--color-gray-400)] font-semibold">
            Comandas hoy
          </p>
          <p className="text-sm font-bold text-[var(--color-white)] mt-0.5">
            {todayOrders.length}
          </p>
        </div>
        <div className="rounded-md border border-[var(--color-secondary-800)] bg-[var(--color-secondary-900)] px-2 py-2 text-center">
          <p className="text-[9px] uppercase tracking-wider text-[var(--color-gray-400)] font-semibold">
            Por cobrar/activas
          </p>
          <p className="text-sm font-bold text-[var(--color-primary-300)] mt-0.5">
            {activas}
          </p>
        </div>
      </div>

      <PosCardGrid
        emptyMessage={
          loading
            ? "Cargando comandas desde la base de datos..."
            : "No se encontraron comandas con el criterio de búsqueda."
        }
      >
        {filtered.map((order) => (
          <PosInfoCard
            key={order.numericId || order.id}
            tagLeft={order.status}
            tagRight={order.table_number || order.tableNumber}
            title={order.order_number || order.orderNumber || order.id}
            subtitle={`${order.waiter || "Mesero"} • Total ${fmtMoney(order.total)}`}
            bottomIcon={Receipt}
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
