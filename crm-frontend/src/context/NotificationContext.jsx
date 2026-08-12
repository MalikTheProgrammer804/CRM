import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

const NotificationContext = createContext(null);

const STORAGE_KEY = "crm_notifications";

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return [];

      const parsed = JSON.parse(saved);

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to load notifications:", error);
      return [];
    }
  });

  const saveNotifications = (nextNotifications) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nextNotifications)
      );
    } catch (error) {
      console.error("Failed to save notifications:", error);
    }
  };

  const addNotification = useCallback((message, type = "info") => {
    const notification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      message,
      type,
      time: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => {
      const next = [notification, ...prev].slice(0, 20);

      saveNotifications(next);

      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((notification) => ({
        ...notification,
        read: true,
      }));

      saveNotifications(next);

      return next;
    });
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => {
      const next = prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      );

      saveNotifications(next);

      return next;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAllRead,
        markAsRead,
        clearNotifications,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}
