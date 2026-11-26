import { useState, useEffect, useMemo, useCallback } from "react";
import { DataTable, Button, ListReportModal, ConfirmDialog, Alert } from "@/shared";
import { getOrderColumns } from "../table/OrderColumns";
import { getOrders, cancelOrder } from "../services/orderServices";
import OrderViewModal from "../components/OrderViewModal";
import KitchenOrdersView from "../components/KitchenOrdersView";
import WaiterOrdersView from "../components/WaiterOrdersView";
import OrderStatusFilterBar from "../components/OrderStatusFilterBar";
import usePermission from "@/features/access/services/usePermission";
import { getUserRoleFlags } from "@/shared/utils/authStorage";
import { summarizeOrderStatuses } from "../utils/orderFormHelpers";
import { Link } from "react-router-dom";

const orderReportFields = [
  { key: "id", label: "ID Orden", default: true },
  { key: "tableNumber", label: "Mesa", default: true },
  { key: "waiter", label: "Mesero", default: true },
  { key: "total", label: "Total Facturado", default: true },
  { key: "status", label: "Estado", default: true },
  { key: "observations", label: "Observaciones", default: false },
  { key: "createdAt", label: "Fecha y Hora", default: true },
];

export default function OrderListPage() {
  const { isAdmin, isCajero, isMesero, isCocina } = getUserRoleFlags();
  const canPayOrder = isAdmin || isCajero;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [tableFilter, setTableFilter] = useState("all");
  const [waiterFilter, setWaiterFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const { granted: canCreateOrder } = usePermission("create_order");
  const { granted: canEditOrder } = usePermission("update_order");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Error al cargar órdenes desde PostgreSQL:", error);
      setFeedback({
        type: "error",
        title: "Error de conexión",
        message: "No se pudieron cargar las órdenes.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isCocina || isMesero) return;
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchOrders();
    });
    return () => {
      active = false;
    };
  }, [fetchOrders, isCocina, isMesero]);

  // Ordenar por fecha descendente y normalizar estados canónicos (Creada / Completada / Pagada / Anulada)
  const { sortedOrders, statusCounts, tableOptions, waiterOptions, filteredOrders } = useMemo(() => {
    const sorted = [...orders].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0);
      const dateB = new Date(b.createdAt || b.created_at || 0);
      return dateB - dateA;
    });
    const { normalizedOrders, counts } = summarizeOrderStatuses(sorted);

    const uniqueTables = Array.from(
      new Set(normalizedOrders.map((o) => o.tableNumber || o.table_number).filter(Boolean))
    ).sort();
    const uniqueWaiters = Array.from(
      new Set(normalizedOrders.map((o) => o.waiter).filter(Boolean))
    ).sort();

    const filtered = normalizedOrders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      const tbl = o.tableNumber || o.table_number || "";
      if (tableFilter !== "all" && tbl !== tableFilter) return false;
      if (waiterFilter !== "all" && (o.waiter || "") !== waiterFilter) return false;
      if (dateFilter) {
        const rawDate = o.createdAt || o.created_at;
        const isoDay = rawDate ? new Date(rawDate).toISOString().slice(0, 10) : "";
        if (isoDay !== dateFilter) return false;
      }
      return true;
    });

    return {
      sortedOrders: normalizedOrders,
      statusCounts: counts,
      tableOptions: [{ value: "all", label: "Todas las mesas" }, ...uniqueTables.map((t) => ({ value: t, label: t }))],
      waiterOptions: [{ value: "all", label: "Todos los meseros" }, ...uniqueWaiters.map((w) => ({ value: w, label: w }))],
      filteredOrders: filtered,
    };
  }, [orders, statusFilter, tableFilter, waiterFilter, dateFilter]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleRequestCancel = (order) => {
    setOrderToCancel(order);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    const targetOrder = orderToCancel;
    setOrderToCancel(null);

    try {
      const identifier = targetOrder.numericId || targetOrder.id;
      await cancelOrder(identifier, "Cancelada por usuario en pantalla de administración");

      setOrders((prev) =>
        prev.map((o) =>
          o.id === targetOrder.id
            ? { ...o, status: "Anulada", orderStatus: "Anulada" }
            : o
        )
      );
      window.dispatchEvent(new CustomEvent("dpiero:orders-updated"));

      setFeedback({
        type: "success",
        title: "Orden Anulada",
        message: `La orden ${targetOrder.id} (${targetOrder.tableNumber}) ha sido anulada y su stock fue restaurado.`,
      });
    } catch (error) {
      if (error?.isStepUpCancelled) return;
      console.error("Error al anular orden:", error);
      setFeedback({
        type: "error",
        title: "Error al anular",
        message: error.message || "No se pudo anular la orden.",
      });
    }
  };

  const columns = useMemo(
    () =>
      getOrderColumns({
        onViewOrder: handleViewOrder,
        onRequestCancel: handleRequestCancel,
        canEdit: canEditOrder,
        canPay: canPayOrder,
      }),
    [canEditOrder, canPayOrder]
  );

  if (isCocina) {
    return <KitchenOrdersView />;
  }

  if (isMesero) {
    return <WaiterOrdersView />;
  }

  return (
    <div className="flex-1 flex flex-col w-full rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-5 sm:p-6 m3-elevation-1 text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <div>
          <h1 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
            Listado de Órdenes
          </h1>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="tonal"
            leadingIcon="download"
            onClick={() => setIsReportOpen(true)}
          >
            Generar reporte
          </Button>
          {canCreateOrder && (
            <Link to="/CreateOrder">
              <Button variant="filled" leadingIcon="add">
                Crear orden
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filtros M3 por estado canónico (Creada / Completada / Pagada / Anulada) */}
      <OrderStatusFilterBar
        value={statusFilter}
        onChange={setStatusFilter}
        counts={statusCounts}
        className="mb-3"
      />

      {feedback && (
        <div className="mb-4">
          <Alert
            type={feedback.type}
            title={feedback.title}
            message={feedback.message}
            onClose={() => setFeedback(null)}
          />
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-12 text-body-md text-[var(--md-sys-color-on-surface-variant)]">
          Cargando órdenes...
        </div>
      ) : (
        <DataTable
          className="flex-1"
          data={filteredOrders}
          columns={columns}
          filters={[
            {
              key: "status",
              label: "Estado",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "all", label: "Todos los estados" },
                { value: "Creada", label: "Creada" },
                { value: "Completada", label: "Completada" },
                { value: "Entregada", label: "Entregada" },
                { value: "Pagada", label: "Pagada" },
                { value: "Anulada", label: "Anulada" },
              ],
            },
            {
              key: "table",
              label: "Mesa",
              value: tableFilter,
              onChange: setTableFilter,
              options: tableOptions,
            },
            {
              key: "waiter",
              label: "Mesero",
              value: waiterFilter,
              onChange: setWaiterFilter,
              options: waiterOptions,
            },
            {
              key: "date",
              label: "Fecha",
              type: "date",
              defaultValue: "",
              value: dateFilter,
              onChange: setDateFilter,
            },
          ]}
          onClearFilters={() => {
            setStatusFilter("all");
            setTableFilter("all");
            setWaiterFilter("all");
            setDateFilter("");
          }}
        />
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
          description={`¿Estás seguro de que deseas anular la orden ${orderToCancel.id} perteneciente a la ${orderToCancel.tableNumber}? Esta acción marcará la orden como ANULADA.`}
          confirmText="Sí, anular orden"
          cancelText="No, conservar"
          isDestructive={true}
          onConfirm={handleConfirmCancel}
          onCancel={() => setOrderToCancel(null)}
        />
      )}

      {/* Modal de Reporte en Excel y PDF con filtros (RFADMIN31) */}
      <ListReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="órdenes"
        data={sortedOrders}
        fields={orderReportFields}
        filePrefix="ordenes-restaurante"
        statusKey="status"
        onReportSuccess={(msg) =>
          setFeedback({
            type: "success",
            title: "Reporte generado",
            message: msg || "Reporte generado exitosamente",
          })
        }
      />
    </div>
  );
}
