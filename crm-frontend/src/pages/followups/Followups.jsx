import { useEffect, useState, useMemo } from "react";
import { CheckCircle2, Plus, Search, Calendar, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { taskService } from "../../services/taskService";
import { leadService } from "../../services/leadService";

export default function Followups() {
  // Real Backend Data State
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Tab & Filter State
  const [activeTab, setActiveTab] = useState("dueToday"); // "dueToday" | "overdue" | "upcoming"
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Reschedule Modal State
  const [rescheduleTask, setRescheduleTask] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");

  // Create Form State
  const [form, setForm] = useState({
    title: "",
    leadId: "",
    dueDate: "",
    dueTime: "",
    priority: "Medium",
    isRecurring: false,
    recurringFrequency: "Weekly",
    notes: "",
  });

  // Fetch tasks and leads from services
  const load = async () => {
    setLoading(true);
    try {
      const taskData = await taskService.list();
      setTasks(Array.isArray(taskData) ? taskData : []);
      setMessage("");
    } catch (err) {
      setMessage("Unable to load follow-ups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    leadService
      .getLeads()
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  // Categorize Tasks Dynamically
  const { dueTodayTasks, overdueTasks, upcomingTasks } = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime();

    const dueToday = [];
    const overdue = [];
    const upcoming = [];

    tasks.forEach((task) => {
      // Ignore completed tasks from main active lists if desired
      if (task.status === "Completed") return;

      const dueTime = task.dueAt ? new Date(task.dueAt).getTime() : null;

      if (!dueTime) {
        upcoming.push(task);
        return;
      }

      if (dueTime < startOfToday) {
        overdue.push(task);
      } else if (dueTime >= startOfToday && dueTime <= endOfToday) {
        dueToday.push(task);
      } else {
        upcoming.push(task);
      }
    });

    return {
      dueTodayTasks: dueToday,
      overdueTasks: overdue,
      upcomingTasks: upcoming,
    };
  }, [tasks]);

  // Search Filter Handler
  const filterBySearch = (list) => {
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter((item) => {
      const titleMatch = (item.title || "").toLowerCase().includes(query);
      const leadMatch = (item.lead?.businessName || "").toLowerCase().includes(query);
      return titleMatch || leadMatch;
    });
  };

  // Submit Handler for Task Creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Combine date and time if both provided
      let combinedDueAt = "";
      if (form.dueDate) {
        combinedDueAt = form.dueTime
          ? `${form.dueDate}T${form.dueTime}`
          : `${form.dueDate}T09:00`;
      }

      const payload = {
        title: form.title || "Follow-up Task",
        leadId: form.leadId || null,
        dueAt: combinedDueAt,
        priority: form.priority,
        isRecurring: form.isRecurring,
        recurringFrequency: form.recurringFrequency,
        notes: form.notes,
      };

      await taskService.create(payload);
      setForm({
        title: "",
        leadId: "",
        dueDate: "",
        dueTime: "",
        priority: "Medium",
        isRecurring: false,
        recurringFrequency: "Weekly",
        notes: "",
      });
      setShowForm(false);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to create follow-up.");
    }
  };

  // Complete Handler
  const handleComplete = async (id) => {
    try {
      await taskService.update(id, { status: "Completed" });
      load();
    } catch (err) {
      setMessage("Failed to update status.");
    }
  };

  // Reschedule Handler
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleTask || !rescheduleDate) return;

    try {
      await taskService.update(rescheduleTask.id, {
        dueAt: `${rescheduleDate}T09:00:00`,
      });
      setRescheduleTask(null);
      setRescheduleDate("");
      load();
    } catch (err) {
      setMessage("Failed to reschedule task.");
    }
  };

  // Priority Badge Helper
  const renderPriorityBadge = (priority) => {
    const p = (priority || "Medium").toLowerCase();
    if (p === "high") {
      return (
        <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600">
          HIGH PRIORITY
        </span>
      );
    }
    if (p === "low") {
      return (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
          LOW PRIORITY
        </span>
      );
    }
    return (
      <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
        MEDIUM PRIORITY
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="crm-page-title text-xl font-bold text-[#172b4d]">
            Follow-ups
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Manage your reminders and keep the momentum with your prospects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Global Search Box */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search follow-ups or leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-3 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0e8e86]"
            />
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-lg bg-[#e86f00] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#d06300]"
          >
            <Plus className="h-4 w-4" /> Schedule Follow-up
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("dueToday")}
          className={`flex items-center gap-2 border-b-2 pb-3 text-xs font-bold transition-all ${
            activeTab === "dueToday"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Due Today</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] ${
              activeTab === "dueToday"
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {dueTodayTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("overdue")}
          className={`flex items-center gap-2 border-b-2 pb-3 text-xs font-bold transition-all ${
            activeTab === "overdue"
              ? "border-red-500 text-red-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Overdue</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] ${
              activeTab === "overdue"
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {overdueTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center gap-2 border-b-2 pb-3 text-xs font-bold transition-all ${
            activeTab === "upcoming"
              ? "border-[#0e8e86] text-[#0e8e86]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Upcoming</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] ${
              activeTab === "upcoming"
                ? "bg-teal-100 text-[#0e8e86]"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {upcomingTasks.length}
          </span>
        </button>
      </div>

      {message && <p className="text-xs font-semibold text-red-600">{message}</p>}

      {/* Main Content Layout (Grid with Sidebar Schedule Form if toggled) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Task Cards Column */}
        <div className={showForm ? "lg:col-span-2 space-y-4" : "lg:col-span-3 space-y-4"}>
          {/* TAB 1: DUE TODAY */}
          {activeTab === "dueToday" && (
            <div className="space-y-3">
              {filterBySearch(dueTodayTasks).map((task) => (
                <div
                  key={task.id}
                  className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm border-l-4 border-l-amber-500"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleComplete(task.id)}
                        className="mt-0.5 text-slate-300 hover:text-emerald-600"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                      <div>
                        <h3 className="font-bold text-[#172b4d]">
                          {task.lead?.businessName || task.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            Today,{" "}
                            {task.dueAt
                              ? new Date(task.dueAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Anytime"}
                          </span>
                        </div>
                        {task.notes && (
                          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                            {task.notes}
                          </p>
                        )}
                        <p className="mt-3 text-[11px] font-medium text-slate-400">
                          Assigned to: {task.assignedTo || "Unassigned"}
                        </p>
                      </div>
                    </div>
                    <div>{renderPriorityBadge(task.priority)}</div>
                  </div>
                </div>
              ))}
              {!filterBySearch(dueTodayTasks).length && (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                  No tasks due today.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OVERDUE */}
          {activeTab === "overdue" && (
            <div className="space-y-3">
              {filterBySearch(overdueTasks).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm border-l-4 border-l-red-500"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#172b4d]">
                        {task.lead?.businessName || task.title}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          Missed follow-up · Due:{" "}
                          {task.dueAt
                            ? new Date(task.dueAt).toLocaleDateString()
                            : "Past"}
                        </span>
                        <span>· Assigned to {task.assignedTo || "Team"}</span>
                      </div>
                      <div className="mt-2">
                        <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                          OVERDUE
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setRescheduleTask(task);
                      setRescheduleDate(
                        task.dueAt ? task.dueAt.split("T")[0] : ""
                      );
                    }}
                    className="rounded-lg bg-[#e86f00] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#d06300]"
                  >
                    Reschedule Now
                  </button>
                </div>
              ))}
              {!filterBySearch(overdueTasks).length && (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                  No overdue tasks! You are all caught up.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: UPCOMING */}
          {activeTab === "upcoming" && (
            <div className="space-y-3">
              {filterBySearch(upcomingTasks).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#172b4d]">
                        {task.lead?.businessName || task.title}
                      </h3>
                      <p className="text-xs text-slate-500">{task.notes || task.title}</p>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.dueAt
                            ? new Date(task.dueAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "Scheduled"}
                        </span>
                        <span>Assigned to {task.assignedTo || "Member"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {renderPriorityBadge(task.priority)}
                    <button
                      onClick={() => handleComplete(task.id)}
                      className="text-slate-300 hover:text-emerald-600"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
              {!filterBySearch(upcomingTasks).length && (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                  No upcoming tasks scheduled.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Schedule Follow-up Form Sidebar Panel */}
        {showForm && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#172b4d]">New Reminder</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Business/Lead Selector */}
              <div>
                <label className="mb-1 block font-semibold text-slate-600">
                  Business / Lead
                </label>
                <select
                  value={form.leadId}
                  onChange={(e) => setForm({ ...form, leadId: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0e8e86]"
                >
                  <option value="">Search for a business...</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.businessName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title / Objective */}
              <div>
                <label className="mb-1 block font-semibold text-slate-600">
                  Task Title
                </label>
                <input
                  required
                  placeholder="e.g. Call to discuss contract"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0e8e86]"
                />
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-slate-600">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0e8e86]"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-600">
                    Time
                  </label>
                  <input
                    type="time"
                    value={form.dueTime}
                    onChange={(e) => setForm({ ...form, dueTime: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0e8e86]"
                  />
                </div>
              </div>

              {/* Priority Selector */}
              <div>
                <label className="mb-1 block font-semibold text-slate-600">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["High", "Medium", "Low"].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setForm({ ...form, priority: p })}
                      className={`rounded-lg border py-2 text-center text-xs font-bold transition-all ${
                        form.priority === p
                          ? "border-amber-400 bg-amber-50 text-amber-800"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p === "Medium" ? "MED" : p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recurring Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-slate-600">
                  Recurring Reminder
                </span>
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(e) =>
                    setForm({ ...form, isRecurring: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#0e8e86] focus:ring-0"
                />
              </div>

              {form.isRecurring && (
                <div>
                  <select
                    value={form.recurringFrequency}
                    onChange={(e) =>
                      setForm({ ...form, recurringFrequency: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700"
                  >
                    <option value="Daily">Every Day</option>
                    <option value="Weekly">Every Week</option>
                    <option value="Monthly">Every Month</option>
                  </select>
                </div>
              )}

              {/* Reminder Notes */}
              <div>
                <label className="mb-1 block font-semibold text-slate-600">
                  Reminder Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Briefly describe the follow-up goal..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0e8e86]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#e86f00] py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#d06300]"
              >
                Save Follow-up
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-sm font-bold text-[#172b4d]">
              Reschedule Follow-up
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Pick a new date for {rescheduleTask.lead?.businessName || rescheduleTask.title}
            </p>

            <form onSubmit={handleRescheduleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  New Due Date
                </label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleTask(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#e86f00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d06300]"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}