import { Outlet } from "react-router-dom";
import { useInactivityTimeout } from "@/shared";
import AppShell from "./AppShell";

export default function DashboardLayout() {
  // Cierre automático de sesión tras 10 minutos de inactividad (RNF09)
  useInactivityTimeout(10 * 60 * 1000);

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
