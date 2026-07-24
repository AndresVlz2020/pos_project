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

export default function ProductListPage() {
    const [isReportOpen, setIsReportOpen] = useState(false);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Listado de proveedores</h1>
                <div className="flex gap-2">
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
