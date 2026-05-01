import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SearchPage from "./pages/SearchPage";
import ResultsPage from "./pages/ResultsPage";
import LenderPage from "./pages/LenderPage";
import ReportPage from "./pages/ReportPage";
import OnboardingPage from "./pages/OnboardingPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import LenderDetailsPage from "./pages/LenderDetailsPage";
import DashboardPage from "./pages/DashboardPage";
import LenderProtectedRoute from "./components/LenderProtectedRoute";
import ProtectedRoute from "./components/ProtectedRoute";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_cHJvYmFibGUtYXBhY2hlLTkzLmNsZXJrLmFjY291bnRzLmRldiQ";

export default function App() {
  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        elements: {
          headerSubtitle: "text-surface-500 text-sm",
          headerTitle: "font-display text-2xl font-bold text-surface-900",
          card: "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-0 rounded-3xl p-2",
          formButtonPrimary: "bg-brand-600 hover:bg-brand-700 shadow-sm rounded-xl py-3 transition-colors text-white font-medium",
          formFieldInput: "rounded-xl border-surface-200 focus:ring-brand-500/20 focus:border-brand-500 transition-all px-4 py-3 bg-surface-50",
          footerActionLink: "text-brand-600 hover:text-brand-700 font-medium",
          identityPreviewText: "text-surface-700",
          formFieldLabel: "text-surface-700 font-medium",
          socialButtonsBlockButton: "border-surface-200 hover:bg-surface-50 transition-colors rounded-xl py-3",
          socialButtonsBlockButtonText: "font-medium text-surface-700",
          dividerLine: "bg-surface-200",
          dividerText: "text-surface-400"
        },
        layout: {
          helpPageUrl: "https://curify.ai/help",
          privacyPageUrl: "https://curify.ai/privacy",
          termsPageUrl: "https://curify.ai/terms",
        },
      }}
      localization={{
        signUp: {
          start: {
            subtitle: "to continue to CURIFY AI Navigator"
          }
        },
        signIn: {
          start: {
            subtitle: "to continue to CURIFY AI Navigator"
          }
        }
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-surface-950">
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login/*" element={<LoginPage />} />
              <Route path="/register/*" element={<RegisterPage />} />
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
              <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfilePage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
              <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
              <Route path="/lender-dashboard" element={
                <LenderProtectedRoute>
                  <LenderPage />
                </LenderProtectedRoute>
              } />
              <Route path="/lender-details" element={<ProtectedRoute><LenderDetailsPage /></ProtectedRoute>} />
              <Route path="/report" element={
                <LenderProtectedRoute>
                  <ReportPage />
                </LenderProtectedRoute>
              } />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ClerkProvider>
  );
}
