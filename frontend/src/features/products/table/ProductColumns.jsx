import { StatusSwitch } from "@/shared";
import ProductRowActions from "../components/ProductRowActions";
import { updateProductStatus } from "../services/productServices";
import { showSuccessAlert, showErrorAlert } from "@/shared/services/alertService";
import { getProductImage, imgPunta } from "@/utils/imageHelper";

export const getProductColumns = ({ onRequestStatusChange, canToggleStatus = false, canEdit = true } = {}) => [
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ row }) => (
      <span className="font-mono text-label-md text-[var(--md-sys-color-primary)]">
        {row.original.code || `PRD-${row.original.id}`}
      </span>
    ),
  },
  {
    accessorKey: "title",
    header: "Producto",
    cell: ({ row }) => {
      const product = row.original;
      const title = product.title || product.name || "";
      const imgSrc = getProductImage(product);
      return (
        <div className="flex items-center gap-3">
          <img
            src={imgSrc}
            alt={title}
            className="size-9 rounded-lg object-cover border border-[var(--md-sys-color-outline-variant)] shrink-0 m3-elevation-1"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = imgPunta;
            }}
          />
          <span className="font-medium text-[var(--md-sys-color-on-surface)] text-body-md">{title}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Categoría",
    cell: ({ row }) => (
      <span className="text-body-sm text-[var(--md-sys-color-on-surface-variant)] capitalize">
        {row.original.category || row.original.category_name || "General"}
      </span>
    ),
  },
  {
    accessorKey: "price",
    header: "Precio",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <span className="font-semibold text-body-md text-[var(--md-sys-color-on-surface)] tabular-nums">
          ${Number(product.price || 0).toLocaleString("es-CO")}
        </span>
      );
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => (
      <span className="font-mono text-label-md text-[var(--md-sys-color-on-surface)] tabular-nums">
        {Math.trunc(Number(row.original.stock ?? 0))}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const product = row.original;
      const isChecked = product.is_active ?? (product.status === "Activo" || product.status === "disponible");

      const handleChange = (newVal) => {
        if (onRequestStatusChange) {
          onRequestStatusChange(product, newVal);
        }
      };

      return (
        <StatusSwitch
          checked={Boolean(isChecked)}
          onChange={handleChange}
          disabled={!canToggleStatus}
        />
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => (
      <span className="text-body-sm text-[var(--md-sys-color-on-surface-variant)] line-clamp-1 max-w-[240px]">
        {row.original.description || "—"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductRowActions product={row.original} canEdit={canEdit} />,
  },
];

export const productColumns = getProductColumns();
