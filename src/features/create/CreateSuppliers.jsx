import { useEffect, useState } from "react";
import { getDocumentTypes } from "../../services/selectServices";
import { userSchema } from "../users/schemas/userSchema"
import { Input, Select, Checkbox, Button, FileInput } from "@/shared"
import { Link } from "react-router-dom";

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
            const nextErrors = { ...prevErrors };
            delete nextErrors[name];
            return nextErrors;
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
        <div>
            <div className=" 
                    flex 
                    gap-24
                    mt-22
                    h-full
                    justify-center
                "
            >
                <div className="w-40 mt-12">

                    <FileInput className="flex items-center justify-center"
                    value={formSupliers.userImage}
                    onChange={(files) => 
                        setFormSupliers((prev) => ({ ...prev, userImage: files}))
                    }
                    multiple={true}
                    />

                    <p className="text-center">
                        Suba un Archivo
                    </p>
                    <FileInput className="flex items-center justify-center"
                    value={formSupliers.userImage}
                    onChange={(files) => 
                        setFormSupliers((prev) => ({ ...prev, userImage: files}))
                    }
                    multiple={true}
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
                        error={errors.userDocumentTypes}
                    />
                    <Input
                        label="Numero de Documento"
                        name="supplierDocumentNumber"
                        type="text"
                        value={formSupliers.supplierDocumentNumber}
                        htmlFor="supplier-document-number"
                        onChange={handleChange}
                        error={errors.userDocumentNumber}
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
                        error={errors.userPhone}
                    />
                    <Input
                        label="Correo Electronico (Empresa)"
                        name="enterpriseEmail"
                        type="email"
                        value={formSupliers.enterpriseEmail}
                        htmlFor="enterpriseEmail"
                        onChange={handleChange}
                        error={errors.userEmail}
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
                    <div className="w-full flex justify-center mt-12 gap-4">
                        <Link to="/supplierList">
                            <Button
                                variant="secondary"
                                size="sm"
                                type="submit"
                                >
                                Cancelar
                            </Button>
                        </Link>
                        <Button
                            variant="primary"
                            size="sm"
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