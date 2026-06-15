// Componente para registrar un usuario 
import { useState, useEffect } from "react"
import{
    Input,
    Select,
    Checkbox,
    Button,
 } from "@shared";
 import { getDocumentTypes } from "../../../services/selectServices";

export  default function UserRegisterForm() {
  
}

    const[formData, setFormData] = useState({
        userName:"",
        userEmail:"",
        userPhone:"",
        userDocumentType:"",
        userDocumentNumber:"",
        userPassword:"",
    })


    // Flags Booleans
    isStaff: false;
    isActive:true;
    isSuperUser:false;

    // Handle generico

    const handleChange = (e) => {
        // Se obtiene el nombre del campo y su valor
        const{name, value, type, checked} = e.target;

        setFormData((prev) => ({
            // Se copian todos los valores anteriores del estado 
            ...prev,

            // S actualiza unicamente lo que cambio

            [name]: type === "checkbox" ? checked : value,
        }));
    }

    // Handle submit
    const handleSubmit = async (e) => {
        // Evita que el formulario recargue la pagina 
        e.preventDefault();

        const result= userSchema.safeParse(formData);


        if(!result.success){

            const fieldErrors = {};

            result.error.issues.forEach((issue) => {

                fieldErrors[issue.path[0]] = issue.message;
            });

            setErrors(fieldErrors);

            // Cortamos la ejecucion:no se envia nada al backend

            return;
        }

        setErrors({});


 const[documentTypes, setDocumentTypes] = useState([])
 useEffect(() => {
  getDocumentTypes().then(setDocumentTypes);
 },[])


    return(
        <div>
            <Input 
            label="Nombre"
            type="text"
            placeholder="Escribe tu nombre"
            htmlFor="user-name"
         
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
        


            <Select 
            label="Tipos de documentos"
            name="userDocumentTypes"
            htmlFor="userDocumentTypes"
            options={documentTypes}
            />
            <Input 
            label="Documento"
            type="text"
            placeholder="Escribe tu numero de documento"
            htmlFor="user-document-number"
          />
            <Input 
            label="contraseña"
            type="password"
            placeholder="Escribe tu contraseña"
            htmlFor="user-password"
          />
          {/* Checkbox */}

          <Checkbox
          id="isSuperUser"
          name="isSuperUser"
          label="Es super usuario"
          checked={formData.isSuperUser}
          onChange={handleChange}
          />

          <Checkbox
          id="isStaff"
          name="isStaff"
          label="Es staff"
          checked={formData.isSuperUser}
          onChange={handleChange}
          />

          <Checkbox
          id="isActive"
          name="isActive"
          label="Esta activo"
          checked={formData.isSuperUser}
          onChange={handleChange}
          />

          {/* Actions */}
            <div className="flex gap-6 items-center">
           <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick= {() => console.log("Boton Cancelar")}
            > cancelar
            </Button>
            
            <Button
            variant="primary"
            size="md"
            type="button"
            onClick= {() => console.log("Boton Guardar")}
            > Guardar
            </Button>
          </div>
        </div>
    )

}