import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { MapPin, Activity, ArrowRight, Brain } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CITIES } from "../lib/constants";

export default function OnboardingPage() {
  const { hasProfile, profileLoading, patientProfile } = useAuth();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && !profileLoading && user) {
      // 1. If they have a full profile, send them to their dashboard
      if (hasProfile) {
        if (patientProfile?.role === "lender") {
          navigate("/lender-dashboard", { replace: true });
        } else {
          navigate("/search", { replace: true });
        }
        return;
      }

      // 2. If they at least have metadata, skip onboarding and go to profile completion
      const existingCity = user.unsafeMetadata?.city;
      const existingRole = user.unsafeMetadata?.role;
      if (existingCity && existingRole) {
        navigate(existingRole === "lender" ? "/lender-details" : "/complete-profile", { replace: true });
      }
    } else if (isLoaded && !user) {
      navigate("/login", { replace: true });
    }
  }, [isLoaded, profileLoading, user, hasProfile, patientProfile, navigate]);

  if (!isLoaded || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          <Brain className="w-6 h-6 text-brand-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="mt-6 text-surface-400 font-medium animate-pulse">Resuming your session...</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!city) return;
    setLoading(true);
    try {
      await user.update({
        unsafeMetadata: { city, role }
      });
      navigate(role === "lender" ? "/lender-dashboard" : "/search", { replace: true });
    } catch (err) {
      console.error("Failed to update user", err);
    }
    setLoading(false);
  };

  if (!isLoaded || !user) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-72 h-72 rounded-full bg-brand-600/10 blur-3xl" />
      </div>

      <div className="glass-card p-8 sm:p-10 w-full max-w-md relative animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Complete Your Profile</h1>
          <p className="text-surface-400 text-sm mt-1">Just a few details before we start</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm text-surface-300 mb-1.5 block">City of Residence</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <select value={city} onChange={(e) => setCity(e.target.value)}
                className="input-field pl-10 appearance-none cursor-pointer" required>
                <option value="" disabled>Select your city</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-surface-300 mb-2 block">I am a…</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: "patient", icon: "🏥", label: "Patient" },
                { val: "lender", icon: "🏦", label: "Lender / Insurer" },
              ].map((opt) => (
                <button key={opt.val} type="button" onClick={() => setRole(opt.val)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all text-center
                    ${role === opt.val
                      ? "bg-brand-500/15 border-brand-500/40 text-brand-300"
                      : "bg-surface-800/50 border-surface-600/30 text-surface-400 hover:border-surface-500"
                    }`}>
                  <div className="text-2xl mb-1">{opt.icon}</div>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading || !city}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Continue <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
