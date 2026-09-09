import { Truck, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { posSuppliers } from "../data/posMockData";

export default function PosSuppliersPanel() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-[family-name:var(--main-font)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-white)] flex items-center gap-2">
            <Truck className="size-5 text-[var(--color-secondary-400)]" />
            Proveedores de Insumos & Materia Prima
          </h2>
          <p className="text-xs text-[var(--color-gray-400)] mt-0.5">
            Directorio de compras para reabastecimiento de carnes, lácteos, fruver, bebidas y empaques.
          </p>
        </div>

        <Link
          to="/supplierList"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-secondary-300)] hover:text-[var(--color-secondary-200)] hover:underline"
        >
          <span>Ver todos los proveedores</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-[family-name:var(--main-font)]">
        {posSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="rounded-lg border border-[var(--color-primary-800)] bg-[var(--color-primary-900)] overflow-hidden flex flex-col justify-between hover:border-[var(--color-primary-700)] transition-colors"
          >
            <div>
              {/* Imagen limpia sin etiquetas flotantes ni degradados superpuestos */}
              <div className="h-28 w-full overflow-hidden bg-[var(--color-primary-950)]">
                <img
                  src={supplier.image}
                  alt={supplier.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="p-3.5 space-y-2">
                <h4 className="text-sm font-bold text-[var(--color-white)] line-clamp-1">
                  {supplier.name}
                </h4>

                <p className="text-[11px] text-[var(--color-gray-400)] font-mono">
                  NIT: {supplier.nit}
                </p>

                <div className="pt-2 border-t border-[var(--color-primary-800)] space-y-1 text-xs text-[var(--color-gray-300)]">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="size-3.5 text-[var(--color-secondary-400)] shrink-0" />
                    <span className="font-mono">{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="size-3.5 text-[var(--color-secondary-400)] shrink-0" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-gray-400)]">
                    <Clock className="size-3 text-[var(--color-secondary-400)] shrink-0" />
                    <span>{supplier.leadTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 pt-0">
              <Link
                to="/supplierList"
                className="w-full block text-center py-1.5 px-3 rounded-md bg-[var(--color-primary-800)] hover:bg-[var(--color-primary-700)] text-[11px] font-semibold text-[var(--color-gray-200)] hover:text-white transition-colors"
              >
                Consultar Ficha Técnica
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
