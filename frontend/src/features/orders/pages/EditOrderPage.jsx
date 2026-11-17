import { useState, useEffect, useMemo } from "react";
import {
  Input,
  Button,
  SearchField,
  ConfirmDialog,
  showSuccessAlert,
  showErrorAlert,
} from "@/shared";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getProducts } from "@/features/products/services/productServices";
import { getOrderById, updateOrder, cancelOrder } from "../services/orderServices";
import { getProductImage, imgPunta } from "@/utils/imageHelper";
import OrderViewModal from "../components/OrderViewModal";
import PaymentMethodCards from "../components/PaymentMethodCards";
import OrderStatusSwitch from "../components/OrderStatusSwitch";
import { useScrollableBatch } from "../hooks/useScrollableBatch";
import {
  normalizeOrderStatus,
  normalizePaymentMethod,
} from "../utils/orderFormHelpers";

export default function EditOrder() {
  const navigate = useNavigate();
  const location = useLocation();

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
  const [initialOrderedIds, setInitialOrderedIds] = useState(() => new Set());
  const [dishSearch, setDishSearch] = useState("");

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

          // Inicializar cantidades de ítems existentes
          if (Array.isArray(orderDetail.items)) {
            const initialQuantities = {};
            const orderedIds = new Set();
            orderDetail.items.forEach((item) => {
              const pid = item.productId || item.product_id;
              initialQuantities[pid] = item.qty || item.quantity;
              if (pid !== undefined && pid !== null) orderedIds.add(pid);
            });
            setQty(initialQuantities);
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

  const dishes = useMemo(() => {
    return productsList.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.title || p.name,
      price: Number(p.price) || 0,
      status: p.is_active ? "Disponible" : "Inactivo",
      image: p.image || p.image_url,
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
    if (initialOrderedIds.size === 0) return list;
    return [
      ...list.filter((d) => initialOrderedIds.has(d.id)),
      ...list.filter((d) => !initialOrderedIds.has(d.id)),
    ];
  }, [dishes, dishSearch, initialOrderedIds]);

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
    if (isClosedOrPaid || isCanceled) return;
    if (dish.status === "Inactivo") {
      showErrorAlert({
        title: "Platillo inhabilitado",
        text: `El platillo "${dish.name}" está inhabilitado en PostgreSQL y no puede agregarse.`,
      });
      return;
    }
    setQty((q) => ({ ...q, [dish.id]: (q[dish.id] || 0) + 1 }));
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

  const handleFieldUpdate = (name, value) => {
    if (isClosedOrPaid || isCanceled) return;
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

    const fieldErrors = {};
    if (!formOrder.paymentMethod) {
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
    try {
      const identifier = formOrder.numericId || formOrder.id;
      await cancelOrder(identifier, "Cancelada desde formulario de edición");

      setFormOrder((prev) => ({ ...prev, orderStatus: "Anulada" }));
      setIsCancelConfirmOpen(false);

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
    }
  };

  return (
    <div className="pb-24">
      <div className="max-w-4xl mx-auto my-8 p-6 sm:p-8 bg-[var(--color-secondary-900)] rounded-xl border border-[var(--color-secondary-800)] shadow-xl text-[var(--color-white)]">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-secondary-800)]">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-white)]">
              Editar Orden {formOrder.id}
            </h1>
          </div>
          <Link to="/orderList">
            <Button variant="secondary" size="sm">
              Volver al Listado
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <OrderStatusSwitch
              label="Estado de la Orden *"
              value={formOrder.orderStatus}
              onChange={(nextStatus) => handleFieldUpdate("orderStatus", nextStatus)}
              disabled={isClosedOrPaid || isCanceled}
            />

            <Input
              label="Observaciones de Cocina"
              name="observations"
              value={formOrder.observations}
              onChange={handleChange}
              disabled={isClosedOrPaid || isCanceled}
            />
          </div>

        <PaymentMethodCards
          label="Método de Pago *"
          value={formOrder.paymentMethod}
          onChange={(method) => handleFieldUpdate("paymentMethod", method)}
          disabled={isClosedOrPaid || isCanceled}
          error={errors.paymentMethod}
        />

        {/* Platillos agregados / a modificar */}
        <div className="space-y-3 pt-4 border-t border-[var(--color-secondary-800)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-sm font-bold text-[var(--color-white)] shrink-0">
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

          <div
            ref={dishesScrollRef}
            onScroll={handleDishesScroll}
            className="p-2.5 rounded-xl border border-[var(--color-secondary-800)] bg-[var(--color-secondary-950)]/40 max-h-72 overflow-y-auto overscroll-contain pr-1.5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleDishes.length === 0 ? (
                <div className="sm:col-span-2 py-8 text-center text-xs text-[var(--color-gray-400)] rounded-lg border border-dashed border-[var(--color-secondary-800)]">
                  No se encontraron platillos que coincidan con &ldquo;{dishSearch.trim()}&rdquo;.
                </div>
              ) : visibleDishes.map((dish) => {
                const count = qty[dish.id] || 0;
                const isInactive = dish.status === "Inactivo";
                return (
                  <div
                    key={dish.id}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${
                      isInactive
                        ? "bg-[var(--color-secondary-950)]/50 border-[var(--color-secondary-800)]/40 opacity-50 cursor-not-allowed"
                        : "bg-[var(--color-secondary-950)] border-[var(--color-secondary-800)] hover:border-[var(--color-secondary-700)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="size-11 rounded-lg overflow-hidden border border-[var(--color-secondary-700)] bg-[var(--color-secondary-950)] shrink-0">
                        <img
                          src={getProductImage(dish)}
                          alt={dish.name}
                          className={`w-full h-full object-cover ${isInactive ? "grayscale contrast-75" : ""}`}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = imgPunta;
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h5
                          className={`text-xs font-bold truncate ${
                            isInactive ? "text-[var(--color-gray-400)]" : "text-[var(--color-white)]"
                          }`}
                        >
                          {dish.name}
                        </h5>
                        <span
                          className={`text-[11px] font-semibold ${
                            isInactive ? "text-[var(--color-gray-500)]" : "text-[var(--color-white)]"
                          }`}
                        >
                          ${dish.price.toLocaleString("es-CO")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={count === 0 || isClosedOrPaid || isCanceled}
                        onClick={() => handleDecrement(dish)}
                        aria-label={`Disminuir ${dish.name}`}
                        className="w-10 h-10 sm:w-9 sm:h-9 rounded-md bg-[var(--color-secondary-800)] text-[var(--color-white)] flex items-center justify-center text-base font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 disabled:opacity-30 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-5 text-center">{count}</span>
                      <button
                        type="button"
                        disabled={isClosedOrPaid || isCanceled || isInactive}
                        onClick={() => handleIncrement(dish)}
                        aria-label={`Aumentar ${dish.name}`}
                        className="w-10 h-10 sm:w-9 sm:h-9 rounded-md bg-[var(--color-primary-500)] text-[var(--color-on-primary)] flex items-center justify-center text-base font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 disabled:opacity-30 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalFilteredDishes > 0 && (
              <div className="mt-2.5 pt-2 border-t border-[var(--color-secondary-800)]/70 flex items-center justify-between gap-2 text-[11px] text-[var(--color-gray-400)]">
                <span>
                  Mostrando {visibleDishesCount} de {totalFilteredDishes} platillos
                </span>
                {hasMoreDishes && (
                  <button
                    type="button"
                    onClick={loadMoreDishes}
                    className="min-h-[36px] px-2 rounded-md font-semibold text-[var(--color-primary-400)] hover:text-[var(--color-primary-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 cursor-pointer"
                  >
                    Cargar más platillos
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resumen económico al final del formulario */}
        <div className="p-4 rounded-xl bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] space-y-2.5">
          <span className="text-xs font-semibold text-[var(--color-gray-400)] block">
            Resumen Económico
          </span>
          <div className="flex justify-between text-xs text-[var(--color-gray-300)]">
            <span>Platillos seleccionados:</span>
            <span className="font-bold text-[var(--color-white)]">{totalItems} un.</span>
          </div>
          <div className="flex justify-between text-xs text-[var(--color-gray-300)]">
            <span>Estado de orden:</span>
            <span className="font-semibold text-[var(--color-white)]">{formOrder.orderStatus}</span>
          </div>
          <div className="flex justify-between text-xs text-[var(--color-gray-300)]">
            <span>Método de pago:</span>
            <span className="font-semibold text-[var(--color-white)]">{formOrder.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-[var(--color-white)] pt-2 border-t border-[var(--color-secondary-800)]">
            <span>Total Orden:</span>
            <span className="text-[var(--color-white)] text-base">
              ${totalAmount.toLocaleString("es-CO")} COP
            </span>
          </div>
        </div>

        {/* Panel informativo cuando la orden está bloqueada */}
        {(isClosedOrPaid || isCanceled) && (
          <div className="p-4 rounded-lg bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] text-[var(--color-warning)] text-xs">
            <strong className="block mb-1">
              {isClosedOrPaid ? "Esta orden está PAGADA." : "Esta orden está ANULADA."}
            </strong>
            Por reglas de negocio del sistema, las órdenes pagadas o anuladas quedan bloqueadas contra modificación y anulación.
          </div>
        )}

        <div className="fixed bottom-0 inset-x-0 z-40 bg-[var(--color-secondary-950)]/95 backdrop-blur border-t border-[var(--color-secondary-800)] shadow-2xl">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-3 flex items-center gap-2 sm:gap-3">
            {!isClosedOrPaid && !isCanceled && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsCancelConfirmOpen(true)}
                disabled={submitting || loading}
                className="flex-1 sm:flex-none sm:mr-auto px-2.5 sm:px-4 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] whitespace-nowrap"
              >
                Anular<span className="hidden sm:inline">&nbsp;Orden</span>
              </Button>
            )}

            <Link
              to="/orderList"
              className={`flex-1 sm:flex-none ${
                isClosedOrPaid || isCanceled ? "sm:ml-auto" : ""
              }`}
            >
              <Button
                variant="secondary"
                type="button"
                disabled={submitting}
                className="w-full sm:w-auto px-2.5 sm:px-4 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] whitespace-nowrap"
              >
                Cancelar
              </Button>
            </Link>

            {!isClosedOrPaid && !isCanceled && (
              <Button
                variant="primary"
                type="submit"
                disabled={submitting || loading}
                className="flex-1 sm:flex-none px-2.5 sm:px-4 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] whitespace-nowrap"
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
        description={`¿Estás seguro de que deseas anular la orden ${formOrder.id}? Esta acción revertirá el stock de productos en PostgreSQL.`}
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
