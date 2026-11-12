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
            className="size-8 rounded-lg object-cover border border-[var(--color-secondary-700)] shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="font-medium text-[var(--color-white)] text-sm">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "supplierEmail",
    header: "Email",
    cell: ({ row }) => {
      const s = row.original;
      return <span className="text-xs text-[var(--color-gray-300)]">{s.supplierEmail || s.email || "—"}</span>;
    },
  },
  {
    accessorKey: "supplierPhone",
    header: "Teléfono",
    cell: ({ row }) => {
      const s = row.original;
      return <span className="text-xs font-mono text-[var(--color-gray-300)]">{s.supplierPhone || s.phone || "—"}</span>;
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
