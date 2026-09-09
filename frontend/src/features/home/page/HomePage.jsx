import { useState, useEffect } from "react";
import { Navbar } from "@/shared";
import { products } from "@/features/products/data/products";
import { useSearchParams, Link } from "react-router-dom";
import { 
  UtensilsCrossed, 
  Users, 
  Truck, 
  UserCheck, 
  Clock, 
  MapPin, 
  Phone,
  Store
} from "lucide-react";
import {
  PosTerminalHeader,
  PosProductsSection,
  PosStaffPanel,
  PosSuppliersPanel,
  PosCustomersPanel
} from "../components";

const TABS = [
  { id: "menu", label: "Catálogo & Venta POS", icon: UtensilsCrossed },
  { id: "staff", label: "Personal en Turno", icon: Users },
  { id: "suppliers", label: "Proveedores de Insumos", icon: Truck },
  { id: "customers", label: "Clientes / Facturación", icon: UserCheck },
];

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const tabParam = searchParams.get("tab") || "menu";

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    const next = new URLSearchParams(searchParams);
    if (val.trim()) {
      next.set("search", val);
      // Al buscar, cambiar automáticamente al tab del menú si no está en él
      if (activeTab !== "menu") {
        next.set("tab", "menu");
        setActiveTab("menu");
      }
    } else {
      next.delete("search");
    }
    setSearchParams(next, { replace: true });
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const next = new URLSearchParams(searchParams);
    next.set("tab", tabId);
    setSearchParams(next, { replace: true });
  };

  const handleClearSearch = () => {
    handleSearchChange("");
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary-950)] text-[var(--color-white)] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Barra de navegación superior */}
      <Navbar />

      {/* Cabecera operativa del POS con estado de caja y métricas de turno */}
      <PosTerminalHeader activeShift="Tarde / Noche" station="Caja Mostrador #01" />

      {/* Navegación por Módulos Operativos del POS */}
      <div className="border-b border-[var(--color-primary-800)] bg-[var(--color-primary-900)]/60 sticky top-16 z-40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-thin">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap
                    ${isActive
                      ? "bg-[var(--color-secondary-500)] text-[var(--color-white)] shadow-md border border-[var(--color-secondary-400)]"
                      : "bg-[var(--color-primary-800)] text-[var(--color-gray-300)] hover:text-[var(--color-white)] hover:bg-[var(--color-primary-700)] border border-[var(--color-primary-700)]"
                    }
                  `}
                >
                  <Icon className="size-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenido Dinámico del Módulo Seleccionado */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-8">
        {activeTab === "menu" && (
          <PosProductsSection
            products={products}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
          />
        )}

        {activeTab === "staff" && <PosStaffPanel />}

        {activeTab === "suppliers" && <PosSuppliersPanel />}

        {activeTab === "customers" && <PosCustomersPanel />}
      </main>

      {/* Pie Operativo del POS */}
      <footer className="mt-auto border-t border-[var(--color-primary-800)] bg-[var(--color-primary-950)] py-8 text-xs text-[var(--color-gray-400)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-[var(--color-white)] font-bold text-sm mb-2 flex items-center gap-2">
              <Store className="size-4 text-[var(--color-secondary-400)]" />
              D'Piero Restaurante & Parrilla
            </h4>
            <p className="text-[var(--color-gray-400)] leading-relaxed text-[11px]">
              Sistema de Terminal de Punto de Venta (POS) para control de comandas, mesas, inventario de insumos y facturación operativa.
            </p>
          </div>

          <div>
            <h4 className="text-[var(--color-white)] font-bold text-sm mb-2">Turno & Caja</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-2">
                <Clock className="size-3.5 text-[var(--color-secondary-400)] shrink-0" />
                <span>Horario Turno: 12:00 PM a 11:00 PM</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-3.5 text-[var(--color-secondary-400)] shrink-0" />
                <span>Salón Principal & Terraza Bar</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-3.5 text-[var(--color-secondary-400)] shrink-0" />
                <span>Soporte Técnico POS: Ext. 101</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[var(--color-white)] font-bold text-sm mb-2">Accesos Directos</h4>
            <ul className="space-y-1 text-[11px]">
              <li>
                <Link to="/CreateOrder" className="hover:text-[var(--color-secondary-300)] transition-colors">
                  • Tomar Orden / Comanda
                </Link>
              </li>
              <li>
                <Link to="/productList" className="hover:text-[var(--color-secondary-300)] transition-colors">
                  • Administrar Productos
                </Link>
              </li>
              <li>
                <Link to="/inventoryList" className="hover:text-[var(--color-secondary-300)] transition-colors">
                  • Stock e Inventario
                </Link>
              </li>
              <li>
                <Link to="/supplierList" className="hover:text-[var(--color-secondary-300)] transition-colors">
                  • Proveedores Registrados
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-6 pt-4 border-t border-[var(--color-primary-900)] text-center text-[11px] text-[var(--color-gray-500)]">
          D'Piero POS v2.4 • Estación Mostrador #01 • Licencia Operativa Activa
        </div>
      </footer>
    </div>
  );
}
