import { Phone, Mail, CalendarPlus, ArrowLeftRight, ChevronRight } from "lucide-react";

const ACTIONS = [
  { key: "call", label: "Call Now", icon: Phone, variant: "solid" },
  { key: "email", label: "Send Email", icon: Mail },
  { key: "followup", label: "Schedule Follow-up", icon: CalendarPlus },
  { key: "status", label: "Change Status", icon: ArrowLeftRight },
];
export default function QuickActionsCard({ onAction }) {
  return <div className="crm-card p-5"><h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Quick Actions</h3><div className="space-y-2.5">{ACTIONS.map(({ key, label, icon: Icon, variant }) => <button key={key} onClick={() => onAction(key)} className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition ${variant === "solid" ? "bg-[#e86f00] text-white hover:bg-[#c85e00]" : "border border-[#162b55] text-[#172b4d] hover:bg-slate-50"}`}><span className="flex items-center gap-2.5"><Icon size={16} />{label}</span><ChevronRight size={16} /></button>)}</div></div>;
}
