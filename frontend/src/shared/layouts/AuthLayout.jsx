import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="dpiero-wave-bg min-h-screen w-full flex items-center justify-center bg-[var(--color-secondary-950)] text-[var(--color-white)] font-[family-name:var(--main-font)]">
      <div className="dpiero-wave" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <main className="relative z-10 w-full flex items-center justify-center p-4">
        <Outlet />
      </main>
    </div>
  );
}
