import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "@/services/authService";
import { hasPermission } from "@/features/access/services/accessService";
import { getCurrentSession, sendSessionHeartbeat } from "@/services/sessionService";

export function useNavigationState() {
  const location = useLocation();
  const navigate = useNavigate();

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
  const [canCreateOrder, setCanCreateOrder] = useState(
    initialIsAdmin || isCajero || role === "Mesero"
  );
  const [sessionAnchor, setSessionAnchor] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const token =
      localStorage.getItem("auth_token") || sessionStorage.getItem("token");

    if (!token) {
      Promise.resolve().then(() => {
        setIsAdmin(false);
        setCanViewUsers(false);
        setCanViewInventory(false);
        setCanViewSuppliers(false);
        setCanCreateOrder(false);
      });
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

    hasPermission("create_order")
      .then((res) => setCanCreateOrder(Boolean(res.granted)))
      .catch(() => setCanCreateOrder(initialIsAdmin || isCajero || role === "Mesero"));
  }, [location.pathname, initialIsAdmin, isCajero, role]);

  const currentUserId = currentUser?.id || null;

  useEffect(() => {
    if (!currentUserId || isAdmin) {
      Promise.resolve().then(() => {
        setSessionAnchor(null);
        setElapsedSeconds(0);
      });
      return;
    }

    let active = true;

    const applySession = (session) => {
      if (!active || !session?.startedAt) return;
      const baseSeconds = Math.max(
        0,
        Math.floor(Number(session.durationSeconds) || 0)
      );
      setSessionAnchor({
        startedAt: session.startedAt,
        baseSeconds,
        syncedAtMs: Date.now(),
      });
      setElapsedSeconds(baseSeconds);
    };

    getCurrentSession()
      .then((session) => applySession(session))
      .catch(() => {});

    const hbId = setInterval(() => {
      sendSessionHeartbeat()
        .then((session) => applySession(session))
        .catch(() => {});
    }, 30000);

    return () => {
      active = false;
      clearInterval(hbId);
    };
  }, [currentUserId, isAdmin]);

  useEffect(() => {
    if (!sessionAnchor || isAdmin) return;
    const tickId = setInterval(() => {
      const delta = Math.max(
        0,
        Math.floor((Date.now() - sessionAnchor.syncedAtMs) / 1000)
      );
      setElapsedSeconds(sessionAnchor.baseSeconds + delta);
    }, 1000);
    return () => clearInterval(tickId);
  }, [sessionAnchor, isAdmin]);

  const pathname = location.pathname.toLowerCase();
  const isHome = pathname === "/";
  const isProducts = pathname.includes("product");
  const isOrders = pathname.includes("order");
  const isInventory = pathname.includes("inventory");
  const isSuppliers = pathname.includes("supplier");
  const isUsers = pathname.includes("user") && !pathname.includes("usersmanagement");
  const isAccess =
    pathname.includes("access") || pathname.includes("usersmanagement");

  const destinations = [
    {
      id: "home",
      label: "Inicio",
      to: "/",
      icon: "home",
      active: isHome,
      visible: true,
    },
    {
      id: "products",
      label: "Productos",
      to: "/productList",
      icon: "restaurant",
      active: isProducts,
      visible: true,
    },
    {
      id: "orders",
      label: "Pedidos",
      to: canCreateOrder ? "/CreateOrder" : "/orderList",
      icon: "receipt_long",
      active: isOrders,
      visible: true,
    },
    {
      id: "inventory",
      label: "Inventario",
      to: "/inventoryList",
      icon: "inventory_2",
      active: isInventory,
      visible: isAdmin || canViewInventory,
    },
    {
      id: "suppliers",
      label: "Proveedores",
      to: "/supplierList",
      icon: "local_shipping",
      active: isSuppliers,
      visible: isAdmin || canViewSuppliers,
    },
    {
      id: "users",
      label: "Usuarios",
      to: "/dashboard/userList",
      icon: "group",
      active: isUsers,
      visible: isAdmin || canViewUsers,
    },
    {
      id: "access",
      label: "Permisos",
      to: "/dashboard/access",
      icon: "admin_panel_settings",
      active: isAccess,
      visible: isAdmin,
    },
  ].filter((d) => d.visible);

  const handleLogout = () => {
    logout();
    navigate("/Auth");
  };

  return {
    currentUser,
    isAdmin,
    canCreateOrder,
    sessionAnchor,
    elapsedSeconds,
    pathname,
    destinations,
    handleLogout,
    navigate,
  };
}
