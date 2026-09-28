// src/shared/layouts/Footer.jsx

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-primary-800)] bg-[var(--color-primary-950)] py-2 px-4 sm:px-6 text-xs text-[var(--color-gray-400)]">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 text-[11px]">
        {/* Izquierda: Indicador de conexión */}
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-emerald-400">Sistema en Línea</span>
        </div>

        {/* Centro: Versión y estación */}
        <div className="hidden sm:block text-[var(--color-gray-400)]">
          D'Piero POS v2.4 • Estación #01
        </div>

        {/* Derecha: Atajo de ayuda */}
        <div className="flex items-center gap-1.5 text-[var(--color-gray-400)]">
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-primary-800)] border border-[var(--color-primary-700)] text-[10px] font-mono text-[var(--color-gray-300)]">
            F1
          </kbd>
          <span>Soporte</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
