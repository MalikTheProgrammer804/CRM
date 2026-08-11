export default function FilterBar({ filters, sortBy, onFilterChange, onSortChange, onClearAll }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">Status</label>
        <select
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-600"
        >
          <option value="">All statuses</option>
          <option value="New">New</option>
          <option value="Hot">Hot</option>
          <option value="Warm">Warm</option>
          <option value="Cold">Cold</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">Group</label>
        <select
          value={filters.group}
          onChange={(e) => onFilterChange("group", e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-600"
        >
          <option value="">All groups</option>
          <option value="Dentists">Dentists</option>
          <option value="Restaurants">Restaurants</option>
          <option value="Real Estate">Real Estate</option>
          <option value="General">General</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">Date Added</label>
        <select
          value={filters.dateRange}
          onChange={(e) => onFilterChange("dateRange", e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-600"
        >
          <option value="">Any time</option>
          <option value="Today">Today</option>
          <option value="Last 7 days">Last 7 days</option>
          <option value="Last 30 days">Last 30 days</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">Sort by</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-600"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>
      </div>

      <button
        onClick={onClearAll}
        className="ml-auto text-sm font-semibold text-teal-700 hover:text-teal-800"
      >
        Clear All
      </button>
    </div>
  );
}
