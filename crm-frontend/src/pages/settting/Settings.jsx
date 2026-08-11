import { useEffect, useState } from "react";
import { workspaceService } from "../../services/workspaceService";
import authService from "../../services/authService";
import { useTheme } from "../../context/ThemeContext";

const DEFAULT_USER_PROFILE = {
  fullName: "",
  phoneNumber: "",
  currentPassword: "",
  newPassword: "",
  interfacePreference: "Light",
  notificationPreferences: {
    emailAlerts: true,
    desktopPush: true,
    weeklySummary: false,
    mobileSMS: false,
  },
};

function formatTextList(items) {
  return Array.isArray(items) ? items.join("\n") : "";
}

function parseTextList(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("company");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { isDark, setThemePreference } = useTheme();

  const [form, setForm] = useState({
    companyName: "",
    logoUrl: "",
    timeZone: "UTC",
    currency: "USD",
    pipelineStagesText: "",
    leadScoringText: "",
    automatedFollowupsText: "",
    leadSourceTagsText: "",
  });

  const [profile, setProfile] = useState(DEFAULT_USER_PROFILE);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const workspace = await workspaceService.get();
        if (workspace) {
          setForm({
            companyName: workspace.companyName || "",
            logoUrl: workspace.logoUrl || "",
            timeZone: workspace.timeZone || "UTC",
            currency: workspace.currency || "USD",
            pipelineStagesText: formatTextList(workspace.pipelineStages || []),
            leadScoringText: formatTextList(workspace.leadScoring || []),
            automatedFollowupsText: formatTextList(workspace.automatedFollowups || []),
            leadSourceTagsText: formatTextList(workspace.leadSourceTags || []),
          });
        }
      } catch {
        setMessage("Unable to load company settings.");
      }

      try {
        const user = await authService.me();
        if (user) {
          const userPref = user.interfacePreference || "Light";
          setProfile((current) => ({
            ...current,
            fullName: user.fullName || "",
            phoneNumber: user.phoneNumber || "",
            interfacePreference: userPref,
            notificationPreferences: {
              ...current.notificationPreferences,
              ...(user.notificationPreferences || {}),
            },
          }));
        }
      } catch {
        setMessage((prev) => prev || "Unable to load user settings.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const saveCompany = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const payload = {
        companyName: form.companyName,
        logoUrl: form.logoUrl,
        timeZone: form.timeZone,
        currency: form.currency,
      };
      const updated = await workspaceService.update(payload);
      setForm((current) => ({
        ...current,
        companyName: updated?.companyName || current.companyName,
        logoUrl: updated?.logoUrl || current.logoUrl,
        timeZone: updated?.timeZone || current.timeZone,
        currency: updated?.currency || current.currency,
      }));
      setMessage("Company settings saved successfully.");
    } catch {
      setMessage("Unable to save company settings.");
    }
  };

  const saveUser = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const payload = {
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        currentPassword: profile.currentPassword,
        newPassword: profile.newPassword,
        interfacePreference: profile.interfacePreference,
        notificationPreferences: profile.notificationPreferences,
      };
      const updated = await authService.updateProfile(payload);
      const nextPreference = updated?.interfacePreference || profile.interfacePreference;
      setThemePreference(nextPreference);
      setProfile((current) => ({
        ...current,
        fullName: updated?.fullName || current.fullName,
        phoneNumber: updated?.phoneNumber || current.phoneNumber,
        interfacePreference: nextPreference,
        notificationPreferences: updated?.notificationPreferences || current.notificationPreferences,
        currentPassword: "",
        newPassword: "",
      }));
      setMessage("User settings saved successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save user settings.");
    }
  };

  const saveCrm = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const payload = {
        pipelineStages: parseTextList(form.pipelineStagesText),
        leadScoring: parseTextList(form.leadScoringText),
        automatedFollowups: parseTextList(form.automatedFollowupsText),
        leadSourceTags: parseTextList(form.leadSourceTagsText),
      };
      const updated = await workspaceService.update(payload);
      setForm((current) => ({
        ...current,
        pipelineStagesText: formatTextList(updated?.pipelineStages || parseTextList(current.pipelineStagesText)),
        leadScoringText: formatTextList(updated?.leadScoring || parseTextList(current.leadScoringText)),
        automatedFollowupsText: formatTextList(updated?.automatedFollowups || parseTextList(current.automatedFollowupsText)),
        leadSourceTagsText: formatTextList(updated?.leadSourceTags || parseTextList(current.leadSourceTagsText)),
      }));
      setMessage("CRM settings saved successfully.");
    } catch {
      setMessage("Unable to save CRM settings.");
    }
  };

  return (
    <div className={`max-w-4xl ${isDark ? "text-slate-100" : "text-slate-900"}`}>
      <h1 className={`crm-page-title text-xl font-bold ${isDark ? "text-slate-100" : "text-[#172b4d]"}`}>Settings</h1>
      
      {/* Tab Navigation */}
      <div className={`mt-5 flex flex-wrap gap-6 border-b text-sm font-semibold ${isDark ? "border-slate-800 text-slate-200" : "border-slate-200 text-[#172b4d]"}`}>
        <button
          type="button"
          className={activeTab === "company" ? `pb-3 border-b-2 border-[#0e8e86] ${isDark ? "text-slate-100" : "text-slate-900"}` : `pb-3 ${isDark ? "text-slate-400 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
          onClick={() => setActiveTab("company")}
        >
          Company Settings
        </button>
        <button
          type="button"
          className={activeTab === "user" ? `pb-3 border-b-2 border-[#0e8e86] ${isDark ? "text-slate-100" : "text-slate-900"}` : `pb-3 ${isDark ? "text-slate-400 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
          onClick={() => setActiveTab("user")}
        >
          User Settings
        </button>
        <button
          type="button"
          className={activeTab === "crm" ? `pb-3 border-b-2 border-[#0e8e86] ${isDark ? "text-slate-100" : "text-slate-900"}` : `pb-3 ${isDark ? "text-slate-400 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
          onClick={() => setActiveTab("crm")}
        >
          CRM Settings
        </button>
      </div>

      {/* Global Message / Alert */}
      {message && <div className={`crm-alert mt-5 rounded border p-3 text-sm ${isDark ? "border-slate-700 bg-slate-900 text-slate-200" : "border-slate-200 bg-slate-100 text-slate-800"}`}>{message}</div>}

      {loading && <div className="mt-5 text-sm text-slate-500">Loading settings...</div>}

      {/* Company Tab */}
      {!loading && activeTab === "company" && (
        <form onSubmit={saveCompany} className={`crm-card mt-5 overflow-hidden rounded-lg border ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
          <div className={`border-b p-5 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <h2 className={`font-bold ${isDark ? "text-slate-100" : "text-[#172b4d]"}`}>Company Settings</h2>
            <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Update organization name, branding, currency, and timezone preferences.</p>
          </div>
          <div className="grid gap-5 p-5 md:grid-cols-2">
            <Field label="Company Name" isDark={isDark}>
              <input
                required
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className={`crm-input w-full px-3 py-2 text-sm border rounded focus:outline-none ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"}`}
              />
            </Field>
            <Field label="Logo URL" isDark={isDark}>
              <input
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                className={`crm-input w-full px-3 py-2 text-sm border rounded focus:outline-none ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"}`}
              />
            </Field>
            <Field label="Time Zone" isDark={isDark}>
              <input
                value={form.timeZone}
                onChange={(e) => setForm({ ...form, timeZone: e.target.value })}
                className={`crm-input w-full px-3 py-2 text-sm border rounded focus:outline-none ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"}`}
              />
            </Field>
            <Field label="Currency" isDark={isDark}>
              <input
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className={`crm-input w-full px-3 py-2 text-sm border rounded focus:outline-none ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"}`}
              />
            </Field>
          </div>
          <div className={`flex justify-end border-t px-5 py-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <button type="submit" className="crm-primary px-4 py-2 text-xs font-bold rounded bg-[#0e8e86] text-white">
              Save Company Settings
            </button>
          </div>
        </form>
      )}

      {/* User Tab */}
      {!loading && activeTab === "user" && (
        <form onSubmit={saveUser} className={`crm-card mt-5 rounded-lg border p-5 ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
          <div>
            <h2 className={`font-bold ${isDark ? "text-slate-100" : "text-[#172b4d]"}`}>User Settings</h2>
            <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Manage your profile, password, theme, and notification preferences.</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Full Name" isDark={isDark}>
              <input
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className={`crm-input w-full px-3 py-2 text-sm border rounded focus:outline-none ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"}`}
              />
            </Field>
            <Field label="Phone Number" isDark={isDark}>
              <input
                value={profile.phoneNumber}
                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                className={`crm-input w-full px-3 py-2 text-sm border rounded focus:outline-none ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"}`}
              />
            </Field>
            <Field label="Current Password" isDark={isDark}>
              <input
                type="password"
                value={profile.currentPassword}
                onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                className={`crm-input w-full px-3 py-2 text-sm border rounded focus:outline-none ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"}`}
              />
            </Field>
            <Field label="New Password" isDark={isDark}>
              <input
                type="password"
                minLength={8}
                value={profile.newPassword}
                onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                className={`crm-input w-full px-3 py-2 text-sm border rounded focus:outline-none ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"}`}
              />
            </Field>
            <Field label="Theme Preference" isDark={isDark}>
              <select
                value={profile.interfacePreference}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setProfile({ ...profile, interfacePreference: nextValue });
                  setThemePreference(nextValue);
                }}
                className={`crm-input w-full rounded border px-3 py-2 text-sm focus:outline-none ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"}`}
              >
                <option value="Light">Light</option>
                <option value="Dark">Dark</option>
              </select>
            </Field>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Email Alerts" isDark={isDark}>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  checked={profile.notificationPreferences.emailAlerts}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      notificationPreferences: {
                        ...profile.notificationPreferences,
                        emailAlerts: e.target.checked,
                      },
                    })
                  }
                />
                <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Receive activity and reminder emails.</span>
              </div>
            </Field>
            <Field label="Desktop Push" isDark={isDark}>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  checked={profile.notificationPreferences.desktopPush}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      notificationPreferences: {
                        ...profile.notificationPreferences,
                        desktopPush: e.target.checked,
                      },
                    })
                  }
                />
                <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Enable desktop notifications.</span>
              </div>
            </Field>
            <Field label="Weekly Summary" isDark={isDark}>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  checked={profile.notificationPreferences.weeklySummary}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      notificationPreferences: {
                        ...profile.notificationPreferences,
                        weeklySummary: e.target.checked,
                      },
                    })
                  }
                />
                <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Send a weekly summary email.</span>
              </div>
            </Field>
            <Field label="Mobile SMS" isDark={isDark}>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  checked={profile.notificationPreferences.mobileSMS}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      notificationPreferences: {
                        ...profile.notificationPreferences,
                        mobileSMS: e.target.checked,
                      },
                    })
                  }
                />
                <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Receive SMS alerts.</span>
              </div>
            </Field>
          </div>

          <div className={`mt-6 flex justify-end border-t px-5 py-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <button type="submit" className="crm-primary px-4 py-2 text-xs font-bold rounded bg-[#0e8e86] text-white">
              Save User Settings
            </button>
          </div>
        </form>
      )}

      {/* CRM Tab */}
      {!loading && activeTab === "crm" && (
        <form onSubmit={saveCrm} className={`crm-card mt-5 overflow-hidden border rounded-lg ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
          <div className={`border-b p-5 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <h2 className={`font-bold ${isDark ? "text-slate-100" : "text-[#172b4d]"}`}>CRM Settings</h2>
            <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Configure pipeline stages, scoring rules, follow-ups, and lead source tags.</p>
          </div>
          <div className="grid gap-5 p-5 md:grid-cols-2">
            <Field label="Pipeline Stages" isDark={isDark}>
              <textarea
                value={form.pipelineStagesText}
                onChange={(e) => setForm({ ...form, pipelineStagesText: e.target.value })}
                rows={4}
                className={`crm-input w-full px-3 py-2 text-sm border rounded focus:outline-none ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"}`}
              />
            </Field>
            <Field label="Lead Scoring Rules" isDark={isDark}>
              <textarea
                value={form.leadScoringText}
                onChange={(e) => setForm({ ...form, leadScoringText: e.target.value })}
                rows={4}
                className={`crm-input w-full px-3 py-2 text-sm border rounded focus:outline-none ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"}`}
              />
            </Field>
            <Field label="Automated Follow-ups" isDark={isDark}>
              <textarea
                value={form.automatedFollowupsText}
                onChange={(e) => setForm({ ...form, automatedFollowupsText: e.target.value })}
                rows={4}
                className={`crm-input w-full px-3 py-2 text-sm border rounded focus:outline-none ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"}`}
              />
            </Field>
            <Field label="Lead Source Tags" isDark={isDark}>
              <textarea
                value={form.leadSourceTagsText}
                onChange={(e) => setForm({ ...form, leadSourceTagsText: e.target.value })}
                rows={4}
                className={`crm-input w-full px-3 py-2 text-sm border rounded focus:outline-none ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"}`}
              />
            </Field>
          </div>
          <div className={`flex justify-end border-t px-5 py-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <button type="submit" className="crm-primary px-4 py-2 text-xs font-bold rounded bg-[#0e8e86] text-white">
              Save CRM Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({ label, children, isDark }) {
  return (
    <label className={`block text-xs font-semibold ${isDark ? "text-slate-200" : "text-[#172b4d]"}`}>
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}