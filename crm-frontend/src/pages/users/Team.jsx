import { useEffect, useState, useMemo } from "react";
import { workspaceService } from "../../services/workspaceService";

export default function Team() {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");

  // Filtering, Search & Selection UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    workspaceService
      .members()
      .then((data) => setMembers(Array.isArray(data) ? data : []))
      .catch(() => setError("Unable to load workspace members."));
  }, []);

  // Filtered members list based on UI inputs
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        (member.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.email || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "All" ||
        member.role?.toLowerCase() === roleFilter.toLowerCase();

      const isActive = member.status
        ? member.status.toLowerCase() === "active"
        : true;
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && isActive) ||
        (statusFilter === "Inactive" && !isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, searchQuery, roleFilter, statusFilter]);

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMembers.map((m) => m.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Helper to format date safely
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) return "—";
    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Helper for initial letters avatar
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}.${parts[1][0]}`;
    }
    return `${parts[0][0]}.`;
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2">
          <h1 className="crm-page-title text-xl font-bold text-[#172b4d]">
            User & Team Management
          </h1>
          <span className="text-sm font-medium text-slate-500">
            ({members.length} members)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative w-64">
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
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
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-100/70 py-2 pl-9 pr-3 text-xs text-slate-700 placeholder-slate-400 focus:bg-black focus:outline-none focus:ring-1 focus:ring-[#0e8e86]"
            />
          </div>

          {/* Create User Button */}
          <div className="flex items-center">
            
            <span className="rounded-r-lg bg-[#b35600] px-2 py-2 text-[10px] font-bold text-white uppercase tracking-wider">
              ADMIN ONLY
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none"
            >
              <option value="All">Role: All</option>
              <option value="admin">Role: Admin</option>
              <option value="member">Role: Member</option>
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none"
            >
              <option value="All">Status: All</option>
              <option value="Active">Status: Active</option>
              <option value="Inactive">Status: Inactive</option>
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Sort By:</span>
          <select className="rounded-lg border-0 bg-transparent py-1 text-xs font-bold text-slate-700 focus:outline-none">
            <option>Date Joined</option>
            <option>Name</option>
            <option>Role</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      {/* Table Section */}
      <div className="crm-card overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length === filteredMembers.length &&
                    filteredMembers.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-[#0e8e86] focus:ring-0"
                />
              </th>
              <th className="p-4">USER</th>
              <th className="p-4 text-center">ROLE</th>
              <th className="p-4 text-center">ASSIGNED LEADS</th>
              <th className="p-4 text-center">CONVERTED</th>
              <th className="p-4 text-center">STATUS</th>
              <th className="p-4">DATE JOINED</th>
              <th className="p-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMembers.map((member) => {
              const isSelected = selectedIds.includes(member.id);
              const isAdmin = member.role?.toLowerCase() === "admin";

              return (
                <tr
                  key={member.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isSelected ? "bg-slate-50" : ""
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(member.id)}
                      className="rounded border-slate-300 text-[#0e8e86] focus:ring-0"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#008da5] text-xs font-bold text-white">
                          {getInitials(member.fullName)}
                        </div>
                      )}
                      <div>
                        <strong className="block font-bold text-[#172b4d]">
                          {member.fullName}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {isAdmin ? (
                      <span className="inline-block rounded-full bg-[#0e1e38] px-3 py-1 text-[11px] font-bold text-white">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-block rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-medium text-slate-600">
                        Team Member
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center font-bold text-[#172b4d]">
                    {member.assignedLeads !== undefined &&
                    member.assignedLeads !== null
                      ? member.assignedLeads
                      : "—"}
                  </td>
                  <td className="p-4 text-center font-bold text-[#00A389]">
                    {member.conversionRate
                      ? `${member.conversionRate}%`
                      : "—"}
                  </td>
                  <td className="p-4 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={
                          member.status
                            ? member.status.toLowerCase() === "active"
                            : true
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0e1e38]"></div>
                    </label>
                  </td>
                  <td className="p-4 font-medium text-slate-600">
                    {formatDate(member.createdAt)}
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-slate-400 hover:text-slate-600">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}

            {!filteredMembers.length && (
              <tr>
                <td colSpan="8" className="p-8 text-center text-slate-500">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer Pagination Bar */}
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          <span>
            Showing {filteredMembers.length} of {members.length} members
          </span>
          <div className="flex items-center gap-1">
            <button className="rounded border border-slate-200 p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600">
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button className="rounded border border-slate-200 p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600">
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}