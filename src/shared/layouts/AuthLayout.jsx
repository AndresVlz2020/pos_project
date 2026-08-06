import { Outlet } from "react-router-dom";
import authBg from "@/assets/images/bg-1.png";
export default function AuthLayout(){

  
  return (
    <>
      <div 
        className="min-h-screen w-full mx-auto flex items-center justify-center"
        style={{
          backgroundImage: `url(${authBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <main className="mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </>
  );
}