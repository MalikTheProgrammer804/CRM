import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import authService from "../../services/authService";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  const email = useMemo(() => {
    return (
      location.state?.email || searchParams.get("email") || "your email"
    );
  }, [location.state, searchParams]);

  useEffect(() => {
    const token = searchParams.get("token") || localStorage.getItem("token");

    if (!token) {
      setStatus("idle");
      setMessage("Your account is ready. Continue to your dashboard to get started.");
      return;
    }

    let active = true;

    authService
      .verifyEmail(token)
      .then(() => {
        if (!active) return;
        setStatus("verified");
        setMessage(
          "Email verified successfully. You can continue to your CRM workspace."
        );
      })
      .catch((err) => {
        if (!active) return;
        setStatus("error");
        setMessage(
          err?.response?.data?.message || "We could not verify your email right now."
        );
      });

    return () => {
      active = false;
    };
  }, [searchParams]);

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d95d08] text-white shadow-md">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 7h16" />
              <path d="M4 7l8 6 8-6" />
              <rect x="4" y="5" width="16" height="14" rx="2" />
            </svg>
          </div>
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">Verify your email</h1>
        <p className="mb-6 text-center text-xs text-slate-500">
          {status === "loading" && `Checking verification for ${email}...`}
          {status === "verified" && "Thanks! Your account is ready to use."}
          {status === "idle" && "We’ve prepared your account for the next step."}
          {status === "error" && "We hit a snag while verifying your email."}
        </p>

        <div className="rounded-lg border border-slate-200/80 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          {message}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => navigate("/dashboard", { replace: true })}
            className="w-full rounded-lg bg-[#d95d08] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#c45305] active:bg-[#ad4904]"
          >
            Continue to dashboard
          </button>
          <Link
            to="/login"
            className="text-center text-xs font-semibold text-[#d95d08] hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}