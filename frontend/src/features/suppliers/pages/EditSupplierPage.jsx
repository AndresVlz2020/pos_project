import { useState, useEffect } from "react";
import { supplierSchema } from "../schemas/supplierSchema";
import { Input, Checkbox, Button, FileInput, M3Icon, showSuccessAlert, showErrorAlert } from "@/shared";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { updateSupplier } from "../services/suppliersServices";
import { getSupplierImage } from "@/utils/imageHelper";
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

    const hasInitialSupplier = Boolean(initialSupplier);

    // Sincronizar si cambia location.state o si se recarga con queryId
    useEffect(() => {
        if (location.state?.supplier) {
            Promise.resolve().then(() => populateFromSupplier(location.state.supplier));
            return;
        }

        // Si no hay datos en memoria ni state, pero hay un id en la query, consultarlo de PostgreSQL
        if (!hasInitialSupplier && queryId) {
            Promise.resolve().then(() => setLoadingData(true));
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
    }, [location.state, queryId, hasInitialSupplier]);

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
                text: "Los datos del proveedor se actualizaron exitosamente."
            });
            navigate("/supplierList");
        } catch (error) {
            console.error("Error al actualizar proveedor:", error);
            await showErrorAlert({
                title: "Error al actualizar",
                text: error.message || "No se pudo actualizar el proveedor."
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
        <div className="flex-1 flex flex-col w-full p-5 sm:p-8 bg-[var(--md-sys-color-surface-container-low)] rounded-2xl border border-[var(--md-sys-color-outline-variant)] m3-elevation-1 text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 sm:pb-5 mb-6 border-b border-[var(--md-sys-color-outline-variant)]">
                <div>
                    <h1 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-2.5">
                        <M3Icon name="storefront" size={26} className="text-[var(--md-sys-color-primary)]" />
                        Editar Proveedor
                    </h1>
                </div>
                <Link to="/supplierList">
                    <Button variant="outlined" size="md" leadingIcon="arrow_back">
                        Volver al Listado
                    </Button>
                </Link>
            </div>

            {loadingData ? (
                <div className="flex-1 flex items-center justify-center p-12 text-body-md text-[var(--md-sys-color-on-surface-variant)]">
                    Cargando información del proveedor...
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                        {/* Previsualización del Logo Corporativo */}
                        <div className="lg:col-span-3 flex flex-col items-center p-5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]">
                            <p className="text-center text-[var(--md-sys-color-on-surface-variant)] text-label-lg mb-3 font-medium">
                                Logo de Suministros
                            </p>
                            <FileInput
                                value={formSupliers.userImage}
                                onChange={(files) =>
                                    setFormSupliers((prev) => ({ ...prev, userImage: files }))
                                }
                                multiple={false}
                                maxFiles={1}
                                accept="image/*"
                                existingImageUrl={logoPreview}
                                altText={formSupliers.supplierName || "Logo de suministros"}
                            />
                            {errors.userImage && (
                                <span className="text-[var(--md-sys-color-error)] text-label-sm mt-2">{errors.userImage}</span>
                            )}
                        </div>

                        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                leadingIcon="mail"
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
                                leadingIcon="call"
                                value={formSupliers.supplierPhone}
                                htmlFor="supplier-phone"
                                onChange={handleChange}
                                error={errors.supplierPhone}
                                placeholder="3001234567"
                            />
                            <Input
                                label="Dirección de Despacho *"
                                name="supplierDirection"
                                type="text"
                                leadingIcon="location_on"
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

                    <div className="w-full flex justify-end mt-auto gap-3 pt-6 border-t border-[var(--md-sys-color-outline-variant)]">
                        <Link to="/supplierList">
                            <Button
                                variant="outlined"
                                size="md"
                                type="button"
                                disabled={submitting}
                            >
                                Cancelar
                            </Button>
                        </Link>
                        <Button
                            variant="filled"
                            size="md"
                            type="submit"
                            leadingIcon="check_circle"
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
