import { useState } from "react";
import { DataTable, Button, ListReportModal } from "@/shared";
import { inventoryColumns } from "../table/InventoryColumns";
import { inventory } from "../data/inventory";
import { Link } from "react-router-dom";

const inventoryReportFields = [
    { key: "productName", label: "Producto", default: true },
    { key: "productCategory", label: "Categoría", default: true },
    { key: "currentStock", label: "Stock actual", default: true },
    { key: "minStock", label: "Stock mínimo", default: true },
    { key: "maxStock", label: "Stock máximo", default: true },
    { key: "supplier", label: "Proveedor", default: true },
    { key: "lastUpdated", label: "Última actualización", default: false },
];

export default function InventoryListPage() {
    const [isReportOpen, setIsReportOpen] = useState(false);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Listado de inventario</h1>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setIsReportOpen(true)}>
                        Generar reporte
                    </Button>
                    <Link to="/CreateProduct">
                        <Button>Agregar producto</Button>
                    </Link>
                </div>
            </div>
            <DataTable data={inventory} columns={inventoryColumns} />
            <ListReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                title="inventario"
                data={inventory}
                fields={inventoryReportFields}
                filePrefix="inventory"
            />
        </div>
    );
}
