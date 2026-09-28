import { Input, Button, FileInput, Select } from "@/shared";
import { useState } from "react";
import { inventorySchema } from "../inventory/schemas/inventorySchema";
import { Link } from "react-router-dom";

export default function CreateInventory() {
    const [formInventory, setInventory] = useState({
        inventorySupplierSelect: "",
        inventoryProductName: "",
        inventoryProductAccountant: "",
        inventoryProductDescription: "",
        inventoryProductLocation: "",
        productBrandSelect: "",
        numberBatch: "",
        initialStock: "",
        minAmount: "",
        priceBuy: "",
        expirationDate: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
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

        try {
          alert("Informacion Confirmada");
        } catch (error) {
          console.error("Error:", error.message);
          alert(error.message)
        }
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

    return (
        <div className="max-w-7xl mx-auto my-8 p-8 bg-[var(--color-primary-900)] rounded-lg border border-[var(--color-primary-800)] shadow-md text-[var(--color-white)]">
            <h1 className="text-[length:var(--fs-md)] font-bold text-center mb-8 text-[var(--color-white)]">Crear Inventario</h1>
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
                        onChange={(files) => 
                            setInventory((prev) => ({ ...prev, userImage: files}))
                        }
                        multiple={true}
                        />
                        <p className="text-center text-[var(--color-gray-300)] text-sm mt-2">
                            Suba un código de barras
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
                            error={errors.inventoryProductName}
                        />
                        <Input
                            label="Cuentadante"
                            name="inventoryProductAccountant"
                            type="text"
                            value={formInventory.inventoryProductAccountant}
                            placeholder="Cuentandante"
                            htmlFor="inventory-product-accountant"
                            onChange={handleChange}
                            error={errors.inventoryProductAccountant}
                        />
                        <Input
                            label="Descripcion"
                            name="inventoryProductDescription"
                            type="text"
                            value={formInventory.inventoryProductDescription}
                            placeholder="Ingrese la descripcion del producto"
                            htmlFor="inventory-product-description"
                            onChange={handleChange}
                            error={errors.inventoryProductDescription}
                        />
                        <Input
                            label="Ubicacion"
                            name="inventoryProductLocation"
                            type="text"
                            value={formInventory.inventoryProductLocation}
                            placeholder="Ingrese la ubicacion"
                            htmlFor="inventory-product-location"
                            onChange={handleChange}
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
                            error={errors.productBrandSelect}
                        />
                        <Input
                            label="Numero Lote"
                            name="numberBatch"
                            type="text"
                            value={formInventory.numberBatch}
                            placeholder="Lote"
                            htmlFor="number-batch"
                            onChange={handleChange}
                            error={errors.numberBatch}
                        />
                        <Input
                            label="Stock Inicial"
                            name="initialStock"
                            type="text"
                            value={formInventory.initialStock}
                            placeholder="Cantidad Inicial"
                            htmlFor="initial-stock"
                            onChange={handleChange}
                            error={errors.initialStock}
                        />
                        <Input
                            label="Cantidad Minima"
                            name="minAmount"
                            type="text"
                            value={formInventory.minAmount}
                            placeholder="Minima cantidad"
                            htmlFor="min-amount"
                            onChange={handleChange}
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
                            error={errors.priceBuy}
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-1 w-full">
                        <Input
                            label="Fecha de vencimiento"
                            name="expirationDate"
                            type="text"
                            value={formInventory.expirationDate}
                            placeholder="Ingrese la fecha de vencimiento"
                            htmlFor="expiration-date"
                            onChange={handleChange}
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
                            Cancelar
                        </Button>
                    </Link>
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
    );
}