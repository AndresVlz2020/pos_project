import { Input, Button, Select, Alert, FileInput, showSuccessAlert, showErrorAlert } from "@/shared";
import { useState } from "react";
import { productSchema } from "../schemas/productSchema";
import { Link, useNavigate } from "react-router-dom";
import { createProduct } from "../services/productServices";
import resizeImageFile from "@/utils/imageFile";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [formProduct, setProduct] = useState({
    productName: "",
    productPrice: "",
    productCategory: "2",
    productDescription: "",
    productStatus: "habilitado",
  });

  const [userImage, setUserImage] = useState([]);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const result = productSchema.safeParse({
      ...formProduct,
      userImage: userImage.length ? userImage : undefined,
    });

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const categoryMap = {
        "1": "entradas",
        "2": "platos fuertes",
        "3": "bebidas",
        "4": "postres",
        "5": "guarniciones",
      };

      const selectedCat = categoryMap[formProduct.productCategory] || "platos fuertes";

      let imageUrl = null;
      if (userImage.length) {
        imageUrl = await resizeImageFile(userImage[0]);
      }

      await createProduct({
        name: formProduct.productName,
        title: formProduct.productName,
        price: Number(formProduct.productPrice),
        category: selectedCat,
        description: formProduct.productDescription,
        status: formProduct.productStatus === "habilitado" ? "Activo" : "Inactivo",
        isActive: formProduct.productStatus === "habilitado",
        imageUrl,
      });

      await showSuccessAlert({
        title: "Platillo creado",
        text: "Platillo registrado correctamente en PostgreSQL.",
      });

      navigate("/productList");
    } catch (err) {
      console.error("Error al registrar producto:", err);
      await showErrorAlert({
        title: "Error al registrar",
        text: err.message || "No se pudo guardar el producto en la base de datos",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-2 sm:my-8 p-4 sm:p-8 bg-[var(--color-secondary-900)] rounded-lg border border-[var(--color-secondary-800)] shadow-md text-[var(--color-white)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b border-[var(--color-secondary-800)]">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-white)]">Crear Platillo / Menú</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Columna izquierda: carga de imagen (mismo patrón que usuarios) */}
          <div className="col-span-1 flex flex-col items-center">
            <span className="text-center mb-2 text-[var(--color-gray-300)] text-sm font-medium">Cargar Imagen</span>
            <div className="w-full h-56 md:h-64 rounded-xl bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] flex flex-col items-center justify-center text-[var(--color-white)] place-items-center">
              <FileInput
                className="flex items-center justify-center"
                value={userImage}
                onChange={setUserImage}
                multiple={false}
                accept="image/jpeg,image/png,image/webp"
              />
            </div>
          </div>

          {/* Campos del formulario */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre del Platillo *"
              name="productName"
              placeholder="Ej: Churrasco 350g, Limonada de Coco..."
              value={formProduct.productName}
              onChange={handleChange}
              error={errors.productName}
            />

            <Input
              label="Precio (COP) *"
              name="productPrice"
              type="number"
              placeholder="Ej: 38000"
              value={formProduct.productPrice}
              onChange={handleChange}
              error={errors.productPrice}
            />

            <Select
              label="Categoría del Menú *"
              name="productCategory"
              value={formProduct.productCategory}
              onChange={handleChange}
              options={categoryOptions}
              error={errors.productCategory}
            />

            <Select
              label="Estado inicial *"
              name="productStatus"
              value={formProduct.productStatus}
              onChange={handleChange}
              options={statusOptions}
              error={errors.productStatus}
            />

            <div className="md:col-span-2">
              <Input
                label="Descripción del Platillo"
                name="productDescription"
                placeholder="Ingredientes, términos de carne, guarnición..."
                value={formProduct.productDescription}
                onChange={handleChange}
                error={errors.productDescription}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-secondary-800)]">
          <Link to="/productList">
            <Button variant="secondary" type="button" disabled={loading}>
              Cancelar
            </Button>
          </Link>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Guardando en BD..." : "Guardar Platillo"}
          </Button>
        </div>
      </form>
    </div>
  );
}
