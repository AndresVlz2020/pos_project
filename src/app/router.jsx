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
// import DeleteCounter from "@/shared/components/DeleteCounter";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
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
    path: "/CreateSuppliers",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <CreateSuppliers /> },
    ],  
  },
  
]);

export default router;
