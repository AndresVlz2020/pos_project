import { useState, useMemo } from "react";
import { DataTable, Button, ListReportModal, ConfirmDialog, Alert } from "@/shared";
import { getOrderColumns } from "../table/OrderColumns";
import { getStoredOrders, saveStoredOrders } from "../data/orders";
import OrderViewModal from "../components/OrderViewModal";
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
  const [orders, setOrders] = useState(() => getStoredOrders());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Ordenar por fecha descendente (RFADMIN28)
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
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

  // Confirmación explícita antes de anular (RFADMIN30)
  const handleConfirmCancel = () => {
    if (!orderToCancel) return;

    const updated = orders.map((o) =>
      o.id === orderToCancel.id ? { ...o, status: "Anulada" } : o
    );

    setOrders(updated);
    saveStoredOrders(updated);

    setFeedback({
      type: "success",
      title: "Orden Anulada",
      message: `La orden ${orderToCancel.id} de la ${orderToCancel.tableNumber} ha sido anulada correctamente.`,
    });

    setOrderToCancel(null);
  };

  const columns = useMemo(
    () =>
      getOrderColumns({
        onViewOrder: handleViewOrder,
        onRequestCancel: handleRequestCancel,
      }),
    [orders]
  );

  return (
    <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-lg p-6 shadow-md text-[var(--color-white)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-white)]">
            Listado de Órdenes y Comandas
          </h1>
          <p className="text-xs text-[var(--color-gray-400)] mt-0.5">
            Control de mesas activas, comandas abiertas y flujo de estados en el restaurante.
          </p>
        </div>

        <div className="flex gap-2.5">
          <Button variant="primary" onClick={() => setIsReportOpen(true)}>
            Generar reporte
          </Button>
          <Link to="/CreateOrder">
            <Button variant="primary">Crear comanda</Button>
          </Link>
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

      {/* Tabla de órdenes con filtros integrados en DataTable */}
      <DataTable data={sortedOrders} columns={columns} />

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
          description={`¿Estás seguro de que deseas anular la comanda ${orderToCancel.id} perteneciente a la ${orderToCancel.tableNumber}? Esta acción marcará la orden como ANULADA.`}
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
