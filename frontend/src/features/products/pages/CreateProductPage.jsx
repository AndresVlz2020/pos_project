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
    productStock: "0",
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
        stock: Math.max(0, Math.trunc(Number(formProduct.productStock))),
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
    <div className="flex-1 flex flex-col w-full p-5 sm:p-8 bg-[var(--md-sys-color-surface-container-low)] rounded-2xl border border-[var(--md-sys-color-outline-variant)] m3-elevation-1 text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[var(--md-sys-color-outline-variant)]">
        <div>
          <h1 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
            Crear Platillo / Menú
          </h1>
          <p className="text-body-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            Registra un nuevo producto en la carta gastronómica del punto de venta.
          </p>
        </div>
        <Link to="/productList">
          <Button variant="outlined" size="md" leadingIcon="arrow_back">
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

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Columna izquierda: carga de imagen */}
          <div className="md:col-span-4 xl:col-span-3 flex flex-col items-center p-5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]">
            <span className="text-center mb-3 text-[var(--md-sys-color-on-surface-variant)] text-label-lg font-medium">
              Imagen del Platillo
            </span>
            <FileInput
              value={userImage}
              onChange={setUserImage}
              multiple={false}
              maxFiles={1}
              accept="image/*"
              altText={formProduct.productName || "Nuevo platillo"}
            />
            {errors.userImage && (
              <span className="text-[var(--md-sys-color-error)] text-label-sm mt-2">{errors.userImage}</span>
            )}
          </div>

          {/* Campos del formulario */}
          <div className="md:col-span-8 xl:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Input
                label="Nombre del Platillo *"
                name="productName"
                placeholder="Ej: Churrasco 350g, Limonada de Coco..."
                value={formProduct.productName}
                onChange={handleChange}
                error={errors.productName}
              />
            </div>

            <Input
              label="Precio (COP) *"
              name="productPrice"
              type="number"
              placeholder="Ej: 38000"
              value={formProduct.productPrice}
              onChange={handleChange}
              error={errors.productPrice}
            />

            <Input
              label="Stock inicial *"
              name="productStock"
              type="number"
              min="0"
              step="1"
              placeholder="Ej: 20"
              value={formProduct.productStock}
              onChange={handleChange}
              error={errors.productStock}
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

        <div className="mt-auto flex justify-end gap-3 pt-5 border-t border-[var(--md-sys-color-outline-variant)]">
          <Link to="/productList">
            <Button variant="outlined" type="button" disabled={loading}>
              Cancelar
            </Button>
          </Link>
          <Button variant="filled" type="submit" leadingIcon="check_circle" disabled={loading}>
            {loading ? "Guardando en BD..." : "Guardar Platillo"}
          </Button>
        </div>
      </form>
    </div>
  );
}
