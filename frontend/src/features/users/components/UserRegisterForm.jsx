// Componente para registrar un usuario 
import { useState, useEffect } from "react"
import {
    Input,
    Select,
    Checkbox,
    Button,
    IconButton,
    FileInput, 
 } from "@/shared";
 import { getDocumentTypes } from "../../../services/selectServices";
 import { createUser } from "../../../services/userService";
 import { useNavigate } from "react-router-dom";
 import { userSchema } from "../schemas/userSchema";
 import { ArrowLeft } from "lucide-react";

export default function UserRegisterForm() {

// Estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);

// Navegacion
  const navigate = useNavigate();

// Estado del error
  const [errors, setErrors] = useState({});

// Estados del formulario
    const [formData, setFormData] = useState({
        userName: "",
        userEmail: "",
        userPhone: "",
        userDocumentTypes: "",
        userDocumentNumber: "",
        userPassword: "",
        isStaff: false,
        isActive: true,
        isSuperUser: false,
    });

    // Handle generico
    const handleChange = (e) => {
        // Se obtiene el nombre del campo y su valor
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            // Se copian todos los valores anteriores del estado
            ...prev,

            // Se actualiza unicamente lo que cambio
            [name]: type === "checkbox" ? checked : value,
        }));

        // Limpiar el error del campo si existe
        setErrors((prevErrors) => {
            if (!prevErrors[name]) return prevErrors;
            const nextErrors = { ...prevErrors };
            delete nextErrors[name];
            return nextErrors;
        });
    };

    // Handle submit
    const handleSubmit = async (e) => {
        // Evita que el formulario recargue la pagina 
        e.preventDefault();

        const result = userSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });

            setErrors(fieldErrors);
            return;
        }
        
        // Si la validación es exitosa, se limpian los errores
        setErrors({});

        // Activamos estado de envío
        setIsSubmitting(true);

        try {
          // Llamamos al servicio frontend para que consuma la API
          const response = await createUser(result.data);

          console.log("✅ Usuario registrado exitosamente:", response);
          alert("Usuario creado correctamente");

          // Volvemos a la lista de usuarios
          navigate(-1);

        } catch (error) {
          console.error("❌ Error al registrar usuario:", error.message);
          alert(`Error: ${error.message}`);
        } finally {
          setIsSubmitting(false);
        }
    };

    // HandleNameChange

    // const handleNameChange = (e) => {
    //   const value = e.target.value.trim();

    //   if (value == "") {
    //     console.log("El nombre no puede estar vacío")
    //   }
       
    // };

 const[documentTypes, setDocumentTypes] = useState([])
 useEffect(() => {
  getDocumentTypes().then(setDocumentTypes);
 },[])


    return(
        <div className="flex flex-col items-center justify-center">
             
           <h1 className="mx-auto my-12 text-2xl font-bold">Registro de usuarios</h1>            
            <form
             action=""
             onSubmit={handleSubmit}
             className="flex flex-col items-center w-80"
             >
            <Input 
            label="Nombre"
            name="userName"
            type="text"
            value={formData.userName}
            placeholder="Escribe tu nombre"
            htmlFor="user-name"
            onChange={handleChange}
            error={errors.userName}
         
          />
          <Input 
            label="Correo"
            name="userEmail"
            type="email"
            value={formData.userEmail}
            placeholder="Escribe tu correo"
            htmlFor="user-email"
            onChange={handleChange}
            error={errors.userEmail}
          />
          <Input 
            label="Telefono"
            name="userPhone"
            type="tel"
            value={formData.userPhone}
            placeholder="Escribe tu telefono"
            htmlFor="user-phone"
            onChange={handleChange}
            error={errors.userPhone}
          />
        


            <Select 
            label="Tipos de documentos"
            name="userDocumentTypes"
            htmlFor="userDocumentTypes"
            options={documentTypes}
            value={formData.userDocumentTypes}
            onChange={handleChange}
            error={errors.userDocumentTypes}
            />
            <Input 
            label="Documento"
            name="userDocumentNumber"
            type="text"
            value={formData.userDocumentNumber}
            placeholder="Escribe tu numero de documento"
            htmlFor="user-document-number"
            onChange={handleChange}
            error={errors.userDocumentNumber}
          />
            <Input 
            label="contraseña"
            name="userPassword"
            type="password"
            value={formData.userPassword}
            placeholder="Escribe tu contraseña"
            htmlFor="user-password"
            onChange={handleChange}
            error={errors.userPassword}
          />

          <FileInput
            value={formData.userImage}
          onChange={(files) =>
            setFormData((prev) => ({ ...prev, userImage: files }))
          }
          multiple={true}
          />
          {errors.userImage && (
            <span className="text-red-500 text-sm">{errors.userImage}</span>
          )}

          {/* Checkbox */}

          <div className="grid gap-4 my-2 w-full justify-items-center">

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
          checked={formData.isStaff}
          onChange={handleChange}
          />

          <Checkbox
          id="isActive"
          name="isActive"
          label="Esta activo"
          checked={formData.isActive}
          onChange={handleChange}
          />

          </div>


          {/* Actions */}
            <div className="flex gap-6 items-center justify-center w-full">
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
            type="submit"
            disabled={isSubmitting}
            > {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
            <IconButton
            ariaLabel="Volver"
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft />
          </IconButton>
            </div>
            </form>
          </div>
    ) 

}
