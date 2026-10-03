import { useState } from "react";
import { DataTable, Button, ListReportModal, Alert } from "@/shared";
import { productColumns } from "../table/ProductColumns";
import { products } from "../data/products";
import { Link } from "react-router-dom";

const productReportFields = [
  { key: "code", label: "Código", default: true },
  { key: "title", label: "Platillo / Producto", default: true },
  { key: "price", label: "Precio Unitario", default: true },
  { key: "category", label: "Categoría", default: true },
  { key: "status", label: "Estado", default: true },
  { key: "description", label: "Descripción", default: false },
];

export default function ProductListPage() {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  return (
    <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-lg p-6 shadow-md text-[var(--color-white)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-[var(--color-white)]">Listado de Productos</h1>
        <div className="flex gap-2.5">
          <Button variant="primary" onClick={() => setIsReportOpen(true)}>
            Generar reporte
          </Button>
          <Link to="/CreateProduct">
            <Button variant="primary">Crear producto</Button>
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

      <DataTable data={products} columns={productColumns} />

      <ListReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="menú gastronómico"
        data={products}
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
