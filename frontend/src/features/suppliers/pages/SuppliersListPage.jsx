import { useState, useEffect, useMemo } from "react";
import { DataTable, Button, ListReportModal, Alert, showConfirmAlert, showSuccessAlert, showErrorAlert } from "@/shared";
import { getSuppliersColumns } from "../table/SuppliersColumns";
import { getAllSuppliers, updateSupplierStatus } from "../services/suppliersServices";
import usePermission from "@/features/access/services/usePermission";
import { Link } from "react-router-dom";

const suppliersReportFields = [
  { key: "id", label: "NIT / Documento", default: true },
  { key: "companyName", label: "Razón Social", default: true },
  { key: "supplierEmail", label: "Email Corporativo", default: true },
  { key: "supplierPhone", label: "Teléfono", default: true },
  { key: "isActive", label: "Estado (Habilitado)", default: true },
];

export default function SuppliersListPage() {
  const [suppliersList, setSuppliersList] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const { granted: canToggleStatus } = usePermission("disable_supplier");
  const { granted: canEdit } = usePermission("update_supplier");
  const { granted: canCreate } = usePermission("create_supplier");

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const data = await getAllSuppliers();

        const formattedData = data.map(s => ({
          ...s,
          companyName: s.companyName || s.company_name,
          supplierEmail: s.supplierEmail || s.email,
          supplierPhone: s.supplierPhone || s.phone,
          isActive: s.isActive ?? s.is_active ?? true
        }));

        setSuppliersList(formattedData);
      } catch (error) {
        console.error("Error al cargar proveedores", error);
        setFeedback({
          type: "error",
          title: "Error de conexión",
          message: error.message || "No se pudieron cargar los proveedores"
        });
      }
    }

    loadSuppliers();
  }, []);

  // Ordenar alfabéticamente por defecto (RFADMIN17, RFADMIN18)
  const sortedSuppliers = useMemo(() => {
    return [...suppliersList].sort((a, b) =>
      (a.companyName || "").localeCompare(b.companyName || "")
    );
  }, [suppliersList]);

  // Manejo de solicitud de cambio de estado con confirmación mediante SweetAlert
  const handleRequestStatusChange = async (supplier, targetState) => {
    const actionText = targetState ? "habilitar" : "inhabilitar";
    const compName = supplier.companyName || supplier.company_name || "Proveedor";

    const result = await showConfirmAlert({
      title: targetState ? "¿Desea habilitar este proveedor?" : "¿Desea inhabilitar este proveedor?",
      text: targetState
        ? `¿Desea habilitar al proveedor "${compName}"? Volverá a estar disponible para asociar a nuevos insumos y productos.`
        : `¿Está seguro de que desea inhabilitar al proveedor "${compName}"? Conservará todo su historial pero no podrá asociarse a nuevos productos.`,
      confirmButtonText: targetState ? "Sí, habilitar" : "Sí, inhabilitar",
      cancelButtonText: "Cancelar",
      isDestructive: !targetState,
    });

    if (!result.isConfirmed) return;

    try {
      await updateSupplierStatus(supplier.id, targetState);

      setSuppliersList((prev) =>
        prev.map((s) =>
          s.id === supplier.id ? { ...s, isActive: targetState, is_active: targetState } : s
        )
      );

      await showSuccessAlert({
        title: "Estado actualizado",
        text: `El proveedor "${compName}" fue ${actionText} exitosamente.`,
      });
    } catch (error) {
      if (error?.isStepUpCancelled) return;
      await showErrorAlert({
        title: "Error al actualizar",
        text: error.message || "No se pudo actualizar el estado",
      });
    }
  };

  const filteredSuppliers = useMemo(() => {
    return sortedSuppliers.filter((s) => {
      const isAct = s.isActive ?? s.is_active ?? true;
      if (statusFilter === "active" && !isAct) return false;
      if (statusFilter === "inactive" && isAct) return false;
      return true;
    });
  }, [sortedSuppliers, statusFilter]);

  const tableFilters = useMemo(
    () => [
      {
        key: "status",
        label: "Estado",
        value: statusFilter,
        onChange: setStatusFilter,
        options: [
          { value: "all", label: "Todos los estados" },
          { value: "active", label: "Activos" },
          { value: "inactive", label: "Inactivos" },
        ],
      },
    ],
    [statusFilter]
  );

  const columns = useMemo(
    () => getSuppliersColumns({ onRequestStatusChange: handleRequestStatusChange, canToggleStatus, canEdit }),
    [canToggleStatus, canEdit]
  );

  return (
    <div className="flex-1 flex flex-col w-full rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-5 sm:p-6 m3-elevation-1 text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5">
        <div>
          <h1 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
            Listado de Proveedores
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
            <Link to="/CreateSupplier">
              <Button variant="filled" leadingIcon="add">
                Crear proveedor
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

      <DataTable
        className="flex-1"
        data={filteredSuppliers}
        columns={columns}
        filters={tableFilters}
        onClearFilters={() => setStatusFilter("all")}
      />

      <ListReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="proveedores y distribuidores"
        data={filteredSuppliers}
        fields={suppliersReportFields}
        filePrefix="proveedores"
      />
    </div>
  );
}
