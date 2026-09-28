import imgCarnes from "@/assets/images/supplier-carnes.jpg";
import imgLacteos from "@/assets/images/supplier-lacteos.jpg";
import imgFruver from "@/assets/images/supplier-fruver.jpg";
import imgBebidas from "@/assets/images/supplier-bebidas.jpg";
import imgMariscos from "@/assets/images/supplier-mariscos.jpg";
import imgEmpaques from "@/assets/images/supplier-empaques.jpg";

import imgWorkerCarlos from "@/assets/images/worker-carlos.jpg";
import imgWorkerMaria from "@/assets/images/worker-maria.jpg";
import imgWorkerJuan from "@/assets/images/worker-juan.jpg";
import imgWorkerAna from "@/assets/images/worker-ana.jpg";

export const posStaff = [
  {
    id: "st-01",
    name: "Carlos Pérez",
    role: "Cajero",
    shift: "Turno Tarde / Noche",
    station: "Caja Principal",
    status: "Activo en turno",
    phone: "315 234 5678",
    image: imgWorkerCarlos
  },
  {
    id: "st-02",
    name: "María Rodríguez",
    role: "Mesero",
    shift: "Turno Tarde / Noche",
    station: "Salón",
    status: "Atendiendo salón",
    phone: "310 456 7890",
    image: imgWorkerMaria
  },
  {
    id: "st-03",
    name: "Juan Gómez",
    role: "Cocinero",
    shift: "Turno Completo",
    station: "Cocina",
    status: "En comanda",
    phone: "300 123 4567",
    image: imgWorkerJuan
  },
  {
    id: "st-04",
    name: "Ana Martínez",
    role: "Cajero",
    shift: "Turno Tarde / Cierre",
    station: "Caja Principal",
    status: "Supervisando",
    phone: "320 987 6543",
    image: imgWorkerAna
  }
];

export const posSuppliers = [
  {
    id: "sup-01",
    nit: "890.987.654-3",
    name: "Avícola y Carnes del Valle S.A.",
    rubro: "Cárnicos Angus & Cerdo",
    phone: "315 987 6543",
    email: "pedidos@carnesdelvalle.com",
    leadTime: "24 horas",
    status: "Activo",
    image: imgCarnes
  },
  {
    id: "sup-02",
    nit: "900.123.456-1",
    name: "Distribuidora Lácteos del Campo",
    rubro: "Quesos, Cremas y Mantequilla",
    phone: "300 123 4567",
    email: "ventas@lacteosdelcampo.co",
    leadTime: "Entrega Martes y Jueves",
    status: "Activo",
    image: imgLacteos
  },
  {
    id: "sup-03",
    nit: "800.555.444-2",
    name: "Comercializadora Fruver Central",
    rubro: "Frutas para Bar y Verduras",
    phone: "320 555 4442",
    email: "despachos@fruvercentral.com",
    leadTime: "Diario 7:00 AM",
    status: "Activo",
    image: imgFruver
  },
  {
    id: "sup-04",
    nit: "900.777.888-5",
    name: "Distribuciones Café & Bebidas",
    rubro: "Refrescos, Cervezas e Insumos Bar",
    phone: "312 777 8885",
    email: "comercial@cafebebidas.co",
    leadTime: "48 horas",
    status: "Activo",
    image: imgBebidas
  },
  {
    id: "sup-05",
    nit: "901.222.333-8",
    name: "Pescadería y Mariscos del Pacífico",
    rubro: "Pescados frescos y Mariscos",
    phone: "301 222 3338",
    email: "ventas@mariscospacifico.com",
    leadTime: "Miércoles y Sábados",
    status: "Activo",
    image: imgMariscos
  },
  {
    id: "sup-06",
    nit: "901.456.789-0",
    name: "Empaques Bio & Eco Gastronomía",
    rubro: "Cajas térmicas, vasos y bolsas",
    phone: "310 456 7890",
    email: "contacto@empaquesbio.com.co",
    leadTime: "Semanal",
    status: "Activo",
    image: imgEmpaques
  }
];

export const posCustomers = [
  {
    id: "cli-00",
    docType: "NIT",
    docNumber: "222222222222",
    name: "Consumidor Final (Venta Rápida)",
    phone: "N/A",
    email: "caja@dpiero.com",
    points: 0,
    totalVisits: 840,
    category: "General"
  },
  {
    id: "cli-01",
    docType: "CC",
    docNumber: "1002345678",
    name: "Mariana Gómez Ortiz",
    phone: "310 456 7890",
    email: "mariana.gomez@mail.com",
    points: 450,
    totalVisits: 14,
    category: "Cliente Frecuente (10% Desc.)"
  },
  {
    id: "cli-02",
    docType: "CC",
    docNumber: "1005678901",
    name: "Santiago Castro",
    phone: "300 123 4567",
    email: "santi.castro@hotmail.com",
    points: 180,
    totalVisits: 6,
    category: "Habitual"
  },
  {
    id: "cli-03",
    docType: "NIT",
    docNumber: "900543210-9",
    name: "Inversiones del Valle S.A.S.",
    phone: "318 765 4321",
    email: "facturas@inversionesvalle.com",
    points: 1200,
    totalVisits: 28,
    category: "Corporativo"
  }
];
