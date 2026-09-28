import { useState } from "react";
import { DataTable, Button, ListReportModal } from "@/shared";
import { productColumns } from "../table/ProductColumns";
import { products } from "../data/products";
import { Link } from "react-router-dom";

const productReportFields = [
    { key: "title", label: "Producto", default: true },
    { key: "price", label: "Precio", default: true },
    { key: "description", label: "Descripción", default: true },
    { key: "category", label: "Categoría", default: true },
];

export default function ProductListPage() {
    const [isReportOpen, setIsReportOpen] = useState(false);

    return (
        <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-lg p-6 shadow-md text-[var(--color-white)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-xl font-bold text-[var(--color-white)]">Listado de Productos</h1>
                <div className="flex gap-2.5">
                    <Button variant="secondary" onClick={() => setIsReportOpen(true)}>
                        Generar reporte
                    </Button>
                    <Link to="/CreateProduct">
                        <Button>Crear producto</Button>
                    </Link>
                </div>
            </div>
            <DataTable data={products} columns={productColumns} />
            <ListReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                title="productos"
                data={products}
                fields={productReportFields}
                filePrefix="products"
            />
        </div>
    );
}
