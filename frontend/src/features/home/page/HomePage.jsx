import { useState, useEffect } from "react";
import { Navbar } from "@/shared";
import { products } from "@/features/products/data/products";
import { useSearchParams } from "react-router-dom";
import { 
  UtensilsCrossed, 
  Truck, 
  UserCheck
} from "lucide-react";
import {
  PosTerminalHeader,
  PosProductsSection,
  PosSuppliersPanel,
  PosCustomersPanel
} from "../components";

const PRIMARY_TABS = [
  { id: "menu", label: "Catálogo & Comandas", icon: UtensilsCrossed },
  { id: "suppliers", label: "Proveedores", icon: Truck },
  { id: "customers", label: "Clientes & Facturación", icon: UserCheck },
];

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const tabParam = searchParams.get("tab") || "menu";

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => {
    const isAllowed = PRIMARY_TABS.some((t) => t.id === activeTab);
    if (!isAllowed) {
      setActiveTab("menu");
      const next = new URLSearchParams(searchParams);
      next.set("tab", "menu");
      setSearchParams(next, { replace: true });
    }
  }, [activeTab]);

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
    <div className="flex min-h-screen flex-col bg-[var(--color-primary-950)] text-[var(--color-white)]">
      <Navbar />

      <PosTerminalHeader 
        station="Terminal Central"
        operator="Administrador General"
      />

      {/* Navegación Modular por Pestañas */}
      <div className="w-full bg-[var(--color-primary-900)] border-b border-[var(--color-primary-800)] sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex space-x-6 overflow-x-auto scrollbar-none" aria-label="Módulos POS">
            {PRIMARY_TABS.map((tab) => {
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

        {activeTab === "suppliers" && <PosSuppliersPanel />}

        {activeTab === "customers" && <PosCustomersPanel />}
      </main>
    </div>
  );
}
