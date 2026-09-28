import { useState } from "react";
import { DataTable, Button, ListReportModal } from "@/shared";
import { suppliersColumns } from "../table/SuppliersColumns";
import { suppliers } from "../data/suppliers";
import { Link } from "react-router-dom";

const suppliersReportFields = [
    { key: "id", label: "NIT", default: true },
    { key: "companyName", label: "Nombre", default: true },
    { key: "supplierEmail", label: "Email", default: true },
    { key: "supplierPhone", label: "Telefono", default: true },
    { key: "isActive", label: "Estado", default: true },
];

export default function SuppliersListPage() {
    const [isReportOpen, setIsReportOpen] = useState(false);

    return (
        <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-lg p-6 shadow-md text-[var(--color-white)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-xl font-bold text-[var(--color-white)]">Listado de Proveedores</h1>
                <div className="flex gap-2.5">
                    <Button variant="secondary" onClick={() => setIsReportOpen(true)}>
                        Generar reporte
                    </Button>
                    <Link to="/CreateSupplier">
                        <Button>Crear proveedor</Button>
                    </Link>
                </div>
            </div>
            <DataTable data={suppliers} columns={suppliersColumns} />
            <ListReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                title="proveedores"
                data={suppliers}
                fields={suppliersReportFields}
                filePrefix="suppliers"
            />
        </div>
    );
}
