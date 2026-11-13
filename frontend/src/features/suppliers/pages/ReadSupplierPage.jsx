import { useEffect } from "react";
import { Mail, Phone, MapPin, Building2, FileText, CheckCircle2, XCircle } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/shared";
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
    <div className="max-w-4xl mx-auto my-6 px-4 font-[family-name:var(--main-font)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-white)]">Ficha del Proveedor</h1>
          <p className="text-xs text-[var(--color-gray-400)] mt-0.5">
            Consulta organizada en modo lectura de información corporativa y comercial.
          </p>
        </div>
        <Link to="/supplierList">
          <Button variant="secondary" size="sm">
            Volver al Listado
          </Button>
        </Link>
      </div>

      <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-xl p-6 shadow-xl text-[var(--color-white)] space-y-6">
        {/* Cabecera del proveedor */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[var(--color-secondary-800)]">
          <div className="size-28 rounded-xl border-2 border-[var(--color-secondary-700)] bg-[var(--color-secondary-950)] overflow-hidden shadow-md shrink-0 relative flex items-center justify-center">
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
            <div className={`avatar-fallback ${supplierImage ? "hidden" : "flex"} w-full h-full flex-col items-center justify-center bg-[var(--color-secondary-800)] text-[var(--color-primary-400)]`}>
              <Building2 className="size-10" />
              <span className="text-[10px] font-bold mt-1 text-[var(--color-gray-300)] uppercase">
                {supplierName.slice(0, 3)}
              </span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <h2 className="text-lg font-bold text-[var(--color-white)]">{supplierName}</h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isActive
                    ? "bg-[var(--color-primary-500)]/15 text-[var(--color-primary-400)] border-[var(--color-primary-500)]/40"
                    : "bg-[var(--color-secondary-800)] text-[var(--color-secondary-200)] border-[var(--color-secondary-600)]"
                }`}
              >
                {isActive ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                {status}
              </span>
            </div>
            <p className="text-xs text-[var(--color-gray-400)] font-mono">NIT: {nit}</p>
          </div>
        </div>

        {/* Sección 1: Información General */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-400)] flex items-center gap-2 mb-3">
            <Building2 className="size-4" />
            1. Información General
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] text-xs">
            <div>
              <span className="text-[var(--color-gray-400)] block">Razón Social:</span>
              <span className="font-semibold text-[var(--color-white)] text-sm">{supplierName}</span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Número de Identificación Tributaria (NIT):</span>
              <span className="font-semibold text-[var(--color-white)] font-mono">{nit}</span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Línea de Suministro:</span>
              <span className="font-semibold text-[var(--color-gray-200)]">{supplierCategory}</span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Estado Operativo:</span>
              <span className={`font-semibold ${isActive ? "text-[var(--color-primary-400)]" : "text-[var(--color-gray-300)]"}`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Sección 2: Datos de Contacto y Ubicación */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-400)] flex items-center gap-2 mb-3">
            <Mail className="size-4" />
            2. Datos de Contacto y Ubicación
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] text-xs">
            <div>
              <span className="text-[var(--color-gray-400)] block">Correo Electrónico:</span>
              <span className="font-medium text-[var(--color-gray-200)] flex items-center gap-1.5 mt-0.5">
                <Mail className="size-3.5 text-[var(--color-primary-400)]" />
                {supplierEmail}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Teléfono de Pedidos:</span>
              <span className="font-medium text-[var(--color-gray-200)] flex items-center gap-1.5 mt-0.5 font-mono">
                <Phone className="size-3.5 text-[var(--color-primary-400)]" />
                {supplierPhone}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Dirección de Despacho:</span>
              <span className="font-medium text-[var(--color-gray-200)] flex items-center gap-1.5 mt-0.5">
                <MapPin className="size-3.5 text-[var(--color-primary-400)]" />
                {supplierDirection}
              </span>
            </div>
          </div>
        </div>

        {/* Sección 3: Datos Comerciales & Términos */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-400)] flex items-center gap-2 mb-3">
            <FileText className="size-4" />
            3. Datos Comerciales & Términos
          </h3>
          <div className="p-4 rounded-lg bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] text-xs space-y-3">
            <div>
              <span className="text-[var(--color-gray-400)] block">Términos de Negociación:</span>
              <span className="font-semibold text-[var(--color-white)]">Crédito a 30 días</span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Observaciones y Notas de Recepción:</span>
              <p className="text-[var(--color-gray-300)] mt-0.5 leading-relaxed">
                {observation}
              </p>
            </div>
          </div>
        </div>

        {/* Botón de retorno inferior */}
        <div className="pt-4 border-t border-[var(--color-secondary-800)] flex justify-end">
          <Link to="/supplierList">
            <Button variant="secondary" size="md">
              Volver al Listado
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
