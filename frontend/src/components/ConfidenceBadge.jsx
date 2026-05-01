import { Shield, TrendingUp, Gauge } from "lucide-react";
import { getConfidenceColor, getConfidenceLabel } from "../lib/api";

export default function ConfidenceBadge({ score, size = "md" }) {
  const color = getConfidenceColor(score);
  const label = getConfidenceLabel(score);
  const pct = Math.round(score * 100);

  const colorClasses = {
    green: "from-emerald-500 to-emerald-600 text-emerald-100 shadow-emerald-500/20",
    yellow: "from-amber-500 to-amber-600 text-amber-100 shadow-amber-500/20",
    red: "from-rose-500 to-rose-600 text-rose-100 shadow-rose-500/20",
  };

  const ringColors = {
    green: "stroke-emerald-400",
    yellow: "stroke-amber-400",
    red: "stroke-rose-400",
  };

  if (size === "lg") {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score * circumference);

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-28 h-28">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor"
              className="text-surface-700" strokeWidth="6" />
            <circle cx="50" cy="50" r={radius} fill="none"
              className={ringColors[color]} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease-out" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{pct}%</span>
          </div>
        </div>
        <span className="text-sm font-medium text-surface-300">{label}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${colorClasses[color]} text-xs font-semibold shadow-md`}>
      <Gauge className="w-3.5 h-3.5" />
      {pct}% — {label}
    </div>
  );
}
