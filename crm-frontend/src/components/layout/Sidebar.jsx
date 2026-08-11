import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import {
  LayoutGrid,
  Users,
  MapPin,
  GitBranch,
  CalendarClock,
  FolderKanban,
  BarChart3,
  UsersRound,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import authService from "../../services/authService";
import logo from "../../assets/logo.png";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutGrid },
  { label: "Leads", to: "/leads", icon: Users },
  { label: "Lead Discovery", to: "/lead-discovery", icon: MapPin },
  { label: "Pipeline", to: "/pipeline", icon: GitBranch },
  { label: "Follow-ups", to: "/followups", icon: CalendarClock },
  { label: "Lead Groups", to: "/lead-groups", icon: FolderKanban },
  { label: "Reports", to: "/reports", icon: BarChart3 },
  { label: "Team", to: "/team", icon: UsersRound },
  { label: "Settings", to: "/settings", icon: Settings },
];

const navListVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045, delayChildren: 0.1 },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const handleSignout = async () => {
    await authService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile backdrop - click to close the drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar drawer: off-canvas + slide-in on mobile, always-visible static column on md+ */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 max-w-[85vw] shrink-0 flex-col transition-transform duration-300 ease-in-out
          md:sticky md:top-0 md:z-0 md:h-screen md:w-64 md:max-w-none md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isDark ? "bg-slate-900 text-slate-100" : "bg-[#0b6e63] text-white"}`}
      >
        <div className="flex items-center justify-between px-5 py-8 md:block">
          <motion.div
            className="flex flex-1 flex-col items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white"
              whileHover={{ scale: 1.08, rotate: 4 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <img src={logo} alt="Wessmaa" className="h-10 w-10 object-contain" />
            </motion.div>
            <h1 className="text-xl font-bold tracking-tight">Wessmaa</h1>
          </motion.div>

          {/* Close button - mobile only */}
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md p-2 text-white/80 hover:bg-white/10 md:hidden"
          >
            <X size={22} />
          </button>
        </div>

      <motion.nav
        className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2"
        variants={navListVariants}
        initial="hidden"
        animate="visible"
      >
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => {
          const isActive =
            to === "/dashboard"
              ? location.pathname === to
              : location.pathname.startsWith(to);

          return (
            <motion.div key={to} variants={navItemVariants} className="relative">
              <NavLink
                to={to}
                onClick={onClose}
                className={({ isActive: navActive }) =>
                  `relative z-10 flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium transition-colors duration-200 ${
                    navActive
                      ? "text-white"
                      : isDark
                        ? "text-slate-300 hover:bg-white/10"
                        : "text-white/85 hover:bg-white/10"
                  }`
                }
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 -z-10 rounded-md bg-[#e86f00] shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={20} strokeWidth={2} />
                {label}
              </NavLink>
            </motion.div>
          );
        })}
      </motion.nav>

      <div className="px-3 py-6">
        <motion.button
          onClick={handleSignout}
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.97 }}
          className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-base font-bold transition-colors duration-200 ${
            isDark ? "text-slate-100 hover:bg-white/10" : "text-white hover:bg-white/10"
          }`}
        >
          Sign out
          <LogOut size={20} strokeWidth={2} />
        </motion.button>
      </div>
    </aside>
    </>
  );
}
