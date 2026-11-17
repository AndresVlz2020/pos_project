import { useState, useEffect, useCallback } from "react";
import { AppShell, M3Icon, useInactivityTimeout } from "@/shared";
import { products as fallbackProducts } from "@/features/products/data/products";
import { getProducts } from "@/features/products/services/productServices";
import usePermission from "@/features/access/services/usePermission";
import { startOrderWithProduct } from "@/features/orders/utils/orderDraftStorage";
import { getStoredAuthUser, getUserRoleFlags } from "@/shared/utils/authStorage";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  PosTerminalHeader,
  PosProductsSection,
  PosProductDetailModal,
  PosStaffPanel,
  PosSuppliersPanel,
  PosCustomersPanel,
} from "../components";

const PRIMARY_TABS = [
  { id: "menu", label: "Catálogo & Órdenes", icon: "restaurant" },
  { id: "staff", label: "Personal en Turno", icon: "group" },
  { id: "suppliers", label: "Proveedores", icon: "local_shipping" },
  { id: "customers", label: "Facturación", icon: "receipt_long" },
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

  const currentUser = getStoredAuthUser();
  const { isAdmin, isCajero, isCocina } = getUserRoleFlags(currentUser);

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
    if (isCocina) return undefined;
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchPosProducts();
    });
    return () => {
      active = false;
    };
  }, [fetchPosProducts, isCocina]);

  if (isCocina) {
    return <Navigate to="/orders" replace />;
  }

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
    const stockLimit =
      product.stock !== undefined && product.stock !== null
        ? Math.max(0, Math.floor(Number(product.stock)))
        : null;
    const requested = Math.max(1, Math.trunc(Number(quantity) || 1));
    const addCount =
      stockLimit !== null ? Math.min(requested, Math.max(1, stockLimit)) : requested;
    startOrderWithProduct(product, addCount);
    setSelectedProduct(null);
    navigate("/CreateOrder", {
      state: { preselectedProduct: product, preselectedQty: addCount },
    });
  };

  const productsToDisplay = dbProducts.length > 0 ? dbProducts : fallbackProducts;

  return (
    <AppShell>
      <div className="w-full flex-1 flex flex-col gap-4">
        {/* Cabecera operativa M3 con KPIs en tiempo real a ancho completo */}
        <PosTerminalHeader
          operator={currentUser?.name || "Operador en Turno"}
          role={currentUser?.role || "Personal"}
        />

        {/* M3 Primary Tabs */}
        <div className="border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)]">
          <nav
            className="flex items-center gap-2 overflow-x-auto scrollbar-none"
            aria-label="Pestañas autorizadas del POS"
          >
            {availableTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`m3-state relative min-h-[48px] inline-flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap cursor-pointer rounded-t-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                    isActive
                      ? "text-[var(--md-sys-color-primary)]"
                      : "text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
                  }`}
                >
                  <M3Icon name={tab.icon} filled={isActive} size={18} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 inset-x-3 h-[3px] rounded-t-full bg-[var(--md-sys-color-primary)]"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido dinámico que aprovecha el 100% del ancho y alto en PC */}
        <div className="flex-1 w-full flex flex-col">
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
        </div>
      </div>

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
    </AppShell>
  );
}
