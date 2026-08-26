import ProductRowActions from "../components/ProductRowActions";

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
      return `$${product.price.toLocaleString()}`;
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
      return <img src={product.image} alt={product.title} className="h-10 w-10 rounded object-contain" />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductRowActions product={row.original} />,
  },
];
