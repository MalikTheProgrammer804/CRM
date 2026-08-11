import { Link } from "react-router-dom";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-10">
        <Link to="/dashboard" className="text-sm text-teal-700 hover:text-teal-800 font-semibold mb-6 inline-block">
          &larr; Back to Dashboard
        </Link>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Wessmaa CRM ("the Service"), you agree to be
              bound by these Terms &amp; Conditions. If you do not agree, please
              do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Use of the Service</h2>
            <p>
              You agree to use the Service only for lawful purposes and in
              accordance with these Terms. You are responsible for maintaining
              the confidentiality of your account credentials and for all
              activity that occurs under your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Lead Data</h2>
            <p>
              Business data imported through Lead Discovery (via Google Maps)
              is provided for your internal sales and marketing use. You are
              responsible for complying with applicable data protection and
              anti-spam laws when contacting leads.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Account Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that
              violate these Terms or engage in abusive, fraudulent, or illegal
              activity.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">5. Limitation of Liability</h2>
            <p>
              The Service is provided "as is" without warranties of any kind.
              Wessmaa CRM is not liable for any indirect, incidental, or
              consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">6. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of
              the Service after changes are posted constitutes acceptance of
              the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">7. Contact</h2>
            <p>
              Questions about these Terms? Reach us at the contact details
              listed in the footer.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}