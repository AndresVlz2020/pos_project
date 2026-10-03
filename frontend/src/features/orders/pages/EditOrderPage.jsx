import { useState } from "react";
import {
  Input,
  Select,
  Button,
  Card,
  ConfirmDialog,
  showSuccessAlert,
  showErrorAlert,
} from "@/shared";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { products } from "../../products/data/products";
import { getStoredOrders, saveStoredOrders } from "../data/orders";

export default function EditOrder() {
  const navigate = useNavigate();
  const location = useLocation();

  const editData = location.state?.form || null;
  const orderId = editData?.id || "ORD-001";

  const initialForm = editData
    ? {
        id: editData.id || "ORD-001",
        tableNumber: editData.tableNumber || "Mesa 5",
        waiter: editData.waiter || "Carlos Pérez",
        observations: editData.observations || "Sin observaciones adicionales",
        orderStatus: editData.orderStatus || "Abierta",
      }
    : {
        id: "ORD-001",
        tableNumber: "Mesa 5",
        waiter: "Carlos Pérez",
        observations: "Sin observaciones adicionales",
        orderStatus: "Abierta",
      };

  const initialQty = location.state?.qty || {
    "punta-anca": 2,
    "limonada-hierbabuena": 2,
  };

  const [formOrder, setFormOrder] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  // Regla RFADMIN30: Bloquea modificar o anular órdenes pagadas o cerradas
  const isClosedOrPaid =
    formOrder.orderStatus === "Pagada" || formOrder.orderStatus === "Cerrada";
  const isCanceled = formOrder.orderStatus === "Anulada";

  // Regla RFADMIN29 / RFADMIN24: Platillos inhabilitados excluidos de órdenes
  const dishes = products.map((p) => ({
    id: p.id,
    name: p.title,
    price: p.price,
    status: p.status === "Inactivo" || p.status === "inhabilitado" ? "Inactivo" : "Disponible",
    image: p.image,
  }));

  const [qty, setQty] = useState(initialQty);

  const waiterOptions = [
    { value: "Carlos Pérez", label: "Carlos Pérez" },
    { value: "María Rodríguez", label: "María Rodríguez" },
    { value: "Juan Gómez", label: "Juan Gómez" },
    { value: "Ana Martínez", label: "Ana Martínez" },
  ];

  const orderStatusOptions = [
    { value: "Abierta", label: "Abierta" },
    { value: "En preparación", label: "En Preparación" },
    { value: "Pagada", label: "Pagada" },
    { value: "Cerrada", label: "Cerrada" },
    { value: "Anulada", label: "Anulada" },
  ];

  const parsePrice = (val) =>
    parseFloat(String(val || 0).replace(/\$/g, "").replace(/\./g, "").trim()) || 0;

  const totalAmount = dishes.reduce(
    (sum, d) => sum + parsePrice(d.price) * (qty[d.id] || 0),
    0
  );

  const totalItems = Object.values(qty).reduce((a, b) => a + b, 0);

  const handleIncrement = (dish) => {
    if (isClosedOrPaid || isCanceled) return;
    if (dish.status === "Inactivo" || dish.status === "inhabilitado") {
      showErrorAlert({
        title: "Platillo inhabilitado",
        text: `El platillo "${dish.name}" está inhabilitado y no puede agregarse a las comandas.`,
      });
      return;
    }
    setQty((q) => ({ ...q, [dish.id]: (q[dish.id] || 0) + 1 }));
  };

  const handleDecrement = (dish) => {
    if (isClosedOrPaid || isCanceled) return;
    setQty((q) => ({ ...q, [dish.id]: Math.max(0, (q[dish.id] || 0) - 1) }));
  };

  const handleChange = (e) => {
    if (isClosedOrPaid || isCanceled) return;
    const { name, value, type, checked } = e.target;
    setFormOrder((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prevErrors) => {
      if (!prevErrors[name]) return prevErrors;
      const nextErrors = { ...prevErrors };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Regla RFADMIN30: Bloquea modificar órdenes pagadas o cerradas
    if (isClosedOrPaid) {
      await showErrorAlert({
        title: "Orden no editable",
        text: `La comanda ${formOrder.id} se encuentra en estado "${formOrder.orderStatus}" y no admite modificaciones.`,
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

    // Actualizar almacenamiento persistente de órdenes
    const stored = getStoredOrders();
    const selectedItems = dishes
      .filter((d) => (qty[d.id] || 0) > 0)
      .map((d) => ({
        id: d.id,
        name: d.name,
        price: parsePrice(d.price),
        qty: qty[d.id],
      }));

    const updated = stored.map((o) =>
      o.id === formOrder.id
        ? {
            ...o,
            tableNumber: formOrder.tableNumber,
            waiter: formOrder.waiter,
            observations: formOrder.observations,
            status: formOrder.orderStatus,
            items: selectedItems,
            total: totalAmount,
          }
        : o
    );

    saveStoredOrders(updated);

    setErrors({});
    await showSuccessAlert({
      title: "Orden actualizada",
      text: `La comanda ${formOrder.id} ha sido actualizada correctamente en el sistema.`,
    });
    navigate("/CreateOrder");
  };

  // Regla RFADMIN30: Confirmación explícita antes de anular
  const handleConfirmCancel = () => {
    const stored = getStoredOrders();
    const updated = stored.map((o) =>
      o.id === formOrder.id ? { ...o, status: "Anulada" } : o
    );
    saveStoredOrders(updated);
    setIsCancelConfirmOpen(false);

    showSuccessAlert({
      title: "Orden Anulada",
      text: `La comanda ${formOrder.id} ha sido anulada exitosamente.`,
    });
    navigate("/CreateOrder");
  };

  return (
    <div className="w-full pb-12">
      {/* Header bar */}
      <div className="w-full bg-[var(--color-secondary-950)] text-[var(--color-white)] shadow-md border-b border-[var(--color-secondary-800)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => window.history.back()}
            >
              ←
            </Button>
            <div>
              <h1 className="text-[length:var(--fs-md)] font-bold">
                Editar Orden {formOrder.id}
              </h1>
              <p className="text-xs text-[var(--color-gray-400)]">
                Actualización de platillos, mesero y estado de la comanda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[length:var(--fs-xxs)] text-[var(--color-gray-300)]">
              Items: {totalItems}
            </span>

            <div className="text-[length:var(--fs-xs)] font-bold bg-[var(--color-secondary-800)] text-[var(--color-white)] px-4 py-1.5 rounded-md border border-[var(--color-secondary-600)]">
              Total: ${totalAmount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 my-6">
        {/* Advertencia si la orden está pagada o cerrada */}
        {isClosedOrPaid && (
          <div className="p-4 mb-6 rounded-lg bg-blue-950/70 border border-blue-800 text-blue-300 text-xs">
            <strong>Aviso de auditoría (RFADMIN30):</strong> Esta orden se encuentra en estado{" "}
            <strong>"{formOrder.orderStatus}"</strong>. Por reglas de negocio del sistema, las
            órdenes cerradas o pagadas quedan bloqueadas contra modificación y anulación.
          </div>
        )}

        {isCanceled && (
          <div className="p-4 mb-6 rounded-lg bg-red-950/70 border border-red-800 text-red-300 text-xs">
            <strong>Aviso:</strong> Esta orden se encuentra <strong>ANULADA</strong> y no admite
            cambios.
          </div>
        )}

        {/* Main Info Card */}
        <div className="p-6 bg-[var(--color-secondary-900)] rounded-lg border border-[var(--color-secondary-800)] shadow-md text-[var(--color-white)] mb-8">
          <h2 className="text-[length:var(--fs-sm)] font-bold mb-4 text-[var(--color-white)]">
            Información de la Orden
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start w-full">
            <Input
              label="Número de Mesa"
              name="tableNumber"
              type="text"
              value={formOrder.tableNumber}
              placeholder="Ej. Mesa 5"
              htmlFor="order-table-number"
              onChange={handleChange}
              disabled={isClosedOrPaid || isCanceled}
              error={errors.tableNumber}
            />

            <Select
              label="Selecciona un Mesero"
              name="waiter"
              htmlFor="order-waiter"
              options={waiterOptions}
              value={formOrder.waiter}
              onChange={handleChange}
              disabled={isClosedOrPaid || isCanceled}
              error={errors.waiter}
            />

            <Select
              label="Estado de la Orden"
              name="orderStatus"
              htmlFor="order-status"
              options={orderStatusOptions}
              value={formOrder.orderStatus}
              onChange={handleChange}
              disabled={isClosedOrPaid || isCanceled}
              error={errors.orderStatus}
            />

            <Input
              label="Observaciones"
              name="observations"
              type="text"
              value={formOrder.observations}
              placeholder="Observaciones adicionales"
              htmlFor="order-observations"
              onChange={handleChange}
              disabled={isClosedOrPaid || isCanceled}
              error={errors.observations}
            />
          </div>
        </div>

        {/* Dishes list header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[length:var(--fs-md)] font-bold text-[var(--color-white)]">
            Platillos Incluidos en la Orden
          </h2>
          <span className="text-xs text-[var(--color-gray-400)]">
            Ajusta las cantidades de la comanda
          </span>
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full mb-10">
          {dishes.map((dish) => (
            <Card
              key={dish.id}
              product={dish}
              qty={qty[dish.id] || 0}
              onIncrement={() => handleIncrement(dish)}
              onDecrement={() => handleDecrement(dish)}
            />
          ))}
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-[var(--color-secondary-900)] rounded-lg border border-[var(--color-secondary-800)] shadow-md text-[var(--color-white)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[length:var(--fs-sm)] font-bold text-[var(--color-white)]">
            Total de la Orden:{" "}
            <span className="text-[var(--color-primary-400)] text-[length:var(--fs-md)] font-bold">
              ${totalAmount.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/CreateOrder">
              <Button variant="secondary" size="md" type="button">
                Volver
              </Button>
            </Link>

            {!isClosedOrPaid && !isCanceled && (
              <>
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  className="hover:bg-red-700 hover:text-white border-red-700/60 text-red-400"
                  onClick={() => setIsCancelConfirmOpen(true)}
                >
                  Anular Orden
                </Button>

                <Button variant="primary" size="md" type="submit">
                  Guardar Cambios
                </Button>
              </>
            )}
          </div>
        </div>
      </form>

      {/* ConfirmDialog para Anular Orden (RFADMIN30) */}
      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        title="Confirmar Anulación de Orden"
        description={`¿Estás seguro de que deseas anular la comanda ${formOrder.id} de la ${formOrder.tableNumber}? Esta acción marcará la orden como ANULADA.`}
        confirmText="Sí, anular comanda"
        cancelText="Conservar"
        isDestructive={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelConfirmOpen(false)}
      />
    </div>
  );
}
