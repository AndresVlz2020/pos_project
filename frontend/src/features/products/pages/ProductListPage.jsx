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
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Listado de productos</h1>
                <div className="flex gap-2">
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
