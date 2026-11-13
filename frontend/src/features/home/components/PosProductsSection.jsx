import { useState, useMemo } from "react";
import { SearchX, Filter, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { SearchField } from "@/shared";
import PosCategoryFilter from "./PosCategoryFilter";
import PosProductCard from "./PosProductCard";

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

      {/* Fila única: botón icono de ordenamiento + categorías en scroll horizontal */}
      <div className="flex items-start gap-2 w-full min-w-0">
        <div
          title={
            sortBy === "price-asc"
              ? "Orden: Menor Precio"
              : sortBy === "price-desc"
              ? "Orden: Mayor Precio"
              : "Ordenar productos"
          }
          className={`relative shrink-0 inline-flex items-center justify-center px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md border transition-all cursor-pointer ${
            sortBy !== "default"
              ? "bg-[var(--color-primary-500)] text-[#ffffff] border-[var(--color-primary-600)]"
              : "bg-[var(--color-secondary-900)] text-[var(--color-primary-400)] hover:text-[var(--color-white)] hover:bg-[var(--color-secondary-800)] border-[var(--color-secondary-800)]"
          }`}
        >
          <Filter className="size-4 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Ordenar productos"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer bg-[var(--color-secondary-950)] text-white"
          >
            <option value="default" className="bg-[var(--color-secondary-950)] text-white">Por Defecto</option>
            <option value="price-asc" className="bg-[var(--color-secondary-950)] text-white">Menor Precio</option>
            <option value="price-desc" className="bg-[var(--color-secondary-950)] text-white">Mayor Precio</option>
          </select>
        </div>

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
        <div className="flex items-center justify-between p-2.5 rounded-md bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] text-xs">
          <span className="text-[var(--color-gray-300)]">
            Mostrando <strong className="text-[var(--color-white)] font-bold">{filteredProducts.length}</strong> productos
            {searchQuery && <> para <strong className="text-[var(--color-primary-300)] font-semibold">"{searchQuery}"</strong></>}
            {selectedCategory !== "all" && <> en categoría <strong className="text-[var(--color-primary-300)] font-semibold">"{selectedCategory}"</strong></>}
          </span>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[var(--color-primary-300)] hover:text-[var(--color-primary-200)] hover:underline cursor-pointer font-semibold"
          >
            Restablecer filtros
          </button>
        </div>
      )}

      {/* Cuadrícula de Productos */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {filteredProducts.map((product) => (
            <PosProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Estado vacío si no hay coincidencias */
        <div className="py-14 text-center max-w-md mx-auto">
          <div className="size-16 mx-auto rounded-md bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] flex items-center justify-center text-[var(--color-primary-400)] mb-3">
            <SearchX className="size-8" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-white)] mb-1">
            Sin productos coincidentes
          </h3>
          <p className="text-xs text-[var(--color-gray-400)] mb-4 leading-relaxed">
            No se encontraron productos con el filtro aplicado. Verifica el término de búsqueda o selecciona otra categoría.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-xs font-semibold text-[#ffffff] transition-colors cursor-pointer"
          >
            Ver todos los productos
          </button>
        </div>
      )}
    </div>
  );
}
