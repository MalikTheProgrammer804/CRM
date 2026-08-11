import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useTheme } from "../../context/ThemeContext";

export default function Topbar({ title = "Dashboard", onMenuClick = () => {} }) {
  const { isDark } = useTheme();

  return (
    <header
      className={`flex h-16 items-center justify-between gap-3 border-b px-4 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur sm:px-6 ${isDark ? "border-slate-800 bg-slate-950/95" : "border-slate-200 bg-white/95"}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        {/* Hamburger - mobile/tablet only, opens the off-canvas sidebar */}
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className={`-ml-1 shrink-0 rounded-md p-2 md:hidden ${isDark ? "text-slate-200 hover:bg-white/10" : "text-slate-700 hover:bg-slate-100"}`}
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <p className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>Workspace</p>
          <AnimatePresence mode="wait">
            <motion.h1
              key={title}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`truncate text-base font-extrabold ${isDark ? "text-slate-100" : "text-[#172b4d]"}`}
            >
              {title}
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        className="flex shrink-0 items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <NotificationBell />
      </motion.div>
    </header>
  );
}
