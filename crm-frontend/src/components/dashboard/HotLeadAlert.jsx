import { Flame, Mail, Phone } from "lucide-react";

export default function HotLeadsAlert({ leads, darkMode = false }) {
  return (
    <div className={`rounded-3xl border-2 p-5 shadow-sm ${darkMode ? "border-orange-700 bg-slate-900" : "border-orange-200 bg-white"}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={18} className="text-orange-500" fill="currentColor" />
          <h3 className={`text-sm font-extrabold ${darkMode ? "text-orange-400" : "text-orange-600"}`}>Hot Leads Alert</h3>
        </div>
        <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">URGENT</span>
      </div>

      <div className="space-y-3">
        {leads.map((lead) => (
          <div key={lead.name} className={`rounded-2xl border p-4 ${darkMode ? "border-slate-700 bg-slate-800/80" : "border-slate-100 bg-white"}`}>
            <div className="mb-2 flex items-start justify-between">
              <p className={`text-sm font-bold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{lead.name}</p>
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">HOT</span>
            </div>
            <div className={`mb-3 flex items-center gap-1.5 text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {lead.contactType === "email" ? <Mail size={13} /> : <Phone size={13} />}
              {lead.contact}
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Last active: {lead.lastActive}</span>
              <button className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-teal-800">
                Follow Up Now
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className={`mt-4 w-full border-t pt-3 text-center text-xs font-bold ${darkMode ? "border-slate-700 text-red-400 hover:text-red-300" : "border-slate-100 text-red-600 hover:text-red-700"}`}>
        VIEW ALL HOT LEADS
      </button>
    </div>
  );
}