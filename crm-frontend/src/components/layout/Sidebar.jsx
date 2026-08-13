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
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.1,
    },
  },
};

const navItemVariants = {
  hidden: {
    opacity: 0,
    x: -14,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

export default function Sidebar({
  isOpen = false,
  onClose = () => {},
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const handleSignout = async () => {
    await authService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* =====================================================
          MOBILE BACKDROP
          ===================================================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[1px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* =====================================================
          SIDEBAR
          ===================================================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          flex h-dvh w-72 max-w-[88vw] flex-col
          overflow-hidden
          shadow-xl
          transition-transform duration-300 ease-in-out

          md:sticky md:top-0 md:z-0
          md:h-screen md:w-64 md:max-w-none
          md:translate-x-0 md:shadow-none

          ${isOpen ? "translate-x-0" : "-translate-x-full"}

          ${
            isDark
              ? "bg-slate-900 text-slate-100"
              : "bg-[#0b6e63] text-white"
          }
        `}
      >
        {/* =================================================
            LOGO / HEADER
            ================================================= */}
        <div
          className={`
            flex shrink-0 items-center justify-between
            border-b px-5 py-5
            ${
              isDark
                ? "border-slate-700/70"
                : "border-white/10"
            }
          `}
        >
          <motion.div
            className="flex min-w-0 flex-1 items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
          >
            {/* Logo */}
            <motion.div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm"
              whileHover={{
                scale: 1.05,
                rotate: 2,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
              }}
            >
              <img
                src={logo}
                alt="Wessmaa"
                className="h-8 w-8 object-contain"
              />
            </motion.div>

            {/* Brand */}
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight">
                Wessmaa
              </h1>

              <p
                className={`
                  truncate text-[11px] font-medium
                  ${
                    isDark
                      ? "text-slate-400"
                      : "text-white/65"
                  }
                `}
              >
                CRM Workspace
              </p>
            </div>
          </motion.div>

          {/* Mobile close */}
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="
              ml-2 flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-lg text-white/80
              hover:bg-white/10
              md:hidden
            "
          >
            <X size={21} />
          </button>
        </div>

        {/* =================================================
            NAVIGATION
            ================================================= */}
        <motion.nav
          className="
            min-h-0 flex-1
            overflow-y-auto overflow-x-hidden
            px-3 py-4
            overscroll-contain
          "
          variants={navListVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-1">
            {NAV_ITEMS.map(
              ({ label, to, icon: Icon }) => {
                const isActive =
                  to === "/dashboard"
                    ? location.pathname === to
                    : location.pathname.startsWith(to);

                return (
                  <motion.div
                    key={to}
                    variants={navItemVariants}
                    className="relative"
                  >
                    <NavLink
                      to={to}
                      onClick={onClose}
                      className={({ isActive: navActive }) => `
                        relative z-10
                        flex min-h-[46px]
                        w-full items-center gap-3
                        rounded-lg px-4 py-3
                        text-[15px] font-medium
                        transition-all duration-200

                        ${
                          navActive
                            ? "text-white"
                            : isDark
                              ? "text-slate-300 hover:bg-white/10 hover:text-white"
                              : "text-white/85 hover:bg-white/10 hover:text-white"
                        }
                      `}
                    >
                      {/* Active background */}
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active-pill"
                          className="
                            absolute inset-0 -z-10
                            rounded-lg
                            bg-[#e86f00]
                            shadow-sm
                          "
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 32,
                          }}
                        />
                      )}

                      <Icon
                        size={20}
                        strokeWidth={2}
                        className="shrink-0"
                      />

                      <span className="truncate">
                        {label}
                      </span>
                    </NavLink>
                  </motion.div>
                );
              }
            )}
          </div>
        </motion.nav>

        {/* =================================================
            BOTTOM / SIGN OUT
            ================================================= */}
        <div
          className={`
            shrink-0 border-t
            px-3 py-3
            ${
              isDark
                ? "border-slate-700/70"
                : "border-white/10"
            }
          `}
        >
          <motion.button
            onClick={handleSignout}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.97 }}
            className={`
              flex min-h-[46px] w-full
              items-center gap-3
              rounded-lg px-4 py-3
              text-[15px] font-semibold
              transition-colors duration-200

              ${
                isDark
                  ? "text-slate-100 hover:bg-white/10"
                  : "text-white hover:bg-white/10"
              }
            `}
          >
            <LogOut
              size={20}
              strokeWidth={2}
              className="shrink-0"
            />

            <span>Sign out</span>
          </motion.button>
        </div>
      </aside>
    </>
  );
}
