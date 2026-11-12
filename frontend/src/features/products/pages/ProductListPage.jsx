import { useState, useEffect, useCallback, useMemo } from "react";
import { DataTable, Button, ListReportModal, ConfirmDialog, Alert, showConfirmAlert, showSuccessAlert, showErrorAlert } from "@/shared";
import { getProductColumns } from "../table/ProductColumns";
import { getProducts, updateProductStatus } from "../services/productServices";
import usePermission from "@/features/access/services/usePermission";
import { Link } from "react-router-dom";

const productReportFields = [
  { key: "code", label: "Código", default: true },
  { key: "title", label: "Platillo / Producto", default: true },
  { key: "price", label: "Precio Unitario", default: true },
  { key: "category", label: "Categoría", default: true },
  { key: "stock", label: "Stock", default: true },
  { key: "status", label: "Estado", default: true },
  { key: "description", label: "Descripción", default: false },
];

export default function ProductListPage() {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const { granted: canToggleStatus } = usePermission("disable_product");
  const { granted: canEdit } = usePermission("update_product");
  const { granted: canCreate } = usePermission("create_product");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      const formatted = (data || []).map((p) => ({
        ...p,
        title: p.title || p.name,
        category: p.category || p.category_name || "General",
        status: p.is_active ? "Activo" : "Inactivo",
      }));
      setProductList(formatted);
    } catch (error) {
      console.error("Error al cargar productos desde PostgreSQL:", error);
      setFeedback({
        type: "error",
        title: "Error de conexión",
        message: "No se pudieron cargar los productos desde la base de datos.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Manejo de solicitud de cambio de estado con confirmación mediante SweetAlert
  const handleRequestStatusChange = async (product, targetState) => {
    const prodName = product.title || product.name || "Platillo";
    const actionText = targetState ? "habilitar" : "inhabilitar";

    const result = await showConfirmAlert({
      title: targetState ? "¿Desea habilitar este platillo?" : "¿Desea inhabilitar este platillo?",
      text: targetState
        ? `¿Desea habilitar el platillo "${prodName}"? Volverá a estar disponible para la venta en el punto de venta (POS) y comandas.`
        : `¿Está seguro de que desea inhabilitar el platillo "${prodName}"? Quedará excluido de nuevas órdenes.`,
      confirmButtonText: targetState ? "Sí, habilitar" : "Sí, inhabilitar",
      cancelButtonText: "Cancelar",
      isDestructive: !targetState,
    });

    if (!result.isConfirmed) return;

    try {
      await updateProductStatus(product.id, targetState);
      setProductList((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                is_active: targetState,
                status: targetState ? "Activo" : "Inactivo",
              }
            : item
        )
      );

      await showSuccessAlert({
        title: "Estado actualizado",
        text: `El platillo "${prodName}" fue ${actionText} exitosamente.`,
      });
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      await showErrorAlert({
        title: "Error al actualizar",
        text: error.message || "No se pudo actualizar el estado del platillo.",
      });
    }
  };

  const columns = useMemo(
    () => getProductColumns({ onRequestStatusChange: handleRequestStatusChange, canToggleStatus, canEdit }),
    [canToggleStatus, canEdit]
  );

  return (
    <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-lg p-6 shadow-md text-[var(--color-white)] font-[family-name:var(--main-font)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-white)]">Listado de Productos</h1>
          <p className="text-xs text-[var(--color-gray-400)] mt-1">
            Conectado en tiempo real con PostgreSQL ({productList.length} platillos en menú)
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="secondary" onClick={fetchProducts} disabled={loading}>
            {loading ? "Sincronizando..." : "Refrescar"}
          </Button>
          <Button variant="primary" onClick={() => setIsReportOpen(true)}>
            Generar reporte
          </Button>
          {canCreate && (
            <Link to="/CreateProduct">
              <Button variant="primary">Crear producto</Button>
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

      {loading && productList.length === 0 ? (
        <div className="py-12 text-center text-[var(--color-gray-400)]">
          Cargando productos desde la base de datos...
        </div>
      ) : (
        <DataTable data={productList} columns={columns} />
      )}

      <ListReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="menú gastronómico"
        data={productList}
        fields={productReportFields}
        filePrefix="menu-platillos"
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
