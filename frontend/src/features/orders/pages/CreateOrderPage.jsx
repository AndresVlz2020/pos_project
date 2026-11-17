import { useState, useMemo, useEffect, useCallback } from "react";
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
import { getOrders, createOrder, cancelOrder, getTablesAvailability } from "../services/orderServices";
import { getOrderColumns } from "../table/OrderColumns";
import OrderViewModal from "../components/OrderViewModal";
import TableSelectorGrid from "../components/TableSelectorGrid";
import { useScrollableBatch } from "../hooks/useScrollableBatch";
import {
  readInitialHandoffQty,
  clearOrderDraft,
  consumeOrderHandoff,
} from "../utils/orderDraftStorage";
import { getProductImage, imgPunta } from "@/utils/imageHelper";

export default function CreateOrder() {
  const [activeTab, setActiveTab] = useState("create"); // 'create' | 'list'
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [tablesList, setTablesList] = useState([]);

  const [form, setForm] = useState({
    tableNumber: "",
    observations: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [qty, setQty] = useState(() => readInitialHandoffQty());
  const [pinnedDishIds, setPinnedDishIds] = useState(
    () => new Set(Object.keys(readInitialHandoffQty()).map(String))
  );
  const [dishSearch, setDishSearch] = useState("");

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
      setProductsList(prods || []);
      setOrders(ords || []);
      setTablesList(tbls || []);

      // Consumir transferencia única enviada desde Inicio (sin arrastrar órdenes no registradas)
      const handoffResult = consumeOrderHandoff(prods || []);
      if (handoffResult?.removeInvalidId) {
        const badId = String(handoffResult.removeInvalidId);
        setQty((prev) => {
          const next = { ...prev };
          delete next[badId];
          return next;
        });
        setPinnedDishIds((prev) => {
          const next = new Set(prev);
          next.delete(badId);
          return next;
        });
      } else if (handoffResult?.resolvedQty) {
        setQty((prev) => ({
          ...prev,
          ...handoffResult.resolvedQty,
        }));
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
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchInitialData();
    });
    return () => {
      active = false;
    };
  }, [fetchInitialData]);

  useEffect(() => {
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
  }, [fetchInitialData]);

  // Regla RFADMIN29 / RFADMIN24: Platillos inhabilitados excluidos de órdenes
  const dishes = useMemo(() => {
    return productsList.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.title || p.name,
      price: Number(p.price) || 0,
      stock: Number(p.stock) || 0,
      status: p.is_active ? "Disponible" : "Inactivo",
      image: p.image,
    }));
  }, [productsList]);

  const filteredDishes = useMemo(() => {
    const q = dishSearch.trim().toLowerCase();
    const list = !q
      ? dishes
      : dishes.filter(
          (d) =>
            (d.name || "").toLowerCase().includes(q) ||
            (d.code || "").toLowerCase().includes(q)
        );

    if (pinnedDishIds.size === 0) return list;
    return [...list].sort((a, b) => {
      const aPinned = pinnedDishIds.has(String(a.id)) ? 1 : 0;
      const bPinned = pinnedDishIds.has(String(b.id)) ? 1 : 0;
      return bPinned - aPinned;
    });
  }, [dishes, dishSearch, pinnedDishIds]);

  const {
    scrollContainerRef: dishesScrollRef,
    visibleItems: visibleDishes,
    totalCount: totalFilteredDishes,
    visibleCount: visibleDishesCount,
    hasMore: hasMoreDishes,
    loadMore: loadMoreDishes,
    handleScroll: handleDishesScroll,
  } = useScrollableBatch(filteredDishes, dishSearch, 10);

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

    setQty((prev) => ({
      ...prev,
      [dish.id]: (prev[dish.id] || 0) + 1,
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
      return;
    }

    if (totalItems === 0) {
      await showErrorAlert({
        title: "Orden vacía",
        text: "Debes agregar al menos un platillo disponible para registrar la orden.",
      });
      return;
    }

    // Regla RFADMIN26: Validación de mesa disponible
    const currentTableObj = tablesList.find(
      (t) => t.tableNumber.toLowerCase() === form.tableNumber.toLowerCase()
    );

    if (currentTableObj && !currentTableObj.isAvailable) {
      await showErrorAlert({
        title: "Mesa Ocupada",
        text: `La "${form.tableNumber}" ya tiene una orden activa (${currentTableObj.activeOrderNumber || "en curso"}). No se permite registrar una orden sobre una mesa ocupada.`,
      });
      return;
    }

    // Construir items seleccionados para backend
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

      // Notificación clara y limpia (sin mención de PostgreSQL)
      await showSuccessAlert({
        title: "Orden Creada",
        text: creatorName
          ? `Orden ${created.order?.order_number || "creada"} para ${tableFormatted} registrada por ${creatorName}.`
          : `Orden ${created.order?.order_number || "creada"} para ${tableFormatted} registrada con éxito.`,
      });

      // Resetear formulario y recargar mesas/órdenes (la factura se genera al pagar, no al crear)
      setQty({});
      setPinnedDishIds(new Set());
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
      }),
    []
  );

  return (
    <div className="w-full flex-1 flex flex-col font-[family-name:var(--main-font)]">
      {/* Cabecera M3 del módulo de órdenes */}
      <div className="bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-4 sm:p-5 m3-elevation-1 mb-4 sm:mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3.5 sm:gap-4">
          <div className="grid grid-cols-[auto_1fr_auto] md:flex items-center gap-3 sm:gap-4 min-w-0">
            <IconButton
              type="button"
              variant="tonal"
              hitSize={40}
              iconSize={20}
              ariaLabel="Volver"
              title="Volver"
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

            <div className="min-w-0 text-center md:text-left">
              <h1 className="text-title-lg sm:text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                {activeTab === "create" ? "Crear Nueva Orden" : "Listado de Órdenes"}
              </h1>
              <p className="text-body-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                Gestión en tiempo real de mesas y órdenes del restaurante
              </p>
            </div>

            <div className="w-10 md:hidden" aria-hidden="true" />
          </div>

          {/* M3 Segmented Button para alternar creación / listado */}
          <div
            role="tablist"
            aria-label="Cambiar vista del módulo de órdenes"
            className="grid grid-cols-2 rounded-full border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] overflow-hidden divide-x divide-[var(--md-sys-color-outline)] w-full md:w-auto md:min-w-[384px] shrink-0"
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
                {orders.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeTab === "create" ? (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 sm:gap-5">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
            {/* Formulario datos de la orden */}
            <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4 bg-[var(--md-sys-color-surface-container-low)] p-4 sm:p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] m3-elevation-1">
              <h2 className="text-label-lg font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)] border-b border-[var(--md-sys-color-outline-variant)] pb-2">
                Datos de la Orden
              </h2>

              {/* Mapa visual interactivo de mesas con su número */}
              <TableSelectorGrid
                tables={tablesList}
                selectedTableNumber={form.tableNumber}
                onSelectTable={handleSelectTablePill}
                error={errors.tableNumber}
              />

              <Input
                label="Observaciones de cocina"
                name="observations"
                placeholder="Términos de carne, sin cebolla, etc."
                value={form.observations}
                onChange={handleChangeForm}
              />
            </div>

            {/* Selector de platillos gastronómicos en contenedor desplazable independiente */}
            <div className="lg:col-span-8 flex flex-col bg-[var(--md-sys-color-surface-container-low)] p-4 sm:p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] m3-elevation-1">
              <div className="pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
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
              </div>

              <div
                ref={dishesScrollRef}
                onScroll={handleDishesScroll}
                className="mt-3 max-h-[420px] lg:max-h-[560px] overflow-y-auto overscroll-contain pr-1"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
                  {visibleDishes.length === 0 ? (
                    <div className="md:col-span-2 2xl:col-span-3 py-12 text-center text-body-md text-[var(--md-sys-color-on-surface-variant)] rounded-2xl bg-[var(--md-sys-color-surface)] border border-dashed border-[var(--md-sys-color-outline-variant)]">
                      No se encontraron platillos que coincidan con &ldquo;{dishSearch.trim()}&rdquo;.
                    </div>
                  ) : visibleDishes.map((dish) => {
                    const count = qty[dish.id] || 0;
                    const isInactive = dish.status === "Inactivo";

                    return (
                      <div
                        key={dish.id}
                        className={`p-3 rounded-2xl border transition-colors flex items-center justify-between gap-3 ${
                          isInactive
                            ? "bg-[var(--md-sys-color-surface-container-highest)]/40 border-[var(--md-sys-color-outline-variant)] opacity-50 cursor-not-allowed"
                            : count > 0
                            ? "bg-[var(--md-sys-color-primary-container)]/30 border-[var(--md-sys-color-primary)] m3-elevation-1"
                            : "bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-primary)]/60"
                        }`}
                      >
                        {/* Imagen pequeña del platillo */}
                        <div className="size-12 sm:size-14 rounded-xl overflow-hidden border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shrink-0">
                          <img
                            src={getProductImage(dish)}
                            alt={dish.name}
                            className={`w-full h-full object-cover transition duration-150 ${
                              isInactive ? "grayscale contrast-75" : ""
                            }`}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = imgPunta;
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-label-sm font-mono block ${
                              isInactive
                                ? "text-[var(--md-sys-color-outline)]"
                                : "text-[var(--md-sys-color-on-surface-variant)]"
                            }`}
                          >
                            {dish.code}
                          </span>
                          <h4
                            className={`text-title-sm font-medium truncate ${
                              isInactive
                                ? "text-[var(--md-sys-color-on-surface-variant)]"
                                : "text-[var(--md-sys-color-on-surface)]"
                            }`}
                          >
                            {dish.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-body-sm font-semibold tabular-nums ${
                                isInactive
                                  ? "text-[var(--md-sys-color-outline)]"
                                  : "text-[var(--md-sys-color-primary)]"
                              }`}
                            >
                              ${dish.price.toLocaleString("es-CO")}
                            </span>
                          </div>
                        </div>

                        {/* Contador de unidades M3 de 40dp */}
                        <div className="flex items-center gap-1 bg-[var(--md-sys-color-surface-container-high)] p-1 rounded-full border border-[var(--md-sys-color-outline-variant)] shrink-0">
                          <IconButton
                            type="button"
                            variant="standard"
                            hitSize={40}
                            iconSize={18}
                            disabled={count === 0}
                            onClick={() => handleDecrement(dish)}
                            ariaLabel={`Disminuir ${dish.name}`}
                          >
                            <M3Icon name="remove" size={18} />
                          </IconButton>
                          <span className="text-label-lg font-semibold w-7 text-center text-[var(--md-sys-color-on-surface)] tabular-nums">
                            {count}
                          </span>
                          <IconButton
                            type="button"
                            variant="tonal"
                            hitSize={40}
                            iconSize={18}
                            disabled={isInactive}
                            onClick={() => handleIncrement(dish)}
                            ariaLabel={`Aumentar ${dish.name}`}
                          >
                            <M3Icon name="add" size={18} />
                          </IconButton>
                        </div>
                      </div>
                    );
                  })}
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
            </div>

            {/* Barra inferior fija dentro del área de trabajo para enviar orden sin cubrir el Navigation Rail */}
            <div className="sticky bottom-0 z-30 mt-auto bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl m3-elevation-2">
              <div className="w-full px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-label-md text-[var(--md-sys-color-on-surface-variant)]">
                    <span>
                      {totalItems} {totalItems === 1 ? "ítem" : "ítems"} • {form.tableNumber || "Sin mesa"}
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
        ) : (
          /* Pestaña de listado */
          <div className="flex-1 flex flex-col bg-[var(--md-sys-color-surface-container-low)] p-4 sm:p-6 rounded-2xl border border-[var(--md-sys-color-outline-variant)] m3-elevation-1">
            <DataTable className="flex-1" data={orders} columns={orderColumns} />
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
