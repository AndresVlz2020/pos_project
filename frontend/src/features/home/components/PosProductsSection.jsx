import { useState, useMemo } from "react";
import {
  SearchField,
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  IconButton,
  Button,
  M3Icon,
} from "@/shared";
import PosCategoryFilter from "./PosCategoryFilter";
import PosProductCard from "./PosProductCard";

const SORT_OPTIONS = [
  { value: "default", label: "Por Defecto" },
  { value: "price-asc", label: "Menor Precio" },
  { value: "price-desc", label: "Mayor Precio" },
];

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

    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === "all" ||
          normalizeText(product.category) === normalizeText(selectedCategory);

        if (!matchesCategory) return false;
        if (!query) return true;

        const titleMatch = normalizeText(product.title).includes(query);
        const descMatch = normalizeText(product.description).includes(query);
        const catMatch = normalizeText(product.category).includes(query);

        return titleMatch || descMatch || catMatch;
      })
      .sort((a, b) => {
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
    <div className="space-y-3 sm:space-y-4 w-full">
      <div className="w-full min-w-0">
        <SearchField
          value={searchQuery}
          onChange={onSearchChange}
          onSubmit={onSearchChange}
          onClear={onClearSearch}
          placeholder="Buscar por platillo, corte de carne, bebida o postre..."
          size="md"
          variant="filled"
          fullWidth={true}
        />
      </div>

      {/* Botón de filtrar al inicio de la línea + chips de categorías deslizables horizontalmente en móvil */}
      <div className="flex items-center gap-2.5 w-full min-w-0">
        <Dropdown className="shrink-0">
          <DropdownTrigger>
            <IconButton
              hitSize={40}
              iconSize={20}
              variant={sortBy !== "default" ? "filled" : "outlined"}
              ariaLabel="Ordenar productos"
              title={
                SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label
                  ? `Orden: ${SORT_OPTIONS.find((opt) => opt.value === sortBy).label}`
                  : "Ordenar productos"
              }
            >
              <M3Icon name="filter_list" size={20} />
            </IconButton>
          </DropdownTrigger>

          <DropdownContent className="left-0 min-w-[200px]">
            <p className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
              Ordenar por
            </p>
            {SORT_OPTIONS.map((option) => {
              const isSelected = sortBy === option.value;
              return (
                <DropdownItem
                  key={option.value}
                  icon={isSelected ? "check" : undefined}
                  onClick={() => setSortBy(option.value)}
                  className={
                    isSelected
                      ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-medium"
                      : ""
                  }
                >
                  {option.label}
                </DropdownItem>
              );
            })}
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

      {(searchQuery || selectedCategory !== "all") && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-xs">
          <span className="text-[var(--md-sys-color-on-surface-variant)]">
            Mostrando{" "}
            <strong className="text-[var(--md-sys-color-on-surface)] font-medium">
              {filteredProducts.length}
            </strong>{" "}
            productos
            {searchQuery && (
              <>
                {" "}
                para{" "}
                <strong className="text-[var(--md-sys-color-primary)] font-medium">
                  &ldquo;{searchQuery}&rdquo;
                </strong>
              </>
            )}
            {selectedCategory !== "all" && (
              <>
                {" "}
                en categoría{" "}
                <strong className="text-[var(--md-sys-color-primary)] font-medium">
                  &ldquo;{selectedCategory}&rdquo;
                </strong>
              </>
            )}
          </span>
          <Button variant="text" size="sm" onClick={handleResetFilters}>
            Restablecer filtros
          </Button>
        </div>
      )}

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredProducts.map((product) => (
            <PosProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center max-w-md mx-auto">
          <div className="size-16 mx-auto rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-center text-[var(--md-sys-color-primary)] mb-3">
            <M3Icon name="search_off" size={32} />
          </div>
          <h3 className="text-base leading-6 font-medium text-[var(--md-sys-color-on-surface)] mb-1">
            Sin productos coincidentes
          </h3>
          <p className="text-xs leading-4 text-[var(--md-sys-color-on-surface-variant)] mb-4">
            No se encontraron productos con el filtro aplicado. Verifica el término de búsqueda o selecciona otra categoría.
          </p>
          <Button variant="filled" onClick={handleResetFilters}>
            Ver todos los productos
          </Button>
        </div>
      )}
    </div>
  );
}
