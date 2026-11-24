import { sessionRepository } from "./session.repository.js";

function isAdminUser(user) {
  if (!user) return false;
  const role = String(user.role || "").toLowerCase();
  return Boolean(
    user.isAdmin ||
      user.isSuperuser ||
      role === "admin" ||
      role === "administrador"
  );
}

export const sessionService = {
  async getCurrent(user) {
    let session = await sessionRepository.getCurrentSession(user.id);
    if (!session) {
      session = await sessionRepository.startSession(user.id);
    }
    return { isAdmin: isAdminUser(user), session };
  },

  async heartbeat(user) {
    const session = await sessionRepository.heartbeat(user.id);
    return { ok: true, isAdmin: isAdminUser(user), session };
  },

  async end(user) {
    const session = await sessionRepository.endSession(user.id);
    return { ok: true, session };
  },

  async getActiveStaff() {
    return sessionRepository.getActiveStaffSessions();
  },

  async getHistory(user, filterUserId = null) {
    const admin = isAdminUser(user);
    if (admin) {
      return sessionRepository.getHistory({
        userId: filterUserId ? Number(filterUserId) : null,
        includeAll: true,
      });
    }
    // Trabajador no administrador: estrictamente solo su propio historial
    return sessionRepository.getHistory({
      userId: user.id,
      includeAll: false,
    });
  },
};
