import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { Info, Share2, IdCard, FileText, MapPin, Plus } from "lucide-react";
import leadService from "../../services/leadService";

const STATUS_OPTIONS = ["New", "Warm", "Hot", "Cold", "Won", "Lost"];
// TODO: replace with real team members once Team module (backend + Users list) exists
const TEAM_MEMBERS = ["Unassigned", "Alex Sterling", "Marco Rossi", "Admin"];
const SOURCE_OPTIONS = ["Manual Entry", "Google Maps", "Referral", "Website Inquiry"];

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "crm-input w-full px-4 py-2.5 text-sm placeholder:text-slate-400 outline-none transition focus:bg-white";

export default function LeadForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { addNotification } = useNotifications();

  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    category: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    status: "New",
    group: "",
    assignedTo: "Unassigned",
    source: "Manual Entry",
    googleMapsLink: "",
    notes: "",
  });
  const [extraLinks, setExtraLinks] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  // If editing, load the existing lead's data first
  useEffect(() => {
    if (!isEditMode) return;
    (async () => {
      try {
        const lead = await leadService.getLead(id);
        setForm((prev) => ({ ...prev, ...lead, businessName: lead.businessName || "", ownerName: lead.ownerName || "", category: lead.category || "", phone: lead.phone || "", email: lead.email || "", website: lead.website || "", address: lead.address || "", facebook: lead.facebook || "", instagram: lead.instagram || "", linkedin: lead.linkedin || "", status: lead.status || "New", group: lead.group || "", assignedTo: lead.assignedTo || "Unassigned", source: lead.source || "Manual Entry", googleMapsLink: lead.googleMapsLink || "", notes: lead.notes || "" }));
      } catch (err) {
        console.error("Failed to load lead:", err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const next = {};
    if (!form.businessName.trim()) next.businessName = "Business name is required.";
    if (!form.phone.trim()) next.phone = "Phone number is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  setSaving(true);

  try {
    if (isEditMode) {
      await leadService.updateLead(id, form);

      addNotification(
        `Lead "${form.businessName}" was updated successfully.`,
        "success"
      );
    } else {
      await leadService.createLead(form);

      addNotification(
        `New lead "${form.businessName}" was added successfully.`,
        "success"
      );
    }

    navigate("/leads");
  } catch (err) {
    console.error("Failed to save lead:", err.message);

    addNotification(
      "Unable to save the lead. Please try again.",
      "error"
    );
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return <p className="text-sm text-slate-500">Loading lead...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
      {/* Basic Information */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 mb-5">
          <Info size={19} className="text-[#d95d08]" /> Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <Field label="Business Name" required>
            <input
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              placeholder="e.g. Acme Corporation"
              className={inputClass}
            />
            {errors.businessName && <p className="text-xs text-red-500 mt-1">{errors.businessName}</p>}
          </Field>

          <Field label="Owner Name">
            <input
              name="ownerName"
              value={form.ownerName}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className={inputClass}
            />
          </Field>

          <Field label="Category">
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Restaurant, Dentist, Real Estate"
              className={inputClass}
            />
          </Field>

          <Field label="Phone Number" required>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className={inputClass}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </Field>

          <Field label="Email" required>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="contact@business.com"
              className={inputClass}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </Field>

          <Field label="Website">
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://www.business.com"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Address">
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="123 Business Way, Suite 400, San Francisco, CA"
              className={`${inputClass} pl-10`}
            />
          </div>
        </Field>
      </section>

      {/* Social Media Links */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 mb-5">
          <Share2 size={18} className="text-[#d95d08]" /> Social Media Links
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <Field label="Facebook">
            <input
              name="facebook"
              value={form.facebook}
              onChange={handleChange}
              placeholder="facebook.com/company"
              className={inputClass}
            />
          </Field>

          <Field label="Instagram">
            <input
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
              placeholder="@company_handle"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="LinkedIn">
            <input
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
              placeholder="linkedin.com/company/profile"
              className={inputClass}
            />
          </Field>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setExtraLinks((prev) => [...prev, ""])}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-orange-200 text-[#d95d08] font-semibold text-sm rounded-lg py-2.5 hover:bg-orange-50 transition-colors"
            >
              <Plus size={16} /> Add another link
            </button>
          </div>
        </div>

        {extraLinks.map((link, i) => (
          <input
            key={i}
            value={link}
            onChange={(e) => {
              const next = [...extraLinks];
              next[i] = e.target.value;
              setExtraLinks(next);
            }}
            placeholder="https://..."
            className={`${inputClass} mt-3`}
          />
        ))}
      </section>

      {/* Lead Details */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 mb-5">
          <IdCard size={19} className="text-[#d95d08]" /> Lead Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
          <Field label="Lead Status">
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputClass}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          <Field label="Leads Group">
            <select
              name="group"
              value={form.group}
              onChange={handleChange}
              className={inputClass}
            >
<option value="Pharmacy">Pharmacy</option>
<option value="Gym">Gym & Fitness</option>
<option value="Salon">Salon & Spa</option>
<option value="School">Schools</option>
<option value="College">Colleges & Universities</option>
<option value="Clinic">Medical Clinics</option>
<option value="Law Firm">Law Firms</option>
<option value="Accounting">Accounting & Tax Services</option>
<option value="Travel Agency">Travel Agency</option>
<option value="Car Dealer">Car Dealership</option>
<option value="Construction">Construction Company</option>
<option value="Interior Design">Interior Design</option>
<option value="Marketing Agency">Marketing Agency</option>
<option value="Ecommerce">E-commerce Store</option>
<option value="Retail Shop">Retail Shop</option>
<option value="Hotel">Hotel & Guest House</option>
<option value="Cafe">Cafe & Coffee Shop</option>
<option value="Bakery">Bakery</option>
<option value="Logistics">Logistics & Courier</option>
<option value="Event Planner">Event Planner</option>
<option value="other">Others</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
          <Field label="Assigned User">
            <select
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
              className={inputClass}
            >
              {TEAM_MEMBERS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </Field>

          <Field label="Lead Source">
            <select
              name="source"
              value={form.source}
              onChange={handleChange}
              className={inputClass}
              disabled={form.source === "Google Maps"}
            >
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {form.source === "Google Maps" && (
              <p className="text-xs text-slate-400 mt-1">
                Set automatically - this lead was imported from Lead Discovery.
              </p>
            )}
          </Field>
        </div>

        {form.googleMapsLink && (
          <div className="mb-4">
            <Field label="Google Maps Link">
              <a
                href={form.googleMapsLink}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-[#d95d08] hover:underline truncate rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5"
              >
                {form.googleMapsLink}
              </a>
            </Field>
          </div>
        )}

        <div className="flex gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, status: s }))}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors ${
                form.status === s
                  ? "bg-[#d95d08] text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section className="mb-8">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 mb-5">
          <FileText size={18} className="text-[#d95d08]" /> Notes
        </h2>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={5}
          placeholder="Add any additional details or background information about this lead..."
          className={inputClass}
        />
      </section>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-lg bg-[#d95d08] hover:bg-[#c45305] active:bg-[#ad4904] text-white text-sm font-bold transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Lead"}
        </button>
      </div>
    </form>
  );
}
