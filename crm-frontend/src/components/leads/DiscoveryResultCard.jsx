import { Star, Phone, MapPin } from "lucide-react";

export default function DiscoveryResultCard({ result, selected, onToggle }) {
  const disabled = result.isDuplicate;

  return (
    
    <div
      className={`flex items-start justify-between gap-4 rounded-xl border p-4 mb-3 transition ${
        disabled ? "bg-slate-50 border-slate-200 opacity-70" : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-start gap-3 flex-1">
        <input
          type="checkbox"
          checked={selected}
          disabled={disabled}
          onChange={() => onToggle(result.placeId)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600/40 disabled:opacity-40"
        />

        <div className="flex-1">
          <p className="font-bold text-slate-900">{result.name}</p>

          <div className="flex items-center gap-2 mt-1 mb-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 capitalize">
              {result.category}
            </span>
            {result.rating && (
              <span className="flex items-center gap-1 text-xs text-slate-600">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                {result.rating} ({result.reviewsCount} reviews)
              </span>
            )}
          </div>

          {result.phone && (
            <p className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
              <Phone size={12} /> {result.phone}
            </p>
          )}
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin size={12} /> {result.address}
          </p>
        </div>
      </div>

      <span
        className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
          disabled ? "bg-slate-200 text-slate-500" : "bg-teal-700 text-white"
        }`}
      >
        {disabled ? "ALREADY IN CRM" : "NEW"}
      </span>
    </div>
  );
}