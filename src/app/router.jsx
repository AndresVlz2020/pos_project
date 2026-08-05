// src/app/router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "@/shared";
import { DashboardLayout} from "@/shared";
import CreateOrder from "@/features/create/CreateOrder";
import UsersManagement from "@/features/create/UsersManagement";
import Login from "@/features/auth/Login";
import Register from "@/features/auth/Register";
import CreateUser from "@/features/create/CreateUser";
import CreateProduct from "@/features/create/CreateProduct";
import CreateSuppliers from "../features/create/CreateSuppliers";
import { UserListPage, UserRegisterForm } from "@/features/users";
import { ProductListPage } from "@/features/products";
import { SuppliersListPage } from "@/features/suppliers";
import { InventoryListPage } from "@/features/inventory";
import { HomePage } from "@/features/home";
import ReadUser1 from "../features/read/users/ReadUser1";
import EditUser1 from "../features/edit/user/EditUser1";
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
    path: "/edituser",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <EditUser1 /> },
    ],  
  },
]);

export default router;
