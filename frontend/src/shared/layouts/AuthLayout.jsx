import { Outlet } from "react-router-dom";

export default function AuthLayout(){
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-primary-950)] text-white font-[family-name:var(--main-font)]">
      <main className="w-full flex items-center justify-center p-4">
        <Outlet />
      </main>
    </div>
  );
}