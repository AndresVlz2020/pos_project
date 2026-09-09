/**
 * Componente modular de cuadrícula responsive para tarjetas en el POS
 */
export default function PosCardGrid({ children, emptyMessage = "No se encontraron registros." }) {
  const hasChildren = Array.isArray(children)
    ? children.length > 0
    : Boolean(children);

  if (!hasChildren) {
    return (
      <div className="py-12 text-center rounded-lg border border-[var(--color-primary-800)] bg-[var(--color-primary-900)]/40 p-6">
        <p className="text-xs text-[var(--color-gray-400)] font-[family-name:var(--main-font)]">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  );
}
