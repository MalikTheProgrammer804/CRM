export const STATUS_STYLES = {
  New: { badge: "bg-slate-100 text-slate-600", bar: "bg-slate-400" },
  Warm: { badge: "bg-amber-100 text-amber-700", bar: "bg-amber-500" },
  Hot: { badge: "bg-red-100 text-red-600", bar: "bg-red-500" },
  Cold: { badge: "bg-blue-100 text-blue-600", bar: "bg-blue-500" },
  Won: { badge: "bg-teal-100 text-teal-700", bar: "bg-teal-500" },
};

export default function StatusBadge({ status, size = "sm" }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.New;
  const sizeClass = size === "lg" ? "text-sm px-3 py-1" : "text-xs px-2.5 py-1";

  return (
    <span className={`inline-block font-bold rounded-full ${sizeClass} ${style.badge}`}>
      {status}
    </span>
  );
}