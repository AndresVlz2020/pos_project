import { M3Icon } from "@/shared";

export const POS_CATEGORIES = [
  { id: "all", label: "Todos", icon: "grid_view" },
  { id: "platos fuertes", label: "Parrilla / Platos Fuertes", icon: "local_fire_department" },
  { id: "entradas", label: "Entradas & Para Compartir", icon: "dining" },
  { id: "bebidas", label: "Bebidas & Coctelería", icon: "local_bar" },
  { id: "postres", label: "Postres", icon: "cake" },
  { id: "guarniciones", label: "Guarniciones", icon: "layers" },
];

export default function PosCategoryFilter({
  selectedCategory,
  onSelectCategory,
  products = [],
}) {
  const getCount = (categoryId) => {
    if (categoryId === "all") return products.length;
    return products.filter(
      (p) => p.category?.toLowerCase() === categoryId.toLowerCase()
    ).length;
  };

  return (
    <div className="flex flex-nowrap lg:flex-wrap items-center gap-2 w-full min-w-0 overflow-x-auto lg:overflow-visible scrollbar-none overscroll-x-contain py-0.5">
      {POS_CATEGORIES.map((cat) => {
        const count = getCount(cat.id);
        const isActive = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`
              m3-state shrink-0 inline-flex items-center gap-2 min-h-[40px] px-3.5 py-1.5 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]
              ${
                isActive
                  ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border border-transparent"
                  : "bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)] hover:text-[var(--md-sys-color-on-surface)]"
              }
            `}
          >
            <M3Icon
              name={isActive ? "check" : cat.icon}
              size={18}
              className={
                isActive
                  ? "text-[var(--md-sys-color-on-secondary-container)]"
                  : "text-[var(--md-sys-color-primary)]"
              }
            />
            <span>{cat.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium tabular-nums ${
                isActive
                  ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
                  : "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
