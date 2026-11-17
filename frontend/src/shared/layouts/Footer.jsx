// src/shared/layouts/Footer.jsx

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-secondary-800)] bg-[var(--color-secondary-950)] py-2.5 px-4 sm:px-6 text-xs text-[var(--color-gray-400)]">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 text-xs leading-4">
        {/* Izquierda: Indicador de conexión */}
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[var(--color-success)] animate-pulse" />
          <span className="font-medium text-[var(--color-success)]">Sistema en Línea</span>
        </div>

        {/* Centro: Versión y estación */}
        <div className="hidden sm:block text-[var(--color-gray-400)]">
          D'Piero POS v2.4 • Estación #01
        </div>

        {/* Derecha: Atajo de ayuda */}
        <div className="flex items-center gap-1.5 text-[var(--color-gray-400)]">
          <kbd className="px-1.5 py-0.5 rounded-sm bg-[var(--color-secondary-800)] border border-[var(--color-secondary-700)] text-label-sm font-mono text-[var(--color-gray-300)]">
            F1
          </kbd>
          <span>Soporte</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
