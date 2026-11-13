// src/shared/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { Footer } from "./Footer";

export function MainLayout() {
  return (
    <div className="min-h-screen w-full bg-[var(--color-secondary-950)] text-[var(--color-white)] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
