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
    if (isAdminUser(user)) {
      return { isAdmin: true, session: null };
    }
    let session = await sessionRepository.getCurrentSession(user.id);
    if (!session) {
      session = await sessionRepository.startSession(user.id);
    }
    return { isAdmin: false, session };
  },

  async heartbeat(user) {
    if (isAdminUser(user)) {
      return { ok: true, isAdmin: true, session: null };
    }
    const session = await sessionRepository.heartbeat(user.id);
    return { ok: true, isAdmin: false, session };
  },

  async end(user) {
    if (isAdminUser(user)) {
      return { ok: true, session: null };
    }
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
