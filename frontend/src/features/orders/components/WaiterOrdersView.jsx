import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  IconButton,
  M3Icon,
  SearchField,
} from "@/shared";
import { getStoredAuthUser } from "@/shared/utils/authStorage";
import { getProductImage, imgPunta } from "@/utils/imageHelper";
import { getOrders, updateOrderStatus } from "../services/orderServices";
import {
  getOrderStatusBadgeMeta,
  normalizeFilterText,
  normalizeOrderStatus,
} from "../utils/orderFormHelpers";
import OrderViewModal from "./OrderViewModal";

function formatElapsedMinutes(createdAtIso, nowMs) {
  if (!createdAtIso) return "Reciente";
  const ts = new Date(createdAtIso).getTime();
  if (Number.isNaN(ts)) return "Reciente";
  const mins = Math.max(0, Math.floor((nowMs - ts) / 60000));
  if (mins < 1) return "Ahora mismo";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `Hace ${hrs} h ${rem} min` : `Hace ${hrs} h`;
}

function formatHour(order) {
  const raw = order?.created_at || order?.createdAt;
  if (!raw) return "";
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return String(order?.createdAt || "");
  return dt.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOrderTimestamp(order) {
  const raw = order?.created_at || order?.createdAt || 0;
  const ts = new Date(raw).getTime();
  return Number.isNaN(ts) ? Number(order?.numericId || 0) : ts;
}

/**
 * Vista cómoda e independiente para Mesero:
 * - Muestra órdenes de salón con énfasis inmediato en las que Cocina marcó "Completada"
 * - Permite al Mesero marcar órdenes como "Creada" o "Entregada" en 1 toque
 * - Muestra notificaciones de confirmación en la zona superior (sin SweetAlert)
 */
export default function WaiterOrdersView() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getStoredAuthUser();
  const highlightOrderId = location.state?.highlightOrderId || null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("active"); // "active" | "Completada" | "Creada" | "Entregada" | "Pagada"
  const [scopeFilter, setScopeFilter] = useState("all"); // "all" | "mine"
  const [creationSort, setCreationSort] = useState("desc"); // "desc" | "asc"
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingKey, setUpdatingKey] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [selectedOrderForView, setSelectedOrderForView] = useState(null);
  const [topBanner, setTopBanner] = useState(null);
  const bannerTimerRef = useRef(null);

  const showTopBanner = useCallback((banner) => {
    setTopBanner(banner);
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => {
      setTopBanner(null);
    }, 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando órdenes del mesero:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchOrders();
    });

    const pollId = setInterval(fetchOrders, 7000);
    const clockId = setInterval(() => setNowMs(Date.now()), 30000);
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchOrders();
    };
    const onOrdersEvent = () => fetchOrders();

    window.addEventListener("focus", onOrdersEvent);
    window.addEventListener("dpiero:orders-updated", onOrdersEvent);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      clearInterval(pollId);
      clearInterval(clockId);
      window.removeEventListener("focus", onOrdersEvent);
      window.removeEventListener("dpiero:orders-updated", onOrdersEvent);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchOrders]);

  useEffect(() => {
    if (!highlightOrderId || orders.length === 0) return;
    const targetOrder = orders.find((o) => o.id === highlightOrderId);
    if (!targetOrder) return;

    const st = normalizeOrderStatus(targetOrder.status);
    if (st === "Pagada" || st === "Anulada") {
      Promise.resolve().then(() => setStatusFilter("Pagada"));
    } else {
      Promise.resolve().then(() => setStatusFilter("active"));
    }

    const timer = setTimeout(() => {
      const el = document.getElementById(`waiter-order-card-${highlightOrderId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [highlightOrderId, orders]);

  const isMineOrder = useCallback(
    (order) => {
      if (!currentUser) return false;
      if (
        order.waiter_id &&
        currentUser.id &&
        Number(order.waiter_id) === Number(currentUser.id)
      ) {
        return true;
      }
      return (
        normalizeFilterText(order.waiter) === normalizeFilterText(currentUser.name)
      );
    },
    [currentUser]
  );

  const scopedOrders = useMemo(() => {
    if (scopeFilter === "mine") {
      return orders.filter(isMineOrder);
    }
    return orders;
  }, [orders, scopeFilter, isMineOrder]);

  const counts = useMemo(() => {
    let creada = 0;
    let completada = 0;
    let entregada = 0;
    let pagada = 0;
    scopedOrders.forEach((o) => {
      const st = normalizeOrderStatus(o.status);
      if (st === "Creada") creada += 1;
      else if (st === "Completada") completada += 1;
      else if (st === "Entregada") entregada += 1;
      else if (st === "Pagada") pagada += 1;
    });
    return {
      creada,
      completada,
      entregada,
      pagada,
      active: creada + completada + entregada,
    };
  }, [scopedOrders]);

  const filteredOrders = useMemo(() => {
    const q = normalizeFilterText(searchQuery);

    return [...scopedOrders]
      .filter((o) => {
        const st = normalizeOrderStatus(o.status);
        if (st === "Anulada") return false;

        if (statusFilter === "active") {
          if (st === "Pagada") return false;
        } else if (st !== statusFilter) {
          return false;
        }

        if (!q) return true;
        const itemText = (o.items || [])
          .map((it) => `${it.name || ""} ${it.code || ""}`)
          .join(" ");
        return (
          normalizeFilterText(o.id).includes(q) ||
          normalizeFilterText(o.tableNumber).includes(q) ||
          normalizeFilterText(o.waiter).includes(q) ||
          normalizeFilterText(o.observations).includes(q) ||
          normalizeFilterText(itemText).includes(q)
        );
      })
      .sort((a, b) => {
        // Priorizar siempre las completadas por Cocina listas para entregar cuando se ven todas activas
        if (statusFilter === "active") {
          const aReady = normalizeOrderStatus(a.status) === "Completada" ? 1 : 0;
          const bReady = normalizeOrderStatus(b.status) === "Completada" ? 1 : 0;
          if (aReady !== bReady) return bReady - aReady;
        }
        const diff = getOrderTimestamp(a) - getOrderTimestamp(b);
        return creationSort === "asc" ? diff : -diff;
      });
  }, [scopedOrders, statusFilter, searchQuery, creationSort]);

  const handleSetStatus = async (order, nextStatus) => {
    const currentStatus = normalizeOrderStatus(order.status);
    if (currentStatus === "Pagada" || currentStatus === "Anulada") return;
    if (currentStatus === nextStatus) return;
    if (nextStatus === "Entregada" && currentStatus !== "Completada") return;

    const identifier = order.numericId || order.id;
    const key = `${order.id}::${nextStatus}`;
    setUpdatingKey(key);

    try {
      await updateOrderStatus(identifier, nextStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? { ...o, status: nextStatus, orderStatus: nextStatus }
            : o
        )
      );

      window.dispatchEvent(new CustomEvent("dpiero:notifications-refresh"));

      showTopBanner({
        type: "success",
        title:
          nextStatus === "Entregada"
            ? `Orden ${order.id} marcada como Entregada`
            : `Orden ${order.id} marcada como Creada`,
        message:
          nextStatus === "Entregada"
            ? `${order.tableNumber} servida en mesa.`
            : `${order.tableNumber} actualizada a estado Creada para preparación en Cocina.`,
      });

      fetchOrders();
    } catch (err) {
      showTopBanner({
        type: "error",
        title: "No se pudo actualizar el estado",
        message: err.message || "Inténtalo nuevamente en unos segundos.",
      });
    } finally {
      setUpdatingKey("");
    }
  };

  const handleEditOrder = (order) => {
    const st = normalizeOrderStatus(order.status);
    const qty = {};
    (order.items || []).forEach((it) => {
      qty[it.id] = it.qty;
    });
    navigate("/editorder", {
      state: {
        form: {
          id: order.id,
          tableNumber: order.tableNumber,
          waiter: order.waiter,
          observations: order.observations,
          orderStatus: st,
        },
        qty,
      },
    });
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-4 font-[family-name:var(--main-font)] text-[var(--md-sys-color-on-surface)]">
      {/* Banner superior inline (sin SweetAlert) */}
      {topBanner && (
        <div
          role="status"
          className={`dpiero-modal-in rounded-2xl px-4 py-3 border flex items-center justify-between gap-3 m3-elevation-2 ${
            topBanner.type === "error"
              ? "bg-[var(--md-sys-color-error-container)] border-[var(--md-sys-color-error)]/50 text-[var(--md-sys-color-on-error-container)]"
              : "bg-[var(--color-success-bg)] border-[var(--color-success-border)] text-[var(--md-sys-color-on-surface)]"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <M3Icon
              name={topBanner.type === "error" ? "error" : "check_circle"}
              filled
              size={22}
              className={
                topBanner.type === "error"
                  ? "text-[var(--md-sys-color-error)] shrink-0"
                  : "text-[var(--color-success)] shrink-0"
              }
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">
                {topBanner.title}
              </p>
              <p className="text-xs opacity-85 mt-0.5 truncate">
                {topBanner.message}
              </p>
            </div>
          </div>

          <IconButton
            ariaLabel="Cerrar notificación"
            variant="standard"
            hitSize={34}
            iconSize={18}
            onClick={() => setTopBanner(null)}
          >
            <M3Icon name="close" size={18} />
          </IconButton>
        </div>
      )}

      {/* Filtros cómodos */}
      <div className="bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-3.5 sm:p-4 m3-elevation-1">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
          <div className="flex flex-nowrap items-center gap-2 w-full xl:w-auto xl:flex-1 min-w-0 overflow-x-auto scrollbar-none overscroll-x-contain py-0.5">
            {[
              { id: "active", label: "Activas", count: counts.active, icon: "grid_view" },
              {
                id: "Completada",
                label: "Listas en Cocina",
                count: counts.completada,
                icon: "notifications_active",
                urgent: counts.completada > 0,
              },
              { id: "Creada", label: "En Cocina (Creadas)", count: counts.creada, icon: "schedule" },
              { id: "Entregada", label: "Entregadas", count: counts.entregada, icon: "room_service" },
              { id: "Pagada", label: "Pagadas", count: counts.pagada, icon: "check_circle" },
            ].map((chip) => {
              const active = statusFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setStatusFilter(chip.id)}
                  className={`m3-state shrink-0 inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium border cursor-pointer transition-colors whitespace-nowrap ${
                    active
                      ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border-[var(--md-sys-color-secondary)]/40"
                      : chip.urgent
                        ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)]/50"
                        : "bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)]"
                  }`}
                >
                  <M3Icon name={active ? "check" : chip.icon} size={16} />
                  <span>{chip.label}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] tabular-nums">
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none overscroll-x-contain py-0.5 shrink-0">
              <div className="grid grid-cols-2 rounded-full border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] overflow-hidden divide-x divide-[var(--md-sys-color-outline-variant)] shrink-0">
                {[
                  { id: "all", label: "Todas" },
                  { id: "mine", label: "Mis órdenes" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScopeFilter(s.id)}
                    className={`m3-state h-9 px-3 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                      scopeFilter === s.id
                        ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                        : "text-[var(--md-sys-color-on-surface-variant)]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setCreationSort((prev) => (prev === "desc" ? "asc" : "desc"))
                }
                className="m3-state shrink-0 inline-flex items-center gap-1 h-9 px-3 rounded-full border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-xs font-medium cursor-pointer whitespace-nowrap"
              >
                <M3Icon name="schedule" size={15} className="text-[var(--md-sys-color-primary)]" />
                <span>{creationSort === "desc" ? "Más recientes" : "Más antiguas"}</span>
              </button>
            </div>

            <div className="w-full sm:w-56 shrink-0">
              <SearchField
                asForm={false}
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery("")}
                placeholder="Mesa, orden o platillo..."
                ariaLabel="Buscar órdenes"
                size="sm"
                fullWidth
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grilla de tarjetas independientes y cómodas para el Mesero */}
      {loading && orders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-14 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] text-body-md text-[var(--md-sys-color-on-surface-variant)]">
          Cargando órdenes...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 rounded-2xl border border-dashed border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] gap-2.5">
          <div className="size-14 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-center text-[var(--md-sys-color-primary)]">
            <M3Icon name="room_service" size={28} />
          </div>
          <h2 className="text-title-md font-semibold">
            No hay órdenes para este filtro
          </h2>
          <p className="text-body-sm text-[var(--md-sys-color-on-surface-variant)] max-w-md">
            Puedes registrar una nueva orden para tus mesas o cambiar el filtro superior.
          </p>
          <Link to="/CreateOrder" className="mt-1">
            <Button variant="tonal" leadingIcon="add">
              Crear Nueva Orden
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 items-stretch">
          {filteredOrders.map((order) => {
            const st = normalizeOrderStatus(order.status);
            const meta = getOrderStatusBadgeMeta(st);
            const isReadyFromKitchen = st === "Completada";
            const isClosed = st === "Pagada" || st === "Anulada";
            const isHighlighted = highlightOrderId === order.id;
            const items = Array.isArray(order.items) ? order.items : [];
            const hasObs =
              Boolean(order.observations) &&
              order.observations !== "Sin observaciones adicionales";
            const elapsedText = formatElapsedMinutes(
              order.created_at || order.createdAt,
              nowMs
            );
            const hourText = formatHour(order);
            const updatingDelivered = updatingKey === `${order.id}::Entregada`;

            return (
              <article
                id={`waiter-order-card-${order.id}`}
                key={order.id}
                className={`rounded-2xl flex flex-col overflow-hidden bg-[var(--md-sys-color-surface-container-low)] transition-all ${
                  isHighlighted
                    ? "border-2 border-[var(--md-sys-color-primary)] ring-2 ring-[var(--md-sys-color-primary)]/30 m3-elevation-3"
                    : isReadyFromKitchen
                      ? "border-2 border-[var(--md-sys-color-primary)] m3-elevation-2"
                      : "border border-[var(--md-sys-color-outline-variant)] m3-elevation-1"
                }`}
              >
                {/* Alerta visual directa en la card cuando Cocina ya la completó */}
                {isReadyFromKitchen && (
                  <div className="px-4 py-2 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-between gap-2 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <M3Icon name="notifications_active" size={16} />
                      ¡Lista en Cocina para entregar en mesa!
                    </span>
                    <span>{elapsedText}</span>
                  </div>
                )}

                {/* Encabezado de la orden */}
                <header className="px-4 py-3.5 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-3 py-1.5 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold text-sm shrink-0">
                      {order.tableNumber || "General"}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold font-mono truncate">
                          {order.id}
                        </h2>
                        {isMineOrder(order) && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                            Tuya
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
                        {order.waiter || "Sin asignar"}
                        {hourText ? ` · ${hourText}` : ""}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${meta.className}`}
                  >
                    <M3Icon name={meta.icon} size={14} />
                    {meta.label}
                  </span>
                </header>

                {/* Cuerpo con observaciones y platillos */}
                <div className="flex-1 p-4 space-y-3 bg-[var(--md-sys-color-surface)]/50">
                  {hasObs && (
                    <div className="rounded-xl px-3 py-2 bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] text-xs flex items-start gap-2">
                      <M3Icon
                        name="description"
                        size={16}
                        className="text-[var(--color-warning)] mt-0.5 shrink-0"
                      />
                      <span className="font-medium text-[var(--md-sys-color-on-surface)]">
                        {order.observations}
                      </span>
                    </div>
                  )}

                  <ul className="space-y-2">
                    {items.map((item, idx) => (
                      <li
                        key={item.id || `${order.id}-${idx}`}
                        className="flex items-center justify-between gap-2.5 text-sm py-1.5 border-b border-[var(--md-sys-color-outline-variant)]/40 last:border-b-0"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={getProductImage(item)}
                            alt={item.name}
                            className="size-11 sm:size-12 rounded-xl object-cover border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = imgPunta;
                            }}
                          />
                          <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-lg bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-xs font-bold tabular-nums shrink-0">
                            {Math.max(1, Number(item.qty || item.quantity || 1))}x
                          </span>
                          <div className="min-w-0">
                            <span className="font-medium text-[var(--md-sys-color-on-surface)] block leading-snug">
                              {item.name}
                            </span>
                            {item.notes && (
                              <span className="text-xs text-[var(--color-warning)] block">
                                Nota: {item.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pie cómodo para marcar como Creada o Entregada */}
                <footer className="px-4 py-3 border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    <span>Total consumo:</span>
                    <span className="text-sm font-bold text-[var(--md-sys-color-on-surface)] tabular-nums">
                      ${Number(order.total || 0).toLocaleString("es-CO")} COP
                    </span>
                  </div>

                  {!isClosed ? (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        aria-pressed={st === "Entregada"}
                        variant={
                          st === "Entregada"
                            ? "tonal"
                            : isReadyFromKitchen
                              ? "filled"
                              : "outlined"
                        }
                        size="sm"
                        leadingIcon={st === "Entregada" ? "check" : "room_service"}
                        disabled={st !== "Completada" || Boolean(updatingKey)}
                        title={
                          st === "Completada"
                            ? "Marcar orden como Entregada"
                            : st === "Entregada"
                              ? "Orden ya marcada como Entregada"
                              : "Disponible cuando la orden esté Completada por Cocina"
                        }
                        onClick={() => handleSetStatus(order, "Entregada")}
                        className="flex-1"
                      >
                        {updatingDelivered ? "Marcando..." : "Entregada"}
                      </Button>

                      <IconButton
                        ariaLabel="Editar platillos de la orden"
                        title="Editar platillos o notas"
                        variant="outlined"
                        hitSize={38}
                        iconSize={18}
                        onClick={() => handleEditOrder(order)}
                      >
                        <M3Icon name="edit" size={18} />
                      </IconButton>

                      <IconButton
                        ariaLabel="Ver detalle de orden"
                        title="Ver detalle"
                        variant="standard"
                        hitSize={38}
                        iconSize={18}
                        onClick={() => setSelectedOrderForView(order)}
                      >
                        <M3Icon name="visibility" size={18} />
                      </IconButton>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[var(--color-success)] inline-flex items-center gap-1">
                        <M3Icon name="check_circle" size={16} />
                        Orden Pagada y mesa liberada
                      </span>
                      <Button
                        type="button"
                        variant="text"
                        size="sm"
                        onClick={() => setSelectedOrderForView(order)}
                      >
                        Ver comprobante
                      </Button>
                    </div>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      )}

      <OrderViewModal
        order={selectedOrderForView}
        isOpen={Boolean(selectedOrderForView)}
        onClose={() => setSelectedOrderForView(null)}
      />
    </div>
  );
}
