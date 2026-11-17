import { useState } from "react";
import { supplierSchema } from "../schemas/supplierSchema";
import { Input, Checkbox, Button, FileInput, Alert, showSuccessAlert, showErrorAlert } from "@/shared";
import { Link, useNavigate } from "react-router-dom";



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
        userImage: [],
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

        // Validar número de documento/NIT duplicado (RFADMIN14)
        if (formSupliers.supplierNit === "900.123.456-1" || formSupliers.supplierNit === "890.987.654-3") {
            await showErrorAlert({
                title: "Documento duplicado",
                text: "Ya existe un proveedor registrado con este número de NIT."
            });
            return;
        }

        await showSuccessAlert({
            title: "Proveedor registrado",
            text: "Proveedor registrado correctamente"
        });

        navigate("/supplierList");
    };


    return (
        <div className="flex-1 flex flex-col w-full p-5 sm:p-8 bg-[var(--md-sys-color-surface-container-low)] rounded-2xl border border-[var(--md-sys-color-outline-variant)] m3-elevation-1 text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[var(--md-sys-color-outline-variant)]">
                <div>
                    <h1 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                        Crear Proveedor
                    </h1>
                    <p className="text-body-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                        Registra la ficha comercial y de contacto de un nuevo distribuidor.
                    </p>
                </div>
                <Link to="/supplierList">
                    <Button variant="outlined" size="md" leadingIcon="arrow_back">
                        Volver al Listado
                    </Button>
                </Link>
            </div>
            {feedback && (
                <div className="mb-6 max-w-2xl">
                    <Alert
                        type={feedback.type}
                        title={feedback.title}
                        message={feedback.message}
                        autoClose={false}
                        onClose={() => setFeedback(null)}
                    />
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                    <div className="lg:col-span-3 flex flex-col items-center p-5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]">
                        <p className="text-center text-[var(--md-sys-color-on-surface-variant)] text-label-lg mb-3 font-medium">
                            Suba el Logo
                        </p>
                        <FileInput
                            value={formSupliers.userImage}
                            onChange={(files) =>
                                setFormSupliers((prev) => ({ ...prev, userImage: files }))
                            }
                            multiple={false}
                            maxFiles={1}
                            accept="image/*"
                            altText={formSupliers.supplierName || "Logo proveedor"}
                        />
                        {errors.userImage && (
                            <span className="text-[var(--md-sys-color-error)] text-label-sm mt-2">{errors.userImage}</span>
                        )}
                    </div>

                    <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-5">
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
                            leadingIcon="mail"
                            value={formSupliers.supplierEmail}
                            htmlFor="supplier-email"
                            onChange={handleChange}
                            error={errors.supplierEmail}
                        />
                        <Input
                            label="Número de Contacto"
                            name="supplierPhone"
                            type="tel"
                            leadingIcon="call"
                            value={formSupliers.supplierPhone}
                            htmlFor="supplier-phone"
                            onChange={handleChange}
                            error={errors.supplierPhone}
                        />
                        <Input
                            label="Dirección"
                            name="supplierDirection"
                            type="text"
                            leadingIcon="location_on"
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
                        <div className="md:col-span-2 flex items-center gap-6 min-h-[48px] bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] w-full sm:w-fit px-4 py-2 rounded-xl">
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
                    </div>
                </div>

                <div className="w-full flex justify-end mt-auto pt-6 border-t border-[var(--md-sys-color-outline-variant)] gap-3">
                    <Link to="/supplierList">
                        <Button
                            variant="outlined"
                            size="md"
                            type="button"
                        >
                            Cancelar
                        </Button>
                    </Link>
                    <Button
                        variant="filled"
                        size="md"
                        type="submit"
                        leadingIcon="check_circle"
                    >
                        Confirmar Información
                    </Button>
                </div>
            </form>
        </div>
    );
}