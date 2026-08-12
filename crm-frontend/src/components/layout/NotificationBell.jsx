import { useState } from "react";
import {
  Bell,
  Check,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

function timeAgo(date) {
  const notificationDate = new Date(date);

  if (Number.isNaN(notificationDate.getTime())) {
    return "";
  }

  const seconds = Math.floor(
    (Date.now() - notificationDate.getTime()) / 1000
  );

  if (seconds < 10) return "just now";

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return notificationDate.toLocaleDateString();
}

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAllRead,
    markAsRead,
    clearNotifications,
  } = useNotifications();

  const [open, setOpen] = useState(false);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative text-slate-500 hover:text-slate-700 transition"
        aria-label="Notifications"
      >
        <Bell
          size={20}
          strokeWidth={1.8}
          className={unreadCount > 0 ? "animate-pulse" : ""}
        />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Background overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          {/* Notification Dropdown */}
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-xl z-20 overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Notifications
                </h3>

                {unreadCount > 0 && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {unreadCount} unread notification
                    {unreadCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-800"
                    >
                      <CheckCheck size={14} />
                      Read all
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={clearNotifications}
                    className="text-slate-400 hover:text-red-500 transition"
                    title="Clear all notifications"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <Bell
                    size={28}
                    className="mx-auto text-slate-300 mb-2"
                  />

                  <p className="text-sm font-medium text-slate-500">
                    No notifications yet.
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    New CRM activity will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    type="button"
                    key={notification.id}
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
                    className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 transition ${
                      notification.read
                        ? "bg-white hover:bg-slate-50"
                        : "bg-teal-50/60 hover:bg-teal-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      
                      {/* Status dot */}
                      <div className="pt-1.5">
                        <span
                          className={`block w-2 h-2 rounded-full ${
                            notification.read
                              ? "bg-slate-300"
                              : "bg-teal-500"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            notification.read
                              ? "text-slate-600"
                              : "font-semibold text-slate-900"
                          }`}
                        >
                          {notification.message}
                        </p>

                        <p className="text-[11px] text-slate-400 mt-1">
                          {timeAgo(notification.time)}
                        </p>
                      </div>

                      {!notification.read && (
                        <Check
                          size={15}
                          className="text-teal-500 mt-1"
                        />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
