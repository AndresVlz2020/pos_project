import { useState } from "react";
import { UserCheck, Receipt, UserPlus } from "lucide-react";
import { posCustomers } from "../data/posMockData";
import PosSectionHeader from "./PosSectionHeader";
import PosCardGrid from "./PosCardGrid";
import PosInfoCard from "./PosInfoCard";

export default function PosCustomersPanel() {
  const [query, setQuery] = useState("");

  const filtered = posCustomers.filter((c) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.docNumber.includes(q) ||
      c.phone.includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <PosSectionHeader
        icon={UserCheck}
        title="Clientes para Facturación POS"
        subtitle="Búsqueda rápida de clientes por Cédula o NIT para asignar a la comanda activa."
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar por cédula / nombre..."
        actionLabel="Nuevo Cliente"
        actionIcon={UserPlus}
        actionLink="/dashboard"
      />

      <PosCardGrid emptyMessage="No se encontraron clientes con el criterio de búsqueda.">
        {filtered.map((customer) => (
          <PosInfoCard
            key={customer.id}
            tagLeft={`${customer.docType}: ${customer.docNumber}`}
            tagRight={customer.category}
            title={customer.name}
            subtitle={`Tel: ${customer.phone}`}
            actionIcon={Receipt}
            actionLabel="Asignar Venta"
            actionLink="/CreateOrder"
            actionAriaLabel={`Asignar venta para ${customer.name}`}
          />
        ))}
      </PosCardGrid>
    </div>
  );
}
