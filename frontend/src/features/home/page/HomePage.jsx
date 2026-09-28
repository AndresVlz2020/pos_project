import { useState, useEffect } from "react";
import { Navbar } from "@/shared";
import { products } from "@/features/products/data/products";
import { useSearchParams } from "react-router-dom";
import { 
  UtensilsCrossed, 
  Users, 
  Truck, 
  UserCheck
} from "lucide-react";
import {
  PosTerminalHeader,
  PosProductsSection,
  PosStaffPanel,
  PosSuppliersPanel,
  PosCustomersPanel
} from "../components";

const PRIMARY_TABS = [
  { id: "menu", label: "Catálogo & Comandas", icon: UtensilsCrossed },
  { id: "staff", label: "Personal en Turno", icon: Users },
  { id: "suppliers", label: "Proveedores", icon: Truck },
  { id: "customers", label: "Clientes & Facturación", icon: UserCheck },
];

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const tabParam = searchParams.get("tab") || "menu";

  // Obtener usuario autenticado actual y sus permisos
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
      return null;
    }
  })();

  const role = currentUser?.role || "Cajero";
  const isAdmin = role === "Admin" || role === "Administrador";
  const isCajero = role === "Cajero";

  // Definir pestañas permitidas según rol:
  // - Admin (admin@dpiero.com): Todas las pestañas
  // - Cajero: Catálogo & Comandas, Clientes & Facturación (no personal ni proveedores)
  // - Mesero / Cocinero: Catálogo & Comandas exclusivamente
  const availableTabs = PRIMARY_TABS.filter((tab) => {
    if (tab.id === "menu") return true;
    if (tab.id === "customers") return isAdmin || isCajero;
    if (tab.id === "staff") return isAdmin;
    if (tab.id === "suppliers") return isAdmin;
    return false;
  });

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [activeTab, setActiveTab] = useState(tabParam);

  // Asegurar que si la URL apunta a una pestaña no permitida para el rol, vuelva a 'menu'
  useEffect(() => {
    const isAllowed = availableTabs.some((t) => t.id === activeTab);
    if (!isAllowed) {
      setActiveTab("menu");
      const next = new URLSearchParams(searchParams);
      next.set("tab", "menu");
      setSearchParams(next, { replace: true });
    }
  }, [activeTab, availableTabs]);

  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    const next = new URLSearchParams(searchParams);
    if (val.trim()) {
      next.set("search", val);
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
    <div className="min-h-screen bg-[var(--color-primary-950)] text-[var(--color-white)] flex flex-col font-[family-name:var(--main-font)]">
      {/* Barra de navegación superior */}
      <Navbar />

      {/* Cabecera operativa del POS con datos dinámicos del usuario activo */}
      <PosTerminalHeader 
        activeShift="Tarde / Noche" 
        station={currentUser?.station || "Estación #01"} 
        operator={currentUser?.name || "Operador en Turno"} 
        role={currentUser?.role || "Personal"}
      />

      {/* Tab Bar Tradicional con las pestañas autorizadas para el rol del usuario */}
      <div className="border-b border-[var(--color-primary-800)] bg-[var(--color-primary-950)] sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-6 overflow-x-auto scrollbar-none" aria-label="Pestañas autorizadas del POS">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    inline-flex items-center gap-2 py-3 px-1 border-b-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap
                    ${isActive
                      ? "border-[var(--color-secondary-500)] text-[var(--color-secondary-300)]"
                      : "border-transparent text-[var(--color-gray-400)] hover:text-[var(--color-white)] hover:border-[var(--color-primary-700)]"
                    }
                  `}
                >
                  <Icon className={`size-3.5 ${isActive ? "text-[var(--color-secondary-400)]" : "text-[var(--color-gray-400)]"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenido Dinámico del Módulo Seleccionado */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-5">
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
    </div>
  );
}
