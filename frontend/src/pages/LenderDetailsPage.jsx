import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Loader2, Briefcase, DollarSign, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LenderDetailsPage() {
  const { user, isLoaded } = useUser();
  const { hasProfile, profileLoading, refreshProfile, patientProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get("edit") === "true";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    lenderName: "",
    phoneNumber: "",
    minLoan: "",
    maxLoan: "",
    minRate: "",
    maxRate: "",
    approvalTime: "",
    supportedLoanTypes: [],
    customerType: ""
  });

  useEffect(() => {
    if (!profileLoading && hasProfile && !isEdit) {
      if (patientProfile?.role === "patient") {
        navigate("/dashboard", { replace: true });
      } else if (patientProfile?.role === "lender" && patientProfile?.lenderProfileCompleted) {
        navigate("/lender-dashboard", { replace: true });
      }
    }
  }, [hasProfile, profileLoading, navigate, patientProfile, isEdit]);

  useEffect(() => {
    if (isEdit && patientProfile && patientProfile.role === "lender") {
      setFormData({
        lenderName: patientProfile.lenderName || patientProfile.fullName || patientProfile.full_name || "",
        phoneNumber: patientProfile.phoneNumber || patientProfile.phone_number || patientProfile.emergencyPhone || patientProfile.emergency_phone || "",
        minLoan: patientProfile.minLoan ?? "",
        maxLoan: patientProfile.maxLoan ?? "",
        minRate: patientProfile.minRate ?? "",
        maxRate: patientProfile.maxRate ?? "",
        approvalTime: patientProfile.approvalTime || "",
        supportedLoanTypes: patientProfile.supportedLoanTypes || [],
        customerType: patientProfile.customerType || ""
      });
    }
  }, [isEdit, patientProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        supportedLoanTypes: checked
          ? [...prev.supportedLoanTypes, value]
          : prev.supportedLoanTypes.filter((t) => t !== value)
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isFormValid = () => {
    return (
      formData.lenderName &&
      formData.phoneNumber &&
      formData.minLoan &&
      formData.maxLoan &&
      formData.minRate &&
      formData.maxRate &&
      formData.approvalTime &&
      formData.supportedLoanTypes.length > 0 &&
      formData.customerType
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    setLoading(true);
    try {
      const payload = {
        clerk_user_id: user.id,
        full_name: formData.lenderName || user.fullName || "Lender",
        email: user.primaryEmailAddress?.emailAddress || "",
        role: "lender",
        city: "Corporate",
        lender_profile_completed: true,
        min_loan: parseFloat(formData.minLoan),
        max_loan: parseFloat(formData.maxLoan),
        min_rate: parseFloat(formData.minRate),
        max_rate: parseFloat(formData.maxRate),
        approval_time: formData.approvalTime,
        supported_loan_types: formData.supportedLoanTypes.join(","),
        customer_type: formData.customerType,
        emergency_phone: formData.phoneNumber // Mapping phoneNumber to emergency_phone for consistency
      };

      let res;
      if (isEdit) {
        res = await fetch(`/api/patient-profile/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/patient-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      // 2. Sync to local storage for instant consistency
      const updatedProfile = {
        clerkId: user.id,
        role: "lender",
        lenderProfileCompleted: true,
        ...formData
      };
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));

      // 3. Save to Clerk metadata for instant routing
      if (!isEdit) {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            role: "lender",
            city: "Corporate"
          }
        });
      }
      
      // 4. Update local state
      await refreshProfile();
      navigate(isEdit ? "/dashboard" : "/lender-dashboard", { replace: true });
    } catch (err) {
      console.error("Lender profile submission error:", err);
      // Fallback for demo if backend is down
      const updatedProfile = {
        clerkId: user.id,
        role: "lender",
        lenderProfileCompleted: true,
        ...formData
      };
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
      await refreshProfile();
      navigate("/lender-dashboard", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || profileLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-surface-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-surface-900 shadow-sm";
  const labelClass = "block text-sm font-medium text-surface-700 mb-1.5";

  const loanTypesOptions = ["Emergency", "Surgery", "General Treatment"];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-50 py-12 px-4 sm:px-6 flex justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-surface-100 p-8 sm:p-10"
      >
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold text-surface-900">Lender Details</h1>
          <p className="text-surface-500 mt-2">Set up your underwriting capabilities</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* SECTION 1: Basic Info */}
          <section>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-100">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Briefcase className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-xl text-surface-900">Basic Info</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className={labelClass}>Lender Name *</label>
                <input required name="lenderName" value={formData.lenderName} onChange={handleChange} className={inputClass} placeholder="e.g. Health Finance Corp" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Phone Number *</label>
                <input required type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={inputClass} placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>
          </section>

          {/* SECTION 2: Loan Capability */}
          <section>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-100">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-xl text-surface-900">Loan Capability</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Minimum Loan Amount (₹) *</label>
                <input required type="number" name="minLoan" value={formData.minLoan} onChange={handleChange} className={inputClass} placeholder="e.g. 10000" min="0" />
              </div>
              <div>
                <label className={labelClass}>Maximum Loan Amount (₹) *</label>
                <input required type="number" name="maxLoan" value={formData.maxLoan} onChange={handleChange} className={inputClass} placeholder="e.g. 500000" min="0" />
              </div>
              <div>
                <label className={labelClass}>Min Interest Rate (%) *</label>
                <input required type="number" step="0.1" name="minRate" value={formData.minRate} onChange={handleChange} className={inputClass} placeholder="e.g. 8.5" min="0" />
              </div>
              <div>
                <label className={labelClass}>Max Interest Rate (%) *</label>
                <input required type="number" step="0.1" name="maxRate" value={formData.maxRate} onChange={handleChange} className={inputClass} placeholder="e.g. 18.0" min="0" />
              </div>
            </div>
          </section>

          {/* SECTION 3: Processing & Underwriting */}
          <section>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-100">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-xl text-surface-900">Processing & Underwriting</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className={labelClass}>Approval Time *</label>
                <select required name="approvalTime" value={formData.approvalTime} onChange={handleChange} className={inputClass}>
                  <option value="">Select Approval Time</option>
                  <option value="Instant">Instant</option>
                  <option value="Few Hours">Few Hours</option>
                  <option value="1-2 Days">1-2 Days</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Supported Loan Types *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {loanTypesOptions.map((type) => (
                    <label key={type} className="flex items-center gap-2 p-3 border border-surface-200 rounded-xl cursor-pointer hover:bg-surface-50 transition-colors">
                      <input
                        type="checkbox"
                        name="supportedLoanTypes"
                        value={type}
                        checked={formData.supportedLoanTypes.includes(type)}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded border-surface-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-surface-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Supported Customer Type *</label>
                <select required name="customerType" value={formData.customerType} onChange={handleChange} className={inputClass}>
                  <option value="">Select Customer Type</option>
                  <option value="Salaried">Salaried</option>
                  <option value="Self-employed">Self-employed</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>
          </section>

          <div className="pt-6 flex justify-end">
            <button 
              type="submit" 
              disabled={loading || !isFormValid()} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {loading ? "Saving..." : "Complete Setup"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
