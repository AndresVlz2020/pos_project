import { Modal, Button } from "@/shared";
import { Receipt, Calendar, User, Hash, Utensils } from "lucide-react";

export default function OrderViewModal({ order, isOpen, onClose }) {
  if (!order) return null;

  const getStatusBadge = () =>
    "bg-[var(--color-secondary-800)] text-[var(--color-white)] border-[var(--color-secondary-700)]";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Comanda ${order.id}`}>
      <div className="space-y-5 text-[var(--color-white)] text-sm">
        {/* Cabecera de comanda */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] rounded-lg">
          <div>
            <span className="text-xs text-[var(--color-gray-400)] block">Ubicación</span>
            <span className="text-base font-bold text-[var(--color-primary-400)]">
              {order.tableNumber}
            </span>
          </div>

          <div>
            <span className="text-xs text-[var(--color-gray-400)] block">Estado</span>
            <span
              className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded border ${getStatusBadge(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>

          <div>
            <span className="text-xs text-[var(--color-gray-400)] block">Mesero</span>
            <span className="font-medium text-[var(--color-gray-200)] flex items-center gap-1">
              <User size={14} className="text-[var(--color-primary-400)]" />
              {order.waiter}
            </span>
          </div>

          <div>
            <span className="text-xs text-[var(--color-gray-400)] block">Fecha / Hora</span>
            <span className="text-xs text-[var(--color-gray-300)] flex items-center gap-1">
              <Calendar size={13} />
              {order.createdAt || "Hoy"}
            </span>
          </div>
        </div>

        {/* Detalle de Platillos */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gray-400)] mb-2 flex items-center gap-1.5">
            <Utensils size={14} className="text-[var(--color-primary-400)]" />
            Resumen de Platillos Ordenados
          </h4>
          <div className="border border-[var(--color-secondary-800)] rounded-lg overflow-hidden bg-[var(--color-secondary-950)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-secondary-900)] text-[var(--color-gray-400)] border-b border-[var(--color-secondary-800)]">
                <tr>
                  <th className="py-2 px-3 font-semibold">Cant.</th>
                  <th className="py-2 px-3 font-semibold">Platillo</th>
                  <th className="py-2 px-3 font-semibold text-right">Precio Unit.</th>
                  <th className="py-2 px-3 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-secondary-800)]">
                {(order.items || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-[var(--color-secondary-900)]/50">
                    <td className="py-2.5 px-3 font-bold text-[var(--color-primary-400)]">
                      {item.qty}x
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[var(--color-white)]">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[var(--color-gray-300)]">
                      ${Number(item.price || 0).toLocaleString("es-CO")}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-[var(--color-white)]">
                      ${(Number(item.price || 0) * (item.qty || 1)).toLocaleString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Observaciones de cocina */}
        {order.observations && (
          <div className="p-3 bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] rounded-lg text-xs">
            <span className="font-semibold text-amber-400 block mb-1">
              Notas para Cocina / Observaciones:
            </span>
            <p className="text-[var(--color-gray-300)] italic">"{order.observations}"</p>
          </div>
        )}

        {/* Total General */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-secondary-800)]">
          <span className="text-sm font-semibold text-[var(--color-gray-300)]">
            Total Liquidado:
          </span>
          <span className="text-xl font-bold text-[var(--color-primary-400)]">
            ${Number(order.total || 0).toLocaleString("es-CO")}
          </span>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar Comanda
          </Button>
        </div>
      </div>
    </Modal>
  );
}
