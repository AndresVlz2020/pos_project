import { Input, Button, FileInput, Select } from "@/shared";
import { useState } from "react";
import { productSchema } from "../products/schemas/productSchema";
import { Link } from "react-router-dom";

export default function CreateProduct() {
    const [formProduct, setProduct] = useState({
        productName: "",
        productPrice: "",
        productCategory: "",
        productDescription: "",
        productStatus: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const{name, value} = e.target;
        setProduct((prev) => ({ ...prev, [name]: value}));

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

        const result = productSchema.safeParse(formProduct);

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

    const categoryOptions = [
        { value: "1", label: "Entradas y Aperitivos" },
        { value: "2", label: "Platos Fuertes" },
        { value: "3", label: "Bebidas y Jugos" },
        { value: "4", label: "Postres" },
        { value: "5", label: "Comida Rápida y Adicionales" }
    ];

    const statusOptions = [
        { value: "habilitado", label: "Habilitado" },
        { value: "inhabilitado", label: "Inhabilitado" }
    ];
        return (
        <div className="max-w-7xl mx-auto my-8 p-8 bg-[var(--color-primary-900)] rounded-2xl border border-[var(--color-primary-800)] shadow-xl text-[var(--color-white)]">
            <h1 className="text-[length:var(--fs-md)] font-bold text-center mb-8 text-[var(--color-white)]">Crear Producto</h1>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row gap-8 md:gap-16 justify-center">
                    <div className="flex flex-col gap-3 flex-1 max-w-md">
                        <Input
                            label="Nombre del Platillo"
                            name="productName"
                            type="text"
                            value={formProduct.productName}
                            placeholder="Ingrese el nombre del platillo"
                            htmlFor="product-name"
                            onChange={handleChange}
                            error={errors.productName}
                        />
                        <Input
                            label="Precio"
                            name="productPrice"
                            type="text"
                            value={formProduct.productPrice}
                            placeholder="Ingrese el precio del producto"
                            htmlFor="product-price"
                            onChange={handleChange}
                            error={errors.productPrice}
                        />
                        <Select
                            label="Categoria"
                            name="productCategory"
                            htmlFor="product-category"
                            options={categoryOptions}
                            value={formProduct.productCategory}
                            onChange={handleChange}
                            error={errors.productCategory}
                        />
                    </div>
            
                    <div className="flex flex-col gap-3 flex-1 max-w-md">
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
                        <Select
                            label="Estado del producto"
                            name="productStatus"
                            htmlFor="product-status"
                            options={statusOptions}
                            value={formProduct.productStatus}
                            onChange={handleChange}
                            error={errors.productStatus}
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center mt-10 gap-12">
                    <div className="flex flex-col items-center">
                        <FileInput
                            className="flex items-center justify-center"
                            value={formProduct.userImage}
                            onChange={(files) => 
                                setProduct((prev) => ({ ...prev, userImage: files}))
                            }
                            multiple={true}
                        />
                        <p className="text-center text-[var(--color-gray-300)] text-sm mt-2">
                            Suba una imagen del platillo
                        </p>
                    </div>
                    <div className="flex gap-4 justify-center items-center">
                        <Link to="/productList">
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
                </div>
            </form>
        </div>
    );
}