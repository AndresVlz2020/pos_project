import { useState, useMemo } from "react";
import { SearchX, Filter } from "lucide-react";
import { Card, Button, SearchField } from "@/shared";
import PosCategoryFilter from "./PosCategoryFilter";

// Normaliza texto eliminando acentos y mayúsculas
const normalizeText = (text = "") =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export default function PosProductsSection({ products = [], searchQuery = "", onSearchChange, onClearSearch }) {
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
    <div className="space-y-3.5">
      {/* Barra de Búsqueda y Ordenamiento directa */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <SearchField
            value={searchQuery}
            onChange={onSearchChange}
            onSubmit={onSearchChange}
            onClear={onClearSearch}
            placeholder="Buscar por platillo, corte de carne, bebida o postre..."
            size="md"
            variant="dark"
            fullWidth={true}
            className="w-full border-[var(--color-primary-700)] hover:border-[var(--color-secondary-400)] shadow-none"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-gray-400)] bg-[var(--color-primary-900)] px-3 py-2 rounded-md border border-[var(--color-primary-800)]">
            <Filter className="size-3.5 text-[var(--color-secondary-500)]" />
            <span>Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[var(--color-white)] text-xs font-semibold outline-none cursor-pointer"
            >
              <option value="default" className="bg-[var(--color-primary-900)] text-[var(--color-white)]">Por Defecto</option>
              <option value="price-asc" className="bg-[var(--color-primary-900)] text-[var(--color-white)]">Menor Precio</option>
              <option value="price-desc" className="bg-[var(--color-primary-900)] text-[var(--color-white)]">Mayor Precio</option>
            </select>
          </div>
        </div>
      </div>

      {/* Barra de Filtros de Categoría */}
      <div className="pb-1">
        <PosCategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          products={products}
        />
      </div>

      {/* Indicador de Filtro o Búsqueda Activa */}
      {(searchQuery || selectedCategory !== "all") && (
        <div className="flex items-center justify-between p-2.5 rounded-md bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] text-xs">
          <span className="text-[var(--color-gray-400)]">
            Mostrando <strong className="text-[var(--color-white)] font-bold">{filteredProducts.length}</strong> productos
            {searchQuery && <> para <strong className="text-[var(--color-secondary-500)] font-semibold">"{searchQuery}"</strong></>}
            {selectedCategory !== "all" && <> en categoría <strong className="text-[var(--color-secondary-500)] font-semibold">"{selectedCategory}"</strong></>}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
          >
            Restablecer filtros
          </Button>
        </div>
      )}

      {/* Cuadrícula de Productos utilizando el componente Card de shared */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              product={product}
              orderLink="/CreateOrder"
            />
          ))}
        </div>
      ) : (
        /* Estado vacío si no hay coincidencias */
        <div className="py-14 text-center max-w-md mx-auto">
          <div className="size-16 mx-auto rounded-md bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] flex items-center justify-center text-[var(--color-secondary-500)] mb-3">
            <SearchX className="size-8" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-white)] mb-1">
            Sin productos coincidentes
          </h3>
          <p className="text-xs text-[var(--color-gray-400)] mb-4 leading-relaxed">
            No se encontraron productos con el filtro aplicado. Verifica el término de búsqueda o selecciona otra categoría.
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={handleResetFilters}
          >
            Ver todos los productos
          </Button>
        </div>
      )}
    </div>
  );
}
