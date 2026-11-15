import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Button,
  SearchField,
  DataTable,
  ConfirmDialog,
  showSuccessAlert,
  showErrorAlert,
  Input,
} from "@/shared";
import { ArrowLeft, ClipboardList, PlusCircle } from "lucide-react";
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
    <div className="w-full pb-24 font-[family-name:var(--main-font)]">
      {/* Cabecera unificada del módulo de órdenes */}
      <div className="bg-[var(--color-secondary-900)] text-[var(--color-white)] border border-[var(--color-secondary-800)] rounded-xl p-3.5 sm:p-5 shadow-md mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3.5 sm:gap-4">
          <div className="grid grid-cols-[auto_1fr_auto] md:flex items-center gap-3 sm:gap-4 min-w-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-label="Volver"
              className="shrink-0 w-9 h-9 px-0 flex items-center justify-center"
              onClick={() => {
                if (activeTab === "list") {
                  setActiveTab("create");
                  fetchInitialData();
                } else {
                  window.history.back();
                }
              }}
            >
              <ArrowLeft className="size-4" />
            </Button>

            <div className="min-w-0 text-center md:text-left">
              <h1 className="text-lg sm:text-xl font-bold text-[var(--color-white)] leading-tight">
                {activeTab === "create" ? "Crear Nueva Orden" : "Listado de Órdenes"}
              </h1>
              <p className="text-xs text-[var(--color-gray-400)] mt-0.5">
                Gestión en tiempo real de mesas y órdenes del restaurante
              </p>
            </div>

            <div className="w-9 md:hidden" aria-hidden="true" />
          </div>

          <div
            role="tablist"
            aria-label="Cambiar vista del módulo de órdenes"
            className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] w-full md:w-auto md:min-w-[390px] shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "create"}
              onClick={() => {
                setActiveTab("create");
                fetchInitialData();
              }}
              className={`flex items-center justify-center gap-2 min-h-[42px] px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "create"
                  ? "bg-[var(--color-primary-500)]/15 border-[var(--color-primary-500)]/50 text-[var(--color-primary-400)] shadow-xs"
                  : "bg-[var(--color-secondary-900)]/70 border-[var(--color-secondary-800)] text-[var(--color-white)] hover:border-[var(--color-primary-500)]/45 hover:text-[var(--color-primary-400)]"
              }`}
            >
              <PlusCircle className="size-4 shrink-0" />
              <span>Nueva Orden</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "list"}
              onClick={() => setActiveTab("list")}
              className={`flex items-center justify-center gap-2 min-h-[42px] px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "list"
                  ? "bg-[var(--color-primary-500)]/15 border-[var(--color-primary-500)]/50 text-[var(--color-primary-400)] shadow-xs"
                  : "bg-[var(--color-secondary-900)]/70 border-[var(--color-secondary-800)] text-[var(--color-white)] hover:border-[var(--color-primary-500)]/45 hover:text-[var(--color-primary-400)]"
              }`}
            >
              <ClipboardList className="size-4 shrink-0 text-[var(--color-primary-400)]" />
              <span>Ver Órdenes</span>
              <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[11px] font-bold bg-[var(--color-primary-500)]/15 border border-[var(--color-primary-500)]/40 text-[var(--color-primary-400)]">
                {orders.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div>
        {activeTab === "create" ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Formulario datos de la orden */}
            <div className="lg:col-span-1 lg:self-start space-y-3.5 sm:space-y-4 bg-[var(--color-secondary-900)] p-4 sm:p-5 rounded-xl border border-[var(--color-secondary-800)] shadow-md">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary-400)] border-b border-[var(--color-secondary-800)] pb-2">
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
            <div className="lg:col-span-2 lg:self-start bg-[var(--color-secondary-900)] p-3.5 sm:p-5 rounded-xl border border-[var(--color-secondary-800)] shadow-md">
              <div className="pb-3 border-b border-[var(--color-secondary-800)]">
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
                className="mt-3 max-h-[390px] sm:max-h-[465px] overflow-y-auto overscroll-contain pr-1"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {visibleDishes.length === 0 ? (
                    <div className="sm:col-span-2 py-10 text-center text-xs text-[var(--color-gray-400)] rounded-xl bg-[var(--color-secondary-950)]/50 border border-dashed border-[var(--color-secondary-800)]">
                      No se encontraron platillos que coincidan con &ldquo;{dishSearch.trim()}&rdquo;.
                    </div>
                  ) : visibleDishes.map((dish) => {
                    const count = qty[dish.id] || 0;
                    const isInactive = dish.status === "Inactivo";

                    return (
                      <div
                        key={dish.id}
                        className={`p-2.5 sm:p-3 rounded-xl border transition flex items-center justify-between gap-2.5 sm:gap-3 ${
                          isInactive
                            ? "bg-[var(--color-secondary-950)]/50 border-[var(--color-secondary-800)]/40 opacity-50 cursor-not-allowed"
                            : count > 0
                            ? "bg-[var(--color-primary-500)]/10 border-[var(--color-primary-500)]/65 shadow-xs"
                            : "bg-[var(--color-secondary-950)]/70 border-[var(--color-secondary-800)] hover:border-[var(--color-secondary-700)] shadow-xs"
                        }`}
                      >
                        {/* Imagen pequeña del platillo */}
                        <div className="size-12 sm:size-14 rounded-lg overflow-hidden border border-[var(--color-secondary-700)] bg-[var(--color-secondary-950)] shrink-0 shadow-xs">
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
                            className={`text-[10px] font-mono block ${
                              isInactive ? "text-[var(--color-gray-500)]" : "text-[var(--color-gray-400)]"
                            }`}
                          >
                            {dish.code}
                          </span>
                          <h4
                            className={`text-sm font-bold truncate ${
                              isInactive ? "text-[var(--color-gray-400)]" : "text-[var(--color-white)]"
                            }`}
                          >
                            {dish.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs font-semibold ${
                                isInactive
                                  ? "text-[var(--color-gray-500)]"
                                  : "text-[var(--color-white)]"
                              }`}
                            >
                              ${dish.price.toLocaleString("es-CO")}
                            </span>
                          </div>
                        </div>

                        {/* Contador de unidades (touch target cómodo en móvil) */}
                        <div className="flex items-center gap-1.5 bg-[var(--color-secondary-900)] px-1.5 py-1 rounded-lg border border-[var(--color-secondary-800)] shrink-0">
                          <button
                            type="button"
                            disabled={count === 0}
                            onClick={() => handleDecrement(dish)}
                            className="w-10 h-10 sm:w-9 sm:h-9 rounded-md flex items-center justify-center text-base font-bold text-[var(--color-gray-300)] hover:bg-[var(--color-secondary-800)] hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-5 text-center text-[var(--color-white)]">
                            {count}
                          </span>
                          <button
                            type="button"
                            disabled={isInactive}
                            onClick={() => handleIncrement(dish)}
                            className="w-10 h-10 sm:w-9 sm:h-9 rounded-md flex items-center justify-center text-base font-bold text-[var(--color-primary-400)] hover:bg-[var(--color-secondary-800)] hover:text-[var(--color-primary-300)] disabled:opacity-30 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalFilteredDishes > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[var(--color-secondary-800)]/70 flex items-center justify-between gap-2 text-[11px] text-[var(--color-gray-400)]">
                    <span>
                      Mostrando {visibleDishesCount} de {totalFilteredDishes} platillos
                    </span>
                    {hasMoreDishes && (
                      <button
                        type="button"
                        onClick={loadMoreDishes}
                        className="font-semibold text-[var(--color-primary-400)] hover:text-[var(--color-primary-300)] cursor-pointer"
                      >
                        Cargar más platillos
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Barra inferior fija para enviar orden sin perder visibilidad del total */}
            <div className="fixed bottom-0 inset-x-0 z-40 bg-[var(--color-secondary-950)]/95 backdrop-blur border-t border-[var(--color-secondary-800)] shadow-2xl">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[var(--color-gray-400)] leading-tight">
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
                        className="font-semibold text-[var(--color-primary-400)] hover:text-[var(--color-primary-300)] hover:underline cursor-pointer"
                      >
                        Vaciar
                      </button>
                    )}
                  </div>
                  <p className="text-sm sm:text-base font-bold text-[var(--color-white)] truncate">
                    ${totalAmount.toLocaleString("es-CO")} COP
                  </p>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting || totalItems === 0}
                >
                  {submitting ? "Registrando..." : "Registrar Orden"}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          /* Pestaña de listado */
          <div className="bg-[var(--color-secondary-900)] p-3 sm:p-6 rounded-xl border border-[var(--color-secondary-800)] shadow-md">
            <DataTable data={orders} columns={orderColumns} />
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
