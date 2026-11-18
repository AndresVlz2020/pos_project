// frontend/src/features/access/pages/AccessPage.jsx

import { useCallback, useEffect, useState } from "react";
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

  const handleGroupPermissionsLoaded = useCallback((nextPerms) => {
    setGroupPermissions(nextPerms);
    setPermissionsDraft(nextPerms);
  }, []);

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
        text: "Los permisos se han guardado correctamente.",
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
    <div className="flex-1 flex flex-col w-full rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-4 sm:p-5 m3-elevation-1 text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
      <div className="mb-3.5">
        <h1 className="text-title-lg sm:text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
          Gestión de permisos
        </h1>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 items-stretch">
        <AccessSidebar
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          setSelectedGroupName={setSelectedGroupName}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          setSelectedUserName={setSelectedUserName}
          groupPermissions={groupPermissions}
          setGroupPermissions={handleGroupPermissionsLoaded}
          setIsEditing={setIsEditing}
        />

        <div className="flex-1 w-full flex flex-col">
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
