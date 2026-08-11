import { Calendar, AlertTriangle } from "lucide-react";

export default function FollowupsCard({ variant = "today", badge, items, footerLabel, darkMode = false, onFooterClick, onActionClick }) {
  const isOverdue = variant === "overdue";

  return (
    <div
      className={`rounded-3xl border p-5 shadow-sm ${
        isOverdue
          ? darkMode
            ? "border-red-800 bg-red-950/50"
            : "border-red-200 bg-red-50/40"
          : darkMode
            ? "border-slate-700 bg-slate-900"
            : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOverdue ? (
            <AlertTriangle size={18} className="text-red-600" />
          ) : (
            <Calendar size={18} className="text-teal-700" />
          )}
          <h3 className={`text-sm font-bold ${isOverdue ? (darkMode ? "text-red-300" : "text-red-700") : darkMode ? "text-slate-100" : "text-slate-900"}`}>
            {isOverdue ? "Overdue Follow-ups" : "Today's Follow-ups"}
          </h3>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isOverdue ? "bg-red-600 text-white" : darkMode ? "bg-teal-800 text-teal-200" : "bg-teal-100 text-teal-800"}`}>
          {badge}
        </span>
      </div>

      <div className="-mx-5 divide-y divide-slate-100 px-5">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${isOverdue ? "bg-red-100 text-red-700" : darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}>
                {item.initials}
              </div>
              <div>
                <p className={`text-sm font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{item.name}</p>
                <p className={`text-xs ${isOverdue ? (darkMode ? "text-red-300" : "text-red-500") : darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  {item.subtitle}
                </p>
              </div>
            </div>
            {item.action && (
              <button
                type="button"
                onClick={() => onActionClick?.(item)}
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
              >
                {item.action}
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onFooterClick}
        className={`mt-3 w-full border-t pt-3 text-center text-xs font-bold ${isOverdue ? (darkMode ? "border-red-800 text-red-300 hover:text-red-200" : "border-red-200 text-red-600 hover:text-red-700") : darkMode ? "border-slate-700 text-teal-300 hover:text-teal-200" : "border-slate-100 text-teal-700 hover:text-teal-800"}`}
      >
        {footerLabel}
      </button>
    </div>
  );
}