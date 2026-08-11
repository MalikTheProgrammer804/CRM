import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import PasswordStrength from "../../components/ui/PasswordStrength.jsx";
import authService from "../../services/authService";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: "",
    fullName: "",
    workEmail: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const next = {};
    if (!form.companyName.trim()) next.companyName = "Company name is required.";
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.workEmail.trim()) next.workEmail = "Work email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.workEmail))
      next.workEmail = "Enter a valid email address.";
    if (!form.phoneNumber.trim()) next.phoneNumber = "Phone number is required.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 8)
      next.password = "Password must be at least 8 characters.";
    if (form.confirmPassword !== form.password)
      next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    const payload = {
      companyName: form.companyName.trim(),
      fullName: form.fullName.trim(),
      email: form.workEmail.trim(),
      phoneNumber: form.phoneNumber.trim(),
      password: form.password,
    };

    setLoading(true);
    try {
      const result = await authService.signup(payload);

      if (result?.token) localStorage.setItem("token", result.token);
      if (result?.user) localStorage.setItem("user", JSON.stringify(result.user));

      navigate("/verify-email", {
        state: { email: payload.email },
        replace: true,
      });
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message || err);
      setServerError(
        err?.response?.data?.message ||
          "Couldn't create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-[32px] shadow-[0_30px_60px_rgba(15,23,42,0.08)] border border-slate-200 p-10"
      >
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className="text-xs uppercase tracking-[0.35em] text-orange-600 font-semibold mb-3">
            Create account
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Start your workspace</h1>
          <p className="text-sm text-slate-500">
            Create an account to manage your local leads and team workflow.
          </p>
        </motion.div>

        <AnimatePresence>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 overflow-hidden"
            >
              {serverError}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="companyName"
            name="companyName"
            label="Company Name"
            placeholder="Acme Corp"
            value={form.companyName}
            onChange={handleChange}
            error={errors.companyName}
          />

          <Input
            id="fullName"
            name="fullName"
            label="Full Name"
            placeholder="John Doe"
            value={form.fullName}
            onChange={handleChange}
            error={errors.fullName}
          />

          <Input
            id="workEmail"
            name="workEmail"
            type="email"
            label="Work Email"
            placeholder="john@company.com"
            value={form.workEmail}
            onChange={handleChange}
            error={errors.workEmail}
            autoComplete="email"
          />

          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            value={form.phoneNumber}
            onChange={handleChange}
            error={errors.phoneNumber}
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
          />
          <PasswordStrength password={form.password} />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full rounded-[28px] bg-orange-600 py-3 text-white text-base font-semibold hover:bg-orange-700 active:bg-orange-800"
          >
            Sign up
          </Button>
        </form>

        <div className="mt-4 rounded-3xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          You will receive a verification email after creating your account.
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-600 font-semibold hover:text-orange-700">
            Log in
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}