import { motion } from "framer-motion";
import logo from "../../assets/logo.png";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      <div className="relative w-full md:w-1/2 min-h-[320px] md:min-h-screen flex flex-col justify-between px-8 py-10 md:px-16 md:py-14 bg-gradient-to-br from-[#061739] via-[#0f2c72] to-[#163c9c] overflow-hidden text-white">
        {/* Ambient floating orbs - purely decorative, animated */}
        <motion.div
          className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[#e86f00]/20 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-10 left-0 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl"
          animate={{ y: [0, -18, 0], x: [0, 14, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <div>
          <motion.div
            className="flex items-center gap-4 mb-10"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl"
              whileHover={{ scale: 1.08, rotate: 3 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <img src={logo} alt="Wessmaa logo" className="h-12 w-12 object-contain" />
            </motion.div>
            <div>
              <p className="text-xl font-semibold tracking-wide text-white">Wessmaa</p>
              <p className="text-sm text-slate-300">CRM built for local sales teams.</p>
            </div>
          </motion.div>

          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.15 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-6">
              Master your local sales pipeline.
            </h1>
            <p className="text-slate-200/85 text-base leading-relaxed">
              Discover, organize, and convert leads from Google Maps. The most precise local lead generation tool for modern sales teams.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="text-teal-100/70 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Trusted by teams across agencies, consultancies, and local businesses.
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
      </div>

      {/* Content panel */}
      <motion.div
        className="w-full md:w-1/2 min-h-screen flex flex-col items-center justify-center gap-4 bg-[#eef4ff] px-6 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
