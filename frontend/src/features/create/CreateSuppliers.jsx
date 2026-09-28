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
        <div className="max-w-7xl mx-auto my-8 p-8 bg-[var(--color-primary-900)] rounded-lg border border-[var(--color-primary-800)] shadow-md text-[var(--color-white)]">
            <h1 className="text-[length:var(--fs-md)] font-bold text-center mb-8 text-[var(--color-white)]">Crear Proveedor</h1>
            <form onSubmit={handleSubmit}>
                <div className=" 
                        flex 
                        flex-col md:flex-row
                        gap-12 md:gap-16
                        justify-center
                        items-start
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
                        <p className="text-center text-[var(--color-gray-300)] text-sm mt-2">
                            Suba el Logo
                        </p>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 max-w-md w-full">
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
                            label="Correo Electrónico"
                            name="supplierEmail"
                            type="email"
                            value={formSupliers.supplierEmail}
                            htmlFor="supplier-email"
                            onChange={handleChange}
                            error={errors.supplierEmail}
                        />
                        <Input
                            label="Número de Contacto"
                            name="supplierPhone"
                            type="tel"
                            value={formSupliers.supplierPhone}
                            htmlFor="supplier-phone"
                            onChange={handleChange}
                            error={errors.supplierPhone}
                        />
                    </div>

                    <div className="flex-1 flex flex-col gap-4 max-w-md w-full">
                        <Input
                            label="Dirección"
                            name="supplierDirection"
                            type="text"
                            value={formSupliers.supplierDirection}
                            htmlFor="supplier-direction"
                            onChange={handleChange}
                            error={errors.supplierDirection} 
                        />
                        <Input
                            label="Observaciones"
                            name="supplierObservation"
                            type="text"
                            value={formSupliers.supplierObservation}
                            htmlFor="supplier-observation"
                            onChange={handleChange}
                            error={errors.supplierObservation} 
                        />
                        <div className="flex gap-6 mt-4 bg-[var(--color-primary-800)] border border-[var(--color-primary-700)] text-[var(--color-white)] w-48 p-2 rounded-lg">
                            <Checkbox
                                className="cursor-pointer text-[var(--color-white)]"
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
                    </div>
                </div>

                <div className="w-full flex justify-center mt-12 gap-4">
                    <Link to="/supplierList">
                        <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                        >
                            Cancelar
                        </Button>
                    </Link>
                    <Button
                        variant="primary"
                        size="sm"
                        type="submit"
                    >
                        Confirmar Información
                    </Button>
                </div>
            </form>
        </div>
    );
}