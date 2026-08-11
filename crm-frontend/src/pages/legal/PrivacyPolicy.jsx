import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-10">
        <Link to="/dashboard" className="text-sm text-teal-700 hover:text-teal-800 font-semibold mb-6 inline-block">
          &larr; Back to Dashboard
        </Link>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Information We Collect</h2>
            <p>
              We collect account information you provide during signup (name,
              email, phone, company name), along with lead data you add
              manually or import via Google Maps Lead Discovery.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. How We Use Your Information</h2>
            <p>
              Your information is used to operate your CRM workspace, send
              account-related emails (verification, password resets), and
              improve the Service. We do not sell your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Data Storage &amp; Security</h2>
            <p>
              Passwords are stored using industry-standard hashing (bcrypt)
              and are never stored or transmitted in plain text. Access to
              your workspace data is restricted to your logged-in account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Third-Party Services</h2>
            <p>
              We use Google Maps Platform (Places API) to power Lead
              Discovery. Business data returned by Google is subject to
              Google's own terms and privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">5. Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of your
              account and workspace data at any time by contacting us using
              the details in the footer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">6. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We encourage
              you to review this page for the latest information.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}