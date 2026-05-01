import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiPost, formatNumber, formatCurrency } from "../lib/api";
import ConfidenceBadge from "../components/ConfidenceBadge";
import DisclaimerBanner from "../components/DisclaimerBanner";
import SkeletonCard from "../components/SkeletonCard";
import { ArrowLeft, AlertTriangle, Shield, Activity, TrendingUp, Download, FileText, ChevronRight } from "lucide-react";
import AIExplanationPanel from "../components/AIExplanationPanel";


export default function ReportPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const comorbStr = searchParams.get("comorbidities") || "";
        const res = await apiPost("/underwrite", {
          procedure: searchParams.get("procedure") || "",
          location: searchParams.get("location") || "",
          age: parseInt(searchParams.get("age") || "30"),
          comorbidities: comorbStr ? comorbStr.split(",").filter(Boolean) : [],
          loan_amount: parseFloat(searchParams.get("loan_amount") || "0"),
        });
        setData(res);
      } catch (err) {
        setError("Failed to generate report. Is the backend running?");
      }
      setLoading(false);
    };
    fetchReport();
  }, [searchParams]);

  const inputs = {
    procedure: searchParams.get("procedure") || "",
    location: searchParams.get("location") || "this region",
    age: parseInt(searchParams.get("age") || "30"),
    comorbidities: (searchParams.get("comorbidities") || "").split(",").filter(Boolean),
  };


  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
      <div className="skeleton h-24 w-full" />
      <div className="grid md:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-32" />)}
      </div>
      <SkeletonCard />
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <p className="text-rose-400 text-lg">{error}</p>
      <button onClick={() => navigate("/lender-dashboard")} className="btn-secondary mt-4">Back to Form</button>
    </div>
  );

  const cost = data.cost_breakdown;
  const severityColors = { low: "badge-green", medium: "badge-yellow", high: "badge-red" };

  const decisionColors = {
    APPROVE: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    APPROVE_WITH_CONDITIONS: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    REJECT: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate("/lender-dashboard")} className="flex items-center gap-1.5 text-surface-400 hover:text-white transition-colors text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Form
      </button>

      {/* Header cards row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-slide-up">
        {/* Underwriting Decision */}
        <div className={`glass-card p-5 text-center border-2 ${decisionColors[data.decision] || "border-surface-700"}`}>
          <p className="text-[10px] uppercase tracking-widest mb-2 opacity-70">Decision</p>
          <p className="text-xl font-display font-black truncate">
            {data.decision.replace(/_/g, ' ')}
          </p>
          <div className="mt-2 flex items-center justify-center gap-1.5">
             <div className={`w-2 h-2 rounded-full animate-pulse ${data.decision === 'REJECT' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
             <span className="text-[10px] font-bold">Risk: {data.risk_score}/100</span>
          </div>
        </div>

        {/* Approved Loan */}
        <div className="glass-card p-5 text-center border-2 border-brand-500/30">
          <p className="text-[10px] text-brand-400 uppercase tracking-widest mb-2 font-bold">Approved Loan</p>
          <p className="text-2xl font-display font-black text-white">
            ₹{formatNumber(data.approved_loan)}
          </p>
          <p className="text-[10px] text-surface-500 mt-1">Requested: ₹{formatNumber(data.requested_loan)}</p>
        </div>

        {/* EMI estimate */}
        <div className="glass-card p-5 text-center border-2 border-violet-500/20">
          <p className="text-[10px] text-violet-400 uppercase tracking-widest mb-2 font-bold">Est. Monthly EMI</p>
          <p className="text-2xl font-display font-black text-white">
            ₹{formatNumber(data.emi_estimate)}
          </p>
          <p className="text-[10px] text-surface-500 mt-1">{data.recommended_tenure} Months Tenure</p>
        </div>

        {/* Confidence */}
        <div className="glass-card p-5 flex flex-col items-center justify-center border-2 border-surface-700/50">
          <p className="text-[10px] text-surface-500 uppercase tracking-widest mb-2">Confidence</p>
          <div className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
            data.confidence === 'High' ? 'bg-emerald-500/10 text-emerald-400' :
            data.confidence === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {data.confidence} Level
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
        {/* Left Column: Cost and Reasoning */}
        <div className="lg:col-span-2 space-y-6">
          {/* Underwriting Reasoning */}
          <div className="glass-card p-6 border border-brand-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
               <Shield className="w-20 h-20 text-brand-400" />
            </div>
            <h2 className="section-title text-lg mb-5 flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-400" /> Underwriting Rationale
            </h2>
            <div className="bg-brand-500/5 rounded-2xl p-4 border border-brand-500/10 mb-5">
               <p className="text-sm text-brand-100 leading-relaxed font-medium">
                 {data.message}
               </p>
            </div>
            <div className="space-y-3">
               {data.reasoning.map((reason, i) => (
                 <div key={i} className="flex items-start gap-3 text-sm text-surface-300">
                   <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                   <p>{reason}</p>
                 </div>
               ))}
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="glass-card p-6">
            <h2 className="section-title text-lg mb-5 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-400" /> Medical Cost Projection
            </h2>
            <div className="space-y-4">
              {[
                { label: "Surgery / Procedure", min: cost.surgery * 0.85, max: cost.surgery, color: "bg-brand-500" },
                { label: "Doctor Fees", min: cost.doctor * 0.9, max: cost.doctor, color: "bg-violet-500" },
                { label: "Room & Stay", min: cost.room * 0.85, max: cost.room, color: "bg-cyan-500" },
                { label: "Diagnostics", min: cost.diagnostics * 0.85, max: cost.diagnostics, color: "bg-emerald-500" },
                { label: "Medicines", min: cost.medicines * 0.85, max: cost.medicines, color: "bg-amber-500" },
                { label: "Contingency (Buffered)", min: cost.contingency * 0.7, max: cost.contingency, color: "bg-rose-500" },
              ].map((item) => {
                const maxCost = cost.surgery || 1;
                const barMax = (item.max / maxCost) * 100;
                const barMin = (item.min / maxCost) * 100;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-surface-300">{item.label}</span>
                      <span className="text-white font-medium">₹{formatNumber(item.min)} – ₹{formatNumber(item.max)}</span>
                    </div>
                    <div className="relative h-3 bg-surface-700 rounded-full overflow-hidden">
                      <div className={`absolute h-full ${item.color} opacity-30 rounded-full`}
                        style={{ width: `${barMax}%` }} />
                      <div className={`absolute h-full ${item.color} rounded-full transition-all duration-700`}
                        style={{ width: `${barMin}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-5 border-t border-surface-700/50 flex justify-between items-center">
              <div>
                <span className="text-surface-500 text-xs uppercase tracking-widest font-bold">Total Requirement</span>
                <p className="text-2xl font-display font-black text-white">₹{formatNumber(cost.total_max)}</p>
              </div>
              <div className="text-right">
                <span className="text-surface-500 text-xs uppercase tracking-widest font-bold">Buffered Cap</span>
                <p className="text-xl font-display font-bold text-surface-300">₹{formatNumber(data.base_cost * 2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Risk and Extras */}
        <div className="space-y-4">
          {/* Risk flags */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Risk Analysis
            </h3>
            <div className="mb-4">
               <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-surface-400">Aggregated Risk Score</span>
                  <span className={`font-bold ${data.risk_score > 75 ? 'text-rose-400' : 'text-emerald-400'}`}>{data.risk_score}/100</span>
               </div>
               <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${data.risk_score > 75 ? 'bg-rose-500' : data.risk_score > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${data.risk_score}%` }} />
               </div>
            </div>
            {data.risk_flags.length === 0 ? (
              <p className="text-xs text-surface-500 italic">No critical clinical risk flags detected.</p>
            ) : (
              <div className="space-y-3">
                {data.risk_flags.map((f, i) => (
                  <div key={i} className="bg-surface-800/60 rounded-xl p-3 border border-surface-700/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">{f.flag}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                        f.severity === 'high' ? 'bg-rose-500/20 text-rose-400' :
                        f.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>{f.severity}</span>
                    </div>
                    <p className="text-[11px] text-surface-400 leading-relaxed">{f.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ICU & Geo */}
          <div className="glass-card p-5">
            <h3 className="text-[10px] font-black text-surface-500 uppercase tracking-widest mb-3">Health Indices</h3>
            <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-surface-400">ICU Probability</span>
                    <span className="font-bold text-white">{(data.icu_likelihood * 100).toFixed(0)}%</span>
                 </div>
                 <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${data.icu_likelihood * 100}%` }} />
                 </div>
               </div>
               <div className="pt-2 flex justify-between items-center border-t border-surface-700/50">
                  <span className="text-xs text-surface-400">Geo-Location Factor</span>
                  <span className="text-sm font-bold text-brand-400">{data.geo_multiplier}x</span>
               </div>
            </div>
          </div>

          {/* Export buttons */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">Final Actions</h3>
            <div className="space-y-2">
              <button className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3"
                onClick={async () => {
                  try {
                    const comorbStr = searchParams.get("comorbidities") || "";
                    const response = await fetch("/api/underwrite/download", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        procedure: searchParams.get("procedure") || "",
                        location: searchParams.get("location") || "",
                        age: parseInt(searchParams.get("age") || "30"),
                        comorbidities: comorbStr ? comorbStr.split(",").filter(Boolean) : [],
                        loan_amount: parseFloat(searchParams.get("loan_amount") || "0"),
                      })
                    });
                    if (!response.ok) throw new Error("PDF generation failed");
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `underwriting_report_${searchParams.get("procedure") || "case"}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  } catch (err) {
                    alert("Error downloading PDF: " + err.message);
                  }
                }}>
                <Download className="w-4 h-4" /> Download PDF Report
              </button>

              <button className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url;
                  a.download = "underwriting-report.json"; a.click();
                }}>
                <FileText className="w-4 h-4" /> Export Raw JSON
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* AI Explanation Panel */}
      <div className="mt-6">
        <AIExplanationPanel data={data} inputs={inputs} />
      </div>
    </div>
  );
}
