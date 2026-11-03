// backend/src/features/access/access.service.js

import { accessRepository } from "./access.repository.js";

export const accessService = {
  async hasPermission(userId, permissionCode) {
    if (permissionCode === "admin") {
      return await accessRepository.isAdmin(userId);
    }

    const isSuperUser = await accessRepository.isSuperUser(userId);

    if (isSuperUser) {
      return true;
    }

    const isAdmin = await accessRepository.isAdmin(userId);

    if (isAdmin) {
      return true;
    }

    const permissions = await accessRepository.getUserPermissions(userId);

    return permissions.includes(permissionCode);
  },
};
