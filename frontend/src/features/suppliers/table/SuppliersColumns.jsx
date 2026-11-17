import { StatusSwitch } from "@/shared";
import SuppliersRowActions from "../components/SuppliersRowActions";
import { getSupplierImage } from "@/utils/imageHelper";

export const getSuppliersColumns = ({ onRequestStatusChange, canToggleStatus = false, canEdit = true } = {}) => [
  {
    accessorKey: "nit",
    header: "NIT",
    cell: ({ row }) => {
      const s = row.original;
      return <span className="font-mono text-xs">{s.nit || s.id || "—"}</span>;
    },
  },
  {
    accessorKey: "companyName",
    header: "Compañía",
    cell: ({ row }) => {
      const supplier = row.original;
      const { image: logoSrc } = getSupplierImage(supplier);
      const name = supplier.companyName || supplier.company_name || supplier.name || "—";
      return (
        <div className="flex items-center gap-3">
          <img
            src={logoSrc}
            alt={name}
            className="size-8 rounded-lg object-cover border border-[var(--md-sys-color-outline-variant)] shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="font-medium text-[var(--md-sys-color-on-surface)] text-body-md">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "supplierEmail",
    header: "Email",
    cell: ({ row }) => {
      const s = row.original;
      return <span className="text-body-sm text-[var(--md-sys-color-on-surface-variant)]">{s.supplierEmail || s.email || "—"}</span>;
    },
  },
  {
    accessorKey: "supplierPhone",
    header: "Teléfono",
    cell: ({ row }) => {
      const s = row.original;
      return <span className="text-label-md font-mono text-[var(--md-sys-color-on-surface-variant)]">{s.supplierPhone || s.phone || "—"}</span>;
    },
  },
  // Columna Estado (activo / inactivo)
  {
    accessorKey: "is_active",
    header: "Estado",
    cell: ({ row }) => {
      const supplier = row.original;
      const isActiveValue = supplier.isActive ?? supplier.is_active ?? false;
      return (
        <StatusSwitch
          checked={Boolean(isActiveValue)}
          disabled={!canToggleStatus}
          onChange={(value) => {
            if (canToggleStatus && onRequestStatusChange) {
              onRequestStatusChange(supplier, value);
            }
          }}
        />
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <SuppliersRowActions supplier={row.original} canEdit={canEdit} />,
  },
];
