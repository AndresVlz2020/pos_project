import { Outlet } from "react-router-dom";
import authBg from "@/assets/images/bg-1.png"; 
import { Input, Button } from "@/shared"; 

export default function AuthLayout(){
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
        {/* Envolvemos el input en un div con ancho controlado */}
          <Input 
            label="Nombre"
            type="text"
            placeholder="Escribe tu nombre"
            htmlFor="name"
            variant="primary"
            size="lg"
          />
          <Input 
            label="Correo"
            type="email"
            placeholder="Escribe tu correo"
            htmlFor="user-email"
          />
          <Input 
            label="Telefono"
            type="tel"
            placeholder="Escribe tu telefono"
            htmlFor="user-phone"
          />
          <Input 
            label="Borar tipo de documento"
            type="text"
            placeholder="Escribe tu telefono"
            htmlFor="name"
          />
          <Input 
            label="Documento"
            type="text"
            placeholder="Escribe tu numero de documento"
            htmlFor="user-document-number"
          />

          {/* Actions */}
          
          <div className="flex gap-6 items-center">
            <Button
              variant="secondary"
              size="md"
              type="submit"
              align="left"
              onClick={() => console.log("Se oprimió el submit")}
              >Cancelar
            </Button>
   
            <Button
              variant="primary"
              size="md"
              type="submit"
              onClick={() => console.log("Se oprimió el submit")}
              >Guardar
            </Button>
          </div>



          <Outlet/>
        </main>
      </div>
    </>
  );
}