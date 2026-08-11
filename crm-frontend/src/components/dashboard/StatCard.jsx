import { motion } from "framer-motion";

export default function StatCard({ label, value, accent = "border-slate-200", valueColor = "text-slate-900", darkMode = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 10px 24px rgba(15,23,42,0.08)" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`rounded-2xl border bg-white px-5 py-4 shadow-sm ${darkMode ? "border-slate-700 bg-slate-900" : "border-slate-200"} ${accent}`}
    >
      <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
        {label}
      </p>
      <motion.p
        key={value}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`text-3xl font-extrabold ${valueColor} ${darkMode ? "text-slate-100" : valueColor}`}
      >
        {value}
      </motion.p>
    </motion.div>
  );
}
