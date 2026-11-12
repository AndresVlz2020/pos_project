import { useEffect, useState } from "react";
import { Truck, Phone, Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { API_URL } from "@/features/config";
import { getSupplierImage } from "@/utils/imageHelper";

// Muestra los proveedores activos de la BD (los 26 reales sembrados,
// con imágenes y categorización resueltas por palabra clave).
export default function PosSuppliersPanel() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const token =
      localStorage.getItem("auth_token") || sessionStorage.getItem("token");

    fetch(`${API_URL}/suppliers`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!active) return;
        const activeSuppliers = (Array.isArray(data) ? data : []).filter(
          (s) => s.is_active !== false
        );
        setSuppliers(activeSuppliers.slice(0, 6));
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setSuppliers([]);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-[family-name:var(--main-font)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-white)] flex items-center gap-2">
            <Truck className="size-5 text-[var(--color-primary-400)]" />
            Proveedores de Insumos & Materia Prima
          </h2>
        </div>

        <Link
          to="/supplierList"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary-300)] hover:text-[var(--color-primary-200)] hover:underline"
        >
          <span>Ver todos los proveedores</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {loading ? (
        <p className="text-xs text-[var(--color-gray-400)] py-8 text-center">
          Cargando proveedores desde la base de datos...
        </p>
      ) : suppliers.length === 0 ? (
        <p className="text-xs text-[var(--color-gray-400)] py-8 text-center border border-dashed border-[var(--color-secondary-800)] rounded-lg">
          No hay proveedores activos registrados.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-[family-name:var(--main-font)]">
          {suppliers.map((supplier) => {
            const { image: supplierImg } = getSupplierImage(supplier);
            const name = supplier.company_name || supplier.name || "Proveedor";
            return (
              <div
                key={supplier.id}
                className="rounded-lg border border-[var(--color-secondary-800)] bg-[var(--color-secondary-900)] overflow-hidden flex flex-col justify-between hover:border-[var(--color-secondary-700)] transition-colors"
              >
                <div>
                  <div className="h-28 w-full overflow-hidden bg-[var(--color-secondary-950)]">
                    <img
                      src={supplierImg}
                      alt={name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = supplierImg;
                      }}
                    />
                  </div>

                  <div className="p-3.5 space-y-2">
                    <h4 className="text-sm font-bold text-[var(--color-white)] line-clamp-1">
                      {name}
                    </h4>

                    <p className="text-[11px] text-[var(--color-gray-400)] font-mono">
                      NIT: {supplier.nit}
                    </p>

                    <div className="pt-2 border-t border-[var(--color-secondary-800)] space-y-1 text-xs text-[var(--color-gray-300)]">
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="size-3.5 text-[var(--color-primary-400)] shrink-0" />
                        <span className="font-mono">{supplier.phone || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="size-3.5 text-[var(--color-primary-400)] shrink-0" />
                        <span className="truncate">{supplier.email || "—"}</span>
                      </div>
                      {supplier.observation ? (
                        <p className="text-[11px] text-[var(--color-gray-400)] line-clamp-1 pt-0.5">
                          {supplier.observation}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 pt-0">
                  <Link
                    to="/supplierList"
                    className="w-full block text-center py-1.5 px-3 rounded-md bg-[var(--color-secondary-800)] hover:bg-[var(--color-secondary-700)] text-[11px] font-semibold text-[var(--color-gray-200)] hover:text-white transition-colors"
                  >
                    Consultar Ficha Técnica
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
