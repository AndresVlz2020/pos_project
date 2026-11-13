import { useState, useEffect, useMemo, useCallback } from "react";
import { DataTable, Button, ListReportModal, ConfirmDialog, Alert } from "@/shared";
import { getOrderColumns } from "../table/OrderColumns";
import { getOrders, cancelOrder } from "../services/orderServices";
import OrderViewModal from "../components/OrderViewModal";
import usePermission from "@/features/access/services/usePermission";
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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const { granted: canCreateOrder } = usePermission("create_order");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Error al cargar comandas desde PostgreSQL:", error);
      setFeedback({
        type: "error",
        title: "Error de conexión",
        message: "No se pudieron cargar las órdenes desde la base de datos.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Ordenar por fecha descendente (RFADMIN28)
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0);
      const dateB = new Date(b.createdAt || b.created_at || 0);
      return dateB - dateA;
    });
  }, [orders]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleRequestCancel = (order) => {
    setOrderToCancel(order);
  };

  // Confirmación explícita antes de anular (RFADMIN30) y actualización en PostgreSQL
  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;

    try {
      const identifier = orderToCancel.numericId || orderToCancel.id;
      await cancelOrder(identifier, "Cancelada por usuario en pantalla de administración");

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderToCancel.id
            ? { ...o, status: "Anulada", orderStatus: "Anulada" }
            : o
        )
      );

      setFeedback({
        type: "success",
        title: "Orden Anulada",
        message: `La comanda ${orderToCancel.id} (${orderToCancel.tableNumber}) ha sido anulada en PostgreSQL y su stock fue restaurado.`,
      });
    } catch (error) {
      console.error("Error al anular orden:", error);
      setFeedback({
        type: "error",
        title: "Error al anular",
        message: error.message || "No se pudo anular la orden en la base de datos.",
      });
    } finally {
      setOrderToCancel(null);
    }
  };

  const columns = useMemo(
    () =>
      getOrderColumns({
        onViewOrder: handleViewOrder,
        onRequestCancel: handleRequestCancel,
      }),
    []
  );

  return (
    <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-lg p-6 shadow-md text-[var(--color-white)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-white)]">
            Listado de Órdenes y Comandas
          </h1>
        </div>

        <div className="flex gap-2.5">
          <Button variant="primary" onClick={() => setIsReportOpen(true)}>
            Generar reporte
          </Button>
          {canCreateOrder && (
            <Link to="/CreateOrder">
              <Button variant="primary">Crear comanda</Button>
            </Link>
          )}
        </div>
      </div>

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
        <div className="py-12 text-center text-[var(--color-gray-400)]">
          Cargando comandas desde PostgreSQL...
        </div>
      ) : (
        <DataTable data={sortedOrders} columns={columns} />
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
          description={`¿Estás seguro de que deseas anular la comanda ${orderToCancel.id} perteneciente a la ${orderToCancel.tableNumber}? Esta acción marcará la orden como ANULADA en PostgreSQL.`}
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
        title="órdenes y comandas"
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
