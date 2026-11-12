// src/app/router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, DashboardLayout, ProtectedRoute } from "@/shared";
import CreateOrder from "@/features/orders/pages/CreateOrderPage";
import EditOrder from "@/features/orders/pages/EditOrderPage";
import UsersManagement from "@/features/users/pages/UsersManagementPage";
import Login from "@/features/auth/Login";
import ForgotPassword from "@/features/auth/ForgotPassword";
import ResetPassword from "@/features/auth/ResetPassword";
import CreateUser from "@/features/users/pages/CreateUserPage";
import EditUser1 from "@/features/users/pages/EditUserPage";
import ReadUser1 from "@/features/users/pages/ReadUserPage";
import CreateInventory from "@/features/inventory/pages/CreateInventoryPage";
import CreateSuppliers from "@/features/suppliers/pages/CreateSupplierPage";
import ReadSupplier1 from "@/features/suppliers/pages/ReadSupplierPage";
import EditSupplier1 from "@/features/suppliers/pages/EditSupplierPage";
import CreateProduct from "@/features/products/pages/CreateProductPage";
import ReadProduct1 from "@/features/products/pages/ReadProductPage";
import EditProduct1 from "@/features/products/pages/EditProductPage";
import { UserListPage, UserRegisterForm } from "@/features/users";
import { ProductListPage } from "@/features/products";
import { SuppliersListPage } from "@/features/suppliers";
import { InventoryListPage } from "@/features/inventory";
import { OrderListPage } from "@/features/orders";
import { HomePage } from "@/features/home";
import { AccessPage } from "@/features/access";

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
      { path: "productList", element: <ProductListPage /> },
      { path: "inventoryList", element: <InventoryListPage /> },
      { path: "supplierList", element: <SuppliersListPage /> },
      { path: "orderList", element: <OrderListPage /> },
      { path: "CreateOrder", element: <CreateOrder /> },
      { path: "editorder", element: <EditOrder /> },
      { path: "EditOrder", element: <EditOrder /> },
      {
        path: "edituser",
        element: (
          <ProtectedRoute requiredPermission="admin">
            <EditUser1 />
          </ProtectedRoute>
        ),
      },
      { path: "editsupplier", element: <EditSupplier1 /> },
      { path: "editproduct", element: <EditProduct1 /> },
    ],
  },
  {
    path: "/CreateInventory",
    element: <DashboardLayout />,
    children: [{ index: true, element: <CreateInventory /> }],
  },
  {
    path: "/CreateProduct",
    element: <DashboardLayout />,
    children: [{ index: true, element: <CreateProduct /> }],
  },
  {
    path: "/productList",
    element: <DashboardLayout />,
    children: [{ index: true, element: <ProductListPage /> }],
  },
  {
    path: "/supplierList",
    element: <DashboardLayout />,
    children: [{ index: true, element: <SuppliersListPage /> }],
  },
  {
    path: "/inventoryList",
    element: <DashboardLayout />,
    children: [{ index: true, element: <InventoryListPage /> }],
  },
  {
    path: "/products",
    element: <DashboardLayout />,
    children: [{ index: true, element: <ProductListPage /> }],
  },
  {
    path: "/inventory",
    element: <DashboardLayout />,
    children: [{ index: true, element: <InventoryListPage /> }],
  },
  {
    path: "/orderList",
    element: <DashboardLayout />,
    children: [{ index: true, element: <OrderListPage /> }],
  },
  {
    path: "/orders",
    element: <DashboardLayout />,
    children: [{ index: true, element: <OrderListPage /> }],
  },
  {
    path: "/CreateOrder",
    element: <DashboardLayout />,
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
    element: <DashboardLayout />,
    children: [{ index: true, element: <CreateSuppliers /> }],
  },
  {
    path: "/readuser",
    element: <DashboardLayout />,
    children: [{ index: true, element: <ReadUser1 /> }],
  },
  {
    path: "/readsupplier",
    element: <DashboardLayout />,
    children: [{ index: true, element: <ReadSupplier1 /> }],
  },
  {
    path: "/readproduct",
    element: <DashboardLayout />,
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
    element: <DashboardLayout />,
    children: [{ index: true, element: <EditSupplier1 /> }],
  },
  {
    path: "/editproduct",
    element: <DashboardLayout />,
    children: [{ index: true, element: <EditProduct1 /> }],
  },
  {
    path: "/editorder",
    element: <DashboardLayout />,
    children: [{ index: true, element: <EditOrder /> }],
  },
  {
    path: "/EditOrder",
    element: <DashboardLayout />,
    children: [{ index: true, element: <EditOrder /> }],
  },
  {
    path: "*",
    element: <Navigate to="/CreateOrder" replace />,
  },
]);

export default router;
