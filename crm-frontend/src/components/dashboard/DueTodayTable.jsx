const STATUS_STYLES = {
  Hot: "bg-red-50 text-red-600",
  Warm: "bg-amber-50 text-amber-600",
  Cold: "bg-blue-50 text-blue-600",
  New: "bg-teal-50 text-teal-700",
  Won: "bg-emerald-50 text-emerald-700",
  Lost: "bg-slate-100 text-slate-700",
};

export default function DueTodayTable({ rows, darkMode = false, onViewAll, onFollowUp }) {
  return (
    <div className={`overflow-hidden rounded-3xl border shadow-sm ${darkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
      <div className={`flex items-center justify-between border-b px-6 py-4 ${darkMode ? "border-slate-700" : "border-slate-100"}`}>
        <h3 className={`text-xl font-extrabold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>Due Today</h3>
        <button
          type="button"
          onClick={onViewAll}
          className={`text-sm font-semibold ${darkMode ? "text-teal-300 hover:text-teal-200" : "text-teal-700 hover:text-teal-800"}`}
        >
          View All
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className={`border-b text-left ${darkMode ? "border-slate-700 text-slate-400" : "border-slate-100 text-slate-500"}`}>
            <th className="px-6 py-3 font-medium">Business Name</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium">Due Date</th>
            <th className="px-3 py-3 pr-6 text-right font-medium">Follow Up</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className={`border-b last:border-0 ${darkMode ? "border-slate-800" : "border-slate-50"}`}>
              <td className="px-6 py-4">
                <p className={`font-semibold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{row.name}</p>
                <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
                  {row.category} • {row.location}
                </p>
              </td>
              <td className="px-3 py-4">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[row.status] || "bg-slate-100 text-slate-700"}`}>
                  {row.status}
                </span>
              </td>
              <td className="px-3 py-4">
                <span className={`text-sm ${row.overdue ? (darkMode ? "font-medium text-red-400" : "font-medium text-red-600") : darkMode ? "text-slate-300" : "text-slate-600"}`}>
                  {row.dueTime}
                  {row.overdue && " (Overdue)"}
                </span>
              </td>
              <td className="px-3 py-4 pr-6 text-right">
                <button
                  type="button"
                  onClick={() => onFollowUp?.(row)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold text-white transition ${darkMode ? "bg-teal-600 hover:bg-teal-500" : "bg-teal-700 hover:bg-teal-800"}`}
                >
                  Follow Up Now
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}