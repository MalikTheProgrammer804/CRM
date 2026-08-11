import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { leadService } from "../../services/leadService";
import { PIPELINE_STAGES, filterLeads, getLeadStage, sortLeads } from "./pipelineUtils";

export default function Pipeline() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [activeView, setActiveView] = useState("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [sortMode, setSortMode] = useState("newest");
  const [isDragging, setIsDragging] = useState(false);
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    leadService
      .getLeads()
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const filteredLeads = useMemo(() => {
    const stageFiltered = filterLeads(leads, { searchQuery, stageFilter });
    return sortLeads(stageFiltered, sortMode);
  }, [leads, searchQuery, stageFilter, sortMode]);

  // Pipeline Top Metrics
  const totalLeadsCount = leads.length;
  const wonLeadsCount = leads.filter(
    (l) => (l.status || "").toLowerCase() === "won" || (l.stage || "").toLowerCase() === "won"
  ).length;
  const lostLeadsCount = leads.filter(
    (l) => (l.status || "").toLowerCase() === "lost" || (l.stage || "").toLowerCase() === "lost"
  ).length;
  const conversionRate = totalLeadsCount
    ? Math.round((wonLeadsCount / totalLeadsCount) * 100)
    : 0;

  const getLeadsForStage = (stageKey) => {
    return filteredLeads.filter((lead) => getLeadStage(lead).toLowerCase() === stageKey.toLowerCase());
  };

  const handleDrop = async (nextStage) => {
    if (!draggedLeadId) return;

    const targetLead = leads.find((lead) => lead.id === draggedLeadId);
    if (!targetLead) return;

    const nextPayload = {
      ...targetLead,
      stage: nextStage,
      status: nextStage,
    };

    try {
      await leadService.updateLead(draggedLeadId, nextPayload);
      setLeads((current) =>
        current.map((lead) =>
          lead.id === draggedLeadId ? { ...lead, stage: nextStage, status: nextStage } : lead
        )
      );
      setDraggedLeadId(null);
      setIsDragging(false);
    } catch (error) {
      console.error("Failed to update lead stage", error);
    }
  };

  // Helper function to handle stage-specific lead creation
  const handleAddLeadToStage = (stageKey) => {
    navigate(`/leads/new?stage=${encodeURIComponent(stageKey)}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="crm-page-title text-xl font-bold text-[#172b4d]">
            Pipeline
          </h1>
          <select
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none"
          >
            <option value="All">All Pipelines</option>
            {PIPELINE_STAGES.map((stage) => (
              <option key={stage.key} value={stage.key}>
                {stage.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-64">
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0e8e86]"
            />
          </div>

          <button
            type="button"
            onClick={() => navigate("/leads/new")}
            className="flex items-center gap-1.5 rounded-lg bg-[#e86f00] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#d06300]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Lead
          </button>
        </div>
      </div>

      {/* Sub-header: View Toggle & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* View Switcher Buttons */}
        <div className="flex items-center rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setActiveView("kanban")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              activeView === "kanban"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Kanban View
          </button>
          <button
            onClick={() => setActiveView("list")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              activeView === "list"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            List View
          </button>
        </div>

        {/* Filter / Sort Actions */}
        <div className="flex items-center gap-2">
          <select
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <option value="All">Filter: All</option>
            {PIPELINE_STAGES.map((stage) => (
              <option key={stage.key} value={stage.key}>
                {stage.label}
              </option>
            ))}
          </select>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="name">Sort: Name</option>
            <option value="stage">Sort: Stage</option>
          </select>
          <button className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 shadow-sm hover:bg-slate-50">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Metric 1 */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Total Leads</span>
          <span className="text-xl font-bold text-[#172b4d]">{totalLeadsCount}</span>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Won Leads</span>
          <span className="text-xl font-bold text-[#172b4d]">{wonLeadsCount}</span>
        </div>

        {/* Metric 3 */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Conversion Rate</span>
          <span className="text-xl font-bold text-[#172b4d]">{conversionRate}%</span>
        </div>

        {/* Metric 4 */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Lost Leads</span>
          <span className="text-xl font-bold text-[#172b4d]">{lostLeadsCount}</span>
        </div>
      </div>

      {/* Kanban Board Container */}
      {activeView === "kanban" ? (
        <div className="flex gap-3 overflow-x-auto pb-4 pt-2">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = getLeadsForStage(stage.key);

            return (
              <section
                key={stage.key}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(stage.key)}
                className="w-64 min-w-[250px] shrink-0 rounded-xl border border-slate-200 bg-slate-100/60 p-3"
              >
                {/* Column Header */}
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${stage.dotColor}`} />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {stage.label}
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Column Cards List */}
                <div className="space-y-2.5 min-h-[350px]">
                  {stageLeads.map((lead) => (
                    <article
                      key={lead.id}
                      draggable
                      onDragStart={() => {
                        setDraggedLeadId(lead.id);
                        setIsDragging(true);
                      }}
                      onDragEnd={() => {
                        setDraggedLeadId(null);
                        setIsDragging(false);
                      }}
                      className={`crm-card group relative rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${isDragging ? "opacity-70" : "opacity-100"}`}
                      onClick={() => {
                        setSelectedLead(lead);
                        setNotesOpen(true);
                        setNewNote("");
                      }}
                      >
                      {/* Card Business Name */}
                      <p className="text-xs font-bold text-[#172b4d] group-hover:text-[#0e8e86]">
                        {lead.businessName || lead.companyName || "Unnamed Business"}
                      </p>

                      {/* Lead Contact Person */}
                      <p className="mt-1 text-[11px] font-medium text-slate-500">
                        {lead.contactPerson || lead.name || lead.email || "No contact info"}
                      </p>

                      {/* Dynamic Details / Status Badges */}
                      {stage.key === "Lost" ? (
                        <div className="mt-2.5 rounded border border-red-100 bg-red-50/50 p-1.5 text-[10px]">
                          <span className="block font-semibold uppercase text-red-400">REASON</span>
                          <span className="font-medium text-red-600">
                            {lead.lostReason || lead.reason || "Budget Constraints"}
                          </span>
                        </div>
                      ) : stage.key === "Won" ? (
                        <div className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Won: {lead.wonDate || "Recently"}</span>
                        </div>
                      ) : (
                        <p className="mt-2.5 text-[10px] font-medium text-slate-400">
                          {lead.createdAt
                            ? `Added: ${new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                            : lead.lastContacted
                            ? `Contacted: ${lead.lastContacted}`
                            : lead.category || "General"}
                        </p>
                      )}
                    </article>
                  ))}

                  {/* Notes Modal */}
                  {notesOpen && selectedLead && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/40" onClick={() => setNotesOpen(false)} />
                      <div className="relative z-10 w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold">Notes — {selectedLead.businessName || selectedLead.companyName}</h3>
                          <button onClick={() => setNotesOpen(false)} className="text-slate-500">Close</button>
                        </div>

                        <div className="mb-4">
                          <label className="text-xs text-slate-500">Previous Notes</label>
                          <div className="mt-2 max-h-48 overflow-auto rounded border p-3 text-sm bg-slate-50">
                            {selectedLead.notes ? (
                              <pre className="whitespace-pre-wrap">{selectedLead.notes}</pre>
                            ) : (
                              <div className="text-xs text-slate-400">No notes yet.</div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-slate-500">Add / Edit Note</label>
                          <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} className="w-full mt-2 h-24 border p-2 text-sm rounded" />
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              onClick={async () => {
                                if (!newNote || !newNote.trim()) return;
                                try {
                                  await leadService.addNote(selectedLead.id, `${new Date().toLocaleString()} - ${newNote.trim()}`);
                                  // refresh leads list
                                  const updated = await leadService.getLead(selectedLead.id);
                                  setSelectedLead(updated);
                                  setLeads((cur) => cur.map((l) => (l.id === updated.id ? updated : l)));
                                  setNewNote("");
                                } catch (err) {
                                  console.error(err);
                                  alert("Failed to save note.");
                                }
                              }}
                              className="rounded bg-[#0e8e86] px-4 py-2 text-xs text-white"
                            >
                              Save Note
                            </button>
                            <button onClick={() => setNewNote("")} className="text-xs">Clear</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Column Bottom Add Button */}
                  <button
                    type="button"
                    onClick={() => handleAddLeadToStage(stage.key)}
                    className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <span className="text-base leading-none">+</span> Add Lead
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* List View Backup */
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-4">Business Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stage</th>
                <th className="p-4">Contact Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-[#172b4d]">{lead.businessName}</td>
                  <td className="p-4 text-slate-500">{lead.category || "General"}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                      {lead.stage || lead.status || "Fresh Lead"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{lead.phone || lead.email || "No details"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bottom Information Bar */}
      <div className="flex items-center justify-between rounded-xl bg-blue-50/70 p-3 text-xs text-blue-900 border border-blue-100">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[10px]">
            i
          </div>
          <span className="font-medium text-slate-700">
            Note: A lost reason is required before marking a lead as Lost.
          </span>
        </div>
        <button className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
          Manage Lost Reasons
        </button>
      </div>
    </div>
  );
}