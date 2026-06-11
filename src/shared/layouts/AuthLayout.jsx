import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import authBg from "@/assets/images/bg-1.png"; 
import {
   Input,
   Button, 
   DeleteCounter2, 
   Select,
   Checkbox } from "@/shared";
import { getDocumentTypes } from "../../services/selectServices";

export default function AuthLayout(){

  // Estado para los documentos
  const [documentTypes, setDocumentTypes] = useState([]);
  
  useEffect(() => {

    getDocumentTypes()
      .then(setDocumentTypes)
      .catch((error) => {
        console.error("Error al cargar los documentos:", error);
        setDocumentTypes([]); // Evita que el Select se rompa si la API falla
      });
  }, []);
  
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
          <h1>Ejemplo 1</h1>

          <DeleteCounter2 />

          {/* Implementación del Select */}
          <Select
            label="Tipo de documento"
            name="userDocumentType"
            htmlFor="userDocumentType"
            options={documentTypes}
          />

          

          <Outlet/>
        </main>
      </div>
    </>
  );
}