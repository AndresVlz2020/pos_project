import { Input, Select, Button } from "@/shared";
import ImgUpload from "@/assets/icons/upload.png";
import ImgUploadBar from "@/assets/icons/upload-bar.png";
import logoDPiero from "@/assets/images/logo-d,piero.png";
import { useState } from "react";
import { userSchema } from "../users/schemas/userSchema";

export default function CreateProduct() {
    const [formProduct, setProducts] = useState({
        productId: "",
        productStatus: "",
        productName: "",
        productAccountant: "",
        productDescription: "",
        productLocation: "",
        personalEmail: "",
        numberBatch: "",
        maxAmount: "",
        minAmount: "",
        priceBuy: "",
        priceSell: "",
        priceBatch: "",
        expirationDate: "",
    });

    const [errors, setErrors] = useState({});

    const statusOptions = [
        { value: "good", label: "Excelente Estado" },
        { value: "normal", label: "Estado Aceptable" },
        { value: "bad", label: "Mal Estado" },
    ];

    const handleChange = (e) => {
        const{name, value} = e.target;
        setProducts((prev) => ({ ...prev, [name]: value}));

        // Limpiar el error del campo si existe
        setErrors((prevErrors) => {
            if (!prevErrors[name]) return prevErrors;
            const { [name]: _, ...rest } = prevErrors;
            return rest;
        });
    };


    const handleSubmit = async (e) => { 
        e.preventDefault();

        const result = userSchema.safeParse(formProduct);


        if(!result.success){
            const alias = {
              userName: "productName",
              userEmail: "personalEmail",
              userPhone: "contactPhone",
              userDocumentNumber: "productId",
            };
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                const src = issue.path[0];
                const msg = issue.message;
                const key = alias[src];
                if (key) fieldErrors[key] = msg;
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


    return (
        <div className="h-full bg-white min-h-screen">
            <div className="
                    w-full bg-[var(--color-primary-950)] text-[var(--color-text-inverse)]
                "
            >
                <div className=
                        "max-w-7xl mx-auto px-6 py-4 flex items-center gap-4"
                >
                    <button type="
                                button
                            "
                            className="
                                px-3 py-1 rounded-md border border-[var(--color-text-inverse)] text-[var(--color-text-inverse)]"
                    >
                        ←
                    </button>
                    <h1 className="
                            text-2xl font-bold
                        "
                    >
                        Crear Producto
                    </h1>
                    <img src={logoDPiero} alt="Logo" className="h-8 w-auto" />
                </div>
            </div>
            <div className="
                    flex 
                    gap-24
                    mt-22
                    h-full
                    justify-center
                "
            >
                <div className="w-40 mt-8 gap-200">
                    <img ImgUpload
                        src={ImgUpload} 
                        alt="image-icon"
                        className="
                            h-40
                            w-50
                        "
                    />
                    <p className="
                        text-center
                    ">
                        Suba un Archivo
                    </p>
                    <img ImgUploadBar
                        src={ImgUploadBar} 
                        alt="upload-bar"
                        className="
                            h-40
                            w-50
                        "
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
                    <Input
                        label="ID"
                        name="productId"
                        type="text"
                        value={formProduct.productId}
                        placeholder="Ingrese el ID del producto"
                        htmlFor="product-id"
                        onChange={handleChange}
                        error={errors.productId}
                    />
                    <Select
                        label="Estado del producto"
                        name="productStatus"
                        value={formProduct.productStatus}
                        placeholder="Seleccione el estado del producto"
                        htmlFor="product-status"
                        options={statusOptions}
                        onChange={handleChange}
                        error={errors.productStatus}
                    />
                    <Input
                        label="Nombre del producto"
                        name="productName"
                        type="text"
                        value={formProduct.productName}
                        placeholder="Ingrese el nombre del producto"
                        htmlFor="product-name"
                        onChange={handleChange}
                        error={errors.productName}
                    />
                    <Input
                        label="Cuentandante"
                        name="productAccountant"
                        type="text"
                        value={formProduct.productAccountant}
                        placeholder="Cuentandante"
                        htmlFor="product-accountant"
                        onChange={handleChange}
                        error={errors.productAccountant}
                    />
                    <Input
                        label="Descripcion"
                        name="productDescription"
                        type="text"
                        value={formProduct.productDescription}
                        placeholder="Ingrese la descripcion del producto"
                        htmlFor="product-description"
                        onChange={handleChange}
                        error={errors.productDescription}
                    />
                    <Input
                        label="Ubicacion"
                        name="productLocation"
                        type="text"
                        value={formProduct.productLocation}
                        placeholder="Ingrese la ubicacion"
                        htmlFor="product-location"
                        onChange={handleChange}
                        error={errors.productLocation}
                    />
                </form>
        
                <form action="" onSubmit={handleSubmit}>
                    <Input
                        label="Numero Lote"
                        name="numberBatch"
                        type="text"
                        value={formProduct.numberBatch}
                        placeholder="Lote"
                        htmlFor="number-batch"
                        onChange={handleChange}
                        error={errors.numberBatch}
                    />
                    <Input
                        label="Cantidad Maxima"
                        name="maxAmount"
                        type="text"
                        value={formProduct.maxAmount}
                        placeholder="Maxima cantidad"
                        htmlFor="max-amount"
                        onChange={handleChange}
                        error={errors.maxAmount}
                    />
                    <Input
                        label="Cantidad Minima"
                        name="minAmount"
                        type="text"
                        value={formProduct.minAmount}
                        placeholder="Minima cantidad"
                        htmlFor="min-amount"
                        onChange={handleChange}
                        error={errors.minAmount}
                    />
                    <Input
                        label="Valor de la compra"
                        name="priceBuy"
                        type="text"
                        value={formProduct.priceBuy}
                        placeholder="Ingrese el valor de la compra"
                        htmlFor="price-buy"
                        onChange={handleChange}
                        error={errors.priceBuy}
                    />
                    <Input
                        label="Valor de la venta"
                        name="priceSell"
                        type="text"
                        value={formProduct.priceSell}
                        placeholder="Ingrese el valor de la venta"
                        htmlFor="price-sell"
                        onChange={handleChange}
                        error={errors.priceSell}
                    />
                    <Input
                        label="Valor total del lote"
                        name="priceBatch"
                        type="text"
                        value={formProduct.priceBatch}
                        placeholder="Ingrese el valor del lote"
                        htmlFor="price-batch"
                        onChange={handleChange}
                        error={errors.priceBatch}
                    />
                </form>
                <form action="" onSubmit={handleSubmit}>
                    <Input
                        label="Fecha de vencimiento"
                        name="expirationDate"
                        type="text"
                        value={formProduct.expirationDate}
                        placeholder="Ingrese la fecha de vencimiento"
                        htmlFor="expiration-date"
                        onChange={handleChange}
                        error={errors.expirationDate}
                    />
                    <div className="w-full flex justify-center mt-12">
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
        </div>
    );
}