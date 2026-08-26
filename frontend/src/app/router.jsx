// src/app/router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "@/shared";
import { DashboardLayout} from "@/shared";
import CreateOrder from "@/features/create/CreateOrder";
import UsersManagement from "@/features/create/UsersManagement";
import Login from "@/features/auth/Login";
import Register from "@/features/auth/Register";
import CreateUser from "@/features/create/CreateUser";
import CreateInventory from "@/features/create/CreateInventory";
import CreateSuppliers from "../features/create/CreateSuppliers";
import { UserListPage, UserRegisterForm } from "@/features/users";
import { ProductListPage } from "@/features/products";
import { SuppliersListPage } from "@/features/suppliers";
import { InventoryListPage } from "@/features/inventory";
import { HomePage } from "@/features/home";
import ReadUser1 from "../features/read/users/ReadUser1";
import EditUser1 from "../features/edit/user/EditUser1";
import CreateProduct from "../features/create/CreateProduct";
import ReadSupplier1 from "../features/read/suppliers/ReadSupplier1";
import EditSupplier1 from "../features/edit/suppliers/EditSupplier1";
import ReadProduct1 from "../features/read/products/ReadProduct1";
import EditProduct1 from "../features/edit/products/EditProduct1";
import EditOrder from "../features/edit/orders/EditOrder";
// import DeleteCounter from "@/shared/components/DeleteCounter";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage/>,
  },
  {
    path: "/Auth",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      { path: "register", element: <Register /> },
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <UserRegisterForm /> },
      { path: "auth", element: <Navigate to="/dashboard" replace /> },
      { path: "userList", element: <UserListPage /> },
      { path: "productList", element: <ProductListPage /> },
      { path: "inventoryList", element: <InventoryListPage /> },
      { path: "supplierList", element: <SuppliersListPage /> },
      { path: "CreateOrder", element: <CreateOrder /> },
      { path: "editorder", element: <EditOrder /> },
      { path: "EditOrder", element: <EditOrder /> },
      { path: "edituser", element: <EditUser1 /> },
      { path: "editsupplier", element: <EditSupplier1 /> },
      { path: "editproduct", element: <EditProduct1 /> },
    ],
  },
  {
    path: "/CreateInventory",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <CreateInventory /> },
    ],
  },
  {
    path: "/CreateProduct",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <CreateProduct /> },
    ],
  },
  {
    path: "/productList",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <ProductListPage /> },
    ],
  },
  {
    path: "/supplierList",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <SuppliersListPage /> },
    ],
  },
  {
    path: "/inventoryList",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <InventoryListPage /> },
    ],
  },
  {
    path: "/products",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <ProductListPage /> },
    ],
  },
  {
    path: "/inventory",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <InventoryListPage /> },
    ],
  },
  {
    path: "/CreateOrder",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <CreateOrder /> },
    ],
  },
  {
    path: "/CreateUser",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <CreateUser /> },
    ],
  },
  {
    path: "/UsersManagement",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <UsersManagement /> },
    ],
  },
  {
    path: "/CreateSupplier",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <CreateSuppliers /> },
    ],  
  },
  {
    path: "/readuser",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <ReadUser1 /> },
    ],  
  },
  {
    path: "/readsupplier",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <ReadSupplier1 /> },
    ],  
  },
  {
    path: "/readproduct",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <ReadProduct1 /> },
    ],  
  },
  {
    path: "/edituser",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <EditUser1 /> },
    ],  
  },
  {
    path: "/editsupplier",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <EditSupplier1 /> },
    ],  
  },
  {
    path: "/editproduct",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <EditProduct1 /> },
    ],  
  },
  {
    path: "/editorder",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <EditOrder /> },
    ],  
  },
  {
    path: "/EditOrder",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <EditOrder /> },
    ],  
  },
  {
    path: "*",
    element: <Navigate to="/CreateOrder" replace />,
  },
]);

export default router;
