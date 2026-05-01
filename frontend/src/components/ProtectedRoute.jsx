import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Brain } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user, isLoaded, profileLoading } = useAuth();
  const location = useLocation();

  if (!isLoaded || (user && profileLoading)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-surface-950 w-full">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          <Brain className="w-6 h-6 text-brand-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    // Save the location the user was trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is already "done" with profile, don't let them go back to onboarding/complete-profile
  // unless they are explicitly editing it.
  const isOnboardingPath = location.pathname === "/onboarding" || location.pathname === "/complete-profile";
  const { hasProfile, patientProfile } = useAuth();
  
  if (isOnboardingPath && hasProfile && !location.search.includes("edit=true")) {
    const target = patientProfile?.role === "lender" ? "/lender-dashboard" : "/search";
    return <Navigate to={target} replace />;
  }

  return children;
}
