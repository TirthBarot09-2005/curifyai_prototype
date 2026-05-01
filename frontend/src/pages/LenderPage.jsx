import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, MapPin, User, X, FileCheck } from "lucide-react";
import { CITIES, COMORBIDITY_OPTIONS } from "../lib/constants";
import DisclaimerBanner from "../components/DisclaimerBanner";
import CustomSelect from "../components/CustomSelect";

const PROCEDURES = [
  "Angioplasty", "CABG (Coronary Artery Bypass)", "Knee Replacement", "Hip Replacement",
  "Spinal Surgery", "Cataract Surgery", "Appendectomy", "Hernia Repair",
  "Cholecystectomy", "Caesarean Section", "Tumor Excision", "Dialysis Setup",
  "Cardiac Evaluation", "Neurological Evaluation", "General Consultation",
];

export default function LenderPage() {
  const [form, setForm] = useState({
    procedure: "", location: "", age: 45, loan_amount: 500000, comorbidities: [],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const toggleComorb = (c) => {
    setForm(prev => ({
      ...prev,
      comorbidities: prev.comorbidities.includes(c)
        ? prev.comorbidities.filter(x => x !== c)
        : [...prev.comorbidities, c],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.procedure || !form.location) {
      alert("Please select both procedure and location");
      return;
    }
    const params = new URLSearchParams({
      procedure: form.procedure,
      location: form.location,
      age: form.age.toString(),
      loan_amount: form.loan_amount.toString(),
      comorbidities: form.comorbidities.join(","),
    });
    navigate(`/report?${params.toString()}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/3 w-72 h-72 rounded-full bg-brand-600/10 blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-10 sm:py-14">
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8 text-brand-400" />
            Pre-Underwriting Assessment
          </h1>
          <p className="text-surface-400">Generate risk-adjusted cost projections for healthcare lending</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
          {/* Procedure */}
          <CustomSelect
            label="Procedure *"
            value={form.procedure}
            onChange={(val) => update("procedure", val)}
            options={PROCEDURES}
            placeholder="Select Procedure"
          />

          {/* Location & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomSelect
              label="Location *"
              value={form.location}
              onChange={(val) => update("location", val)}
              options={CITIES}
              placeholder="Select City"
              icon={MapPin}
            />
            <div>
              <label className="text-sm text-surface-300 mb-1.5 block font-medium">Patient Age *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input type="number" value={form.age} onChange={(e) => update("age", parseInt(e.target.value) || 0)}
                  className="input-field pl-10" min={1} max={120} required />
              </div>
            </div>
          </div>

          {/* Loan amount */}
          <div>
            <label className="text-sm text-surface-300 mb-1.5 flex justify-between font-medium">
              <span>Requested Loan Amount</span>
              <span className="text-brand-400">₹{(form.loan_amount / 100000).toFixed(1)} Lakh</span>
            </label>
            <input type="range" value={form.loan_amount} onChange={(e) => update("loan_amount", parseInt(e.target.value))}
              min={50000} max={5000000} step={50000}
              className="w-full h-2 bg-surface-700 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-500
                [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-300" />
            <div className="flex justify-between text-xs text-surface-500 mt-1"><span>₹50K</span><span>₹50L</span></div>
          </div>

          {/* Comorbidities */}
          <div>
            <label className="text-sm text-surface-300 mb-2 block font-medium">Known Comorbidities</label>
            <div className="flex flex-wrap gap-2">
              {COMORBIDITY_OPTIONS.map(c => (
                <button key={c} type="button" onClick={() => toggleComorb(c)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all
                    ${form.comorbidities.includes(c)
                      ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                      : "bg-surface-800/50 border-surface-600/30 text-surface-400 hover:border-surface-500"
                    }`}>
                  {form.comorbidities.includes(c) && <X className="w-3 h-3 inline mr-1" />}
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2">
            <FileCheck className="w-5 h-5" /> Generate Underwriting Report
          </button>
        </form>
      </div>
    </div>
  );
}
