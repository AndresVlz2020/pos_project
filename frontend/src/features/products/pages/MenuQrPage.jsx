import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { BrandLogo, Button, M3Icon } from "@/shared";

export default function MenuQrPage() {
  const menuUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/menu`
      : "https://grupo6.ricoprogramar.com/menu";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full py-4 sm:py-6 font-[family-name:var(--main-font)] text-[var(--md-sys-color-on-surface)]">
      {/* Tarjeta imprimible del QR del Menú */}
      <div className="w-full max-w-md rounded-[28px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-6 sm:p-8 m3-elevation-2 flex flex-col items-center text-center gap-5 print:border-2 print:shadow-none print:mx-auto">
        <BrandLogo className="h-11 w-auto object-contain" alt="D'Piero Restaurante" />

        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-label-md font-medium">
            <M3Icon name="restaurant" size={24} />
            Carta Digital
          </span>
          <h1 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)] pt-1">
            Escanea nuestro Menú
          </h1>
          <p className="text-body-md text-[var(--md-sys-color-on-surface-variant)]">
            Consulta nuestros platillos, precios y solicita atención directamente desde tu mesa.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[var(--md-sys-color-outline-variant)] m3-elevation-1">
          <QRCodeSVG
            value={menuUrl}
            size={232}
            level="H"
            bgColor="#FFFFFF"
            fgColor="#2B1A12"
            includeMargin={false}
          />
        </div>

        <div className="w-full rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] px-4 py-3">
          <p className="text-label-sm uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
            Enlace directo del menú
          </p>
          <p className="text-sm font-mono font-medium text-[var(--md-sys-color-primary)] break-all mt-0.5">
            {menuUrl}
          </p>
        </div>
      </div>

      {/* Controles separados de la tarjeta imprimible */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 print:hidden">
        <Link to="/products">
          <Button variant="outlined" leadingIcon="arrow_back">
            Volver a Productos
          </Button>
        </Link>

        <a href="/menu" target="_blank" rel="noopener noreferrer">
          <Button variant="tonal" leadingIcon="visibility">
            Abrir Menú
          </Button>
        </a>

        <Button
          type="button"
          variant="filled"
          leadingIcon="print"
          onClick={handlePrint}
        >
          Imprimir QR
        </Button>
      </div>
    </div>
  );
}
