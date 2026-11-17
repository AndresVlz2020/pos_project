import { Modal, Button, M3Icon } from "@/shared";
import { getProductImage } from "@/utils/imageHelper";
import {
  getOrderStatusBadgeMeta,
  normalizeOrderStatus,
} from "../utils/orderFormHelpers";

export default function OrderViewModal({ order, isOpen, onClose }) {
  if (!order) return null;

  const canonicalStatus = normalizeOrderStatus(order.status);
  const statusMeta = getOrderStatusBadgeMeta(canonicalStatus);

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
          <title>Factura de Venta - ${order.idCode || order.id || "Orden"}</title>
          <style>
            @page { margin: 5mm; size: 80mm auto; }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              color: #000;
              background: #fff;
              width: 72mm;
              margin: 0 auto;
              padding: 10px 4px;
              line-height: 1.4;
            }
            .text-center { text-align: center; }
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
            <p class="font-bold" style="font-size: 13px;">FACTURA / ORDEN DE SERVICIO</p>
            <p class="font-bold" style="font-size: 14px; margin-top: 2px;">N° ${order.idCode || order.id || "ORD-000"}</p>
          </div>

          <div class="divider"></div>

          <div>
            <div class="row"><span><strong>Ubicación:</strong></span><span class="font-bold">${order.tableNumber || "Mesa General"}</span></div>
            <div class="row"><span><strong>Atendido por:</strong></span><span>${order.waiter || "Sin asignar"}</span></div>
            <div class="row"><span><strong>Fecha / Hora:</strong></span><span>${order.createdAt || new Date().toLocaleString("es-CO")}</span></div>
            <div class="row"><span><strong>Estado:</strong></span><span>${canonicalStatus}</span></div>
            <div class="row"><span><strong>Método de pago:</strong></span><span>${order.paymentMethod || order.payment_method || "Sin especificar"}</span></div>
          </div>

          <div class="divider"></div>

          <table>
            <thead>
              <tr style="border-bottom: 1px solid #222;">
                <th style="text-align: left; padding-bottom: 4px;">Cant</th>
                <th style="text-align: left; padding-bottom: 4px;">Producto</th>
                <th style="text-align: right; padding-bottom: 4px;">Unit.</th>
                <th style="text-align: right; padding-bottom: 4px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="double-divider"></div>

          <div class="row" style="font-size: 15px; font-weight: bold;">
            <span>TOTAL A PAGAR:</span>
            <span>$${Number(order.total || 0).toLocaleString("es-CO")} COP</span>
          </div>

          <div class="divider"></div>

          ${order.observations ? `
            <div style="font-size: 10.5px;">
              <strong>Observaciones de Cocina:</strong>
              <p style="margin: 3px 0; font-style: italic;">"${order.observations}"</p>
            </div>
          ` : ''}

          <div class="divider"></div>

          <div class="footer">
            <p class="font-bold">¡GRACIAS POR SU VISITA!</p>
            <p>Orden registrada en el sistema del restaurante.</p>
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
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg" title={`Orden ${order.idCode || order.id}`}>
      <div className="space-y-4 text-[var(--md-sys-color-on-surface)] text-sm font-[family-name:var(--main-font)]">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-xl">
          <div>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block">Ubicación</span>
            <span className="text-base font-medium text-[var(--md-sys-color-primary)]">
              {order.tableNumber}
            </span>
          </div>

          <div>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block">Estado</span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full mt-0.5 ${statusMeta.className}`}
            >
              {canonicalStatus}
            </span>
          </div>

          <div>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block">Atendido por</span>
            <span className="font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-1">
              <M3Icon name="badge" size={16} className="text-[var(--md-sys-color-primary)]" />
              {order.waiter}
            </span>
          </div>

          <div>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block">Fecha / Hora</span>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1">
              <M3Icon name="calendar_today" size={14} />
              {order.createdAt || "Hoy"}
            </span>
          </div>

          <div>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block">Método de pago</span>
            <span className="font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-1">
              {order.paymentMethod || order.payment_method || "Sin especificar"}
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] mb-2 flex items-center gap-1.5">
            <M3Icon name="restaurant" size={16} className="text-[var(--md-sys-color-primary)]" />
            Resumen de Platillos Ordenados ({(order.items || []).length})
          </h4>
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-xl max-h-[36dvh] overflow-y-auto overflow-x-hidden bg-[var(--md-sys-color-surface)]">
            <table className="w-full text-left text-xs leading-4">
              <thead className="sticky top-0 z-10 bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border-b border-[var(--md-sys-color-outline-variant)]">
                <tr>
                  <th className="py-2.5 px-2.5 sm:px-3 font-medium w-9 sm:w-auto">Cant.</th>
                  <th className="py-2.5 px-2 sm:px-3 font-medium">Platillo</th>
                  <th className="py-2.5 px-2 sm:px-3 font-medium text-right whitespace-nowrap">
                    <span className="sm:hidden">Unit.</span>
                    <span className="hidden sm:inline">Precio Unit.</span>
                  </th>
                  <th className="py-2.5 px-2.5 sm:px-3 font-medium text-right whitespace-nowrap">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]/60">
                {(order.items || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-[var(--md-sys-color-surface-container-low)]">
                    <td className="py-2 px-2.5 sm:px-3 font-medium text-[var(--md-sys-color-primary)] whitespace-nowrap">
                      {item.qty}x
                    </td>
                    <td className="py-2 px-2 sm:px-3 font-medium text-[var(--md-sys-color-on-surface)] min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={getProductImage(item)}
                          alt={item.name}
                          className="size-7 rounded-lg object-cover border border-[var(--md-sys-color-outline-variant)] shrink-0"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        <span className="min-w-0 break-words leading-4">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 sm:px-3 text-right text-[var(--md-sys-color-on-surface-variant)] whitespace-nowrap">
                      ${Number(item.price || 0).toLocaleString("es-CO")}
                    </td>
                    <td className="py-2 px-2.5 sm:px-3 text-right font-medium text-[var(--md-sys-color-on-surface)] whitespace-nowrap">
                      ${(Number(item.price || 0) * (item.qty || 1)).toLocaleString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {order.observations && (
          <div className="p-3.5 bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-xl text-xs">
            <span className="font-medium text-[var(--color-warning)] block mb-1">
              Notas para Cocina / Observaciones:
            </span>
            <p className="text-[var(--md-sys-color-on-surface-variant)] italic">"{order.observations}"</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
          <span className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]">
            Total Liquidado:
          </span>
          <span className="text-title-lg font-medium text-[var(--md-sys-color-on-surface)] whitespace-nowrap">
            ${Number(order.total || 0).toLocaleString("es-CO")} COP
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
          <Button variant="text" size="md" onClick={onClose}>
            Cerrar
          </Button>
          {canonicalStatus === "Pagada" && (
            <Button
              variant="filled"
              size="md"
              leadingIcon="print"
              onClick={handlePrintInvoice}
            >
              Imprimir
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
