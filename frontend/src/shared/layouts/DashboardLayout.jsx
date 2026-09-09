import { Outlet } from "react-router-dom";
import { Navbar } from "@/shared";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen w-full bg-[var(--color-primary-950)] text-[var(--color-white)] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />
      <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}


