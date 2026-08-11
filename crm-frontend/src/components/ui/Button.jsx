import { motion } from "framer-motion";

export default function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  ...props
}) {
  const base =
    "w-full rounded-lg py-3 text-sm font-semibold transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2";

  const variants = {
    primary:
      "bg-[#d95d08] text-white hover:bg-[#c45305] active:bg-[#ad4904]",
    secondary:
      "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
  };

  return (
    <motion.button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      whileHover={disabled || loading ? undefined : { scale: 1.015 }}
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      {...props}
    >
      {loading && (
        <motion.span
          className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
        />
      )}
      {loading ? "Please wait..." : children}
    </motion.button>
  );
}
