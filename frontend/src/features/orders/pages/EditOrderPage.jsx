import { useState, useEffect, useMemo } from "react";
import {
  Input,
  Button,
  IconButton,
  M3Icon,
  SearchField,
  ConfirmDialog,
  showSuccessAlert,
  showErrorAlert,
} from "@/shared";
import { Link, useNavigate, useLocation } from "react-router-dom";
import usePermission from "@/features/access/services/usePermission";
import { getProducts } from "@/features/products/services/productServices";
import { getOrderById, updateOrder, cancelOrder } from "../services/orderServices";
import OrderViewModal from "../components/OrderViewModal";
import OrderDishCard from "../components/OrderDishCard";
import PaymentMethodCards from "../components/PaymentMethodCards";
import OrderStatusSwitch from "../components/OrderStatusSwitch";
import PosCategoryFilter from "@/features/home/components/PosCategoryFilter";
import { useScrollableBatch } from "../hooks/useScrollableBatch";
import { getUserRoleFlags } from "@/shared/utils/authStorage";
import {
  computeDishDynamicMaxStock,
  getOrderStatusStepIndex,
  normalizeOrderStatus,
  normalizePaymentMethod,
  mapProductToDish,
  filterDishesByQueryAndCategory,
} from "../utils/orderFormHelpers";

export default function EditOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isCajero, isCocina, isMesero } = getUserRoleFlags();
  const { granted: canCancelOrder } = usePermission("cancel_order");
  const canMarkPaid = isAdmin || isCajero;
  const canMarkCreated = isAdmin || isMesero || isCocina || isCajero;

  const editData = location.state?.form || location.state?.order || null;
  const initialOrderId = editData?.id || editData?.order_number || "ORD-001";
  const initialNormalizedStatus = normalizeOrderStatus(
    editData?.orderStatus || editData?.status
  );

  const [formOrder, setFormOrder] = useState({
    id: initialOrderId,
    numericId: editData?.numericId || editData?.id,
    tableNumber: editData?.tableNumber || editData?.table_number || "Mesa 1",
    waiter: editData?.waiter || "Sin asignar",
    observations: editData?.observations || "Sin observaciones adicionales",
    orderStatus: initialNormalizedStatus,
    paymentMethod: normalizePaymentMethod(
      editData?.paymentMethod || editData?.payment_method
    ),
  });

  const [savedStatus, setSavedStatus] = useState(initialNormalizedStatus);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paidOrderForPrint, setPaidOrderForPrint] = useState(null);
  const [errors, setErrors] = useState({});
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [qty, setQty] = useState({});
  const [initialQtyMap, setInitialQtyMap] = useState({});
  const [initialOrderedIds, setInitialOrderedIds] = useState(() => new Set());
  const [dishSearch, setDishSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prods, orderDetail] = await Promise.all([
          getProducts({ activeOnly: false }),
          getOrderById(initialOrderId).catch(() => null),
        ]);

        setProductsList(prods || []);

        if (orderDetail) {
          const persistedStatus = normalizeOrderStatus(orderDetail.status);
          setSavedStatus(persistedStatus);
          setFormOrder({
            id: orderDetail.order_number || String(orderDetail.id),
            numericId: orderDetail.id,
            tableNumber: orderDetail.table_number || "Mesa 1",
            waiter: orderDetail.waiter || "Sin asignar",
            observations: orderDetail.observations || "",
            orderStatus: persistedStatus,
            paymentMethod: normalizePaymentMethod(
              orderDetail.paymentMethod || orderDetail.payment_method
            ),
          });

          if (Array.isArray(orderDetail.items)) {
            const initialQuantities = {};
            const orderedIds = new Set();
            orderDetail.items.forEach((item) => {
              const pid = item.productId || item.product_id;
              const qVal = Math.max(0, Math.floor(Number(item.qty || item.quantity || 0)));
              if (pid !== undefined && pid !== null && qVal > 0) {
                initialQuantities[pid] = qVal;
                orderedIds.add(String(pid));
              }
            });
            setQty(initialQuantities);
            setInitialQtyMap(initialQuantities);
            setInitialOrderedIds(orderedIds);
          }
        }
      } catch (err) {
        console.error("Error al cargar orden para edición:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [initialOrderId]);

  const isClosedOrPaid = savedStatus === "Pagada";
  const isCanceled = savedStatus === "Anulada";

  const dishes = useMemo(
    () => productsList.map(mapProductToDish),
    [productsList]
  );

  const filteredDishes = useMemo(
    () =>
      filterDishesByQueryAndCategory(dishes, {
        search: dishSearch,
        category: selectedCategory,
        pinnedIds: initialOrderedIds,
      }),
    [dishes, dishSearch, selectedCategory, initialOrderedIds]
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

  const getMaxAllowedForDish = (dish) =>
    computeDishDynamicMaxStock(dish, dishes, qty, initialQtyMap);

  const handleIncrement = (dish) => {
    if (isClosedOrPaid || isCanceled) return;
    if (dish.status === "Inactivo") {
      showErrorAlert({
        title: "Platillo inhabilitado",
        text: `El platillo "${dish.name}" está inhabilitado y no puede agregarse.`,
      });
      return;
    }

    const maxAllowed = getMaxAllowedForDish(dish);
    const current = qty[dish.id] || 0;
    if (current >= maxAllowed) {
      showErrorAlert({
        title: "Stock insuficiente",
        text: `Solo hay ${maxAllowed} ${maxAllowed === 1 ? "unidad disponible" : "unidades disponibles"} para "${dish.name}".`,
      });
      return;
    }

    setQty((q) => ({ ...q, [dish.id]: current + 1 }));
  };

  const handleDecrement = (dish) => {
    if (isClosedOrPaid || isCanceled) return;
    setQty((q) => {
      const current = q[dish.id] || 0;
      if (current <= 1) {
        const next = { ...q };
        delete next[dish.id];
        return next;
      }
      return { ...q, [dish.id]: current - 1 };
    });
  };

  const canMarkCompleted =
    isAdmin || isCocina || savedStatus === "Completada";
  const canMarkDelivered =
    isAdmin ||
    ((isMesero || isCajero) && savedStatus === "Completada") ||
    savedStatus === "Entregada";

  const handleFieldUpdate = (name, value) => {
    if (isClosedOrPaid || isCanceled) return;
    if (name === "orderStatus") {
      const currentStep = getOrderStatusStepIndex(savedStatus);
      const nextStep = getOrderStatusStepIndex(value);
      if (currentStep >= 0 && nextStep >= 0 && nextStep < currentStep) {
        return;
      }
      if (value === "Pagada" && !canMarkPaid) return;
      if (
        value === "Completada" &&
        savedStatus !== "Completada" &&
        !isAdmin &&
        !isCocina
      ) {
        return;
      }
      if (
        value === "Entregada" &&
        savedStatus !== "Entregada" &&
        !canMarkDelivered
      ) {
        return;
      }
    }
    setFormOrder((prev) => ({ ...prev, [name]: value }));

    setErrors((prevErrors) => {
      if (!prevErrors[name]) return prevErrors;
      const nextErrors = { ...prevErrors };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    handleFieldUpdate(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isClosedOrPaid) {
      await showErrorAlert({
        title: "Orden no editable",
        text: `La orden ${formOrder.id} se encuentra en estado "${formOrder.orderStatus}" y no admite modificaciones según las reglas de facturación.`,
      });
      return;
    }

    if (isCanceled) {
      await showErrorAlert({
        title: "Orden anulada",
        text: `La orden ${formOrder.id} está anulada y no puede ser modificada.`,
      });
      return;
    }

    if (formOrder.orderStatus === "Pagada" && !canMarkPaid) {
      await showErrorAlert({
        title: "Acción restringida",
        text: "El mesero no puede marcar órdenes como Pagada. Solo Cajero o Administrador.",
      });
      return;
    }

    const fieldErrors = {};
    if (formOrder.orderStatus === "Pagada" && !formOrder.paymentMethod) {
      fieldErrors.paymentMethod = "Selecciona un método de pago";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    try {
      const selectedItems = dishes
        .filter((d) => (qty[d.id] || 0) > 0)
        .map((d) => ({
          productId: d.id,
          quantity: qty[d.id],
          unitPrice: d.price,
          notes: "",
        }));

      const identifier = formOrder.numericId || formOrder.id;

      const updatedRes = await updateOrder(identifier, {
        tableNumber: formOrder.tableNumber,
        waiterName: formOrder.waiter,
        status: formOrder.orderStatus,
        paymentMethod: formOrder.paymentMethod,
        observations: formOrder.observations,
        items: selectedItems,
      });

      const resolvedWaiter = updatedRes?.order?.waiter || formOrder.waiter;
      window.dispatchEvent(new CustomEvent("dpiero:orders-updated"));

      await showSuccessAlert({
        title: "Orden Actualizada",
        text: `La orden ${formOrder.id} ha sido actualizada exitosamente.`,
      });

      if (formOrder.orderStatus === "Pagada") {
        const totalOrden = selectedItems.reduce(
          (acc, it) => acc + Number(it.unitPrice || 0) * Number(it.quantity || 0),
          0
        );
        setPaidOrderForPrint({
          id: formOrder.numericId || formOrder.id,
          idCode: formOrder.id,
          tableNumber: formOrder.tableNumber,
          waiter: resolvedWaiter,
          status: "Pagada",
          paymentMethod: formOrder.paymentMethod,
          createdAt: editData?.createdAt || new Date().toISOString(),
          observations: formOrder.observations,
          total: totalOrden,
          items: selectedItems.map((it) => {
            const dish = dishes.find((d) => d.id === it.productId);
            return {
              name: dish?.name || dish?.title || "Producto",
              price: it.unitPrice,
              qty: it.quantity,
            };
          }),
        });
        return;
      }

      navigate("/orderList");
    } catch (err) {
      console.error("Error al actualizar orden:", err);
      await showErrorAlert({
        title: "Error al actualizar",
        text: err.message || "No se pudo actualizar la orden.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    setIsCancelConfirmOpen(false);
    setSubmitting(true);
    try {
      const identifier = formOrder.numericId || formOrder.id;
      await cancelOrder(identifier, "Cancelada desde formulario de edición");

      setFormOrder((prev) => ({ ...prev, orderStatus: "Anulada" }));
      window.dispatchEvent(new CustomEvent("dpiero:orders-updated"));

      await showSuccessAlert({
        title: "Orden Anulada",
        text: `La orden ${formOrder.id} ha sido anulada exitosamente.`,
      });

      navigate("/orderList");
    } catch (err) {
      if (err?.isStepUpCancelled) return;
      console.error("Error al anular orden:", err);
      await showErrorAlert({
        title: "Error al anular",
        text: err.message || "No se pudo anular la orden.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col font-[family-name:var(--main-font)]">
      <div className="flex-1 flex flex-col w-full p-4 sm:p-6 bg-[var(--md-sys-color-surface-container-low)] rounded-2xl border border-[var(--md-sys-color-outline-variant)] m3-elevation-1 text-[var(--md-sys-color-on-surface)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/orderList">
              <IconButton
                type="button"
                variant="tonal"
                hitSize={40}
                iconSize={20}
                ariaLabel="Volver al listado"
                title="Volver al listado"
              >
                <M3Icon name="arrow_back" size={20} />
              </IconButton>
            </Link>
            <div className="min-w-0">
              <h1 className="text-title-lg sm:text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                Editar Orden {formOrder.id}
              </h1>
              <p className="text-body-sm text-[var(--md-sys-color-on-surface-variant)] truncate">
                {formOrder.tableNumber} • Mesero: {formOrder.waiter}
              </p>
            </div>
          </div>
          <Link to="/orderList" className="shrink-0">
            <Button variant="outlined" size="md" leadingIcon="arrow_back">
              Volver al Listado
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            {/* Columna izquierda: Estado, observaciones, método de pago y resumen */}
            <div className="lg:col-span-5 space-y-5">
              <OrderStatusSwitch
                label="Estado de la Orden *"
                value={formOrder.orderStatus}
                currentStatus={savedStatus}
                onChange={(nextStatus) => handleFieldUpdate("orderStatus", nextStatus)}
                disabled={isClosedOrPaid || isCanceled}
                canMarkCreated={canMarkCreated}
                canMarkCompleted={canMarkCompleted}
                canMarkDelivered={canMarkDelivered}
                canMarkPaid={canMarkPaid}
              />

              <Input
                label="Observaciones de Cocina"
                name="observations"
                value={formOrder.observations}
                onChange={handleChange}
                disabled={isClosedOrPaid || isCanceled}
              />

              {(canMarkPaid || isClosedOrPaid) && (
                <PaymentMethodCards
                  label="Método de Pago *"
                  value={formOrder.paymentMethod}
                  onChange={(method) => handleFieldUpdate("paymentMethod", method)}
                  disabled={isClosedOrPaid || isCanceled}
                  error={errors.paymentMethod}
                />
              )}

              {/* Resumen económico */}
              <div className="p-4 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] space-y-2.5">
                <span className="text-label-lg font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)] block">
                  Resumen Económico
                </span>
                <div className="flex justify-between text-body-sm text-[var(--md-sys-color-on-surface-variant)]">
                  <span>Platillos seleccionados:</span>
                  <span className="font-semibold text-[var(--md-sys-color-on-surface)] tabular-nums">
                    {totalItems} un.
                  </span>
                </div>
                <div className="flex justify-between text-body-sm text-[var(--md-sys-color-on-surface-variant)]">
                  <span>Estado de orden:</span>
                  <span className="font-semibold text-[var(--md-sys-color-on-surface)]">
                    {formOrder.orderStatus}
                  </span>
                </div>
                {(canMarkPaid || formOrder.orderStatus === "Pagada") && (
                  <div className="flex justify-between text-body-sm text-[var(--md-sys-color-on-surface-variant)]">
                    <span>Método de pago:</span>
                    <span className="font-semibold text-[var(--md-sys-color-on-surface)]">
                      {formOrder.paymentMethod}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-title-md font-bold text-[var(--md-sys-color-on-surface)] pt-2.5 border-t border-[var(--md-sys-color-outline-variant)]">
                  <span>Total Orden:</span>
                  <span className="text-title-lg text-[var(--md-sys-color-primary)] tabular-nums">
                    ${totalAmount.toLocaleString("es-CO")} COP
                  </span>
                </div>
              </div>

              {(isClosedOrPaid || isCanceled) && (
                <div className="p-4 rounded-2xl bg-[var(--md-sys-color-error-container)] border border-[var(--md-sys-color-error)]/40 text-[var(--md-sys-color-on-error-container)] text-body-sm flex items-start gap-2.5">
                  <M3Icon name="lock" size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-0.5 font-semibold">
                      {isClosedOrPaid ? "Esta orden está PAGADA." : "Esta orden está ANULADA."}
                    </strong>
                    Por reglas de negocio del sistema, las órdenes pagadas o anuladas quedan bloqueadas contra modificación y anulación.
                  </div>
                </div>
              )}
            </div>

            {/* Columna derecha: Selector de platillos y cantidades */}
            <div className="lg:col-span-7 flex flex-col space-y-3 bg-[var(--md-sys-color-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <h3 className="text-title-md font-semibold text-[var(--md-sys-color-on-surface)] shrink-0">
                  Ajustar Platillos y Cantidades
                </h3>
                <SearchField
                  asForm={false}
                  value={dishSearch}
                  onChange={setDishSearch}
                  onClear={() => setDishSearch("")}
                  placeholder="Buscar platillo por nombre o código..."
                  ariaLabel="Buscar platillo en la orden"
                  size="sm"
                  variant="outlined"
                  className="w-full sm:w-72"
                />
              </div>

              <PosCategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                products={dishes}
              />

              <div
                ref={dishesScrollRef}
                onScroll={handleDishesScroll}
                className="p-3 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)]"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {visibleDishes.length === 0 ? (
                    <div className="sm:col-span-2 py-10 text-center text-body-sm text-[var(--md-sys-color-on-surface-variant)] rounded-xl border border-dashed border-[var(--md-sys-color-outline-variant)]">
                      No se encontraron platillos que coincidan con el filtro aplicado.
                    </div>
                  ) : (
                    visibleDishes.map((dish) => (
                      <OrderDishCard
                        key={dish.id}
                        dish={dish}
                        count={qty[dish.id] || 0}
                        maxStock={getMaxAllowedForDish(dish)}
                        disabled={isClosedOrPaid || isCanceled}
                        onIncrement={handleIncrement}
                        onDecrement={handleDecrement}
                      />
                    ))
                  )}
                </div>

                {totalFilteredDishes > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[var(--md-sys-color-outline-variant)] flex items-center justify-between gap-2 text-body-sm text-[var(--md-sys-color-on-surface-variant)]">
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

          <div className="sticky bottom-0 z-30 mt-auto bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl m3-elevation-2">
            <div className="w-full px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3">
              {canCancelOrder && !isClosedOrPaid && !isCanceled && (
                <Button
                  type="button"
                  variant="destructive"
                  leadingIcon="cancel"
                  onClick={() => setIsCancelConfirmOpen(true)}
                  disabled={submitting || loading}
                  className="flex-1 sm:flex-none sm:mr-auto"
                >
                  Anular<span className="hidden sm:inline">&nbsp;Orden</span>
                </Button>
              )}

              <Link
                to="/orderList"
                className={`flex-1 sm:flex-none ${
                  !canCancelOrder || isClosedOrPaid || isCanceled ? "sm:ml-auto" : ""
                }`}
              >
                <Button
                  variant="outlined"
                  type="button"
                  disabled={submitting}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
              </Link>

              {!isClosedOrPaid && !isCanceled && (
                <Button
                  variant="filled"
                  type="submit"
                  leadingIcon="check_circle"
                  disabled={submitting || loading}
                  className="flex-1 sm:flex-none"
                >
                  {loading ? (
                    "Cargando..."
                  ) : submitting ? (
                    "Guardando..."
                  ) : formOrder.orderStatus === "Pagada" ? (
                    <>
                      Pagar<span className="hidden sm:inline">&nbsp;Orden</span>
                    </>
                  ) : (
                    <>
                      Guardar<span className="hidden sm:inline">&nbsp;Cambios</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>

        <ConfirmDialog
          isOpen={isCancelConfirmOpen}
          title="Anular Orden"
          description={`¿Estás seguro de que deseas anular la orden ${formOrder.id}? Esta acción revertirá el stock de productos.`}
          confirmText="Sí, anular orden"
          cancelText="Conservar"
          isDestructive={true}
          onConfirm={handleConfirmCancel}
          onCancel={() => setIsCancelConfirmOpen(false)}
        />

        <OrderViewModal
          order={paidOrderForPrint}
          isOpen={Boolean(paidOrderForPrint)}
          onClose={() => {
            setPaidOrderForPrint(null);
            navigate("/orderList");
          }}
        />
      </div>
    </div>
  );
}
