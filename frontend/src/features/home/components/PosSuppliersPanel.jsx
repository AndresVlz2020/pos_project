import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { M3Icon } from "@/shared";
import { API_URL } from "@/features/config";
import { getSupplierImage } from "@/utils/imageHelper";
import { getAuthToken } from "@/shared/utils/authStorage";

export default function PosSuppliersPanel() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const token = getAuthToken();

    fetch(`${API_URL}/suppliers`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!active) return;
        const activeSuppliers = (Array.isArray(data) ? data : []).filter(
          (s) => s.is_active !== false
        );
        setSuppliers(activeSuppliers.slice(0, 8));
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
    <div className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-title-lg font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
          <M3Icon name="local_shipping" size={22} className="text-[var(--md-sys-color-primary)]" />
          Proveedores de Insumos & Materia Prima
        </h2>

        <Link
          to="/supplierList"
          className="m3-state inline-flex items-center min-h-[40px] px-4 rounded-full gap-1.5 text-sm font-medium text-[var(--md-sys-color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
        >
          <span>Ver todos los proveedores</span>
          <M3Icon name="arrow_forward" size={18} />
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] py-10 text-center">
          Cargando proveedores...
        </p>
      ) : suppliers.length === 0 ? (
        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] py-10 text-center border border-dashed border-[var(--md-sys-color-outline-variant)] rounded-xl">
          No hay proveedores activos registrados.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {suppliers.map((supplier) => {
            const { image: supplierImg } = getSupplierImage(supplier);
            const name = supplier.company_name || supplier.name || "Proveedor";
            return (
              <div
                key={supplier.id}
                className="rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] m3-elevation-1 overflow-hidden flex flex-col justify-between hover:border-[var(--md-sys-color-primary)]"
              >
                <div>
                  <div className="h-32 w-full overflow-hidden bg-[var(--md-sys-color-surface-container)]">
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

                  <div className="p-4 space-y-2">
                    <h4 className="text-base leading-6 font-medium text-[var(--md-sys-color-on-surface)] line-clamp-1">
                      {name}
                    </h4>

                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-mono">
                      NIT: {supplier.nit}
                    </p>

                    <div className="pt-2 border-t border-[var(--md-sys-color-outline-variant)] space-y-1 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      <div className="flex items-center gap-1.5 truncate">
                        <M3Icon name="call" size={16} className="text-[var(--md-sys-color-primary)]" />
                        <span className="font-mono">{supplier.phone || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <M3Icon name="mail" size={16} className="text-[var(--md-sys-color-primary)]" />
                        <span className="truncate">{supplier.email || "—"}</span>
                      </div>
                      {supplier.observation ? (
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] line-clamp-1 pt-0.5">
                          {supplier.observation}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link
                    to="/supplierList"
                    className="m3-state w-full h-10 flex items-center justify-center px-6 rounded-full bg-[var(--md-sys-color-secondary-container)] text-sm font-medium text-[var(--md-sys-color-on-secondary-container)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
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
