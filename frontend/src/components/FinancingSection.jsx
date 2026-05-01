import { useState } from "react";
import { HandCoins, CreditCard, ChevronRight, Info, Star, ShieldCheck, Zap, ArrowUpDown, Clock, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatNumber } from "../lib/api";

export default function FinancingSection({ data }) {
  const [sortBy, setSortBy] = useState("emi");
  const [showTotal, setShowTotal] = useState(false);

  if (!data || !data.show_financing) return null;

  const sortedOptions = [...data.financing_options].sort((a, b) => {
    if (sortBy === "emi") return a.emi - b.emi;
    if (sortBy === "interest") return a.interest_rate - b.interest_rate;
    if (sortBy === "tenure") return b.tenure - a.tenure;
    return 0;
  });

  return (
    <div className="mb-10 animate-slide-up" style={{ animationDelay: "100ms" }}>
      {/* Dynamic Budget Alert */}
      <div className="glass-card p-6 mb-6 border-brand-500/30 bg-brand-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <HandCoins className="w-20 h-20 text-brand-400" />
        </div>
        <div className="flex items-start gap-5">
          <div className="p-3 bg-brand-500/20 rounded-2xl">
            <Zap className="w-6 h-6 text-brand-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-display font-bold text-white mb-1.5">Intelligent Financing Available</h3>
            <p className="text-surface-300 text-sm leading-relaxed">
              {data.message}
            </p>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> High approval rate
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> No collateral required
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 px-1">
        <div>
          <span className="text-[10px] text-surface-500 uppercase font-bold tracking-widest block mb-1">Recommended for you</span>
          <h4 className="text-lg font-display font-bold text-white">Compare Loan Options</h4>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sorting Dropdown */}
          <div className="relative">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-800 border border-surface-700 text-surface-300 text-[11px] font-bold rounded-lg px-3 py-1.5 appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
            >
              <option value="emi">Sort by EMI</option>
              <option value="interest">Sort by Interest</option>
              <option value="tenure">Sort by Tenure</option>
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-surface-500 pointer-events-none" />
          </div>

          {/* Total Toggle */}
          <button 
            onClick={() => setShowTotal(!showTotal)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
              showTotal 
              ? "bg-brand-500/20 border-brand-500 text-brand-300" 
              : "bg-surface-800 border-surface-700 text-surface-400 hover:text-surface-200"
            }`}
          >
            {showTotal ? "Hide Total" : "Show Total"}
          </button>
        </div>
      </div>
      
      {/* Lender Cards */}
      <div className="grid grid-cols-1 gap-4">
        {sortedOptions.map((opt) => (
          <div 
            key={opt.id} 
            className={`glass-card-hover p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all group border-l-4 ${
              opt.is_recommended ? "border-l-emerald-500 bg-emerald-500/5" : "border-l-transparent"
            }`}
          >
            <div className="flex items-start gap-5 flex-1">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                opt.is_recommended ? "bg-emerald-500 text-white" : "bg-surface-800 text-brand-400 group-hover:bg-brand-500 group-hover:text-white"
              }`}>
                <CreditCard className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-base font-bold text-white">{opt.lender_name}</h4>
                  {opt.is_recommended && (
                    <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" /> Best for you
                    </span>
                  )}
                  {opt.tag && !opt.is_recommended && (
                    <span className="bg-brand-500/20 text-brand-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      {opt.tag}
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-surface-400 mb-3 line-clamp-1">{opt.reason}</p>
                
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] text-surface-500">
                  <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-brand-400/70" /> {opt.approval_time} Approval</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" /> {opt.interest_rate}% Interest</div>
                  <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-violet-400/70" /> {opt.tenure} Months Tenure</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-surface-800">
              <div className="text-right">
                <div className="text-[10px] text-surface-500 uppercase font-bold tracking-widest mb-0.5">Monthly EMI</div>
                <div className="text-2xl font-display font-black text-white">₹{formatNumber(opt.emi)}</div>
                {showTotal && (
                  <div className="text-[10px] text-surface-500 mt-1">
                    Total: ₹{formatNumber(opt.total_repayment)}
                  </div>
                )}
              </div>
              <button className="btn-primary py-2 px-6 text-xs font-bold flex items-center gap-1.5">
                Apply Now <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 px-2 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-surface-600 mt-0.5 shrink-0" />
        <p className="text-[10px] text-surface-600 leading-relaxed">
          *Indicative EMI calculated for the ₹{formatNumber(data.budget_gap)} shortfall. Final terms are subject to lender credit policies and your financial profile.
        </p>
      </div>
    </div>
  );
}

// Helper to avoid missing import in this file
function Calendar({ className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  );
}
