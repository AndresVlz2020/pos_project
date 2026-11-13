// frontend/src/features/access/pages/AccessPage.jsx

import { useEffect, useState } from "react";
import AccessSidebar from "../components/AccessSidebar";
import PermissionModule from "../components/PermissionModule";
import { updateGroupPermissions } from "../services/groupService";
import {
  getAllPermissions,
  updateUserPermissions,
} from "../services/permissionService";
import { showSuccessAlert, showErrorAlert } from "@/shared";

export default function AccessPage() {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");
  const [groupPermissions, setGroupPermissions] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [permissionsDraft, setPermissionsDraft] = useState([]);

  useEffect(() => {
    getAllPermissions().then(setAllPermissions).catch(console.error);
  }, []);

  useEffect(() => {
    setPermissionsDraft(groupPermissions);
  }, [groupPermissions]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setPermissionsDraft(groupPermissions);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const permissionIds = permissionsDraft
        .map((permission) => permission.permission_id)
        .filter(Boolean);

      if (selectedGroup) {
        await updateGroupPermissions(selectedGroup, permissionIds);
      } else if (selectedUser) {
        await updateUserPermissions(selectedUser, permissionIds);
      }

      setGroupPermissions(permissionsDraft);
      setIsEditing(false);

      await showSuccessAlert({
        title: "Permisos actualizados",
        text: "Los permisos se han guardado correctamente en PostgreSQL.",
      });
    } catch (error) {
      if (error?.isStepUpCancelled) return;
      console.error("Error guardando permisos:", error);
      await showErrorAlert({
        title: "Error al guardar",
        text: error.message || "No se pudieron actualizar los permisos.",
      });
    }
  };

  return (
    <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-lg p-4 sm:p-6 shadow-md text-[var(--color-white)]">
      <h1 className="text-xl font-bold mb-4 sm:mb-6 text-[var(--color-white)]">
        Gestión de permisos
      </h1>

      <div className="flex flex-col md:flex-row gap-5 sm:gap-8 items-start">
        <AccessSidebar
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          setSelectedGroupName={setSelectedGroupName}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          setSelectedUserName={setSelectedUserName}
          groupPermissions={groupPermissions}
          setGroupPermissions={setGroupPermissions}
          setIsEditing={setIsEditing}
        />

        <div className="flex-1 w-full">
          <PermissionModule
            selectedGroup={selectedGroup}
            selectedGroupName={selectedGroupName}
            selectedUser={selectedUser}
            selectedUserName={selectedUserName}
            isEditing={isEditing}
            allPermissions={allPermissions}
            permissionsDraft={permissionsDraft}
            setPermissionsDraft={setPermissionsDraft}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
