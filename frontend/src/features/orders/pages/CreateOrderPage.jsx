import { useState, useMemo } from "react";
import {
  Input,
  Select,
  Button,
  IconButton,
  Card,
  DataTable,
  ConfirmDialog,
  showSuccessAlert,
  showErrorAlert,
} from "@/shared";
import { Pencil, List, PlusCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { products } from "@/features/products/data/products";
import { getStoredOrders, saveStoredOrders } from "../data/orders";
import { getOrderColumns } from "../table/OrderColumns";
import OrderViewModal from "../components/OrderViewModal";

export default function CreateOrder() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create"); // 'create' | 'list'
  const [orders, setOrders] = useState(() => getStoredOrders());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const [form, setForm] = useState({
    tableNumber: "",
    waiter: "",
    observations: "",
  });

  const [errors, setErrors] = useState({});

  // Regla RFADMIN29 / RFADMIN24: Mantiene visible el platillo inhabilitado y lo excluye de órdenes
  const dishes = products.map((p) => ({
    id: p.id,
    name: p.title,
    price: p.price,
    status: p.status === "Inactivo" || p.status === "inhabilitado" ? "Inactivo" : "Disponible",
    image: p.image,
  }));

  const waiterOptions = [
    { value: "Carlos Pérez", label: "Carlos Pérez" },
    { value: "María Rodríguez", label: "María Rodríguez" },
    { value: "Juan Gómez", label: "Juan Gómez" },
    { value: "Ana Martínez", label: "Ana Martínez" },
  ];

  const [qty, setQty] = useState(
    dishes.reduce((acc, d) => ({ ...acc, [d.id]: 0 }), {})
  );

  const parsePrice = (val) =>
    parseFloat(String(val || 0).replace(/\$/g, "").replace(/\./g, "").trim()) || 0;

  const totalAmount = dishes.reduce(
    (sum, d) => sum + parsePrice(d.price) * (qty[d.id] || 0),
    0
  );

  const totalItems = Object.values(qty).reduce((a, b) => a + b, 0);

  const handleIncrement = (dish) => {
    // Regla RFADMIN29: Bloquea agregar platillos inhabilitados
    if (dish.status === "Inactivo" || dish.status === "inhabilitado") {
      showErrorAlert({
        title: "Platillo inhabilitado",
        text: `El platillo "${dish.name}" está inhabilitado en el menú y no puede ser agregado a las órdenes.`,
      });
      return;
    }
    setQty((q) => ({ ...q, [dish.id]: (q[dish.id] || 0) + 1 }));
  };

  const handleDecrement = (dish) => {
    setQty((q) => ({ ...q, [dish.id]: Math.max(0, (q[dish.id] || 0) - 1) }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));

    if (errors[name]) {
      const nextErrors = { ...errors };
      delete nextErrors[name];
      setErrors(nextErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fieldErrors = {};
    if (!form.tableNumber.trim()) fieldErrors.tableNumber = "Requerido (Ej. Mesa 5)";
    if (!form.waiter) fieldErrors.waiter = "Selecciona un mesero";

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    if (totalItems === 0) {
      await showErrorAlert({
        title: "Comanda vacía",
        text: "Debes agregar al menos un platillo disponible para registrar la comanda.",
      });
      return;
    }

    // Regla RFADMIN26: Impide crear una segunda orden activa sobre la misma mesa
    const currentStored = getStoredOrders();
    const normalizedInput = form.tableNumber.trim().toLowerCase();
    const existingActiveOrder = currentStored.find((o) => {
      const t = o.tableNumber.trim().toLowerCase();
      const isSameTable =
        t === normalizedInput ||
        t === `mesa ${normalizedInput}` ||
        `mesa ${t}` === normalizedInput;
      const isActive =
        o.status === "Abierta" ||
        o.status === "En preparación" ||
        o.status === "en_proceso";
      return isSameTable && isActive;
    });

    if (existingActiveOrder) {
      await showErrorAlert({
        title: "Mesa Ocupada",
        text: `La "${form.tableNumber}" ya tiene una comanda activa (${existingActiveOrder.id}) en estado "${existingActiveOrder.status}". No se permite registrar una segunda orden activa sobre la misma mesa.`,
      });
      return;
    }

    // Construir items seleccionados
    const selectedItems = dishes
      .filter((d) => (qty[d.id] || 0) > 0)
      .map((d) => ({
        id: d.id,
        name: d.name,
        price: parsePrice(d.price),
        qty: qty[d.id],
      }));

    // Formatear ID único correlativo (RFADMIN26)
    const newId = `ORD-${String(currentStored.length + 1).padStart(3, "0")}`;
    const now = new Date();
    const createdAt = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;

    const newOrder = {
      id: newId,
      tableNumber: form.tableNumber.startsWith("Mesa") ? form.tableNumber : `Mesa ${form.tableNumber}`,
      waiter: form.waiter,
      status: "Abierta", // RFADMIN26: Generando identificador único y estado 'Abierta'
      items: selectedItems,
      total: totalAmount,
      observations: form.observations || "Sin observaciones adicionales",
      createdAt,
    };

    const updatedOrders = [newOrder, ...currentStored];
    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);

    setErrors({});
    await showSuccessAlert({
      title: "Orden Creada",
      text: `Comanda ${newId} registrada con éxito en ${newOrder.tableNumber} con estado "Abierta".`,
    });

    // Resetear formulario
    setForm({ tableNumber: "", waiter: "", observations: "" });
    setQty(dishes.reduce((acc, d) => ({ ...acc, [d.id]: 0 }), {}));
  };

  // Manejo de consulta y cancelación de órdenes
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleRequestCancel = (order) => {
    setOrderToCancel(order);
  };

  const handleConfirmCancel = () => {
    if (!orderToCancel) return;
    const currentStored = getStoredOrders();
    const updated = currentStored.map((o) =>
      o.id === orderToCancel.id ? { ...o, status: "Anulada" } : o
    );
    setOrders(updated);
    saveStoredOrders(updated);
    setOrderToCancel(null);

    showSuccessAlert({
      title: "Orden Anulada",
      text: `La comanda ${orderToCancel.id} ha sido anulada correctamente.`,
    });
  };

  const orderColumns = useMemo(
    () =>
      getOrderColumns({
        onViewOrder: handleViewOrder,
        onRequestCancel: handleRequestCancel,
      }),
    [orders]
  );

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
                {activeTab === "create" ? "Crear Nueva Orden" : "Listado de Órdenes"}
              </h1>
              <p className="text-xs text-[var(--color-gray-400)]">
                Gestión de comandas y estado de mesas en salón
              </p>
            </div>
          </div>

          {/* Accesible View Mode Tabs */}
          <div className="flex items-center gap-2 bg-[var(--color-secondary-900)] p-1 rounded-lg border border-[var(--color-secondary-800)]">
            <button
              type="button"
              onClick={() => setActiveTab("create")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === "create"
                  ? "bg-[var(--color-primary-500)] text-white shadow-sm"
                  : "text-[var(--color-gray-300)] hover:text-white"
              }`}
            >
              <PlusCircle size={14} />
              Nueva Comanda
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === "list"
                  ? "bg-[var(--color-primary-500)] text-white shadow-sm"
                  : "text-[var(--color-gray-300)] hover:text-white"
              }`}
            >
              <List size={14} />
              Ver Órdenes ({orders.length})
            </button>

            <Link to="/orderList">
              <span className="text-[11px] text-[var(--color-primary-400)] hover:underline px-2 py-1 cursor-pointer">
                ↗ Tabla Completa
              </span>
            </Link>
          </div>

          {activeTab === "create" && (
            <div className="flex items-center gap-3">
              <span className="text-[length:var(--fs-xxs)] text-[var(--color-gray-300)]">
                Items: {totalItems}
              </span>

              {/* Total Badge */}
              <div className="text-[length:var(--fs-xs)] font-bold bg-[var(--color-secondary-800)] text-[var(--color-white)] px-4 py-1.5 rounded-md border border-[var(--color-secondary-600)] flex items-center gap-2">
                <span>Total: ${totalAmount.toLocaleString()}</span>
              </div>

              {/* Botón de editar orden al lado del Total */}
              <IconButton
                type="button"
                ariaLabel="Editar orden"
                hitSize={34}
                iconSize={16}
                variant="primary"
                className="rounded-md cursor-pointer"
                onClick={() => navigate("/editorder", { state: { form, qty } })}
                title="Editar orden"
              >
                <Pencil size={16} />
              </IconButton>
            </div>
          )}
        </div>
      </div>

      {/* VISTA 1: FORMULARIO Y SELECCIÓN DE PLATILLOS */}
      {activeTab === "create" && (
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 my-6">
          {/* General order data card */}
          <div className="p-6 bg-[var(--color-secondary-900)] rounded-lg border border-[var(--color-secondary-800)] shadow-md text-[var(--color-white)] mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[length:var(--fs-sm)] font-bold text-[var(--color-white)]">
                Datos de la Mesa y Mesero
              </h2>
              <span className="text-xs text-[var(--color-gray-400)]">
                * Estado inicial automático: <strong className="text-emerald-400">Abierta</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start w-full">
              <Input
                label="Número de Mesa"
                name="tableNumber"
                type="text"
                value={form.tableNumber}
                placeholder="Ej. Mesa 5 o 5"
                htmlFor="order-table-number"
                onChange={handleChange}
                error={errors.tableNumber}
              />

              <Select
                label="Selecciona un Mesero"
                name="waiter"
                htmlFor="order-waiter"
                options={waiterOptions}
                value={form.waiter}
                onChange={handleChange}
                error={errors.waiter}
              />

              <Input
                label="Observaciones para Cocina"
                name="observations"
                type="text"
                value={form.observations}
                placeholder="Ej. Término medio, sin cebolla..."
                htmlFor="order-observations"
                onChange={handleChange}
                error={errors.observations}
              />
            </div>
          </div>

          {/* Dishes list header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[length:var(--fs-md)] font-bold text-[var(--color-white)]">
              Platillos del Menú
            </h2>
            <span className="text-xs text-[var(--color-gray-400)]">
              Los platillos marcados como <strong>Inhabilitados</strong> están excluidos de las comandas.
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

          {/* Action footer */}
          <div className="p-6 bg-[var(--color-secondary-900)] rounded-lg border border-[var(--color-secondary-800)] shadow-md text-[var(--color-white)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-[length:var(--fs-sm)] font-bold text-[var(--color-white)]">
                Total estimado:{" "}
                <span className="text-[var(--color-primary-400)] text-[length:var(--fs-md)]">
                  ${totalAmount.toLocaleString()}
                </span>
              </div>
              <IconButton
                type="button"
                ariaLabel="Editar orden"
                hitSize={34}
                iconSize={16}
                variant="primary"
                className="rounded-md cursor-pointer"
                onClick={() => navigate("/editorder", { state: { form, qty } })}
                title="Editar orden"
              >
                <Pencil size={16} />
              </IconButton>
            </div>
            <Button variant="primary" size="md" type="submit">
              Crear Orden (Estado: Abierta)
            </Button>
          </div>
        </form>
      )}

      {/* VISTA 2: LISTADO DE ÓRDENES EMBEBIDO */}
      {activeTab === "list" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 my-6">
          <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-lg p-6 shadow-md text-[var(--color-white)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Comandas Registradas</h2>
                <p className="text-xs text-[var(--color-gray-400)]">
                  Consulta de pedidos en cocina, edición de comandas activas y anulación con confirmación.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setActiveTab("create")}>
                + Crear Otra Orden
              </Button>
            </div>

            <DataTable data={orders} columns={orderColumns} />
          </div>
        </div>
      )}

      {/* Modal de consulta de orden */}
      <OrderViewModal
        order={selectedOrder}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedOrder(null);
        }}
      />

      {/* Diálogo de confirmación explícita para anular orden (RFADMIN30) */}
      {orderToCancel && (
        <ConfirmDialog
          isOpen={Boolean(orderToCancel)}
          title="Anular Orden del Sistema"
          description={`¿Estás seguro de que deseas anular la comanda ${orderToCancel.id} de la ${orderToCancel.tableNumber}? Esta acción no se puede deshacer.`}
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
