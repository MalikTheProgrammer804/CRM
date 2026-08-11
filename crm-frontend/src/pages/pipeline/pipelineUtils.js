export const PIPELINE_STAGES = [
  { key: "Fresh Lead", label: "FRESH LEAD", dotColor: "bg-blue-500" },
  { key: "Qualified", label: "QUALIFIED", dotColor: "bg-amber-400" },
  { key: "Contacted", label: "CONTACTED", dotColor: "bg-blue-600" },
  { key: "Follow-up", label: "FOLLOW-UP", dotColor: "bg-purple-500" },
  { key: "Proposal", label: "PROPOSAL", dotColor: "bg-emerald-500" },
  { key: "Negotiations", label: "NEGOTIATIONS", dotColor: "bg-orange-500" },
  { key: "Won", label: "WON", dotColor: "bg-emerald-500" },
  { key: "Lost", label: "LOST", dotColor: "bg-red-500" },
];

export function getLeadStage(lead) {
  if (!lead) return "Fresh Lead";

  // Check all possible database properties for stage/status
  const rawStage = (lead.stage || lead.status || lead.leadStatus || "Fresh Lead")
    .toString()
    .trim()
    .toLowerCase();

  // Normalize common variations/slugs coming from the DB/API
  if (rawStage.includes("fresh") || rawStage.includes("new") || rawStage === "open" || rawStage === "unread") {
    return "Fresh Lead";
  }
  if (rawStage.includes("qualif")) {
    return "Qualified";
  }
  if (rawStage.includes("contact")) {
    return "Contacted";
  }
  if (rawStage.includes("follow") || rawStage.includes("call")) {
    return "Follow-up";
  }
  if (rawStage.includes("propos") || rawStage.includes("quote")) {
    return "Proposal";
  }
  if (rawStage.includes("negotiat") || rawStage.includes("review")) {
    return "Negotiations";
  }
  if (rawStage.includes("won") || rawStage.includes("close") || rawStage.includes("converted")) {
    return "Won";
  }
  if (rawStage.includes("lost") || rawStage.includes("drop") || rawStage.includes("reject")) {
    return "Lost";
  }

  // Exact match fallback
  const exactMatch = PIPELINE_STAGES.find(
    (s) => s.key.toLowerCase() === rawStage
  );
  if (exactMatch) return exactMatch.key;

  // Default fallback so no lead is hidden
  return "Fresh Lead";
}

export function getStageRank(stage) {
  const normalized = getLeadStage({ stage });
  const index = PIPELINE_STAGES.findIndex(
    (item) => item.key.toLowerCase() === normalized.toLowerCase()
  );
  return index >= 0 ? index : 0;
}

export function filterLeads(leads, { searchQuery = "", stageFilter = "All" } = {}) {
  const query = searchQuery.trim().toLowerCase();

  return leads.filter((lead) => {
    const stage = getLeadStage(lead).toLowerCase();
    const filter = stageFilter.toLowerCase();
    
    const matchesStage = stageFilter === "All" || stage === filter;
    
    const matchesQuery =
      !query ||
      (lead.businessName || "").toLowerCase().includes(query) ||
      (lead.companyName || "").toLowerCase().includes(query) ||
      (lead.name || lead.contactPerson || "").toLowerCase().includes(query) ||
      (lead.email || "").toLowerCase().includes(query) ||
      (lead.category || "").toLowerCase().includes(query);

    return matchesStage && matchesQuery;
  });
}

export function sortLeads(leads, sortMode = "newest") {
  const sorted = [...leads];

  switch (sortMode) {
    case "name":
      sorted.sort((a, b) =>
        (a.businessName || a.companyName || a.name || "").localeCompare(
          b.businessName || b.companyName || b.name || ""
        )
      );
      break;
    case "stage":
      sorted.sort(
        (left, right) =>
          getStageRank(getLeadStage(left)) - getStageRank(getLeadStage(right))
      );
      break;
    case "oldest":
      sorted.sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      );
      break;
    case "newest":
    default:
      sorted.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      break;
  }

  return sorted;
}