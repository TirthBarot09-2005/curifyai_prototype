import { useUser } from "@clerk/clerk-react";
import { useAuth } from "../context/AuthContext";
import { Activity, MapPin, Phone, HeartPulse, LogOut, CheckCircle2, ChevronRight, Briefcase, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { patientProfile, profileLoading, logout } = useAuth();
  const navigate = useNavigate();

  if (!isLoaded || profileLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-surface-50">
        <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!patientProfile) {
    const currentRole = patientProfile?.role || user?.role || "";
    if (currentRole === "lender") {
      navigate("/lender-details", { replace: true });
    } else {
      navigate("/complete-profile", { replace: true });
    }
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8 relative">
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-brand-600/5 to-transparent rounded-3xl pointer-events-none" />
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10"
        >
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-brand-600">
                  {(patientProfile.lenderName || patientProfile.fullName || patientProfile.full_name || "U")[0]}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-surface-900">
                Welcome back, {user?.role === "lender" ? (patientProfile.lenderName || "Lender") : (patientProfile.fullName || patientProfile.full_name || "")?.split(' ')[0]}
              </h1>
              <p className="text-surface-500 flex items-center gap-2 mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {user?.role === "lender" ? "Verified Institution" : "Profile verified"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                navigate(user?.role === "lender" ? "/lender-details?edit=true" : "/complete-profile?edit=true");
              }}
              className="px-5 py-2.5 bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-100 rounded-xl font-medium transition-colors shadow-sm"
            >
              Edit Profile
            </button>
            <button 
              onClick={() => logout()}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-surface-700 hover:text-rose-600 hover:bg-rose-50 border border-surface-200 rounded-xl font-medium transition-colors shadow-sm"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Lender Quick Access */}
            {user?.role === "lender" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 rounded-3xl shadow-xl border border-blue-500 relative overflow-hidden group cursor-pointer"
                onClick={() => navigate("/lender-dashboard")}
              >
                <div className="absolute top-0 right-0 p-8 opacity-20 transition-transform group-hover:scale-110 duration-500">
                  <Activity className="w-24 h-24 text-white" />
                </div>
                <div className="relative z-10">
                  <span className="bg-blue-400/30 text-blue-100 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block backdrop-blur-md">
                    Lender Control Panel
                  </span>
                  <h2 className="text-3xl font-display font-black text-white mb-2">Access Underwriting Dashboard</h2>
                  <p className="text-blue-100/80 text-sm max-w-md mb-6 leading-relaxed">
                    Review patient applications, evaluate medical risk scores, and manage your active financing offers in real-time.
                  </p>
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    Open Dashboard <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            )}

            {user?.role === "patient" ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-surface-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-brand-50 rounded-xl">
                    <HeartPulse className="w-6 h-6 text-brand-600" />
                  </div>
                  <h2 className="font-semibold text-xl text-surface-900">Health Overview</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface-50 border border-surface-100 p-5 rounded-2xl transition-all hover:shadow-md">
                    <p className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-2">Blood Group</p>
                    <p className="text-2xl font-bold text-surface-900 flex items-center gap-2">
                      {patientProfile.bloodGroup || patientProfile.blood_group || "Not set"} 
                      {(patientProfile.bloodGroup || patientProfile.blood_group) && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                    </p>
                  </div>
                  <div className="bg-surface-50 border border-surface-100 p-5 rounded-2xl transition-all hover:shadow-md">
                    <p className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-2">Age & Gender</p>
                    <p className="text-xl font-bold text-surface-900">
                      {patientProfile.age || "-"} yrs • <span className="text-surface-600 font-medium">{patientProfile.gender || "-"}</span>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white border border-orange-100/80 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400" />
                    <p className="text-sm text-orange-700 font-semibold mb-1">Existing Conditions</p>
                    <p className="text-surface-700">{patientProfile.conditions || patientProfile.existing_conditions || "None reported"}</p>
                  </div>
                  
                  <div className="bg-white border border-rose-100/80 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-400" />
                    <p className="text-sm text-rose-700 font-semibold mb-1">Allergies</p>
                    <p className="text-surface-700">{patientProfile.allergies || "None reported"}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-surface-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="font-semibold text-xl text-surface-900">Institutional Profile</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface-50 border border-surface-100 p-5 rounded-2xl transition-all hover:shadow-md">
                    <p className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-2">Loan Range</p>
                    <p className="text-xl font-bold text-surface-900 flex items-center gap-1">
                      ₹{(parseInt(patientProfile.minLoan) || 0).toLocaleString()} – ₹{(parseInt(patientProfile.maxLoan) || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-surface-50 border border-surface-100 p-5 rounded-2xl transition-all hover:shadow-md">
                    <p className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-2">Interest Rates</p>
                    <p className="text-xl font-bold text-surface-900">
                      {(patientProfile.minRate || 0)}% – {(patientProfile.maxRate || 0)}%
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white border border-blue-100/80 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400" />
                    <p className="text-sm text-blue-700 font-semibold mb-1">Supported Loan Types</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {patientProfile.supportedLoanTypes?.map(type => (
                        <span key={type} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100">{type}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white border border-indigo-100/80 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400" />
                    <p className="text-sm text-indigo-700 font-semibold mb-1">Target Customer Type</p>
                    <p className="text-surface-700">{patientProfile.customerType || "All profiles"}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white p-7 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-surface-100"
            >
               <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-brand-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-brand-600" />
                </div>
                <h2 className="font-semibold text-lg text-surface-900">{user?.role === "lender" ? "Business Info" : "Location"}</h2>
              </div>
              <div className="space-y-4">
                <div className="pb-4 border-b border-surface-100">
                  <p className="text-sm text-surface-500 font-medium mb-1">Registered Phone</p>
                  <p className="text-surface-900 font-medium text-lg">{patientProfile.phoneNumber || patientProfile.phone_number || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-surface-500 font-medium mb-1">{user?.role === "lender" ? "Approval Speed" : "Area / Pincode"}</p>
                  <p className="text-surface-900 font-medium text-lg">
                    {user?.role === "lender" ? (patientProfile.approvalTime || "Standard") : (patientProfile.pincode || patientProfile.area_pincode || "Not specified")}
                  </p>
                </div>
              </div>
            </motion.div>

            {user?.role === "patient" ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-white p-7 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-surface-100 relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Phone className="w-24 h-24 text-brand-600" />
                 </div>
                 <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-rose-50 rounded-xl">
                      <Activity className="w-5 h-5 text-rose-600" />
                    </div>
                    <h2 className="font-semibold text-lg text-surface-900">Emergency</h2>
                  </div>
                  <div className="space-y-1 mb-4">
                    <p className="text-xl font-bold text-surface-900">{patientProfile.emergencyName || patientProfile.emergency_name}</p>
                    <p className="text-surface-500 font-medium">{patientProfile.emergencyRelation || patientProfile.emergency_relation}</p>
                  </div>
                  <div className="bg-surface-50 border border-surface-200 px-4 py-3 rounded-xl">
                    <p className="text-sm text-surface-500 font-medium mb-1">Phone Number</p>
                    <p className="font-bold text-surface-900">{patientProfile.emergencyPhone || patientProfile.emergency_phone}</p>
                  </div>
                 </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-indigo-50 to-blue-50 p-7 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-indigo-100 relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                   <ShieldCheck className="w-24 h-24 text-indigo-600" />
                 </div>
                 <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-indigo-100 rounded-xl">
                      <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="font-semibold text-lg text-indigo-900">Trust Badge</h2>
                  </div>
                  <p className="text-sm text-indigo-800 leading-relaxed">
                    Your institutional profile is active. You can now use the <b>Pre-Underwriting Engine</b> to evaluate clinical risks and generate reports.
                  </p>
                  <button 
                    onClick={() => navigate("/lender-dashboard")}
                    className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                  >
                    Go to Assessment Tool
                  </button>
                 </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
