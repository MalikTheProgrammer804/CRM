import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, UserPlus, Download, Trash2, Edit } from "lucide-react";
import FilterBar from "../../components/leads/FilterBar";
import StatusBadge, { STATUS_STYLES } from "../../components/leads/StatusBadge";
import { leadService } from "../../services/leadService";

export default function AllLeads() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    group: searchParams.get("group") || "",
    dateRange: searchParams.get("dateRange") || "",
  });

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setSortBy(searchParams.get("sortBy") || "newest");
  }, [searchParams]);

  useEffect(() => {
    let active = true;

    const loadLeads = async () => {
      try {
        setLoading(true);
        const data = await leadService.getLeads();
        if (active) {
          setLeads(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (active) {
          console.error(err);
          setError("Unable to load leads right now.");
          setLeads([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadLeads();
    return () => {
      active = false;
    };
  }, []);

  const getLeadId = (lead) => lead?.id || lead?._id || lead?.leadId;

  // Export a given set of lead objects to a CSV file, client-side (no
  // server round-trip needed since the rows are already in memory from
  // the current table selection).
  const handleExportLeads = (leadsToExport) => {
    if (!leadsToExport || leadsToExport.length === 0) {
      alert("No leads selected to export.");
      return;
    }

    const columns = ["businessName", "category", "email", "phone", "status", "address"];
    const escapeCsv = (value) => {
      const str = String(value ?? "");
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const header = columns.join(",");
    const rows = leadsToExport.map((lead) => columns.map((col) => escapeCsv(lead[col])).join(","));
    const csvContent = [header, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `selected_leads_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === filteredLeads.length) {
      setSelected([]);
    } else {
      setSelected(filteredLeads.map((lead) => getLeadId(lead)));
    }
  };

  const normalizeStatus = (value = "") => {
    const normalized = value.toLowerCase();
    if (normalized.includes("hot")) return "Hot";
    if (normalized.includes("warm")) return "Warm";
    if (normalized.includes("cold")) return "Cold";
    if (normalized.includes("won")) return "Won";
    if (normalized.includes("lost")) return "Lost";
    return "New";
  };

  const normalizeGroup = (lead) => {
    const raw = lead.group || lead.category || "General";
    return raw ? raw.toString().trim() : "General";
  };

  const matchesDateRange = (lead) => {
    if (!filters.dateRange || filters.dateRange === "Any time") return true;
    if (!lead.createdAt) return false;

    const createdAt = new Date(lead.createdAt);
    const now = new Date();

    if (filters.dateRange === "Today") {
      return createdAt.toDateString() === now.toDateString();
    }

    if (filters.dateRange === "Last 7 days") {
      const cutoff = new Date(now);
      cutoff.setDate(now.getDate() - 7);
      return createdAt >= cutoff;
    }

    if (filters.dateRange === "Last 30 days") {
      const cutoff = new Date(now);
      cutoff.setDate(now.getDate() - 30);
      return createdAt >= cutoff;
    }

    return true;
  };

  const filteredLeads = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    const results = leads.filter((lead) => {
      const haystack = `${lead.businessName || ""} ${lead.category || ""} ${lead.email || ""} ${lead.phone || ""}`.toLowerCase();
      const matchesSearch = haystack.includes(normalizedSearch);
      const matchesStatus = !filters.status || normalizeStatus(lead.status) === filters.status;
      const matchesGroup = !filters.group || normalizeGroup(lead) === filters.group;
      const matchesDate = matchesDateRange(lead);
      return matchesSearch && matchesStatus && matchesGroup && matchesDate;
    });

    return [...results].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      switch (sortBy) {
        case "oldest":
          return dateA - dateB;
        case "name-asc":
          return (a.businessName || "").localeCompare(b.businessName || "");
        case "name-desc":
          return (b.businessName || "").localeCompare(a.businessName || "");
        case "newest":
        default:
          return dateB - dateA;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, filters, search, sortBy]);

  const updateFilters = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);

    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const updateSortBy = (value) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams);
    if (value && value !== "newest") {
      params.set("sortBy", value);
    } else {
      params.delete("sortBy");
    }
    setSearchParams(params);
  };

  const updateSearchQuery = (value) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ status: "", group: "", dateRange: "" });
    setSearch("");
    setSortBy("newest");
    setSelected([]);
    setSearchParams(new URLSearchParams());
  };

  const handleEditSelected = () => {
    if (selected.length !== 1) return;
    navigate(`/leads/${selected[0]}/edit`);
  };

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`Delete ${selected.length} selected lead${selected.length === 1 ? "" : "s"}?`)) {
      return;
    }

    try {
      setLoading(true);
      await Promise.all(selected.map((leadId) => leadService.deleteLead(leadId)));
      const data = await leadService.getLeads();
      setLeads(Array.isArray(data) ? data : []);
      setSelected([]);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to delete selected leads right now.");
    } finally {
      setLoading(false);
    }
  };

  // Export CSV function (exports currently filtered leads or all leads)
  const [exportOpen, setExportOpen] = useState(false);
  const [exportStart, setExportStart] = useState("");
  const [exportEnd, setExportEnd] = useState("");

  const handleDownloadExport = async (range) => {
    try {
      const params = {};
      if (range) params.range = range;
      if (exportStart && exportEnd) {
        params.startDate = exportStart;
        params.endDate = exportEnd;
      }

      const blobData = await leadService.exportLeads(params);
      if (!blobData || blobData.size === 0) {
        alert("No data returned from export.");
        return;
      }

      const blob = new Blob([blobData], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setExportOpen(false);
   } catch (err) {
  console.error("Export error:", err);

  let message = "Export failed.";

  if (err.response?.data) {
    if (err.response.data instanceof ArrayBuffer) {
      try {
        const text = new TextDecoder().decode(err.response.data);
        const parsed = JSON.parse(text);
        message = parsed.message || parsed.error || message;
      } catch {
        // Ignore parsing error
      }
    } else {
      message =
        err.response.data.message ||
        err.response.data.error ||
        message;
    }
  } else if (err.message) {
    message = err.message;
  }

  alert(message);
}
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="crm-page-title text-2xl font-bold text-[#172b4d]">All Leads</h1>
          <p className="text-sm text-slate-500 mt-1">Total leads: ({leads.length})</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateSearchQuery(e.target.value)}
              placeholder="Search leads by name, email, or business..."
              className="w-full sm:w-80 rounded-md border border-slate-200 bg-slate-100 pl-10 pr-4 py-2 text-xs placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#0e8e86] transition"
            />
          </div>

          <div className="flex items-center gap-3">
          {/* Export Leads Button Header */}
          <div className="relative">
            <button
              onClick={() => setExportOpen((s) => !s)}
              className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              <Download size={16} />
              Export Leads
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-md border border-slate-200 bg-white p-3 shadow-lg z-50">
                <button className="block w-full text-left text-xs py-1" onClick={() => handleDownloadExport(7)}>Last 7 Days</button>
                <button className="block w-full text-left text-xs py-1" onClick={() => handleDownloadExport(15)}>Last 15 Days</button>
                <button className="block w-full text-left text-xs py-1" onClick={() => handleDownloadExport(30)}>Last 30 Days</button>
                <div className="mt-2 border-t border-slate-100 pt-2">
                  <div className="text-xs text-slate-500 mb-1">Custom Range</div>
                  <input type="date" value={exportStart} onChange={(e) => setExportStart(e.target.value)} className="w-full mb-1 text-xs p-1 border rounded" />
                  <input type="date" value={exportEnd} onChange={(e) => setExportEnd(e.target.value)} className="w-full mb-2 text-xs p-1 border rounded" />
                  <div className="flex gap-2">
                    <button onClick={() => handleDownloadExport()} className="flex-1 rounded bg-[#e86f00] text-white text-xs py-1">Download</button>
                    <button onClick={() => { setExportOpen(false); setExportStart(""); setExportEnd(""); }} className="flex-1 rounded border text-xs py-1">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add Lead Button */}
          <button
            onClick={() => navigate("/leads/new")}
            className="crm-primary flex items-center gap-2 px-4 py-2 text-xs font-bold transition"
          >
            <UserPlus size={16} />
            Add Lead
          </button>
          </div>
        </div>
      </div>

      <FilterBar
        filters={filters}
        sortBy={sortBy}
        onFilterChange={updateFilters}
        onSortChange={updateSortBy}
        onClearAll={clearFilters}
      />

      {loading && <p className="text-sm text-slate-500 my-3">Loading leads…</p>}
      {error && <p className="text-sm text-red-600 my-3">{error}</p>}

      {/* Leads Table */}
      <div className="crm-card overflow-hidden mt-4">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm font-semibold text-slate-500 mb-1">No leads to show</p>
            <p className="text-xs text-slate-400">
              {leads.length === 0
                ? "All leads have been cleared from this view."
                : "No leads match your search."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500 border-b border-slate-200">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600/40"
                  />
                </th>
                <th className="font-semibold px-2 py-3">Business Name</th>
                <th className="font-semibold px-3 py-3">Lead Status</th>
                <th className="font-semibold px-3 py-3">Contact Info</th>
                <th className="font-semibold px-3 py-3">Next Follow-up</th>
                <th className="font-semibold px-3 py-3">Date Added</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => {
                const leadId = getLeadId(lead);
                const status = lead.status || "New";
                const barColor = (STATUS_STYLES[status] || STATUS_STYLES.New).bar;
                const followUp = lead.nextFollowUp || lead.followUpDate || lead.reminderDate;

                return (
                  <tr key={leadId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(leadId)}
                        onChange={() => toggleSelect(leadId)}
                        className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600/40"
                      />
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex items-stretch gap-3">
                        <span className={`w-1 rounded-full ${barColor}`} />
                        <button
                          onClick={() => navigate(`/leads/${leadId}`)}
                          className="text-left"
                        >
                          <p className="font-bold text-slate-900 hover:text-[#e86f00] transition">
                            {lead.businessName || "Untitled Lead"}
                          </p>
                          <p className="text-xs text-slate-400 uppercase tracking-wide">
                            {lead.category || "General"}
                          </p>
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-medium text-slate-800">{lead.phone || "—"}</p>
                      <p className="text-xs text-slate-400">{lead.email || "—"}</p>
                    </td>
                    <td className="px-3 py-4">
                      {followUp ? (
                        <span className="text-xs font-semibold text-slate-700">
                          {new Date(followUp).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Not scheduled</span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-slate-500 text-xs">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Fresh Leads Section */}
      {filteredLeads.length > 0 && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Fresh Leads</h2>
            <span className="text-xs text-slate-500">Recently added</span>
          </div>
          <div className="space-y-2">
            {filteredLeads.slice(0, 5).map((lead) => {
              const leadId = getLeadId(lead);
              return (
                <button
                  key={leadId}
                  onClick={() => navigate(`/leads/${leadId}`)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-[#0e8e86] hover:shadow-md"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{lead.businessName || "Untitled Lead"}</p>
                    <p className="text-xs text-slate-500">{lead.category || "General"}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "New"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Items Floating Action Bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xl z-50">
          <span className="text-xs font-bold text-slate-700 px-2">
            {selected.length} selected
          </span>
          <button
            onClick={() => handleExportLeads(leads.filter(l => selected.includes(getLeadId(l))))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Download size={14} /> Export Selected
          </button>
          <button
            onClick={handleEditSelected}
            disabled={selected.length !== 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit size={14} /> Edit
          </button>
          <button
            onClick={handleDeleteSelected}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-xs font-semibold text-white hover:bg-red-700 transition"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}