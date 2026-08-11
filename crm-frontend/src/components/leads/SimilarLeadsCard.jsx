import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, Coffee } from "lucide-react";

const ICONS = { restaurant: UtensilsCrossed, cafe: Coffee };

export default function SimilarLeadsCard({ leads }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-xs font-bold tracking-wide text-slate-400 uppercase mb-4">
        Similar Leads
      </h3>

      <div className="space-y-3">
        {leads.map((lead) => {
          const Icon = ICONS[lead.iconType] || UtensilsCrossed;
          return (
            <button
              key={lead.id}
              onClick={() => navigate(`/leads/${lead.id}`)}
              className="w-full flex items-center gap-3 text-left hover:bg-slate-50 rounded-lg p-1.5 -m-1.5 transition"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{lead.name}</p>
                <p className="text-xs text-slate-400">
                  {lead.category} • {lead.status}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}