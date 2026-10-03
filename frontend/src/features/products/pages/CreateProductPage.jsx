import { Input, Button, FileInput, Select, Alert, showSuccessAlert, showErrorAlert } from "@/shared";

import { useState } from "react";
import { productSchema } from "../schemas/productSchema";
import { products } from "../data/products";
import { Link, useNavigate } from "react-router-dom";
import imgPunta from "@/assets/images/punta-de-anca-hd.jpg";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [formProduct, setProduct] = useState({
    productName: "",
    productPrice: "",
    productCategory: "",
    productDescription: "",
    productStatus: "habilitado",
    userImage: null,
  });

  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prevErrors) => {
        const nextErrors = { ...prevErrors };
        delete nextErrors[name];
        return nextErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const result = productSchema.safeParse(formProduct);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    // Validar platillos duplicados dentro de la misma categoría (RFADMIN20)
    const categoryName = categoryOptions.find(
      (c) => c.value === formProduct.productCategory
    )?.label || formProduct.productCategory;

    const isDuplicate = products.some(
      (p) =>
        p.title.trim().toLowerCase() === formProduct.productName.trim().toLowerCase() &&
        p.category.trim().toLowerCase() === categoryName.trim().toLowerCase()
    );

    if (isDuplicate) {
      showErrorAlert({
        title: "Platillo duplicado",
        text: `Ya existe un platillo registrado con el nombre "${formProduct.productName}" en la categoría "${categoryName}".`,
      });
      return;
    }

    await showSuccessAlert({
      title: "Platillo creado",
      text: "Platillo registrado correctamente en el menú.",
    });

    navigate("/productList");
  };


  const categoryOptions = [
    { value: "1", label: "Entradas y Aperitivos" },
    { value: "2", label: "Platos Fuertes" },
    { value: "3", label: "Bebidas y Jugos" },
    { value: "4", label: "Postres" },
    { value: "5", label: "Comida Rápida y Adicionales" },
  ];

  const statusOptions = [
    { value: "habilitado", label: "Habilitado (Disponible en venta)" },
    { value: "inhabilitado", label: "Inhabilitado (Excluido de órdenes)" },
  ];

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 sm:p-8 bg-[var(--color-secondary-900)] rounded-xl border border-[var(--color-secondary-800)] shadow-xl text-[var(--color-white)]">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-secondary-800)]">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-white)]">Crear Platillo / Menú</h1>
          <p className="text-xs text-[var(--color-gray-400)] mt-0.5">
            Registro de nuevos ítems con validación de categoría, precio y miniatura uniforme.
          </p>
        </div>
        <Link to="/productList">
          <Button variant="secondary" size="sm">
            Volver al Menú
          </Button>
        </Link>
      </div>

      {feedback && (
        <div className="mb-6">
          <Alert
            type={feedback.type}
            title={feedback.title}
            message={feedback.message}
            onClose={() => setFeedback(null)}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Carga de Imagen o Placeholder uniforme */}
          <div className="w-full md:w-56 flex flex-col items-center p-4 bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] rounded-xl">
            <FileInput
              value={formProduct.userImage}
              onChange={(files) =>
                setProduct((prev) => ({ ...prev, userImage: files }))
              }
              className="w-full flex justify-center"
            />
            <p className="text-center text-[var(--color-gray-400)] text-xs mt-3">
              Foto del platillo (PNG, JPG o WEBP). Si no adjunta imagen, se asignará un placeholder uniforme.
            </p>
          </div>

          {/* Campos del formulario */}
          <div className="flex-1 space-y-4 w-full">
            <Input
              label="Nombre del Platillo"
              name="productName"
              type="text"
              value={formProduct.productName}
              placeholder="Ej: Punta de Anca Angus 400g"
              htmlFor="product-name"
              onChange={handleChange}
              error={errors.productName}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Precio de Venta ($ COP)"
                name="productPrice"
                type="number"
                min="1"
                step="100"
                value={formProduct.productPrice}
                placeholder="Ej: 56000"
                htmlFor="product-price"
                onChange={handleChange}
                error={errors.productPrice}
              />

              <Select
                label="Categoría del Menú"
                name="productCategory"
                options={categoryOptions}
                value={formProduct.productCategory}
                onChange={handleChange}
                error={errors.productCategory}
              />
            </div>

            <Select
              label="Estado Operativo del Platillo"
              name="productStatus"
              options={statusOptions}
              value={formProduct.productStatus}
              onChange={handleChange}
              error={errors.productStatus}
            />

            <div>
              <label className="block text-xs font-semibold text-[var(--color-gray-300)] mb-1.5">
                Descripción del Platillo
              </label>
              <textarea
                name="productDescription"
                rows={3}
                value={formProduct.productDescription}
                onChange={handleChange}
                placeholder="Ingredientes, preparación, acompañamientos y gramaje..."
                className="w-full p-3 rounded-lg bg-[var(--color-secondary-950)] border border-[var(--color-secondary-700)] text-xs text-[var(--color-white)] focus:border-[var(--color-primary-500)] outline-none resize-none"
              />
              {errors.productDescription && (
                <p className="text-[11px] text-red-400 mt-1">{errors.productDescription}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-secondary-800)]">
          <Link to="/productList">
            <Button variant="secondary" size="md">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="md">
            Registrar Platillo
          </Button>
        </div>
      </form>
    </div>
  );
}