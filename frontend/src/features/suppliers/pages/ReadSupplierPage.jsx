import image from "@/assets/images/supplier-lacteos.jpg";
import { Mail, Phone, MapPin, Building2, FileText, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared";

export default function ReadSupplierPage() {
  const supplier = {
    nit: "900.123.456-1",
    supplierName: "Distribuidora Lácteos del Campo S.A.S.",
    supplierEmail: "ventas@lacteosdelcampo.co",
    supplierPhone: "3001234567",
    supplierDirection: "Calle 45 # 12-34, Zona Industrial, Medellín",
    category: "Lácteos y Derivados",
    paymentTerms: "Crédito a 30 días",
    status: "Activo",
    observation: "Proveedor principal de quesos mozzarella y leche entera para cocina y barra de preparación.",
  };

  return (
    <div className="max-w-4xl mx-auto my-6 px-4">
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
          <img
            src={image}
            alt={supplier.supplierName}
            className="rounded-xl border-2 border-[var(--color-secondary-700)] size-28 object-cover shadow-md"
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <h2 className="text-lg font-bold text-[var(--color-white)]">{supplier.supplierName}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="size-3" />
                {supplier.status}
              </span>
            </div>
            <p className="text-xs text-[var(--color-gray-400)] font-mono">NIT: {supplier.nit}</p>
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
              <span className="font-semibold text-[var(--color-white)] text-sm">{supplier.supplierName}</span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Número de Identificación Tributaria (NIT):</span>
              <span className="font-semibold text-[var(--color-white)] font-mono">{supplier.nit}</span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Línea de Suministro:</span>
              <span className="font-semibold text-[var(--color-gray-200)]">{supplier.category}</span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Estado Operativo:</span>
              <span className="font-semibold text-emerald-400">{supplier.status}</span>
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
                {supplier.supplierEmail}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Teléfono de Pedidos:</span>
              <span className="font-medium text-[var(--color-gray-200)] flex items-center gap-1.5 mt-0.5 font-mono">
                <Phone className="size-3.5 text-[var(--color-primary-400)]" />
                {supplier.supplierPhone}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Dirección de Despacho:</span>
              <span className="font-medium text-[var(--color-gray-200)] flex items-center gap-1.5 mt-0.5">
                <MapPin className="size-3.5 text-[var(--color-primary-400)]" />
                {supplier.supplierDirection}
              </span>
            </div>
          </div>
        </div>

        {/* Sección 3: Datos Comerciales y Observaciones */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-400)] flex items-center gap-2 mb-3">
            <FileText className="size-4" />
            3. Datos Comerciales & Términos
          </h3>
          <div className="p-4 rounded-lg bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] text-xs space-y-3">
            <div>
              <span className="text-[var(--color-gray-400)] block">Términos de Negociación:</span>
              <span className="font-semibold text-[var(--color-white)]">{supplier.paymentTerms}</span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Observaciones y Notas de Recepción:</span>
              <p className="text-[var(--color-gray-300)] leading-relaxed mt-1">
                {supplier.observation}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}