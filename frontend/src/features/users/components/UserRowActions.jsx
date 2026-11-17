import { useNavigate } from "react-router-dom";
import { IconButton, M3Icon } from "@/shared";

export default function UserRowActions({ user }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1.5">
      <IconButton
        variant="tonal"
        hitSize={40}
        iconSize={18}
        ariaLabel="Editar usuario"
        title="Editar usuario"
        onClick={() => navigate("/edituser", { state: { user } })}
      >
        <M3Icon name="edit" size={18} />
      </IconButton>
      <IconButton
        variant="standard"
        hitSize={40}
        iconSize={18}
        ariaLabel="Ver usuario"
        title="Ver usuario"
        onClick={() => navigate("/readuser", { state: { user } })}
      >
        <M3Icon name="visibility" size={18} />
      </IconButton>
    </div>
  );
}
