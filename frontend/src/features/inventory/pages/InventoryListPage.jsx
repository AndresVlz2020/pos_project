import { useState, useEffect, useCallback, useMemo } from "react";
import { DataTable, Button, ListReportModal, ConfirmDialog, Alert } from "@/shared";
import { getInventoryColumns } from "../table/InventoryColumns";
import { getInventory, updateInventoryStatus } from "../services/inventoryServices";
import usePermission from "@/features/access/services/usePermission";
import { Link } from "react-router-dom";

const inventoryReportFields = [
  { key: "code", label: "Código Insumo", default: true },
  { key: "productName", label: "Insumo / Producto", default: true },
  { key: "brand", label: "Marca", default: true },
  { key: "productCategory", label: "Categoría", default: true },
  { key: "status", label: "Estado", default: true },
  { key: "currentStock", label: "Stock actual", default: true },
  { key: "minStock", label: "Stock mínimo", default: false },
  { key: "supplier", label: "Proveedor", default: true },
  { key: "lastUpdated", label: "Última actualización", default: false },
];

export default function InventoryListPage() {
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const { granted: canToggleStatus } = usePermission("disable_inventory");
  const { granted: canEdit } = usePermission("update_inventory");
  const { granted: canCreate } = usePermission("create_inventory");

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getInventory();
      const formatted = (data || []).map((item) => ({
        ...item,
        productName: item.productName || item.name,
        productCategory: item.productCategory || item.category || "General",
        currentStock: Number(item.currentStock ?? item.quantity ?? 0),
        status: item.is_active ? "Activo" : "Inactivo",
        supplier: item.supplier || item.supplier_name || "—",
      }));
      setInventoryList(formatted);
    } catch (error) {
      console.error("Error al cargar inventario desde PostgreSQL:", error);
      setFeedback({
        type: "error",
        title: "Error de conexión",
        message: "No se pudo cargar el inventario desde la base de datos.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Manejo de solicitud de cambio de estado con confirmación previa unificada
  const handleRequestStatusChange = (item, targetState) => {
    const itemName = item.productName || item.name || "Insumo";
    setPendingChange({
      item,
      targetState,
      title: targetState ? "Habilitar insumo" : "Inhabilitar insumo",
      description: targetState
        ? `¿Desea habilitar el insumo "${itemName}"? Volverá a estar disponible para movimientos de almacén y cocina.`
        : `¿Está seguro de que desea inhabilitar el insumo "${itemName}"? Conservará el historial de lotes pero quedará bloqueado para nuevos registros.`,
      isDestructive: !targetState,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingChange) return;
    const { item, targetState } = pendingChange;
    const itemName = item.productName || item.name || "Insumo";

    try {
      await updateInventoryStatus(item.id, targetState);
      setInventoryList((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                is_active: targetState,
                status: targetState ? "Activo" : "Inactivo",
              }
            : i
        )
      );
      setFeedback({
        type: "success",
        title: "Estado actualizado",
        message: `El insumo "${itemName}" fue ${
          targetState ? "habilitado" : "inhabilitado"
        } exitosamente en PostgreSQL.`,
      });
    } catch (error) {
      if (error?.isStepUpCancelled) {
        setPendingChange(null);
        return;
      }
      console.error("Error al cambiar estado:", error);
      setFeedback({
        type: "error",
        title: "Error al actualizar",
        message: error.message || "No se pudo sincronizar el cambio con la base de datos.",
      });
    }

    setPendingChange(null);
  };

  const columns = useMemo(
    () => getInventoryColumns({ onRequestStatusChange: handleRequestStatusChange, canToggleStatus, canEdit }),
    [canToggleStatus, canEdit]
  );

  return (
    <div className="flex-1 flex flex-col w-full rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-5 sm:p-6 m3-elevation-1 text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5">
        <div>
          <h1 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
            Listado de Inventario
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
          {canCreate && (
            <Link to="/CreateInventory">
              <Button variant="filled" leadingIcon="add">
                Crear insumo
              </Button>
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

      {loading && inventoryList.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-12 text-body-md text-[var(--md-sys-color-on-surface-variant)]">
          Cargando inventario desde la base de datos...
        </div>
      ) : (
        <DataTable className="flex-1" data={inventoryList} columns={columns} />
      )}

      <ListReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="inventario de insumos"
        data={inventoryList}
        fields={inventoryReportFields}
        filePrefix="inventario"
        statusKey="status"
        onReportSuccess={(msg) =>
          setFeedback({
            type: "success",
            title: "Reporte generado",
            message: msg || "Reporte generado exitosamente",
          })
        }
      />

      {pendingChange && (
        <ConfirmDialog
          isOpen={Boolean(pendingChange)}
          title={pendingChange.title}
          description={pendingChange.description}
          confirmText={pendingChange.targetState ? "Habilitar" : "Inhabilitar"}
          cancelText="Cancelar"
          isDestructive={pendingChange.isDestructive}
          onConfirm={handleConfirmStatusChange}
          onCancel={() => setPendingChange(null)}
        />
      )}
    </div>
  );
}
