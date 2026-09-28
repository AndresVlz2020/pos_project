import {
  IconButton,
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  ThemeToggle,
  BrandLogo,
} from "@/shared";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, UtensilsCrossed } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener usuario autenticado actual desde localStorage
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
      return null;
    }
  })();

  const role = currentUser?.role || "";
  const isAdmin = role === "Admin" || role === "Administrador";
  const isCajero = role === "Cajero";

  // Permisos según el rol:
  // - Admin (admin@dpiero.com): Acceso total (Menú, POS, Inventario, Proveedores, Usuarios)
  // - Cajero: Menú, POS, Inventario (NO Proveedores, NO Usuarios)
  // - Mesero / Cocinero: Menú, POS (NO Inventario, NO Proveedores, NO Usuarios)
  const canViewInventory = isAdmin || isCajero;
  const canViewSuppliers = isAdmin;
  const canViewUsers = isAdmin; // Únicamente admin@dpiero.com tiene permiso de ver usuarios

  const pathname = location.pathname.toLowerCase();
  const isHome = pathname === "/";
  const isProducts = pathname.includes("product");
  const isOrders = pathname.includes("order");
  const isInventory = pathname.includes("inventory");
  const isSuppliers = pathname.includes("supplier");
  const isUsers = pathname.includes("user");

  const getLinkClass = (isActive) =>
    `transition-all py-1 px-1 flex items-center gap-1.5 text-sm font-medium cursor-pointer ${
      isActive
        ? "text-[var(--color-secondary-400)] font-bold border-b-2 border-[var(--color-secondary-400)]"
        : "text-[var(--color-gray-300)] hover:text-[var(--color-white)]"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    navigate("/Auth");
  };

  return (
    <nav className="w-full bg-[var(--color-primary-950)] border-b border-[var(--color-primary-800)] sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo de marca */}
          <div className="flex items-center shrink-0">
            <Link to={"/"} className="flex items-center gap-2 group transition-transform hover:scale-105">
              <BrandLogo className="h-10 sm:h-12 w-auto object-contain drop-shadow" alt="D'Piero Logo" />
            </Link>
          </div>

          {/* Links de navegación principales según permisos del rol */}
          <ul className="hidden lg:flex items-center gap-6">
            <li>
              <Link to={"/"} className={getLinkClass(isHome)}>
                Inicio
              </Link>
            </li>
            <li>
              <Link to={"/productList"} className={getLinkClass(isProducts)}>
                Productos
              </Link>
            </li>
            <li>
              <Link to={"/CreateOrder"} className={getLinkClass(isOrders)}>
                Pedidos
              </Link>
            </li>
            {canViewInventory && (
              <li>
                <Link to={"/inventoryList"} className={getLinkClass(isInventory)}>
                  Inventario
                </Link>
              </li>
            )}
            {canViewSuppliers && (
              <li>
                <Link to={"/supplierList"} className={getLinkClass(isSuppliers)}>
                  Proveedores
                </Link>
              </li>
            )}
            {canViewUsers && (
              <li>
                <Link to={"/dashboard/userList"} className={getLinkClass(isUsers)}>
                  Usuarios
                </Link>
              </li>
            )}
          </ul>

          {/* Menú de Acciones / Hamburguesa */}
          <div className="flex items-center gap-2">
            {/* Indicador sutil de rol activo */}
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--color-gray-300)] bg-[var(--color-primary-900)] px-2.5 py-1 rounded border border-[var(--color-primary-800)]">
                <span className="font-medium text-[var(--color-white)] truncate max-w-[120px]">{currentUser.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--color-primary-800)] text-[var(--color-secondary-400)] font-semibold">
                  {currentUser.role}
                </span>
              </div>
            )}

            {/* Botón de cambio de tema */}
            <ThemeToggle />

            <Dropdown>
              <div>
                <DropdownTrigger>
                  <IconButton ariaLabel="Menu" className="text-white hover:bg-[var(--color-primary-800)] border border-[var(--color-primary-700)]">
                    <Menu className="size-5" />
                  </IconButton>
                </DropdownTrigger>
              </div>

              {/* Contenido: Opciones de navegación móvil y autenticación */}
              <DropdownContent className="right-0 min-w-[210px] bg-[var(--color-primary-900)] border border-[var(--color-primary-700)] text-white shadow-lg">
                <div className="lg:hidden pb-2 mb-2 border-b border-[var(--color-primary-800)]">
                  <DropdownItem onClick={() => navigate("/")} className={`cursor-pointer ${isHome ? "text-[var(--color-secondary-400)] font-bold" : ""}`}>
                    Inicio
                  </DropdownItem>
                  <DropdownItem onClick={() => navigate("/productList")} className={`cursor-pointer ${isProducts ? "text-[var(--color-secondary-400)] font-bold" : ""}`}>
                    Productos
                  </DropdownItem>
                  <DropdownItem onClick={() => navigate("/CreateOrder")} className={`cursor-pointer ${isOrders ? "text-[var(--color-secondary-400)] font-bold" : ""}`}>
                    Pedidos
                  </DropdownItem>
                  {canViewInventory && (
                    <DropdownItem onClick={() => navigate("/inventoryList")} className={`cursor-pointer ${isInventory ? "text-[var(--color-secondary-400)] font-bold" : ""}`}>
                      Inventario
                    </DropdownItem>
                  )}
                  {canViewSuppliers && (
                    <DropdownItem onClick={() => navigate("/supplierList")} className={`cursor-pointer ${isSuppliers ? "text-[var(--color-secondary-400)] font-bold" : ""}`}>
                      Proveedores
                    </DropdownItem>
                  )}
                  {canViewUsers && (
                    <DropdownItem onClick={() => navigate("/dashboard/userList")} className={`cursor-pointer ${isUsers ? "text-[var(--color-secondary-400)] font-bold" : ""}`}>
                      Usuarios
                    </DropdownItem>
                  )}
                </div>
                <DropdownItem onClick={() => navigate("/Auth")} className="cursor-pointer hover:bg-[var(--color-primary-800)]">
                  Cambiar operador / Iniciar sesión
                </DropdownItem>
                <DropdownItem onClick={handleLogout} className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-[var(--color-primary-800)]">
                  Cerrar sesión
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </div>
        </div>
      </div>
    </nav>
  );
}
