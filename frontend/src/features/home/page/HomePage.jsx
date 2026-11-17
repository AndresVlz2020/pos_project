import { useState, useEffect, useCallback } from "react";
import { Navbar, useInactivityTimeout } from "@/shared";
import { products as fallbackProducts } from "@/features/products/data/products";
import { getProducts } from "@/features/products/services/productServices";
import usePermission from "@/features/access/services/usePermission";
import {
  startOrderWithProduct,
  clearOrderDraft,
} from "@/features/orders/utils/orderDraftStorage";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  UtensilsCrossed, 
  Users, 
  Truck, 
  UserCheck
} from "lucide-react";
import {
  PosTerminalHeader,
  PosProductsSection,
  PosProductDetailModal,
  PosStaffPanel,
  PosSuppliersPanel,
  PosCustomersPanel
} from "../components";

const PRIMARY_TABS = [
  { id: "menu", label: "Catálogo & Órdenes", icon: UtensilsCrossed },
  { id: "staff", label: "Personal en Turno", icon: Users },
  { id: "suppliers", label: "Proveedores", icon: Truck },
  { id: "customers", label: "Facturación", icon: UserCheck },
];

export default function HomePage() {
  useInactivityTimeout(10 * 60 * 1000);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const tabParam = searchParams.get("tab") || "menu";

  const [dbProducts, setDbProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { granted: canCreateOrder, loading: loadingOrderPerm } =
    usePermission("create_order");

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

  // Cargar productos en tiempo real desde PostgreSQL
  const fetchPosProducts = useCallback(async () => {
    try {
      const data = await getProducts({ activeOnly: true });
      if (Array.isArray(data) && data.length > 0) {
        setDbProducts(data);
      } else {
        setDbProducts(fallbackProducts);
      }
    } catch (err) {
      console.warn("Usando catálogo de respaldo en HomePage:", err);
      setDbProducts(fallbackProducts);
    }
  }, []);

  useEffect(() => {
    clearOrderDraft();
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchPosProducts();
    });
    return () => {
      active = false;
    };
  }, [fetchPosProducts]);

  // Definir pestañas permitidas según rol:
  // - Admin: Todas las pestañas
  // - Cajero: Catálogo & Órdenes, Clientes & Facturación (no personal ni proveedores)
  // - Mesero / Cocinero: Catálogo & Órdenes exclusivamente
  const availableTabs = PRIMARY_TABS.filter((tab) => {
    if (tab.id === "menu") return true;
    if (tab.id === "customers") return isAdmin || isCajero;
    if (tab.id === "staff") return isAdmin;
    if (tab.id === "suppliers") return isAdmin;
    return false;
  });

  const searchQuery = urlSearch;
  const activeTab = availableTabs.some((t) => t.id === tabParam)
    ? tabParam
    : "menu";

  const handleSearchChange = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val.trim()) {
      next.set("search", val);
      if (activeTab !== "menu") {
        next.set("tab", "menu");
      }
    } else {
      next.delete("search");
    }
    setSearchParams(next, { replace: true });
  };

  const handleTabChange = (tabId) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tabId);
    setSearchParams(next, { replace: true });
  };

  const handleClearSearch = () => {
    handleSearchChange("");
  };

  const handleSelectProduct = (product) => {
    if (!product) return;
    setSelectedProduct(product);
  };

  const handleOrderProduct = (product, quantity = 1) => {
    if (!product) return;
    const addCount = Math.max(1, Math.trunc(Number(quantity) || 1));
    startOrderWithProduct(product, addCount);
    setSelectedProduct(null);
    navigate("/CreateOrder");
  };

  const productsToDisplay = dbProducts.length > 0 ? dbProducts : fallbackProducts;

  return (
    <div className="min-h-screen bg-[var(--color-secondary-950)] text-[var(--color-white)] flex flex-col font-[family-name:var(--main-font)]">
      {/* Barra de navegación superior */}
      <Navbar />

      {/* Cabecera operativa del POS con datos del usuario autenticado y KPIs en tiempo real */}
      <PosTerminalHeader
        operator={currentUser?.name || "Operador en Turno"}
        role={currentUser?.role || "Personal"}
      />

      {/* Tab Bar Tradicional con las pestañas autorizadas para el rol del usuario */}
      <div className="border-b border-[var(--color-secondary-800)] bg-[var(--color-secondary-950)] sticky top-16 z-40">
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
                    min-h-[44px] inline-flex items-center gap-2 py-2.5 px-2.5 border-b-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 cursor-pointer whitespace-nowrap
                    ${isActive
                      ? "border-[var(--color-primary-500)] text-[var(--color-primary-300)]"
                      : "border-transparent text-[var(--color-gray-400)] hover:text-[var(--color-white)] hover:border-[var(--color-secondary-700)]"
                    }
                  `}
                >
                  <Icon className={`size-3.5 ${isActive ? "text-[var(--color-primary-400)]" : "text-[var(--color-gray-400)]"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenido Dinámico del Módulo Seleccionado */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-3 sm:px-6 py-3 sm:py-5 overflow-x-hidden">
        {activeTab === "menu" && (
          <PosProductsSection
            products={productsToDisplay}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activeTab === "staff" && <PosStaffPanel />}

        {activeTab === "suppliers" && <PosSuppliersPanel />}

        {activeTab === "customers" && <PosCustomersPanel />}
      </main>

      {selectedProduct && (
        <PosProductDetailModal
          key={selectedProduct.id}
          product={selectedProduct}
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          onOrder={handleOrderProduct}
          canCreateOrder={canCreateOrder}
          loadingPermission={loadingOrderPerm}
        />
      )}
    </div>
  );
}
