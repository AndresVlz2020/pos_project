import { useState } from "react";
import { UserCheck, Receipt } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, Button, SearchField } from "@/shared";
import { posCustomers } from "../data/posMockData";

export default function PosCustomersPanel() {
  const [query, setQuery] = useState("");

  const filtered = posCustomers.filter((c) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.docNumber.includes(q) ||
      c.phone.includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-[family-name:var(--main-font)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-white)] flex items-center gap-2">
            <UserCheck className="size-5 text-[var(--color-secondary-500)]" />
            Clientes para Facturación POS
          </h2>
          <p className="text-xs text-[var(--color-gray-400)] mt-0.5">
            Búsqueda rápida de clientes por Cédula o NIT para asignar a la venta activa.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Buscar por cédula / nombre..."
            size="sm"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((customer) => (
            <Card key={customer.id} className="p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--color-gray-400)] mb-1.5">
                  <span className="font-mono">{customer.docType}: {customer.docNumber}</span>
                  <span className="font-semibold text-[var(--color-secondary-500)]">{customer.category}</span>
                </div>
                <h4 className="text-sm font-bold text-[var(--color-white)] line-clamp-1">{customer.name}</h4>
                <p className="text-xs text-[var(--color-gray-400)] mt-1">Tel: {customer.phone}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--color-primary-800)] flex justify-end">
                <Link to="/CreateOrder">
                  <Button size="sm" variant="primary">
                    <Receipt className="size-3.5 mr-1" />
                    Asignar Venta
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center rounded-lg border border-[var(--color-primary-800)] bg-[var(--color-primary-900)] p-6">
          <p className="text-xs text-[var(--color-gray-400)]">
            No se encontraron clientes con el criterio de búsqueda.
          </p>
        </div>
      )}
    </div>
  );
}
