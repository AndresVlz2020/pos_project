import { useState, useMemo } from "react";
import { SearchX, Filter, Check } from "lucide-react";
import {
  SearchField,
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared";
import PosCategoryFilter from "./PosCategoryFilter";
import PosProductCard from "./PosProductCard";

const SORT_OPTIONS = [
  { value: "default", label: "Por Defecto" },
  { value: "price-asc", label: "Menor Precio" },
  { value: "price-desc", label: "Mayor Precio" },
];

// Normaliza texto eliminando acentos y mayúsculas
const normalizeText = (text = "") =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export default function PosProductsSection({
  products = [],
  searchQuery = "",
  onSearchChange,
  onClearSearch,
  onSelectProduct,
}) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const filteredProducts = useMemo(() => {
    const query = normalizeText(searchQuery);

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        normalizeText(product.category) === normalizeText(selectedCategory);

      if (!matchesCategory) return false;
      if (!query) return true;

      const titleMatch = normalizeText(product.title).includes(query);
      const descMatch = normalizeText(product.description).includes(query);
      const catMatch = normalizeText(product.category).includes(query);

      return titleMatch || descMatch || catMatch;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });
  }, [products, searchQuery, selectedCategory, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    if (onClearSearch) onClearSearch();
  };

  return (
    <div className="space-y-3">
      {/* Barra de Búsqueda directa */}
      <div className="w-full">
        <SearchField
          value={searchQuery}
          onChange={onSearchChange}
          onSubmit={onSearchChange}
          onClear={onClearSearch}
          placeholder="Buscar por platillo, corte de carne, bebida o postre..."
          size="md"
          variant="dark"
          fullWidth={true}
          className="w-full border-[var(--color-secondary-700)] hover:border-[var(--color-primary-400)] shadow-none"
        />
      </div>

      {/* Fila única: componente Dropdown de ordenamiento + categorías en scroll horizontal */}
      <div className="flex items-start gap-2 w-full min-w-0">
        <Dropdown className="shrink-0">
          <DropdownTrigger>
            <button
              type="button"
              aria-label="Ordenar productos"
              title={
                SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label
                  ? `Orden: ${SORT_OPTIONS.find((opt) => opt.value === sortBy).label}`
                  : "Ordenar productos"
              }
              className={`size-10 inline-flex items-center justify-center rounded-full border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 transition-all cursor-pointer ${
                sortBy !== "default"
                  ? "bg-[var(--color-primary-500)] text-[var(--color-on-primary)] border-[var(--color-primary-600)]"
                  : "bg-[var(--color-secondary-900)] text-[var(--color-primary-400)] hover:text-[var(--color-white)] hover:bg-[var(--color-secondary-800)] border-[var(--color-secondary-800)]"
              }`}
            >
              <Filter className="size-4" />
            </button>
          </DropdownTrigger>

          <DropdownContent className="left-0 min-w-[192px]">
            <p className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-gray-400)]">
              Ordenar por
            </p>
            <div className="space-y-0.5 mt-0.5">
              {SORT_OPTIONS.map((option) => {
                const isSelected = sortBy === option.value;
                return (
                  <DropdownItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`flex items-center justify-between gap-2 text-xs sm:text-sm ${
                      isSelected
                        ? "bg-[var(--color-primary-500)]/15 text-[var(--color-primary-400)] font-semibold"
                        : ""
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="size-3.5 shrink-0" />}
                  </DropdownItem>
                );
              })}
            </div>
          </DropdownContent>
        </Dropdown>

        <div className="flex-1 min-w-0">
          <PosCategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            products={products}
          />
        </div>
      </div>

      {/* Indicador de Filtro o Búsqueda Activa */}
      {(searchQuery || selectedCategory !== "all") && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] text-xs">
          <span className="text-[var(--color-gray-300)]">
            Mostrando <strong className="text-[var(--color-white)] font-bold">{filteredProducts.length}</strong> productos
            {searchQuery && <> para <strong className="text-[var(--color-primary-300)] font-semibold">"{searchQuery}"</strong></>}
            {selectedCategory !== "all" && <> en categoría <strong className="text-[var(--color-primary-300)] font-semibold">"{selectedCategory}"</strong></>}
          </span>
          <button
            type="button"
            onClick={handleResetFilters}
            className="min-h-[40px] px-4 rounded-full text-sm text-[var(--color-primary-400)] hover:text-[var(--color-primary-300)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 cursor-pointer font-medium"
          >
            Restablecer filtros
          </button>
        </div>
      )}

      {/* Cuadrícula de Productos */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {filteredProducts.map((product) => (
            <PosProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        /* Estado vacío si no hay coincidencias */
        <div className="py-14 text-center max-w-md mx-auto">
          <div className="size-16 mx-auto rounded-2xl bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] flex items-center justify-center text-[var(--color-primary-400)] mb-3">
            <SearchX className="size-8" />
          </div>
          <h3 className="text-base leading-6 font-bold text-[var(--color-white)] mb-1">
            Sin productos coincidentes
          </h3>
          <p className="text-xs leading-4 text-[var(--color-gray-400)] mb-4">
            No se encontraron productos con el filtro aplicado. Verifica el término de búsqueda o selecciona otra categoría.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="min-h-[40px] inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-sm font-medium text-[var(--color-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 transition-colors cursor-pointer"
          >
            Ver todos los productos
          </button>
        </div>
      )}
    </div>
  );
}
