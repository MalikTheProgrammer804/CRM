function getStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0-4
}

const LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];
const COLORS = ["bg-slate-200", "bg-red-400", "bg-amber-400", "bg-teal-500", "bg-teal-600"];

export default function PasswordStrength({ password }) {
  const strength = getStrength(password);

  return (
    <div className="mb-5 -mt-3">
      <div className="flex gap-1.5 mb-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < strength ? COLORS[strength] : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Security level: use 8+ characters
        {password ? ` — ${LABELS[strength]}` : ""}
      </p>
    </div>
  );
}