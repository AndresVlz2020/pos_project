import { useEffect, useState } from "react";
import { Input, Select, Button } from "@/shared";
import imgPunta from "@/assets/images/punta-de-anca.png";
import imgLimonada from "@/assets/images/limonada.png";
import imgPostre from "@/assets/images/postre-coco.png";
import imgCoctel from "@/assets/images/coctel-fresa.png";

export default function CreateOrder() {
  const [form, setForm] = useState({
    tableNumber: "",
    waiter: "",
    observations: "",
  });

  const [errors, setErrors] = useState({});

  const dishes = [
    {
      id: "punta-anca",
      name: "Punta de anca",
      price: "56.000",
      status: "Disponible",
      image: imgPunta,
    },
    {
      id: "limonada",
      name: "Limonada",
      price: "10.000",
      status: "Disponible",
      image: imgLimonada,
    },
    {
      id: "postre-coco",
      name: "Postre de Coco",
      price: "17.000",
      status: "Disponible",
      image: imgPostre,
    },
    {
      id: "coctel-fresa",
      name: "Coctel Fresa",
      price: "12.000",
      status: "Disponible",
      image: imgCoctel,
    },
  ];

  const [qty, setQty] = useState(
    dishes.reduce((acc, d) => ({ ...acc, [d.id]: 0 }), {})
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));

    if (errors[name]) {
      const { [name]: _omit, ...rest } = errors;
      setErrors(rest);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Orden creada (demo)");
  };

  return (
    <div className="w-full">
      <div className="w-full bg-[var(--color-primary-950)] text-[var(--color-text-inverse)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button type="button" onClick={() => window.history.back()} className="px-3 py-1 rounded-md border border-[var(--color-text-inverse)] text-[var(--color-text-inverse)]">←</button>
          <h1 className="text-2xl font-bold">Crear Orden</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto p-6 bg-[var(--color-tertiary-300)] rounded-lg border border-[var(--color-border)] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 md:gap-y-8 gap-x-8 md:gap-x-12 items-start justify-items-center">
          <Input
            label="Numero de Mesa"
            name="tableNumber"
            type="text"
            value={form.tableNumber}
            placeholder=""
            htmlFor="order-table-number"
            onChange={handleChange}
            error={errors.tableNumber}
          />

          <Select
            label="Selecciona un Mesero"
            name="waiter"
            htmlFor="order-waiter"
            options={[]}
            value={form.waiter}
            onChange={handleChange}
            error={errors.waiter}
          />

          <Input
            label="Observaciones"
            name="observations"
            type="text"
            value={form.observations}
            placeholder=""
            htmlFor="order-observations"
            onChange={handleChange}
            error={errors.observations}
          />
        </div>

        <h2 className="text-center text-xl font-bold mt-8 mb-6">Platillos del Menu</h2>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-10 justify-items-center mb-10">
          {dishes.map((dish) => (
            <div key={dish.id} className="w-72 rounded-lg border border-[var(--color-border-strong)] p-4 bg-[var(--color-primary-900)] text-[var(--color-text-inverse)] shadow-sm overflow-hidden on-dark">
              <img src={dish.image} alt={dish.name} className="w-full aspect-[16/9] object-cover rounded-md" />

              <div className="mt-4 grid gap-3">
                <Input
                  label="Nombre"
                  name={`${dish.id}-name`}
                  type="text"
                  value={dish.name}
                  htmlFor={`${dish.id}-name`}
                  readOnly
                />
                <Input
                  label="Precio"
                  name={`${dish.id}-price`}
                  type="text"
                  value={dish.price}
                  htmlFor={`${dish.id}-price`}
                  readOnly
                />
                <Input
                  label="Estado"
                  name={`${dish.id}-status`}
                  type="text"
                  value={dish.status}
                  htmlFor={`${dish.id}-status`}
                  readOnly
                />
              </div>

              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setQty((q) => ({ ...q, [dish.id]: Math.max(0, q[dish.id] - 1) }))}
                  className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-md text-[var(--color-text-inverse)] bg-[var(--color-secondary-500)]"
                >
                  -
                </button>
                <span className="min-w-[2.5rem] h-8 md:h-9 px-3 flex items-center justify-center rounded-md bg-[var(--color-primary-700)] text-[var(--color-text-inverse)]">
                  {qty[dish.id]}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => ({ ...q, [dish.id]: q[dish.id] + 1 }))}
                  className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-md text-[var(--color-text-inverse)] bg-[var(--color-primary-500)]"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto flex justify-end mt-6">
          <Button variant="primary" size="md" type="submit">Crear Orden</Button>
        </div>
      </form>
    </div>
  );
}
