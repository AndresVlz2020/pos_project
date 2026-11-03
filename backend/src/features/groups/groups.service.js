// backend/src/features/groups/groups.service.js

import { groupsRepository } from "./groups.repository.js";

export const groupsService = {
  async getAll() {
    return await groupsRepository.getAll();
  },

  async getPermissionsByGroupId(groupId) {
    return await groupsRepository.getPermissionsByGroupId(groupId);
  },

  async updatePermissions(groupId, permissionIds) {
    return await groupsRepository.updatePermissions(groupId, permissionIds);
  },
};
