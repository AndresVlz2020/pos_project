import { useEffect, useState } from "react";
import { getDocumentTypes } from "../../services/selectServices";
import { userSchema } from "../users/schemas/userSchema"
import logoDPiero from "@/assets/images/logo-d,piero.png"
import ImgUpload from "@/assets/icons/upload.png"
import ImgUploadBar from "@/assets/icons/upload-bar.png"
import { Input, Select, Checkbox, Button } from "@/shared"

export default function CreateSuppliers() {

    const [errors, setErrors] = useState({});
    

    const[formSupliers, setFormSupliers] = useState({
        supplierDocumentTypes:"",
        supplierDocumentNumber:"",
        productName:"",
        productSum:"",
        contactPhone:"",
        enterpriseEmail:"",
        direction:"",
        observations:"",
        isStaff: false,
        isSuperUser: false,
    })

    const handleChange = (e) => {
        const{name, value, type, checked} = e.target;
        setFormSupliers((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        setErrors((prevErrors) => {
            if (!prevErrors[name]) return prevErrors;
            const { [name]: _, ...rest } = prevErrors;
            return rest;
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const result= userSchema.safeParse(formSupliers);
    
        if(!result.success){
            const fieldErrors = {};

            result.error.issues.forEach((issue) => {    
                fieldErrors[issue.path[0]] = issue.message;
            });

            setErrors(fieldErrors);

            return;
        }

            setErrors({});

            try {
              alert("Usuario creado correctamente");
            } catch (error) {
              console.error("Error:", error.message);
              alert(error.message);
            } finally {
              // Pase lo que pase, desactivamos el estado de envío
              // setIsSubmitting(false);
            }
        }
    
    const[documentTypes, setDocumentTypes] = useState([])
    useEffect(() => {
      getDocumentTypes().then(setDocumentTypes);
    },[])

    return (
        <div className="h-full bg-white min-h-screen">
            <div className="
                    w-full bg-[var(--color-primary-950)] text-[var(--color-text-inverse)]
                "
            >
                <div className=
                        "max-w-7xl mx-auto px-6 py-4 flex items-center gap-4"
                >
                    <button type="
                                button
                            "
                            className="
                                px-3 py-1 rounded-md border border-[var(--color-text-inverse)] text-[var(--color-text-inverse)]"
                    >
                        ←
                    </button>
                    <h1 className="
                            text-2xl font-bold
                        "
                    >
                        Crear Proveedores
                    </h1>
                    <img src={logoDPiero} alt="Logo" className="h-8 w-auto" />
                </div>
            </div>
            <div className=" 
                    flex 
                    gap-24
                    mt-22
                    h-full
                    justify-center
                "
            >
                <div className="w-40 mt-8 gap-200">
                    <img ImgUpload
                        src={ImgUpload} 
                        alt="image-icon"
                        className="
                            h-40
                            w-50
                        "
                    />
                    <p className="
                        text-center
                    ">
                        Suba un Archivo
                    </p>
                    <img ImgUploadBar
                        src={ImgUploadBar} 
                        alt="upload-bar"
                        className="
                            h-40
                            w-50
                        "
                    />
                    <p className="
                        text-center
                    "
                    >
                        Suba un codigo de barras
                    </p>
                </div>
                <form 
                    action="" 
                    onSubmit={handleSubmit}
                >
                    <Select
                        label="Tipo de documento"
                        name="supplierDocumentTypes"
                        type="text"
                        value={formSupliers.supplierDocumentTypes}
                        htmlFor="supplier-document-types"
                        options={documentTypes}
                        onChange={handleChange}
                        error={errors.supplierDocumentTypes}
                    />
                    <Input
                        label="Numero de Documento"
                        name="supplierDocumentNumber"
                        type="text"
                        value={formSupliers.supplierDocumentNumber}
                        htmlFor="supplier-document-number"
                        onChange={handleChange}
                        error={errors.supplierDocumentNumber}
                    />
                    <Input
                        label="Nombre del producto"
                        name="productName"
                        type="text"
                        value={formSupliers.productName}
                        htmlFor="product-name"
                        onChange={handleChange}
                        error={errors.productName}
                    />
                    <Input
                        label="Producto de Suministra"
                        name="productSum"
                        type="text"
                        value={formSupliers.productSum}
                        htmlFor="product-sum"
                        onChange={handleChange}
                        error={errors.productSum}
                    />
                    <Input
                        label="Numero de Contacto"
                        name="contactPhone"
                        type="tel"
                        value={formSupliers.contactPhone}
                        htmlFor="contact-phone"
                        onChange={handleChange}
                        error={errors.contactPhone}
                    />
                    <Input
                        label="Correo Electronico (Empresa)"
                        name="enterpriseEmail"
                        type="email"
                        value={formSupliers.enterpriseEmail}
                        htmlFor="enterpriseEmail"
                        onChange={handleChange}
                        error={errors.enterpriseEmail}
                    />
                </form>
                <form action="" onSubmit={handleSubmit}>
                    <Input
                        label="Direccion"
                        name="direction"
                        type="text"
                        value={formSupliers.direction}
                        htmlFor="direction"
                        onChange={handleChange}
                        error={errors.direction} 
                    />
                    <Input
                        label="Observaciones"
                        name="observations"
                        type="text"
                        value={formSupliers.observations}
                        htmlFor="observations"
                        onChange={handleChange}
                        error={errors.observations} 
                    />
                    <div className="flex gap-6 mt-4 bg-gray-200 w-45 p-1 rounded-md">
                        <Checkbox
                        className="cursor-pointer"
                        id="isSuperUser"
                        name="isSuperUser"
                        label="Activo"
                        checked={formSupliers.isSuperUser}
                        onChange={handleChange}
                        />
                        <Checkbox
                        id="isStaff"
                        name="isStaff"
                        label="Inactivo"
                        checked={formSupliers.isStaff}
                        onChange={handleChange}
                        />                    
                    </div>
                    <div className="w-full flex justify-center mt-12">
                        <Button
                            variant="primary"
                            size="md"
                            type="submit"
                        >
                            Confirmar Informacion
                        </Button>
                    </div>
                </form>     
            </div>
        </div>
    )
}