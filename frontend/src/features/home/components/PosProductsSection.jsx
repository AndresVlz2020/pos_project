import { useState, useMemo } from "react";
import { UtensilsCrossed, SearchX, Filter, Plus } from "lucide-react";
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
      const codeMatch = normalizeText(product.code).includes(query);

      return titleMatch || descMatch || catMatch || codeMatch;
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
    <div className="space-y-6">
      {/* Panel Superior del Catálogo: Título, Filtros y Búsqueda Destacada */}
      <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-white)] flex items-center gap-2.5">
              <UtensilsCrossed className="size-5 text-[var(--color-secondary-400)]" />
              Catálogo de Venta Directa (Menú POS)
            </h2>
            <p className="text-xs text-[var(--color-gray-400)] mt-0.5">
              Búsqueda en tiempo real para comandas, pedidos en mesa y mostrador de caja.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de ordenamiento */}
            <div className="flex items-center gap-2 text-xs text-[var(--color-gray-300)] bg-[var(--color-primary-950)] px-3.5 py-2 rounded-xl border border-[var(--color-primary-700)]">
              <Filter className="size-3.5 text-[var(--color-secondary-400)]" />
              <span>Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[var(--color-white)] text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="default" className="bg-[var(--color-primary-950)] text-white">Código / Defecto</option>
                <option value="price-asc" className="bg-[var(--color-primary-950)] text-white">Menor Precio</option>
                <option value="price-desc" className="bg-[var(--color-primary-950)] text-white">Mayor Precio</option>
              </select>
            </div>

            <Link
              to="/CreateProduct"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-400)] text-xs font-bold text-[var(--color-white)] shadow-md transition-all cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Crear Producto</span>
            </Link>
          </div>
        </div>

        {/* Barra de Búsqueda con Gran Presencia Visual */}
        <div className="w-full">
          <SearchField
            value={searchQuery}
            onChange={onSearchChange}
            onSubmit={onSearchChange}
            onClear={onClearSearch}
            placeholder="Buscar por platillo, corte de carne, bebida, postre o código..."
            size="lg"
            variant="dark"
            fullWidth={true}
            className="w-full shadow-lg border-[var(--color-primary-700)] hover:border-[var(--color-secondary-400)]"
          />
        </div>

        {/* Botones de Categorías */}
        <div className="pt-2 border-t border-[var(--color-primary-800)]/80">
          <PosCategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            products={products}
          />
        </div>
      </div>

      {/* Indicador de Filtro o Búsqueda Activa */}
      {(searchQuery || selectedCategory !== "all") && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] text-xs">
          <span className="text-[var(--color-gray-300)]">
            Mostrando <strong className="text-[var(--color-white)] font-bold">{filteredProducts.length}</strong> productos
            {searchQuery && <> para <strong className="text-[var(--color-secondary-300)] font-semibold">"{searchQuery}"</strong></>}
            {selectedCategory !== "all" && <> en categoría <strong className="text-[var(--color-secondary-300)] font-semibold">"{selectedCategory}"</strong></>}
          </span>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[var(--color-secondary-300)] hover:text-[var(--color-secondary-200)] hover:underline cursor-pointer font-semibold"
          >
            Restablecer filtros
          </button>
        </div>
      )}

      {/* Cuadrícula de Productos */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <PosProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Estado vacío si no hay coincidencias */
        <div className="py-14 text-center max-w-md mx-auto">
          <div className="size-16 mx-auto rounded-xl bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] flex items-center justify-center text-[var(--color-secondary-400)] mb-3">
            <SearchX className="size-8" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-white)] mb-1">
            Sin productos coincidentes
          </h3>
          <p className="text-xs text-[var(--color-gray-400)] mb-4 leading-relaxed">
            No se encontraron productos con el filtro aplicado. Verifica el código SKU, término de búsqueda o selecciona otra categoría.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-xs font-semibold text-[var(--color-white)] transition-colors cursor-pointer"
          >
            Ver todos los productos
          </button>
        </div>
      )}
    </div>
  );
}
