import { Card, Navbar } from "@/shared";
import { products } from "@/features/products/data/products";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7x1">
      <Navbar />
      {/* Hero */}
      {/* Carrusel */ }
      {/* Titulo */}
      <h1 className="text-h1 text-2xl font-bold place-self-center mt-16 mb-12">
          Productos
      </h1>
        {/* Cards */}
      <div 
        className="
        grid
        gap-4
        mx-6
        sm:grid-cols-2
        sm:mx-12
        lg:grid-cols-3
        xl:grid-cols-4
        justify-items-center
        ">

        {products.map((product) => (
          <Card key={product.id} product={product} />
        ))}

        </div>
    </div>
  )
}
