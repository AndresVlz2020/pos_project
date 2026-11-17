import { useEffect, useState } from "react";
import {
  getAuthToken,
  getStoredAuthUser,
  getUserRoleFlags,
} from "@/shared/utils/authStorage";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";

function getDismissedStorageKey(userId) {
  return `dpiero_dismissed_notifs_${userId || "u"}`;
}

function readDismissedSet(userId) {
  try {
    const raw = sessionStorage.getItem(getDismissedStorageKey(userId));
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map(Number) : []);
  } catch {
    return new Set();
  }
}

function addDismissedIds(userId, ids) {
  try {
    const next = readDismissedSet(userId);
    ids.forEach((id) => next.add(Number(id)));
    sessionStorage.setItem(
      getDismissedStorageKey(userId),
      JSON.stringify(Array.from(next).slice(-120))
    );
  } catch {
    // ignorar error de almacenamiento
  }
}

function mergeUnreadBanners(prev, rows, userId) {
  const dismissed = readDismissedSet(userId);
  const freshUnread = rows.filter(
    (n) => !n.isRead && !dismissed.has(Number(n.id))
  );
  if (freshUnread.length === 0) return prev;
  const prevIds = new Set(prev.map((p) => Number(p.id)));
  const additions = freshUnread
    .slice(0, 3)
    .filter((n) => !prevIds.has(Number(n.id)));
  if (additions.length === 0) return prev;
  return [...additions, ...prev].slice(0, 3);
}

/**
 * Hook de notificaciones persistentes en tiempo real para Mesero (y Admin).
 * Consulta /api/notifications cada 5s y gestiona:
 *  - lista guardada en la campanita (PostgreSQL)
 *  - banners flotantes en la zona superior (sin SweetAlert)
 */
export function useOrderNotifications() {
  const user = getStoredAuthUser();
  const { isAdmin, isMesero } = getUserRoleFlags(user);
  const token = getAuthToken();
  const enabled = Boolean(token && (isMesero || isAdmin));
  const userId = user?.id || null;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [topBanners, setTopBanners] = useState([]);
  const [loading, setLoading] = useState(false);

  const dismissBanner = (notificationId) => {
    const numId = Number(notificationId);
    addDismissedIds(userId, [numId]);
    setTopBanners((prev) => prev.filter((item) => Number(item.id) !== numId));
  };

  const applyNotificationSnapshot = (data) => {
    const rows = Array.isArray(data?.notifications) ? data.notifications : [];
    setNotifications(rows);
    setUnreadCount(Number(data?.unreadCount || 0));
    setTopBanners((prev) => mergeUnreadBanners(prev, rows, userId));
  };

  const refresh = async () => {
    if (!enabled) {
      setNotifications([]);
      setUnreadCount(0);
      setTopBanners([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getNotifications();
      applyNotificationSnapshot(data);
    } catch (err) {
      console.warn("Error consultando notificaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  // Autodescartar banners flotantes tras 12s (permanecen guardados en la campanita)
  useEffect(() => {
    if (topBanners.length === 0) return;
    const oldestBanner = topBanners[topBanners.length - 1];
    const timerId = setTimeout(() => {
      const numId = Number(oldestBanner.id);
      addDismissedIds(userId, [numId]);
      setTopBanners((prev) => prev.filter((item) => Number(item.id) !== numId));
    }, 12000);
    return () => clearTimeout(timerId);
  }, [topBanners, userId]);

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    const poll = async () => {
      try {
        const data = await getNotifications();
        if (!active) return;
        const rows = Array.isArray(data?.notifications) ? data.notifications : [];
        setNotifications(rows);
        setUnreadCount(Number(data?.unreadCount || 0));
        setTopBanners((prev) => mergeUnreadBanners(prev, rows, userId));
      } catch (err) {
        console.warn("Error consultando notificaciones:", err);
      }
    };

    Promise.resolve().then(() => {
      if (active) poll();
    });

    const intervalId = setInterval(poll, 5000);
    const onVisible = () => {
      if (document.visibilityState === "visible") poll();
    };
    const onRefreshEvent = () => poll();

    window.addEventListener("focus", onRefreshEvent);
    window.addEventListener("dpiero:notifications-refresh", onRefreshEvent);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      clearInterval(intervalId);
      window.removeEventListener("focus", onRefreshEvent);
      window.removeEventListener("dpiero:notifications-refresh", onRefreshEvent);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, userId]);

  const markRead = async (notificationId) => {
    dismissBanner(notificationId);
    setNotifications((prev) =>
      prev.map((n) =>
        Number(n.id) === Number(notificationId) ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await markNotificationAsRead(notificationId);
    } catch (err) {
      console.warn("Error marcando notificación como leída:", err);
    } finally {
      refresh();
    }
  };

  const markAllRead = async () => {
    addDismissedIds(
      userId,
      notifications.map((n) => Number(n.id))
    );
    setTopBanners([]);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.warn("Error marcando todas como leídas:", err);
    } finally {
      refresh();
    }
  };

  return {
    enabled,
    notifications,
    unreadCount,
    topBanners,
    loading,
    refresh,
    markRead,
    markAllRead,
    dismissBanner,
  };
}
