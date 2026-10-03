import { StatusSwitch } from "@/shared";
import ProductRowActions from "../components/ProductRowActions";
import { showSuccessAlert } from "@/shared/services/alertService";

export const productColumns = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "title",
    header: "Producto", 
  },
  {
    accessorKey: "category",
    header: "Categoría",
  },
  {
    accessorKey: "price",
    header: "Precio",
    cell: ({ row }) => {
      const product = row.original;
      return `$${Number(product.price || 0).toLocaleString("es-CO")}`;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const product = row.original;
      const isChecked = product.status !== "Inactivo" && product.status !== "inhabilitado";
      const handleChange = (newVal) => {
        product.status = newVal ? "Activo" : "Inactivo";
        showSuccessAlert("El menú ha sido actualizado correctamente");
      };

      return (
        <StatusSwitch
          checked={isChecked}
          onChange={handleChange}
        />
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "image",
    header: "Imagen",
    cell: ({ row }) => {
      const product = row.original;
      return <img src={product.image} alt={product.title} className="h-10 w-10 rounded object-cover" />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductRowActions product={row.original} />,
  },
];
