// src/app/router.jsx
import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, DashboardLayout, ProtectedRoute } from "@/shared";

const RouteLoader = (
  <div className="flex min-h-[40vh] items-center justify-center p-6 text-sm text-[var(--color-muted)]">
    Cargando...
  </div>
);

// Carga diferida por ruta para reducir el bundle inicial sin alterar rutas ni permisos
const lazyRoute = (loader, exportName) => {
  const Component = lazy(async () => {
    const mod = await loader();
    return exportName ? { default: mod[exportName] } : mod;
  });

  return function LazyRouteWrapper() {
    return (
      <Suspense fallback={RouteLoader}>
        <Component />
      </Suspense>
    );
  };
};

const CreateOrder = lazyRoute(() => import("@/features/orders/pages/CreateOrderPage"));
const EditOrder = lazyRoute(() => import("@/features/orders/pages/EditOrderPage"));
const UsersManagement = lazyRoute(() => import("@/features/users/pages/UsersManagementPage"));
const Login = lazyRoute(() => import("@/features/auth/Login"));
const ForgotPassword = lazyRoute(() => import("@/features/auth/ForgotPassword"));
const ResetPassword = lazyRoute(() => import("@/features/auth/ResetPassword"));
const CreateUser = lazyRoute(() => import("@/features/users/pages/CreateUserPage"));
const EditUser1 = lazyRoute(() => import("@/features/users/pages/EditUserPage"));
const ReadUser1 = lazyRoute(() => import("@/features/users/pages/ReadUserPage"));
const CreateInventory = lazyRoute(() => import("@/features/inventory/pages/CreateInventoryPage"));
const CreateSuppliers = lazyRoute(() => import("@/features/suppliers/pages/CreateSupplierPage"));
const ReadSupplier1 = lazyRoute(() => import("@/features/suppliers/pages/ReadSupplierPage"));
const EditSupplier1 = lazyRoute(() => import("@/features/suppliers/pages/EditSupplierPage"));
const CreateProduct = lazyRoute(() => import("@/features/products/pages/CreateProductPage"));
const ReadProduct1 = lazyRoute(() => import("@/features/products/pages/ReadProductPage"));
const EditProduct1 = lazyRoute(() => import("@/features/products/pages/EditProductPage"));
const UserListPage = lazyRoute(() => import("@/features/users"), "UserListPage");
const UserRegisterForm = lazyRoute(() => import("@/features/users"), "UserRegisterForm");
const ProductListPage = lazyRoute(() => import("@/features/products"), "ProductListPage");
const SuppliersListPage = lazyRoute(() => import("@/features/suppliers"), "SuppliersListPage");
const InventoryListPage = lazyRoute(() => import("@/features/inventory"), "InventoryListPage");
const ReadInventoryPage = lazyRoute(() => import("@/features/inventory"), "ReadInventoryPage");
const OrderListPage = lazyRoute(() => import("@/features/orders"), "OrderListPage");
const HomePage = lazyRoute(() => import("@/features/home"), "HomePage");
const AccessPage = lazyRoute(() => import("@/features/access"), "AccessPage");

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Auth",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      { path: "register", element: <Navigate to="/Auth" replace /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
    ],
  },
  {
    path: "/auth",
    element: <Navigate to="/Auth" replace />,
  },
  {
    path: "/login",
    element: <Navigate to="/Auth" replace />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute requiredPermission="create_user">
            <UserRegisterForm />
          </ProtectedRoute>
        ),
      },
      { path: "auth", element: <Navigate to="/dashboard" replace /> },
      {
        path: "userList",
        element: (
          <ProtectedRoute requiredPermission="list_user">
            <UserListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "access",
        element: (
          <ProtectedRoute requiredPermission="admin">
            <AccessPage />
          </ProtectedRoute>
        ),
      },
      { path: "productList", element: <ProtectedRoute requiredPermission="list_product"><ProductListPage /></ProtectedRoute> },
      { path: "inventoryList", element: <ProtectedRoute requiredPermission="list_inventory"><InventoryListPage /></ProtectedRoute> },
      { path: "supplierList", element: <ProtectedRoute requiredPermission="list_supplier"><SuppliersListPage /></ProtectedRoute> },
      { path: "orderList", element: <ProtectedRoute requiredPermission="list_order"><OrderListPage /></ProtectedRoute> },
      { path: "CreateOrder", element: <ProtectedRoute requiredPermission="create_order"><CreateOrder /></ProtectedRoute> },
      { path: "editorder", element: <ProtectedRoute requiredPermission="update_order"><EditOrder /></ProtectedRoute> },
      { path: "EditOrder", element: <ProtectedRoute requiredPermission="update_order"><EditOrder /></ProtectedRoute> },
      {
        path: "edituser",
        element: (
          <ProtectedRoute requiredPermission="admin">
            <EditUser1 />
          </ProtectedRoute>
        ),
      },
      { path: "editsupplier", element: <ProtectedRoute requiredPermission="update_supplier"><EditSupplier1 /></ProtectedRoute> },
      { path: "editproduct", element: <ProtectedRoute requiredPermission="update_product"><EditProduct1 /></ProtectedRoute> },
    ],
  },
  {
    path: "/CreateInventory",
    element: (
      <ProtectedRoute requiredPermission="list_inventory">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <CreateInventory /> }],
  },
  {
    path: "/CreateProduct",
    element: (
      <ProtectedRoute requiredPermission="create_product">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <CreateProduct /> }],
  },
  {
    path: "/productList",
    element: (
      <ProtectedRoute requiredPermission="list_product">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <ProductListPage /> }],
  },
  {
    path: "/supplierList",
    element: (
      <ProtectedRoute requiredPermission="list_supplier">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <SuppliersListPage /> }],
  },
  {
    path: "/inventoryList",
    element: (
      <ProtectedRoute requiredPermission="list_inventory">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <InventoryListPage /> }],
  },
  {
    path: "/products",
    element: (
      <ProtectedRoute requiredPermission="list_product">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <ProductListPage /> }],
  },
  {
    path: "/inventory",
    element: (
      <ProtectedRoute requiredPermission="list_inventory">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <InventoryListPage /> }],
  },
  {
    path: "/orderList",
    element: (
      <ProtectedRoute requiredPermission="list_order">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <OrderListPage /> }],
  },
  {
    path: "/orders",
    element: (
      <ProtectedRoute requiredPermission="list_order">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <OrderListPage /> }],
  },
  {
    path: "/CreateOrder",
    element: (
      <ProtectedRoute requiredPermission="create_order">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <CreateOrder /> }],
  },
  {
    path: "/CreateUser",
    element: (
      <ProtectedRoute requiredPermission="create_user">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <CreateUser /> }],
  },
  {
    path: "/UsersManagement",
    element: (
      <ProtectedRoute requiredPermission="admin">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <UsersManagement /> }],
  },
  {
    path: "/access",
    element: <Navigate to="/dashboard/access" replace />,
  },
  {
    path: "/CreateSupplier",
    element: (
      <ProtectedRoute requiredPermission="create_supplier">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <CreateSuppliers /> }],
  },
  {
    path: "/readuser",
    element: (
      <ProtectedRoute requiredPermission="list_user">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <ReadUser1 /> }],
  },
  {
    path: "/readsupplier",
    element: (
      <ProtectedRoute requiredPermission="list_supplier">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <ReadSupplier1 /> }],
  },
  {
    path: "/readinventory",
    element: (
      <ProtectedRoute requiredPermission="list_inventory">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <ReadInventoryPage /> }],
  },
  {
    path: "/readproduct",
    element: (
      <ProtectedRoute requiredPermission="list_product">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <ReadProduct1 /> }],
  },
  {
    path: "/edituser",
    element: (
      <ProtectedRoute requiredPermission="admin">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <EditUser1 /> }],
  },
  {
    path: "/editsupplier",
    element: (
      <ProtectedRoute requiredPermission="update_supplier">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <EditSupplier1 /> }],
  },
  {
    path: "/editproduct",
    element: (
      <ProtectedRoute requiredPermission="update_product">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <EditProduct1 /> }],
  },
  {
    path: "/editorder",
    element: (
      <ProtectedRoute requiredPermission="update_order">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <EditOrder /> }],
  },
  {
    path: "/EditOrder",
    element: (
      <ProtectedRoute requiredPermission="update_order">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <EditOrder /> }],
  },
  {
    path: "*",
    element: <Navigate to="/CreateOrder" replace />,
  },
]);

export default router;
