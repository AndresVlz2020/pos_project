import {
  IconButton,
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared";
import logo from "@/assets/images/logo-d,piero.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, UtensilsCrossed } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <nav className="w-full bg-[var(--color-primary-950)]/95 backdrop-blur-md border-b border-[var(--color-primary-800)] sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo de marca */}
          <div className="flex items-center shrink-0">
            <Link to={"/"} className="flex items-center gap-2 group transition-transform hover:scale-105">
              <img src={logo} alt="D'Piero Logo" className="h-10 sm:h-12 w-auto object-contain drop-shadow" />
            </Link>
          </div>

          {/* Links de navegación principales */}
          <ul className="hidden lg:flex items-center gap-6">
            <li>
              <Link to={"/"} className={getLinkClass(isHome)}>
                Inicio
              </Link>
            </li>
            <li>
              <Link to={"/productList"} className={getLinkClass(isProducts)}>
                Menú / Productos
              </Link>
            </li>
            <li>
              <Link to={"/CreateOrder"} className={getLinkClass(isOrders)}>
                <UtensilsCrossed className="size-4" />
                POS / Pedidos
              </Link>
            </li>
            <li>
              <Link to={"/inventoryList"} className={getLinkClass(isInventory)}>
                Inventario
              </Link>
            </li>
            <li>
              <Link to={"/supplierList"} className={getLinkClass(isSuppliers)}>
                Proveedores
              </Link>
            </li>
            <li>
              <Link to={"/dashboard/userList"} className={getLinkClass(isUsers)}>
                Usuarios
              </Link>
            </li>
          </ul>

          {/* Menú de Acciones / Hamburguesa */}
          <div className="flex items-center gap-3">
            <Dropdown>
              <div>
                <DropdownTrigger>
                  <IconButton ariaLabel="Menu" className="text-white hover:bg-[var(--color-primary-800)] border border-[var(--color-primary-700)]">
                    <Menu className="size-5" />
                  </IconButton>
                </DropdownTrigger>
              </div>

              {/* Contenido: Opciones de navegación móvil y autenticación */}
              <DropdownContent className="right-0 min-w-[210px] bg-[var(--color-primary-900)] border border-[var(--color-primary-700)] text-white shadow-2xl">
                <div className="lg:hidden pb-2 mb-2 border-b border-[var(--color-primary-800)]">
                  <DropdownItem onClick={() => navigate("/")} className={`cursor-pointer ${isHome ? "text-[var(--color-secondary-400)] font-bold" : ""}`}>
                    Inicio
                  </DropdownItem>
                  <DropdownItem onClick={() => navigate("/productList")} className={`cursor-pointer ${isProducts ? "text-[var(--color-secondary-400)] font-bold" : ""}`}>
                    Menú / Productos
                  </DropdownItem>
                  <DropdownItem onClick={() => navigate("/CreateOrder")} className={`cursor-pointer ${isOrders ? "text-[var(--color-secondary-400)] font-bold" : ""}`}>
                    POS / Tomar Orden
                  </DropdownItem>
                  <DropdownItem onClick={() => navigate("/inventoryList")} className={`cursor-pointer ${isInventory ? "text-[var(--color-secondary-400)] font-bold" : ""}`}>
                    Inventario
                  </DropdownItem>
                  <DropdownItem onClick={() => navigate("/supplierList")} className={`cursor-pointer ${isSuppliers ? "text-[var(--color-secondary-400)] font-bold" : ""}`}>
                    Proveedores
                  </DropdownItem>
                  <DropdownItem onClick={() => navigate("/dashboard/userList")} className={`cursor-pointer ${isUsers ? "text-[var(--color-secondary-400)] font-bold" : ""}`}>
                    Usuarios
                  </DropdownItem>
                </div>
                <DropdownItem onClick={() => navigate("/Auth")} className="cursor-pointer hover:bg-[var(--color-primary-800)]">
                  Iniciar sesión
                </DropdownItem>
                <DropdownItem onClick={() => navigate("/Auth/register")} className="cursor-pointer hover:bg-[var(--color-primary-800)]">
                  Registrarse
                </DropdownItem>
                <DropdownItem onClick={() => navigate("/Auth")} className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-[var(--color-primary-800)]">
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
