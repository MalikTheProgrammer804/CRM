import { Link } from "react-router-dom";
import {
  ArrowUp,
  MapPin,
  Phone,
  Globe2,
  Send,
  MessageCircle,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/logo.png";

const QUICK_LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "All Leads", to: "/leads" },
  { label: "Lead Discovery", to: "/lead-discovery" },
  { label: "Team", to: "/team" },
  { label: "Settings", to: "/settings" },
];

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    icon: Globe2,
    href: "https://www.linkedin.com/company/wessmaa_official/",
  },
  {
    label: "TikTok",
    icon: Send,
    href: "https://www.tiktok.com/@wessmaa2?_r=1&_t=ZS-98ZLQwMbeIX",
  },
  {
    label: "Instagram",
    icon: MessageCircle,
    href: "https://www.instagram.com/wessmaa_official?igsh=MWRrMjZnY3JlanVrMA==",
  },
];

const OFFICES = [
  {
    address: "401 - Wessmaa CRM, Business Bay, Islamabad, Pakistan",
    phone: "+92 336 6018697",
  },
];

function mapsLink(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
}

export default function Footer() {
  const { isDark } = useTheme();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer
      className={`relative mt-6 border-t transition-colors duration-300 ${
        isDark
          ? "border-slate-800 bg-[#020617] text-slate-200"
          : "border-slate-200 bg-white text-slate-700"
      }`}
    >
      {/* Main Footer */}
      <div
        className="
          mx-auto grid max-w-7xl
          grid-cols-1 gap-8
          px-5 py-8
          sm:px-6
          md:grid-cols-2
          lg:grid-cols-4
          lg:gap-10
          lg:px-8
        "
      >
        {/* Brand */}
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isDark ? "bg-white" : "bg-slate-100"
              }`}
            >
              <img
                src={logo}
                alt="Wessmaa"
                className="h-8 w-8 object-contain"
              />
            </div>

            <h3
              className={`text-lg font-extrabold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Wessmaa CRM
            </h3>
          </div>

          <p
            className={`max-w-sm text-sm leading-6 ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Discover, organize, and convert leads from Google Maps — the local
            lead generation CRM built for modern sales teams.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4
            className={`mb-4 text-sm font-bold uppercase tracking-wide ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Quick Links
          </h4>

          <ul className="space-y-2.5">
            {QUICK_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`text-sm transition-colors ${
                    isDark
                      ? "text-slate-300 hover:text-orange-400"
                      : "text-slate-600 hover:text-orange-600"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h4
            className={`mb-4 text-sm font-bold uppercase tracking-wide ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Social Links
          </h4>

          <ul className="space-y-3">
            {SOCIAL_LINKS.map((social) => {
              const Icon = social.icon;

              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      isDark
                        ? "text-slate-300 hover:text-orange-400"
                        : "text-slate-600 hover:text-orange-600"
                    }`}
                  >
                    <Icon size={15} strokeWidth={2} />
                    <span>{social.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4
            className={`mb-4 text-sm font-bold uppercase tracking-wide ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Contact
          </h4>

          <ul className="space-y-3">
            {OFFICES.map((office) => (
              <li key={office.address}>
                <a
                  href={mapsLink(office.address)}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-start gap-2 text-sm leading-5 transition-colors ${
                    isDark
                      ? "text-slate-300 hover:text-orange-400"
                      : "text-slate-600 hover:text-orange-600"
                  }`}
                >
                  <MapPin
                    size={15}
                    className="mt-0.5 shrink-0"
                    strokeWidth={2}
                  />

                  <span>{office.address}</span>
                </a>

                <a
                  href={`tel:${office.phone}`}
                  className={`mt-2 flex items-center gap-2 text-sm transition-colors ${
                    isDark
                      ? "text-slate-300 hover:text-orange-400"
                      : "text-slate-600 hover:text-orange-600"
                  }`}
                >
                  <Phone size={15} strokeWidth={2} />
                  <span>{office.phone}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className={`border-t ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div
          className="
            mx-auto flex max-w-7xl
            flex-col items-center justify-between
            gap-3 px-5 py-4
            sm:flex-row sm:px-6
            lg:px-8
          "
        >
          <p
            className={`text-xs ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            © {new Date().getFullYear()} Wessmaa CRM. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link
              to="/terms"
              target="_blank"
              className={`text-xs transition-colors ${
                isDark
                  ? "text-slate-400 hover:text-orange-400"
                  : "text-slate-500 hover:text-orange-600"
              }`}
            >
              Terms & Conditions
            </Link>

            <Link
              to="/privacy"
              target="_blank"
              className={`text-xs transition-colors ${
                isDark
                  ? "text-slate-400 hover:text-orange-400"
                  : "text-slate-500 hover:text-orange-600"
              }`}
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Back To Top */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className="
          fixed bottom-5 right-5
          z-50 flex h-11 w-11
          items-center justify-center
          rounded-full
          bg-[#e86f00]
          text-white
          shadow-lg
          transition-all duration-200
          hover:bg-[#c85e00]
          hover:scale-105
          active:scale-95
          sm:bottom-6 sm:right-6
        "
      >
        <ArrowUp size={18} strokeWidth={2.5} />
      </button>
    </footer>
  );
}
