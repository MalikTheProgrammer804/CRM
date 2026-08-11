import { CalendarClock } from "lucide-react";

export default function LeadDataCard({ data, nextFollowUp }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-xs font-bold tracking-wide text-slate-400 uppercase mb-4">
        Data
      </h3>

      <dl className="space-y-3.5 mb-5">
        {data.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-semibold text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>

      {nextFollowUp && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wide mb-1.5">
            <CalendarClock size={13} /> Next Follow-up
          </div>
          <p className="text-lg font-extrabold text-amber-800 mb-1">
            {nextFollowUp.time}
          </p>
          <p className="text-xs text-amber-700">{nextFollowUp.note}</p>
        </div>
      )}
    </div>
  );
}