import { useState, useEffect } from "react";
import { supplierSchema } from "../schemas/supplierSchema";
import { Input, Checkbox, Button, FileInput, showSuccessAlert, showErrorAlert } from "@/shared";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { updateSupplier } from "../services/suppliersServices";
import { getSupplierImage } from "@/utils/imageHelper";
import { Building2 } from "lucide-react";
import { API_URL } from "@/features/config";

export default function EditSupplierPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const queryId = searchParams.get("id") || searchParams.get("nit");

    // 1. Obtener proveedor desde state de navegación o desde sessionStorage en recargas (F5)
    const getInitialSupplier = () => {
        if (location.state?.supplier) return location.state.supplier;
        try {
            const saved = sessionStorage.getItem("last_edited_supplier");
            if (saved) return JSON.parse(saved);
        } catch {
            return null;
        }
        return null;
    };

    const initialSupplier = getInitialSupplier();

    const [supplierId, setSupplierId] = useState(initialSupplier?.id || null);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    const [formSupliers, setFormSupliers] = useState({
        supplierNit: String(initialSupplier?.nit || initialSupplier?.id || ""),
        supplierName: String(initialSupplier?.companyName || initialSupplier?.company_name || initialSupplier?.name || ""),
        supplierEmail: String(initialSupplier?.supplierEmail || initialSupplier?.email || ""),
        supplierPhone: String(initialSupplier?.supplierPhone || initialSupplier?.phone || ""),
        supplierDirection: String(initialSupplier?.supplierDirection || initialSupplier?.address || ""),
        supplierObservation: String(initialSupplier?.supplierObservation || initialSupplier?.observation || ""),
        isStaff: !(initialSupplier?.isActive ?? initialSupplier?.is_active ?? true),
        isSuperUser: initialSupplier?.isActive ?? initialSupplier?.is_active ?? true,
        userImage: [],
    });

    const populateFromSupplier = (supplier) => {
        if (!supplier) return;
        setSupplierId(supplier.id);
        const active = supplier.isActive ?? supplier.is_active ?? true;
        setFormSupliers({
            supplierNit: String(supplier.nit || supplier.id || ""),
            supplierName: String(supplier.companyName || supplier.company_name || supplier.name || ""),
            supplierEmail: String(supplier.supplierEmail || supplier.email || ""),
            supplierPhone: String(supplier.supplierPhone || supplier.phone || ""),
            supplierDirection: String(supplier.supplierDirection || supplier.address || ""),
            supplierObservation: String(supplier.supplierObservation || supplier.observation || ""),
            isStaff: !active,
            isSuperUser: active,
            userImage: [],
        });
        sessionStorage.setItem("last_edited_supplier", JSON.stringify(supplier));
    };

    // Sincronizar si cambia location.state o si se recarga con queryId
    useEffect(() => {
        if (location.state?.supplier) {
            populateFromSupplier(location.state.supplier);
            return;
        }

        // Si no hay datos en memoria ni state, pero hay un id en la query, consultarlo de PostgreSQL
        if (!initialSupplier && queryId) {
            setLoadingData(true);
            fetch(`${API_URL}/suppliers/${queryId}`)
                .then((res) => {
                    if (!res.ok) throw new Error("No se pudo obtener el proveedor");
                    return res.json();
                })
                .then((data) => {
                    if (data && !data.error) {
                        populateFromSupplier(data);
                    }
                })
                .catch((err) => {
                    console.error("Error al cargar proveedor por ID:", err);
                })
                .finally(() => {
                    setLoadingData(false);
                });
        }
    }, [location.state, queryId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === "isSuperUser" && checked) {
            setFormSupliers((prev) => ({ ...prev, isSuperUser: true, isStaff: false }));
            return;
        }
        if (name === "isStaff" && checked) {
            setFormSupliers((prev) => ({ ...prev, isSuperUser: false, isStaff: true }));
            return;
        }

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
        const result = supplierSchema.safeParse(formSupliers);
    
        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {    
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        setSubmitting(true);

        try {
            const payload = {
                supplierNit: formSupliers.supplierNit,
                supplierName: formSupliers.supplierName,
                supplierEmail: formSupliers.supplierEmail,
                supplierPhone: formSupliers.supplierPhone,
                supplierDirection: formSupliers.supplierDirection,
                supplierObservation: formSupliers.supplierObservation,
                isActive: formSupliers.isSuperUser,
            };

            const targetId = supplierId || formSupliers.supplierNit;
            await updateSupplier(targetId, payload);

            // Actualizar almacenamiento temporal
            sessionStorage.removeItem("last_edited_supplier");

            await showSuccessAlert({
                title: "Proveedor actualizado",
                text: "Los datos del proveedor se actualizaron exitosamente en PostgreSQL."
            });
            navigate("/supplierList");
        } catch (error) {
            console.error("Error al actualizar proveedor:", error);
            await showErrorAlert({
                title: "Error al actualizar",
                text: error.message || "No se pudo actualizar el proveedor en la base de datos."
            });
        } finally {
            setSubmitting(false);
        }
    };

    const { image: logoPreview } = getSupplierImage({
        companyName: formSupliers.supplierName,
        nit: formSupliers.supplierNit,
        observation: formSupliers.supplierObservation,
    });

    return (
        <div className="max-w-7xl mx-auto my-8 p-8 bg-[var(--color-secondary-900)] rounded-lg border border-[var(--color-secondary-800)] shadow-md text-[var(--color-white)] font-[family-name:var(--main-font)]">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-[var(--color-secondary-800)]">
                <div>
                    <h1 className="text-xl font-bold text-[var(--color-white)] flex items-center gap-2">
                        <Building2 className="size-6 text-[var(--color-primary-400)]" />
                        Editar Proveedor
                    </h1>
                </div>
                <Link to="/supplierList">
                    <Button variant="secondary" size="sm">
                        Volver al Listado
                    </Button>
                </Link>
            </div>

            {loadingData ? (
                <div className="p-12 text-center text-[var(--color-gray-300)]">
                    Cargando datos del proveedor desde PostgreSQL...
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row gap-12 md:gap-16 justify-center items-start">
                        {/* Previsualización del Logo Corporativo */}
                        <div className="w-48 flex flex-col items-center">
                            <div className="size-36 rounded-xl border-2 border-[var(--color-secondary-700)] bg-[var(--color-secondary-950)] overflow-hidden shadow-md flex items-center justify-center p-1">
                                <img
                                    src={logoPreview}
                                    alt={formSupliers.supplierName || "Logo"}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                            <p className="text-center text-[var(--color-gray-300)] text-xs mt-2 font-medium">
                                Logo de Suministros
                            </p>
                            <div className="w-full mt-4">
                                <FileInput 
                                    className="flex items-center justify-center"
                                    value={formSupliers.userImage}
                                    onChange={(files) => 
                                        setFormSupliers((prev) => ({ ...prev, userImage: files}))
                                    }
                                    multiple={false}
                                />
                            </div>
                        </div>

                        {/* Columna 1 de Inputs */}
                        <div className="flex-1 flex flex-col gap-4 max-w-md w-full">
                            <Input
                                label="NIT *"
                                name="supplierNit"
                                type="text"
                                value={formSupliers.supplierNit}
                                htmlFor="supplier-nit"
                                onChange={handleChange}
                                error={errors.supplierNit}
                                placeholder="Ej: 900.123.456-1"
                            />
                            <Input
                                label="Razón Social / Compañía *"
                                name="supplierName"
                                type="text"
                                value={formSupliers.supplierName}
                                htmlFor="supplier-name"
                                onChange={handleChange}
                                error={errors.supplierName}
                                placeholder="Nombre de la empresa proveedora"
                            />
                            <Input
                                label="Correo Electrónico *"
                                name="supplierEmail"
                                type="email"
                                value={formSupliers.supplierEmail}
                                htmlFor="supplier-email"
                                onChange={handleChange}
                                error={errors.supplierEmail}
                                placeholder="ventas@proveedor.com"
                            />
                            <Input
                                label="Número de Contacto *"
                                name="supplierPhone"
                                type="tel"
                                value={formSupliers.supplierPhone}
                                htmlFor="supplier-phone"
                                onChange={handleChange}
                                error={errors.supplierPhone}
                                placeholder="3001234567"
                            />
                        </div>

                        {/* Columna 2 de Inputs */}
                        <div className="flex-1 flex flex-col gap-4 max-w-md w-full">
                            <Input
                                label="Dirección de Despacho *"
                                name="supplierDirection"
                                type="text"
                                value={formSupliers.supplierDirection}
                                htmlFor="supplier-direction"
                                onChange={handleChange}
                                error={errors.supplierDirection} 
                                placeholder="Calle, Carrera o Zona Industrial"
                            />
                            <Input
                                label="Observaciones / Términos Comerciales"
                                name="supplierObservation"
                                type="text"
                                value={formSupliers.supplierObservation}
                                htmlFor="supplier-observation"
                                onChange={handleChange}
                                error={errors.supplierObservation} 
                                placeholder="Línea de insumos, crédito o notas de entrega"
                            />
                            <div className="flex items-center gap-6 mt-4 bg-[var(--color-secondary-800)] border border-[var(--color-secondary-700)] text-[var(--color-white)] w-52 p-2.5 rounded-lg">
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

                    <div className="w-full flex justify-center mt-12 gap-4 pt-6 border-t border-[var(--color-secondary-800)]">
                        <Link to="/supplierList">
                            <Button
                                variant="secondary"
                                size="sm"
                                type="button"
                                disabled={submitting}
                            >
                                Cancelar
                            </Button>
                        </Link>
                        <Button
                            variant="primary"
                            size="sm"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
