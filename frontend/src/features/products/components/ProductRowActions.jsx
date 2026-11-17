import { useNavigate } from "react-router-dom";
import { IconButton, M3Icon } from "@/shared";

export default function ProductRowActions({ product, canEdit = true }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1.5">
      {canEdit && (
        <IconButton
          variant="tonal"
          hitSize={40}
          iconSize={18}
          ariaLabel="Editar producto"
          title="Editar producto"
          onClick={() => navigate("/editproduct", { state: { product } })}
        >
          <M3Icon name="edit" size={18} />
        </IconButton>
      )}
      <IconButton
        variant="standard"
        hitSize={40}
        iconSize={18}
        ariaLabel="Ver producto"
        title="Ver producto"
        onClick={() => navigate("/readproduct", { state: { product } })}
      >
        <M3Icon name="visibility" size={18} />
      </IconButton>
    </div>
  );
}
