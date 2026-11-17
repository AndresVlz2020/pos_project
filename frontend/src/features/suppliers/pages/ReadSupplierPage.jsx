import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, M3Icon } from "@/shared";
import { getSupplierImage } from "@/utils/imageHelper";

export default function ReadSupplierPage() {
  const location = useLocation();

  // Recuperación en recargas (F5) mediante sessionStorage
  const incoming =
    location.state?.supplier ||
    (() => {
      try {
        return JSON.parse(sessionStorage.getItem("last_viewed_supplier") || "null");
      } catch {
        return null;
      }
    })() ||
    null;

  useEffect(() => {
    if (location.state?.supplier) {
      sessionStorage.setItem("last_viewed_supplier", JSON.stringify(location.state.supplier));
    }
  }, [location.state]);

  const supplierName =
    incoming?.companyName ||
    incoming?.company_name ||
    incoming?.supplierName ||
    "Distribuidora Lácteos del Campo S.A.S.";

  const nit = incoming?.nit || incoming?.id || "900.123.456-1";

  const supplierEmail =
    incoming?.supplierEmail ||
    incoming?.email ||
    "ventas@proveedor.com";

  const supplierPhone =
    incoming?.supplierPhone ||
    incoming?.phone ||
    "3001234567";

  const supplierDirection =
    incoming?.supplierDirection ||
    incoming?.address ||
    "Calle 45 # 12-34, Zona Industrial";

  const observation =
    incoming?.supplierObservation ||
    incoming?.observation ||
    "Proveedor comercial activo para el abastecimiento del restaurante D'Piero.";

  const isActive = incoming?.isActive ?? incoming?.is_active ?? true;
  const status = isActive ? "Activo" : "Inactivo";

  const { image: supplierImage, category: supplierCategory } =
    getSupplierImage({ companyName: supplierName, nit, observation });

  return (
    <div className="flex-1 flex flex-col w-full font-[family-name:var(--main-font)]">
      <div className="flex-1 flex flex-col w-full bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-5 sm:p-8 m3-elevation-1 text-[var(--md-sys-color-on-surface)] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--md-sys-color-outline-variant)]">
          <div>
            <h1 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
              Ficha del Proveedor
            </h1>
          </div>
          <Link to="/supplierList">
            <Button variant="outlined" size="md" leadingIcon="arrow_back">
              Volver al Listado
            </Button>
          </Link>
        </div>

        {/* Cabecera del proveedor */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[var(--md-sys-color-outline-variant)]">
          <div className="size-28 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] overflow-hidden shrink-0 relative flex items-center justify-center m3-elevation-1">
            {supplierImage ? (
              <img
                src={supplierImage}
                alt={supplierName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.parentElement?.querySelector(".avatar-fallback");
                  if (fallback) fallback.classList.remove("hidden");
                }}
              />
            ) : null}
            <div className={`avatar-fallback ${supplierImage ? "hidden" : "flex"} w-full h-full flex-col items-center justify-center bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]`}>
              <M3Icon name="storefront" size={38} />
              <span className="text-label-sm font-bold mt-1 uppercase">
                {supplierName.slice(0, 3)}
              </span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
              <h2 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                {supplierName}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-label-md font-medium border ${
                  isActive
                    ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)]/40"
                    : "bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)]"
                }`}
              >
                <M3Icon name={isActive ? "check_circle" : "cancel"} size={14} />
                {status}
              </span>
            </div>
            <p className="text-label-md text-[var(--md-sys-color-on-surface-variant)] font-mono">
              NIT: {nit}
            </p>
          </div>
        </div>

        {/* Sección 1: Información General */}
        <div>
          <h3 className="text-label-lg font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)] flex items-center gap-2 mb-3">
            <M3Icon name="storefront" size={18} />
            1. Información General
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-body-sm">
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Razón Social:</span>
              <span className="font-semibold text-[var(--md-sys-color-on-surface)] text-body-md">{supplierName}</span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">NIT:</span>
              <span className="font-semibold text-[var(--md-sys-color-on-surface)] font-mono">{nit}</span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Línea de Suministro:</span>
              <span className="font-semibold text-[var(--md-sys-color-on-surface)]">{supplierCategory}</span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Estado Operativo:</span>
              <span
                className={`font-semibold ${
                  isActive ? "text-[var(--md-sys-color-primary)]" : "text-[var(--md-sys-color-on-surface-variant)]"
                }`}
              >
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Sección 2: Datos de Contacto y Ubicación */}
        <div>
          <h3 className="text-label-lg font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)] flex items-center gap-2 mb-3">
            <M3Icon name="mail" size={18} />
            2. Datos de Contacto y Ubicación
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-body-sm">
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Correo Electrónico:</span>
              <span className="font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5 mt-0.5">
                <M3Icon name="mail" size={15} className="text-[var(--md-sys-color-primary)]" />
                {supplierEmail}
              </span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Teléfono de Pedidos:</span>
              <span className="font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5 mt-0.5 font-mono">
                <M3Icon name="call" size={15} className="text-[var(--md-sys-color-primary)]" />
                {supplierPhone}
              </span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Dirección de Despacho:</span>
              <span className="font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5 mt-0.5">
                <M3Icon name="location_on" size={15} className="text-[var(--md-sys-color-primary)]" />
                {supplierDirection}
              </span>
            </div>
          </div>
        </div>

        {/* Sección 3: Datos Comerciales & Términos */}
        <div>
          <h3 className="text-label-lg font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)] flex items-center gap-2 mb-3">
            <M3Icon name="description" size={18} />
            3. Datos Comerciales & Términos
          </h3>
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-body-sm space-y-3">
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Términos de Negociación:</span>
              <span className="font-semibold text-[var(--md-sys-color-on-surface)]">Crédito a 30 días</span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Observaciones y Notas de Recepción:</span>
              <p className="text-[var(--md-sys-color-on-surface)] mt-0.5 leading-relaxed">
                {observation}
              </p>
            </div>
          </div>
        </div>

        {/* Botón de retorno inferior */}
        <div className="mt-auto pt-4 border-t border-[var(--md-sys-color-outline-variant)] flex justify-end">
          <Link to="/supplierList">
            <Button variant="outlined" size="md" leadingIcon="arrow_back">
              Volver al Listado
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
