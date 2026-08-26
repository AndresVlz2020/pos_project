import { useState } from "react";
import { Input, Select, Button, Card } from "@/shared";
import { Link, useNavigate, useLocation } from "react-router-dom";
import imgPunta from "@/assets/images/punta-de-anca.png";
import imgLimonada from "@/assets/images/limonada.png";
import imgPostre from "@/assets/images/postre-coco.png";
import imgCoctel from "@/assets/images/coctel-fresa.png";

import { products } from "../../products/data/products";

export default function EditOrder() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialForm = location.state?.form ? {
    tableNumber: location.state.form.tableNumber || "Mesa 5",
    waiter: location.state.form.waiter || "1",
    observations: location.state.form.observations || "Sin cebolla en la carne",
    orderStatus: "en_proceso",
  } : {
    tableNumber: "Mesa 5",
    waiter: "1",
    observations: "Sin cebolla en la carne",
    orderStatus: "en_proceso",
  };

  const initialQty = location.state?.qty || {
    "punta-anca": 2,
    limonada: 2,
    "postre-coco": 1,
    "coctel-fresa": 0,
  };

  const [formOrder, setFormOrder] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const dishes = products.map((p) => ({
    id: p.id,
    name: p.title,
    price: p.price,
    status: "Disponible",
    image: p.image,
  }));

  const [qty, setQty] = useState(initialQty);

  const waiterOptions = [
    { value: "1", label: "Carlos Pérez" },
    { value: "2", label: "María Rodríguez" },
    { value: "3", label: "Juan Gómez" },
    { value: "4", label: "Ana Martínez" },
  ];

  const orderStatusOptions = [
    { value: "pendiente", label: "Pendiente" },
    { value: "en_proceso", label: "En Preparación" },
    { value: "entregado", label: "Entregado" },
    { value: "cancelado", label: "Cancelado" },
  ];

  const parsePrice = (val) => parseFloat(String(val || 0).replace(/\$/g, "").replace(/\./g, "").trim()) || 0;

  const totalAmount = dishes.reduce(
    (sum, d) => sum + parsePrice(d.price) * (qty[d.id] || 0),
    0
  );

  const totalItems = Object.values(qty).reduce((a, b) => a + b, 0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormOrder((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prevErrors) => {
      if (!prevErrors[name]) return prevErrors;
      const nextErrors = { ...prevErrors };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fieldErrors = {};
    if (!formOrder.tableNumber) {
      fieldErrors.tableNumber = "El número de mesa es requerido";
    }
    if (!formOrder.waiter) {
      fieldErrors.waiter = "Selecciona un mesero";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    alert("Orden actualizada correctamente");
    navigate("/CreateOrder");
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
            <h1 className="text-[length:var(--fs-md)] font-bold">Editar Orden</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[length:var(--fs-xxs)] text-[var(--color-gray-300)]">
              Items: {totalItems}
            </span>

            <div className="text-[length:var(--fs-xs)] font-bold bg-[var(--color-primary-800)] text-[var(--color-white)] px-4 py-1.5 rounded-lg border border-[var(--color-primary-600)] shadow-sm">
              Total: ${totalAmount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 my-6">
        {/* Main Info Card */}
        <div className="p-6 bg-[var(--color-tertiary-300)] rounded-xl border border-[var(--color-border)] shadow-sm mb-8">
          <h2 className="text-[length:var(--fs-sm)] font-bold mb-4 text-[var(--color-gray-900)]">
            Información de la Orden
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start w-full">
            <Input
              label="Número de Mesa"
              name="tableNumber"
              type="text"
              value={formOrder.tableNumber}
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
              value={formOrder.waiter}
              onChange={handleChange}
              error={errors.waiter}
            />

            <Select
              label="Estado de la Orden"
              name="orderStatus"
              htmlFor="order-status"
              options={orderStatusOptions}
              value={formOrder.orderStatus}
              onChange={handleChange}
              error={errors.orderStatus}
            />

            <Input
              label="Observaciones"
              name="observations"
              type="text"
              value={formOrder.observations}
              placeholder="Observaciones adicionales"
              htmlFor="order-observations"
              onChange={handleChange}
              error={errors.observations}
            />
          </div>
        </div>

        {/* Dishes list header */}
        <h2 className="text-[length:var(--fs-md)] font-bold mb-6 text-[var(--color-gray-900)] text-center">
          Platillos Incluidos en la Orden
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

        {/* Footer actions */}
        <div className="p-6 bg-[var(--color-tertiary-300)] rounded-xl border border-[var(--color-border)] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[length:var(--fs-sm)] font-bold text-[var(--color-gray-900)]">
            Total de la Orden: <span className="text-[var(--color-primary-700)] text-[length:var(--fs-md)]">${totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex gap-4">
            <Link to="/CreateOrder">
              <Button variant="secondary" size="md" type="button">
                Cancelar
              </Button>
            </Link>
            <Button variant="primary" size="md" type="submit">
              Guardar Cambios
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
