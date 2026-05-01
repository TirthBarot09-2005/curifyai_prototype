import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Loader2, User, Activity, MapPin, Phone, ArrowRight, CheckCircle2, Briefcase, HeartPulse } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CITIES } from "../lib/constants";

export default function CompleteProfilePage() {
  const { user, isLoaded } = useUser();
  const { hasProfile, profileLoading, refreshProfile, patientProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get("edit") === "true";
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(isEdit ? 1 : (user?.unsafeMetadata?.role ? 1 : 0));
  const [role, setRole] = useState(user?.unsafeMetadata?.role || null);
  const [formData, setFormData] = useState({
    fullName: "", age: "", gender: "",
    bloodGroup: "", conditions: "", allergies: "",
    city: "", pincode: "",
    emergencyName: "", emergencyPhone: "", emergencyRelation: ""
  });

  useEffect(() => {
    if (isLoaded && user) {
      if (isEdit && patientProfile) {
        setFormData({
          fullName: patientProfile.fullName || patientProfile.full_name || "",
          age: patientProfile.age || "",
          gender: patientProfile.gender || "",
          bloodGroup: patientProfile.bloodGroup || patientProfile.blood_group || "",
          conditions: patientProfile.conditions || patientProfile.existing_conditions || "",
          allergies: patientProfile.allergies || "",
          city: patientProfile.city || "",
          pincode: patientProfile.pincode || patientProfile.area_pincode || "",
          emergencyName: patientProfile.emergencyName || patientProfile.emergency_name || "",
          emergencyPhone: patientProfile.emergencyPhone || patientProfile.emergency_phone || "",
          emergencyRelation: patientProfile.emergencyRelation || patientProfile.emergency_relation || ""
        });
      } else {
        setFormData(prev => ({
          ...prev,
          fullName: prev.fullName || user.fullName || ""
        }));
      }
    }
    
    if (isLoaded && user?.unsafeMetadata?.role && !role) {
      setRole(user.unsafeMetadata.role);
    }
  }, [isLoaded, user, isEdit, patientProfile, role]);

  useEffect(() => {
    if (!profileLoading && !isEdit) {
      if (hasProfile) {
        if (patientProfile?.role === "lender") {
          if (patientProfile?.lenderProfileCompleted) {
            navigate("/lender-dashboard", { replace: true });
          } else {
            navigate("/lender-details", { replace: true });
          }
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else if (user?.unsafeMetadata?.role === "lender") {
        // Logged in as lender but no DB profile yet
        navigate("/lender-details", { replace: true });
      }
    }
  }, [hasProfile, profileLoading, navigate, patientProfile, user?.unsafeMetadata?.role, isEdit]);

  if (!isLoaded || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          <Brain className="w-6 h-6 text-brand-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="mt-6 text-surface-400 font-medium animate-pulse">Checking profile status...</p>
      </div>
    );
  }

  const handleRoleSelect = async (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === "lender") {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        localStorage.setItem(`profile_${user.id}`, JSON.stringify({ role: "lender", clerkId: user.id, fullName: user.fullName, lenderProfileCompleted: false }));
        await refreshProfile();
        navigate("/lender-details", { replace: true });
      } catch(err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setStep(1);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        clerk_user_id: user.id,
        full_name: formData.fullName,
        email: user.primaryEmailAddress?.emailAddress || "",
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        blood_group: formData.bloodGroup,
        existing_conditions: formData.conditions,
        allergies: formData.allergies,
        city: formData.city,
        area_pincode: formData.pincode,
        emergency_name: formData.emergencyName,
        emergency_phone: formData.emergencyPhone,
        emergency_relation: formData.emergencyRelation,
        role: "patient"
      };

      try {
        let res;
        if (isEdit) {
          res = await fetch(`/api/patient-profile/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } else {
          res = await fetch(`/api/patient-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("Backend save failed:", res.status, errorData);
          throw new Error("Failed to save to backend");
        }
      } catch (apiErr) {
        console.warn("API save failed, profile only saved to local storage", apiErr);
      }

      localStorage.setItem(`profile_${user.id}`, JSON.stringify({ 
        ...formData, 
        role: "patient", 
        clerkId: user.id,
        full_name: formData.fullName,
        blood_group: formData.bloodGroup,
        existing_conditions: formData.conditions,
        area_pincode: formData.pincode,
        emergency_name: formData.emergencyName,
        emergency_phone: formData.emergencyPhone,
        emergency_relation: formData.emergencyRelation
      }));
      await refreshProfile();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || profileLoading) return <div className="min-h-[calc(100vh-4rem)] bg-surface-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  
  const { user: authUser } = useAuth();
  const roleFromAuth = authUser?.role;
  
  if (roleFromAuth === "lender") {
    navigate(isEdit ? "/lender-details?edit=true" : "/lender-details", { replace: true });
    return null;
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-white text-surface-900 shadow-sm";
  const labelClass = "block text-sm font-medium text-surface-700 mb-1.5";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-50 py-12 px-4 sm:px-6 flex justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-surface-100 p-8 sm:p-10"
      >
        {step > 0 && (
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-display font-bold text-surface-900">{isEdit ? "Edit Profile" : "Complete Your Profile"}</h1>
            <p className="text-surface-500 mt-2">{isEdit ? "Update your personal details" : `Step ${step} of 2 • Help us personalize your care`}</p>
            <div className="w-full max-w-xs mx-auto bg-surface-100 h-2 rounded-full mt-6 overflow-hidden">
              <motion.div 
                initial={{ width: "50%" }}
                animate={{ width: step === 1 ? "50%" : "100%" }}
                className="bg-brand-600 h-full rounded-full"
              />
            </div>
          </div>
        )}

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); } : handleSubmit}>
          {step === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-display font-bold text-surface-900 mb-3">How are you using Curify AI?</h2>
                <p className="text-surface-500">Select your role to customize your experience.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("patient")}
                  className="flex flex-col items-center p-8 border-2 border-surface-200 rounded-2xl hover:border-brand-500 hover:bg-brand-50 transition-all group"
                >
                  <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <HeartPulse className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-surface-900">I'm a Patient</h3>
                  <p className="text-sm text-surface-500 text-center mt-2">Find hospitals, check costs, and manage healthcare.</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect("lender")}
                  className="flex flex-col items-center p-8 border-2 border-surface-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-surface-900">I'm a Lender</h3>
                  <p className="text-sm text-surface-500 text-center mt-2">Access pre-underwriting tools and assess risk.</p>
                </button>
              </div>
              {loading && <div className="flex justify-center mt-6"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
              {/* SECTION 1 */}
              <section>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-100">
                  <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                    <User className="w-5 h-5" />
                  </div>
                  <h2 className="font-semibold text-xl text-surface-900">Personal Info</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Full Name *</label>
                    <input required name="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className={labelClass}>Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className={inputClass} placeholder="e.g. 34" min="0" max="150" />
                  </div>
                  <div>
                    <label className={labelClass}>Gender *</label>
                    <select required name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* SECTION 2 */}
              <section>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-100">
                  <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h2 className="font-semibold text-xl text-surface-900">Health Info</h2>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className={labelClass}>Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className={inputClass}>
                      <option value="">Select Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Existing Conditions</label>
                    <textarea name="conditions" value={formData.conditions} onChange={handleChange} rows={2} className={inputClass} placeholder="e.g. Diabetes, Hypertension (Leave blank if none)" />
                  </div>
                  <div>
                    <label className={labelClass}>Allergies</label>
                    <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows={2} className={inputClass} placeholder="e.g. Penicillin, Peanuts (Leave blank if none)" />
                  </div>
                </div>
              </section>
              
              <div className="pt-6 flex justify-end">
                <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm text-lg">
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
              {/* SECTION 3 */}
              <section>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-100">
                  <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h2 className="font-semibold text-xl text-surface-900">Location</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>City *</label>
                    <select 
                      required 
                      name="city" 
                      value={formData.city} 
                      onChange={handleChange} 
                      className={inputClass}
                    >
                      <option value="" disabled>Select your city</option>
                      {CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Area / Pincode</label>
                    <input name="pincode" value={formData.pincode} onChange={handleChange} className={inputClass} placeholder="e.g. 400001" />
                  </div>
                </div>
              </section>

              {/* SECTION 4 */}
              <section>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-100">
                  <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h2 className="font-semibold text-xl text-surface-900">Emergency Contact</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Contact Name *</label>
                    <input required name="emergencyName" value={formData.emergencyName} onChange={handleChange} className={inputClass} placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number *</label>
                    <input required type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} className={inputClass} placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div>
                    <label className={labelClass}>Relation *</label>
                    <input required name="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange} className={inputClass} placeholder="e.g. Spouse, Parent" />
                  </div>
                </div>
              </section>

              <div className="pt-6 flex justify-between items-center">
                <button type="button" onClick={() => isEdit ? navigate("/dashboard") : setStep(1)} className="text-surface-500 hover:text-surface-800 font-medium px-4 py-2 transition-colors">
                  {isEdit ? "Cancel" : "Back"}
                </button>
                <button type="submit" disabled={loading} className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70 text-lg">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  {loading ? "Saving Profile..." : isEdit ? "Save Changes" : "Complete Profile"}
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
