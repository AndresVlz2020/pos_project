// frontend/src/features/access/components/AccessSidebar.jsx

import { useState, useEffect } from "react";
import { Select } from "@/shared";
import { getGroups } from "../services/groupService";
import {
  getGroupPermissions,
  getUserPermissions,
} from "../services/permissionService";

export default function AccessSidebar({
  selectedGroup,
  setSelectedGroup,
  setSelectedGroupName,
  selectedUser,
  setSelectedUser,
  setSelectedUserName,
  setGroupPermissions,
  setIsEditing,
}) {
  // Estado de los grupos del POS (Administrador, Cajero, Mesero, Cocina)
  const [groups, setGroups] = useState([]);

  // Estado de los usuarios reales activos desde PostgreSQL
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getGroups().then(setGroups).catch(console.error);

    fetch("http://localhost:4000/api/users?active=true", {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((payload) => {
        const list = Array.isArray(payload) ? payload : payload?.data || [];
        if (Array.isArray(list)) {
          // Validar que solo se muestren usuarios activos (habilitados)
          const activeUsers = list.filter((user) =>
            Boolean(user.isActive ?? user.is_active),
          );
          setUsers(activeUsers);
        }
      })
      .catch(console.error);
  }, []);

  const groupOptions = groups.map((group) => ({
    value: String(group.group_id),
    label: group.group_name,
  }));

  const userOptions = users
    .filter((user) => Boolean(user.isActive ?? user.is_active))
    .map((user) => {
      const displayName = user.name || user.userName || user.user_name;
      const roleLabel = user.role || user.userType || "";
      return {
        value: String(user.id),
        label: roleLabel ? `${displayName} (${roleLabel})` : displayName,
      };
    });

  return (
    <aside className="w-full md:w-[320px] shrink-0 space-y-8">
      <section className="rounded-xl p-5 bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] shadow-sm">
        <h2 className="text-base font-semibold mb-4 text-[var(--color-white)]">
          Grupos usuarios
        </h2>

        <Select
          name="groupId"
          value={selectedGroup}
          onChange={async (e) => {
            const groupId = e.target.value;

            const selectedGroupData = groups.find(
              (group) => String(group.group_id) === groupId,
            );

            setSelectedGroup(groupId);
            setSelectedGroupName?.(selectedGroupData?.group_name ?? "");

            setSelectedUser?.("");
            setSelectedUserName?.("");
            setIsEditing?.(false);

            if (!groupId) {
              setGroupPermissions([]);
              return;
            }

            const permissions = await getGroupPermissions(groupId);
            console.log("PERMISOS DEL GRUPO:", permissions);

            setGroupPermissions(permissions);
          }}
          options={groupOptions}
        />
      </section>

      <section className="rounded-xl p-5 bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] shadow-sm">
        <h2 className="text-base font-semibold mb-4 text-[var(--color-white)]">
          Usuario individual
        </h2>

        <Select
          name="userId"
          value={selectedUser}
          onChange={async (e) => {
            const userId = e.target.value;

            const selectedUserData = users.find(
              (user) => String(user.id) === userId,
            );

            setSelectedUser?.(userId);
            setSelectedUserName?.(
              selectedUserData?.name ||
                selectedUserData?.userName ||
                selectedUserData?.user_name ||
                "",
            );

            setSelectedGroup("");
            setSelectedGroupName?.("");
            setIsEditing?.(false);

            if (!userId) {
              setGroupPermissions([]);
              return;
            }

            const permissions = await getUserPermissions(userId);
            console.log("PERMISOS DEL USUARIO:", permissions);

            setGroupPermissions(permissions);
          }}
          options={userOptions}
        />
      </section>
    </aside>
  );
}
