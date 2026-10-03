import { Input, Button, FileInput, Select, Alert, showSuccessAlert, showErrorAlert } from "@/shared";
import { useState, useEffect } from "react";
import { inventorySchema } from "../schemas/inventorySchema";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { suppliers } from "@/features/suppliers/data/suppliers";

export default function CreateInventory() {
    const navigate = useNavigate();
    const location = useLocation();

    const editItem = location.state?.item || null;
    const isReadOnly = Boolean(location.state?.readOnly);
    const isEditing = Boolean(editItem && !isReadOnly);

    const [formInventory, setInventory] = useState({
        inventorySupplierSelect: editItem?.supplier || "",
        inventoryProductName: editItem?.productName || "",
        inventoryProductAccountant: editItem?.id || "",
        inventoryProductDescription: editItem?.description || "Insumo de inventario gastronómico",
        inventoryProductLocation: editItem?.location || "Almacén Central / Bodega",
        productBrandSelect: editItem?.brand ? editItem.brand.toLowerCase() : "",
        numberBatch: editItem ? `LT-${editItem.id?.replace(/\D/g, "") || "001"}` : "",
        initialStock: editItem?.currentStock ? String(editItem.currentStock) : "",
        minAmount: editItem?.minStock ? String(editItem.minStock) : "",
        priceBuy: editItem?.priceBuy ? String(editItem.priceBuy) : "45000",
        expirationDate: editItem?.lastUpdated || "2026-12-31",
    });

    const [errors, setErrors] = useState({});
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        if (editItem) {
            setInventory({
                inventorySupplierSelect: editItem.supplier || "",
                inventoryProductName: editItem.productName || "",
                inventoryProductAccountant: editItem.id || "",
                inventoryProductDescription: editItem.description || "Insumo de inventario gastronómico",
                inventoryProductLocation: editItem.location || "Almacén Central / Bodega",
                productBrandSelect: editItem.brand ? editItem.brand.toLowerCase() : "",
                numberBatch: `LT-${editItem.id?.replace(/\D/g, "") || "001"}`,
                initialStock: editItem.currentStock !== undefined ? String(editItem.currentStock) : "",
                minAmount: editItem.minStock !== undefined ? String(editItem.minStock) : "",
                priceBuy: editItem.priceBuy !== undefined ? String(editItem.priceBuy) : "45000",
                expirationDate: editItem.lastUpdated || "2026-12-31",
            });
        }
    }, [editItem]);

    const handleChange = (e) => {
        if (isReadOnly) return;
        const{name, value} = e.target;
        setInventory((prev) => ({ ...prev, [name]: value}));

        // Limpiar el error del campo si existe
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

        if(!result.success){
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }
        
        setErrors({});

        // Regla RFADMIN17: Impide asociar nuevos productos a proveedores inhabilitados
        const selectedSupplier = suppliers.find(
            (s) => s.id === formInventory.inventorySupplierSelect || s.companyName === formInventory.inventorySupplierSelect
        );
        if (selectedSupplier && selectedSupplier.isActive === false) {
            await showErrorAlert({
                title: "Proveedor inhabilitado",
                text: `El proveedor "${selectedSupplier.companyName}" está inhabilitado. No se pueden asociar insumos a un proveedor inactivo.`
            });
            return;
        }

        // Validar código o lote duplicado sólo si es creación nueva
        if (!isEditing && (formInventory.numberBatch === "LT-001" || formInventory.inventoryProductAccountant === "001")) {
            await showErrorAlert({
                title: "Registro duplicado",
                text: "Ya existe un insumo registrado con este código o número de lote."
            });
            return;
        }

        await showSuccessAlert({
            title: isEditing ? "Inventario actualizado" : "Inventario registrado",
            text: isEditing 
                ? "El insumo ha sido actualizado correctamente."
                : "Insumo registrado correctamente en el inventario."
        });

        navigate("/inventoryList");
    };


    const supplierOptions = [
        { value: "900.123.456-1", label: "Distribuidora Lácteos del Campo S.A.S." },
        { value: "890.987.654-3", label: "Avícola y Carnes del Valle S.A." },
        { value: "901.456.789-0", label: "Empaques Bio & Eco Gastronomía" },
        { value: "800.555.444-2", label: "Comercializadora Fruver Central" },
        { value: "900.777.888-5", label: "Distribuciones de Café & Bebidas S.A.S." },
        { value: "901.222.333-8", label: "Pescadería y Mariscos del Pacífico" },
        { value: "830.111.999-4", label: "Importadora de Licores & Vinos El Prado" },
        { value: "891.333.222-7", label: "Procesadora de Carnes Frías y Embutidos" },
        { value: "900.888.111-9", label: "Productos de Limpieza e Higiene Industrial" },
        { value: "901.666.555-2", label: "Dotaciones y Chef Uniforms Alfa" },
        { value: "800.444.777-1", label: "Panificadora e Insumos de Repostería" },
        { value: "900.333.666-0", label: "Conservas y Salsas Gourmet S.A.S." },
        { value: "901.999.888-6", label: "Congelados y Pulpas de Fruta Andina" },
        { value: "890.222.111-5", label: "Gas e Insumos de Cocina Industrial" },
        { value: "800.999.000-3", label: "Suministros de Cristalería y Menaje S.A." },
        { value: "900.555.222-4", label: "Distribuidora de Aceites y Grasas" },
        { value: "901.777.333-1", label: "Hortalizas y Verduras Hidropónicas" },
        { value: "890.555.666-8", label: "Distribución de Cervezas Artesanales" },
        { value: "900.444.111-2", label: "Sistemas de Fumigación y Control de Plagas" },
        { value: "901.111.444-9", label: "Especias y Condimentos del Mundo" },
        { value: "830.888.444-6", label: "Lácteos y Quesos Madurados Ltda." },
        { value: "900.222.999-0", label: "Servicios de Re refrigeración y Neveras" },
        { value: "891.777.444-3", label: "Muebles y Barras para Restaurantes" },
        { value: "901.333.111-7", label: "Importadora de Arroz y Granos Especiales" },
        { value: "800.111.222-5", label: "Comercializadora de Hielo y Agua Brisa" },
        { value: "900.666.333-8", label: "Imprenta de Menús y Publicidad Pop" },
        { value: "901.888.555-4", label: "Avícola San Fernando (Huevos y Pollo)" },
        { value: "890.444.888-1", label: "Insumos para Coctelería y Jarabes" },
        { value: "900.999.444-3", label: "Distribuidora de Harinas y Levaduras" },
        { value: "901.555.999-2", label: "Servicios de Mantenimiento de Estufas" }
    ];

    const brandOptions = [
        { value: "alpina", label: "Alpina" },
        { value: "alqueria", label: "Alquería" },
        { value: "colanta", label: "Colanta" },
        { value: "zenu", label: "Zenú" },
        { value: "frisby", label: "Frisby" },
        { value: "frixion", label: "Diana" },
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
        { value: "remington", label: "San Fernando" },
        { value: "BIMBO", label: "Bimbo" },
        { value: "coreanita", label: "La Caleñita" },
        { value: "del-campo", label: "Lácteos del Campo" },
        { value: "alpina-pro", label: "Alpina Professional" },
        { value: "halls", label: "Halls" },
        { value: "other", label: "Genérica / Otra" }
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

                <div className="
                        flex 
                        flex-col lg:flex-row
                        gap-8 lg:gap-12
                        justify-center
                        items-start
                    "
                >
                    <div className="w-full lg:w-48 flex flex-col items-center">
                        <FileInput className="flex items-center justify-center"
                        value={formInventory.userImage}
                        disabled={isReadOnly}
                        onChange={(files) => 
                            setInventory((prev) => ({ ...prev, userImage: files}))
                        }
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
                            disabled={isReadOnly}
                            error={errors.inventorySupplierSelect}
                        />
                        <Input
                            label="Nombre del producto"
                            name="inventoryProductName"
                            type="text"
                            value={formInventory.inventoryProductName}
                            placeholder="Ingrese el nombre del producto"
                            htmlFor="inventory-product-name"
                            onChange={handleChange}
                            disabled={isReadOnly}
                            error={errors.inventoryProductName}
                        />
                        <Input
                            label="Cuentadante"
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
                            placeholder="Ingrese la descripción del producto"
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
                            placeholder="Ingrese la ubicación"
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
                                label="Número Lote (No editable en insumos existentes)"
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
                                <span className="text-[10px] text-amber-400 block -mt-1 mb-2">
                                    * El lote queda bloqueado por trazabilidad según norma RFADMIN11.
                                </span>
                            )}
                        </div>
                        <Input
                            label="Stock Inicial"
                            name="initialStock"
                            type="text"
                            value={formInventory.initialStock}
                            placeholder="Cantidad Inicial"
                            htmlFor="initial-stock"
                            onChange={handleChange}
                            disabled={isReadOnly}
                            error={errors.initialStock}
                        />
                        <Input
                            label="Cantidad Mínima"
                            name="minAmount"
                            type="text"
                            value={formInventory.minAmount}
                            placeholder="Mínima cantidad"
                            htmlFor="min-amount"
                            onChange={handleChange}
                            disabled={isReadOnly}
                            error={errors.minAmount}
                        />
                        <Input
                            label="Valor de la compra"
                            name="priceBuy"
                            type="text"
                            value={formInventory.priceBuy}
                            placeholder="Ingrese el valor de la compra"
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
                        >
                            {isReadOnly ? "Volver al Listado" : "Cancelar"}
                        </Button>
                    </Link>
                    {!isReadOnly && (
                        <Button
                            variant="primary"
                            size="md"
                            type="submit"
                        >
                            {isEditing ? "Guardar Cambios" : "Confirmar Información"}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}