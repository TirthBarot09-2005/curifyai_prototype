import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerkAuth();
  const [patientProfile, setPatientProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileChecked, setProfileChecked] = useState(false);

  // Check if patient profile exists in backend or local storage mock
  const checkPatientProfile = useCallback(async (clerkId) => {
    try {
      // 1. Try real API with email fallback
      const email = clerkUser?.primaryEmailAddress?.emailAddress;
      const url = `/api/patient-profile/${clerkId}${email ? `?email=${encodeURIComponent(email)}` : ""}`;
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          // Normalize snake_case from DB to camelCase for frontend
          const profile = data.profile;
          const normalized = {
            ...profile,
            fullName: profile.full_name || profile.fullName,
            clerkId: profile.clerk_user_id || profile.clerkId,
            role: profile.role || "patient",
            bloodGroup: profile.blood_group || profile.bloodGroup,
            conditions: profile.existing_conditions || profile.conditions,
            pincode: profile.area_pincode || profile.pincode,
            emergencyName: profile.emergency_name || profile.emergencyName,
            emergencyPhone: profile.emergency_phone || profile.emergencyPhone,
            emergencyRelation: profile.emergency_relation || profile.emergencyRelation,
            lenderProfileCompleted: profile.lender_profile_completed === 1 || profile.lenderProfileCompleted === 1 || profile.lender_profile_completed === true || profile.lenderProfileCompleted === true,
            minLoan: profile.min_loan ?? profile.minLoan,
            maxLoan: profile.max_loan ?? profile.maxLoan,
            minRate: profile.min_rate ?? profile.minRate,
            maxRate: profile.max_rate ?? profile.maxRate,
            approvalTime: profile.approval_time ?? profile.approvalTime,
            supportedLoanTypes: profile.supported_loan_types 
              ? profile.supported_loan_types.split(",") 
              : (Array.isArray(profile.supportedLoanTypes) ? profile.supportedLoanTypes : []),
            customerType: profile.customer_type ?? profile.customerType,
            lenderName: profile.lenderName || (profile.role === "lender" ? profile.full_name : ""),
            phoneNumber: profile.phone_number || profile.phoneNumber || profile.emergency_phone
          };
          setPatientProfile(normalized);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend API check failed, falling back to mock localStorage:", err);
    }
    
    // 2. Fallback to localStorage mock
    const mockProfile = localStorage.getItem(`profile_${clerkId}`);
    if (mockProfile) {
      setPatientProfile(JSON.parse(mockProfile));
    } else {
      setPatientProfile(null);
    }
  }, []);

  const refreshAndSet = useCallback(async (clerkId) => {
    setProfileLoading(true);
    await checkPatientProfile(clerkId);
    setProfileLoading(false);
    setProfileChecked(true);
  }, [checkPatientProfile]);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      refreshAndSet(clerkUser.id);
    } else if (isLoaded && !clerkUser) {
      setPatientProfile(null);
      setProfileLoading(false);
      setProfileChecked(true);
    }
  }, [isLoaded, clerkUser?.id, refreshAndSet]);

  const user = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress,
    name: patientProfile?.fullName || clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress?.split("@")[0] || "User",
    imageUrl: clerkUser.imageUrl,
    city: patientProfile?.city || clerkUser.unsafeMetadata?.city || "",
    role: patientProfile 
      ? (patientProfile.role === "lender" || patientProfile.lenderProfileCompleted ? "lender" : "patient")
      : (clerkUser.unsafeMetadata?.role || "patient")
  } : null;

  const hasProfile = !!patientProfile;

  const login = () => {}; // Handled by Clerk
  const logout = () => signOut();

  const refreshProfile = useCallback(async () => {
    if (clerkUser?.id) {
      await refreshAndSet(clerkUser.id);
    }
  }, [clerkUser?.id, refreshAndSet]);

  return (
    <AuthContext.Provider value={{ 
      user, login, logout, isLoaded, 
      patientProfile, hasProfile, profileLoading, profileChecked,
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
