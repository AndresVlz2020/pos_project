// src/app/router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "@/shared";
import { DashboardLayout} from "@/shared";
import DeleteCounter from "@/shared/components/DeleteCounter";



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
      },
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <h1>Hello1</h1> },
      { path: "/dashboard/auth", element: <h1>Hello2</h1> },
      { path: "/dashboard/userList", element: <h1>Hello3</h1> },
    ],
  },
]);

export default router;
