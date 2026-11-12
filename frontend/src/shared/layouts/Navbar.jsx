import { useEffect, useState } from "react";
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
import { Menu } from "lucide-react";
import { logout } from "@/services/authService";
import { hasPermission } from "@/features/access/services/accessService";
import { getUserAvatar, imgWorkerCarlos } from "@/utils/imageHelper";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener usuario autenticado actual desde localStorage / sessionStorage
  const currentUser = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("auth_user") ||
          sessionStorage.getItem("user") ||
          "null"
      );
    } catch {
      return null;
    }
  })();

  const role = currentUser?.role || "";
  const initialIsAdmin =
    Boolean(currentUser?.isAdmin || currentUser?.isSuperuser) ||
    role === "Admin" ||
    role === "Administrador";
  const isCajero = role === "Cajero";

  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [canViewUsers, setCanViewUsers] = useState(initialIsAdmin);
  const [canViewInventory, setCanViewInventory] = useState(
    initialIsAdmin || isCajero
  );
  const [canViewSuppliers, setCanViewSuppliers] = useState(initialIsAdmin);

  useEffect(() => {
    const token =
      localStorage.getItem("auth_token") || sessionStorage.getItem("token");

    if (!token) {
      setIsAdmin(false);
      setCanViewUsers(false);
      setCanViewInventory(false);
      setCanViewSuppliers(false);
      return;
    }

    hasPermission("admin")
      .then((res) => setIsAdmin(Boolean(res.granted)))
      .catch(() => setIsAdmin(initialIsAdmin));

    hasPermission("list_user")
      .then((res) => setCanViewUsers(Boolean(res.granted)))
      .catch(() => setCanViewUsers(initialIsAdmin));

    hasPermission("list_inventory")
      .then((res) => setCanViewInventory(Boolean(res.granted)))
      .catch(() => setCanViewInventory(initialIsAdmin || isCajero));

    hasPermission("list_supplier")
      .then((res) => setCanViewSuppliers(Boolean(res.granted)))
      .catch(() => setCanViewSuppliers(initialIsAdmin));
  }, [location.pathname, initialIsAdmin, isCajero]);

  const pathname = location.pathname.toLowerCase();
  const isHome = pathname === "/";
  const isProducts = pathname.includes("product");
  const isOrders = pathname.includes("order");
  const isInventory = pathname.includes("inventory");
  const isSuppliers = pathname.includes("supplier");
  const isUsers = pathname.includes("user") && !pathname.includes("usersmanagement");
  const isAccess =
    pathname.includes("access") || pathname.includes("usersmanagement");

  const getLinkClass = (isActive) =>
    `transition-all py-1 px-1 flex items-center gap-1.5 text-sm font-medium cursor-pointer ${
      isActive
        ? "text-[var(--color-primary-400)] font-bold border-b-2 border-[var(--color-primary-400)]"
        : "text-[var(--color-gray-300)] hover:text-[var(--color-white)]"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/Auth");
  };

  return (
    <nav className="w-full bg-[var(--color-secondary-950)] border-b border-[var(--color-secondary-800)] sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo de marca */}
          <div className="flex items-center shrink-0">
            <Link
              to={"/"}
              className="flex items-center gap-2 group transition-transform hover:scale-105"
            >
              <BrandLogo
                className="h-10 sm:h-12 w-auto object-contain drop-shadow"
                alt="D'Piero Logo"
              />
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
            {(isAdmin || canViewInventory) && (
              <li>
                <Link
                  to={"/inventoryList"}
                  className={getLinkClass(isInventory)}
                >
                  Inventario
                </Link>
              </li>
            )}
            {(isAdmin || canViewSuppliers) && (
              <li>
                <Link to={"/supplierList"} className={getLinkClass(isSuppliers)}>
                  Proveedores
                </Link>
              </li>
            )}
            {(isAdmin || canViewUsers) && (
              <li>
                <Link
                  to={"/dashboard/userList"}
                  className={getLinkClass(isUsers)}
                >
                  Usuarios
                </Link>
              </li>
            )}
          </ul>

          {/* Menú de Acciones / Hamburguesa */}
          <div className="flex items-center gap-2">
            {/* Indicador sutil de rol activo con avatar */}
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--color-gray-300)] bg-[var(--color-secondary-900)] px-2.5 py-1 rounded border border-[var(--color-secondary-800)]">
                <img
                  src={currentUser.photo || currentUser.userAvatarUrl || getUserAvatar(currentUser)}
                  alt={currentUser.name || "Usuario"}
                  className="size-6 rounded-full object-cover border border-[var(--color-secondary-700)] shrink-0"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = imgWorkerCarlos;
                  }}
                />
                <span className="font-medium text-[var(--color-white)] truncate max-w-[120px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--color-secondary-800)] text-[var(--color-primary-400)] font-semibold">
                  {currentUser.role}
                </span>
              </div>
            )}

            {/* Botón de cambio de tema */}
            <ThemeToggle />

            <Dropdown>
              <div>
                <DropdownTrigger>
                  <IconButton
                    ariaLabel="Menu"
                    className="text-white hover:bg-[var(--color-secondary-800)] border border-[var(--color-secondary-700)]"
                  >
                    <Menu className="size-5" />
                  </IconButton>
                </DropdownTrigger>
              </div>

              {/* Contenido: Opciones de navegación móvil, Admin y autenticación */}
              <DropdownContent className="right-0 min-w-[210px] bg-[var(--color-secondary-900)] border border-[var(--color-secondary-700)] text-white shadow-lg">
                <div className="lg:hidden pb-2 mb-2 border-b border-[var(--color-secondary-800)]">
                  <DropdownItem
                    onClick={() => navigate("/")}
                    className={`cursor-pointer ${
                      isHome ? "text-[var(--color-primary-400)] font-bold" : ""
                    }`}
                  >
                    Inicio
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => navigate("/productList")}
                    className={`cursor-pointer ${
                      isProducts
                        ? "text-[var(--color-primary-400)] font-bold"
                        : ""
                    }`}
                  >
                    Productos
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => navigate("/CreateOrder")}
                    className={`cursor-pointer ${
                      pathname === "/createorder"
                        ? "text-[var(--color-primary-400)] font-bold"
                        : ""
                    }`}
                  >
                    Crear Pedido
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => navigate("/orderList")}
                    className={`cursor-pointer ${
                      pathname === "/orderlist"
                        ? "text-[var(--color-primary-400)] font-bold"
                        : ""
                    }`}
                  >
                    Listado de Órdenes
                  </DropdownItem>
                  {(isAdmin || canViewInventory) && (
                    <DropdownItem
                      onClick={() => navigate("/inventoryList")}
                      className={`cursor-pointer ${
                        isInventory
                          ? "text-[var(--color-primary-400)] font-bold"
                          : ""
                      }`}
                    >
                      Inventario
                    </DropdownItem>
                  )}
                  {(isAdmin || canViewSuppliers) && (
                    <DropdownItem
                      onClick={() => navigate("/supplierList")}
                      className={`cursor-pointer ${
                        isSuppliers
                          ? "text-[var(--color-primary-400)] font-bold"
                          : ""
                      }`}
                    >
                      Proveedores
                    </DropdownItem>
                  )}
                  {(isAdmin || canViewUsers) && (
                    <DropdownItem
                      onClick={() => navigate("/dashboard/userList")}
                      className={`cursor-pointer ${
                        isUsers
                          ? "text-[var(--color-primary-400)] font-bold"
                          : ""
                      }`}
                    >
                      Usuarios
                    </DropdownItem>
                  )}
                </div>

                {/* Opciones de Administración exclusivas para Administradores */}
                {isAdmin && (
                  <DropdownItem
                    onClick={() => navigate("/dashboard/access")}
                    className={`cursor-pointer hover:bg-[var(--color-secondary-800)] ${
                      isAccess
                        ? "text-[var(--color-primary-400)] font-bold"
                        : ""
                    }`}
                  >
                    Admin (Gestión de permisos)
                  </DropdownItem>
                )}

                <DropdownItem
                  onClick={handleLogout}
                  className="cursor-pointer text-[var(--color-error)] hover:opacity-90 hover:bg-[var(--color-secondary-800)]"
                >
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
