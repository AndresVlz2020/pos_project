import { Outlet } from "react-router-dom";
import authBg from "@/assets/images/bg-auth-restaurant.jpg";

export default function AuthLayout(){
  return (
    <div 
      className="min-h-screen w-full mx-auto flex items-center justify-center relative bg-[var(--color-primary-950)]"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10, 16, 30, 0.85), rgba(10, 16, 30, 0.94)), url(${authBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <main className="mx-auto w-full relative z-10">
        <Outlet />
      </main>
    </div>
  );
}