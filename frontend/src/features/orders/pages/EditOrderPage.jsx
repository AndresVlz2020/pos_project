import { useState, useEffect, useMemo } from "react";
import {
  Input,
  Select,
  Button,
  ConfirmDialog,
  showSuccessAlert,
  showErrorAlert,
} from "@/shared";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getProducts } from "@/features/products/services/productServices";
import { getOrderById, updateOrder, cancelOrder, getTablesAvailability } from "../services/orderServices";
import { getProductImage, imgPunta } from "@/utils/imageHelper";
import OrderViewModal from "../components/OrderViewModal";

export default function EditOrder() {
  const navigate = useNavigate();
  const location = useLocation();

  const editData = location.state?.form || location.state?.order || null;
  const initialOrderId = editData?.id || editData?.order_number || "ORD-001";

  const [formOrder, setFormOrder] = useState({
    id: initialOrderId,
    numericId: editData?.numericId || editData?.id,
    tableNumber: editData?.tableNumber || editData?.table_number || "Mesa 1",
    waiter: editData?.waiter || "Carlos Pérez",
    observations: editData?.observations || "Sin observaciones adicionales",
    orderStatus: editData?.orderStatus || editData?.status || "No Pagada",
    paymentMethod: editData?.paymentMethod || editData?.payment_method || "Efectivo",
  });

  const [savedStatus, setSavedStatus] = useState(
    editData?.orderStatus || editData?.status || "No Pagada"
  );
  const [productsList, setProductsList] = useState([]);
  const [tablesList, setTablesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paidOrderForPrint, setPaidOrderForPrint] = useState(null);
  const [errors, setErrors] = useState({});
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [qty, setQty] = useState({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prods, orderDetail, tbls] = await Promise.all([
          getProducts({ activeOnly: false }),
          getOrderById(initialOrderId).catch(() => null),
          getTablesAvailability().catch(() => []),
        ]);

        setProductsList(prods || []);
        setTablesList(tbls || []);

        if (orderDetail) {
          const persistedStatus = orderDetail.status || "No Pagada";
          setSavedStatus(persistedStatus);
          setFormOrder({
            id: orderDetail.order_number || String(orderDetail.id),
            numericId: orderDetail.id,
            tableNumber: orderDetail.table_number || "Mesa 1",
            waiter: orderDetail.waiter || "Carlos Pérez",
            observations: orderDetail.observations || "",
            orderStatus: persistedStatus,
            paymentMethod: orderDetail.paymentMethod || orderDetail.payment_method || "Efectivo",
          });

          // Inicializar cantidades de ítems existentes
          if (Array.isArray(orderDetail.items)) {
            const initialQuantities = {};
            orderDetail.items.forEach((item) => {
              initialQuantities[item.productId || item.product_id] = item.qty || item.quantity;
            });
            setQty(initialQuantities);
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
    }));
  }, [productsList]);

  const tableSelectOptions = useMemo(() => {
    return tablesList.map((t) => {
      const isCurrentTable =
        t.tableNumber.toLowerCase() === (formOrder.tableNumber || "").toLowerCase();
      const isAvailable = t.isAvailable || isCurrentTable;
      return {
        value: t.tableNumber,
        label: isAvailable
          ? `${t.tableNumber} - ${isCurrentTable ? "Mesa Actual" : "Disponible"} (Cap. ${t.capacity} pers.)`
          : `${t.tableNumber} - Ocupada (${t.activeOrderNumber || "Comanda en curso"})`,
        disabled: !isAvailable,
      };
    });
  }, [tablesList, formOrder.tableNumber]);

  const waiterOptions = [
    { value: "Carlos Pérez", label: "Carlos Pérez (Mesero)" },
    { value: "María Rodríguez", label: "María Rodríguez (Mesera)" },
    { value: "Juan Gómez", label: "Juan Gómez (Mesero)" },
    { value: "Ana Martínez", label: "Ana Martínez (Cajera / Turno)" },
  ];

  const orderStatusOptions = [
    { value: "No Pagada", label: "No Pagada" },
    { value: "Pagada", label: "Pagada (Cierre de comanda)" },
    { value: "Anulada", label: "Anulada" },
  ];

  const paymentMethodOptions = [
    { value: "Efectivo", label: "Efectivo" },
    { value: "Tarjeta débito", label: "Tarjeta débito" },
    { value: "Tarjeta crédito", label: "Tarjeta crédito" },
    { value: "Transferencia", label: "Transferencia" },
    { value: "Nequi/Daviplata", label: "Nequi / Daviplata" },
    { value: "Bono/Cortesía", label: "Bono / Cortesía" },
  ];

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

  const handleChange = (e) => {
    if (isClosedOrPaid || isCanceled) return;
    const { name, value } = e.target;
    setFormOrder((prev) => ({ ...prev, [name]: value }));

    setErrors((prevErrors) => {
      if (!prevErrors[name]) return prevErrors;
      const nextErrors = { ...prevErrors };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isClosedOrPaid) {
      await showErrorAlert({
        title: "Orden no editable",
        text: `La comanda ${formOrder.id} se encuentra en estado "${formOrder.orderStatus}" y no admite modificaciones según las reglas de facturación.`,
      });
      return;
    }

    if (isCanceled) {
      await showErrorAlert({
        title: "Orden anulada",
        text: `La comanda ${formOrder.id} está anulada y no puede ser modificada.`,
      });
      return;
    }

    const fieldErrors = {};
    if (!formOrder.tableNumber) {
      fieldErrors.tableNumber = "El número de mesa es requerido";
    }
    if (!formOrder.waiter) {
      fieldErrors.waiter = "Selecciona un mesero";
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

      await updateOrder(identifier, {
        tableNumber: formOrder.tableNumber,
        waiterName: formOrder.waiter,
        status: formOrder.orderStatus,
        paymentMethod: formOrder.paymentMethod,
        observations: formOrder.observations,
        items: selectedItems,
      });

      await showSuccessAlert({
        title: "Comanda Actualizada",
        text: `La comanda ${formOrder.id} ha sido actualizada exitosamente.`,
      });

      if (formOrder.orderStatus === "Pagada") {
        const totalComanda = selectedItems.reduce(
          (acc, it) => acc + Number(it.unitPrice || 0) * Number(it.quantity || 0),
          0
        );
        setPaidOrderForPrint({
          id: formOrder.numericId || formOrder.id,
          idCode: formOrder.id,
          tableNumber: formOrder.tableNumber,
          waiter: formOrder.waiter,
          status: "pagada",
          paymentMethod: formOrder.paymentMethod,
          createdAt: editData?.createdAt || new Date().toISOString(),
          observations: formOrder.observations,
          total: totalComanda,
          items: selectedItems.map((it) => {
            const dish = dishes.find((d) => d.id === it.productId);
            return {
              name: dish?.title || "Producto",
              price: it.unitPrice,
              qty: it.quantity,
            };
          }),
        });
        return;
      }

      navigate("/OrderListPage");
    } catch (err) {
      console.error("Error al actualizar comanda:", err);
      await showErrorAlert({
        title: "Error al actualizar",
        text: err.message || "No se pudo actualizar la comanda.",
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
        title: "Comanda Anulada",
        text: `La comanda ${formOrder.id} ha sido anulada exitosamente.`,
      });

      navigate("/OrderListPage");
    } catch (err) {
      console.error("Error al anular orden:", err);
      await showErrorAlert({
        title: "Error al anular",
        text: err.message || "No se pudo anular la orden.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 sm:p-8 bg-[var(--color-secondary-900)] rounded-xl border border-[var(--color-secondary-800)] shadow-xl text-[var(--color-white)]">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-secondary-800)]">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-white)]">
            Editar Comanda {formOrder.id}
          </h1>
        </div>
        <Link to="/OrderListPage">
          <Button variant="secondary" size="sm">
            Volver al Listado
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Select
              label="Mesa *"
              name="tableNumber"
              value={formOrder.tableNumber}
              onChange={handleChange}
              options={tableSelectOptions}
              disabled={isClosedOrPaid || isCanceled}
              error={errors.tableNumber}
            />

            <Select
              label="Mesero asignado *"
              name="waiter"
              value={formOrder.waiter}
              onChange={handleChange}
              options={waiterOptions}
              disabled={isClosedOrPaid || isCanceled}
              error={errors.waiter}
            />

            <Select
              label="Estado de la Orden *"
              name="orderStatus"
              value={formOrder.orderStatus}
              onChange={handleChange}
              options={orderStatusOptions}
              disabled={isClosedOrPaid || isCanceled}
            />

            <Select
              label="Método de Pago *"
              name="paymentMethod"
              value={formOrder.paymentMethod}
              onChange={handleChange}
              options={paymentMethodOptions}
              disabled={isClosedOrPaid || isCanceled}
            />
          </div>

          <div className="space-y-4">
            <Input
              label="Observaciones de Cocina"
              name="observations"
              value={formOrder.observations}
              onChange={handleChange}
              disabled={isClosedOrPaid || isCanceled}
            />

            <div className="p-4 rounded-lg bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] space-y-2 mt-4">
              <span className="text-xs font-semibold text-[var(--color-gray-400)] block">
                Resumen Económico
              </span>
              <div className="flex justify-between text-xs text-[var(--color-gray-300)]">
                <span>Platillos seleccionados:</span>
                <span className="font-bold text-[var(--color-white)]">{totalItems} un.</span>
              </div>
              <div className="flex justify-between text-xs text-[var(--color-gray-300)]">
                <span>Método de pago:</span>
                <span className="font-semibold text-[var(--color-white)]">{formOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[var(--color-white)] pt-1 border-t border-[var(--color-secondary-800)]">
                <span>Total Comanda:</span>
                <span className="text-[var(--color-white)] text-base">
                  ${totalAmount.toLocaleString("es-CO")} COP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Platillos agregados / a modificar */}
        <div className="space-y-3 pt-4 border-t border-[var(--color-secondary-800)]">
          <h3 className="text-sm font-bold text-[var(--color-white)]">
            Ajustar Platillos y Cantidades
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {dishes.map((dish) => {
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
                          isInactive ? "text-[var(--color-gray-500)]" : "text-[var(--color-primary-300)]"
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
                      className="w-6 h-6 rounded bg-[var(--color-secondary-800)] flex items-center justify-center text-xs font-bold disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{count}</span>
                    <button
                      type="button"
                      disabled={isClosedOrPaid || isCanceled || isInactive}
                      onClick={() => handleIncrement(dish)}
                      className="w-6 h-6 rounded bg-[var(--color-primary-500)] text-white flex items-center justify-center text-xs font-bold disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel informativo cuando la orden está bloqueada */}
        {(isClosedOrPaid || isCanceled) && (
          <div className="p-4 rounded-lg bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] text-[var(--color-warning)] text-xs">
            <strong className="block mb-1">
              {isClosedOrPaid ? "Esta comanda está PAGADA." : "Esta comanda está ANULADA."}
            </strong>
            Por reglas de negocio del sistema, las órdenes pagadas o anuladas quedan bloqueadas contra modificación y anulación.
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center gap-4 pt-6 border-t border-[var(--color-secondary-800)]">
          {!isClosedOrPaid && !isCanceled && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setIsCancelConfirmOpen(true)}
              disabled={submitting}
            >
              Anular Comanda
            </Button>
          )}

          <div className="flex gap-3 ml-auto">
            <Link to="/OrderListPage">
              <Button variant="secondary" type="button" disabled={submitting}>
                Cancelar
              </Button>
            </Link>
            {!isClosedOrPaid && !isCanceled && (
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? "Actualizando..." : "Guardar Cambios"}
              </Button>
            )}
          </div>
        </div>
      </form>

      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        title="Anular Comanda"
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
          navigate("/OrderListPage");
        }}
      />
    </div>
  );
}
