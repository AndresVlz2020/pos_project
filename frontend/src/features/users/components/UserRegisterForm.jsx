// Componente para registrar un usuario 
import { useState, useEffect } from "react"
import {
    Input,
    Select,
    Checkbox,
    Button,
    IconButton,
    M3Icon,
    FileInput,
    showSuccessAlert,
    showErrorAlert,
 } from "@/shared";
 import { getDocumentTypes } from "../../../services/selectServices";
 import { createUser } from "../../../services/userService";
 import { useNavigate } from "react-router-dom";
 import { userSchema } from "../schemas/userSchema";
 import resizeImageFile from "@/utils/imageFile";

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
        userImage: [],
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

        const result = userSchema.safeParse({
            ...formData,
            userImage: formData.userImage?.length ? formData.userImage : undefined,
        });

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
          let userAvatarUrl = null;
          if (formData.userImage?.length) {
            userAvatarUrl = await resizeImageFile(formData.userImage[0]);
          }

          // Llamamos al servicio frontend para que consuma la API
          const response = await createUser({
            ...result.data,
            userImage: undefined,
            userAvatarUrl,
          });

          console.log("✅ Usuario registrado exitosamente:", response);
          await showSuccessAlert({
            title: "Usuario registrado",
            text: "Usuario creado correctamente"
          });

          // Volvemos a la lista de usuarios
          navigate(-1);

        } catch (error) {
          console.error("❌ Error al registrar usuario:", error.message);
          await showErrorAlert({
            title: "Error al registrar",
            text: error.message || "Ocurrió un error inesperado al registrar el usuario."
          });
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


    return (
        <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 my-4">
           <div className="w-full max-w-xl p-6 sm:p-8 bg-[var(--md-sys-color-surface-container-low)] rounded-[28px] border border-[var(--md-sys-color-outline-variant)] m3-elevation-1 text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
             <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--md-sys-color-outline-variant)]">
               <IconButton
                 type="button"
                 variant="tonal"
                 hitSize={40}
                 iconSize={20}
                 ariaLabel="Volver"
                 onClick={() => navigate(-1)}
               >
                 <M3Icon name="arrow_back" size={20} />
               </IconButton>
               <h1 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                 Registro de Usuarios
               </h1>
               <div className="w-10" aria-hidden="true" />
             </div>
             <form
              action=""
              onSubmit={handleSubmit}
              className="flex flex-col items-stretch gap-3 w-full"
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
            leadingIcon="mail"
            value={formData.userEmail}
            placeholder="Escribe tu correo"
            htmlFor="user-email"
            onChange={handleChange}
            error={errors.userEmail}
          />
          <Input
            label="Teléfono"
            name="userPhone"
            type="tel"
            leadingIcon="call"
            value={formData.userPhone}
            placeholder="Escribe tu teléfono"
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
            placeholder="Escribe tu número de documento"
            htmlFor="user-document-number"
            onChange={handleChange}
            error={errors.userDocumentNumber}
          />
            <Input
            label="Contraseña"
            name="userPassword"
            type="password"
            leadingIcon="lock"
            value={formData.userPassword}
            placeholder="Escribe tu contraseña"
            htmlFor="user-password"
            onChange={handleChange}
            error={errors.userPassword}
          />

          <div className="flex flex-col items-center py-2">
            <FileInput
              value={formData.userImage}
              onChange={(files) =>
                setFormData((prev) => ({ ...prev, userImage: files }))
              }
              multiple={false}
              maxFiles={1}
              accept="image/*"
              shape="circle"
              altText={formData.userName || "Usuario"}
            />
            {errors.userImage && (
              <span className="text-[var(--md-sys-color-error)] text-label-sm mt-1">{errors.userImage}</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-1 p-3.5 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]">
          <Checkbox
          id="isSuperUser"
          name="isSuperUser"
          label="Es superusuario"
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
          label="Está activo"
          checked={formData.isActive}
          onChange={handleChange}
          />
          </div>

          <div className="flex gap-3 items-center justify-end w-full pt-4 border-t border-[var(--md-sys-color-outline-variant)]">
           <Button
            variant="outlined"
            size="md"
            type="button"
            onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>

            <Button
            variant="filled"
            size="md"
            type="submit"
            leadingIcon="check_circle"
            disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
            </form>
           </div>
          </div>
    ); 

}
