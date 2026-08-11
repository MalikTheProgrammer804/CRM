import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import authService from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError("Email is required.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setServerError(
        err?.response?.data?.message ||
          "Couldn't process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-[#d95d08] flex items-center justify-center shadow-md">
            <LockIcon />
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-900 text-center mb-2">
          Forgot password
        </h2>
        <p className="text-slate-500 text-xs text-center mb-6 leading-relaxed">
          Enter your email address and we’ll send a temporary password to log in again.
        </p>

        {serverError && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setServerError("");
              if (error) setError("");
            }}
            error={error}
            autoComplete="email"
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full rounded-lg bg-[#d95d08] py-2.5 text-white text-sm font-medium hover:bg-[#c45305] active:bg-[#ad4904] transition-colors mt-2"
          >
            Send temporary password
          </Button>
        </form>

        <p className="text-center text-xs mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-[#d95d08] font-semibold hover:underline"
          >
            <ArrowLeftIcon /> Back to login
          </Link>
        </p>
      </div>

      {sent && <SuccessModal email={email} onClose={() => setSent(false)} />}
    </AuthLayout>
  );
}

function SuccessModal({ email, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
            <CheckIcon />
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">Check your email</h2>
        <p className="text-slate-500 text-xs mb-6 leading-relaxed">
          A temporary password has been sent to{" "}
          <span className="font-semibold text-slate-800">{email}</span>. Use it to log in and update your password.
        </p>

        <div className="flex flex-col gap-2.5">
          <Link
            to="/login"
            className="w-full rounded-lg py-2.5 text-xs font-medium bg-[#d95d08] text-white hover:bg-[#c45305] active:bg-[#ad4904] transition-colors"
          >
            Back to login
          </Link>
          <button
            onClick={onClose}
            className="w-full rounded-lg py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Use a different email
          </button>
        </div>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#d95d08]">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}