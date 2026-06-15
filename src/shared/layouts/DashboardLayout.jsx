import { Outlet } from "react-router-dom";
import authBg from "@/assets/images/bg-2.jpg";

export default function DashboardLayout() {
  return (
    <>
      <div 
        className="min-h-screen w-full"
        style={{
          backgroundImage: `url(${authBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <main className="mx-auto">
            <h1>Hola que tal 2</h1>
          <Outlet />
        </main>
      </div>
    </>
    
  );
}
