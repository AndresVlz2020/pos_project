import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="dpiero-wave-bg min-h-dvh w-full overflow-x-clip flex items-center justify-center bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
      <div className="dpiero-wave" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <main className="relative z-10 w-full flex items-center justify-center px-4 py-2 sm:py-3">
        <Outlet />
      </main>
    </div>
  );
}
