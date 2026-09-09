import { useState } from "react";
import { Input, Select, Button, IconButton, Card } from "@/shared";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { products } from "../products/data/products";

export default function CreateOrder() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tableNumber: "",
    waiter: "",
    observations: "",
  });

  const [errors, setErrors] = useState({});

  const dishes = products.map((p) => ({
    id: p.id,
    name: p.title,
    price: p.price,
    status: "Disponible",
    image: p.image,
  }));

  const waiterOptions = [
    { value: "1", label: "Carlos Pérez" },
    { value: "2", label: "María Rodríguez" },
    { value: "3", label: "Juan Gómez" },
    { value: "4", label: "Ana Martínez" },
  ];

  const [qty, setQty] = useState(
    dishes.reduce((acc, d) => ({ ...acc, [d.id]: 0 }), {})
  );

  const parsePrice = (val) => parseFloat(String(val || 0).replace(/\$/g, "").replace(/\./g, "").trim()) || 0;

  const totalAmount = dishes.reduce(
    (sum, d) => sum + parsePrice(d.price) * (qty[d.id] || 0),
    0
  );

  const totalItems = Object.values(qty).reduce((a, b) => a + b, 0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));

    if (errors[name]) {
      const nextErrors = { ...errors };
      delete nextErrors[name];
      setErrors(nextErrors);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fieldErrors = {};
    if (!form.tableNumber) fieldErrors.tableNumber = "Requerido";
    if (!form.waiter) fieldErrors.waiter = "Selecciona un mesero";

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    alert("Orden creada correctamente");
  };

  return (
    <div className="w-full pb-12">
      {/* Header bar */}
      <div className="w-full bg-[var(--color-primary-950)] text-[var(--color-white)] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-3 py-1.5 rounded-md border border-[var(--color-white)]/30 hover:bg-[var(--color-white)]/10 text-[var(--color-white)] transition cursor-pointer"
            >
              ←
            </button>
            <h1 className="text-[length:var(--fs-md)] font-bold">Crear Orden</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[length:var(--fs-xxs)] text-[var(--color-gray-300)]">
              Items: {totalItems}
            </span>

            {/* Total Badge */}
            <div className="text-[length:var(--fs-xs)] font-bold bg-[var(--color-primary-800)] text-[var(--color-white)] px-4 py-1.5 rounded-lg border border-[var(--color-primary-600)] shadow-sm flex items-center gap-2">
              <span>Total: ${totalAmount.toLocaleString()}</span>
            </div>

            {/* Botón de editar orden al lado del Total */}
            <IconButton
              type="button"
              ariaLabel="Editar orden"
              hitSize={36}
              iconSize={18}
              variant="primary"
              className="rounded-lg shadow-sm cursor-pointer"
              onClick={() => navigate("/editorder", { state: { form, qty } })}
              title="Editar orden"
            >
              <Pencil size={16} />
            </IconButton>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 my-6">
        {/* General order data card */}
        <div className="p-6 bg-[var(--color-primary-900)] rounded-2xl border border-[var(--color-primary-800)] shadow-xl text-[var(--color-white)] mb-8">
          <h2 className="text-[length:var(--fs-sm)] font-bold mb-4 text-[var(--color-white)]">
            Datos de la Mesa y Mesero
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start w-full">
            <Input
              label="Número de Mesa"
              name="tableNumber"
              type="text"
              value={form.tableNumber}
              placeholder="Ej. Mesa 5"
              htmlFor="order-table-number"
              onChange={handleChange}
              error={errors.tableNumber}
            />

            <Select
              label="Selecciona un Mesero"
              name="waiter"
              htmlFor="order-waiter"
              options={waiterOptions}
              value={form.waiter}
              onChange={handleChange}
              error={errors.waiter}
            />

            <Input
              label="Observaciones"
              name="observations"
              type="text"
              value={form.observations}
              placeholder="Observaciones adicionales"
              htmlFor="order-observations"
              onChange={handleChange}
              error={errors.observations}
            />
          </div>
        </div>

        {/* Dishes list header */}
        <h2 className="text-[length:var(--fs-md)] font-bold mb-6 text-[var(--color-white)] text-center">
          Platillos del Menú
        </h2>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full mb-10">
          {dishes.map((dish) => (
            <Card
              key={dish.id}
              product={dish}
              qty={qty[dish.id] || 0}
              onIncrement={() => setQty((q) => ({ ...q, [dish.id]: (q[dish.id] || 0) + 1 }))}
              onDecrement={() =>
                setQty((q) => ({ ...q, [dish.id]: Math.max(0, (q[dish.id] || 0) - 1) }))
              }
            />
          ))}
        </div>

        {/* Action footer */}
        <div className="p-6 bg-[var(--color-primary-900)] rounded-2xl border border-[var(--color-primary-800)] shadow-xl text-[var(--color-white)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-[length:var(--fs-sm)] font-bold text-[var(--color-white)]">
              Total estimado: <span className="text-[var(--color-secondary-400)] text-[length:var(--fs-md)]">${totalAmount.toLocaleString()}</span>
            </div>
            <IconButton
              type="button"
              ariaLabel="Editar orden"
              hitSize={36}
              iconSize={18}
              variant="primary"
              className="rounded-lg shadow-sm cursor-pointer"
              onClick={() => navigate("/editorder", { state: { form, qty } })}
              title="Editar orden"
            >
              <Pencil size={16} />
            </IconButton>
          </div>
          <Button variant="primary" size="md" type="submit">
            Crear Orden
          </Button>
        </div>
      </form>
    </div>
  );
}
