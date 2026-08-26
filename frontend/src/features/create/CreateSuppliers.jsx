import { useState } from "react";
import { supplierSchema } from "../suppliers/schemas/supplierSchema"
import { Input, Checkbox, Button, FileInput } from "@/shared"
import { Link } from "react-router-dom";

export default function CreateSuppliers() {

    const [errors, setErrors] = useState({});
    

    const[formSupliers, setFormSupliers] = useState({
        supplierNit:"",
        supplierName:"",
        supplierEmail:"",
        supplierPhone:"",
        supplierDirection:"",
        supplierObservation:"",
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
        const result= supplierSchema.safeParse(formSupliers);
    
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

    return (
        <div>
            <h1 className="text-[length:var(--fs-md)] font-bold place-self-center mt-8">Crear Proveedor</h1>
            <div className=" 
                    flex 
                    gap-24
                    mt-12
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
                        Suba el Logo
                    </p>
                </div>
                <form 
                    action="" 
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <Input
                        label="NIT"
                        name="supplierNit"
                        type="text"
                        value={formSupliers.supplierNit}
                        htmlFor="supplier-nit"
                        onChange={handleChange}
                        error={errors.supplierNit}
                    />
                    <Input
                        label="Nombre del proveedor"
                        name="supplierName"
                        type="text"
                        value={formSupliers.supplierName}
                        htmlFor="supplier-name"
                        onChange={handleChange}
                        error={errors.supplierName}
                    />
                    <Input
                        label="Correo Electronico"
                        name="supplierEmail"
                        type="tel"
                        value={formSupliers.supplierEmail}
                        htmlFor="contact-phone"
                        onChange={handleChange}
                        error={errors.supplierEmail}
                    />
                    <Input
                        label="Numero de Contacto"
                        name="contactPhone"
                        type="tel"
                        value={formSupliers.supplierPhone}
                        htmlFor="contact-phone"
                        onChange={handleChange}
                        error={errors.supplierPhone}
                    />
                </form>
                <form action="" onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        label="Direccion"
                        name="direction"
                        type="text"
                        value={formSupliers.supplierDirection}
                        htmlFor="direction"
                        onChange={handleChange}
                        error={errors.supplierDirection} 
                    />
                    <Input
                        label="Observaciones"
                        name="observations"
                        type="text"
                        value={formSupliers.supplierObservation}
                        htmlFor="observations"
                        onChange={handleChange}
                        error={errors.supplierObservation} 
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