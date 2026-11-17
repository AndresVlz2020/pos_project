import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  IconButton,
  M3Icon,
  SearchField,
} from "@/shared";
import { getOrders, updateOrderStatus } from "../services/orderServices";
import {
  getOrderStatusBadgeMeta,
  normalizeFilterText,
  normalizeOrderStatus,
} from "../utils/orderFormHelpers";
import { getProductImage, imgPunta } from "@/utils/imageHelper";

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

function formatCreationTime(order) {
  const raw = order?.created_at || order?.createdAt;
  if (!raw) return "";
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return String(order?.createdAt || "");
  return dt.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOrderTimestamp(order) {
  const raw = order?.created_at || order?.createdAt || 0;
  const ts = new Date(raw).getTime();
  return Number.isNaN(ts) ? Number(order?.numericId || 0) : ts;
}

function getOrderLocalDateKey(order) {
  const raw = order?.created_at || order?.createdAt;
  if (!raw) return "";
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return String(raw).slice(0, 10);
  return dt.toLocaleDateString("en-CA");
}

/**
 * Vista KDS exclusiva para Cocinero/Cocina:
 * - Cards horizontales grandes que aprovechan prácticamente toda la pantalla
 * - Deslizables horizontalmente, seleccionables para atender y filtrables por creación y estado
 * - Muestra información completa de cada producto, descripción de ingredientes y observaciones
 * - Permite marcar la orden como Completada (en espera de cobro por el Cajero)
 */
export default function KitchenOrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Creada"); // "Creada" | "Completada" | "active"
  const [creationSort, setCreationSort] = useState("asc"); // "asc" (orden de llegada) | "desc"
  const [creationDate, setCreationDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [kitchenBanner, setKitchenBanner] = useState(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const trackRef = useRef(null);
  const bannerTimerRef = useRef(null);

  const showKitchenBanner = useCallback((banner) => {
    setKitchenBanner(banner);
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => {
      setKitchenBanner(null);
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
      console.error("Error cargando órdenes para cocina:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchOrders();
    });
    const pollId = setInterval(fetchOrders, 12000);
    const clockId = setInterval(() => setNowMs(Date.now()), 30000);
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchOrders();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      clearInterval(pollId);
      clearInterval(clockId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchOrders]);

  const counts = useMemo(() => {
    let creada = 0;
    let completada = 0;
    orders.forEach((o) => {
      const st = normalizeOrderStatus(o.status);
      if (st === "Creada") creada += 1;
      else if (st === "Completada") completada += 1;
    });
    return { creada, completada, active: creada + completada };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = normalizeFilterText(searchQuery);

    return [...orders]
      .filter((o) => {
        const st = normalizeOrderStatus(o.status);
        if (st === "Pagada" || st === "Anulada") return false;
        if (statusFilter === "Creada" && st !== "Creada") return false;
        if (statusFilter === "Completada" && st !== "Completada") return false;

        if (creationDate && getOrderLocalDateKey(o) !== creationDate) {
          return false;
        }

        if (!q) return true;
        const itemText = (o.items || [])
          .map((it) => `${it.name || ""} ${it.code || ""} ${it.description || ""}`)
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
        const diff = getOrderTimestamp(a) - getOrderTimestamp(b);
        return creationSort === "asc" ? diff : -diff;
      });
  }, [orders, statusFilter, creationSort, creationDate, searchQuery]);

  const effectiveSelectedId = useMemo(() => {
    if (
      selectedOrderId &&
      filteredOrders.some((o) => o.id === selectedOrderId)
    ) {
      return selectedOrderId;
    }
    return filteredOrders[0]?.id || null;
  }, [filteredOrders, selectedOrderId]);

  const handleCompleteOrder = async (e, order) => {
    e.stopPropagation();
    const identifier = order.numericId || order.id;
    setCompletingId(order.id);
    try {
      await updateOrderStatus(identifier, "Completada");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? { ...o, status: "Completada", orderStatus: "Completada" }
            : o
        )
      );
      window.dispatchEvent(new CustomEvent("dpiero:orders-updated"));
      window.dispatchEvent(new CustomEvent("dpiero:notifications-refresh"));
      showKitchenBanner({
        type: "success",
        title: `Orden ${order.id} Completada`,
        message: `${order.tableNumber} lista en Cocina. Se envió notificación al Mesero para entrega en mesa.`,
      });
      fetchOrders();
    } catch (err) {
      showKitchenBanner({
        type: "error",
        title: "No se pudo completar la orden",
        message: err.message || "Intenta nuevamente actualizar la orden.",
      });
    } finally {
      setCompletingId(null);
    }
  };

  const scrollTrackBy = (dir) => {
    if (!trackRef.current) return;
    const step = Math.max(320, Math.round(trackRef.current.clientWidth * 0.78));
    trackRef.current.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 gap-3 font-[family-name:var(--main-font)] text-[var(--md-sys-color-on-surface)]">
      {kitchenBanner && (
        <div
          role="status"
          className={`dpiero-modal-in rounded-2xl px-4 py-2.5 border flex items-center justify-between gap-3 m3-elevation-1 shrink-0 ${
            kitchenBanner.type === "error"
              ? "bg-[var(--md-sys-color-error-container)] border-[var(--md-sys-color-error)]/50 text-[var(--md-sys-color-on-error-container)]"
              : "bg-[var(--color-success-bg)] border-[var(--color-success-border)] text-[var(--md-sys-color-on-surface)]"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <M3Icon
              name={kitchenBanner.type === "error" ? "error" : "check_circle"}
              filled
              size={20}
              className={
                kitchenBanner.type === "error"
                  ? "text-[var(--md-sys-color-error)] shrink-0"
                  : "text-[var(--color-success)] shrink-0"
              }
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">
                {kitchenBanner.title}
              </p>
              <p className="text-xs opacity-85 mt-0.5 truncate">
                {kitchenBanner.message}
              </p>
            </div>
          </div>
          <IconButton
            ariaLabel="Cerrar aviso"
            variant="standard"
            hitSize={32}
            iconSize={16}
            onClick={() => setKitchenBanner(null)}
          >
            <M3Icon name="close" size={16} />
          </IconButton>
        </div>
      )}

      {/* Barra superior compacta para maximizar el tamaño de las cards de pedidos */}
      <div className="bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl px-4 py-3 m3-elevation-1 shrink-0 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-10 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
              <M3Icon name="restaurant" size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="text-title-lg sm:text-headline-sm font-semibold truncate">
                Pedidos de Cocina
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <IconButton
              ariaLabel="Deslizar pedidos a la izquierda"
              title="Anterior"
              variant="outlined"
              hitSize={40}
              onClick={() => scrollTrackBy(-1)}
            >
              <M3Icon name="chevron_left" size={20} />
            </IconButton>
            <IconButton
              ariaLabel="Deslizar pedidos a la derecha"
              title="Siguiente"
              variant="outlined"
              hitSize={40}
              onClick={() => scrollTrackBy(1)}
            >
              <M3Icon name="chevron_right" size={20} />
            </IconButton>
            <IconButton
              ariaLabel="Actualizar pedidos"
              title="Actualizar pedidos"
              variant="tonal"
              hitSize={40}
              onClick={fetchOrders}
            >
              <M3Icon
                name="refresh"
                size={20}
                className={loading ? "animate-spin" : ""}
              />
            </IconButton>
          </div>
        </div>

        {/* Filtros por estado y por creación */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
          <div className="flex flex-nowrap items-center gap-2 w-full xl:w-auto xl:flex-1 min-w-0 overflow-x-auto scrollbar-none overscroll-x-contain py-0.5">
            {[
              { id: "Creada", label: "Por preparar", count: counts.creada, icon: "schedule" },
              { id: "Completada", label: "Completadas", count: counts.completada, icon: "task_alt" },
              { id: "active", label: "Todas activas", count: counts.active, icon: "grid_view" },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`m3-state shrink-0 inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap transition-colors ${
                    active
                      ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                      : "bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)]"
                  }`}
                >
                  <M3Icon name={active ? "check" : tab.icon} size={16} />
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums ${
                      active
                        ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
                        : "bg-[var(--md-sys-color-surface-container-high)]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none overscroll-x-contain py-0.5 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setCreationSort((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                title="Cambiar orden por fecha y hora de creación"
                className="m3-state shrink-0 inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-xs sm:text-sm font-medium text-[var(--md-sys-color-on-surface)] cursor-pointer whitespace-nowrap"
              >
                <M3Icon name="schedule" size={16} className="text-[var(--md-sys-color-primary)]" />
                <span>
                  Creación:{" "}
                  {creationSort === "asc" ? "Más antiguas" : "Más recientes"}
                </span>
              </button>

              <input
                type="date"
                value={creationDate}
                onChange={(e) => setCreationDate(e.target.value)}
                aria-label="Filtrar por fecha de creación"
                title="Filtrar por día de creación"
                className="m3-outlined-field shrink-0 h-10 px-2.5 text-sm bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] outline-none dark:[color-scheme:dark] cursor-pointer"
              />

              {creationDate && (
                <IconButton
                  ariaLabel="Quitar filtro de fecha"
                  title="Quitar fecha"
                  variant="tonal"
                  hitSize={40}
                  onClick={() => setCreationDate("")}
                >
                  <M3Icon name="close" size={18} />
                </IconButton>
              )}
            </div>

            <div className="w-full sm:w-56 shrink-0">
              <SearchField
                asForm={false}
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery("")}
                placeholder="Mesa, orden o platillo..."
                ariaLabel="Filtrar pedidos de cocina"
                size="sm"
                fullWidth
              />
            </div>
          </div>
        </div>
      </div>

      {/* Carrusel horizontal de cards gigantes que ocupan casi toda la pantalla */}
      {loading && orders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] text-sm text-[var(--md-sys-color-on-surface-variant)]">
          Cargando pedidos de cocina...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] gap-2">
          <div className="size-16 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-center text-[var(--md-sys-color-primary)] mb-1">
            <M3Icon name="task_alt" size={32} />
          </div>
          <h2 className="text-title-lg font-semibold">
            {statusFilter === "Creada"
              ? "Sin órdenes pendientes por preparar"
              : "No hay pedidos para el filtro aplicado"}
          </h2>
          <p className="text-body-sm text-[var(--md-sys-color-on-surface-variant)] max-w-md">
            Cuando el personal de salón registre nuevas órdenes aparecerán aquí automáticamente listas para su preparación.
          </p>
        </div>
      ) : (
        <div
          ref={trackRef}
          className="flex-1 min-h-0 flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory pb-2 px-0.5 items-stretch"
        >
          {filteredOrders.map((order, idx) => {
            const st = normalizeOrderStatus(order.status);
            const meta = getOrderStatusBadgeMeta(st);
            const isSelected = effectiveSelectedId === order.id;
            const isCreated = st === "Creada";
            const items = Array.isArray(order.items) ? order.items : [];
            const totalPortions = items.reduce(
              (acc, it) => acc + Math.max(1, Number(it.qty || it.quantity || 1)),
              0
            );
            const elapsedText = formatElapsedMinutes(
              order.created_at || order.createdAt,
              nowMs
            );
            const createdText = formatCreationTime(order);
            const hasObs =
              Boolean(order.observations) &&
              order.observations !== "Sin observaciones adicionales";

            return (
              <article
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={`snap-center sm:snap-start shrink-0 w-[90vw] sm:w-[82vw] md:w-[560px] lg:w-[620px] xl:w-[680px] min-h-[64dvh] max-h-[calc(100dvh-220px)] rounded-[28px] flex flex-col overflow-hidden cursor-pointer transition-all ${
                  isSelected
                    ? "border-2 border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-surface-container-low)] m3-elevation-2"
                    : "border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] hover:border-[var(--md-sys-color-primary)]/60 m3-elevation-1"
                }`}
              >
                {/* Cabecera de la comanda */}
                <header className="px-5 py-4 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="px-3.5 py-2 rounded-2xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-center shrink-0">
                      <span className="block text-[10px] uppercase tracking-wider opacity-85 font-medium leading-none">
                        Ubicación
                      </span>
                      <span className="text-lg font-bold leading-tight">
                        {order.tableNumber || "General"}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold font-mono text-[var(--md-sys-color-on-surface)]">
                          {order.id}
                        </h2>
                        <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] tabular-nums">
                          #{idx + 1} de {filteredOrders.length}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]">
                            <M3Icon name="restaurant" size={12} />
                            En atención
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] truncate mt-0.5">
                        Mesero: <strong className="text-[var(--md-sys-color-on-surface)]">{order.waiter || "Sin asignar"}</strong>
                        {createdText ? ` · ${createdText}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${meta.className}`}
                    >
                      <M3Icon name={meta.icon} size={14} />
                      {meta.label}
                    </span>
                    <span className="text-xs font-mono font-medium text-[var(--md-sys-color-primary)]">
                      {elapsedText}
                    </span>
                  </div>
                </header>

                {/* Observaciones generales de cocina */}
                <div
                  className={`px-5 py-3 border-b border-[var(--md-sys-color-outline-variant)] shrink-0 flex items-start gap-2.5 ${
                    hasObs
                      ? "bg-[var(--color-warning-bg)] text-[var(--md-sys-color-on-surface)]"
                      : "bg-[var(--md-sys-color-surface)]/70 text-[var(--md-sys-color-on-surface-variant)]"
                  }`}
                >
                  <M3Icon
                    name="description"
                    size={18}
                    className={
                      hasObs
                        ? "text-[var(--color-warning)] mt-0.5 shrink-0"
                        : "text-[var(--md-sys-color-on-surface-variant)] mt-0.5 shrink-0"
                    }
                  />
                  <div className="min-w-0 text-sm">
                    <span className="font-semibold block text-xs uppercase tracking-wider">
                      Observaciones para cocina
                    </span>
                    <p className={hasObs ? "font-medium mt-0.5" : "italic mt-0.5"}>
                      {hasObs
                        ? order.observations
                        : "Sin indicaciones especiales del cliente."}
                    </p>
                  </div>
                </div>

                {/* Detalle completo de cada platillo: foto, cantidad, nombre, código, categoría e ingredientes */}
                <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-3">
                  {items.map((item, itemIdx) => {
                    const qtyCount = Math.max(
                      1,
                      Number(item.qty || item.quantity || 1)
                    );
                    const ingredientsText =
                      (item.description || "").trim() ||
                      "Preparación tradicional D'Piero según receta estándar de carta.";

                    return (
                      <div
                        key={item.id || `${order.id}-${itemIdx}`}
                        className="rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] p-3.5 sm:p-4 flex items-start gap-3.5"
                      >
                        <div className="relative size-16 sm:size-20 rounded-xl overflow-hidden border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shrink-0">
                          <img
                            src={getProductImage(item)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = imgPunta;
                            }}
                          />
                          {item.code && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-white text-[10px] font-mono leading-none">
                              {item.code}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="inline-flex items-center justify-center min-w-[2.25rem] h-8 px-2.5 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-base font-bold tabular-nums shrink-0">
                                {qtyCount}x
                              </span>
                              <h3 className="text-base sm:text-lg font-semibold text-[var(--md-sys-color-on-surface)] leading-snug">
                                {item.name}
                              </h3>
                            </div>

                            {item.category && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] shrink-0">
                                {item.category}
                              </span>
                            )}
                          </div>

                          <div className="text-sm leading-relaxed text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container-low)] rounded-xl px-3 py-2 border border-[var(--md-sys-color-outline-variant)]/60">
                            <span className="font-semibold text-[var(--md-sys-color-on-surface)]">
                              Contiene:{" "}
                            </span>
                            {ingredientsText}
                          </div>

                          {item.notes && (
                            <p className="text-xs font-medium text-[var(--color-warning)] bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] rounded-lg px-2.5 py-1.5">
                              Nota puntual: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pie fijo con resumen y acción de Completar */}
                <footer className="px-5 py-4 border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shrink-0 space-y-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    <span>
                      <strong className="text-[var(--md-sys-color-on-surface)]">
                        {items.length}
                      </strong>{" "}
                      {items.length === 1 ? "producto distinto" : "productos distintos"} ·{" "}
                      <strong className="text-[var(--md-sys-color-on-surface)]">
                        {totalPortions}
                      </strong>{" "}
                      {totalPortions === 1 ? "porción total" : "porciones totales"}
                    </span>
                    <span className="font-mono">{elapsedText}</span>
                  </div>

                  {isCreated ? (
                    <Button
                      type="button"
                      variant="filled"
                      size="lg"
                      leadingIcon="check_circle"
                      disabled={completingId === order.id}
                      onClick={(e) => handleCompleteOrder(e, order)}
                      className="w-full"
                    >
                      {completingId === order.id
                        ? "Marcando como Completada..."
                        : "Completar Orden"}
                    </Button>
                  ) : (
                    <div className="min-h-[48px] px-4 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center gap-2 text-sm font-semibold">
                      <M3Icon name="task_alt" size={18} />
                      <span>Orden Completada • Notificada al Mesero para entrega en mesa</span>
                    </div>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
