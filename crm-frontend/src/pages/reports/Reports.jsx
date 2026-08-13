import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { leadService } from "../../services/leadService";
import { useTheme } from "../../context/ThemeContext";

const PIPELINE_STAGES = [
  "Fresh Lead",
  "Qualified",
  "Contacted",
  "Follow-up",
  "Proposal",
  "Negotiation",
  "Won",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

export default function Reports() {
  const { isDark } = useTheme();

  const [leads, setLeads] = useState([]);
  const [timeRange, setTimeRange] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    leadService
      .getLeads()
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const total = leads.length;

    const imported = leads.filter(
      (l) =>
        l.source?.toLowerCase().includes("import") ||
        l.isImported
    ).length;

    const manual = total - imported;

    const hot = leads.filter(
      (l) =>
        (l.status || l.temperature || "")
          .toString()
          .toLowerCase() === "hot"
    ).length;

    const warm = leads.filter(
      (l) =>
        (l.status || l.temperature || "")
          .toString()
          .toLowerCase() === "warm"
    ).length;

    const cold = leads.filter(
      (l) =>
        (l.status || l.temperature || "")
          .toString()
          .toLowerCase() === "cold"
    ).length;

    const won = leads.filter(
      (l) => l.status === "Won" || l.stage === "Won"
    ).length;

    const lost = leads.filter(
      (l) => l.status === "Lost" || l.stage === "Lost"
    ).length;

    const decidedTotal = won + lost;

    const winRate =
      decidedTotal > 0
        ? Math.round((won / decidedTotal) * 100)
        : total > 0
          ? Math.round((won / total) * 100)
          : 0;

    const stageCounts = PIPELINE_STAGES.reduce((acc, stage) => {
      acc[stage] = leads.filter(
        (l) => l.stage === stage || l.status === stage
      ).length;

      return acc;
    }, {});

    return {
      total,
      imported,
      manual,
      followupsDone: leads.filter(
        (l) => l.lastContactedAt || l.followUpDone
      ).length,
      hot,
      warm,
      cold,
      won,
      lost,
      winRate,
      stageCounts,
    };
  }, [leads]);

  const donutSlices = useMemo(() => {
    const total = metrics.total || 1;

    const hotPct = (metrics.hot / total) * 100;
    const warmPct = (metrics.warm / total) * 100;
    const coldPct = (metrics.cold / total) * 100;

    return [
      {
        key: "Hot",
        color: "#FF5630",
        pct: hotPct,
        offset: 0,
      },
      {
        key: "Warm",
        color: "#FFAB00",
        pct: warmPct,
        offset: -hotPct,
      },
      {
        key: "Cold",
        color: "#0065FF",
        pct: coldPct,
        offset: -(hotPct + warmPct),
      },
    ];
  }, [metrics]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div
          className={`h-9 w-9 animate-spin rounded-full border-4 ${
            isDark
              ? "border-teal-400 border-t-transparent"
              : "border-indigo-600 border-t-transparent"
          }`}
        />
      </div>
    );
  }

  const pageText = isDark
    ? "text-slate-100"
    : "text-[#172b4d]";

  const secondaryText = isDark
    ? "text-slate-400"
    : "text-slate-500";

  const cardClass = isDark
    ? "border-slate-700 bg-slate-900 shadow-none"
    : "border-slate-200 bg-white shadow-sm";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-5 pb-6"
    >
      {/* HEADER */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1
            className={`text-2xl font-extrabold tracking-tight ${pageText}`}
          >
            Reports & Analytics
          </h1>

          <p className={`mt-1 text-sm ${secondaryText}`}>
            Live performance based on your workspace leads.
          </p>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className={`rounded-lg border px-3 py-2 text-sm font-semibold outline-none transition ${
            isDark
              ? "border-slate-600 bg-slate-800 text-slate-100 focus:border-teal-400"
              : "border-slate-200 bg-white text-slate-700 focus:border-teal-500"
          }`}
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">This Year</option>
        </select>
      </motion.div>

      {/* METRIC CARDS */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          label="Total Leads"
          value={metrics.total.toLocaleString()}
          change="+12%"
          isPositive
          icon={
            <svg
              className="h-5 w-5 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
          isDark={isDark}
        />

        <MetricCard
          label="Imported Leads"
          value={metrics.imported.toLocaleString()}
          change="+8.4%"
          isPositive
          icon={
            <svg
              className="h-5 w-5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          }
          isDark={isDark}
        />

        <MetricCard
          label="Manual Leads"
          value={metrics.manual.toLocaleString()}
          change="-2.1%"
          isPositive={false}
          icon={
            <svg
              className="h-5 w-5 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          }
          isDark={isDark}
        />

        <MetricCard
          label="Follow-ups Done"
          value={metrics.followupsDone.toLocaleString()}
          change="+15.2%"
          isPositive
          icon={
            <svg
              className="h-6 w-6 text-teal-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          isDark={isDark}
        />
      </motion.div>

      {/* CHARTS */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-5 xl:grid-cols-2"
      >
        {/* TEMPERATURE */}
        <section
          className={`rounded-xl border p-5 transition ${cardClass}`}
        >
          <div
            className={`flex items-center justify-between border-b pb-4 ${
              isDark
                ? "border-slate-700"
                : "border-slate-100"
            }`}
          >
            <div>
              <h2 className={`text-base font-bold ${pageText}`}>
                Lead Temperature Distribution
              </h2>

              <p className={`mt-1 text-xs ${secondaryText}`}>
                Current lead temperature breakdown
              </p>
            </div>

            <button
              className={`rounded-md px-2 py-1 ${
                isDark
                  ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              •••
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-8 sm:flex-row sm:justify-around">
            <div className="relative h-44 w-44 shrink-0">
              <svg
                className="h-full w-full -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  strokeWidth="4"
                  stroke={
                    isDark ? "#1e293b" : "#e2e8f0"
                  }
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />

                {donutSlices.map((slice) =>
                  slice.pct > 0 ? (
                    <motion.path
                      key={slice.key}
                      initial={{
                        strokeDasharray: "0, 100",
                      }}
                      animate={{
                        strokeDasharray: `${slice.pct}, 100`,
                      }}
                      transition={{
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                      stroke={slice.color}
                      strokeDashoffset={slice.offset}
                      strokeWidth="4"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  ) : null
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span
                  className={`text-2xl font-black ${pageText}`}
                >
                  {metrics.total.toLocaleString()}
                </span>

                <span
                  className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${secondaryText}`}
                >
                  TOTAL
                </span>
              </div>
            </div>

            <div className="w-full max-w-[190px] space-y-4">
              <TemperatureRow
                label="Hot"
                color="#FF5630"
                count={metrics.hot}
                total={metrics.total}
                isDark={isDark}
              />

              <TemperatureRow
                label="Warm"
                color="#FFAB00"
                count={metrics.warm}
                total={metrics.total}
                isDark={isDark}
              />

              <TemperatureRow
                label="Cold"
                color="#0065FF"
                count={metrics.cold}
                total={metrics.total}
                isDark={isDark}
              />
            </div>
          </div>
        </section>

        {/* CONVERSION */}
        <section
          className={`rounded-xl border p-5 transition ${cardClass}`}
        >
          <div
            className={`flex items-center justify-between border-b pb-4 ${
              isDark
                ? "border-slate-700"
                : "border-slate-100"
            }`}
          >
            <div>
              <h2 className={`text-base font-bold ${pageText}`}>
                Conversion Overview
              </h2>

              <p className={`mt-1 text-xs ${secondaryText}`}>
                Won vs Lost leads
              </p>
            </div>

            <button
              className={`rounded-md px-2 py-1 ${
                isDark
                  ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              •••
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-8 sm:flex-row sm:justify-around">
            <div className="relative h-44 w-44 shrink-0">
              <svg
                className="h-full w-full -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  strokeWidth="4.5"
                  stroke={
                    isDark ? "#334155" : "#fee2e2"
                  }
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />

                <motion.path
                  initial={{
                    strokeDasharray: "0, 100",
                  }}
                  animate={{
                    strokeDasharray: `${metrics.winRate}, 100`,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  stroke="#00A389"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-2xl font-black ${pageText}`}
                >
                  {metrics.winRate}%
                </span>

                <span
                  className={`mt-1 text-[10px] font-semibold uppercase tracking-wider ${secondaryText}`}
                >
                  WIN RATE
                </span>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-[#00A389]" />

                <span
                  className={`w-16 text-sm font-semibold ${secondaryText}`}
                >
                  Won
                </span>

                <span
                  className={`text-lg font-black ${pageText}`}
                >
                  {metrics.won.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-[#FF5630]" />

                <span
                  className={`w-16 text-sm font-semibold ${secondaryText}`}
                >
                  Lost
                </span>

                <span
                  className={`text-lg font-black ${pageText}`}
                >
                  {metrics.lost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </section>
      </motion.div>

      {/* PIPELINE FUNNEL */}
      <motion.section
        variants={itemVariants}
        className={`rounded-xl border p-5 transition ${cardClass}`}
      >
        <div
          className={`flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between ${
            isDark
              ? "border-slate-700"
              : "border-slate-100"
          }`}
        >
          <div>
            <h2 className={`text-base font-bold ${pageText}`}>
              Pipeline Conversion Funnel
            </h2>

            <p className={`mt-1 text-xs ${secondaryText}`}>
              Analysis of lead progression through sales stages
            </p>
          </div>

          <button
            className={`text-xs font-bold transition ${
              isDark
                ? "text-teal-400 hover:text-teal-300"
                : "text-teal-700 hover:text-teal-900"
            }`}
          >
            View Details →
          </button>
        </div>

        <div className="mt-6 overflow-x-auto pb-2">
          <div className="flex min-w-[760px] items-center justify-between gap-2 px-2">
            {PIPELINE_STAGES.map((stage, index) => {
              const stageVal =
                metrics.stageCounts[stage] || 0;

              const prevStage =
                PIPELINE_STAGES[index - 1];

              const prevVal = prevStage
                ? metrics.stageCounts[prevStage] || 1
                : stageVal;

              const dropPercent =
                prevVal > 0 && index > 0
                  ? Math.round(
                      (stageVal / prevVal) * 100
                    )
                  : 100;

              return (
                <div
                  key={stage}
                  className="flex flex-1 items-center"
                >
                  <div className="flex flex-1 flex-col items-center">
                    <span
                      className={`text-lg font-black ${pageText}`}
                    >
                      {stageVal.toLocaleString()}
                    </span>

                    <span
                      className={`mt-1 text-[10px] font-bold uppercase tracking-tight ${secondaryText}`}
                    >
                      {stage}
                    </span>
                  </div>

                  {index < PIPELINE_STAGES.length - 1 && (
                    <div className="px-1">
                      <span
                        className={`rounded-full border px-2 py-1 text-[10px] font-bold ${
                          isDark
                            ? "border-teal-800 bg-teal-950 text-teal-300"
                            : "border-teal-100 bg-teal-50 text-teal-700"
                        }`}
                      >
                        {dropPercent}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

/* ============================= */
/* METRIC CARD */
/* ============================= */

function MetricCard({
  label,
  value,
  change,
  isPositive,
  icon,
  isDark,
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -3,
        transition: { duration: 0.2 },
      }}
      className={`rounded-xl border p-5 transition-shadow hover:shadow-md ${
        isDark
          ? "border-slate-700 bg-slate-900"
          : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`rounded-lg border p-2.5 ${
            isDark
              ? "border-slate-700 bg-slate-800"
              : "border-slate-100 bg-slate-50"
          }`}
        >
          {icon}
        </div>

        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
            isPositive
              ? isDark
                ? "bg-emerald-950 text-emerald-300"
                : "bg-emerald-50 text-emerald-700"
              : isDark
                ? "bg-rose-950 text-rose-300"
                : "bg-rose-50 text-rose-700"
          }`}
        >
          {isPositive ? "↑" : "↓"} {change}
        </span>
      </div>

      <div className="mt-5">
        <p
          className={`text-[11px] font-bold uppercase tracking-wider ${
            isDark ? "text-slate-400" : "text-slate-400"
          }`}
        >
          {label}
        </p>

        <p
          className={`mt-1 text-3xl font-black ${
            isDark
              ? "text-white"
              : "text-[#172b4d]"
          }`}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );
}

/* ============================= */
/* TEMPERATURE ROW */
/* ============================= */

function TemperatureRow({
  label,
  color,
  count,
  total,
  isDark,
}) {
  const percentage =
    total > 0
      ? Math.round((count / total) * 100)
      : 0;

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: color }}
        />

        <span
          className={`font-semibold ${
            isDark
              ? "text-slate-300"
              : "text-slate-600"
          }`}
        >
          {label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`font-black ${
            isDark
              ? "text-white"
              : "text-[#172b4d]"
          }`}
        >
          {count}
        </span>

        <span
          className={`w-10 text-right font-bold ${
            isDark
              ? "text-slate-400"
              : "text-slate-500"
          }`}
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
}
