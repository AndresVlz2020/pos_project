import { useState } from "react";
import { DataTable, Button, ListReportModal } from "@/shared";
import { inventoryColumns } from "../table/InventoryColumns";
import { inventory } from "../data/inventory";
import { Link } from "react-router-dom";

const inventoryReportFields = [
  { key: "id", label: "ID Insumo", default: true },
  { key: "productName", label: "Producto", default: true },
  { key: "brand", label: "Marca", default: true },
  { key: "productCategory", label: "Categoría", default: true },
  { key: "status", label: "Estado", default: true },
  { key: "currentStock", label: "Stock actual", default: true },
  { key: "minStock", label: "Stock mínimo", default: false },
  { key: "maxStock", label: "Stock máximo", default: false },
  { key: "supplier", label: "Proveedor", default: true },
  { key: "lastUpdated", label: "Última actualización", default: false },
];

export default function InventoryListPage() {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [inventoryList, setInventoryList] = useState(inventory);

  return (
    <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-lg p-6 shadow-md text-[var(--color-white)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-[var(--color-white)]">Listado de Inventario</h1>
        <div className="flex gap-2.5">
          <Button variant="primary" onClick={() => setIsReportOpen(true)}>
            Generar reporte
          </Button>
          <Link to="/CreateInventory">
            <Button variant="primary">Crear insumo</Button>
          </Link>
        </div>
      </div>

      <DataTable data={inventoryList} columns={inventoryColumns} />

      <ListReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="inventario de insumos"
        data={inventoryList}
        fields={inventoryReportFields}
        filePrefix="inventario"
        statusKey="status"
      />
    </div>
  );
}
