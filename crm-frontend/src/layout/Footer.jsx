import { Link } from "react-router-dom";
import { ArrowUp, MapPin, Phone, Globe2, Send, MessageCircle } from "lucide-react";

const QUICK_LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "All Leads", to: "/leads" },
  { label: "Lead Discovery", to: "/lead-discovery" },
  { label: "Team", to: "/team" },
  { label: "Settings", to: "/settings" },
];

// TODO: replace with your real company social profile URLs
const SOCIAL_LINKS = [
  { label: "LinkedIn", icon: Globe2, href: "https://www.linkedin.com/company/wessmaa_official/" },
  { label: "Tiktok", icon: Send, href: "https://www.tiktok.com/@wessmaa2?_r=1&_t=ZS-98ZLQwMbeIX" },
  { label: "Instagram", icon: MessageCircle, href: "https://www.instagram.com/wessmaa_official?igsh=MWRrMjZnY3JlanVrMA==" },

];

// TODO: replace with your real office address(es)
const OFFICES = [
  {
    address: "401 - Wessmaa CRM, Business Bay, Islamabad, Pakistan",
    phone: "+92 336 6018697",
  },
];

function mapsLink(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative bg-white border-t border-slate-200 mt-10">
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h3 className="text-lg font-extrabold text-teal-800 mb-3">Wessmaa CRM</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            Discover, organize, and convert leads from Google Maps - the local
            lead generation CRM built for modern sales teams.
          </p>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Wessmaa CRM. All Rights Reserved.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-4">Quick Links</h4>
          <ul className="space-y-2.5">
            {QUICK_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-slate-500 hover:text-teal-700 transition">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social links */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-4">Social Links</h4>
          <ul className="space-y-2.5">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-700 transition"
                >
                  <social.icon size={14} /> {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact - clicking the address opens Google Maps for that location */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-4">Contact</h4>
          <ul className="space-y-4">
            {OFFICES.map((office) => (
              <li key={office.address}>
                <a
                  href={mapsLink(office.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2 text-sm text-slate-500 hover:text-teal-700 transition leading-relaxed"
                >
                  <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                  {office.address}
                </a>
                <a
                  href={`tel:${office.phone}`}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-700 transition mt-1.5"
                >
                  <Phone size={14} /> {office.phone}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar - legal links, like most companies/CRMs have */}
      <div className="border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Wessmaa CRM. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/terms" target="_blank" className="text-xs text-slate-500 hover:text-teal-700 transition">
              Terms &amp; Conditions
            </Link>
            <Link to="/privacy" target="_blank" className="text-xs text-slate-500 hover:text-teal-700 transition">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Back to top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg transition"
        aria-label="Back to top"
      >
        <ArrowUp size={18} />
      </button>
    </footer>
  );
}