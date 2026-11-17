import { useNavigate } from "react-router-dom";
import { IconButton, M3Icon } from "@/shared";

export default function InventoryRowActions({ item, canEdit = true }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1.5">
      {canEdit && (
        <IconButton
          variant="tonal"
          hitSize={40}
          iconSize={18}
          ariaLabel="Editar insumo"
          title="Editar insumo"
          onClick={() => navigate("/CreateInventory", { state: { item } })}
        >
          <M3Icon name="edit" size={18} />
        </IconButton>
      )}
      <IconButton
        variant="standard"
        hitSize={40}
        iconSize={18}
        ariaLabel="Ver insumo"
        title="Ver insumo"
        onClick={() => navigate("/readinventory", { state: { item } })}
      >
        <M3Icon name="visibility" size={18} />
      </IconButton>
    </div>
  );
}
