export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] py-2.5 px-4 sm:px-6 text-xs text-[var(--md-sys-color-on-surface-variant)]">
      <div className="w-full flex items-center justify-between gap-4 text-xs leading-4">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[var(--color-success)] animate-pulse" />
          <span className="font-medium text-[var(--color-success)]">Sistema en Línea</span>
        </div>

        <div className="hidden sm:block text-[var(--md-sys-color-on-surface-variant)]">
          D&apos;Piero POS v2.4 • Estación #01
        </div>

        <div className="flex items-center gap-1.5 text-[var(--md-sys-color-on-surface-variant)]">
          <kbd className="px-1.5 py-0.5 rounded-sm bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-label-sm font-mono text-[var(--md-sys-color-on-surface)]">
            F1
          </kbd>
          <span>Soporte</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
