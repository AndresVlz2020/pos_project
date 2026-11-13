import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Select,
  Button,
  DataTable,
  ConfirmDialog,
  showSuccessAlert,
  showErrorAlert,
  Input,
} from "@/shared";
import { List, PlusCircle, CheckCircle2, Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "@/features/products/services/productServices";
import { getOrders, createOrder, cancelOrder, getTablesAvailability } from "../services/orderServices";
import { getOrderColumns } from "../table/OrderColumns";
import OrderViewModal from "../components/OrderViewModal";
import { getProductImage, imgPunta } from "@/utils/imageHelper";

export default function CreateOrder() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create"); // 'create' | 'list'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [tablesList, setTablesList] = useState([]);
  const [loadingTables, setLoadingTables] = useState(true);

  const [form, setForm] = useState({
    tableNumber: "",
    waiter: "Carlos Pérez",
    observations: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Cargar productos, órdenes y disponibilidad de mesas en tiempo real
  const fetchInitialData = useCallback(async () => {
    try {
      setLoadingProducts(true);
      setLoadingTables(true);
      const [prods, ords, tbls] = await Promise.all([
        getProducts({ activeOnly: false }),
        getOrders(),
        getTablesAvailability().catch((err) => {
          console.warn("Error cargando mesas:", err);
          return [];
        }),
      ]);
      setProductsList(prods || []);
      setOrders(ords || []);
      setTablesList(tbls || []);

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
      setLoadingTables(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
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

  const [qty, setQty] = useState({});

  const waiterOptions = [
    { value: "Carlos Pérez", label: "Carlos Pérez (Mesero)" },
    { value: "María Rodríguez", label: "María Rodríguez (Mesera)" },
    { value: "Juan Gómez", label: "Juan Gómez (Mesero)" },
    { value: "Ana Martínez", label: "Ana Martínez (Cajera / Turno)" },
  ];

  // Opciones de mesas dinámicas según disponibilidad
  const tableSelectOptions = useMemo(() => {
    return tablesList.map((t) => ({
      value: t.tableNumber,
      label: t.isAvailable
        ? `${t.tableNumber} - Disponible (Cap. ${t.capacity} pers.)`
        : `${t.tableNumber} - Ocupada (${t.activeOrderNumber || "Comanda en curso"})`,
      disabled: !t.isAvailable,
    }));
  }, [tablesList]);

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
        text: `El platillo "${dish.name}" se encuentra inhabilitado y no puede ser agregado a ninguna comanda.`,
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
    if (!form.waiter.trim()) {
      fieldErrors.waiter = "Debes asignar un mesero responsable.";
    }

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

    // Regla RFADMIN26: Validación de mesa disponible
    const currentTableObj = tablesList.find(
      (t) => t.tableNumber.toLowerCase() === form.tableNumber.toLowerCase()
    );

    if (currentTableObj && !currentTableObj.isAvailable) {
      await showErrorAlert({
        title: "Mesa Ocupada",
        text: `La "${form.tableNumber}" ya tiene una comanda activa (${currentTableObj.activeOrderNumber || "en curso"}). No se permite registrar una comanda sobre una mesa ocupada.`,
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
        waiterName: form.waiter,
        observations: form.observations || "Sin observaciones adicionales",
        items: selectedItems,
      });

      // Notificación clara y limpia (sin mención de PostgreSQL)
      await showSuccessAlert({
        title: "Comanda Creada",
        text: `Comanda ${created.order?.order_number || "creada"} para ${tableFormatted} registrada con éxito.`,
      });

      // Resetear formulario y recargar mesas/órdenes (la factura se genera al pagar, no al crear)
      setQty({});
      setErrors({});
      fetchInitialData();
    } catch (err) {
      console.error("Error al registrar orden:", err);
      await showErrorAlert({
        title: "Error al registrar comanda",
        text: err.message || "No se pudo guardar la comanda.",
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
      await cancelOrder(identifier, "Cancelada desde módulo de comanda");

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderToCancel.id
            ? { ...o, status: "Anulada", orderStatus: "Anulada" }
            : o
        )
      );

      await showSuccessAlert({
        title: "Comanda Anulada",
        text: `La comanda ${orderToCancel.id} ha sido anulada correctamente.`,
      });
      fetchInitialData();
    } catch (err) {
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
    <div className="w-full pb-12 font-[family-name:var(--main-font)]">
      {/* Header bar */}
      <div className="w-full bg-[var(--color-secondary-950)] text-[var(--color-white)] shadow-md border-b border-[var(--color-secondary-800)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                if (activeTab === "list") {
                  setActiveTab("create");
                  fetchInitialData();
                } else {
                  window.history.back();
                }
              }}
            >
              ←
            </Button>
            <div>
              <h1 className="text-[length:var(--fs-md)] font-bold text-[var(--color-white)]">
                {activeTab === "create" ? "Crear Nueva Orden" : "Listado de Comandas"}
              </h1>
              <p className="text-xs text-[var(--color-gray-400)]">
                Gestión en tiempo real de mesas y comandas del restaurante
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[var(--color-secondary-900)] p-1 rounded-lg border border-[var(--color-secondary-800)]">
            <button
              type="button"
              onClick={() => {
                setActiveTab("create");
                fetchInitialData();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === "create"
                  ? "bg-[var(--color-primary-500)] text-[#ffffff] shadow-sm"
                  : "text-[var(--color-gray-300)] hover:text-white"
              }`}
            >
              <PlusCircle size={14} />
              Nueva Comanda
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === "list"
                  ? "bg-[var(--color-primary-500)] text-[#ffffff] shadow-sm"
                  : "text-[var(--color-gray-300)] hover:text-white"
              }`}
            >
              <List size={14} />
              Ver Comandas ({orders.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        {activeTab === "create" ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario datos de la orden */}
            <div className="lg:col-span-1 space-y-4 bg-[var(--color-secondary-900)] p-5 rounded-xl border border-[var(--color-secondary-800)] shadow-md">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary-400)] border-b border-[var(--color-secondary-800)] pb-2">
                Datos de la Comanda
              </h2>

              {/* Selector de Mesas con Disponibilidad */}
              <div>
                <Select
                  label="Mesa *"
                  name="tableNumber"
                  value={form.tableNumber}
                  onChange={handleChangeForm}
                  options={tableSelectOptions}
                  error={errors.tableNumber}
                />

                {/* Mapa visual de mesas y su estado en tiempo real */}
                <div className="mt-2 pt-2 border-t border-[var(--color-secondary-800)]">
                  <div className="flex items-center justify-between text-[11px] mb-2 text-[var(--color-gray-400)]">
                    <span>Disponibilidad de mesas:</span>
                    <span className="font-medium text-[var(--color-primary-400)]">
                      {tablesList.filter((t) => t.isAvailable).length} libres
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {tablesList.map((t) => {
                      const isSelected = form.tableNumber === t.tableNumber;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectTablePill(t)}
                          title={`${t.tableNumber} - ${t.status} (Cap. ${t.capacity})${!t.isAvailable ? ` - Orden ${t.activeOrderNumber}` : ""}`}
                          className={`py-1.5 px-1 rounded text-center transition flex flex-col items-center justify-center text-[11px] border cursor-pointer ${
                            isSelected
                              ? "bg-[var(--color-primary-500)] text-[#ffffff] border-[var(--color-primary-400)] ring-2 ring-[var(--color-primary-400)]/40 font-bold"
                              : t.isAvailable
                              ? "bg-[var(--color-secondary-950)] text-[var(--color-gray-200)] border-[var(--color-primary-500)]/40 hover:bg-[var(--color-secondary-800)]"
                              : "bg-[var(--color-secondary-950)]/60 text-[var(--color-gray-500)] border-[var(--color-secondary-800)] cursor-not-allowed opacity-60"
                          }`}
                        >
                          <span className="font-semibold truncate leading-tight">
                            M{t.id}
                          </span>
                          <span
                            className={`text-[9px] mt-0.5 px-1 rounded-full ${
                              t.isAvailable
                                ? "bg-[var(--color-primary-500)]/15 text-[var(--color-primary-300)]"
                                : "bg-[var(--color-error-bg)] text-[var(--color-error)]"
                            }`}
                          >
                            {t.isAvailable ? "Libre" : "Ocup."}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Select
                label="Mesero asignado *"
                name="waiter"
                value={form.waiter}
                onChange={handleChangeForm}
                options={waiterOptions}
                error={errors.waiter}
              />

              <Input
                label="Observaciones de cocina"
                name="observations"
                placeholder="Términos de carne, sin cebolla, etc."
                value={form.observations}
                onChange={handleChangeForm}
              />

              {/* Resumen monetario */}
              <div className="pt-4 border-t border-[var(--color-secondary-800)] space-y-2">
                <div className="flex justify-between text-xs text-[var(--color-gray-400)]">
                  <span>Ítems seleccionados:</span>
                  <span className="font-bold text-[var(--color-white)]">{totalItems} un.</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[var(--color-white)]">
                  <span>Total a facturar:</span>
                  <span className="text-[var(--color-white)] text-lg">
                    ${totalAmount.toLocaleString("es-CO")} COP
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-4"
                disabled={submitting || totalItems === 0}
              >
                {submitting ? "Registrando..." : "Registrar Comanda"}
              </Button>
            </div>

            {/* Selector de platillos gastronómicos */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[var(--color-white)]">
                  Menú Gastronómico ({dishes.length} platillos)
                </h2>
                {loadingProducts && (
                  <span className="text-xs text-[var(--color-primary-400)]">
                    Cargando menú...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dishes.map((dish) => {
                  const count = qty[dish.id] || 0;
                  const isInactive = dish.status === "Inactivo";

                  return (
                    <div
                      key={dish.id}
                      className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                        isInactive
                          ? "bg-[var(--color-secondary-950)]/50 border-[var(--color-secondary-800)]/40 opacity-50 cursor-not-allowed"
                          : "bg-[var(--color-secondary-900)] border-[var(--color-secondary-800)] hover:border-[var(--color-secondary-700)] shadow-sm"
                      }`}
                    >
                      {/* Imagen pequeña del platillo */}
                      <div className="size-14 rounded-lg overflow-hidden border border-[var(--color-secondary-700)] bg-[var(--color-secondary-950)] shrink-0 shadow-xs">
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

                      {/* Contador de unidades */}
                      <div className="flex items-center gap-2 bg-[var(--color-secondary-950)] px-2 py-1 rounded-lg border border-[var(--color-secondary-800)]">
                        <button
                          type="button"
                          disabled={count === 0}
                          onClick={() => handleDecrement(dish)}
                          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-[var(--color-gray-300)] hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-[var(--color-white)]">
                          {count}
                        </span>
                        <button
                          type="button"
                          disabled={isInactive}
                          onClick={() => handleIncrement(dish)}
                          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-[var(--color-primary-400)] hover:text-[var(--color-primary-300)] disabled:opacity-30 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        ) : (
          /* Pestaña de listado */
          <div className="bg-[var(--color-secondary-900)] p-6 rounded-xl border border-[var(--color-secondary-800)] shadow-md">
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
          title="Anular Comanda del Sistema"
          description={`¿Estás seguro de que deseas anular la comanda ${orderToCancel.id}?`}
          confirmText="Sí, anular comanda"
          cancelText="No, conservar"
          isDestructive={true}
          onConfirm={handleConfirmCancel}
          onCancel={() => setOrderToCancel(null)}
        />
      )}
    </div>
  );
}
