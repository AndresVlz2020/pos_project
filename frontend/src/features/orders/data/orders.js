export const initialOrders = [
  {
    id: "ORD-001",
    tableNumber: "Mesa 1",
    waiter: "Carlos Pérez",
    status: "No Pagada",
    items: [
      { id: "1", name: "Punta de Anca Angus 400g", price: 56000, qty: 2 },
      { id: "3", name: "Limonada Natural", price: 8500, qty: 2 },
    ],
    total: 129000,
    observations: "Término medio en la carne",
    createdAt: "2026-09-28 18:30:00",
  },
  {
    id: "ORD-002",
    tableNumber: "Mesa 3",
    waiter: "María Rodríguez",
    status: "No Pagada",
    items: [
      { id: "2", name: "Costillas BBQ Campestres", price: 48000, qty: 1 },
      { id: "4", name: "Postre de la Casa", price: 14000, qty: 1 },
    ],
    total: 62000,
    observations: "Salsa BBQ aparte",
    createdAt: "2026-09-28 18:45:00",
  },
  {
    id: "ORD-003",
    tableNumber: "Mesa 7",
    waiter: "Juan Gómez",
    status: "Pagada",
    paymentMethod: "Efectivo",
    items: [
      { id: "1", name: "Punta de Anca Angus 400g", price: 56000, qty: 1 },
      { id: "3", name: "Limonada Natural", price: 8500, qty: 1 },
    ],
    total: 64500,
    observations: "Pago en efectivo",
    createdAt: "2026-09-28 17:15:00",
  },
  {
    id: "ORD-004",
    tableNumber: "Mesa 4",
    waiter: "Ana Martínez",
    status: "Pagada",
    paymentMethod: "Tarjeta crédito",
    items: [
      { id: "2", name: "Costillas BBQ Campestres", price: 48000, qty: 2 },
      { id: "3", name: "Limonada Natural", price: 8500, qty: 2 },
    ],
    total: 113000,
    observations: "Factura electrónica enviada",
    createdAt: "2026-09-28 16:50:00",
  },
  {
    id: "ORD-005",
    tableNumber: "Mesa 2",
    waiter: "Carlos Pérez",
    status: "Anulada",
    items: [
      { id: "1", name: "Punta de Anca Angus 400g", price: 56000, qty: 1 },
    ],
    total: 56000,
    observations: "Cliente se retiró antes del servicio",
    createdAt: "2026-09-28 15:10:00",
  },
];

// Helper para sincronizar y persistir órdenes en localStorage
const ORDERS_STORAGE_KEY = "dpiero_orders_data";

export function getStoredOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(initialOrders));
      return initialOrders;
    }
    return JSON.parse(raw);
  } catch {
    return initialOrders;
  }
}

export function saveStoredOrders(orders) {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error("Error guardando órdenes:", err);
  }
}
