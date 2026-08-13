import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { leadService } from "../../services/leadService";
import {
  PIPELINE_STAGES,
  filterLeads,
  getLeadStage,
  sortLeads,
} from "./pipelineUtils";
import { useTheme } from "../../context/ThemeContext";

export default function Pipeline() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

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
    const stageFiltered = filterLeads(leads, {
      searchQuery,
      stageFilter,
    });

    return sortLeads(stageFiltered, sortMode);
  }, [leads, searchQuery, stageFilter, sortMode]);

  // =========================================================
  // METRICS
  // =========================================================

  const totalLeadsCount = leads.length;

  const wonLeadsCount = leads.filter(
    (l) =>
      (l.status || "").toLowerCase() === "won" ||
      (l.stage || "").toLowerCase() === "won"
  ).length;

  const lostLeadsCount = leads.filter(
    (l) =>
      (l.status || "").toLowerCase() === "lost" ||
      (l.stage || "").toLowerCase() === "lost"
  ).length;

  const conversionRate = totalLeadsCount
    ? Math.round((wonLeadsCount / totalLeadsCount) * 100)
    : 0;

  const getLeadsForStage = (stageKey) => {
    return filteredLeads.filter(
      (lead) =>
        getLeadStage(lead).toLowerCase() === stageKey.toLowerCase()
    );
  };

  // =========================================================
  // DRAG & DROP
  // =========================================================

  const handleDrop = async (nextStage) => {
    if (!draggedLeadId) return;

    const targetLead = leads.find(
      (lead) => lead.id === draggedLeadId
    );

    if (!targetLead) return;

    const nextPayload = {
      ...targetLead,
      stage: nextStage,
      status: nextStage,
    };

    try {
      await leadService.updateLead(
        draggedLeadId,
        nextPayload
      );

      setLeads((current) =>
        current.map((lead) =>
          lead.id === draggedLeadId
            ? {
                ...lead,
                stage: nextStage,
                status: nextStage,
              }
            : lead
        )
      );

      setDraggedLeadId(null);
      setIsDragging(false);
    } catch (error) {
      console.error(
        "Failed to update lead stage",
        error
      );
    }
  };

  const handleAddLeadToStage = (stageKey) => {
    navigate(
      `/leads/new?stage=${encodeURIComponent(stageKey)}`
    );
  };

  // =========================================================
  // STYLE TOKENS
  // =========================================================

  const pageTitle = isDark
    ? "text-slate-100"
    : "text-[#172b4d]";

  const cardBase = isDark
    ? "border border-slate-700 bg-slate-900"
    : "border border-slate-200 bg-white";

  const cardShadow = isDark
    ? ""
    : "shadow-sm";

  const cardHover =
    "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg " +
    (isDark
      ? "hover:border-teal-500"
      : "hover:border-teal-300");

  const mutedLabel = isDark
    ? "text-slate-400"
    : "text-slate-500";

  const inputBase = isDark
    ? "border border-slate-600 bg-slate-800 text-slate-100 placeholder-slate-500"
    : "border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400";

  const selectBase = isDark
    ? "border border-slate-600 bg-slate-800 text-slate-200"
    : "border border-slate-200 bg-white text-slate-600";

  const columnBase = isDark
    ? "border border-slate-700 bg-slate-800/70"
    : "border border-slate-200 bg-slate-100/70";

  const leadCard = isDark
    ? "border border-slate-700 bg-slate-900 hover:shadow-lg hover:shadow-teal-900/30 hover:border-teal-500"
    : "border border-slate-200 bg-white hover:shadow-md hover:border-teal-300";

  return (
    <div className="flex min-h-0 w-full flex-col gap-5">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1
            className={`crm-page-title text-3xl font-extrabold ${pageTitle}`}
          >
            Pipeline
          </h1>

          <select
            value={stageFilter}
            onChange={(event) =>
              setStageFilter(event.target.value)
            }
            className={`
              rounded-lg px-3 py-2
              text-sm font-semibold
              shadow-sm
              focus:outline-none
              focus:ring-2 focus:ring-[#0e8e86]
              ${selectBase}
            `}
          >
            <option value="All">All Pipelines</option>

            {PIPELINE_STAGES.map((stage) => (
              <option
                key={stage.key}
                value={stage.key}
              >
                {stage.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search + Add */}
        <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
          <div className="relative w-full sm:w-72 xl:w-80">
            <svg
              className={`
                absolute left-3 top-1/2
                h-5 w-5 -translate-y-1/2
                ${
                  isDark
                    ? "text-slate-500"
                    : "text-slate-400"
                }
              `}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className={`
                h-11 w-full rounded-lg
                py-2.5 pl-10 pr-4
                text-sm
                transition-all
                focus:outline-none
                focus:ring-2
                focus:ring-[#0e8e86]
                ${inputBase}
              `}
            />
          </div>

          <button
            type="button"
            onClick={() => navigate("/leads/new")}
            className="
              flex h-11
              items-center justify-center
              gap-2 rounded-lg
              bg-[#e86f00]
              px-5
              text-sm font-semibold
              text-white
              shadow-sm
              transition-all duration-200
              hover:-translate-y-0.5
              hover:bg-[#d06300]
              hover:shadow-md
              active:translate-y-0
            "
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>

            Add Lead
          </button>
        </div>
      </div>

      {/* =====================================================
          VIEW / FILTER BAR
          ===================================================== */}

      <div
        className={`
          flex flex-col gap-3
          border-b pb-4
          sm:flex-row
          sm:items-center
          sm:justify-between
          ${
            isDark
              ? "border-slate-700"
              : "border-slate-200"
          }
        `}
      >
        {/* View Toggle */}
        <div
          className={`
            flex w-fit items-center
            rounded-lg p-1
            ${
              isDark
                ? "bg-slate-800"
                : "bg-slate-100"
            }
          `}
        >
          <button
            onClick={() => setActiveView("kanban")}
            className={`
              rounded-md
              px-4 py-2
              text-sm font-semibold
              transition-all duration-200
              ${
                activeView === "kanban"
                  ? isDark
                    ? "bg-slate-700 text-slate-100 shadow-sm"
                    : "bg-white text-slate-800 shadow-sm"
                  : isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-500 hover:text-slate-700"
              }
            `}
          >
            Kanban View
          </button>

          <button
            onClick={() => setActiveView("list")}
            className={`
              rounded-md
              px-4 py-2
              text-sm font-semibold
              transition-all duration-200
              ${
                activeView === "list"
                  ? isDark
                    ? "bg-slate-700 text-slate-100 shadow-sm"
                    : "bg-white text-slate-800 shadow-sm"
                  : isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-500 hover:text-slate-700"
              }
            `}
          >
            List View
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={stageFilter}
            onChange={(event) =>
              setStageFilter(event.target.value)
            }
            className={`
              rounded-lg
              px-3 py-2
              text-sm font-semibold
              shadow-sm
              focus:outline-none
              ${selectBase}
            `}
          >
            <option value="All">
              Filter: All
            </option>

            {PIPELINE_STAGES.map((stage) => (
              <option
                key={stage.key}
                value={stage.key}
              >
                {stage.label}
              </option>
            ))}
          </select>

          <select
            value={sortMode}
            onChange={(event) =>
              setSortMode(event.target.value)
            }
            className={`
              rounded-lg
              px-3 py-2
              text-sm font-semibold
              shadow-sm
              focus:outline-none
              ${selectBase}
            `}
          >
            <option value="newest">
              Sort: Newest
            </option>
            <option value="oldest">
              Sort: Oldest
            </option>
            <option value="name">
              Sort: Name
            </option>
            <option value="stage">
              Sort: Stage
            </option>
          </select>
        </div>
      </div>

      {/* =====================================================
          METRICS
          ===================================================== */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Total Leads"
          value={totalLeadsCount}
          icon="users"
          isDark={isDark}
          pageTitle={pageTitle}
          cardBase={cardBase}
          cardShadow={cardShadow}
          cardHover={cardHover}
          mutedLabel={mutedLabel}
        />

        <MetricCard
          label="Won Leads"
          value={wonLeadsCount}
          icon="won"
          isDark={isDark}
          pageTitle={pageTitle}
          cardBase={cardBase}
          cardShadow={cardShadow}
          cardHover={cardHover}
          mutedLabel={mutedLabel}
        />

        <MetricCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          icon="rate"
          isDark={isDark}
          pageTitle={pageTitle}
          cardBase={cardBase}
          cardShadow={cardShadow}
          cardHover={cardHover}
          mutedLabel={mutedLabel}
        />

        <MetricCard
          label="Lost Leads"
          value={lostLeadsCount}
          icon="lost"
          isDark={isDark}
          pageTitle={pageTitle}
          cardBase={cardBase}
          cardShadow={cardShadow}
          cardHover={cardHover}
          mutedLabel={mutedLabel}
        />
      </div>

      {/* =====================================================
          KANBAN
          ===================================================== */}

      {activeView === "kanban" ? (
        <div className="min-w-0 w-full">
          <div
            className="
              flex w-full
              gap-4
              overflow-x-auto
              overflow-y-hidden
              pb-4 pt-1
              snap-x snap-mandatory
            "
          >
            {PIPELINE_STAGES.map((stage) => {
              const stageLeads =
                getLeadsForStage(stage.key);

              return (
                <section
                  key={stage.key}
                  onDragOver={(event) =>
                    event.preventDefault()
                  }
                  onDrop={() =>
                    handleDrop(stage.key)
                  }
                  className={`
                    flex
                    w-[290px]
                    min-w-[290px]
                    max-w-[340px]
                    shrink-0
                    snap-start
                    flex-col
                    rounded-xl
                    p-4
                    transition-colors
                    ${columnBase}
                  `}
                >
                  {/* Column Header */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`
                          h-3 w-3
                          shrink-0
                          rounded-full
                          ${stage.dotColor}
                        `}
                      />

                      <h2
                        className={`
                          truncate
                          text-base
                          font-bold
                          uppercase
                          tracking-wide
                          ${
                            isDark
                              ? "text-slate-200"
                              : "text-slate-700"
                          }
                        `}
                      >
                        {stage.label}
                      </h2>
                    </div>

                    <span
                      className={`
                        ml-2
                        rounded-full
                        px-2.5 py-1
                        text-xs
                        font-bold
                        ${
                          isDark
                            ? "bg-slate-700 text-slate-300"
                            : "bg-white text-slate-600"
                        }
                      `}
                    >
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div
                    className="
                      min-h-[420px]
                      flex-1
                      space-y-3
                    "
                  >
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
                        className={`
                          crm-card
                          group
                          relative
                          cursor-pointer
                          rounded-xl
                          p-4
                          transition-all
                          duration-200
                          hover:-translate-y-0.5
                          ${leadCard}
                          ${
                            isDragging
                              ? "opacity-70"
                              : "opacity-100"
                          }
                        `}
                        onClick={() => {
                          setSelectedLead(lead);
                          setNotesOpen(true);
                          setNewNote("");
                        }}
                      >
                        <p
                          className={`
                            text-base
                            font-bold
                            leading-snug
                            group-hover:text-[#0e8e86]
                            ${
                              isDark
                                ? "text-slate-100"
                                : "text-[#172b4d]"
                            }
                          `}
                        >
                          {lead.businessName ||
                            lead.companyName ||
                            "Unnamed Business"}
                        </p>

                        <p
                          className={`
                            mt-2
                            text-sm
                            font-medium
                            ${
                              isDark
                                ? "text-slate-400"
                                : "text-slate-500"
                            }
                          `}
                        >
                          {lead.contactPerson ||
                            lead.name ||
                            lead.email ||
                            "No contact info"}
                        </p>

                        {stage.key === "Lost" ? (
                          <div
                            className={`
                              mt-3
                              rounded-lg
                              border
                              p-2.5
                              text-xs
                              ${
                                isDark
                                  ? "border-red-900/50 bg-red-950/40"
                                  : "border-red-100 bg-red-50/60"
                              }
                            `}
                          >
                            <span
                              className={`
                                block
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wide
                                ${
                                  isDark
                                    ? "text-red-400"
                                    : "text-red-500"
                                }
                              `}
                            >
                              Reason
                            </span>

                            <span
                              className={
                                isDark
                                  ? "font-medium text-red-300"
                                  : "font-medium text-red-600"
                              }
                            >
                              {lead.lostReason ||
                                lead.reason ||
                                "Budget Constraints"}
                            </span>
                          </div>
                        ) : stage.key === "Won" ? (
                          <div
                            className={`
                              mt-3
                              flex
                              items-center
                              gap-1.5
                              text-sm
                              font-medium
                              ${
                                isDark
                                  ? "text-emerald-400"
                                  : "text-emerald-600"
                              }
                            `}
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>

                            <span>
                              Won:{" "}
                              {lead.wonDate ||
                                "Recently"}
                            </span>
                          </div>
                        ) : (
                          <p
                            className={`
                              mt-3
                              text-xs
                              font-medium
                              ${
                                isDark
                                  ? "text-slate-500"
                                  : "text-slate-400"
                              }
                            `}
                          >
                            {lead.createdAt
                              ? `Added: ${new Date(
                                  lead.createdAt
                                ).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}`
                              : lead.lastContacted
                                ? `Contacted: ${lead.lastContacted}`
                                : lead.category ||
                                  "General"}
                          </p>
                        )}
                      </article>
                    ))}

                    {/* Add Lead */}
                    <button
                      type="button"
                      onClick={() =>
                        handleAddLeadToStage(
                          stage.key
                        )
                      }
                      className={`
                        flex
                        min-h-[44px]
                        w-full
                        items-center
                        justify-center
                        gap-1.5
                        rounded-lg
                        border
                        border-dashed
                        py-2.5
                        text-sm
                        font-semibold
                        transition-colors
                        ${
                          isDark
                            ? "border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-200"
                            : "border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700"
                        }
                      `}
                    >
                      <span className="text-lg leading-none">
                        +
                      </span>

                      Add Lead
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        /* =====================================================
           LIST VIEW
           ===================================================== */

        <div
          className={`
            w-full
            overflow-x-auto
            rounded-xl
            ${cardBase}
            ${cardShadow}
          `}
        >
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead
              className={`
                border-b
                text-xs
                font-bold
                uppercase
                tracking-wide
                ${
                  isDark
                    ? "border-slate-700 bg-slate-800 text-slate-400"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }
              `}
            >
              <tr>
                <th className="px-5 py-4">
                  Business Name
                </th>

                <th className="px-5 py-4">
                  Category
                </th>

                <th className="px-5 py-4">
                  Stage
                </th>

                <th className="px-5 py-4">
                  Contact Detail
                </th>
              </tr>
            </thead>

            <tbody
              className={
                isDark
                  ? "divide-y divide-slate-800"
                  : "divide-y divide-slate-100"
              }
            >
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className={
                    isDark
                      ? "hover:bg-slate-800/60"
                      : "hover:bg-slate-50"
                  }
                >
                  <td
                    className={`
                      px-5 py-4
                      font-bold
                      ${
                        isDark
                          ? "text-slate-100"
                          : "text-[#172b4d]"
                      }
                    `}
                  >
                    {lead.businessName ||
                      "Unnamed Business"}
                  </td>

                  <td
                    className={`
                      px-5 py-4
                      ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-500"
                      }
                    `}
                  >
                    {lead.category || "General"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`
                        inline-flex
                        rounded-full
                        px-3 py-1.5
                        text-xs
                        font-semibold
                        ${
                          isDark
                            ? "bg-slate-800 text-slate-300"
                            : "bg-slate-100 text-slate-700"
                        }
                      `}
                    >
                      {lead.stage ||
                        lead.status ||
                        "Fresh Lead"}
                    </span>
                  </td>

                  <td
                    className={`
                      px-5 py-4
                      ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-500"
                      }
                    `}
                  >
                    {lead.phone ||
                      lead.email ||
                      "No details"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =====================================================
          NOTES MODAL
          ===================================================== */}

      {notesOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setNotesOpen(false)}
          />

          <div
            className={`
              relative z-10
              max-h-[90vh]
              w-full
              max-w-2xl
              overflow-y-auto
              rounded-xl
              p-6
              shadow-2xl
              ${
                isDark
                  ? "bg-slate-900 text-slate-100"
                  : "bg-white text-slate-900"
              }
            `}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold">
                Notes —{" "}
                {selectedLead.businessName ||
                  selectedLead.companyName}
              </h3>

              <button
                onClick={() =>
                  setNotesOpen(false)
                }
                className={`
                  rounded-lg
                  px-3 py-2
                  text-sm font-medium
                  ${
                    isDark
                      ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }
                `}
              >
                Close
              </button>
            </div>

            <div className="mb-5">
              <label
                className={`
                  text-sm font-semibold
                  ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }
                `}
              >
                Previous Notes
              </label>

              <div
                className={`
                  mt-2
                  max-h-48
                  overflow-auto
                  rounded-lg
                  border
                  p-4
                  text-sm
                  ${
                    isDark
                      ? "border-slate-700 bg-slate-800"
                      : "border-slate-200 bg-slate-50"
                  }
                `}
              >
                {selectedLead.notes ? (
                  <pre className="whitespace-pre-wrap">
                    {selectedLead.notes}
                  </pre>
                ) : (
                  <div
                    className={
                      isDark
                        ? "text-slate-500"
                        : "text-slate-400"
                    }
                  >
                    No notes yet.
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                className={`
                  text-sm font-semibold
                  ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }
                `}
              >
                Add / Edit Note
              </label>

              <textarea
                value={newNote}
                onChange={(e) =>
                  setNewNote(e.target.value)
                }
                className={`
                  mt-2
                  h-28
                  w-full
                  rounded-lg
                  border
                  p-3
                  text-sm
                  outline-none
                  focus:ring-2
                  focus:ring-[#0e8e86]
                  ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-slate-100"
                      : "border-slate-200 bg-white text-slate-900"
                  }
                `}
              />

              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={async () => {
                    if (!newNote || !newNote.trim())
                      return;

                    try {
                      await leadService.addNote(
                        selectedLead.id,
                        `${new Date().toLocaleString()} - ${newNote.trim()}`
                      );

                      const updated =
                        await leadService.getLead(
                          selectedLead.id
                        );

                      setSelectedLead(updated);

                      setLeads((current) =>
                        current.map((lead) =>
                          lead.id === updated.id
                            ? updated
                            : lead
                        )
                      );

                      setNewNote("");
                    } catch (err) {
                      console.error(err);
                      alert(
                        "Failed to save note."
                      );
                    }
                  }}
                  className="
                    rounded-lg
                    bg-[#0e8e86]
                    px-5 py-2.5
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-[#0c7970]
                  "
                >
                  Save Note
                </button>

                <button
                  onClick={() => setNewNote("")}
                  className={`
                    rounded-lg
                    px-4 py-2.5
                    text-sm font-medium
                    ${
                      isDark
                        ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    }
                  `}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          INFORMATION BAR
          ===================================================== */}

      <div
        className={`
          flex
          flex-col
          gap-3
          rounded-xl
          border
          p-4
          text-sm
          sm:flex-row
          sm:items-center
          sm:justify-between
          ${
            isDark
              ? "border-blue-900/40 bg-blue-500/10 text-blue-200"
              : "border-blue-100 bg-blue-50/70 text-blue-900"
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex h-7 w-7
              shrink-0
              items-center justify-center
              rounded-full
              bg-blue-600
              text-sm
              font-bold
              text-white
            "
          >
            i
          </div>

          <span
            className={`
              font-medium
              ${
                isDark
                  ? "text-slate-300"
                  : "text-slate-700"
              }
            `}
          >
            Note: A lost reason is required before
            marking a lead as Lost.
          </span>
        </div>

        <button
          className={`
            w-full
            rounded-lg
            border
            px-4 py-2
            text-sm
            font-semibold
            shadow-sm
            sm:w-auto
            ${
              isDark
                ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }
          `}
        >
          Manage Lost Reasons
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   METRIC CARD
   ============================================================ */

function MetricCard({
  label,
  value,
  icon,
  isDark,
  pageTitle,
  cardBase,
  cardShadow,
  cardHover,
  mutedLabel,
}) {
  const iconStyles = {
    users: isDark
      ? "bg-emerald-500/10 text-emerald-400"
      : "bg-emerald-50 text-emerald-600",

    won: isDark
      ? "bg-blue-500/10 text-blue-400"
      : "bg-blue-50 text-blue-600",

    rate: isDark
      ? "bg-amber-500/10 text-amber-400"
      : "bg-amber-50 text-amber-600",

    lost: isDark
      ? "bg-red-500/10 text-red-400"
      : "bg-red-50 text-red-500",
  };

  return (
    <div
      className={`
        flex
        min-h-[135px]
        flex-col
        items-center
        justify-center
        rounded-xl
        p-5
        text-center
        ${cardBase}
        ${cardShadow}
        ${cardHover}
      `}
    >
      <div
        className={`
          mb-3
          flex h-11 w-11
          items-center justify-center
          rounded-xl
          ${iconStyles[icon]}
        `}
      >
        {icon === "users" && (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        )}

        {icon === "won" && (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}

        {icon === "rate" && (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        )}

        {icon === "lost" && (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>

      <span
        className={`text-sm font-semibold ${mutedLabel}`}
      >
        {label}
      </span>

      <span
        className={`mt-1 text-3xl font-extrabold ${pageTitle}`}
      >
        {value}
      </span>
    </div>
  );
}
