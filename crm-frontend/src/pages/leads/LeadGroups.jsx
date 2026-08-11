import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, Download } from "lucide-react";
import { leadService } from "../../services/leadService";

// Helper function to normalize folder names and avoid duplicate folders due to casing/singular/plural issues
const normalizeGroupName = (rawName) => {
  if (!rawName) return "Ungrouped";

  let cleaned = rawName.toString().trim().toLowerCase();

  // Custom overrides for your specific groups
  if (cleaned.includes("restaurant")) return "Restaurants";
  if (cleaned.includes("beauty") || cleaned.includes("salon")) return "Beauty Salons";
  if (cleaned.includes("doctor")) return "Doctors";
  if (cleaned.includes("marketing")) return "Marketing";

  // General fallback: Convert to Title Case
  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function LeadGroups() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    leadService
      .getLeads()
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const groups = useMemo(() => {
    // 1. Group leads using the normalized group name (merges lowercase & capital variations)
    const grouped = leads.reduce((all, lead) => {
      const rawKey = lead.group || lead.category || "Ungrouped";
      const key = normalizeGroupName(rawKey);

      all[key] = [...(all[key] || []), lead];
      return all;
    }, {});

    // 2. Prepare group entries & keep "All Leads" at the top
    const groupEntries = [
      ["All Leads", leads],
      ...Object.entries(grouped),
    ];

    // 3. Filter by search query
    return groupEntries.filter(([name]) =>
      name.toLowerCase().includes(query.toLowerCase())
    );
  }, [leads, query]);

  const handleOpenLead = (leadId) => {
    if (!leadId) return;
    navigate(`/leads/${leadId}`);
  };

  const handleExportGroupLeads = (groupName, groupLeads) => {
    if (!groupLeads || !groupLeads.length) {
      alert("No leads available to export in this group.");
      return;
    }

    const headers = ["ID", "Business Name", "Contact Person", "Email", "Phone", "Category/Group", "Stage", "Status"];
    
    const rows = groupLeads.map((lead) => [
      `"${lead.id || ""}"`,
      `"${(lead.businessName || lead.companyName || "").replace(/"/g, '""')}"`,
      `"${(lead.contactPerson || lead.name || "").replace(/"/g, '""')}"`,
      `"${(lead.email || "").replace(/"/g, '""')}"`,
      `"${(lead.phone || "").replace(/"/g, '""')}"`,
      `"${(lead.group || lead.category || "Ungrouped").replace(/"/g, '""')}"`,
      `"${(lead.stage || "").replace(/"/g, '""')}"`,
      `"${(lead.status || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${groupName.toLowerCase().replace(/\s+/g, "_")}_leads_backup.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="crm-page-title text-xl font-bold text-[#172b4d]">Lead Groups</h1>
          <p className="text-xs text-slate-500">
            Groups are built from your saved lead group and category data.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <input
        placeholder="Search groups..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="crm-input mt-5 w-full max-w-md px-3 py-2 text-sm"
      />

      {/* Groups Grid */}
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map(([name, members]) => (
          <section key={name} className="crm-card p-5 relative group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-3 ${name === "All Leads" ? "bg-amber-100 text-[#e86f00]" : "bg-[#e8f6f4] text-[#0e8e86]"}`}>
                  <Folder size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-[#172b4d]">{name}</h2>
                  <p className="text-xs text-slate-500">
                    {members.length} lead{members.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {/* Export/Download Button */}
              <button
                type="button"
                onClick={() => handleExportGroupLeads(name, members)}
                title={`Export ${name} to CSV`}
                className="rounded-lg p-2 text-slate-400 opacity-0 transition-all duration-200 hover:bg-slate-100 hover:text-[#0e8e86] group-hover:opacity-100"
              >
                <Download size={18} />
              </button>
            </div>

            {/* Clickable Business Names */}
            <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 space-y-1.5 max-h-48 overflow-y-auto">
              {members.map((lead) => (
                <p
                  key={lead.id}
                  onClick={() => handleOpenLead(lead.id)}
                  className="cursor-pointer font-medium text-slate-600 hover:text-[#0e8e86] hover:underline transition-colors"
                >
                  {lead.businessName || lead.companyName || "Unnamed Business"}
                </p>
              ))}

              {!members.length && (
                <p className="italic text-slate-400">No leads in this folder.</p>
              )}
            </div>
          </section>
        ))}

        {!groups.length && (
          <div className="crm-card p-8 text-center text-sm text-slate-500 col-span-full">
            No lead groups found.
          </div>
        )}
      </div>
    </div>
  );
}