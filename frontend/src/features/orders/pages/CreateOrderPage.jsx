import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Button,
  IconButton,
  M3Icon,
  SearchField,
  DataTable,
  ConfirmDialog,
  showSuccessAlert,
  showErrorAlert,
  Input,
} from "@/shared";
import { getProducts } from "@/features/products/services/productServices";
import {
  getOrders,
  createOrder,
  cancelOrder,
  getTablesAvailability,
} from "../services/orderServices";
import { getOrderColumns } from "../table/OrderColumns";
import OrderViewModal from "../components/OrderViewModal";
import KitchenOrdersView from "../components/KitchenOrdersView";
import WaiterOrdersView from "../components/WaiterOrdersView";
import OrderStatusFilterBar from "../components/OrderStatusFilterBar";
import TableSelectorGrid from "../components/TableSelectorGrid";
import OrderDishCard from "../components/OrderDishCard";
import PosCategoryFilter from "@/features/home/components/PosCategoryFilter";
import { useScrollableBatch } from "../hooks/useScrollableBatch";
import usePermission from "@/features/access/services/usePermission";
import { getUserRoleFlags } from "@/shared/utils/authStorage";
import {
  readOrderDraft,
  saveOrderDraft,
  readInitialHandoffQty,
  clearOrderDraft,
  consumeOrderHandoff,
} from "../utils/orderDraftStorage";
import {
  summarizeOrderStatuses,
  mapProductToDish,
  filterDishesByQueryAndCategory,
  computeDishDynamicMaxStock,
} from "../utils/orderFormHelpers";

export default function CreateOrder() {
  const location = useLocation();
  const { isAdmin, isCajero, isMesero, isCocina } = getUserRoleFlags();
  const canPayOrder = isAdmin || isCajero;
  const { granted: canEditOrder } = usePermission("update_order");
  const initialDraft = useMemo(() => readOrderDraft(), []);

  const [activeTab, setActiveTab] = useState("create"); // 'create' | 'list'
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [tablesList, setTablesList] = useState([]);
  const [isTablesExpanded, setIsTablesExpanded] = useState(true);

  const [form, setForm] = useState(() => ({
    tableNumber: initialDraft.tableNumber || "",
    observations: initialDraft.observations || "",
  }));

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [qty, setQty] = useState(() => readInitialHandoffQty());
  const [pinnedDishIds, setPinnedDishIds] = useState(() => {
    const preId = Number(location.state?.preselectedProduct?.id);
    return new Set([
      ...(initialDraft.pinnedIds || []),
      ...Object.keys(readInitialHandoffQty()).map(String),
      ...(Number.isInteger(preId) && preId > 0 ? [String(preId)] : []),
    ]);
  });
  const [dishSearch, setDishSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const draftHydratedRef = useRef(false);

  // Cargar productos, órdenes y disponibilidad de mesas en tiempo real
  const fetchInitialData = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const [prods, ords, tbls] = await Promise.all([
        getProducts({ activeOnly: false }),
        getOrders().catch((err) => {
          console.warn("Error cargando órdenes:", err);
          return [];
        }),
        getTablesAvailability().catch((err) => {
          console.warn("Error cargando mesas:", err);
          return [];
        }),
      ]);
      const safeProds = prods || [];
      setProductsList(safeProds);
      setOrders(ords || []);
      setTablesList(tbls || []);

      const handoffResult = consumeOrderHandoff(safeProds);
      const stockMap = new Map(
        safeProds.map((p) => [
          String(p.id),
          p.is_active ? Math.max(0, Math.floor(Number(p.stock) || 0)) : 0,
        ])
      );

      setQty((prev) => {
        const next = { ...prev };
        if (handoffResult?.removeInvalidId) {
          delete next[String(handoffResult.removeInvalidId)];
        } else if (handoffResult?.resolvedQty) {
          Object.entries(handoffResult.resolvedQty).forEach(([k, v]) => {
            next[String(k)] = (next[String(k)] || 0) + v;
          });
        }
        // Acotar siempre cada ítem guardado en el borrador al stock vigente de BD
        if (safeProds.length > 0) {
          Object.keys(next).forEach((idKey) => {
            if (!stockMap.has(idKey)) return;
            const avail = stockMap.get(idKey);
            if (avail <= 0) {
              delete next[idKey];
            } else if (next[idKey] > avail) {
              next[idKey] = avail;
            }
          });
        }
        return next;
      });

      if (handoffResult?.removeInvalidId) {
        const badId = String(handoffResult.removeInvalidId);
        setPinnedDishIds((prev) => {
          const next = new Set(prev);
          next.delete(badId);
          return next;
        });
      } else if (handoffResult?.resolvedQty) {
        setPinnedDishIds((prev) => {
          const next = new Set(prev);
          Object.keys(handoffResult.resolvedQty).forEach((k) =>
            next.add(String(k))
          );
          return next;
        });
      }

      // Preseleccionar primera mesa disponible si no hay ninguna o si la actual dejó de estarlo
      setForm((prev) => {
        const stillAvailable = (tbls || []).some(
          (t) => t.tableNumber === prev.tableNumber && t.isAvailable
        );
        if (prev.tableNumber && stillAvailable) return prev;
        const firstAvailable = (tbls || []).find((t) => t.isAvailable);
        return {
          ...prev,
          tableNumber: firstAvailable ? firstAvailable.tableNumber : "",
        };
      });
    } catch (err) {
      console.error("Error al cargar datos en CreateOrder:", err);
    } finally {
      draftHydratedRef.current = true;
      setLoadingProducts(false);
    }
  }, []);

  // Persistir borrador activo en sessionStorage durante la sesión
  useEffect(() => {
    if (!draftHydratedRef.current || isCocina) return;
    saveOrderDraft({
      qty,
      tableNumber: form.tableNumber,
      observations: form.observations,
      pinnedIds: Array.from(pinnedDishIds),
    });
  }, [qty, form.tableNumber, form.observations, pinnedDishIds, isCocina]);

  useEffect(() => {
    if (isCocina) return;
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchInitialData();
    });
    return () => {
      active = false;
    };
  }, [fetchInitialData, isCocina]);

  useEffect(() => {
    if (isCocina) return;
    const handleRefresh = () => {
      if (document.visibilityState === "visible") {
        fetchInitialData();
      }
    };
    window.addEventListener("focus", fetchInitialData);
    document.addEventListener("visibilitychange", handleRefresh);
    return () => {
      window.removeEventListener("focus", fetchInitialData);
      document.removeEventListener("visibilitychange", handleRefresh);
    };
  }, [fetchInitialData, isCocina]);

  const dishes = useMemo(
    () => productsList.map(mapProductToDish),
    [productsList]
  );

  const filteredDishes = useMemo(
    () =>
      filterDishesByQueryAndCategory(dishes, {
        search: dishSearch,
        category: selectedCategory,
        pinnedIds: pinnedDishIds,
      }),
    [dishes, dishSearch, selectedCategory, pinnedDishIds]
  );

  const {
    scrollContainerRef: dishesScrollRef,
    visibleItems: visibleDishes,
    totalCount: totalFilteredDishes,
    visibleCount: visibleDishesCount,
    hasMore: hasMoreDishes,
    loadMore: loadMoreDishes,
    handleScroll: handleDishesScroll,
  } = useScrollableBatch(filteredDishes, `${selectedCategory}::${dishSearch}`, 12);

  const totalAmount = useMemo(() => {
    return dishes.reduce(
      (sum, d) => sum + d.price * (qty[d.id] || 0),
      0
    );
  }, [dishes, qty]);

  const totalItems = useMemo(() => {
    return Object.values(qty).reduce((a, b) => a + b, 0);
  }, [qty]);

  const handleIncrement = (dish) => {
    if (dish.status === "Inactivo") {
      showErrorAlert({
        title: "Platillo inhabilitado",
        text: `El platillo "${dish.name}" se encuentra inhabilitado y no puede ser agregado a ninguna orden.`,
      });
      return;
    }

    const availableStock = computeDishDynamicMaxStock(dish, dishes, qty);
    const currentCount = qty[dish.id] || 0;
    if (availableStock <= 0 || currentCount >= availableStock) {
      showErrorAlert({
        title: "Stock insuficiente",
        text:
          availableStock <= 0
            ? `"${dish.name}" está agotado y no tiene unidades disponibles.`
            : `Solo hay ${availableStock} ${availableStock === 1 ? "unidad disponible" : "unidades disponibles"} de "${dish.name}".`,
      });
      return;
    }

    setQty((prev) => ({
      ...prev,
      [dish.id]: currentCount + 1,
    }));
  };

  const handleDecrement = (dish) => {
    setQty((prev) => {
      const current = prev[dish.id] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[dish.id];
        return next;
      }
      return { ...prev, [dish.id]: current - 1 };
    });
  };

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSelectTablePill = (table) => {
    if (!table.isAvailable) {
      showErrorAlert({
        title: "Mesa Ocupada",
        text: `La ${table.tableNumber} está actualmente ocupada con la orden ${table.activeOrderNumber || "activa"}. Seleccione otra mesa disponible.`,
      });
      return;
    }
    setForm((prev) => ({ ...prev, tableNumber: table.tableNumber }));
    setIsTablesExpanded(false);
    if (errors.tableNumber) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.tableNumber;
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fieldErrors = {};
    if (!form.tableNumber.trim()) {
      fieldErrors.tableNumber = "La mesa es obligatoria.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setIsTablesExpanded(true);
      return;
    }

    if (totalItems === 0) {
      await showErrorAlert({
        title: "Orden vacía",
        text: "Debes agregar al menos un platillo disponible para registrar la orden.",
      });
      return;
    }

    const overStockDish = dishes.find(
      (d) => (qty[d.id] || 0) > computeDishDynamicMaxStock(d, dishes, qty)
    );
    if (overStockDish) {
      const dynamicMax = computeDishDynamicMaxStock(overStockDish, dishes, qty);
      await showErrorAlert({
        title: "Stock insuficiente",
        text: `La cantidad de "${overStockDish.name}" supera el stock disponible (${dynamicMax}).`,
      });
      return;
    }

    const currentTableObj = tablesList.find(
      (t) => t.tableNumber.toLowerCase() === form.tableNumber.toLowerCase()
    );

    if (currentTableObj && !currentTableObj.isAvailable) {
      await showErrorAlert({
        title: "Mesa Ocupada",
        text: `La "${form.tableNumber}" ya tiene una orden activa (${currentTableObj.activeOrderNumber || "en curso"}). No se permite registrar una orden sobre una mesa ocupada.`,
      });
      setIsTablesExpanded(true);
      return;
    }

    const selectedItems = dishes
      .filter((d) => (qty[d.id] || 0) > 0)
      .map((d) => ({
        productId: d.id,
        quantity: qty[d.id],
        unitPrice: d.price,
        notes: "",
      }));

    setSubmitting(true);

    try {
      const tableFormatted = form.tableNumber.startsWith("Mesa")
        ? form.tableNumber
        : `Mesa ${form.tableNumber}`;

      const created = await createOrder({
        tableNumber: tableFormatted,
        observations: form.observations || "Sin observaciones adicionales",
        items: selectedItems,
      });

      const creatorName = created.order?.waiter;

      await showSuccessAlert({
        title: "Orden Creada",
        text: creatorName
          ? `Orden ${created.order?.order_number || "creada"} para ${tableFormatted} registrada por ${creatorName}.`
          : `Orden ${created.order?.order_number || "creada"} para ${tableFormatted} registrada con éxito.`,
      });

      setQty({});
      setPinnedDishIds(new Set());
      setForm((prev) => ({ ...prev, observations: "" }));
      clearOrderDraft();
      setErrors({});
      fetchInitialData();
    } catch (err) {
      console.error("Error al registrar orden:", err);
      await showErrorAlert({
        title: "Error al registrar orden",
        text: err.message || "No se pudo guardar la orden.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleRequestCancel = (order) => {
    setOrderToCancel(order);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    try {
      const identifier = orderToCancel.numericId || orderToCancel.id;
      await cancelOrder(identifier, "Cancelada desde módulo de orden");

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderToCancel.id
            ? { ...o, status: "Anulada", orderStatus: "Anulada" }
            : o
        )
      );

      await showSuccessAlert({
        title: "Orden Anulada",
        text: `La orden ${orderToCancel.id} ha sido anulada correctamente.`,
      });
      fetchInitialData();
    } catch (err) {
      if (err?.isStepUpCancelled) return;
      console.error("Error al cancelar orden:", err);
      await showErrorAlert({
        title: "Error al anular",
        text: err.message || "No se pudo anular la orden.",
      });
    } finally {
      setOrderToCancel(null);
    }
  };

  const orderColumns = useMemo(
    () =>
      getOrderColumns({
        onViewOrder: handleViewOrder,
        onRequestCancel: handleRequestCancel,
        canEdit: canEditOrder,
        canPay: canPayOrder,
      }),
    [canEditOrder, canPayOrder]
  );

  const { normalizedOrders, statusCounts, filteredOrders } = useMemo(() => {
    const sorted = [...orders].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0);
      const dateB = new Date(b.createdAt || b.created_at || 0);
      return dateB - dateA;
    });
    const { normalizedOrders: normalized, counts } =
      summarizeOrderStatuses(sorted);
    const filtered =
      statusFilter === "all"
        ? normalized
        : normalized.filter((o) => o.status === statusFilter);
    return {
      normalizedOrders: normalized,
      statusCounts: counts,
      filteredOrders: filtered,
    };
  }, [orders, statusFilter]);

  if (isCocina) {
    return <KitchenOrdersView />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col font-[family-name:var(--main-font)]">
      {/* Cabecera M3 del módulo de órdenes */}
      <div className="bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-4 sm:p-5 m3-elevation-1 mb-4 sm:mb-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <IconButton
              type="button"
              variant="tonal"
              hitSize={40}
              iconSize={20}
              ariaLabel="Volver"
              title="Volver"
              className="shrink-0"
              onClick={() => {
                if (activeTab === "list") {
                  setActiveTab("create");
                  fetchInitialData();
                } else {
                  window.history.back();
                }
              }}
            >
              <M3Icon name="arrow_back" size={20} />
            </IconButton>

            <div className="min-w-0 text-left">
              <h1 className="text-title-lg sm:text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)] leading-tight">
                {activeTab === "create" ? "Crear Nueva Orden" : "Listado de Órdenes"}
              </h1>
            </div>
          </div>

          {/* M3 Segmented Button para alternar creación / listado */}
          <div
            role="tablist"
            aria-label="Cambiar vista del módulo de órdenes"
            className="grid grid-cols-2 rounded-full border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] overflow-hidden divide-x divide-[var(--md-sys-color-outline)] w-full lg:w-auto lg:min-w-[336px] shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "create"}
              onClick={() => {
                setActiveTab("create");
                fetchInitialData();
              }}
              className={`m3-state flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 text-label-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--md-sys-color-primary)] transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "create"
                  ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                  : "bg-transparent text-[var(--md-sys-color-on-surface)]"
              }`}
            >
              <M3Icon name={activeTab === "create" ? "check" : "add_circle"} size={18} />
              <span>Nueva Orden</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "list"}
              onClick={() => setActiveTab("list")}
              className={`m3-state flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 text-label-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--md-sys-color-primary)] transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "list"
                  ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                  : "bg-transparent text-[var(--md-sys-color-on-surface)]"
              }`}
            >
              <M3Icon name="receipt_long" size={18} />
              <span>Ver Órdenes</span>
              <span className="inline-flex items-center justify-center min-w-6 h-5 px-2 rounded-full text-label-sm font-semibold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] tabular-nums">
                {normalizedOrders.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeTab === "create" ? (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 sm:gap-5">
            {/* Datos de la orden centrados horizontalmente; al colapsar Mesas queda compacto sin espacio muerto */}
            <div className="bg-[var(--md-sys-color-surface-container-low)] p-4 sm:p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] m3-elevation-1 space-y-3.5">
              <h2 className="text-label-lg font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)] border-b border-[var(--md-sys-color-outline-variant)] pb-2">
                Datos de la Orden
              </h2>

              <div
                className={
                  isTablesExpanded
                    ? "space-y-4"
                    : "grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end"
                }
              >
                <div className={isTablesExpanded ? "w-full" : "md:col-span-5"}>
                  <TableSelectorGrid
                    tables={tablesList}
                    selectedTableNumber={form.tableNumber}
                    onSelectTable={handleSelectTablePill}
                    isExpanded={isTablesExpanded}
                    onToggleExpanded={setIsTablesExpanded}
                    error={errors.tableNumber}
                  />
                </div>

                <div className={isTablesExpanded ? "w-full" : "md:col-span-7"}>
                  <Input
                    label="Observaciones de cocina"
                    name="observations"
                    placeholder="Términos de carne, sin cebolla, etc."
                    value={form.observations}
                    onChange={handleChangeForm}
                  />
                </div>
              </div>
            </div>

            {/* Selector de platillos con búsqueda y categorías horizontales */}
            <div className="flex-1 flex flex-col bg-[var(--md-sys-color-surface-container-low)] p-4 sm:p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] m3-elevation-1">
              <div className="space-y-3 pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
                <SearchField
                  asForm={false}
                  fullWidth={true}
                  loading={loadingProducts}
                  value={dishSearch}
                  onChange={setDishSearch}
                  onClear={() => setDishSearch("")}
                  placeholder="Buscar platillo por nombre o código..."
                  ariaLabel="Buscar platillo en el menú gastronómico"
                  size="sm"
                  variant="filled"
                />

                <PosCategoryFilter
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  products={dishes}
                />
              </div>

              <div
                ref={dishesScrollRef}
                onScroll={handleDishesScroll}
                className="mt-3 max-h-[460px] lg:max-h-[580px] overflow-y-auto overscroll-contain pr-1"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {visibleDishes.length === 0 ? (
                    <div className="sm:col-span-2 lg:col-span-3 py-12 text-center text-body-md text-[var(--md-sys-color-on-surface-variant)] rounded-2xl bg-[var(--md-sys-color-surface)] border border-dashed border-[var(--md-sys-color-outline-variant)]">
                      No se encontraron platillos que coincidan con el filtro aplicado.
                    </div>
                  ) : (
                    visibleDishes.map((dish) => (
                      <OrderDishCard
                        key={dish.id}
                        dish={dish}
                        count={qty[dish.id] || 0}
                        maxStock={computeDishDynamicMaxStock(dish, dishes, qty)}
                        onIncrement={handleIncrement}
                        onDecrement={handleDecrement}
                      />
                    ))
                  )}
                </div>

                {totalFilteredDishes > 0 && (
                  <div className="mt-4 pt-3 border-t border-[var(--md-sys-color-outline-variant)] flex items-center justify-between gap-2 text-body-sm text-[var(--md-sys-color-on-surface-variant)]">
                    <span>
                      Mostrando {visibleDishesCount} de {totalFilteredDishes} platillos
                    </span>
                    {hasMoreDishes && (
                      <Button
                        type="button"
                        variant="text"
                        size="sm"
                        onClick={loadMoreDishes}
                      >
                        Cargar más platillos
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Barra inferior fija dentro del área centrada */}
            <div className="sticky bottom-0 z-30 mt-auto bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl m3-elevation-2">
              <div className="w-full px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-label-md text-[var(--md-sys-color-on-surface-variant)]">
                    <span>
                      {totalItems} {totalItems === 1 ? "ítem" : "ítems"} •{" "}
                      {form.tableNumber || "Sin mesa"}
                    </span>
                    {totalItems > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setQty({});
                          setPinnedDishIds(new Set());
                          clearOrderDraft();
                        }}
                        className="m3-state min-h-[36px] px-3 rounded-full text-label-md font-medium text-[var(--md-sys-color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer"
                      >
                        Vaciar
                      </button>
                    )}
                  </div>
                  <p className="text-title-lg font-bold text-[var(--md-sys-color-on-surface)] tabular-nums truncate">
                    ${totalAmount.toLocaleString("es-CO")} COP
                  </p>
                </div>
                <Button
                  type="submit"
                  variant="filled"
                  size="md"
                  leadingIcon="check_circle"
                  className="shrink-0"
                  disabled={submitting || totalItems === 0}
                >
                  {submitting ? "Registrando..." : "Registrar Orden"}
                </Button>
              </div>
            </div>
          </form>
        ) : isMesero ? (
          <WaiterOrdersView />
        ) : (
          /* Pestaña de listado */
          <div className="flex-1 flex flex-col bg-[var(--md-sys-color-surface-container-low)] p-4 sm:p-6 rounded-2xl border border-[var(--md-sys-color-outline-variant)] m3-elevation-1">
            <OrderStatusFilterBar
              value={statusFilter}
              onChange={setStatusFilter}
              counts={statusCounts}
              className="mb-3"
            />
            <DataTable
              className="flex-1"
              data={filteredOrders}
              columns={orderColumns}
            />
          </div>
        )}
      </div>

      <OrderViewModal
        order={selectedOrder}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedOrder(null);
        }}
      />

      {orderToCancel && (
        <ConfirmDialog
          isOpen={Boolean(orderToCancel)}
          title="Anular Orden del Sistema"
          description={`¿Estás seguro de que deseas anular la orden ${orderToCancel.id}?`}
          confirmText="Sí, anular orden"
          cancelText="No, conservar"
          isDestructive={true}
          onConfirm={handleConfirmCancel}
          onCancel={() => setOrderToCancel(null)}
        />
      )}
    </div>
  );
}
