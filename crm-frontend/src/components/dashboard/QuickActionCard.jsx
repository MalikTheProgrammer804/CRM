export default function QuickActionCard({ icon: Icon, label, iconBg, iconColor, onClick, darkMode = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-12 shadow-sm transition hover:-translate-y-1.5 hover:border-teal-300 hover:shadow-md w-full ${darkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}
    >
      <div className="flex h-22 w-22 items-center justify-center rounded-full" style={{ backgroundColor: iconBg }}>
        <Icon size={32} style={{ color: iconColor }} strokeWidth={2} />
      </div>
      <span className={`text-sm font-bold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
        {label}
      </span>
    </button>
  );
}