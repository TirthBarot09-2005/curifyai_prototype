import { Link } from "react-router-dom";
import { Activity, Search, Shield, TrendingUp, Zap, ChevronRight, Heart, Building2, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="absolute top-40 -left-40 w-80 h-80 rounded-full bg-violet-600/15 blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-72 h-72 rounded-full bg-emerald-600/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium mb-8 animate-fade-in">
              <Zap className="w-4 h-4" /> AI-Powered Healthcare Intelligence
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 animate-slide-up">
              Navigate Healthcare
              <span className="block bg-gradient-to-r from-brand-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                With Confidence
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-surface-300 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "100ms" }}>
              Discover the right hospitals, understand true costs, and make informed financial decisions — all powered by intelligent data analysis.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
              {user ? (
                <Link to={user.role === "lender" ? "/lender-dashboard" : "/search"} className="btn-primary text-base px-8 py-4 flex items-center gap-2">
                  Go to Dashboard <ChevronRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-base px-8 py-4 flex items-center gap-2">
                    Get Started <ChevronRight className="w-5 h-5" />
                  </Link>
                  <Link to="/login" className="btn-secondary text-base px-8 py-4">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            </div>
          </div>
      </section>

      {/* Stats bar */}
      <section className="relative border-y border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Building2, value: "20+", label: "Partner Hospitals" },
              { icon: Users, value: "10K+", label: "Patients Served" },
              { icon: Heart, value: "95%", label: "Satisfaction Rate" },
              { icon: Shield, value: "₹500Cr+", label: "Underwritten" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <s.icon className="w-6 h-6 text-brand-400 mx-auto mb-2" />
                <div className="text-3xl font-display font-bold text-white">{s.value}</div>
                <div className="text-sm text-surface-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="section-title text-center mb-3">Two Powerful Workflows</h2>
        <p className="text-center text-surface-400 mb-14 max-w-xl mx-auto">
          Whether you're a patient seeking care or a lender assessing risk — CURIFY AI has you covered.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Patient Card */}
          <div className="glass-card-hover p-8 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Search className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-3">For Patients</h3>
            <p className="text-surface-400 leading-relaxed mb-6">
              Describe your symptoms in natural language. Get ranked hospital recommendations with transparent cost breakdowns and confidence scores.
            </p>
            <ul className="space-y-2 text-sm text-surface-300">
              {["Natural language symptom search", "Top 10 ranked hospitals", "Detailed cost transparency", "Accreditation & quality filters"].map((f, i) => (
                <li key={i} className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-emerald-400" />{f}</li>
              ))}
            </ul>
          </div>

          {/* Lender Card */}
          <div className="glass-card-hover p-8 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 border border-brand-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7 text-brand-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-3">For Lenders & Insurers</h3>
            <p className="text-surface-400 leading-relaxed mb-6">
              Get risk-adjusted underwriting reports with cost projections, ICU likelihood, comorbidity analysis, and loan recommendations.
            </p>
            <ul className="space-y-2 text-sm text-surface-300">
              {["Risk-adjusted cost estimation", "Comorbidity & ICU analysis", "Recommended loan ranges", "Workflow routing intelligence"].map((f, i) => (
                <li key={i} className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-brand-400" />{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-surface-500">
            © 2026 CURIFY AI Navigator — Decision Support, Not Diagnosis.
          </p>
        </div>
      </footer>
    </div>
  );
}
