import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function LenderProtectedRoute({ children }) {
  const { user, isLoaded, profileLoading, patientProfile } = useAuth();

  if (!isLoaded || profileLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "lender") {
    // Redirect patients to their appropriate dashboard/home
    return <Navigate to="/dashboard" replace />;
  }

  // If no profile yet, or lender profile is incomplete, send to setup
  if (!patientProfile || !patientProfile.lenderProfileCompleted) {
    return <Navigate to="/lender-details" replace />;
  }

  return children ? children : <Outlet />;
}
