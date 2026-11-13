import { Outlet } from "react-router-dom";
import { Navbar, useInactivityTimeout } from "@/shared";

export default function DashboardLayout() {
  // Cierre automático de sesión tras 10 minutos de inactividad (RNF09)
  useInactivityTimeout(10 * 60 * 1000);

  return (
  <div className="min-h-screen w-full bg-[var(--color-secondary-950)] text-[var(--color-white)] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />
      <main className="flex-1 w-full mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-6 overflow-x-hidden overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}