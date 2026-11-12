import { Input, Button, FileInput, Select, Alert, showSuccessAlert, showErrorAlert } from "@/shared";
import { useState, useEffect } from "react";
import { inventorySchema } from "../schemas/inventorySchema";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAllSuppliers } from "@/features/suppliers/services/suppliersServices";
import { createInventory, updateInventory } from "../services/inventoryServices";

export default function CreateInventory() {
    const navigate = useNavigate();
    const location = useLocation();

    const rawItem = location.state?.item;
    const editItem =
        rawItem ||
        (() => {
            try {
                return JSON.parse(sessionStorage.getItem("last_active_inventory_item") || "null");
            } catch {
                return null;
            }
        })();

    useEffect(() => {
        if (location.state?.item) {
            sessionStorage.setItem("last_active_inventory_item", JSON.stringify(location.state.item));
        }
    }, [location.state]);

    const isReadOnly = Boolean(location.state?.readOnly);
    const isEditing = Boolean(editItem && !isReadOnly);

    const [suppliersList, setSuppliersList] = useState([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formInventory, setInventory] = useState({
        inventorySupplierSelect: editItem?.supplier || editItem?.supplier_id || "",
        inventoryProductName: editItem?.productName || editItem?.name || "",
        inventoryProductAccountant: editItem?.code || editItem?.id || "",
        inventoryProductDescription: editItem?.description || "Insumo de inventario gastronómico",
        inventoryProductLocation: editItem?.location || "Almacén Central / Bodega",
        productBrandSelect: editItem?.brand ? editItem.brand.toLowerCase() : "alpina",
        numberBatch: editItem ? (editItem.numberBatch || editItem.batch_number || `LT-${editItem.id || "001"}`) : "",
        initialStock: editItem?.currentStock !== undefined ? String(editItem.currentStock) : "",
        minAmount: editItem?.minStock !== undefined ? String(editItem.minStock) : "5",
        priceBuy: editItem?.priceBuy !== undefined ? String(editItem.priceBuy) : "45000",
        expirationDate: editItem?.expirationDate || editItem?.lastUpdated || "2026-12-31",
    });

    const [errors, setErrors] = useState({});
    const [feedback, setFeedback] = useState(null);

    // Cargar proveedores desde PostgreSQL en tiempo real
    useEffect(() => {
        async function fetchSuppliers() {
            try {
                const data = await getAllSuppliers();
                setSuppliersList(data || []);
            } catch (err) {
                console.error("Error al cargar proveedores en inventario:", err);
            } finally {
                setLoadingSuppliers(false);
            }
        }
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (editItem) {
            setInventory({
                inventorySupplierSelect: String(editItem.supplier_id || editItem.supplier || ""),
                inventoryProductName: editItem.productName || editItem.name || "",
                inventoryProductAccountant: editItem.code || editItem.id || "",
                inventoryProductDescription: editItem.description || "Insumo de inventario gastronómico",
                inventoryProductLocation: editItem.location || "Almacén Central / Bodega",
                productBrandSelect: editItem.brand ? editItem.brand.toLowerCase() : "alpina",
                numberBatch: editItem.numberBatch || editItem.batch_number || `LT-${editItem.id || "001"}`,
                initialStock: editItem.currentStock !== undefined ? String(editItem.currentStock) : "",
                minAmount: editItem.minStock !== undefined ? String(editItem.minStock) : "5",
                priceBuy: editItem.priceBuy !== undefined ? String(editItem.priceBuy) : "45000",
                expirationDate: editItem.expirationDate || editItem.lastUpdated || "2026-12-31",
            });
        }
    }, [editItem]);

    const handleChange = (e) => {
        if (isReadOnly) return;
        const { name, value } = e.target;
        setInventory((prev) => ({ ...prev, [name]: value }));

        setErrors((prevErrors) => {
            if (!prevErrors[name]) return prevErrors;
            const nextErrors = { ...prevErrors };
            delete nextErrors[name];
            return nextErrors;
        });
    };

    const handleSubmit = async (e) => { 
        e.preventDefault();
        if (isReadOnly) {
            navigate("/inventoryList");
            return;
        }

        setFeedback(null);

        const result = inventorySchema.safeParse(formInventory);

        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }
        
        setErrors({});

        // Validar si el proveedor seleccionado está inhabilitado
        const selectedSupplier = suppliersList.find(
            (s) => String(s.id) === String(formInventory.inventorySupplierSelect) ||
                   s.nit === formInventory.inventorySupplierSelect ||
                   s.company_name === formInventory.inventorySupplierSelect
        );

        if (selectedSupplier && selectedSupplier.is_active === false) {
            await showErrorAlert({
                title: "Proveedor inhabilitado",
                text: `El proveedor "${selectedSupplier.company_name || selectedSupplier.companyName}" está inhabilitado en PostgreSQL. No se pueden asociar insumos a un proveedor inactivo.`
            });
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                itemName: formInventory.inventoryProductName,
                productName: formInventory.inventoryProductName,
                brand: formInventory.productBrandSelect,
                category: "Insumos y Materias Primas",
                currentStock: Number(formInventory.initialStock) || 0,
                minStock: Number(formInventory.minAmount) || 0,
                location: formInventory.inventoryProductLocation,
                priceBuy: Number(formInventory.priceBuy) || 0,
                batchNumber: formInventory.numberBatch,
                expirationDate: formInventory.expirationDate || null,
                supplierId: selectedSupplier ? selectedSupplier.id : null,
                supplierName: selectedSupplier ? (selectedSupplier.company_name || selectedSupplier.companyName) : formInventory.inventorySupplierSelect,
                description: formInventory.inventoryProductDescription,
            };

            if (isEditing && editItem?.id) {
                await updateInventory(editItem.id, payload);
                await showSuccessAlert({
                    title: "Inventario actualizado",
                    text: "El insumo ha sido actualizado correctamente en PostgreSQL."
                });
            } else {
                await createInventory(payload);
                await showSuccessAlert({
                    title: "Inventario registrado",
                    text: "Insumo registrado correctamente en PostgreSQL."
                });
            }

            navigate("/inventoryList");
        } catch (err) {
            console.error("Error al guardar inventario:", err);
            await showErrorAlert({
                title: "Error al guardar",
                text: err.message || "No se pudo sincronizar el insumo con PostgreSQL."
            });
        } finally {
            setSubmitting(false);
        }
    };

    const supplierOptions = suppliersList.length > 0 
        ? suppliersList.map((s) => ({
            value: String(s.id),
            label: `${s.nit} - ${s.company_name || s.companyName}${s.is_active === false ? " (Inhabilitado)" : ""}`
          }))
        : [
            { value: "1", label: "900.123.456-1 - Distribuidora Lácteos del Campo S.A.S." },
            { value: "2", label: "890.987.654-3 - Avícola y Carnes del Valle S.A." },
          ];

    const brandOptions = [
        { value: "alpina", label: "Alpina" },
        { value: "alqueria", label: "Alquería" },
        { value: "colanta", label: "Colanta" },
        { value: "zenu", label: "Zenú" },
        { value: "frisby", label: "Frisby" },
        { value: "diana", label: "Diana" },
        { value: "roa", label: "Arroz Roa" },
        { value: "doria", label: "Pastas Doria" },
        { value: "la-fina", label: "La Fina" },
        { value: "maggi", label: "Maggi" },
        { value: "knorr", label: "Knorr" },
        { value: "nestle", label: "Nestlé" },
        { value: "coca-cola", label: "Coca-Cola" },
        { value: "postobon", label: "Postobón" },
        { value: "cristal", label: "Agua Cristal" },
        { value: "club-colombia", label: "Club Colombia" },
        { value: "aguila", label: "Águila" },
        { value: "sello-rojo", label: "Café Sello Rojo" },
        { value: "pergamino", label: "Café Pergamino" },
        { value: "manuelita", label: "Manuelita" },
        { value: "incauca", label: "Incauca" },
        { value: "levapan", label: "Levapan" },
        { value: "bimbo", label: "Bimbo" },
        { value: "generica", label: "Genérica / Otra" }
    ];

    const pageTitle = isReadOnly
        ? "Consultar Insumo"
        : isEditing
        ? "Editar Insumo"
        : "Crear Insumo";

    return (
        <div className="max-w-7xl mx-auto my-8 p-8 bg-[var(--color-secondary-900)] rounded-lg border border-[var(--color-secondary-800)] shadow-md text-[var(--color-white)]">
            <h1 className="text-[length:var(--fs-md)] font-bold text-center mb-6 text-[var(--color-white)]">
                {pageTitle}
            </h1>
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
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 justify-center items-start">
                    <div className="w-full lg:w-48 flex flex-col items-center">
                        <FileInput 
                            className="flex items-center justify-center"
                            value={formInventory.userImage}
                            disabled={isReadOnly}
                            onChange={(files) => setInventory((prev) => ({ ...prev, userImage: files }))}
                            multiple={true}
                        />
                        <p className="text-center text-[var(--color-gray-300)] text-sm mt-2">
                            Código de barras / Imagen
                        </p>
                    </div>

                    <div className="flex-1 flex flex-col gap-1 w-full">
                        <Select
                            label="Proveedor"
                            name="inventorySupplierSelect"
                            htmlFor="supplier-select"
                            options={supplierOptions}
                            value={formInventory.inventorySupplierSelect}
                            onChange={handleChange}
                            disabled={isReadOnly || loadingSuppliers}
                            error={errors.inventorySupplierSelect}
                        />
                        <Input
                            label="Nombre del insumo / producto"
                            name="inventoryProductName"
                            type="text"
                            value={formInventory.inventoryProductName}
                            placeholder="Ej: Lomo fino de res, Queso mozzarella..."
                            htmlFor="inventory-product-name"
                            onChange={handleChange}
                            disabled={isReadOnly}
                            error={errors.inventoryProductName}
                        />
                        <Input
                            label="Cuentadante / Responsable"
                            name="inventoryProductAccountant"
                            type="text"
                            value={formInventory.inventoryProductAccountant}
                            placeholder="Cuentadante"
                            htmlFor="inventory-product-accountant"
                            onChange={handleChange}
                            disabled={isReadOnly}
                            error={errors.inventoryProductAccountant}
                        />
                        <Input
                            label="Descripción"
                            name="inventoryProductDescription"
                            type="text"
                            value={formInventory.inventoryProductDescription}
                            placeholder="Ingrese la descripción del insumo"
                            htmlFor="inventory-product-description"
                            onChange={handleChange}
                            disabled={isReadOnly}
                            error={errors.inventoryProductDescription}
                        />
                        <Input
                            label="Ubicación"
                            name="inventoryProductLocation"
                            type="text"
                            value={formInventory.inventoryProductLocation}
                            placeholder="Ej: Cuarto frío 1, Bodega seca..."
                            htmlFor="inventory-product-location"
                            onChange={handleChange}
                            disabled={isReadOnly}
                            error={errors.inventoryProductLocation}
                        />
                    </div>
            
                    <div className="flex-1 flex flex-col gap-1 w-full">
                        <Select
                            label="Marca del producto"
                            name="productBrandSelect"
                            htmlFor="product-brand-select"
                            options={brandOptions}
                            value={formInventory.productBrandSelect}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            error={errors.productBrandSelect}
                        />
                        <div className="relative">
                            <Input
                                label="Número Lote (Trazabilidad)"
                                name="numberBatch"
                                type="text"
                                value={formInventory.numberBatch}
                                placeholder="Lote (ej. LT-001)"
                                htmlFor="number-batch"
                                onChange={handleChange}
                                disabled={isEditing || isReadOnly}
                                error={errors.numberBatch}
                            />
                            {isEditing && (
                                <span className="text-[10px] text-[var(--color-warning)] block -mt-1 mb-2">
                                    * El lote queda bloqueado por trazabilidad según norma RFADMIN11.
                                </span>
                            )}
                        </div>
                        <Input
                            label="Stock Actual"
                            name="initialStock"
                            type="number"
                            value={formInventory.initialStock}
                            placeholder="Cantidad en almacén"
                            htmlFor="initial-stock"
                            onChange={handleChange}
                            disabled={isReadOnly}
                            error={errors.initialStock}
                        />
                        <Input
                            label="Stock Mínimo (Alerta)"
                            name="minAmount"
                            type="number"
                            value={formInventory.minAmount}
                            placeholder="Mínimo permitido"
                            htmlFor="min-amount"
                            onChange={handleChange}
                            disabled={isReadOnly}
                            error={errors.minAmount}
                        />
                        <Input
                            label="Precio de Compra (COP)"
                            name="priceBuy"
                            type="number"
                            value={formInventory.priceBuy}
                            placeholder="Costo unitario de compra"
                            htmlFor="price-buy"
                            onChange={handleChange}
                            disabled={isReadOnly}
                            error={errors.priceBuy}
                        />
                    </div>

                    <div className="flex-1 flex flex-col gap-1 w-full">
                        <Input
                            label="Fecha de vencimiento"
                            name="expirationDate"
                            type="text"
                            value={formInventory.expirationDate}
                            placeholder="AAAA-MM-DD"
                            htmlFor="expiration-date"
                            onChange={handleChange}
                            disabled={isReadOnly}
                            error={errors.expirationDate}
                        />
                    </div>
                </div>

                <div className="w-full flex justify-center mt-12 gap-4">
                    <Link to="/inventoryList">
                        <Button
                            variant="secondary"
                            size="md"
                            type="button"
                            disabled={submitting}
                        >
                            {isReadOnly ? "Volver al Listado" : "Cancelar"}
                        </Button>
                    </Link>
                    {!isReadOnly && (
                        <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? "Guardando..." : isEditing ? "Guardar Cambios" : "Confirmar Información"}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
