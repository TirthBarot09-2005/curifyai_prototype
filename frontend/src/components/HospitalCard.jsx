import { useState } from "react";
import { MapPin, Star, Building2, ChevronDown, ChevronUp, Shield, Bed, Calendar, Sparkles } from "lucide-react";

import { formatCurrency, formatNumber } from "../lib/api";

export default function HospitalCard({ hospital, rank }) {
  const [expanded, setExpanded] = useState(false);
  const h = hospital;
  const cost = h.cost_breakdown;

  const scoreColor = h.composite_score >= 0.7 ? "text-emerald-400" : h.composite_score >= 0.5 ? "text-amber-400" : "text-rose-400";

  return (
    <div className="glass-card-hover p-5 sm:p-6 animate-slide-up" style={{ animationDelay: `${rank * 60}ms` }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">#{rank + 1}</span>
            <h3 className="text-lg font-display font-bold text-white">{h.name}</h3>
          </div>
          <div className="flex items-center gap-3 text-sm text-surface-400">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {h.city}, {h.state}</span>
            <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {h.tier}</span>
          </div>
          {h.phone && h.phone !== "N/A" && (
            <div className="mt-2 text-sm">
              <a href={`tel:${h.phone}`} className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                {h.phone}
              </a>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className={`text-2xl font-bold ${scoreColor}`}>{(h.composite_score * 100).toFixed(0)}</div>
            <div className="text-[10px] uppercase tracking-wider text-surface-500">Score</div>
          </div>
        </div>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-2 mb-4">
        {h.accreditation && h.accreditation.split(",").map((a, i) => (
          <span key={i} className="badge-blue flex items-center gap-1">
            <Shield className="w-3 h-3" />{a.trim()}
          </span>
        ))}
        <span className="badge-green flex items-center gap-1"><Bed className="w-3 h-3" />{h.beds} Beds</span>
        <span className="badge flex items-center gap-1 bg-surface-700/50 text-surface-300 border border-surface-600/30">
          <Calendar className="w-3 h-3" />Est. {h.established_year}
        </span>
      </div>

      {/* Cost summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-surface-800/60 rounded-xl p-3 text-center">
          <div className="text-xs text-surface-400 mb-1">Est. Min</div>
          <div className="text-lg font-bold text-emerald-400">{formatCurrency(cost.total_min)}</div>
        </div>
        <div className="bg-surface-800/60 rounded-xl p-3 text-center">
          <div className="text-xs text-surface-400 mb-1">Est. Max</div>
          <div className="text-lg font-bold text-amber-400">{formatCurrency(cost.total_max)}</div>
        </div>
        <div className="bg-surface-800/60 rounded-xl p-3 text-center hidden sm:block">
          <div className="text-xs text-surface-400 mb-1">Distance</div>
          <div className="text-lg font-bold text-brand-300">{h.proximity_km} km</div>
        </div>
      </div>

      {/* AI Reasoning Section */}
      <div className="mt-4 p-3 bg-brand-500/5 rounded-xl border border-brand-500/10 animate-fade-in">
        <div className="flex items-center gap-2 mb-2 text-brand-400">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Why this hospital?</span>
        </div>
        <ul className="space-y-1.5">
          {[
            `Best match for ${h.specialties[0] || 'your procedure'} in ${h.city}`,
            h.cost_breakdown.total_max <= 2000000 ? "Falls within your selected budget range" : "High quality care at a premium value",
            `Optimized for patient demographic requirements`,
            h.accreditation.includes("NABH") ? "NABH/JCI accredited facility" : "High reported clinical success rate"
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-surface-300">
              <div className="mt-1.5 w-1 h-1 rounded-full bg-brand-500/50" />
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* Expand toggle */}
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors py-2 mt-2">
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {expanded ? "Hide" : "View"} Cost Breakdown
      </button>

      {/* Expanded cost breakdown */}
      {expanded && (
        <div className="mt-3 pt-4 border-t border-surface-700/50 animate-fade-in">
          <div className="space-y-2.5">
            {[
              { label: "Surgery", value: cost.surgery, color: "bg-brand-500" },
              { label: "Doctor Fees", value: cost.doctor, color: "bg-violet-500" },
              { label: "Room & Stay", value: cost.room, color: "bg-cyan-500" },
              { label: "Diagnostics", value: cost.diagnostics, color: "bg-emerald-500" },
              { label: "Medicines", value: cost.medicines, color: "bg-amber-500" },
              { label: "Contingency", value: cost.contingency, color: "bg-rose-500" },
            ].map((item) => {
              const maxVal = cost.surgery || 1;
              const pct = Math.min(100, (item.value / maxVal) * 100);
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-surface-400 w-24 flex-shrink-0">{item.label}</span>
                  <div className="flex-1 h-2 bg-surface-700 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-medium text-surface-200 w-16 text-right">₹{formatNumber(item.value)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-surface-700/30 flex justify-between text-sm">
            <span className="text-surface-400">Total Range</span>
            <span className="font-bold text-white">₹{formatNumber(cost.total_min)} – ₹{formatNumber(cost.total_max)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
