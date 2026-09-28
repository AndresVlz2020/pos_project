import { Flame, UtensilsCrossed, Wine, CakeSlice, Layers, LayoutGrid } from "lucide-react";

export const POS_CATEGORIES = [
  { id: "all", label: "Todos", icon: LayoutGrid },
  { id: "platos fuertes", label: "Parrilla / Platos Fuertes", icon: Flame },
  { id: "entradas", label: "Entradas & Para Compartir", icon: UtensilsCrossed },
  { id: "bebidas", label: "Bebidas & Coctelería", icon: Wine },
  { id: "postres", label: "Postres", icon: CakeSlice },
  { id: "guarniciones", label: "Guarniciones", icon: Layers },
];

export default function PosCategoryFilter({ selectedCategory, onSelectCategory, products = [] }) {
  const getCount = (categoryId) => {
    if (categoryId === "all") return products.length;
    return products.filter(p => p.category?.toLowerCase() === categoryId.toLowerCase()).length;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {POS_CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const count = getCount(cat.id);
        const isActive = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`
              inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap
              ${isActive
                ? "bg-[var(--color-secondary-500)] text-[var(--color-white)] border border-[var(--color-secondary-600)] shadow-none"
                : "bg-[var(--color-primary-900)] text-[var(--color-gray-300)] hover:text-[var(--color-white)] hover:bg-[var(--color-primary-800)] border border-[var(--color-primary-800)]"
              }
            `}
          >
            <Icon className={`size-3.5 ${isActive ? "text-[var(--color-white)]" : "text-[var(--color-secondary-400)]"}`} />
            <span>{cat.label}</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
              isActive ? "bg-black/30 text-white" : "bg-[var(--color-primary-800)] text-[var(--color-gray-300)]"
            }`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
