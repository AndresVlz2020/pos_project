import imgCarnes from "@/assets/images/supplier-carnes.jpg";
import imgLacteos from "@/assets/images/supplier-lacteos.jpg";
import imgFruver from "@/assets/images/supplier-fruver.jpg";
import imgBebidas from "@/assets/images/supplier-bebidas.jpg";
import imgMariscos from "@/assets/images/supplier-mariscos.jpg";
import imgEmpaques from "@/assets/images/supplier-empaques.jpg";
export const posStaff = [
  {
    id: "st-01",
    name: "Carlos Pérez",
    role: "Cajero",
    shift: "12:00 PM - 8:00 PM",
    station: "Caja Principal #01",
    status: "En Caja",
    phone: "315 234 5678",
    email: "carlos.perez@dpiero.com",
    avatarInitials: "CP",
    color: "bg-blue-600"
  },
  {
    id: "st-02",
    name: "María Rodríguez",
    role: "Mesera",
    shift: "1:00 PM - 9:00 PM",
    station: "Salón Principal & Mesas",
    status: "En Servicio",
    phone: "310 456 7890",
    email: "maria.rodriguez@dpiero.com",
    avatarInitials: "MR",
    color: "bg-emerald-600"
  },
  {
    id: "st-03",
    name: "Juan Gómez",
    role: "Cocinero",
    shift: "11:00 AM - 7:00 PM",
    station: "Cocina Caliente & Parrilla",
    status: "En Servicio",
    phone: "300 123 4567",
    email: "juan.gomez@dpiero.com",
    avatarInitials: "JG",
    color: "bg-amber-600"
  },
  {
    id: "st-04",
    name: "Ana Martínez",
    role: "Cajera / Supervisora",
    shift: "3:00 PM - 11:00 PM",
    station: "Caja Mostrador #02",
    status: "En Pausa",
    phone: "320 987 6543",
    email: "ana.martinez@dpiero.com",
    avatarInitials: "AM",
    color: "bg-purple-600"
  },
  {
    id: "st-05",
    name: "Santiago Castro",
    role: "Mesero",
    shift: "2:00 PM - 10:00 PM",
    station: "Terraza & Bar Exterior",
    status: "En Servicio",
    phone: "300 123 4567",
    email: "santiago.castro@dpiero.com",
    avatarInitials: "SC",
    color: "bg-indigo-600"
  },
  {
    id: "st-06",
    name: "Sofia Jaramillo",
    role: "Barista / Bartender",
    shift: "4:00 PM - 11:30 PM",
    station: "Barra de Bebidas & Coctelería",
    status: "En Servicio",
    phone: "312 765 4321",
    email: "sofia.jaramillo@dpiero.com",
    avatarInitials: "SJ",
    color: "bg-rose-600"
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
