import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { leadService } from "../../services/leadService";

const PIPELINE_STAGES = ["Fresh Lead", "Qualified", "Contacted", "Follow-up", "Proposal", "Negotiation", "Won"];

// Animation Variants for Page Entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function Reports() {
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

    const imported = leads.filter((l) => l.source?.toLowerCase().includes("import") || l.isImported).length;
    const manual = total - imported;

    const hot = leads.filter((l) => (l.status || l.temperature || "").toString().toLowerCase() === "hot").length;
    const warm = leads.filter((l) => (l.status || l.temperature || "").toString().toLowerCase() === "warm").length;
    const cold = leads.filter((l) => (l.status || l.temperature || "").toString().toLowerCase() === "cold").length;

    const won = leads.filter((l) => l.status === "Won" || l.stage === "Won").length;
    const lost = leads.filter((l) => l.status === "Lost" || l.stage === "Lost").length;
    const decidedTotal = won + lost;
    const winRate = decidedTotal > 0 ? Math.round((won / decidedTotal) * 100) : total > 0 ? Math.round((won / total) * 100) : 0;

    const stageCounts = PIPELINE_STAGES.reduce((acc, stage) => {
      acc[stage] = leads.filter((l) => l.stage === stage || l.status === stage).length;
      return acc;
    }, {});

    return {
      total,
      imported,
      manual,
      followupsDone: leads.filter((l) => l.lastContactedAt || l.followUpDone).length,
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
      { key: "Hot", color: "#FF5630", pct: hotPct, offset: 0 },
      { key: "Warm", color: "#FFAB00", pct: warmPct, offset: -hotPct },
      { key: "Cold", color: "#0065FF", pct: coldPct, offset: -(hotPct + warmPct) },
    ];
  }, [metrics]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-10"
    >
      {/* Header & Filter Controls */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="crm-page-title text-xl font-bold text-[#172b4d]">Reports & Analytics</h1>
          <p className="text-xs text-slate-500">Live performance based on your workspace leads.</p>
        </div>
        <div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm focus:outline-none"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">This Year</option>
          </select>
        </div>
      </motion.div>

      {/* Top Metric Cards */}
      <motion.div variants={containerVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Leads"
          value={metrics.total.toLocaleString()}
          change="+12%"
          isPositive={true}
          icon={
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <MetricCard
          label="Imported Leads"
          value={metrics.imported.toLocaleString()}
          change="+8.4%"
          isPositive={true}
          icon={
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          }
        />
        <MetricCard
          label="Manual Leads"
          value={metrics.manual.toLocaleString()}
          change="-2.1%"
          isPositive={false}
          icon={
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        />
        <MetricCard
          label="Follow-ups Done"
          value={metrics.followupsDone.toLocaleString()}
          change="+15.2%"
          isPositive={true}
          icon={
            <svg className="h-7 w-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </motion.div>

      {/* Middle Grid: Charts */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
        {/* Temperature Distribution Card */}
        <section className="crm-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-bold text-[#172b4d]">Lead Temperature Distribution</h2>
            <button className="text-slate-400 hover:text-slate-600">•••</button>
          </div>
          <div className="mt-6 flex flex-col items-center justify-around gap-6 sm:flex-row">
            <div className="relative flex h-40 w-40 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                
                {/* Donut Slices */}
                {donutSlices.map((slice) =>
                  slice.pct > 0 ? (
                    <motion.path
                      key={slice.key}
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{ strokeDasharray: `${slice.pct}, 100` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      stroke={slice.color}
                      strokeDashoffset={slice.offset}
                      strokeWidth="4"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  ) : null
                )}
              </svg>
              <div className="absolute text-center">
                <span className="block text-xl font-black text-[#172b4d]">{metrics.total.toLocaleString()}</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">TOTAL</span>
              </div>
            </div>

            <div className="w-full space-y-3 sm:w-auto">
              <TemperatureRow label="Hot" color="#FF5630" count={metrics.hot} total={metrics.total} />
              <TemperatureRow label="Warm" color="#FFAB00" count={metrics.warm} total={metrics.total} />
              <TemperatureRow label="Cold" color="#0065FF" count={metrics.cold} total={metrics.total} />
            </div>
          </div>
        </section>

        {/* Conversion Overview Card */}
        <section className="crm-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-bold text-[#172b4d]">Conversion Overview (Won vs Lost)</h2>
            <button className="text-slate-400 hover:text-slate-600">•••</button>
          </div>
          <div className="mt-6 flex flex-col items-center justify-around gap-6 sm:flex-row">
            <div className="relative flex h-40 w-40 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                <path className="text-[#FF5630]" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <motion.path
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${metrics.winRate}, 100` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-[#00A389]"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="block text-2xl font-white text-[#172b4d]">{metrics.winRate}%</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">WIN RATE</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-[#00A389]" />
                <span className="w-16 text-xs font-semibold text-slate-500">Won</span>
                <span className="text-base font-bold text-[#172b4d]">{metrics.won.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-[#FF5630]" />
                <span className="w-16 text-xs font-semibold text-slate-500">Lost</span>
                <span className="text-base font-bold text-[#172b4d]">{metrics.lost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </section>
      </motion.div>

      {/* Bottom Funnel Section */}
      <motion.section variants={itemVariants} className="crm-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-bold text-[#172b4d]">Pipeline Conversion Funnel</h2>
            <p className="text-xs text-slate-400">Analysis of lead progression through sales stages</p>
          </div>
          <button className="text-xs font-semibold text-slate-600 hover:text-slate-900">View Details &rarr;</button>
        </div>

        <div className="mt-8 overflow-x-auto pb-4">
          <div className="flex min-w-[700px] items-center justify-between gap-2 px-2">
            {PIPELINE_STAGES.map((stage, index) => {
              const stageVal = metrics.stageCounts[stage] || 0;
              const prevStage = PIPELINE_STAGES[index - 1];
              const prevVal = prevStage ? metrics.stageCounts[prevStage] || 1 : stageVal;
              const dropPercent = prevVal > 0 && index > 0 ? Math.round((stageVal / prevVal) * 100) : 100;

              return (
                <div key={stage} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-sm font-bold text-[#172b4d]">{stageVal.toLocaleString()}</span>
                    <span className="mt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-tight">{stage}</span>
                  </div>
                  {index < PIPELINE_STAGES.length - 1 && (
                    <div className="flex items-center px-1">
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-100">
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

/* Metric Card */
function MetricCard({ label, value, change, isPositive, icon }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="crm-card rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">{icon}</div>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {isPositive ? "↑" : "↓"} {change}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-black text-[#172b4d]">{value}</p>
      </div>
    </motion.div>
  );
}

/* Legend Row */
function TemperatureRow({ label, color, count, total }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-4 text-xs font-medium">
      <div className="flex items-center gap-2 w-16">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-slate-600">{label}</span>
      </div>
      <span className="font-bold text-[#172b4d] w-12 text-right">{percentage}%</span>
    </div>
  );
}