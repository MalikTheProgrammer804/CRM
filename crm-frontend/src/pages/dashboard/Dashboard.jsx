import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  ListChecks,
  FolderOpen,
  SearchCheck,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";

import StatCard from "../../components/dashboard/StatCard";
import FollowupsCard from "../../components/dashboard/FollowupsCard";
import QuickActionCard from "../../components/dashboard/QuickActionCard";
import DueTodayTable from "../../components/dashboard/DueTodayTable";
import HotLeadsAlert from "../../components/dashboard/HotLeadAlert";

import { leadService } from "../../services/leadService";

const pageVariants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

const QUICK_ACTIONS = [
  {
    label: "Add Lead",
    icon: UserPlus,
    iconBg: "#E6F6F4",
    iconColor: "#0F766E",
    path: "/leads/new",
  },
  {
    label: "Create Task",
    icon: ListChecks,
    iconBg: "#EAF1FF",
    iconColor: "#3B5BDB",
    path: "/followups",
  },
  {
    label: "Lead Group",
    icon: FolderOpen,
    iconBg: "#FEECE8",
    iconColor: "#E8590C",
    path: "/lead-groups",
  },
  {
    label: "Advanced Search",
    icon: SearchCheck,
    iconBg: "#F1F1F1",
    iconColor: "#495057",
    path: "/advanced-search",
  },
];

function getInitials(name = "") {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "LD"
  );
}

function normalizeStatus(status = "") {
  const value = String(status).toLowerCase();

  if (value.includes("hot")) return "Hot";
  if (value.includes("warm")) return "Warm";
  if (value.includes("cold")) return "Cold";
  if (value.includes("won")) return "Won";
  if (value.includes("lost")) return "Lost";

  return "New";
}

function formatDate(value) {
  if (!value) return "Pending";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Pending";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function escapeCsv(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  return `"${stringValue.replace(/"/g, '""')}"`;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Load leads from backend / SQLite
   */
  useEffect(() => {
    let active = true;

    const loadLeads = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await leadService.getLeads();

        if (!active) return;

        if (Array.isArray(data)) {
          setLeads(data);
        } else if (Array.isArray(data?.leads)) {
          setLeads(data.leads);
        } else {
          setLeads([]);
        }
      } catch (err) {
        console.error("Dashboard lead loading error:", err);

        if (active) {
          setError(
            err?.response?.data?.message ||
              "Unable to load dashboard data right now."
          );

          setLeads([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadLeads();

    return () => {
      active = false;
    };
  }, []);

  /*
   * Export Leads
   */
  const handleExportLeads = () => {
    if (!leads.length) {
      return;
    }

    const headers = [
      "Business Name",
      "Owner Name",
      "Category",
      "Phone",
      "Email",
      "Website",
      "Address",
      "Facebook",
      "Instagram",
      "LinkedIn",
      "Group",
      "Assigned To",
      "Status",
      "Source",
      "Google Place ID",
      "Google Maps Link",
      "Rating",
      "Reviews Count",
      "Notes",
      "Created At",
    ];

    const rows = leads.map((lead) => [
      lead.businessName || "",
      lead.ownerName || "",
      lead.category || "",
      lead.phone || "",
      lead.email || "",
      lead.website || "",
      lead.address || "",
      lead.facebook || "",
      lead.instagram || "",
      lead.linkedin || "",
      lead.group || "",
      lead.assignedTo || "",
      lead.status || "",
      lead.source || "",
      lead.googlePlaceId || "",
      lead.googleMapsLink || "",
      lead.rating ?? "",
      lead.reviewsCount ?? 0,
      lead.notes || "",
      lead.createdAt || "",
    ]);

    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\r\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `crm-leads-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /*
   * Dashboard statistics
   */
  const stats = useMemo(() => {
    const counts = {
      Total: leads.length,
      New: 0,
      Hot: 0,
      Warm: 0,
      Cold: 0,
      Won: 0,
      Lost: 0,
    };

    leads.forEach((lead) => {
      const status = normalizeStatus(lead.status);

      if (counts[status] !== undefined) {
        counts[status] += 1;
      }
    });

    return [
      {
        label: "Total",
        value: counts.Total.toLocaleString(),
        accent: "border-slate-200",
      },
      {
        label: "New",
        value: counts.New.toString(),
        accent: "border-teal-300",
        valueColor: "text-slate-900",
      },
      {
        label: "Hot",
        value: counts.Hot.toString(),
        accent: "border-orange-300",
        valueColor: "text-orange-500",
      },
      {
        label: "Warm",
        value: counts.Warm.toString(),
        accent: "border-amber-300",
        valueColor: "text-amber-500",
      },
      {
        label: "Cold",
        value: counts.Cold.toString(),
        accent: "border-blue-300",
        valueColor: "text-blue-500",
      },
      {
        label: "Won",
        value: counts.Won.toString(),
        accent: "border-teal-300",
        valueColor: "text-teal-600",
      },
      {
        label: "Lost",
        value: counts.Lost.toString(),
        accent: "border-slate-200",
        valueColor: "text-slate-700",
      },
    ];
  }, [leads]);

  /*
   * Today's followups
   */
  const todayFollowups = useMemo(
    () =>
      leads.slice(0, 2).map((lead) => ({
        initials: getInitials(lead.businessName),
        name: lead.businessName || "Untitled Lead",
        subtitle: `${lead.category || "General"} • ${
          lead.address || "No address listed"
        }`,
      })),
    [leads]
  );

  /*
   * Overdue followups
   */
  const overdueFollowups = useMemo(
    () =>
      leads
        .filter((lead) =>
          ["Cold", "Lost"].includes(normalizeStatus(lead.status))
        )
        .slice(0, 2)
        .map((lead) => ({
          initials: getInitials(lead.businessName),
          name: lead.businessName || "Untitled Lead",
          subtitle: `${
            lead.phone || lead.email || "No contact info"
          } • ${formatDate(lead.createdAt)}`,
          action: "FIX NOW",
        })),
    [leads]
  );

  /*
   * Due today table
   */
  const dueTodayRows = useMemo(
    () =>
      leads.slice(0, 5).map((lead) => ({
        name: lead.businessName || "Untitled Lead",
        category: lead.category || "General",
        location: lead.address || "No address listed",
        status: normalizeStatus(lead.status),
        dueTime: formatDate(lead.createdAt),
        overdue: ["Cold", "Lost"].includes(
          normalizeStatus(lead.status)
        ),
      })),
    [leads]
  );

  /*
   * Hot leads
   */
  const hotLeads = useMemo(
    () =>
      leads
        .filter((lead) =>
          ["Hot", "Warm", "New"].includes(
            normalizeStatus(lead.status)
          )
        )
        .slice(0, 2)
        .map((lead) => ({
          name: lead.businessName || "Untitled Lead",
          contactType: lead.email ? "email" : "phone",
          contact: lead.email || lead.phone || "No contact info",
          lastActive: formatDate(lead.createdAt),
        })),
    [leads]
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* =========================================================
          HEADER
      ========================================================= */}
      <motion.section
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="crm-page-title text-xl">
            Dashboard Lead Activity
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Your lead activity and follow-ups at a glance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Leads */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportLeads}
            disabled={loading || leads.length === 0}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={15} />

            {loading ? "Loading..." : "Export Leads"}
          </motion.button>

          {/* Add Lead */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/leads/new")}
            className="crm-primary px-4 py-2 text-xs font-bold"
          >
            Add Lead
          </motion.button>
        </div>
      </motion.section>

      {/* =========================================================
          LOADING
      ========================================================= */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />

          Loading dashboard data…
        </div>
      )}

      {/* =========================================================
          ERROR
      ========================================================= */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* =========================================================
          DASHBOARD CONTENT
      ========================================================= */}
      {!loading && !error && (
        <>
          {/* Stat Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7"
          >
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </motion.div>

          {/* Followups */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-4 lg:grid-cols-2"
          >
            <FollowupsCard
              variant="today"
              badge={`${todayFollowups.length} TASKS`}
              items={todayFollowups}
              footerLabel="VIEW ALL TODAY"
              onFooterClick={() => navigate("/followups")}
              onActionClick={() => navigate("/followups")}
            />

            <FollowupsCard
              variant="overdue"
              badge={`${overdueFollowups.length} DELAYED`}
              items={overdueFollowups}
              footerLabel="REVIEW OVERDUE ITEMS"
              onFooterClick={() => navigate("/followups")}
              onActionClick={() => navigate("/followups")}
            />
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            {QUICK_ACTIONS.map((action) => (
              <motion.div
                key={action.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <QuickActionCard
                  {...action}
                  onClick={() => navigate(action.path)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Tables / Alerts */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-4 lg:grid-cols-3"
          >
            <div className="lg:col-span-2">
              <DueTodayTable
                rows={dueTodayRows}
                onViewAll={() => navigate("/leads")}
                onFollowUp={() => navigate("/followups")}
              />
            </div>

            <HotLeadsAlert leads={hotLeads} />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}