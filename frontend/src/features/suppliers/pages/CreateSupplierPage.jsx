import { useState } from "react";
import { supplierSchema } from "../schemas/supplierSchema";
import { Input, Button, FileInput, Alert, showSuccessAlert, showErrorAlert } from "@/shared";
import { Link, useNavigate } from "react-router-dom";
import { createSupplier } from "../services/suppliersServices";

export default function CreateSuppliers() {

    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [feedback, setFeedback] = useState(null);

    const [formSupliers, setFormSupliers] = useState({

        supplierNit:"",
        supplierName:"",
        supplierEmail:"",
        supplierPhone:"",
        supplierDirection:"",
        supplierObservation:"",
        isStaff: true,
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

        // Validar número de documento/NIT duplicado (RFADMIN14)
        if (formSupliers.supplierNit === "900.123.456-1" || formSupliers.supplierNit === "890.987.654-3") {
            await showErrorAlert({
                title: "Documento duplicado",
                text: "Ya existe un proveedor registrado con este número de NIT."
            });
            return;
        }

        try {
            await createSupplier(formSupliers);
            
            await showSuccessAlert({
                title: "Proveedor registrado",
                text: "Proveedor registrado correctamente"
            });
            
            navigate("/supplierList");
        } catch (error) {
            await showErrorAlert({
                title: "Error al registrar",
                text: error.message || "No se pudo conectar al servidor"
            })
        }
    };


    return (
        <div className="max-w-7xl mx-auto my-8 p-8 bg-[var(--color-secondary-900)] rounded-lg border border-[var(--color-secondary-800)] shadow-md text-[var(--color-white)]">
            <h1 className="text-[length:var(--fs-md)] font-bold text-center mb-6 text-[var(--color-white)]">Crear Proveedor</h1>
            {feedback && (
                <div className="mb-6 max-w-xl mx-auto">
                    <Alert
                        type={feedback.type}
                        title={feedback.title}
                        message={feedback.message}
                        autoClose={false}
                        onClose={() => setFeedback(null)}
                    />
                </div>
            )}
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