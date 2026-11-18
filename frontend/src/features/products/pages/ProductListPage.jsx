import { useState, useEffect, useCallback, useMemo } from "react";
import { DataTable, Button, ListReportModal, Alert, showConfirmAlert, showSuccessAlert, showErrorAlert } from "@/shared";
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
  const [feedback, setFeedback] = useState(null);
  const { granted: canToggleStatus } = usePermission("disable_product");
  const { granted: canEdit } = usePermission("update_product");
  const { granted: canCreate } = usePermission("create_product");

  const loadProductsData = useCallback(async () => {
    const data = await getProducts();
    return (data || []).map((p) => ({
      ...p,
      title: p.title || p.name,
      category: p.category || p.category_name || "General",
      status: p.is_active ? "Activo" : "Inactivo",
    }));
  }, []);

  useEffect(() => {
    let active = true;
    loadProductsData()
      .then((formatted) => {
        if (active) setProductList(formatted);
      })
      .catch((error) => {
        console.error("Error al cargar productos desde PostgreSQL:", error);
        if (active) {
          setFeedback({
            type: "error",
            title: "Error de conexión",
            message: "No se pudieron cargar los productos.",
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadProductsData]);

  // Manejo de solicitud de cambio de estado con confirmación mediante SweetAlert
  const handleRequestStatusChange = async (product, targetState) => {
    const prodName = product.title || product.name || "Platillo";
    const actionText = targetState ? "habilitar" : "inhabilitar";

    const result = await showConfirmAlert({
      title: targetState ? "¿Desea habilitar este platillo?" : "¿Desea inhabilitar este platillo?",
      text: targetState
        ? `¿Desea habilitar el platillo "${prodName}"? Volverá a estar disponible para la venta en el punto de venta (POS) y órdenes.`
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
      if (error?.isStepUpCancelled) return;
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
    <div className="flex-1 flex flex-col w-full rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-5 sm:p-6 m3-elevation-1 text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5">
        <div>
          <h1 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
            Listado de Productos
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
            <Link to="/CreateProduct">
              <Button variant="filled" leadingIcon="add">
                Crear producto
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

      {loading && productList.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-12 text-body-md text-[var(--md-sys-color-on-surface-variant)]">
          Cargando productos...
        </div>
      ) : (
        <DataTable className="flex-1" data={productList} columns={columns} />
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
    </div>
  );
}
