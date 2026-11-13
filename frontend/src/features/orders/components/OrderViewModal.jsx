import { Modal, Button } from "@/shared";
import { Receipt, Calendar, User, Utensils, Printer } from "lucide-react";
import { getProductImage } from "@/utils/imageHelper";

export default function OrderViewModal({ order, isOpen, onClose }) {
  if (!order) return null;

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("no pagada")) {
      return "bg-[var(--color-primary-500)]/15 text-[var(--color-primary-400)] border-[var(--color-primary-500)]/40";
    }
    if (s.includes("pagada")) {
      return "bg-[var(--color-white)]/10 text-[var(--color-white)] border-[var(--color-white)]/30";
    }
    return "bg-[var(--color-secondary-800)] text-[var(--color-secondary-200)] border-[var(--color-secondary-600)]";
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open("", "_blank", "width=420,height=650");
    if (!printWindow) {
      window.print();
      return;
    }

    const itemsHtml = (order.items || []).map((item) => `
      <tr>
        <td style="padding: 5px 0; font-weight: bold; width: 15%;">${item.qty || 1}x</td>
        <td style="padding: 5px 0; width: 45%;">${item.name}</td>
        <td style="padding: 5px 0; text-align: right; width: 20%;">$${Number(item.price || 0).toLocaleString("es-CO")}</td>
        <td style="padding: 5px 0; text-align: right; font-weight: bold; width: 20%;">$${((item.qty || 1) * Number(item.price || 0)).toLocaleString("es-CO")}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Factura de Venta - ${order.idCode || order.id || "Comanda"}</title>
          <style>
            @page { margin: 5mm; size: 80mm auto; }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              line-height: 1.35;
              color: #111;
              padding: 12px;
              max-width: 320px;
              margin: 0 auto;
              background: #fff;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .divider { border-top: 1px dashed #444; margin: 8px 0; }
            .double-divider { border-top: 2px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 6px 0; }
            .header h2 { margin: 0; font-size: 17px; text-transform: uppercase; letter-spacing: 1px; }
            .header p { margin: 2px 0; font-size: 11px; }
            .footer { margin-top: 14px; font-size: 10px; text-align: center; }
            .row { display: flex; justify-content: space-between; margin: 3px 0; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header text-center">
            <h2>RESTAURANTE D'PIERO</h2>
            <p>NIT: 900.123.456-1</p>
            <p>Régimen Común - Sistema POS</p>
            <p>Calle 45 # 12-34 - Medellín, Colombia</p>
            <div class="divider"></div>
            <p class="font-bold" style="font-size: 13px;">FACTURA / COMANDA DE SERVICIO</p>
            <p class="font-bold" style="font-size: 14px; margin-top: 2px;">N° ${order.idCode || order.id || "ORD-000"}</p>
          </div>

          <div class="divider"></div>

          <div>
            <div class="row"><span><strong>Ubicación:</strong></span><span class="font-bold">${order.tableNumber || "Mesa General"}</span></div>
            <div class="row"><span><strong>Mesero:</strong></span><span>${order.waiter || "Mesero General"}</span></div>
            <div class="row"><span><strong>Fecha / Hora:</strong></span><span>${order.createdAt || new Date().toLocaleString("es-CO")}</span></div>
            <div class="row"><span><strong>Estado:</strong></span><span>${order.status || "No Pagada"}</span></div>
            <div class="row"><span><strong>Método de pago:</strong></span><span>${order.paymentMethod || order.payment_method || "Sin especificar"}</span></div>
          </div>

          <div class="divider"></div>

          <table>
            <thead>
              <tr style="border-bottom: 1px solid #222;">
                <th style="text-align: left; padding-bottom: 4px;">Cant</th>
                <th style="text-align: left; padding-bottom: 4px;">Platillo</th>
                <th style="text-align: right; padding-bottom: 4px;">Unit</th>
                <th style="text-align: right; padding-bottom: 4px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="double-divider"></div>

          <div>
            <div class="row"><span>Subtotal Neto:</span><span>$${Number(order.total || 0).toLocaleString("es-CO")}</span></div>
            <div class="row"><span>Impoconsumo / IVA (Inc.):</span><span>$0</span></div>
            <div class="row" style="font-size: 14px; font-weight: bold; margin-top: 6px;">
              <span>TOTAL A PAGAR:</span>
              <span>$${Number(order.total || 0).toLocaleString("es-CO")} COP</span>
            </div>
          </div>

          ${order.observations ? `
            <div class="divider"></div>
            <div style="font-size: 10.5px;">
              <strong>Observaciones de Cocina:</strong>
              <p style="margin: 3px 0; font-style: italic;">"${order.observations}"</p>
            </div>
          ` : ''}

          <div class="divider"></div>

          <div class="footer">
            <p class="font-bold">¡GRACIAS POR SU VISITA!</p>
            <p>Comanda registrada en el sistema del restaurante.</p>
            <p>D'Piero Gourmet & Parrilla</p>
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg" title={`Comanda ${order.idCode || order.id}`}>
      <div className="space-y-4 text-[var(--color-white)] text-sm font-[family-name:var(--main-font)]">
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

          <div>
            <span className="text-xs text-[var(--color-gray-400)] block">Método de pago</span>
            <span className="font-medium text-[var(--color-white)] flex items-center gap-1">
              {order.paymentMethod || order.payment_method || "Sin especificar"}
            </span>
          </div>
        </div>

        {/* Detalle de Platillos */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gray-400)] mb-2 flex items-center gap-1.5">
            <Utensils size={14} className="text-[var(--color-primary-400)]" />
            Resumen de Platillos Ordenados ({(order.items || []).length})
          </h4>
          <div className="border border-[var(--color-secondary-800)] rounded-lg max-h-[36dvh] overflow-y-auto overflow-x-hidden bg-[var(--color-secondary-950)]">
            <table className="w-full text-left text-[11px] sm:text-xs">
              <thead className="sticky top-0 z-10 bg-[var(--color-secondary-900)] text-[var(--color-gray-400)] border-b border-[var(--color-secondary-800)]">
                <tr>
                  <th className="py-2 px-2 sm:px-3 font-semibold w-9 sm:w-auto">Cant.</th>
                  <th className="py-2 px-1.5 sm:px-3 font-semibold">Platillo</th>
                  <th className="py-2 px-1.5 sm:px-3 font-semibold text-right whitespace-nowrap">
                    <span className="sm:hidden">Unit.</span>
                    <span className="hidden sm:inline">Precio Unit.</span>
                  </th>
                  <th className="py-2 px-2 sm:px-3 font-semibold text-right whitespace-nowrap">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-secondary-800)]">
                {(order.items || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-[var(--color-secondary-900)]/50">
                    <td className="py-2 px-2 sm:px-3 font-bold text-[var(--color-primary-400)] whitespace-nowrap">
                      {item.qty}x
                    </td>
                    <td className="py-2 px-1.5 sm:px-3 font-medium text-[var(--color-white)] min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <img
                          src={getProductImage({ name: item.name })}
                          alt={item.name}
                          className="size-6 sm:size-7 rounded object-cover border border-[var(--color-secondary-700)] shrink-0"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="min-w-0 break-words leading-snug">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-1.5 sm:px-3 text-right text-[var(--color-gray-300)] whitespace-nowrap">
                      ${Number(item.price || 0).toLocaleString("es-CO")}
                    </td>
                    <td className="py-2 px-2 sm:px-3 text-right font-semibold text-[var(--color-white)] whitespace-nowrap">
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
            <span className="font-semibold text-[var(--color-warning)] block mb-1">
              Notas para Cocina / Observaciones:
            </span>
            <p className="text-[var(--color-gray-300)] italic">"{order.observations}"</p>
          </div>
        )}

        {/* Total General */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--color-secondary-800)]">
          <span className="text-sm font-semibold text-[var(--color-gray-300)]">
            Total Liquidado:
          </span>
          <span className="text-lg sm:text-xl font-bold text-[var(--color-white)] whitespace-nowrap">
            ${Number(order.total || 0).toLocaleString("es-CO")} COP
          </span>
        </div>

        {/* Acciones del Modal: Imprimir Factura solo si está Pagada */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-secondary-800)]">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
          {String(order.status || "").toLowerCase() === "pagada" && (
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrintInvoice}
              className="flex items-center gap-1.5 shadow-md font-semibold"
            >
              <Printer size={15} />
              Imprimir Factura
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
