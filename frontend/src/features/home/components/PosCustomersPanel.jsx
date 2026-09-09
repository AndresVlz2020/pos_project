import { useState } from "react";
import { UserCheck, Search, Award, Receipt, ArrowRight, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-white)] flex items-center gap-2">
            <UserCheck className="size-5 text-[var(--color-secondary-400)]" />
            Clientes para Facturación POS & Fidelización
          </h2>
          <p className="text-xs text-[var(--color-gray-400)] mt-0.5">
            Búsqueda rápida de clientes por Cédula o NIT para asignar a la comanda activa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por cédula / nombre..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] text-xs text-white placeholder:text-[var(--color-gray-400)] outline-none focus:border-[var(--color-secondary-400)] w-60"
            />
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-primary-800)] hover:bg-[var(--color-primary-700)] text-xs font-semibold text-[var(--color-white)] border border-[var(--color-primary-700)] transition-colors"
          >
            <UserPlus className="size-3.5" />
            <span>Nuevo Cliente</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((customer) => (
          <div
            key={customer.id}
            className="rounded-xl border border-[var(--color-primary-800)] bg-[var(--color-primary-900)] p-4 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-primary-800)] text-[var(--color-secondary-300)] font-bold">
                  {customer.docType}: {customer.docNumber}
                </span>
                <span className="text-[10px] font-semibold text-[var(--color-secondary-300)] bg-[var(--color-primary-800)] px-2 py-0.5 rounded border border-[var(--color-primary-700)]">
                  {customer.category}
                </span>
              </div>

              <h4 className="text-sm font-bold text-[var(--color-white)] mt-2 line-clamp-1">
                {customer.name}
              </h4>
              <p className="text-xs text-[var(--color-gray-400)] font-mono">
                Tel: {customer.phone}
              </p>
            </div>

            <div className="pt-2.5 border-t border-[var(--color-primary-800)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-[var(--color-secondary-300)] font-semibold text-[11px]">
                <Award className="size-3.5" />
                <span>{customer.points} pts</span>
              </div>

              <Link
                to="/CreateOrder"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-[11px] font-semibold text-white transition-colors"
              >
                <Receipt className="size-3" />
                Asignar Venta
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
