import { Phone, Mail, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, Button } from "@/shared";
import { posSuppliers } from "../data/posMockData";

export default function PosSuppliersPanel() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-[family-name:var(--main-font)]">

        <Link
          to="/supplierList"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-secondary-500)] hover:underline"
        >
          <span>Ver todos los proveedores</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-[family-name:var(--main-font)]">
        {posSuppliers.map((supplier) => (
          <Card
            key={supplier.id}
            className="overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="h-28 w-full overflow-hidden bg-[var(--color-primary-950)]">
                <img
                  src={supplier.image}
                  alt={supplier.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="p-4 space-y-2">
                <h4 className="text-sm font-bold text-[var(--color-white)] line-clamp-1">
                  {supplier.name}
                </h4>

                <p className="text-[11px] text-[var(--color-gray-400)] font-mono">
                  NIT: {supplier.nit}
                </p>

                <div className="pt-2 border-t border-[var(--color-primary-800)] space-y-1 text-xs text-[var(--color-gray-400)]">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="size-3.5 text-[var(--color-secondary-500)] shrink-0" />
                    <span className="font-mono text-[var(--color-white)]">{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="size-3.5 text-[var(--color-secondary-500)] shrink-0" />
                    <span className="truncate text-[var(--color-white)]">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-gray-400)]">
                    <Clock className="size-3 text-[var(--color-secondary-500)] shrink-0" />
                    <span>{supplier.leadTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <Link to="/supplierList" className="block w-full">
                <Button variant="secondary" className="w-full text-xs">
                  Consultar Ficha Técnica
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
