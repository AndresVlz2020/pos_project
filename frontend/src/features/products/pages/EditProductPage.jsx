import { Input, Button, Select, FileInput, showSuccessAlert, showErrorAlert } from "@/shared";
import { useState, useEffect, useMemo } from "react";
import { productSchema } from "../schemas/productSchema";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { updateProduct } from "../services/productServices";
import { getProductImage, imgPunta } from "@/utils/imageHelper";
import usePermission from "@/features/access/services/usePermission";

export default function EditProductPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { granted: canToggleStatus } = usePermission("disable_product");

  const productToEdit = useMemo(() => {
    if (location.state?.product) return location.state.product;
    try {
      return JSON.parse(sessionStorage.getItem("last_edited_product") || "null");
    } catch {
      return null;
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.product) {
      sessionStorage.setItem("last_edited_product", JSON.stringify(location.state.product));
    }
  }, [location.state]);

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      const categoryMapReverse = {
        entradas: "1",
        "platos fuertes": "2",
        bebidas: "3",
        postres: "4",
        guarniciones: "5",
        "comidas rápidas": "5",
      };

      const catKey = (productToEdit.category || productToEdit.category_name || "").toLowerCase();
      const catVal = categoryMapReverse[catKey] || "2";
      const parsedStock = Math.max(0, Math.trunc(Number(productToEdit.stock ?? 0)));

      Promise.resolve().then(() => {
        setProduct({
          productName: productToEdit.title || productToEdit.name || "",
          productPrice: String(productToEdit.price || ""),
          productStock: String(Number.isFinite(parsedStock) ? parsedStock : 0),
          productCategory: catVal,
          productDescription: productToEdit.description || "",
          productStatus: (productToEdit.is_active ?? (productToEdit.status === "Activo" || productToEdit.status === "disponible"))
            ? "habilitado"
            : "inhabilitado",
        });
      });
    }
  }, [productToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));

    setErrors((prevErrors) => {
      if (!prevErrors[name]) return prevErrors;
      const nextErrors = { ...prevErrors };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const categoryOptions = [
    { value: "1", label: "Entradas y Aperitivos" },
    { value: "2", label: "Platos Fuertes" },
    { value: "3", label: "Bebidas y Jugos" },
    { value: "4", label: "Postres" },
    { value: "5", label: "Comida Rápida y Adicionales" },
  ];

  const statusOptions = [
    { value: "habilitado", label: "Habilitado" },
    { value: "inhabilitado", label: "Inhabilitado" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const productId = productToEdit?.id;

      if (!productId) {
        throw new Error("No se identificó el ID del producto a modificar");
      }

      // Si se elige una imagen nueva, se envía el archivo real al backend para almacenarlo en uploads/
      const imageFile = userImage.length ? userImage[0] : undefined;

      const payload = {
        name: formProduct.productName,
        title: formProduct.productName,
        price: Number(formProduct.productPrice),
        stock: Math.max(0, Math.trunc(Number(formProduct.productStock))),
        category: selectedCat,
        description: formProduct.productDescription,
        ...(imageFile ? { imageFile } : {}),
      };

      if (canToggleStatus) {
        payload.status = formProduct.productStatus === "habilitado" ? "Activo" : "Inactivo";
        payload.isActive = formProduct.productStatus === "habilitado";
      }

      await updateProduct(productId, payload);

      sessionStorage.removeItem("last_edited_product");
      sessionStorage.removeItem("last_viewed_product");

      await showSuccessAlert({
        title: "Menú actualizado",
        text: "El platillo se ha actualizado correctamente en PostgreSQL.",
      });
      navigate("/productList");
    } catch (error) {
      console.error("Error al actualizar:", error);
      await showErrorAlert({
        title: "Error al actualizar",
        text: error.message || "No se pudo actualizar el producto en la base de datos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentImage = getProductImage({
    ...productToEdit,
    title: formProduct.productName || productToEdit?.title,
  });

  return (
    <div className="flex-1 flex flex-col w-full p-5 sm:p-8 bg-[var(--md-sys-color-surface-container-low)] rounded-2xl border border-[var(--md-sys-color-outline-variant)] m3-elevation-1 text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[var(--md-sys-color-outline-variant)]">
        <div>
          <h1 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
            Editar Producto
          </h1>
        </div>
        <Link to="/productList">
          <Button variant="outlined" size="md" leadingIcon="arrow_back">
            Volver al Menú
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Columna izquierda: foto única con '+' superpuesto para cambiarla */}
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
              existingImageUrl={currentImage}
              fallbackImageUrl={imgPunta}
              altText={formProduct.productName || "Platillo"}
            />
            {errors.userImage && (
              <span className="text-[var(--md-sys-color-error)] text-label-sm mt-2">{errors.userImage}</span>
            )}
          </div>

          {/* Campos */}
          <div className="md:col-span-8 xl:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Input
                label="Nombre del Platillo *"
                name="productName"
                type="text"
                value={formProduct.productName}
                placeholder="Ingrese el nombre del platillo"
                onChange={handleChange}
                error={errors.productName}
              />
            </div>
            <Input
              label="Precio (COP) *"
              name="productPrice"
              type="number"
              value={formProduct.productPrice}
              placeholder="Ingrese el precio del producto"
              onChange={handleChange}
              error={errors.productPrice}
            />
            <Input
              label="Stock disponible *"
              name="productStock"
              type="number"
              min="0"
              step="1"
              value={formProduct.productStock}
              placeholder="Ej: 20"
              onChange={handleChange}
              error={errors.productStock}
            />
            <Select
              label="Categoría *"
              name="productCategory"
              options={categoryOptions}
              value={formProduct.productCategory}
              onChange={handleChange}
              error={errors.productCategory}
            />
            <Select
              label="Estado *"
              name="productStatus"
              options={statusOptions}
              value={formProduct.productStatus}
              onChange={handleChange}
              disabled={!canToggleStatus}
              error={errors.productStatus}
            />
            <div className="md:col-span-2">
              <Input
                label="Descripción"
                name="productDescription"
                type="text"
                value={formProduct.productDescription}
                placeholder="Ingrese la descripción del producto"
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
            {loading ? "Actualizando en BD..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
