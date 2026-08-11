import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronDown,
  Bell,
  HelpCircle,
  MapPin,
  Phone,
  Mail,
  Globe,
  Paperclip,
  MessageSquare,
  X,
  CheckCircle2,
  Calendar,
  Send,
  PhoneCall,
  Repeat,
  FileText,
  User,
  Coffee,
  ExternalLink,
  Edit3
} from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

import QuickActionsCard from "../../components/leads/QuickActionsCard";
import LeadDataCard from "../../components/leads/LeadDataCard";
import SimilarLeadsCard from "../../components/leads/SimilarLeadsCard";
import leadService from "../../services/leadService";
import { taskService } from "../../services/taskService";

const STATUS_CONFIG = {
  New: { label: "New", color: "bg-blue-500", desc: "Fresh lead, no contact made yet." },
  Hot: { label: "Hot", color: "bg-[#d95d08]", desc: "High intent, immediate follow-up required." },
  Warm: { label: "Warm", color: "bg-teal-500", desc: "Expressed interest, but not urgent." },
  Cold: { label: "Cold", color: "bg-slate-400", desc: "Minimal engagement, low priority." },
  Won: { label: "Won", color: "bg-emerald-600", desc: "Deal closed successfully." },
  Lost: { label: "Lost", color: "bg-red-500", desc: "Lead decided not to move forward." },
};

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [action, setAction] = useState(""); // "call" | "email" | "followup" | "status" | "complete_followup" | ""
  const [successModal, setSuccessModal] = useState({ show: false, title: "", message: "" });

  // Call Modal State
  const [callLogging, setCallLogging] = useState(true);
  const [isCalling, setIsCalling] = useState(false);

  // Email Modal State
  const [emailData, setEmailData] = useState({ subject: "", body: "" });

  // Schedule Follow-up Modal State
  const [followupData, setFollowupData] = useState({
    dueAt: "",
    priority: "Medium",
    notes: "",
    repeat: false,
  });

  // Change Status Modal State
  const [selectedStatus, setSelectedStatus] = useState("Hot");

  // Complete Interaction / Follow-up Modal State
  const [interactionData, setInteractionData] = useState({
    type: "Call",
    status: "Hot",
    date: "",
    time: "",
    notes: "",
  });

  useEffect(() => {
    loadLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadLead() {
    try {
      const data = await leadService.getLead(id);
      setLead(data);
      if (data?.status) setSelectedStatus(data.status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this lead?")) return;

    try {
      await leadService.deleteLead(id);
      navigate("/leads");
    } catch (err) {
      alert(err.message);
    }
  }

  async function handlePostNote() {
    if (!note.trim()) return;

    setSubmittingNote(true);
    try {
      await leadService.addNote(id, note.trim());
      setNote("");
      await loadLead();
    } catch (err) {
      alert(err.message || "Unable to add note right now.");
    } finally {
      setSubmittingNote(false);
    }
  }

  // --- Modal Submit Actions connected to REAL Backend Services ---

  async function handleExecuteCall() {
    setIsCalling(true);
    if (callLogging) {
      try {
        await leadService.addNote(id, `Logged Call to ${lead.phone || "Phone"}`);
        await loadLead();
      } catch (err) {
        console.error("Failed to log call:", err);
      }
    }
    // Trigger web dialer / mobile phone call
    window.location.href = `tel:${lead.phone || ""}`;
  }

  async function handleSendEmail(e) {
    e.preventDefault();
    try {
      if (leadService.sendEmail) {
        await leadService.sendEmail(id, emailData);
      } else {
        await leadService.addNote(id, `Email Sent: ${emailData.subject}`);
      }
      setAction("");
      setSuccessModal({
        show: true,
        title: "Email Sent Successfully",
        message: `Your message has been sent to ${lead.email || "the lead"}.`,
      });
      await loadLead();
    } catch (err) {
      alert(err.message || "Failed to send email.");
    }
  }

  async function handleScheduleFollowup(e) {
    e.preventDefault();
    try {
      await taskService.create({
        title: `Follow up with ${displayName}`,
        leadId: id,
        dueAt: followupData.dueAt || null,
        priority: followupData.priority,
        notes: followupData.notes,
        repeat: followupData.repeat,
      });
      setAction("");
      setSuccessModal({
        show: true,
        title: "Task Created Successfully",
        message: "Your new follow-up task has been added to the system.",
      });
    } catch (err) {
      alert(err.message || "Failed to schedule follow-up.");
    }
  }

  async function handleUpdateStatus(e) {
    e.preventDefault();
    try {
      await leadService.updateLead(id, { status: selectedStatus });
      setAction("");
      setSuccessModal({
        show: true,
        title: "Changes Saved",
        message: `Lead status updated to ${selectedStatus}.`,
      });
      await loadLead();
    } catch (err) {
      alert(err.message || "Failed to update status.");
    }
  }

  async function handleCompleteInteraction(e) {
    e.preventDefault();
    try {
      await leadService.addNote(
        id,
        `Interaction [${interactionData.type}]: ${interactionData.notes}`
      );
      if (interactionData.status !== lead.status) {
        await leadService.updateLead(id, { status: interactionData.status });
      }
      if (interactionData.date) {
        await taskService.create({
          title: `Next Action with ${displayName}`,
          leadId: id,
          dueAt: `${interactionData.date}T${interactionData.time || "10:00"}`,
          priority: "Medium",
        });
      }
      setAction("");
      setSuccessModal({
        show: true,
        title: "Follow-up Completed",
        message: "The follow-up log has been recorded successfully.",
      });
      await loadLead();
    } catch (err) {
      alert(err.message || "Failed to record interaction.");
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500 font-semibold">Loading Lead Profile...</div>;
  }

  if (!lead) {
    return <div className="flex h-screen items-center justify-center text-slate-500 font-semibold">Lead not found.</div>;
  }

  const displayName = lead.businessName || lead.name || "Untitled Lead";

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Top Header Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-500 flex items-center gap-2">
          <Link to="/leads" className="hover:text-slate-900 transition">Leads</Link>
          <span>/</span>
          <span className="font-bold text-slate-800">{displayName}</span>
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/leads/${id}/edit`)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition shadow-sm"
          >
            Delete
          </button>
          <button
            onClick={() => setAction("status")}
            className="flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-xs font-bold text-[#d95d08] hover:bg-orange-200 transition"
          >
            <span className="w-2 h-2 rounded-full bg-[#d95d08]" />
            {lead.status || "New"}
            <ChevronDown size={14} />
          </button>
          <button className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
            <Bell size={18} />
          </button>
          <button className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
            <HelpCircle size={18} />
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Main Hero Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                <Coffee size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">{displayName}</h1>
                <p className="mt-1 text-sm text-slate-500">
                  {lead.category || "General Business"} {lead.address ? `• ${lead.address.split(',')[1] || lead.address}` : ""}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">Priority</span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">VIP</span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">Inbound</span>
                </div>
              </div>
            </div>

            {/* Lead Score Indicator */}
            <div className="flex flex-col items-center justify-center border-4 border-[#d95d08] w-20 h-20 rounded-full shrink-0">
              <span className="text-xl font-black text-slate-900">{lead.score || 85}</span>
              <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Score</span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Contact Information</h2>
              <button onClick={() => navigate(`/leads/${id}/edit`)} className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1">
                <Edit3 size={13} /> Edit
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 text-sm">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Owner</label>
                <div className="mt-1.5 flex items-center gap-2 font-semibold text-slate-800">
                  <User size={15} className="text-slate-400" />
                  {lead.ownerName || lead.assignedTo || "Unassigned"}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Phone</label>
                <div className="mt-1.5 flex items-center gap-2 font-semibold text-slate-800">
                  <Phone size={15} className="text-slate-400" />
                  <a href={`tel:${lead.phone}`} className="hover:text-[#d95d08]">{lead.phone || "Not Available"}</a>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                <div className="mt-1.5 flex items-center gap-2 font-semibold text-slate-800">
                  <Mail size={15} className="text-slate-400" />
                  <a href={`mailto:${lead.email}`} className="hover:text-[#d95d08]">{lead.email || "Not Available"}</a>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Website</label>
                <div className="mt-1.5 flex items-center gap-2 font-semibold text-slate-800 truncate">
                  <Globe size={15} className="text-slate-400 shrink-0" />
                  {lead.website ? (
                    <a href={lead.website} target="_blank" rel="noreferrer" className="text-[#d95d08] hover:underline truncate">
                      {lead.website}
                    </a>
                  ) : (
                    "Not Available"
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Address</label>
                <p className="mt-1.5 flex items-start gap-2 text-sm font-semibold text-slate-800">
                  <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  {lead.address || "Not available"}
                </p>
                {lead.googleMapsLink && (
                  <a
                    href={lead.googleMapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                  >
                    View on Google Maps <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Location Graphic Block */}
              <div className="w-full md:w-48 h-24 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative flex items-center justify-center shrink-0">
                <MapPin size={24} className="text-[#d95d08]" />
              </div>
            </div>
          </div>

          {/* Social Presence */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-around">
            <a href={lead.facebook || "#"} target={lead.facebook ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600">
              <FaFacebook size={18} className="text-blue-600" /> Facebook
            </a>
            <div className="h-4 w-px bg-slate-200" />
            <a href={lead.instagram || "#"} target={lead.instagram ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-pink-600">
              <FaInstagram size={18} className="text-pink-600" /> Instagram
            </a>
            <div className="h-4 w-px bg-slate-200" />
            <a href={lead.linkedin || "#"} target={lead.linkedin ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-700">
              <FaLinkedin size={18} className="text-blue-700" /> LinkedIn
            </a>
          </div>

          {/* Activity & Notes */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-slate-400">Activity & Notes</h2>

            <div className="relative mb-6">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note or update..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 p-3.5 pr-24 text-sm outline-none focus:border-[#d95d08] focus:ring-2 focus:ring-[#d95d08]/20 transition"
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600">
                  <Paperclip size={16} />
                </button>
                <button
                  onClick={handlePostNote}
                  disabled={submittingNote}
                  className="rounded-lg bg-[#d95d08] px-4 py-2 text-xs font-bold text-white hover:bg-[#c45305] transition disabled:opacity-60"
                >
                  {submittingNote ? "Posting..." : "Post"}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <MessageSquare size={16} className="text-[#d95d08]" />
                Recent Notes & Logs
              </div>
              <p className="mt-2 text-sm whitespace-pre-line text-slate-600">
                {lead.notes || "No notes added yet."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <QuickActionsCard onAction={(next) => setAction(next)} />
          
          <LeadDataCard
            data={[
              { label: "Assigned To", value: lead.assignedTo || "Unassigned" },
              { label: "Source", value: lead.source || "Google Maps" },
              { label: "Date Added", value: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "Dec 08, 2023" },
              { label: "Last Contact", value: "2h ago" },
            ]}
            nextFollowUp={{ time: "Tomorrow, 10:00", note: "Review quotation with Marco." }}
          />

          <SimilarLeadsCard leads={lead.similarLeads || []} />
        </div>
      </div>

      {/* ================= MODAL OVERLAYS (MATCHING DESIGN REFERENCE) ================= */}

      {/* 1. CALL NOW POPUP */}
      {action === "call" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
            <button onClick={() => setAction("")} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>

            <div className="mx-auto my-3 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <PhoneCall size={28} />
            </div>

            <h3 className="text-base font-extrabold text-slate-900">Call {displayName}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{lead.ownerName || "Owner"} • Lead</p>

            <p className="my-5 text-2xl font-black tracking-tight text-slate-900">{lead.phone || "+39 081 234 5678"}</p>

            <button
              onClick={handleExecuteCall}
              className="w-full rounded-2xl bg-[#d95d08] py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[#c45305] transition flex items-center justify-center gap-2"
            >
              <Phone size={18} /> Call Now
            </button>

            <div className="mt-4 flex flex-col items-center gap-3">
              <button onClick={() => navigator.clipboard.writeText(lead.phone || "")} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                Copy Number
              </button>

              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={callLogging}
                  onChange={(e) => setCallLogging(e.target.checked)}
                  className="rounded border-slate-300 text-[#d95d08] focus:ring-[#d95d08]"
                />
                Log this call automatically
              </label>
            </div>

            <div className="mt-6 -mx-6 -mb-6 bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                {isCalling ? "CALLING..." : "READY"}
              </span>
              <button onClick={() => setAction("")} className="rounded-lg bg-red-600 px-4 py-1.5 font-bold text-white hover:bg-red-700">
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SEND EMAIL POPUP */}
      {action === "email" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="text-center mb-4">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Mail size={22} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Send Email to {displayName}</h3>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">To</label>
                <input
                  readOnly
                  value={lead.email || "m.rossi@caferoma.it"}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Subject</label>
                <input
                  required
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  placeholder="Enter subject line..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#d95d08]"
                />
              </div>

              <div className="flex justify-between items-center text-xs text-teal-700 font-bold">
                <button type="button" className="hover:underline flex items-center gap-1">
                  <FileText size={14} /> Use Template
                </button>
                <button type="button" className="hover:underline flex items-center gap-1">
                  <Paperclip size={14} /> Attach File
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={emailData.body}
                  onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                  placeholder="Write your message here..."
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-[#d95d08]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAction("")}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#d95d08] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#c45305] flex items-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  <Send size={15} /> Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SCHEDULE FOLLOW-UP POPUP */}
      {action === "followup" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 relative">
            <button onClick={() => setAction("")} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-[#d95d08]">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Schedule Follow-up</h3>
                <p className="text-xs text-slate-400">{displayName} — {lead.ownerName || "Owner"}</p>
              </div>
            </div>

            <form onSubmit={handleScheduleFollowup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={followupData.dueAt}
                  onChange={(e) => setFollowupData({ ...followupData, dueAt: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-700 outline-none focus:border-[#d95d08]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Priority</label>
                <div className="flex gap-2">
                  {["Low", "Medium", "High"].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setFollowupData({ ...followupData, priority: p })}
                      className={`flex-1 rounded-full py-1.5 text-xs font-bold border transition ${
                        followupData.priority === p
                          ? "bg-blue-50 border-blue-500 text-blue-600"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Reminder Notes</label>
                <textarea
                  rows={3}
                  value={followupData.notes}
                  onChange={(e) => setFollowupData({ ...followupData, notes: e.target.value })}
                  placeholder="Review quotation with Marco."
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#d95d08]"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Repeat size={14} /> Repeat this follow-up
                </span>
                <input
                  type="checkbox"
                  checked={followupData.repeat}
                  onChange={(e) => setFollowupData({ ...followupData, repeat: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#d95d08] focus:ring-[#d95d08]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAction("")}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#d95d08] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#c45305] shadow-lg shadow-orange-500/20"
                >
                  Save Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. CHANGE LEAD STATUS POPUP */}
      {action === "status" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Repeat size={22} />
            </div>

            <h3 className="text-base font-extrabold text-slate-900">Change Lead Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current status: <span className="font-bold text-[#d95d08]">• {lead.status || "New"}</span>
            </p>

            <form onSubmit={handleUpdateStatus} className="mt-5 space-y-2.5 text-left">
              {Object.keys(STATUS_CONFIG).map((key) => {
                const conf = STATUS_CONFIG[key];
                const active = selectedStatus === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedStatus(key)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                      active ? "border-teal-500 bg-teal-50/30" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      checked={active}
                      onChange={() => setSelectedStatus(key)}
                      className="mt-1 text-teal-600 focus:ring-teal-500"
                    />
                    <div>
                      <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900">
                        <span className={`h-2 w-2 rounded-full ${conf.color}`} />
                        {conf.label}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{conf.desc}</p>
                    </div>
                  </div>
                );
              })}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAction("")}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#162b55] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0f1f40]"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. COMPLETE FOLLOW-UP / INTERACTION POPUP */}
      {action === "complete_followup" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 p-4 px-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-slate-800 text-sm">
                <Calendar size={18} className="text-[#d95d08]" /> Follow Up
              </div>
              <button onClick={() => setAction("")} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCompleteInteraction} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Log Interaction</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInteractionData({ ...interactionData, type: "Call" })}
                    className={`py-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 ${
                      interactionData.type === "Call"
                        ? "bg-slate-100 border-slate-400 text-slate-900"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    <Phone size={15} /> Call
                  </button>
                  <button
                    type="button"
                    onClick={() => setInteractionData({ ...interactionData, type: "Email" })}
                    className={`py-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 ${
                      interactionData.type === "Email"
                        ? "bg-slate-100 border-slate-400 text-slate-900"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    <Mail size={15} /> Email
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Lead Status</label>
                  <select
                    value={interactionData.status}
                    onChange={(e) => setInteractionData({ ...interactionData, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 outline-none"
                  >
                    {Object.keys(STATUS_CONFIG).map((st) => (
                      <option key={st} value={st}>🔥 {st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Schedule Next Action</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={interactionData.date}
                      onChange={(e) => setInteractionData({ ...interactionData, date: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2 text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={interactionData.notes}
                  onChange={(e) => setInteractionData({ ...interactionData, notes: e.target.value })}
                  placeholder="Briefly log what happened during this interaction..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#d95d08]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAction("")}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#d95d08] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#c45305] flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
                >
                  <CheckCircle2 size={15} /> Complete Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. GLOBAL SUCCESS CONFIRMATION MODAL */}
      {successModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">{successModal.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{successModal.message}</p>
            <button
              onClick={() => setSuccessModal({ show: false, title: "", message: "" })}
              className="mt-5 w-full rounded-xl bg-[#d95d08] py-2.5 text-xs font-bold text-white hover:bg-[#c45305] transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}