export default function PosCardGrid({
  children,
  emptyMessage = "No se encontraron registros.",
}) {
  const hasChildren = Array.isArray(children)
    ? children.length > 0
    : Boolean(children);

  if (!hasChildren) {
    return (
      <div className="py-12 text-center rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] p-6">
        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {children}
    </div>
  );
}
