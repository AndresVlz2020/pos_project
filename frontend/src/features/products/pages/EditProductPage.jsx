import { Input, Button, Select, FileInput, showSuccessAlert, showErrorAlert } from "@/shared";
import { useState, useEffect } from "react";
import { productSchema } from "../schemas/productSchema";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { updateProduct } from "../services/productServices";
import { getProductImage, imgPunta } from "@/utils/imageHelper";
import resizeImageFile from "@/utils/imageFile";
import usePermission from "@/features/access/services/usePermission";

export default function EditProductPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { granted: canToggleStatus } = usePermission("disable_product");

  const productToEdit =
    location.state?.product ||
    (() => {
      try {
        return JSON.parse(sessionStorage.getItem("last_edited_product") || "null");
      } catch {
        return null;
      }
    })();

  useEffect(() => {
    if (location.state?.product) {
      sessionStorage.setItem("last_edited_product", JSON.stringify(location.state.product));
    }
  }, [location.state]);

  const [formProduct, setProduct] = useState({
    productName: "",
    productPrice: "",
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

      setProduct({
        productName: productToEdit.title || productToEdit.name || "",
        productPrice: String(productToEdit.price || ""),
        productCategory: catVal,
        productDescription: productToEdit.description || "",
        productStatus: (productToEdit.is_active ?? (productToEdit.status === "Activo" || productToEdit.status === "disponible"))
          ? "habilitado"
          : "inhabilitado",
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

      // Si se elige una imagen nueva, se redimensiona y se envía (si no, queda la actual)
      let imageUrl;
      if (userImage.length) {
        imageUrl = await resizeImageFile(userImage[0]);
      }

      const payload = {
        name: formProduct.productName,
        title: formProduct.productName,
        price: Number(formProduct.productPrice),
        category: selectedCat,
        description: formProduct.productDescription,
        imageUrl,
      };

      if (canToggleStatus) {
        payload.status = formProduct.productStatus === "habilitado" ? "Activo" : "Inactivo";
        payload.isActive = formProduct.productStatus === "habilitado";
      }

      await updateProduct(productId, payload);

      sessionStorage.removeItem("last_edited_product");

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
    <div className="max-w-7xl mx-auto my-2 sm:my-8 p-4 sm:p-8 bg-[var(--color-secondary-900)] rounded-lg border border-[var(--color-secondary-800)] shadow-md text-[var(--color-white)] font-[family-name:var(--main-font)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b border-[var(--color-secondary-800)]">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-white)]">Editar Producto</h1>
        </div>
        <Link to="/productList">
          <Button variant="secondary" size="sm">
            Volver al Menú
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Columna izquierda: foto actual + carga (mismo patrón que usuarios) */}
          <div className="col-span-1 flex flex-col items-center">
            <span className="text-center mb-2 text-[var(--color-gray-300)] text-sm font-medium">Foto actual</span>
            <div className="w-40 h-40 rounded-xl overflow-hidden border border-[var(--color-secondary-800)] bg-[var(--color-secondary-950)]">
              <img
                src={currentImage}
                alt={formProduct.productName || "Platillo"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = imgPunta;
                }}
              />
            </div>
            <span className="text-center mt-3 mb-2 text-[var(--color-gray-300)] text-sm font-medium">Cargar Imagen</span>
            <div className="w-full h-52 md:h-56 rounded-xl bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] flex flex-col items-center justify-center text-[var(--color-white)] place-items-center">
              <FileInput
                className="flex items-center justify-center"
                value={userImage}
                onChange={setUserImage}
                multiple={false}
                accept="image/jpeg,image/png,image/webp"
              />
            </div>
          </div>

          {/* Campos */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre del Platillo *"
              name="productName"
              type="text"
              value={formProduct.productName}
              placeholder="Ingrese el nombre del platillo"
              onChange={handleChange}
              error={errors.productName}
            />
            <Input
              label="Precio (COP) *"
              name="productPrice"
              type="number"
              value={formProduct.productPrice}
              placeholder="Ingrese el precio del producto"
              onChange={handleChange}
              error={errors.productPrice}
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

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-secondary-800)]">
          <Link to="/productList">
            <Button variant="secondary" type="button" disabled={loading}>
              Cancelar
            </Button>
          </Link>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Actualizando en BD..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
