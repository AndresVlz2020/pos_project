import { useState, useEffect, useMemo } from "react";
import { DataTable, Button, ListReportModal, ConfirmDialog, Alert } from "@/shared";
import { getSuppliersColumns } from "../table/SuppliersColumns";
import { getAllSuppliers, updateSupplierStatus } from "../services/suppliersServices";
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
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState(null);
  const [feedback, setFeedback] = useState(null);

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

  // Manejo de solicitud de cambio de estado con confirmación previa (RFADMIN17)
  const handleRequestStatusChange = (supplier, targetState) => {
    setPendingChange({
      supplier,
      targetState,
      title: targetState ? "Habilitar proveedor" : "Inhabilitar proveedor",
      description: targetState
        ? `¿Desea habilitar al proveedor ${supplier.companyName}? Volverá a estar disponible para asociar a nuevos insumos y productos.`
        : `¿Está seguro de que desea inhabilitar al proveedor ${supplier.companyName}? Conservará todo su historial pero no podrá asociarse a nuevos productos.`,
      isDestructive: !targetState,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingChange) return;
    const { supplier, targetState } = pendingChange;

    try {
      
      await updateSupplierStatus(supplier.id, targetState);

      setSuppliersList((prev) =>
        prev.map((s) =>
          s.id === supplier.id ? { ...s, isActive: targetState, is_active: targetState } : s
        )
      );

      setFeedback({
        type: "success",
        title: "Estado actualizado",
        message: `El proveedor ${supplier.companyName} fue ${
          targetState ? "habilitado" : "inhabilitado"
          } exitosamente.`,
        });
    } catch (error) {
      setFeedback({
        type: "error",
        title: "Error",
        message: error.message || "No se pudo actualizar el estado"
      });
    }

    setPendingChange(null);
  };

  const columns = useMemo(
    () => getSuppliersColumns({ onRequestStatusChange: handleRequestStatusChange }),
    []
  );

  return (
    <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-lg p-6 shadow-md text-[var(--color-white)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-[var(--color-white)]">Listado de Proveedores</h1>
        <div className="flex gap-2.5">
          <Button variant="primary" onClick={() => setIsReportOpen(true)}>
            Generar reporte
          </Button>
          <Link to="/CreateSupplier">
            <Button variant="primary">Crear proveedor</Button>
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

      <DataTable data={sortedSuppliers} columns={columns} />

      <ListReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="proveedores y distribuidores"
        data={sortedSuppliers}
        fields={suppliersReportFields}
        filePrefix="proveedores"
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
