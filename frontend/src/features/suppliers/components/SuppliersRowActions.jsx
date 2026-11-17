import { useNavigate } from "react-router-dom";
import { IconButton, M3Icon } from "@/shared";

export default function SuppliersRowActions({ supplier, canEdit = true }) {
  const navigate = useNavigate();

  const handleEdit = () => {
    try {
      sessionStorage.setItem("last_edited_supplier", JSON.stringify(supplier));
    } catch {
      // ignore
    }
    navigate(`/editsupplier?id=${supplier.id}`, { state: { supplier } });
  };

  const handleView = () => {
    try {
      sessionStorage.setItem("last_viewed_supplier", JSON.stringify(supplier));
    } catch {
      // ignore
    }
    navigate(`/readsupplier?id=${supplier.id}`, { state: { supplier } });
  };

  return (
    <div className="flex items-center gap-1.5">
      {canEdit && (
        <IconButton
          variant="tonal"
          hitSize={40}
          iconSize={18}
          ariaLabel="Editar proveedor"
          title="Editar proveedor"
          onClick={handleEdit}
        >
          <M3Icon name="edit" size={18} />
        </IconButton>
      )}
      <IconButton
        variant="standard"
        hitSize={40}
        iconSize={18}
        ariaLabel="Ver proveedor"
        title="Ver proveedor"
        onClick={handleView}
      >
        <M3Icon name="visibility" size={18} />
      </IconButton>
    </div>
  );
}
